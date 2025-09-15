import { 
  signOut,
  signInAnonymously
} from 'firebase/auth';
import { auth } from '../config/firebase';

class FirebaseAuthService {
  constructor() {
    // No longer need recaptcha for OTP since we're using 3rd party API like phone app
  }

  async sendOTP(phoneNumber) {
    try {
      console.log('Sending OTP to:', phoneNumber);
      
      // For test phone number
      if (phoneNumber === '+911234567890') {
        console.log('Using test mode - storing session for verification');
        localStorage.setItem('otp_session_id', 'test-session-id');
        return { success: true, message: 'Test OTP sent. Use 123456' };
      }

      // In production, you would integrate with your OTP API here
      // For now, simulate the success
      localStorage.setItem('otp_session_id', 'production-session-' + Date.now());
      return { success: true, message: 'OTP sent successfully' };
    } catch (error) {
      console.error('Error sending OTP:', error);
      return { success: false, error: 'Failed to send OTP. Please try again.' };
    }
  }

  async verifyOTP(otp) {
    try {
      const sessionId = localStorage.getItem('otp_session_id');
      if (!sessionId) {
        return { success: false, error: 'No OTP session found. Please request a new code.' };
      }

      // Verify OTP based on session type
      let isValidOTP = false;
      if (sessionId === 'test-session-id' && otp === '123456') {
        isValidOTP = true;
      } else if (sessionId.startsWith('production-session-') && otp.length === 6) {
        // In production, you would verify with your OTP API here
        isValidOTP = true; // Simulate success for now
      }

      if (!isValidOTP) {
        return { success: false, error: 'Invalid verification code. Please check and try again.' };
      }

      // Create anonymous Firebase user (like phone app does)
      console.log('OTP verified successfully, creating anonymous Firebase user...');
      const result = await signInAnonymously(auth);
      console.log('Anonymous authentication successful with UID:', result.user.uid);
      
      // Clear session
      localStorage.removeItem('otp_session_id');
      
      return { success: true, user: result.user };
    } catch (error) {
      console.error('Error verifying OTP:', error);
      return { success: false, error: 'Authentication failed. Please try again.' };
    }
  }

  async signOut() {
    try {
      console.log('FirebaseAuthService: Starting sign out...');
      
      await signOut(auth);
      
      localStorage.removeItem('userData');
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('phoneNumber');
      localStorage.removeItem('otp_session_id');
      
      console.log('FirebaseAuthService: Sign out completed successfully');
      return { success: true };
    } catch (error) {
      console.error('FirebaseAuthService: Error signing out:', error);
      return { success: false, error: error.message };
    }
  }

  getCurrentUser() {
    return auth.currentUser;
  }

  getErrorMessage(errorCode) {
    switch (errorCode) {
      case 'auth/billing-not-enabled':
        return 'Phone authentication requires Firebase Blaze plan. Please upgrade your Firebase project.';
      case 'auth/invalid-phone-number':
        return 'The phone number format is incorrect';
      case 'auth/too-many-requests':
        return 'Too many requests from this device. Try again later';
      case 'auth/invalid-verification-code':
        return 'The code you entered is incorrect. Please check and try again.';
      case 'auth/invalid-verification-id':
        return 'Session expired. Please request a new verification code.';
      case 'auth/session-expired':
        return 'The verification session has expired. Please request a new code.';
      case 'auth/quota-exceeded':
        return 'SMS quota exceeded. Please try again tomorrow.';
      case 'auth/captcha-check-failed':
        return 'reCAPTCHA verification failed. Please try again.';
      case 'auth/recaptcha-not-enabled':
        return 'reCAPTCHA Enterprise not enabled. Please enable it in Firebase Console.';
      case 'auth/missing-app-credential':
        return 'App verification failed. Please check your Firebase configuration.';
      default:
        return `Authentication error: ${errorCode || 'Unknown error'}. Please try again.`;
    }
  }
}

export default new FirebaseAuthService();