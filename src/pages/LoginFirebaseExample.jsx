import React from 'react';
import { useNavigate } from 'react-router-dom';
import FirebaseOTPLogin from '../components/auth/FirebaseOTPLogin';
import toast from 'react-hot-toast';

/**
 * Example Login Page using FirebaseOTPLogin component
 * Demonstrates complete OTP + Firebase authentication flow
 */
const LoginFirebaseExample = () => {
  const navigate = useNavigate();

  /**
   * Handle successful authentication
   * @param {Object} result - Authentication result
   */
  const handleAuthSuccess = (result) => {
    console.log('Authentication successful:', result);

    // Show success message
    if (result.userExists) {
      toast.success(`Welcome back! Signed in as ${result.phoneNumber}`);
    } else {
      toast.success(`Account created! Welcome to SkillBench`);
    }

    // Custom logic here:
    // - Update global auth state
    // - Store user data
    // - Initialize user session
    // - Fetch user profile data

    // Default behavior will redirect automatically based on userExists flag
  };

  /**
   * Handle authentication errors
   * @param {string} error - Error message
   * @param {string} step - Step where error occurred
   */
  const handleAuthError = (error, step) => {
    console.error(`Authentication error at ${step}:`, error);
    toast.error(error);

    // Custom error handling based on step:
    if (step === 'send_otp') {
      // Handle OTP sending errors
    } else if (step === 'otp_verification') {
      // Handle OTP verification errors
    } else if (step === 'firebase_signin') {
      // Handle Firebase sign-in errors
    } else if (step === 'firebase_registration') {
      // Handle Firebase registration errors
    }
  };

  return (
    <div className=\"min-h-screen bg-gray-50\">
      <FirebaseOTPLogin
        onSuccess={handleAuthSuccess}
        onError={handleAuthError}
        options={{
          redirectToRegistration: '/complete-profile',
          redirectToHome: '/dashboard'
        }}
      />
    </div>
  );
};

export default LoginFirebaseExample;