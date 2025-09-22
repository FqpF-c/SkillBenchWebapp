# 🚀 Complete OTP Authentication Implementation Guide

This guide provides a complete OTP authentication system for your Vite React app using 2Factor.in API with proper backend/frontend separation to avoid CORS issues.

## 📁 Project Structure

```
skillbench-webapp/
├── backend-example/                     # Node.js + Express backend
│   ├── services/
│   │   └── OTPService.js               # 2Factor.in API integration
│   ├── routes/
│   │   └── otp.js                      # OTP API endpoints
│   ├── middleware/
│   │   └── errorHandler.js             # Error handling
│   ├── server.js                       # Express server setup
│   ├── package.json                    # Dependencies
│   ├── .env.example                    # Environment variables
│   └── README.md                       # Backend documentation
├── src/
│   ├── services/
│   │   ├── OTPService.clean.js         # Frontend OTP service
│   │   └── FirebaseOTPService.js       # Firebase integration
│   ├── components/auth/
│   │   ├── OTPLogin.jsx                # Basic OTP UI component
│   │   ├── FirebaseOTPLogin.jsx        # Complete Firebase OTP component
│   │   └── hooks/
│   │       ├── useOTPAuth.js           # OTP authentication hook
│   │       └── useFirebaseOTPAuth.js   # Firebase OTP authentication hook
│   └── pages/
│       ├── LoginExample.jsx            # Basic usage example
│       └── LoginFirebaseExample.jsx    # Firebase usage example
└── IMPLEMENTATION_GUIDE.md             # This guide
```

## 🔧 Backend Setup

### 1. Install Backend Dependencies

```bash
cd backend-example
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:
```env
TWOFACTOR_API_KEY=your-2factor-api-key-here
PORT=3001
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### 3. Start Backend Server

```bash
# Development
npm run dev

# Production
npm start
```

### 4. Test Backend Endpoints

```bash
# Health check
curl http://localhost:3001/health

# Get API key
curl http://localhost:3001/otpget

# Send OTP
curl -X POST http://localhost:3001/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone":"9876543210"}'

# Verify OTP
curl -X POST http://localhost:3001/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"session-id-here","otp":"123456"}'
```

## 🎨 Frontend Integration

### 1. Update Environment Variables

Remove test mode and configure backend URL in your React app `.env`:

```env
# Backend configuration
VITE_BACKEND_URL=http://localhost:3001

# Remove test mode
# VITE_FORCE_TEST_MODE=true
```

### 2. Basic OTP Implementation

Use the basic OTP service for simple phone verification:

```jsx
import React from 'react';
import OTPLogin from '../components/auth/OTPLogin';

const LoginPage = () => {
  const handleSuccess = (result) => {
    console.log('OTP verified:', result);
    // Handle successful verification
  };

  const handleError = (error) => {
    console.error('OTP error:', error);
    // Handle errors
  };

  return (
    <OTPLogin
      onSuccess={handleSuccess}
      onError={handleError}
    />
  );
};
```

### 3. Complete Firebase Integration

Use the Firebase OTP service for complete authentication:

```jsx
import React from 'react';
import FirebaseOTPLogin from '../components/auth/FirebaseOTPLogin';

const LoginPage = () => {
  const handleSuccess = (result) => {
    if (result.userExists) {
      // Existing user signed in
      console.log('User signed in:', result.firebaseUser);
    } else {
      // New user created
      console.log('New user created:', result.firebaseUser);
    }
  };

  const handleError = (error, step) => {
    console.error(`Error at ${step}:`, error);
  };

  return (
    <FirebaseOTPLogin
      onSuccess={handleSuccess}
      onError={handleError}
      options={{
        redirectToRegistration: '/complete-profile',
        redirectToHome: '/dashboard'
      }}
    />
  );
};
```

### 4. Using Hooks for Custom UI

Create your own UI using the authentication hooks:

```jsx
import React, { useState } from 'react';
import { useFirebaseOTPAuth } from '../components/auth/hooks/useFirebaseOTPAuth';

const CustomLoginForm = () => {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');

  const {
    loading,
    error,
    message,
    step,
    sendOTP,
    authenticateWithOTP
  } = useFirebaseOTPAuth();

  const handleSendOTP = async () => {
    await sendOTP(phone);
  };

  const handleVerifyOTP = async () => {
    await authenticateWithOTP(`+91${phone}`, otp);
  };

  return (
    <div>
      {step === 'phone' && (
        <div>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Enter phone number"
          />
          <button onClick={handleSendOTP} disabled={loading}>
            Send OTP
          </button>
        </div>
      )}

      {step === 'otp' && (
        <div>
          <input
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter OTP"
          />
          <button onClick={handleVerifyOTP} disabled={loading}>
            Verify OTP
          </button>
        </div>
      )}

      {error && <p style={{color: 'red'}}>{error}</p>}
      {message && <p style={{color: 'green'}}>{message}</p>}
    </div>
  );
};
```

## 🔥 Firebase Integration Details

### Firestore Structure

The system uses this Firestore structure (matching your Flutter app):

