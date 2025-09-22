import React, { useState, useEffect } from 'react';
import { Smartphone, Shield, ArrowRight, ArrowLeft, RotateCcw } from 'lucide-react';
import OTPService from '../../services/OTPService.clean';

/**
 * Complete OTP Login Component
 * Handles phone input, OTP sending, and verification in a single component
 */
const OTPLogin = ({ onSuccess, onError }) => {
  // State management
  const [step, setStep] = useState('phone'); // 'phone' | 'otp'
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [sessionInfo, setSessionInfo] = useState(null);

  // Countdown timer for resend
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // Check for existing session on mount
  useEffect(() => {
    const session = OTPService.getSessionInfo();
    if (session.hasActiveSession) {
      setSessionInfo(session);
      setPhoneNumber(session.phoneNumber || '');
      setStep('otp');
      setMessage('Continuing previous OTP session...');
    }
  }, []);

  /**
   * Clear all error and success messages
   */
  const clearMessages = () => {
    setError('');
    setMessage('');
  };

  /**
   * Handle phone number input change
   */
  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Only digits
    if (value.length <= 10) {
      setPhoneNumber(value);
      clearMessages();
    }
  };

  /**
   * Handle OTP input change
   */
  const handleOtpChange = (index, value) => {
    if (value.length > 1) return; // Prevent multiple characters

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    clearMessages();

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }

    // Auto-verify when all 6 digits are entered
    if (newOtp.every(digit => digit) && newOtp.join('').length === 6) {
      handleVerifyOTP(newOtp.join(''));
    }
  };

  /**
   * Handle OTP input keydown (for backspace navigation)
   */
  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  /**
   * Send OTP to phone number
   */
  const handleSendOTP = async (e) => {
    e.preventDefault();
    clearMessages();

    if (!phoneNumber) {
      setError('Please enter a phone number');
      return;
    }

    if (phoneNumber.length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);

    try {
      const result = await OTPService.sendOTP(phoneNumber);

      if (result.success) {
        setSessionInfo({ sessionId: result.sessionId, phoneNumber: result.phoneNumber });
        setStep('otp');
        setCountdown(60); // 60 second countdown for resend
        setMessage(result.message);

        // Focus first OTP input
        setTimeout(() => {
          const firstInput = document.getElementById('otp-0');
          if (firstInput) firstInput.focus();
        }, 100);
      } else {
        setError(result.error);
        if (onError) onError(result.error);
      }
    } catch (error) {
      const errorMessage = 'An unexpected error occurred. Please try again.';
      setError(errorMessage);
      if (onError) onError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Verify OTP code
   */
  const handleVerifyOTP = async (otpCode = otp.join('')) => {
    if (otpCode.length !== 6) {
      setError('Please enter the complete 6-digit OTP');
      return;
    }

    setLoading(true);
    clearMessages();

    try {
      const result = await OTPService.verifyOTP(otpCode);

      if (result.success) {
        setMessage(result.message);
        if (onSuccess) {
          onSuccess({
            phoneNumber: sessionInfo?.phoneNumber || `+91${phoneNumber}`,
            verified: true
          });
        }
      } else {
        setError(result.error);
        // Clear OTP inputs on error
        setOtp(['', '', '', '', '', '']);
        setTimeout(() => {
          const firstInput = document.getElementById('otp-0');
          if (firstInput) firstInput.focus();
        }, 100);

        if (onError) onError(result.error);
      }
    } catch (error) {
      const errorMessage = 'An unexpected error occurred during verification.';
      setError(errorMessage);
      setOtp(['', '', '', '', '', '']);
      if (onError) onError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Resend OTP
   */
  const handleResendOTP = async () => {
    if (countdown > 0) return;

    setLoading(true);
    clearMessages();

    try {
      const result = await OTPService.resendOTP();

      if (result.success) {
        setCountdown(60);
        setMessage('OTP resent successfully!');
        setOtp(['', '', '', '', '', '']); // Clear previous OTP
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Failed to resend OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Go back to phone input
   */
  const handleBack = () => {
    setStep('phone');
    setOtp(['', '', '', '', '', '']);
    setCountdown(0);
    clearMessages();
    // Don't clear session data in case user wants to continue
  };

  /**
   * Start over (clear everything)
   */
  const handleStartOver = () => {
    OTPService.clearSessionId();
    setStep('phone');
    setPhoneNumber('');
    setOtp(['', '', '', '', '', '']);
    setCountdown(0);
    setSessionInfo(null);
    clearMessages();
  };

  /**
   * Render phone input step
   */
  const renderPhoneStep = () => (
    <div className=\"w-full max-w-md space-y-6\">
      <div className=\"text-center\">
        <div className=\"w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl\">
          <Smartphone className=\"w-10 h-10 text-white\" />
        </div>
        <h1 className=\"text-3xl font-bold text-gray-900 mb-2\">Phone Verification</h1>
        <p className=\"text-gray-600\">Enter your phone number to receive an OTP</p>
      </div>

      <form onSubmit={handleSendOTP} className=\"space-y-4\">
        <div>
          <label htmlFor=\"phone\" className=\"block text-sm font-medium text-gray-700 mb-2\">
            Phone Number
          </label>
          <div className=\"relative\">
            <div className=\"absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none\">
              <span className=\"text-gray-500 text-sm\">+91</span>
            </div>
            <input
              id=\"phone\"
              type=\"tel\"
              value={phoneNumber}
              onChange={handlePhoneChange}
              className=\"w-full pl-12 pr-4 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg transition-all duration-200\"
              placeholder=\"9876543210\"
              disabled={loading}
              autoFocus
            />
          </div>
        </div>

        <button
          type=\"submit\"
          disabled={loading || phoneNumber.length !== 10}
          className=\"w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 px-6 rounded-2xl font-semibold text-lg hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2\"
        >
          {loading ? (
            <div className=\"w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin\" />
          ) : (
            <>
              Send OTP
              <ArrowRight className=\"w-5 h-5\" />
            </>
          )}
        </button>
      </form>
    </div>
  );

  /**
   * Render OTP verification step
   */
  const renderOTPStep = () => (
    <div className=\"w-full max-w-md space-y-6\">
      <div className=\"text-center\">
        <div className=\"w-20 h-20 bg-gradient-to-br from-green-500 to-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl\">
          <Shield className=\"w-10 h-10 text-white\" />
        </div>
        <h1 className=\"text-3xl font-bold text-gray-900 mb-2\">Enter OTP</h1>
        <p className=\"text-gray-600 mb-1\">We sent a 6-digit code to</p>
        <p className=\"text-gray-900 font-semibold\">{sessionInfo?.phoneNumber || `+91${phoneNumber}`}</p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); handleVerifyOTP(); }} className=\"space-y-6\">
        <div>
          <label className=\"block text-sm font-medium text-gray-700 mb-4 text-center\">
            Enter verification code
          </label>
          <div className=\"flex gap-3 justify-center\">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type=\"text\"
                inputMode=\"numeric\"
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                className=\"w-12 h-14 text-center text-xl font-bold border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200\"
                maxLength=\"1\"
                disabled={loading}
              />
            ))}
          </div>
        </div>

        <button
          type=\"submit\"
          disabled={loading || otp.join('').length !== 6}
          className=\"w-full bg-gradient-to-r from-green-500 to-blue-600 text-white py-4 px-6 rounded-2xl font-semibold text-lg hover:from-green-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2\"
        >
          {loading ? (
            <div className=\"w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin\" />
          ) : (
            'Verify OTP'
          )}
        </button>
      </form>

      <div className=\"space-y-3\">
        <div className=\"flex justify-center gap-4\">
          <button
            onClick={handleBack}
            disabled={loading}
            className=\"flex items-center gap-2 text-gray-600 hover:text-gray-800 font-medium transition-colors disabled:opacity-50\"
          >
            <ArrowLeft className=\"w-4 h-4\" />
            Change Number
          </button>

          <button
            onClick={handleStartOver}
            disabled={loading}
            className=\"flex items-center gap-2 text-gray-600 hover:text-gray-800 font-medium transition-colors disabled:opacity-50\"
          >
            <RotateCcw className=\"w-4 h-4\" />
            Start Over
          </button>
        </div>

        <div className=\"text-center\">
          {countdown > 0 ? (
            <p className=\"text-sm text-gray-500\">
              Resend OTP in {countdown}s
            </p>
          ) : (
            <button
              onClick={handleResendOTP}
              disabled={loading}
              className=\"text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors disabled:opacity-50\"
            >
              Resend OTP
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className=\"min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4\">
      <div className=\"w-full max-w-md\">
        <div className=\"bg-white rounded-3xl shadow-xl p-8 border border-gray-100\">
          {step === 'phone' ? renderPhoneStep() : renderOTPStep()}

          {/* Error and Success Messages */}
          {error && (
            <div className=\"mt-4 p-4 bg-red-50 border border-red-200 rounded-xl\">
              <p className=\"text-sm text-red-600 text-center\">{error}</p>
            </div>
          )}

          {message && !error && (
            <div className=\"mt-4 p-4 bg-green-50 border border-green-200 rounded-xl\">
              <p className=\"text-sm text-green-600 text-center\">{message}</p>
            </div>
          )}
        </div>

        {/* Debug info in development */}
        {process.env.NODE_ENV === 'development' && (
          <div className=\"mt-4 p-3 bg-gray-100 rounded-lg text-xs text-gray-600\">
            <p><strong>Debug Info:</strong></p>
            <p>Step: {step}</p>
            <p>Phone: {phoneNumber}</p>
            <p>Session: {sessionInfo?.sessionId ? 'Active' : 'None'}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OTPLogin;