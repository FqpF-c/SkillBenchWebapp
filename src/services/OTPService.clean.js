// Clean OTP Service for React/Vite app using backend proxy
// Mirrors the structure of Flutter OTPService implementation

import { APP_URL } from '../config/firebase';

/**
 * OTP Service for phone-based authentication using backend proxy
 * Handles sending and verifying OTP codes through 2Factor.in API via backend
 */
class OTPService {
  constructor() {
    this.SESSION_STORAGE_KEY = 'otp_session_id';
    this.PHONE_STORAGE_KEY = 'otp_phone_number';
  }

  /**
   * Validate phone number format
   * @param {string} phoneNumber - Phone number to validate
   * @returns {boolean} - True if valid 10-digit number
   */
  validatePhoneNumber(phoneNumber) {
    if (!phoneNumber) return false;

    // Remove all non-digits
    const cleanPhone = phoneNumber.replace(/\D/g, '');

    // Should be exactly 10 digits
    return cleanPhone.length === 10 && /^\d{10}$/.test(cleanPhone);
  }

  /**
   * Format phone number to clean 10-digit format
   * @param {string} phoneNumber - Raw phone number
   * @returns {string} - Clean 10-digit phone number
   */
  formatPhoneNumber(phoneNumber) {
    return phoneNumber.replace(/\D/g, '');
  }

  /**
   * Format phone number with +91 country code
   * @param {string} phoneNumber - Raw phone number
   * @returns {string} - Formatted phone number with +91
   */
  formatPhoneNumberWithCountryCode(phoneNumber) {
    const cleanPhone = this.formatPhoneNumber(phoneNumber);
    return `+91${cleanPhone}`;
  }

  /**
   * Save session ID to localStorage
   * @param {string} sessionId - Session ID from OTP send response
   * @param {string} phoneNumber - Phone number for this session
   */
  saveSessionId(sessionId, phoneNumber) {
    try {
      localStorage.setItem(this.SESSION_STORAGE_KEY, sessionId);
      localStorage.setItem(this.PHONE_STORAGE_KEY, phoneNumber);
      console.log('[OTP] Session saved:', { sessionId, phoneNumber });
    } catch (error) {
      console.error('[OTP] Failed to save session:', error);
    }
  }

  /**
   * Get session ID from localStorage
   * @returns {string|null} - Session ID or null if not found
   */
  getSessionId() {
    try {
      return localStorage.getItem(this.SESSION_STORAGE_KEY);
    } catch (error) {
      console.error('[OTP] Failed to get session ID:', error);
      return null;
    }
  }

  /**
   * Get phone number from current session
   * @returns {string|null} - Phone number or null if not found
   */
  getSessionPhoneNumber() {
    try {
      return localStorage.getItem(this.PHONE_STORAGE_KEY);
    } catch (error) {
      console.error('[OTP] Failed to get phone number:', error);
      return null;
    }
  }

  /**
   * Clear session data from localStorage
   */
  clearSessionId() {
    try {
      localStorage.removeItem(this.SESSION_STORAGE_KEY);
      localStorage.removeItem(this.PHONE_STORAGE_KEY);
      console.log('[OTP] Session cleared');
    } catch (error) {
      console.error('[OTP] Failed to clear session:', error);
    }
  }

  /**
   * Check if there's an active OTP session
   * @returns {boolean} - True if active session exists
   */
  hasActiveSession() {
    return !!this.getSessionId();
  }

