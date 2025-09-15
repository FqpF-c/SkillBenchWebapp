# SkillBench Leaderboard Implementation Documentation

## Overview
The SkillBench application features a comprehensive leaderboard system that fetches user performance data from Firebase, calculates rankings based on XP earned from quiz sessions, and displays them in an interactive interface. This document details the complete implementation flow from data fetching to display.

## Architecture Overview

```
┌─────────────────┐    ┌──────────────────────┐    ┌─────────────────────┐
│   UI Layer      │    │   Provider Layer     │    │  Repository Layer   │
├─────────────────┤    ├──────────────────────┤    ├─────────────────────┤
│ • LeaderboardScreen │ • NewLeaderboardProvider │    │ • HybridRepository  │
│ • TopPerformersCard │ • State Management       │    │ • FirebaseRepository│
│ • UserListItem      │ • Pagination Logic      │    │ • Data Fetching     │
│ • Filter Controls   │ • Filter Handling       │    │ • XP Calculation    │
└─────────────────┘    └──────────────────────┘    └─────────────────────┘
                                   │
                       ┌──────────────────────┐
                       │   Data Sources       │
                       ├──────────────────────┤
                       │ • Firebase Realtime  │
                       │   Database (XP Data) │
                       │ • Cloud Firestore    │
                       │   (User Profiles)    │
                       └──────────────────────┘
```

## Data Flow

### 1. Data Sources

#### Firebase Realtime Database (`skillbench/quiz_sessions`)
- **Structure**: `/skillbench/quiz_sessions/{userId}/{sessionId}`
- **Session Data**:
  ```json
  {
    "totalXP": 150,
    "timestamp": 1640995200000,
    "questionsAnswered": 10,
    "correctAnswers": 8
  }
  ```

#### Cloud Firestore (`users` collection)
- **Structure**: `/users/{userId}`
- **Profile Data**:
  ```json
  {
    "username": "John Doe",
    "email": "john@example.com",
    "photoURL": "https://...",
    "college": "MIT",
    "department": "Computer Science",
    "batch": "2024",
    "lastSeen": "2024-01-01T00:00:00Z"
  }
  ```

### 2. XP Calculation Process

The leaderboard system calculates XP based on timeframe filters:

#### File: `firebase_leaderboard_repository.dart:152-210`

```dart
Future<Map<String, int>> _calculateAllUsersXP(Timeframe timeframe) async {
  // Fetch all quiz sessions from Firebase Realtime Database
  final snapshot = await _database.ref().child('skillbench/quiz_sessions').get();
  
  final Map<String, int> userXPMap = {};
  final timeFilter = _getTimeFilter(timeframe);
  
  // Iterate through all users and their sessions
  allSessions.forEach((userId, sessions) {
    int totalXP = 0;
    sessions.forEach((sessionId, sessionData) {
      if (sessionData['totalXP'] != null) {
        final sessionDate = DateTime.fromMillisecondsSinceEpoch(sessionData['timestamp']);
        
        // Apply timeframe filter
        if (timeFilter(sessionDate)) {
          totalXP += sessionData['totalXP'];
        }
      }
    });
    
    if (totalXP > 0) {
      userXPMap[userId] = totalXP;
    }
  });
  
  return userXPMap;
}
```

#### Timeframe Filters

**File**: `firebase_leaderboard_repository.dart:340-360`

| Timeframe | Logic |
|-----------|-------|
| **Daily** | Sessions from start of current day |
| **Weekly** | Sessions from start of current week (Monday) |
| **Monthly** | Sessions from start of current month |
| **All Time** | All sessions regardless of date |

### 3. Repository Pattern Implementation

#### Hybrid Repository Strategy

**File**: `hybrid_leaderboard_repository.dart`

The system uses a hybrid approach that tries Firebase first and falls back to mock data:

```dart
Future<LeaderboardSnapshot> fetchLeaderboardData() async {
  try {
    // Try Firebase first
    final firebaseSnapshot = await _firebaseRepo.fetchLeaderboardData();
    
    // Check if we have sufficient data
    if (hasEnoughData(firebaseSnapshot)) {
      return firebaseSnapshot;
    }
    
    // Fall back to mock data
    return await _mockRepo.fetchLeaderboardData();
  } catch (e) {
    // Fall back to mock data on any error
    return await _mockRepo.fetchLeaderboardData();
  }
}
```

