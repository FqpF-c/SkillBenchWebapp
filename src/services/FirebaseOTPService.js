// Firebase OTP Service - mirrors Flutter GoogleOTPService implementation
// Handles Firebase authentication integration after OTP verification

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, DB_PATHS } from '../config/firebase';
import OTPService from './OTPService.clean';

/**
 * Firebase OTP Service for handling post-OTP authentication
 * Manages user lookup, Firebase sign-in, and user creation
 */
class FirebaseOTPService {
  constructor() {
    this.otpService = OTPService;
  }

  /**
   * Format phone number to clean format (remove +91)
   * @param {string} phoneNumber - Phone number with +91
   * @returns {string} - Clean 10-digit number
   */
  formatPhoneNumber(phoneNumber) {
    return phoneNumber.replace(/^\+91/, '');
  }

  /**
   * Generate email for Firebase auth from phone number
   * @param {string} phoneNumber - Phone number
   * @returns {string} - Email for Firebase auth
   */
  generateEmailFromPhone(phoneNumber) {
    const cleanPhone = this.formatPhoneNumber(phoneNumber);
    return `${cleanPhone}@skillbench.temp`;
  }

  /**
   * Generate password for Firebase auth from phone number
   * @param {string} phoneNumber - Phone number
   * @returns {string} - Password for Firebase auth
   */
  generatePasswordFromPhone(phoneNumber) {
    const cleanPhone = this.formatPhoneNumber(phoneNumber);
    return `temp_${cleanPhone}`;
  }