  /**
   * Send OTP to phone number via backend
   * @param {string} phoneNumber - Phone number (10 digits or with +91)
   * @returns {Promise<{success: boolean, sessionId?: string, message?: string, error?: string}>}
   */
  async sendOTP(phoneNumber) {
    try {
      console.log('[OTP] Sending OTP to:', phoneNumber);

      // Validate phone number
      if (!this.validatePhoneNumber(phoneNumber)) {
        return {
          success: false,
          error: 'Invalid phone number format. Please enter a valid 10-digit number.'
        };
      }

      // Format phone number
      const cleanPhone = this.formatPhoneNumber(phoneNumber);
      const formattedPhone = this.formatPhoneNumberWithCountryCode(cleanPhone);

      // Make request to backend
      const response = await fetch(`${APP_URL}/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: cleanPhone
        })
      });

      // Check if request was successful
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('[OTP] Backend error:', response.status, errorData);

        return {
          success: false,
          error: errorData.error || `Server error (${response.status}). Please try again.`
        };
      }

      // Parse response
      const data = await response.json();
      console.log('[OTP] Backend response:', data);

      if (data.success && data.sessionId) {
        // Save session data
        this.saveSessionId(data.sessionId, formattedPhone);

        return {
          success: true,
          sessionId: data.sessionId,
          message: data.message || 'OTP sent successfully to your phone number.',
          phoneNumber: formattedPhone
        };
      } else {
        return {
          success: false,
          error: data.error || 'Failed to send OTP. Please try again.'
        };
      }

    } catch (error) {
      console.error('[OTP] Error sending OTP:', error);

      // Handle network errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        return {
          success: false,
          error: 'Network error. Please check your internet connection and try again.'
        };
      }

      return {
        success: false,
        error: error.message || 'An unexpected error occurred. Please try again.'
      };
    }
  }

  /**
   * Verify OTP code via backend
   * @param {string} otp - OTP code entered by user (6 digits)
   * @param {string} sessionId - Optional session ID (uses stored if not provided)
   * @returns {Promise<{success: boolean, message?: string, error?: string}>}
   */
  async verifyOTP(otp, sessionId = null) {
    try {
      console.log('[OTP] Verifying OTP code');

      // Get session ID from parameter or storage
      const currentSessionId = sessionId || this.getSessionId();

      if (!currentSessionId) {
        return {
          success: false,
          error: 'No OTP session found. Please request a new code.'
        };
      }

      // Validate OTP format
      if (!otp || !/^\d{6}$/.test(otp)) {
        return {
          success: false,
          error: 'Please enter a valid 6-digit OTP code.'
        };
      }

      // Make request to backend
      const response = await fetch(`${APP_URL}/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: currentSessionId,
          otp: otp
        })
      });

      // Check if request was successful
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('[OTP] Verification backend error:', response.status, errorData);

        return {
          success: false,
          error: errorData.error || `Verification failed (${response.status}). Please try again.`
        };
      }

      // Parse response
      const data = await response.json();
      console.log('[OTP] Verification response:', data);

      if (data.success) {
        // Clear session on successful verification
        this.clearSessionId();

        return {
          success: true,
          message: data.message || 'OTP verified successfully.'
        };
      } else {
        return {
          success: false,
          error: data.error || 'Invalid OTP code. Please check and try again.'
        };
      }

    } catch (error) {
      console.error('[OTP] Error verifying OTP:', error);

      // Handle network errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        return {
          success: false,
          error: 'Network error. Please check your internet connection and try again.'
        };
      }

      return {
        success: false,
        error: error.message || 'An unexpected error occurred during verification. Please try again.'
      };
    }
  }

  /**
   * Resend OTP to the same phone number
   * @returns {Promise<Object>} - Same as sendOTP response
   */
  async resendOTP() {
    const phoneNumber = this.getSessionPhoneNumber();

    if (!phoneNumber) {
      return {
        success: false,
        error: 'No phone number found. Please start the verification process again.'
      };
    }

    console.log('[OTP] Resending OTP to:', phoneNumber);
    return await this.sendOTP(phoneNumber);
  }

  /**
   * Get session information
   * @returns {Object} - Session info object
   */
  getSessionInfo() {
    return {
      sessionId: this.getSessionId(),
      phoneNumber: this.getSessionPhoneNumber(),
      hasActiveSession: this.hasActiveSession()
    };
  }
}

// Export singleton instance
export default new OTPService();