#### Caching Strategy

**File**: `leaderboard_repository.dart:69-124`

- **Cache Duration**: 5 minutes
- **Cache Key**: Combination of timeframe, group, category, page, and pageSize
- **Cache Invalidation**: Automatic expiry + manual clear on refresh

### 4. Data Processing Pipeline

#### Step 1: Fetch and Merge Data

**File**: `firebase_leaderboard_repository.dart:15-149`

1. **Calculate XP** for all users based on timeframe
2. **Fetch user profiles** from Firestore in batches (max 10 per batch)
3. **Create leaderboard users** by merging XP data with profiles
4. **Apply filters** (group/category if specified)
5. **Sort by XP** and assign ranks
6. **Extract top 3** performers
7. **Find current user** and handle special cases
8. **Apply pagination** for remaining users

#### Step 2: Data Models

**File**: `leaderboard_models.dart`

```dart
// Core user model
class LeaderboardUser {
  final String id;
  final String name;
  final String? avatarUrl;
  final String? organization;
  final int points;           // XP earned
  final int rank;            // Position in leaderboard
  final bool isYou;          // Current user flag
  final bool isOnline;       // Online status (last seen < 15 min)
  final DateTime? lastSeen;
  final Map<String, dynamic> metadata;
}

// Complete snapshot of leaderboard state
class LeaderboardSnapshot {
  final LeaderboardStats stats;
  final List<LeaderboardUser> topThree;    // Ranks 1-3
  final LeaderboardUser? currentUser;      // Current user if not in top 3
  final List<LeaderboardUser> users;       // Paginated remaining users
  final int totalPages;
  final int currentPage;
  final bool hasMorePages;
  final DateTime timestamp;
}
```

### 5. State Management

#### NewLeaderboardProvider

**File**: `new_leaderboard_provider.dart`

The provider manages all leaderboard state and operations:

**Key Responsibilities**:
- **Data Loading**: Initial fetch, refresh, pagination
- **Filter Management**: Timeframe, group, category filters
- **State Tracking**: Loading states, errors, pagination state
- **User Interaction**: Pull-to-refresh, load more, filter changes

**State Properties**:
```dart
class NewLeaderboardProvider {
  LeaderboardSnapshot _snapshot;        // Current data
  LeaderboardFilters _filters;          // Active filters
  bool _isLoading;                      // Loading state
  bool _isLoadingMore;                  // Pagination loading
  bool _isRefreshing;                   // Pull-to-refresh state
  String? _error;                       // Error message
  int _currentPage;                     // Current page
  List<LeaderboardUser> _allLoadedUsers; // All loaded users for pagination
}
```

**Key Methods**:
- `refresh()`: Pull-to-refresh functionality
- `loadMoreUsers()`: Infinite scroll pagination
- `setTimeframe()/setGroup()/setCategory()`: Filter changes
- `getUserByRank()`: Retrieve user by rank position

### 6. UI Implementation

#### Main Screen Structure

**File**: `new_leaderboard_screen.dart`

```
┌─────────────────────────────────┐
│         Header                  │
├─────────────────────────────────┤
│     Welcome Hub Card            │ ← Stats overview
├─────────────────────────────────┤
│     Filter Controls             │ ← Timeframe/Group/Category
├─────────────────────────────────┤
│   Top Performers Card           │ ← Top 3 users with bars
├─────────────────────────────────┤
│     Your Rank Card              │ ← Current user (if not top 3)
├─────────────────────────────────┤
│     Other Rankings              │ ← Paginated user list
│         User List Item          │
│         User List Item          │
│         ...                     │
│     Load More Button            │
└─────────────────────────────────┘
```

#### Top Performers Visualization

**File**: `top_performers_card.dart`

The top 3 users are displayed with animated bars:

