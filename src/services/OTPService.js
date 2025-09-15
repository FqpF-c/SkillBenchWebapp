// OTP Service using 2Factor API for phone-based authentication
// This service handles OTP sending and verification according to the auth guide

class OTPService {
  constructor() {
    // In production, store this in environment variables
    this.API_BASE_URL = 'https://2factor.in/API/V1';
    this.API_KEY = import.meta.env.VITE_2FACTOR_API_KEY || 'your-2factor-api-key';
  }

  /**
   * Send OTP via 2Factor API
   * @param {string} phoneNumber - Phone number in format +911234567890
   * @returns {Promise<{success: boolean, sessionId?: string, message?: string, error?: string}>}
   */
  async sendOTP(phoneNumber) {
    try {
      console.log('[OTP] Sending OTP to:', phoneNumber);
      
      // Clean phone number (remove +91)
      const cleanPhone = phoneNumber.replace('+91', '');
      
      // For test phone number
      if (phoneNumber === '+911234567890') {
        console.log('[OTP] Using test mode - storing session for verification');
        const testSessionId = 'test-session-' + Date.now();
        localStorage.setItem('otp_session_id', testSessionId);
        localStorage.setItem('otp_phone_number', phoneNumber);
        return { 
          success: true, 
          sessionId: testSessionId,
          message: 'Test OTP sent. Use 123456' 
        };
      }

      // Production OTP sending
      const url = `${this.API_BASE_URL}/${this.API_KEY}/SMS/${cleanPhone}/AUTOGEN`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();
      
      if (data.Status === 'Success') {
        const sessionId = data.Details;
        localStorage.setItem('otp_session_id', sessionId);
        localStorage.setItem('otp_phone_number', phoneNumber);
        
        console.log('[OTP] OTP sent successfully, session ID:', sessionId);
        return { 
          success: true, 
          sessionId,
          message: 'OTP sent successfully' 
        };
      } else {
        console.error('[OTP] Failed to send OTP:', data);
        return { 
          success: false, 
          error: data.Details || 'Failed to send OTP' 
        };
      }
    } catch (error) {
      console.error('[OTP] Error sending OTP:', error);
      return { 
        success: false, 
        error: 'Network error. Please check your connection and try again.' 
      };
    }
  }

  /**
   * Verify OTP via 2Factor API
   * @param {string} otp - The OTP code entered by user
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async verifyOTP(otp) {
    try {
      const sessionId = localStorage.getItem('otp_session_id');
      const phoneNumber = localStorage.getItem('otp_phone_number');
      
      if (!sessionId) {
        return { 
          success: false, 
          error: 'No OTP session found. Please request a new code.' 
        };
      }

      if (!phoneNumber) {
        return { 
          success: false, 
          error: 'Phone number not found. Please start the verification process again.' 
        };
      }

      console.log('[OTP] Verifying OTP for session:', sessionId);

      // Handle test OTP
      if (sessionId.startsWith('test-session-') && otp === '123456') {
        console.log('[OTP] Test OTP verified successfully');
        // Clear test session
        localStorage.removeItem('otp_session_id');
        return { success: true };
      }

      // Production OTP verification
      const url = `${this.API_BASE_URL}/${this.API_KEY}/SMS/VERIFY/${sessionId}/${otp}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();
      
      if (data.Status === 'Success') {
        console.log('[OTP] OTP verified successfully');
        // Clear session after successful verification
        localStorage.removeItem('otp_session_id');
        return { success: true };
      } else {
        console.error('[OTP] OTP verification failed:', data);
        return { 
          success: false, 
          error: data.Details || 'Invalid verification code. Please check and try again.' 
        };
      }
    } catch (error) {
      console.error('[OTP] Error verifying OTP:', error);
      return { 
        success: false, 
        error: 'Network error. Please check your connection and try again.' 
      };
    }
  }

  /**
   * Clean up OTP session
   */
  clearSession() {
    localStorage.removeItem('otp_session_id');
    localStorage.removeItem('otp_phone_number');
  }

  /**
   * Get the phone number from current session
   * @returns {string|null}
   */
  getSessionPhoneNumber() {
    return localStorage.getItem('otp_phone_number');
  }

  /**
   * Check if there's an active OTP session
   * @returns {boolean}
   */
  hasActiveSession() {
    return !!localStorage.getItem('otp_session_id');
  }
}

export default new OTPService();