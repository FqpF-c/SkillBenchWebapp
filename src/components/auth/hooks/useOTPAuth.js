import { useState, useCallback } from 'react';
import OTPService from '../../../services/OTPService.clean';

/**
 * Custom hook for OTP authentication
 * Provides reusable OTP logic for components
 */
export const useOTPAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  /**
   * Clear all messages
   */
  const clearMessages = useCallback(() => {
    setError('');
    setMessage('');
  }, []);

  /**
   * Send OTP to phone number
   * @param {string} phoneNumber - Phone number to send OTP to
   * @returns {Promise<Object>} - Result object
   */
  const sendOTP = useCallback(async (phoneNumber) => {
    setLoading(true);
    clearMessages();

    try {
      const result = await OTPService.sendOTP(phoneNumber);

      if (result.success) {
        setMessage(result.message);
      } else {
        setError(result.error);
      }

      return result;
    } catch (error) {
      const errorMessage = 'An unexpected error occurred. Please try again.';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  }, [clearMessages]);

  /**
   * Verify OTP code
   * @param {string} otp - OTP code to verify
   * @param {string} sessionId - Optional session ID
   * @returns {Promise<Object>} - Result object
   */
  const verifyOTP = useCallback(async (otp, sessionId = null) => {
    setLoading(true);
    clearMessages();

    try {
      const result = await OTPService.verifyOTP(otp, sessionId);

      if (result.success) {
        setMessage(result.message);
      } else {
        setError(result.error);
      }

      return result;
    } catch (error) {
      const errorMessage = 'An unexpected error occurred during verification.';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  }, [clearMessages]);

  /**
   * Resend OTP
   * @returns {Promise<Object>} - Result object
   */
  const resendOTP = useCallback(async () => {
    setLoading(true);
    clearMessages();

    try {
      const result = await OTPService.resendOTP();

      if (result.success) {
        setMessage('OTP resent successfully!');
      } else {
        setError(result.error);
      }

      return result;
    } catch (error) {
      const errorMessage = 'Failed to resend OTP. Please try again.';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  }, [clearMessages]);

  /**
   * Get current session info
   * @returns {Object} - Session info
   */
  const getSessionInfo = useCallback(() => {
    return OTPService.getSessionInfo();
  }, []);

  /**
   * Clear session data
   */
  const clearSession = useCallback(() => {
    OTPService.clearSessionId();
    clearMessages();
  }, [clearMessages]);

  return {
    // State
    loading,
    error,
    message,

    // Actions
    sendOTP,
    verifyOTP,
    resendOTP,
    getSessionInfo,
    clearSession,
    clearMessages
  };
};