import React, { useState, useEffect } from 'react';
import { MessageSquare, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const OTPVerification = ({ phoneNumber, onVerified, onBack }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const { verifyOTP, sendOTP } = useAuth();

  useEffect(() => {
    let timer;
    if (timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [timeLeft]);

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }

    if (newOtp.every(digit => digit) && newOtp.join('').length === 6) {
      handleVerify(newOtp.join(''));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handleVerify = async (otpCode = otp.join('')) => {
    if (otpCode.length !== 6) {
      setError('Please enter the complete OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await verifyOTP(otpCode);
      
      if (result.success) {
        onVerified(result.userExists);
      } else {
        setError(result.error || 'Invalid OTP. Please try again.');
      }
    } catch (error) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setCanResend(false);
    setTimeLeft(30);
    setError('');
    
    try {
      await sendOTP(phoneNumber);
    } catch (error) {
      setError('Failed to resend OTP');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <button
            onClick={onBack}
            className="absolute top-8 left-8 p-3 rounded-full bg-white shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
            <MessageSquare className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Verify Phone Number</h1>
          <p className="text-gray-600">
            We sent a 6-digit code to <br />
            <span className="font-semibold text-gray-800">{phoneNumber}</span>
          </p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleVerify(); }} className="bg-white rounded-3xl shadow-xl p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
              Enter verification code
            </label>
            <div className="flex gap-3 justify-center">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  inputMode="numeric"
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-14 text-center text-xl font-bold border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  maxLength="1"
                />
              ))}
            </div>
            {error && (
              <p className="mt-4 text-sm text-red-600 text-center">{error}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || otp.join('').length !== 6}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 px-6 rounded-2xl font-semibold text-lg hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              'Verify OTP'
            )}
          </button>

          <div className="text-center space-y-3">
            {!canResend ? (
              <p className="text-sm text-gray-500">
                Resend code in {timeLeft}s
              </p>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                className="text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                Resend OTP
              </button>
            )}
          </div>
        </form>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Test OTP: <span className="font-mono bg-gray-100 px-2 py-1 rounded">123456</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;