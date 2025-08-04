// src/components/auth/LoginModal.jsx
import React, { useState } from 'react';
import { X, Phone, Shield } from 'lucide-react';
import { testAuthService } from '../../services/testAuthService';

const LoginModal = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState('phone'); // 'phone' or 'otp'
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const resetModal = () => {
    setStep('phone');
    setPhoneNumber('');
    setOtp('');
    setError('');
    setMessage('');
    setIsLoading(false);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const handleSendOTP = async () => {
    if (!phoneNumber.trim()) {
      setError('Please enter a phone number');
      return;
    }

    if (phoneNumber.replace(/\D/g, '').length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    setIsLoading(true);
    setError('');

    const fullPhoneNumber = phoneNumber.startsWith('+91') ? phoneNumber : `+91${phoneNumber.replace(/\D/g, '')}`;
    
    const result = await testAuthService.sendOTP(fullPhoneNumber);
    
    setIsLoading(false);

    if (result.success) {
      setMessage(result.message);
      setStep('otp');
    } else {
      setError(result.message);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp.trim() || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setIsLoading(true);
    setError('');

    const fullPhoneNumber = phoneNumber.startsWith('+91') ? phoneNumber : `+91${phoneNumber.replace(/\D/g, '')}`;
    
    const result = await testAuthService.verifyOTP(fullPhoneNumber, otp);
    
    setIsLoading(false);

    if (result.success) {
      setMessage('Login successful! Loading data...');
      setTimeout(() => {
        resetModal();
        onSuccess(result.user);
      }, 1500);
    } else {
      setError(result.message);
    }
  };

  const handleKeyPress = (e, action) => {
    if (e.key === 'Enter') {
      action();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 relative">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={24} />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
            {step === 'phone' ? (
              <Phone className="text-white" size={24} />
            ) : (
              <Shield className="text-white" size={24} />
            )}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {step === 'phone' ? 'Login to SkillBench' : 'Verify OTP'}
          </h2>
          <p className="text-gray-600">
            {step === 'phone' 
              ? 'Enter your phone number to continue' 
              : `OTP sent to ${phoneNumber}`
            }
          </p>
        </div>

        {/* Phone Number Step */}
        {step === 'phone' && (
          <div className="space-y-4">
            {/* Test Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>Test Mode:</strong> Use phone number <strong>1234567890</strong> for testing
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                  +91
                </span>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  onKeyPress={(e) => handleKeyPress(e, handleSendOTP)}
                  placeholder="1234567890"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                  disabled={isLoading}
                />
              </div>
            </div>

            {error && (
              <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3">
                {error}
              </div>
            )}

            {message && (
              <div className="text-green-600 text-sm bg-green-50 border border-green-200 rounded-lg p-3">
                {message}
              </div>
            )}

            <button
              onClick={handleSendOTP}
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </div>
        )}

        {/* OTP Verification Step */}
        {step === 'otp' && (
          <div className="space-y-4">
            {/* Test Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>Test OTP:</strong> Use <strong>123456</strong> to verify
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter OTP
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                onKeyPress={(e) => handleKeyPress(e, handleVerifyOTP)}
                placeholder="123456"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-center text-lg tracking-widest"
                disabled={isLoading}
                maxLength={6}
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3">
                {error}
              </div>
            )}

            {message && (
              <div className="text-green-600 text-sm bg-green-50 border border-green-200 rounded-lg p-3">
                {message}
              </div>
            )}

            <div className="flex space-x-3">
              <button
                onClick={() => setStep('phone')}
                disabled={isLoading}
                className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Back
              </button>
              <button
                onClick={handleVerifyOTP}
                disabled={isLoading}
                className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isLoading ? 'Verifying...' : 'Verify OTP'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginModal;