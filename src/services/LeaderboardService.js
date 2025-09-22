import { collection, getDocs, query, orderBy, limit, where, Timestamp } from 'firebase/firestore';
import { ref, get } from 'firebase/database';
import { db, realtimeDb } from '../config/firebase';

class LeaderboardService {
  constructor() {
    this.usersCollection = 'users';
  }

  /**
   * Calculate rankings for users based on XP
   * @param {Array} userList - Array of user objects
   * @returns {Array} - Array of users with ranks assigned
   */
  calculateRankings(userList) {
    return userList
      .sort((a, b) => (b.xp || 0) - (a.xp || 0))
      .map((user, index) => ({
        ...user,
        rank: index + 1
      }));
  }

  /**
   * Get timeframe filter for Firestore query
   * @param {string} timeframe - 'daily', 'weekly', 'monthly', or 'all_time'
   * @returns {Object|null} - Firestore where condition or null for all_time
   */
  getTimeframeFilter(timeframe) {
    const now = new Date();
    let startDate;

    switch (timeframe) {
      case 'daily':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'weekly':
        const dayOfWeek = now.getDay();
        startDate = new Date(now.getTime() - dayOfWeek * 24 * 60 * 60 * 1000);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'all_time':
      default:
        return null;
    }

    return where('lastActiveAt', '>=', Timestamp.fromDate(startDate));
  }

  /**
   * Fetch leaderboard data following the documented implementation
   * Data Flow: Quiz Sessions (Realtime DB) -> XP Calculation -> User Profiles (Firestore) -> Rankings
   * @param {string} timeframe - 'daily', 'weekly', 'monthly', or 'all_time'
   * @param {number} limitCount - Maximum number of users to fetch
   * @returns {Promise<Object>} - Leaderboard data with users and stats
   */
  async fetchLeaderboardData(timeframe = 'all_time', limitCount = 50) {
    try {
      console.log('🔍 [LEADERBOARD] Fetching leaderboard data as per documentation...');

      // Step 1: Calculate XP for all users from Realtime Database
      const userXPMap = await this._calculateAllUsersXP(timeframe);
      console.log(`💯 [LEADERBOARD] Calculated XP for ${Object.keys(userXPMap).length} users`);

      if (Object.keys(userXPMap).length === 0) {
        console.log('📊 [LEADERBOARD] No users with XP found, returning empty leaderboard');
        return {
          users: [],
          topThree: [],
          stats: { total_users: 0, active_users: 0, filtered_users: 0 },
          timeframe,
          lastUpdated: new Date()
        };
      }

      // Step 2: Fetch user profiles from Firestore in batches (max 10 per batch as per doc)
      const userIds = Object.keys(userXPMap);
      const userProfiles = await this._fetchUserProfilesInBatches(userIds);
      console.log(`👥 [LEADERBOARD] Fetched profiles for ${Object.keys(userProfiles).length} users from Firestore`);

      // Step 3: Create leaderboard users by merging XP data with Firestore profiles
      const leaderboardUsers = [];

      for (const [userId, xp] of Object.entries(userXPMap)) {
        const profile = userProfiles[userId] || {};

        leaderboardUsers.push({
          id: userId,
          username: profile.username || profile.name || 'Anonymous',
          xp: xp,
          college: profile.college || profile.organization || profile.university || '',
          department: profile.department || profile.course || profile.major || '',
          batch: profile.batch || '',
          profile_image: profile.photoURL || profile.profileImage || profile.avatar || null,
          lastActiveAt: profile.last_login || profile.lastSeen || profile.lastActiveAt,
          isOnline: this._isUserOnline(profile.last_login || profile.lastSeen),
          email: profile.email || '',
          phone_number: profile.phone_number || '',
          gender: profile.gender || '',
          ...profile
        });
      }

      // Step 4: Sort by XP and assign ranks
      const sortedUsers = leaderboardUsers
        .sort((a, b) => (b.xp || 0) - (a.xp || 0))
        .slice(0, limitCount);

      // Step 5: Calculate rankings
      const rankedUsers = this.calculateRankings(sortedUsers);

      // Step 6: Extract top 3 performers
      const topThree = rankedUsers.slice(0, 3);

      // Step 7: Calculate stats
      const stats = this.getUserStats(rankedUsers, timeframe);

      console.log(`🏆 [LEADERBOARD] Final leaderboard: ${rankedUsers.length} ranked users, Top 3: ${topThree.length}`);

      return {
        users: rankedUsers,
        topThree,
        stats,
        timeframe,
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error('❌ [LEADERBOARD] Error fetching leaderboard data:', error);
      throw new Error('Failed to fetch leaderboard data');
    }
  }

  /**
   * Get XP for all users directly from Realtime Database user records
   * Fetches from: /skillbench/users/{userId} -> xp field
   */
  async _calculateAllUsersXP(timeframe) {
    try {
      console.log('🧮 [LEADERBOARD] Fetching XP from user records in Realtime Database...');

      // Fetch all users from Firebase Realtime Database
      const usersRef = ref(realtimeDb, 'skillbench/users');
      const snapshot = await get(usersRef);

      if (!snapshot.exists()) {
        console.log('📊 [LEADERBOARD] No users found in Realtime Database');
        return {};
      }

      const allUsers = snapshot.val();
      const userXPMap = {};

      // Extract XP directly from each user record
      Object.entries(allUsers).forEach(([userId, userData]) => {
        if (userData && userData.xp != null) {
          const userXP = parseInt(userData.xp) || 0;

          // Only include users with XP > 0
          if (userXP > 0) {
            userXPMap[userId] = userXP;
            console.log(`👤 [LEADERBOARD] User ${userId}: ${userXP} XP`);
          }
        }
      });

      console.log(`✅ [LEADERBOARD] XP fetching complete: ${Object.keys(userXPMap).length} users with XP`);
      return userXPMap;
    } catch (error) {
      console.error('❌ [LEADERBOARD] Error fetching XP from user records:', error);
      return {};
    }
  }

  /**
   * Fetch user profiles from Firestore in batches (max 10 per batch as per doc)
   * Uses the correct Firestore path: skillbench/users/users/{firebase_uid}
   */
  async _fetchUserProfilesInBatches(userIds) {
    const profiles = {};
    const batchSize = 10; // As per documentation

    try {
      for (let i = 0; i < userIds.length; i += batchSize) {
        const batch = userIds.slice(i, i + batchSize);
        console.log(`👥 [LEADERBOARD] Fetching batch ${Math.floor(i/batchSize) + 1}: ${batch.length} users from Firestore`);

        // Fetch profiles for this batch using correct Firestore path
        const batchPromises = batch.map(async (userId) => {
          try {
            const userDoc = await getDocs(query(collection(db, 'skillbench/users/users'), where('__name__', '==', userId)));
            if (!userDoc.empty) {
              const userData = userDoc.docs[0].data();
              console.log(`✅ [LEADERBOARD] Found profile for ${userId}: ${userData.username || userData.name || 'Anonymous'}`);
              return { [userId]: userData };
            }
            console.log(`⚠️ [LEADERBOARD] No Firestore profile found for ${userId}`);
            return { [userId]: null };
          } catch (error) {
            console.warn(`⚠️ [LEADERBOARD] Error fetching profile for ${userId}:`, error);
            return { [userId]: null };
          }
        });

        const batchResults = await Promise.all(batchPromises);
        batchResults.forEach(result => {
          Object.assign(profiles, result);
        });
      }
    } catch (error) {
      console.error('❌ [LEADERBOARD] Error fetching user profiles:', error);
    }

    return profiles;
  }

  /**
   * Get timeframe filter function (as per documentation)
   */
  _getTimeFilter(timeframe) {
    const now = new Date();
    
    switch (timeframe) {
      case 'daily':
        // Sessions from start of current day
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        return (date) => date >= startOfDay;
        
      case 'weekly':
        // Sessions from start of current week (Monday)
        const startOfWeek = new Date(now);
        const dayOfWeek = now.getDay();
        const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Sunday = 0, Monday = 1
        startOfWeek.setDate(now.getDate() - daysToMonday);
        startOfWeek.setHours(0, 0, 0, 0);
        return (date) => date >= startOfWeek;
        
      case 'monthly':
        // Sessions from start of current month
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        return (date) => date >= startOfMonth;
        
      case 'all_time':
      default:
        // All sessions regardless of date
        return () => true;
    }
  }


  /**
   * Check if user is online (last seen < 15 minutes as per doc)
   */
  _isUserOnline(lastSeen) {
    if (!lastSeen) return false;
    
    const lastSeenDate = lastSeen instanceof Date ? lastSeen : new Date(lastSeen);
    const now = new Date();
    const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000);
    
    return lastSeenDate >= fifteenMinutesAgo;
  }

  /**
   * Get user statistics
   * @param {Array} users - Array of users
   * @param {string} timeframe - Current timeframe
   * @returns {Object} - User statistics
   */
  getUserStats(users, timeframe) {
    const totalUsers = users.length;
    const activeUsers = users.filter(user => {
      if (!user.lastActiveAt) return false;
      
      const now = new Date();
      const userLastActive = user.lastActiveAt.toDate ? user.lastActiveAt.toDate() : new Date(user.lastActiveAt);
      const daysDiff = (now - userLastActive) / (1000 * 60 * 60 * 24);
      
      return daysDiff <= 7; // Active within last 7 days
    }).length;
    
    const filteredUsers = users.filter(user => user.xp > 0).length;

    return {
      total_users: totalUsers,
      active_users: activeUsers,
      filtered_users: filteredUsers
    };
  }

  /**
   * Get top three users
   * @param {Array} users - Array of ranked users
   * @returns {Array} - Top 3 users
   */
  getTopThreeUsers(users) {
    return users.slice(0, 3);
  }

  /**
   * Get remaining users (rank 4+)
   * @param {Array} users - Array of ranked users
   * @returns {Array} - Users from rank 4 onwards
   */
  getRemainingUsers(users) {
    return users.slice(3);
  }

  /**
   * Find current user's rank
   * @param {Array} users - Array of ranked users
   * @param {string} currentUserId - Current user's ID
   * @returns {Object|null} - Current user with rank or null
   */
  getCurrentUserRank(users, currentUserId) {
    if (!currentUserId) return null;
    return users.find(user => user.id === currentUserId) || null;
  }

  /**
   * Get mock data for development/testing
   * @returns {Object} - Mock leaderboard data
   */
  getMockData() {
    const mockUsers = [
      { id: '1', username: 'E. THAMIZHARAN', xp: 3534, college: 'KCE', profile_image: null },
      { id: '2', username: 'Sivedharsan C', xp: 764, college: 'Anna University', profile_image: null },
      { id: '3', username: 'Kailash', xp: 572, college: 'VIT Chennai', profile_image: null },
      { id: '4', username: 'John Doe', xp: 450, college: 'Tech University', profile_image: null },
      { id: '5', username: 'Jane Smith', xp: 420, college: 'Engineering College', profile_image: null },
      { id: '6', username: 'Mike Johnson', xp: 380, college: 'Science Institute', profile_image: null },
      { id: '7', username: 'Sarah Wilson', xp: 350, college: 'Tech University', profile_image: null },
      { id: '8', username: 'Alex Chen', xp: 320, college: 'Computer Science Institute', profile_image: null },
      { id: '9', username: 'Maria Garcia', xp: 295, college: 'Technical College', profile_image: null },
      { id: '10', username: 'David Kim', xp: 280, college: 'Engineering University', profile_image: null },
    ];

    const rankedUsers = this.calculateRankings(mockUsers);
    const stats = this.getUserStats(rankedUsers, 'all_time');

    return {
      users: rankedUsers,
      stats,
      timeframe: 'all_time',
      lastUpdated: new Date()
    };
  }
}

export default new LeaderboardService();