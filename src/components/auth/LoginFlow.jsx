import React, { useState } from 'react';
import PhoneInput from './PhoneInput';
import OTPVerification from './OTPVerification';
import Registration from './Registration';

const LoginFlow = ({ onLoginComplete }) => {
  const [currentStep, setCurrentStep] = useState('phone');
  const [phoneNumber, setPhoneNumber] = useState('');

  const handlePhoneContinue = (phone) => {
    setPhoneNumber(phone);
    setCurrentStep('otp');
  };

  const handleOTPVerified = (userExists) => {
    if (userExists) {
      onLoginComplete();
    } else {
      setCurrentStep('register');
    }
  };

  const handleRegistrationComplete = () => {
    onLoginComplete();
  };

  const handleBack = () => {
    if (currentStep === 'otp') {
      setCurrentStep('phone');
    }
  };

  if (currentStep === 'phone') {
    return <PhoneInput onContinue={handlePhoneContinue} />;
  }

  if (currentStep === 'otp') {
    return (
      <OTPVerification
        phoneNumber={phoneNumber}
        onVerified={handleOTPVerified}
        onBack={handleBack}
      />
    );
  }

  if (currentStep === 'register') {
    return <Registration onComplete={handleRegistrationComplete} />;
  }

  return null;
};

export default LoginFlow;