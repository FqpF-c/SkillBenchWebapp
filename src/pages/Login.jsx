import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, ArrowRight, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Login = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('phone');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  const { sendOTP, verifyOTP, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    
    if (!phoneNumber.trim()) {
      toast.error('Please enter a phone number');
      return;
    }

    if (phoneNumber.length < 10) {
      toast.error('Please enter a valid phone number');
      return;
    }

    setLoading(true);
    
    try {
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
      const result = await sendOTP(formattedPhone);
      
      if (result.success) {
        setStep('otp');
        setCountdown(60);
        toast.success('OTP sent successfully!');
      } else {
        toast.error(result.error || 'Failed to send OTP');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    
    if (!otp.trim()) {
      toast.error('Please enter the OTP');
      return;
    }

    if (otp.length < 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    
    try {
      const result = await verifyOTP(otp);
      
      if (result.success) {
        if (result.userExists) {
          toast.success('Login successful!');
          navigate('/', { replace: true });
        } else {
          navigate('/register', { replace: true });
        }
      } else {
        toast.error(result.error || 'Invalid OTP');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;
    
    setLoading(true);
    try {
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
      const result = await sendOTP(formattedPhone);
      
      if (result.success) {
        setCountdown(60);
        toast.success('OTP resent successfully!');
      } else {
        toast.error(result.error || 'Failed to resend OTP');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderPhoneStep = () => (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Phone className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to SkillBench</h1>
        <p className="text-gray-600">Enter your phone number to get started</p>
      </div>

      <form onSubmit={handleSendOTP} className="space-y-6">
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 text-sm">+91</span>
            </div>
            <input
              id="phone"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
              className="block w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="9876543210"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || phoneNumber.length < 10}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              Send OTP
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="mt-8 text-center">
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
          <Shield className="w-4 h-4" />
          <span>Secure phone verification</span>
        </div>
      </div>
    </div>
  );

  const renderOTPStep = () => (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Verify OTP</h1>
        <p className="text-gray-600 mb-1">Enter the 6-digit code sent to</p>
        <p className="text-gray-900 font-medium">+91{phoneNumber}</p>
      </div>

      <form onSubmit={handleVerifyOTP} className="space-y-6">
        <div>
          <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
            OTP Code
          </label>
          <input
            id="otp"
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            className="block w-full px-4 py-3 text-center text-lg tracking-widest border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="123456"
            maxLength="6"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading || otp.length < 6}
          className="w-full bg-gradient-to-r from-green-500 to-blue-600 text-white py-3 px-4 rounded-xl font-medium hover:from-green-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              Verify OTP
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 text-center space-y-4">
        <button
          onClick={() => setStep('phone')}
          className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
        >
          Change phone number
        </button>
        
        <div>
          {countdown > 0 ? (
            <p className="text-gray-500 text-sm">
              Resend OTP in {countdown}s
            </p>
          ) : (
            <button
              onClick={handleResendOTP}
              disabled={loading}
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors disabled:opacity-50"
            >
              Resend OTP
            </button>
          )}
        </div>
      </div>

      <div className="mt-8 text-center">
        <p className="text-xs text-gray-500">
          For testing, use phone: +911234567890 and OTP: 123456
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div id="recaptcha-container"></div>
          {step === 'phone' ? renderPhoneStep() : renderOTPStep()}
        </div>
      </div>
    </div>
  );
};

export default Login;