  /**
   * Check if user exists in Firestore phone-to-UID mapping
   * @param {string} phoneNumber - Phone number in +91 format
   * @returns {Promise<string|null>} - Firebase UID if exists, null otherwise
   */
  async getUidByPhoneNumber(phoneNumber) {
    try {
      console.log('[FIREBASE_OTP] Checking UID mapping for:', phoneNumber);

      const docRef = doc(db, DB_PATHS.PHONE_TO_UID, phoneNumber);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log('[FIREBASE_OTP] Found UID mapping:', data.uid);
        return data.uid;
      }

      console.log('[FIREBASE_OTP] No UID mapping found for phone number');
      return null;
    } catch (error) {
      console.error('[FIREBASE_OTP] Error checking UID mapping:', error);
      return null;
    }
  }

  /**
   * Create phone-to-UID mapping in Firestore
   * @param {string} phoneNumber - Phone number in +91 format
   * @param {string} uid - Firebase UID
   */
  async createPhoneToUidMapping(phoneNumber, uid) {
    try {
      console.log('[FIREBASE_OTP] Creating UID mapping:', { phoneNumber, uid });

      const mappingData = {
        uid,
        phoneNumber,
        createdAt: new Date(),
        lastUpdated: new Date()
      };

      await setDoc(doc(db, DB_PATHS.PHONE_TO_UID, phoneNumber), mappingData);
      console.log('[FIREBASE_OTP] UID mapping created successfully');
    } catch (error) {
      console.error('[FIREBASE_OTP] Error creating UID mapping:', error);
      throw error;
    }
  }

  /**
   * Sign in existing user with Firebase email/password
   * @param {string} phoneNumber - Phone number in +91 format
   * @param {string} expectedUid - Expected Firebase UID for verification
   * @returns {Promise<Object>} - Firebase user object
   */
  async signInExistingUser(phoneNumber, expectedUid) {
    try {
      const email = this.generateEmailFromPhone(phoneNumber);
      const password = this.generatePasswordFromPhone(phoneNumber);

      console.log('[FIREBASE_OTP] Signing in existing user with email/password');

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Verify UID matches expected
      if (user.uid !== expectedUid) {
        throw new Error('UID mismatch during authentication');
      }

      console.log('[FIREBASE_OTP] Existing user signed in successfully:', user.uid);
      return user;
    } catch (error) {
      console.error('[FIREBASE_OTP] Error signing in existing user:', error);
      throw error;
    }
  }

  /**
   * Create new Firebase user account
   * @param {string} phoneNumber - Phone number in +91 format
   * @returns {Promise<Object>} - Firebase user object
   */
  async createNewUser(phoneNumber) {
    try {
      const email = this.generateEmailFromPhone(phoneNumber);
      const password = this.generatePasswordFromPhone(phoneNumber);

      console.log('[FIREBASE_OTP] Creating new Firebase user account');

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update display name to phone number
      await updateProfile(user, { displayName: phoneNumber });

      // Create phone-to-UID mapping
      await this.createPhoneToUidMapping(phoneNumber, user.uid);

      console.log('[FIREBASE_OTP] New user created successfully:', user.uid);
      return user;
    } catch (error) {
      console.error('[FIREBASE_OTP] Error creating new user:', error);
      throw error;
    }
  }

  /**
   * Complete OTP authentication flow
   * Handles OTP verification + Firebase authentication
   * @param {string} phoneNumber - Phone number in +91 format
   * @param {string} otp - OTP code
   * @returns {Promise<Object>} - Authentication result
   */
  async authenticateWithOTP(phoneNumber, otp) {
    try {
      console.log('[FIREBASE_OTP] Starting complete OTP authentication flow');

      // Step 1: Verify OTP
      const otpResult = await this.otpService.verifyOTP(otp);

      if (!otpResult.success) {
        return {
          success: false,
          error: otpResult.error,
          step: 'otp_verification'
        };
      }

      console.log('[FIREBASE_OTP] OTP verified successfully, proceeding with Firebase auth');

      // Step 2: Check for existing user in Firestore
      const existingUid = await this.getUidByPhoneNumber(phoneNumber);

      if (existingUid) {
        // Step 3a: Existing user - sign in with Firebase
        try {
          const firebaseUser = await this.signInExistingUser(phoneNumber, existingUid);

          return {
            success: true,
            userExists: true,
            firebaseUser,
            uid: firebaseUser.uid,
            phoneNumber,
            message: 'Existing user signed in successfully'
          };
        } catch (error) {
          console.error('[FIREBASE_OTP] Failed to sign in existing user:', error);
          return {
            success: false,
            error: 'Failed to sign in existing user. Please try again.',
            step: 'firebase_signin'
          };
        }
      } else {
        // Step 3b: New user - create Firebase account
        try {
          const firebaseUser = await this.createNewUser(phoneNumber);

          return {
            success: true,
            userExists: false,
            firebaseUser,
            uid: firebaseUser.uid,
            phoneNumber,
            message: 'New user account created successfully'
          };
        } catch (error) {
          console.error('[FIREBASE_OTP] Failed to create new user:', error);
          return {
            success: false,
            error: 'Failed to create user account. Please try again.',
            step: 'firebase_registration'
          };
        }
      }
    } catch (error) {
      console.error('[FIREBASE_OTP] Error in complete authentication flow:', error);
      return {
        success: false,
        error: 'Authentication failed. Please try again.',
        step: 'unknown'
      };
    }
  }

  /**
   * Send OTP (wrapper around OTPService)
   * @param {string} phoneNumber - Phone number
   * @returns {Promise<Object>} - Send result
   */
  async sendOTP(phoneNumber) {
    return await this.otpService.sendOTP(phoneNumber);
  }

  /**
   * Verify OTP only (without Firebase auth)
   * @param {string} otp - OTP code
   * @param {string} sessionId - Optional session ID
   * @returns {Promise<Object>} - Verification result
   */
  async verifyOTPOnly(otp, sessionId = null) {
    return await this.otpService.verifyOTP(otp, sessionId);
  }

  /**
   * Get session information
   * @returns {Object} - Session info
   */
  getSessionInfo() {
    return this.otpService.getSessionInfo();
  }

  /**
   * Clear session data
   */
  clearSession() {
    this.otpService.clearSessionId();
  }

  /**
   * Get current Firebase user
   * @returns {Object|null} - Current Firebase user
   */
  getCurrentUser() {
    return auth.currentUser;
  }

  /**
   * Sign out current user
   * @returns {Promise<void>}
   */
  async signOut() {
    try {
      await auth.signOut();
      this.clearSession();
      console.log('[FIREBASE_OTP] User signed out successfully');
    } catch (error) {
      console.error('[FIREBASE_OTP] Error signing out:', error);
      throw error;
    }
  }
}

export default new FirebaseOTPService();