```
skillbench/
├── phone_to_uid/
│   └── mappings/
│       └── {phone_number}/          # e.g., "+919876543210"
│           ├── uid: "firebase_uid"
│           ├── phoneNumber: "+919876543210"
│           ├── createdAt: timestamp
│           └── lastUpdated: timestamp
└── users/
    └── users/
        └── {firebase_uid}/          # User profile data
            ├── phoneNumber: "+919876543210"
            ├── username: "user_name"
            ├── college: "college_name"
            └── currentFirebaseUid: "firebase_uid"
```

### Authentication Flow

1. **Phone Input** → User enters phone number
2. **Send OTP** → Backend calls 2Factor.in API
3. **OTP Verification** → Backend verifies OTP with 2Factor.in
4. **User Lookup** → Check Firestore for existing phone-to-UID mapping
5. **Firebase Auth**:
   - **Existing user**: Sign in with `{phone}@skillbench.temp` / `temp_{phone}`
   - **New user**: Create Firebase account and phone-to-UID mapping
6. **Redirect**:
   - **Existing user**: Redirect to home/dashboard
   - **New user**: Redirect to registration/profile completion

## 🛡️ Security Features

### Backend Security
- **CORS protection** with configurable origins
- **Helmet.js** security headers
- **Input validation** and sanitization
- **Error message sanitization** (no sensitive data exposure)
- **Rate limiting** (built into 2Factor.in API)

### Frontend Security
- **No API keys exposed** in frontend code
- **Session management** with localStorage
- **Input validation** for phone numbers and OTP codes
- **Automatic session cleanup** on verification success/failure

## 🧪 Testing

### Backend Testing
```bash
# Install backend dependencies
cd backend-example && npm install

# Start backend server
npm run dev

# Test endpoints manually or with automated tests
```

### Frontend Testing
```bash
# Remove test mode from .env
# VITE_FORCE_TEST_MODE=true

# Start frontend
npm run dev

# Test with real phone numbers and OTP codes
```

### Test Phone Numbers
- **Real testing**: Use your actual phone number
- **2Factor.in test numbers**: Check 2Factor.in documentation for test numbers

## 🚀 Deployment

### Backend Deployment
1. Deploy to your preferred platform (Railway, Render, Vercel, etc.)
2. Set environment variables:
   ```
   TWOFACTOR_API_KEY=your-api-key
   PORT=3001
   ALLOWED_ORIGINS=https://your-frontend-domain.com
   ```
3. Update frontend `VITE_BACKEND_URL` to point to deployed backend

### Frontend Deployment
1. Update `.env` with production backend URL:
   ```env
   VITE_BACKEND_URL=https://your-backend-domain.com
   ```
2. Deploy to your preferred platform (Vercel, Netlify, etc.)

## 🔄 Migration from Test Mode

If you're currently using test mode, follow these steps:

1. **Setup Backend**: Follow backend setup instructions above
2. **Update Frontend**: Remove `VITE_FORCE_TEST_MODE=true` from `.env`
3. **Configure Backend URL**: Set `VITE_BACKEND_URL` in `.env`
4. **Test Integration**: Verify OTP flow works with real phone numbers
5. **Deploy**: Deploy both backend and frontend

## 📝 API Reference

### Backend Endpoints

#### GET /health
Health check endpoint.

#### GET /otpget
Returns 2Factor.in API key (legacy compatibility).

#### POST /send-otp
Send OTP to phone number.
```json
// Request
{
  "phone": "9876543210"
}

// Response
{
  "success": true,
  "sessionId": "session-id",
  "message": "OTP sent successfully",
  "phone": "+919876543210"
}
```

#### POST /verify-otp
Verify OTP code.
```json
// Request
{
  "sessionId": "session-id",
  "otp": "123456"
}

// Response
{
  "success": true,
  "message": "OTP verified successfully"
}
```

### Frontend Services

#### OTPService.clean.js
Basic OTP operations without Firebase integration.

Methods:
- `sendOTP(phoneNumber)` - Send OTP
- `verifyOTP(otp, sessionId)` - Verify OTP
- `resendOTP()` - Resend OTP
- `getSessionInfo()` - Get session data
- `clearSessionId()` - Clear session

#### FirebaseOTPService.js
Complete OTP + Firebase authentication.

Methods:
- `sendOTP(phoneNumber)` - Send OTP
- `authenticateWithOTP(phoneNumber, otp)` - Complete auth flow
- `getUidByPhoneNumber(phoneNumber)` - Check existing user
- `signOut()` - Sign out user

## 🤝 Support

If you encounter issues:

1. **Check logs**: Backend logs show detailed error information
2. **Verify configuration**: Ensure all environment variables are set
3. **Test endpoints**: Use curl or Postman to test backend directly
4. **Check CORS**: Ensure frontend URL is in `ALLOWED_ORIGINS`
5. **Verify 2Factor.in**: Check your 2Factor.in account balance and API key

## 🎯 Best Practices

1. **Environment Variables**: Never commit API keys to version control
2. **Error Handling**: Always handle errors gracefully with user-friendly messages
3. **Validation**: Validate inputs on both frontend and backend
4. **Logging**: Log important events for debugging (without sensitive data)
5. **Session Management**: Clear sessions on sign-out and errors
6. **User Experience**: Provide clear feedback during the authentication flow

This implementation provides a production-ready OTP authentication system that mirrors your Flutter app architecture while avoiding CORS issues through proper backend/frontend separation.