**Bar Heights**: 
- 1st Place: 100% height (120h)
- 2nd Place: 85% height (102h)  
- 3rd Place: 65% height (78h)

**Animation**:
- Staggered entrance animations
- Bar height animations with elastic curve
- Avatar positioning on top of bars

**Key Features**:
- Timeframe dropdown selection
- Empty state handling
- Loading skeleton animation
- Responsive avatar sizing

#### Pagination Implementation

**File**: `new_leaderboard_screen.dart:78-87`

```dart
void _onScroll() {
  final provider = Provider.of<NewLeaderboardProvider>(context, listen: false);
  
  // Trigger load more when near bottom
  if (scrollController.position.pixels >= 
      scrollController.position.maxScrollExtent - 200) {
    provider.loadMoreUsers();
  }
}
```

### 7. Filter System

#### Available Filters

1. **Timeframe**: Daily, Weekly, Monthly, All Time
2. **Group**: Organizations/Colleges (dynamic from user profiles)
3. **Category**: Departments/Courses (dynamic from user profiles)

#### Filter Options Generation

**File**: `firebase_leaderboard_repository.dart:363-396`

```dart
Future<Map<String, List<String>>> getFilterOptions() async {
  final usersSnapshot = await _firestore.collection('users').get();
  
  final Set<String> organizations = {'All'};
  final Set<String> departments = {'All'};
  
  for (final doc in usersSnapshot.docs) {
    final data = doc.data();
    
    // Extract organization names
    final org = data['college'] ?? data['organization'] ?? data['university'];
    if (org != null) organizations.add(org.toString().trim());
    
    // Extract department names
    final dept = data['department'] ?? data['course'] ?? data['major'];
    if (dept != null) departments.add(dept.toString().trim());
  }
  
  return {
    'groups': organizations.toList()..sort(),
    'categories': departments.toList()..sort(),
  };
}
```

### 8. Performance Optimizations

#### Caching Strategy
- **Repository Level**: 5-minute cache for API responses
- **Provider Level**: State preservation during filter changes
- **UI Level**: Skeleton loading states and optimistic updates

#### Batch Operations
- **Profile Fetching**: Max 10 Firestore documents per batch
- **Pagination**: 10 users per page (configurable)
- **Animation Staggering**: Smooth entrance animations

#### Error Handling
- **Firebase Errors**: Automatic fallback to mock data
- **Network Issues**: Retry mechanism with user feedback
- **Empty States**: Graceful handling with action prompts

### 9. Key Files Summary

| File | Purpose | Key Functions |
|------|---------|---------------|
| `firebase_leaderboard_repository.dart` | Firebase data fetching and XP calculation | `fetchLeaderboardData()`, `_calculateAllUsersXP()` |
| `hybrid_leaderboard_repository.dart` | Smart fallback between Firebase and mock | `fetchLeaderboardData()` with error handling |
| `new_leaderboard_provider.dart` | State management and business logic | `refresh()`, `loadMoreUsers()`, filter methods |
| `new_leaderboard_screen.dart` | Main UI layout and user interactions | Screen structure, scroll handling, animations |
| `top_performers_card.dart` | Top 3 users visualization | Animated bars, avatar positioning |
| `leaderboard_models.dart` | Data models and structures | `LeaderboardUser`, `LeaderboardSnapshot` |

### 10. Future Enhancements

1. **Real-time Updates**: WebSocket integration for live leaderboard updates
2. **Advanced Filters**: Subject-specific rankings, achievement categories
3. **Social Features**: Friend comparisons, team leaderboards
4. **Gamification**: Badges, streaks, seasonal competitions
5. **Analytics**: Detailed performance insights and trends

### 11. Testing Considerations

1. **Mock Data**: Comprehensive mock implementation for development
2. **Error Scenarios**: Firebase connectivity issues, malformed data
3. **Performance**: Large dataset handling, scroll performance
4. **State Management**: Filter combinations, pagination edge cases
5. **UI Responsiveness**: Different screen sizes, orientation changes

This implementation provides a robust, scalable, and user-friendly leaderboard system that effectively combines Firebase's real-time capabilities with a smooth Flutter UI experience.