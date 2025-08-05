import { 
    signInWithPhoneNumber, 
    RecaptchaVerifier, 
    signOut,
    signInAnonymously 
  } from 'firebase/auth';
  import { auth } from '../config/firebase';
  
  class FirebaseAuthService {
    constructor() {
      this.confirmationResult = null;
      this.recaptchaVerifier = null;
    }
  
    async initRecaptcha() {
      if (!this.recaptchaVerifier) {
        try {
          this.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
            size: 'invisible',
            callback: () => {
              console.log('reCAPTCHA solved');
            },
            'expired-callback': () => {
              console.log('reCAPTCHA expired');
              this.clearRecaptcha();
            }
          });
          
          await this.recaptchaVerifier.render();
        } catch (error) {
          console.error('Error initializing reCAPTCHA:', error);
          throw error;
        }
      }
    }
  
    clearRecaptcha() {
      if (this.recaptchaVerifier) {
        this.recaptchaVerifier.clear();
        this.recaptchaVerifier = null;
      }
    }
  
    async sendOTP(phoneNumber) {
      try {
        console.log(`FirebaseAuthService: Sending OTP to ${phoneNumber}`);
        
        if (phoneNumber === '+911234567890') {
          console.log('Using test credentials - signing in anonymously');
          await signInAnonymously(auth);
          this.confirmationResult = 'test-confirmation';
          console.log('Test OTP sent successfully');
          return { success: true };
        }

        this.clearRecaptcha();
        await this.initRecaptcha();
        
        console.log('Calling signInWithPhoneNumber...');
        this.confirmationResult = await signInWithPhoneNumber(
          auth, 
          phoneNumber, 
          this.recaptchaVerifier
        );
        
        console.log('OTP sent successfully');
        return { success: true };
      } catch (error) {
        console.error('FirebaseAuthService: Error sending OTP:', error);
        this.clearRecaptcha();
        return { success: false, error: this.getErrorMessage(error.code) };
      }
    }
  
    async verifyOTP(otp) {
      try {
        console.log(`Verifying OTP: ${otp}`);
        
        if (this.confirmationResult === 'test-confirmation' && otp === '123456') {
          return { success: true, user: auth.currentUser };
        }
  
        if (!this.confirmationResult) {
          return { success: false, error: 'No confirmation result found. Please request a new code.' };
        }
  
        const result = await this.confirmationResult.confirm(otp);
        console.log('OTP verified successfully');
        return { success: true, user: result.user };
      } catch (error) {
        console.error('Error verifying OTP:', error);
        return { success: false, error: this.getErrorMessage(error.code) };
      }
    }
  
    async signOut() {
      try {
        console.log('FirebaseAuthService: Starting sign out...');
        
        // Clear reCAPTCHA
        this.clearRecaptcha();
        
        // Clear confirmation result
        this.confirmationResult = null;
        
        // Sign out from Firebase Auth
        await signOut(auth);
        
        // Clear all localStorage items
        localStorage.removeItem('userData');
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('phoneNumber');
        
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