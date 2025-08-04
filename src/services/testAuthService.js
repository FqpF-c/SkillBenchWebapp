// src/services/testAuthService.js
// Simple authentication service that matches your Flutter app's test credentials

import { signInWithCustomToken, signInAnonymously } from 'firebase/auth';
import { auth } from '../config/firebase';

class TestAuthService {
  // Test credentials from your Flutter app
  static TEST_PHONE = '1234567890';
  static TEST_PHONE_WITH_CODE = '+911234567890';
  static TEST_OTP = '123456';

  constructor() {
    this.isAuthenticated = false;
    this.currentUser = null;
  }

  // Check if phone number is the test number
  isTestPhoneNumber(phoneNumber) {
    const cleanPhone = phoneNumber.replace('+91', '').replace(/\s+/g, '');
    return cleanPhone === TestAuthService.TEST_PHONE;
  }

  // Simulate sending OTP (like your Flutter app)
  async sendOTP(phoneNumber) {
    return new Promise((resolve) => {
      console.log('🔐 Sending OTP to:', phoneNumber);
      
      // Simulate network delay
      setTimeout(() => {
        if (this.isTestPhoneNumber(phoneNumber)) {
          console.log('✅ Test phone number detected - OTP would be sent');
          resolve({
            success: true,
            message: `OTP sent to ${phoneNumber}. Use ${TestAuthService.TEST_OTP} for testing.`
          });
        } else {
          console.log('❌ Non-test phone number - would fail in production');
          resolve({
            success: false,
            message: 'This is a test environment. Please use the test phone number: +911234567890'
          });
        }
      }, 1000);
    });
  }

  // Verify OTP and authenticate with Firebase (like your Flutter app)
  async verifyOTP(phoneNumber, otp) {
    return new Promise(async (resolve) => {
      console.log('🔍 Verifying OTP:', otp, 'for phone:', phoneNumber);
      
      // Simulate network delay
      setTimeout(async () => {
        if (this.isTestPhoneNumber(phoneNumber) && otp === TestAuthService.TEST_OTP) {
          try {
            console.log('✅ Test credentials match - signing in to Firebase');
            
            // Sign in anonymously to Firebase (like your Flutter app does)
            const userCredential = await signInAnonymously(auth);
            
            this.isAuthenticated = true;
            this.currentUser = {
              uid: userCredential.user.uid,
              phoneNumber: phoneNumber,
              isTestUser: true
            };
            
            console.log('🎉 Firebase authentication successful:', userCredential.user.uid);
            
            resolve({
              success: true,
              message: 'Login successful!',
              user: this.currentUser
            });
          } catch (error) {
            console.error('❌ Firebase authentication failed:', error);
            resolve({
              success: false,
              message: `Authentication failed: ${error.message}`
            });
          }
        } else {
          console.log('❌ Invalid credentials');
          resolve({
            success: false,
            message: 'Invalid OTP. Please use 123456 for testing.'
          });
        }
      }, 1500);
    });
  }

  // Check current authentication status
  getCurrentUser() {
    return this.currentUser;
  }

  isLoggedIn() {
    return this.isAuthenticated && auth.currentUser !== null;
  }

  // Sign out
  async signOut() {
    try {
      await auth.signOut();
      this.isAuthenticated = false;
      this.currentUser = null;
      console.log('👋 Signed out successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ Sign out failed:', error);
      return { success: false, message: error.message };
    }
  }

  // Listen for Firebase auth state changes
  onAuthStateChanged(callback) {
    return auth.onAuthStateChanged((user) => {
      if (user) {
        this.isAuthenticated = true;
        this.currentUser = {
          uid: user.uid,
          phoneNumber: this.currentUser?.phoneNumber || TestAuthService.TEST_PHONE_WITH_CODE,
          isTestUser: true
        };
      } else {
        this.isAuthenticated = false;
        this.currentUser = null;
      }
      callback(user);
    });
  }
}

export const testAuthService = new TestAuthService();
export default testAuthService;