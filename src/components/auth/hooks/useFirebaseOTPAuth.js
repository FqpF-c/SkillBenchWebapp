import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import FirebaseOTPService from '../../../services/FirebaseOTPService';

/**
 * Custom hook for Firebase OTP authentication
 * Provides complete OTP + Firebase authentication flow
 */
export const useFirebaseOTPAuth = (options = {}) => {
  const {
    onSuccess,
    onError,
    redirectToRegistration = '/register',
    redirectToHome = '/'
  } = options;

  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [step, setStep] = useState('phone'); // 'phone' | 'otp' | 'processing'

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
      const result = await FirebaseOTPService.sendOTP(phoneNumber);

      if (result.success) {
        setMessage(result.message);
        setStep('otp');
      } else {
        setError(result.error);
        if (onError) onError(result.error, 'send_otp');
      }

      return result;
    } catch (error) {
      const errorMessage = 'An unexpected error occurred. Please try again.';
      setError(errorMessage);
      if (onError) onError(errorMessage, 'send_otp');
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  }, [clearMessages, onError]);

  /**
   * Complete authentication flow (OTP verification + Firebase auth)
   * @param {string} phoneNumber - Phone number
   * @param {string} otp - OTP code
   * @returns {Promise<Object>} - Result object
   */
  const authenticateWithOTP = useCallback(async (phoneNumber, otp) => {
    setLoading(true);
    setStep('processing');
    clearMessages();

    try {
      const result = await FirebaseOTPService.authenticateWithOTP(phoneNumber, otp);

      if (result.success) {
        setMessage(result.message);

        // Handle successful authentication
        if (onSuccess) {
          onSuccess(result);
        } else {
          // Default behavior: redirect based on user type
          if (result.userExists) {
            // Existing user - redirect to home
            setTimeout(() => navigate(redirectToHome, { replace: true }), 1000);
          } else {
            // New user - redirect to registration
            setTimeout(() => navigate(redirectToRegistration, { replace: true }), 1000);
          }
        }
      } else {
        setError(result.error);
        setStep('otp'); // Go back to OTP step
        if (onError) onError(result.error, result.step);
      }

      return result;
    } catch (error) {
      const errorMessage = 'Authentication failed. Please try again.';
      setError(errorMessage);
      setStep('otp');
      if (onError) onError(errorMessage, 'authentication');
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  }, [clearMessages, navigate, onError, onSuccess, redirectToHome, redirectToRegistration]);

  /**
   * Verify OTP only (without Firebase auth)
   * @param {string} otp - OTP code
   * @param {string} sessionId - Optional session ID
   * @returns {Promise<Object>} - Result object
   */
  const verifyOTPOnly = useCallback(async (otp, sessionId = null) => {
    setLoading(true);
    clearMessages();

    try {
      const result = await FirebaseOTPService.verifyOTPOnly(otp, sessionId);

      if (result.success) {
        setMessage(result.message);
      } else {
        setError(result.error);
      }

      return result;
    } catch (error) {
      const errorMessage = 'OTP verification failed. Please try again.';
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
      const sessionInfo = FirebaseOTPService.getSessionInfo();
      if (!sessionInfo.phoneNumber) {
        throw new Error('No phone number found for resend');
      }

      const result = await FirebaseOTPService.sendOTP(sessionInfo.phoneNumber);

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
    return FirebaseOTPService.getSessionInfo();
  }, []);

  /**
   * Clear session data
   */
  const clearSession = useCallback(() => {
    FirebaseOTPService.clearSession();
    clearMessages();
    setStep('phone');
  }, [clearMessages]);

  /**
   * Sign out current user
   */
  const signOut = useCallback(async () => {
    setLoading(true);
    try {
      await FirebaseOTPService.signOut();
      clearSession();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Error signing out:', error);
      setError('Failed to sign out. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [clearSession, navigate]);

  /**
   * Reset to phone step
   */
  const resetToPhoneStep = useCallback(() => {
    setStep('phone');
    clearMessages();
  }, [clearMessages]);

  return {
    // State
    loading,
    error,
    message,
    step,

    // Actions
    sendOTP,
    authenticateWithOTP,
    verifyOTPOnly,
    resendOTP,
    getSessionInfo,
    clearSession,
    clearMessages,
    signOut,
    resetToPhoneStep,

    // Utilities
    setStep,
    setError,
    setMessage
  };
};