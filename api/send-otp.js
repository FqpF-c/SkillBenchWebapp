// Vercel Serverless Function for sending OTP
// File: api/send-otp.js

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        error: 'Phone number is required'
      });
    }

    // Validate phone number
    const cleanPhone = phone.replace(/\D/g, '');
    if (!/^\d{10}$/.test(cleanPhone)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid phone number format. Please enter a valid 10-digit number.'
      });
    }

    // Get API key from environment
    const apiKey = process.env.TWOFACTOR_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        error: 'Service configuration error'
      });
    }

    // Call 2Factor.in API
    const url = `https://2factor.in/API/V1/${apiKey}/SMS/+91${cleanPhone}/AUTOGEN/OTP1`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.Status === 'Success') {
      return res.status(200).json({
        success: true,
        sessionId: data.Details,
        message: 'OTP sent successfully to your phone number.',
        phone: `+91${cleanPhone}`
      });
    } else {
      return res.status(400).json({
        success: false,
        error: parseErrorMessage(data.Details)
      });
    }

  } catch (error) {
    console.error('Error sending OTP:', error);
    return res.status(500).json({
      success: false,
      error: 'An unexpected error occurred. Please try again.'
    });
  }
}

function parseErrorMessage(errorMessage) {
  if (!errorMessage) return 'Failed to send OTP';

  const error = errorMessage.toLowerCase();

  if (error.includes('invalid number') || error.includes('invalid mobile')) {
    return 'Invalid phone number format. Please check and try again.';
  }
  if (error.includes('dnd') || error.includes('do not disturb')) {
    return 'Your number is on DND. Please disable DND or try with a different number.';
  }
  if (error.includes('rate limit') || error.includes('too many requests')) {
    return 'Too many requests. Please wait a few minutes before trying again.';
  }
  if (error.includes('insufficient balance') || error.includes('low balance')) {
    return 'Service temporarily unavailable. Please try again later.';
  }

  return errorMessage;
}