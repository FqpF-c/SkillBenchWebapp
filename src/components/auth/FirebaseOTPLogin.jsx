import React, { useState, useEffect } from 'react';
import { Smartphone, Shield, ArrowRight, ArrowLeft, RotateCcw, CheckCircle } from 'lucide-react';
import { useFirebaseOTPAuth } from './hooks/useFirebaseOTPAuth';

/**
 * Complete Firebase OTP Login Component
 * Handles phone input, OTP sending, verification, and Firebase authentication
 */
const FirebaseOTPLogin = ({ onSuccess, onError, options = {} }) => {
  const {
    redirectToRegistration = '/register',
    redirectToHome = '/'
  } = options;

  // Use Firebase OTP authentication hook
  const {
    loading,
    error,
    message,
    step,
    sendOTP,
    authenticateWithOTP,
    resendOTP,
    getSessionInfo,
    clearSession,
    clearMessages,
    resetToPhoneStep
  } = useFirebaseOTPAuth({
    onSuccess,
    onError,
    redirectToRegistration,
    redirectToHome
  });

  // Local component state
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
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
    const session = getSessionInfo();
    if (session.hasActiveSession) {
      setSessionInfo(session);
      setPhoneNumber(session.phoneNumber?.replace(/^\+91/, '') || '');
    }
  }, [getSessionInfo]);

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
      handleAuthenticateOTP(newOtp.join(''));
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
      return;
    }

    if (phoneNumber.length !== 10) {
      return;
    }

    const result = await sendOTP(phoneNumber);

    if (result.success) {
      setSessionInfo({ sessionId: result.sessionId, phoneNumber: result.phoneNumber });
      setCountdown(60); // 60 second countdown for resend

      // Focus first OTP input
      setTimeout(() => {
        const firstInput = document.getElementById('otp-0');
        if (firstInput) firstInput.focus();
      }, 100);
    }
  };

  /**
   * Complete authentication with OTP
   */
  const handleAuthenticateOTP = async (otpCode = otp.join('')) => {
    if (otpCode.length !== 6) {
      return;
    }

    const formattedPhone = `+91${phoneNumber}`;
    const result = await authenticateWithOTP(formattedPhone, otpCode);

    if (!result.success) {
      // Clear OTP inputs on error
      setOtp(['', '', '', '', '', '']);
      setTimeout(() => {
        const firstInput = document.getElementById('otp-0');
        if (firstInput) firstInput.focus();
      }, 100);
    }
  };

  /**
   * Handle resend OTP
   */
  const handleResendOTP = async () => {
    if (countdown > 0) return;

    const result = await resendOTP();

    if (result.success) {
      setCountdown(60);
      setOtp(['', '', '', '', '', '']); // Clear previous OTP
    }
  };

  /**
   * Go back to phone input
   */
  const handleBack = () => {
    resetToPhoneStep();
    setOtp(['', '', '', '', '', '']);
    setCountdown(0);
    // Don't clear session data in case user wants to continue
  };

  /**
   * Start over (clear everything)
   */
  const handleStartOver = () => {
    clearSession();
    setPhoneNumber('');
    setOtp(['', '', '', '', '', '']);
    setCountdown(0);
    setSessionInfo(null);
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
        <h1 className=\"text-3xl font-bold text-gray-900 mb-2\">Welcome to SkillBench</h1>
        <p className=\"text-gray-600\">Enter your phone number to get started</p>
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

      <form onSubmit={(e) => { e.preventDefault(); handleAuthenticateOTP(); }} className=\"space-y-6\">
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
            'Verify & Continue'
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

  /**
   * Render processing step
   */
  const renderProcessingStep = () => (
    <div className=\"w-full max-w-md space-y-6 text-center\">
      <div className=\"w-20 h-20 bg-gradient-to-br from-green-500 to-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl\">
        <CheckCircle className=\"w-10 h-10 text-white\" />
      </div>
      <h1 className=\"text-3xl font-bold text-gray-900 mb-2\">Verifying...</h1>
      <p className=\"text-gray-600 mb-6\">Please wait while we verify your account</p>
      <div className=\"w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto\" />
    </div>
  );

  /**
   * Render current step
   */
  const renderCurrentStep = () => {
    switch (step) {
      case 'phone':
        return renderPhoneStep();
      case 'otp':
        return renderOTPStep();
      case 'processing':
        return renderProcessingStep();
      default:
        return renderPhoneStep();
    }
  };

  return (
    <div className=\"min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4\">
      <div className=\"w-full max-w-md\">
        <div className=\"bg-white rounded-3xl shadow-xl p-8 border border-gray-100\">
          {renderCurrentStep()}

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
            <p>Loading: {loading.toString()}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FirebaseOTPLogin;