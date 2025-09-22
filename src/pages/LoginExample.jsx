import React from 'react';
import { useNavigate } from 'react-router-dom';
import OTPLogin from '../components/auth/OTPLogin';
import toast from 'react-hot-toast';

/**
 * Example Login Page using OTPLogin component
 * Demonstrates how to integrate OTP authentication into your app
 */
const LoginExample = () => {
  const navigate = useNavigate();

  /**
   * Handle successful OTP verification
   * @param {Object} result - Verification result
   */
  const handleOTPSuccess = (result) => {
    console.log('OTP verification successful:', result);

    // Show success message
    toast.success('Phone number verified successfully!');

    // Here you would typically:
    // 1. Check Firestore for existing user mapping
    // 2. Sign in with Firebase if user exists
    // 3. Redirect to registration if new user
    // 4. Update auth context/state

    // For demo purposes, just redirect to home
    setTimeout(() => {
      navigate('/', { replace: true });
    }, 1500);
  };

  /**
   * Handle OTP verification errors
   * @param {string} error - Error message
   */
  const handleOTPError = (error) => {
    console.error('OTP verification error:', error);
    toast.error(error);
  };

  return (
    <div className=\"min-h-screen bg-gray-50\">
      <OTPLogin
        onSuccess={handleOTPSuccess}
        onError={handleOTPError}
      />
    </div>
  );
};

export default LoginExample;