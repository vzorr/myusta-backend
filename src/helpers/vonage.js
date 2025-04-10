// helpers/sendOtp.js
const { Vonage } = require('@vonage/server-sdk');
const { VONAGE } = require('../config/index');

const vonage = new Vonage({
  apiKey: VONAGE.API_KEY,
  apiSecret: VONAGE.API_SECRET,
});

const sendOtpviaSms = async (toNumber, otpCode) => {
  const from = VONAGE.FROM;
  const text = `Your OTP code is: ${otpCode}`;

  try {
    const response = await vonage.sms.send({ to: toNumber, from, text });
    console.log('OTP sent successfully:', response);
    return response;
  } catch (error) {
    console.error('Failed to send OTP:', error);
    throw error;
  }
};

module.exports = {
  sendOtpviaSms
};
