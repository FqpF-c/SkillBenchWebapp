import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile,
  signOut
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, set } from 'firebase/database';
import { auth, db, realtimeDb, DB_PATHS } from '../config/firebase';
import OTPService from './OTPService';

class AuthService {
  constructor() {
    this.otpService = OTPService;
  }

  /**
   * Send OTP to phone number
   * @param {string} phoneNumber - Phone number in format +911234567890
   */
  async sendOTP(phoneNumber) {
    try {
      console.log('[AUTH] Sending OTP to:', phoneNumber);
      return await this.otpService.sendOTP(phoneNumber);
    } catch (error) {
      console.error('[AUTH] Error sending OTP:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Verify OTP and handle user authentication flow
   * @param {string} phoneNumber - Phone number in format +911234567890
   * @param {string} otp - OTP code entered by user
   */
  async verifyOTP(phoneNumber, otp) {
    try {
      console.log('[AUTH] Verifying OTP for:', phoneNumber);
      
      // First verify OTP
      const otpResult = await this.otpService.verifyOTP(otp);
      if (!otpResult.success) {
        return otpResult;
      }

      console.log('[AUTH] OTP verified successfully');

      // Check for existing UID mapping
      const existingUID = await this.getUidByPhoneNumber(phoneNumber);
      
      if (existingUID) {
        console.log('[AUTH] Found existing user with UID:', existingUID);
        // Existing user - sign in
        await this.signInWithExistingUID(existingUID, phoneNumber);
        return { userExists: true, uid: existingUID };
      } else {
        console.log('[AUTH] New user - no existing UID mapping found');
        // New user
        return { userExists: false, uid: null };
      }
    } catch (error) {
      console.error('[AUTH] Error verifying OTP:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get UID by phone number from Firestore mapping
   * @param {string} phoneNumber - Phone number in format +911234567890
   */
  async getUidByPhoneNumber(phoneNumber) {
    try {
      const docRef = doc(db, DB_PATHS.PHONE_TO_UID, phoneNumber);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log('[AUTH] Found phone-to-UID mapping:', data.uid);
        return data.uid;
      }
      
      return null;
    } catch (error) {
      console.error('[AUTH] Error getting UID by phone number:', error);
      return null;
    }
  }

  /**
   * Sign in with existing UID using email/password method
   * @param {string} uid - Firebase UID
   * @param {string} phoneNumber - Phone number in format +911234567890
   */
  async signInWithExistingUID(uid, phoneNumber) {
    try {
      const cleanPhone = phoneNumber.replace('+91', '');
      const email = `${cleanPhone}@skillbench.temp`;
      const password = `temp_${cleanPhone}`;
      
      console.log('[AUTH] Signing in with email/password for existing user');
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Verify UID matches
      if (userCredential.user.uid !== uid) {
        throw new Error('UID mismatch during authentication');
      }
      
      console.log('[AUTH] Successfully signed in existing user');
      return userCredential.user;
    } catch (error) {
      console.error('[AUTH] Error signing in with existing UID:', error);
      throw error;
    }
  }

  /**
   * Register new user with phone-based authentication
   * @param {Object} userData - User registration data
   */
  async registerUser(userData) {
    try {
      const { phoneNumber } = userData;
      const cleanPhone = phoneNumber.replace('+91', '');
      const email = `${cleanPhone}@skillbench.temp`;
      const password = `temp_${cleanPhone}`;
      
      console.log('[AUTH] Creating Firebase Auth account for new user');
      
      // Create Firebase Auth account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      console.log('[AUTH] Firebase Auth account created with UID:', user.uid);
      
      // Update display name
      await updateProfile(user, { displayName: phoneNumber });
      
      // Create phone-to-UID mapping
      await this.createPhoneToUidMapping(phoneNumber, user.uid);
      
      // Create user document in Firestore
      await this.createUserDocument(user.uid, userData);
      
      // Initialize user stats in Realtime Database
      await this.initializeUserStats(user.uid, userData);
      
      console.log('[AUTH] User registration completed successfully');
      return user;
    } catch (error) {
      console.error('[AUTH] Error registering user:', error);
      throw error;
    }
  }

  /**
   * Create phone-to-UID mapping in Firestore
   * @param {string} phoneNumber - Phone number in format +911234567890
   * @param {string} uid - Firebase UID
   */
  async createPhoneToUidMapping(phoneNumber, uid) {
    try {
      const mappingData = {
        uid,
        phoneNumber,
        createdAt: new Date(),
        lastUpdated: new Date()
      };
      
      await setDoc(doc(db, DB_PATHS.PHONE_TO_UID, phoneNumber), mappingData);
      console.log('[AUTH] Phone-to-UID mapping created successfully');
    } catch (error) {
      console.error('[AUTH] Error creating phone-to-UID mapping:', error);
      throw error;
    }
  }

  /**
   * Create user document in Firestore
   * @param {string} uid - Firebase UID
   * @param {Object} userData - User data
   */
  async createUserDocument(uid, userData) {
    try {
      const userDoc = {
        ...userData,
        currentFirebaseUid: uid,
        createdAt: new Date(),
        lastLogin: new Date()
      };
      
      // Create main user document
      await setDoc(doc(db, DB_PATHS.USERS, uid), userDoc);
      
      // TODO: Create college-specific user reference if needed
      // This would be implemented based on your specific college structure
      
      console.log('[AUTH] User document created in Firestore');
    } catch (error) {
      console.error('[AUTH] Error creating user document:', error);
      throw error;
    }
  }

  /**
   * Initialize user stats in Realtime Database
   * @param {string} uid - Firebase UID
   * @param {Object} userData - User data
   */
  async initializeUserStats(uid, userData) {
    try {
      const statsData = {
        phoneNumber: userData.phoneNumber,
        streaks: 0,
        coins: 5,
        xp: 20,
        points: 0,
        dailyUsage: 0,
        totalUsage: 0,
        studyHours: 0,
        lastUsageDate: new Date().toISOString().split('T')[0],
        lastUpdated: new Date().toISOString()
      };
      
      await set(ref(realtimeDb, `${DB_PATHS.REALTIME_USERS}/${uid}`), statsData);
      console.log('[AUTH] User stats initialized in Realtime Database');
    } catch (error) {
      console.error('[AUTH] Error initializing user stats:', error);
      throw error;
    }
  }

  /**
   * Get current user
   */
  getCurrentUser() {
    return auth.currentUser;
  }

  /**
   * Sign out user
   */
  async signOut() {
    try {
      console.log('[AUTH] Signing out user');
      await signOut(auth);
      
      // Clear OTP session
      this.otpService.clearSession();
      
      // Clear localStorage
      localStorage.removeItem('userData');
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('phoneNumber');
      
      console.log('[AUTH] User signed out successfully');
      return { success: true };
    } catch (error) {
      console.error('[AUTH] Error signing out:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update last login timestamp
   * @param {string} uid - Firebase UID
   */
  async updateLastLogin(uid) {
    try {
      await setDoc(doc(db, DB_PATHS.USERS, uid), {
        lastLogin: new Date()
      }, { merge: true });
      
      console.log('[AUTH] Last login timestamp updated');
    } catch (error) {
      console.error('[AUTH] Error updating last login:', error);
    }
  }

  /**
   * Format phone number to clean format
   * @param {string} phoneNumber - Raw phone number
   * @returns {string} - Clean phone number without +91
   */
  formatPhoneNumber(phoneNumber) {
    return phoneNumber.replace('+91', '');
  }

  /**
   * Validate phone number format
   * @param {string} phoneNumber - Phone number to validate
   * @returns {boolean} - True if valid
   */
  validatePhoneNumber(phoneNumber) {
    const cleanPhone = this.formatPhoneNumber(phoneNumber);
    return cleanPhone.length === 10 && /^\d+$/.test(cleanPhone);
  }
}

export default new AuthService();