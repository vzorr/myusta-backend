const bcrypt = require('bcrypt');
const { User, Verification } = require('../models');
const { generateOTP, getExpiryTime } = require('../utils/common');
const { generateToken } = require('../helpers/jwt');
const { sendOtpEmail } = require('../helpers/email.helpers');
const { sendOtpviaSms } = require('../helpers/vonage');
const { logError, logger } = require('../utils/logger');
const { OAuth2Client } = require('google-auth-library');

const { GOOGLE } = require('./../config/index');
const { STATUS } = require('../utils/constant');

const googleClient = new OAuth2Client( GOOGLE.CLIENT_ID );

exports.login = async (email, password, role) => {
  try {
    // Find the user by email
    const user = await User.findOne({ where: { email, role } });

    if (!user) {
      return { success: false, message: 'Invalid email or password', errors: ['User not found'] };
    }

    // Check if user is active
    if (user.status !== 'active') {
      return { success: false, message: 'User account is not active', errors: ['Account inactive'] };
    }

    // Verify the password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return { success: false, message: 'Invalid email or password', errors: ['Incorrect password'] };
    }

    // Generate JWT token
    const token = generateToken({ id: user.id, role: user.role });

    return {
      success: true,
      message: 'Login successful',
      data: {
        userId: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        token,
      },
    };
  } catch (error) {
    console.error('Error in login service:', error);
    return { success: false, message: error.message };
  }
};


exports.signup = async ({ identifier, signupMethod, role }) => {
  try {
    let user = await User.findOne({ where: { [signupMethod]: identifier, role } });

    const otp = generateOTP();
    const expiresAt = getExpiryTime();

    if (user) {
      const isVerified = signupMethod === 'email' ? user.emailVerified : user.phoneVerified;
      const token = generateToken({ id: user.id });

      if (isVerified) {
        return {
          success: true,
          message: 'User already verified',
          data: {
            userId: user.id,
            isVerified,
            email: user.email,
            phone: user.phone,
            status: user.status,
            role: user.role,
            token,
          },
        };
      }
    }

    if (!user) {
      user = await User.create({
        [signupMethod]: identifier,
        authProvider: signupMethod,
        role: role,
      });
    }

    // Token generate karo yahan, jab sure ho ke user exist karta hai
    const token = generateToken({ id: user.id });

    await Verification.upsert({
      userId: user.id,
      code: otp,
      type: signupMethod,
      expiresAt,
    });

    // Send OTP to the user email or phone
    if (signupMethod === 'email') {
      await sendOtpEmail(identifier, otp);
    } else if (signupMethod === 'phone') {
      await sendOtpviaSms(identifier, otp);

    }

    return {
      success: true,
      message: 'Sign-up successful. OTP sent.',
      data: {
        userId: user.id,
        isVerified: false,
        email: user.email,
        phone: user.phone,
        status: user.status,
        role: user.role,
        token,
      },
    };
  } catch (error) {
    logError(error);
    return { success: false, message: 'Sign-up failed.', errors: [error.message] };
  }
};

exports.googleSignup = async ({ identifier, signupMethod, role }) => {
  try {
    // Check if Google client is initialized
    if (!googleClient) {
      throw new Error('Google client is not initialized');
    }

    // Verify the Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: identifier,
      audience: GOOGLE.CLIENT_ID,
    });

    // Extract payload from the verified ticket
    const payload = ticket.getPayload();
    if (!payload) {
      throw new Error('Invalid Google token payload');
    }

    const { email, sub: googleId } = payload;

    if (!email) {
      throw new Error('Google account does not have an email');
    }

    // Check if the user already exists
    let user = await User.findOne({ where: { email, role } });
    if (!user) {
      user = await User.create({
        email,
        googleId,
        authProvider: signupMethod,
        role: role,
        emailVerified: true,
        status: STATUS.INPROGRESS,
      });
    }

    // Generate JWT token including user ID and role
    const token = generateToken({ id: user.id, role: user.role });

    return {
      success: true,
      message: 'Sign-up successful.',
      data: {
        userId: user.id,
        isVerified: true,
        email: user.email,
        phone: user.phone,
        status: user.status,
        role: user.role,
        token,
      },
    };
  } catch (error) {
    logError(`Error in googleSignup: ${error.message}`);
    return { success: false, message: 'Google sign-up failed.', errors: [error.message] };
  }
};


exports.signupResend = async (currentUser) => {
  try {
    const { id: userId, email, authProvider, emailVerified, phoneVerified } = currentUser;

    // Update OTP and expiry time
    const code = generateOTP();
    const newExpiryTime = getExpiryTime();

    // Check verification status based on type
    const isVerified = authProvider === 'email' ? emailVerified : phoneVerified;
    if (isVerified) {
      return { 
        success: true,
        message: 'User already verified',
        data: {
          userId,
          isVerified,
          email,
          phone: currentUser.phone,
          status: currentUser.status,
          role: currentUser.role,
        },
       };
    }

    // Find existing OTP
    const verification = await Verification.findOne({ where: { userId, type: authProvider } });

    if (verification) {

      verification.code = code;
      verification.expiresAt = newExpiryTime;
      await verification.save();

      // Send OTP to the user email or phone
      if (authProvider === 'email') {
        sendOtpEmail(email, code);
      } else if (authProvider === 'phone') {
        // Implement SMS sending logic here
      }

      return { success: true, message: 'OTP resent successfully', data: { code } };
    }

    await Verification.create({ userId, code, type, expiresAt });

    // Send OTP to the user email or phone
    if (authProvider === 'email') {
      await sendOtpEmail(email, otp);
    } else if (authProvider === 'phone') {
      // Implement SMS sending logic here
    }

    return { success: true, message: 'Code generated and sent successfully', data: { code } };
  } catch (error) {
    console.error('Error in signupResend service:', error);
    return { success: false, message: error.message };
  }
};

exports.signupVerify = async (data) => {
  try {

    const { userId, code, authProvider } = data;

    // Find the OTP record associated with the user
    const verification = await Verification.findOne({ where: { userId, code } });

    if (!verification || new Date() > verification.expiresAt) {
      return { success: false, message: 'Invalid or expired OTP', errors: [], code: 401 };
    }

    // Update user verification status
    const updateData = { status: 'inprogress' };
    if (authProvider === 'email') {
      updateData.emailVerified = true;
    } else if (authProvider === 'phone') {
      updateData.phoneVerified = true;
    }

    await User.update(updateData, { where: { id: userId } });

    // Remove the OTP record after successful verification
    await verification.destroy();

    // Fetch updated user details
    const user = await User.findByPk(userId);

    return {
      success: true,
      message: 'User verified successfully',
      data: {
        userId: user.id,
        email: user.email,
        phone: user.phone,
        status: user.status,
      },
    };
  } catch (error) {
    logError(error);
    return { success: false, message: error.message };
  }
};


exports.verifyOTP = async (userId, otp, type) => {
  try {
    const verification = await Verification.findOne({ where: { userId, type, code: otp } });

    if (!verification || new Date() > verification.expiresAt) {
      return { success: false, message: 'Invalid or expired OTP' };
    }

    await verification.destroy();
    await User.update({ [`${type}Verified`]: true }, { where: { id: userId } });

    return { success: true, data: { verified: true } };
  } catch (error) {
    return { success: false, message: error.message };
  }
};


exports.selectRole = async (userId, role) => {
  try {
    await User.update({ role }, { where: { id: userId } });
    return { success: true, data: { role } };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

exports.forgotPassword = async (email, role) => {
  try {
    const user = await User.findOne({ where: { email, role } });
    if (!user) return { success: false, message: 'Email not found', errors: [], code: 404 };

    if (!user.emailVerified) return { success: false, message: 'Email not verified', errors: [], code: 401 };

    // if (user.status !== 'active') return { success: false, message: 'User account is not active', errors: [], code: 401 };

    const code = generateOTP();
    const expiresAt = getExpiryTime();

    await Verification.upsert({ userId: user.id, code, type: 'email', expiresAt });

    sendOtpEmail(email, code);

    return { success: true, message: 'Code sent to your email', data: { code }, code: 200 };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

exports.verifyForgotOTP = async (email, code, role) => {
  try {
    const user = await User.findOne({ where: { email, role } });

    if (!user) return { success: false, message: 'Email not found', errors: [], code: 404 };

    const verification = await Verification.findOne({ where: { userId: user.id, code } });

    if (!verification || new Date() > verification.expiresAt) {
      return { success: false, message: 'Invalid or expired OTP' };
    }

    return { success: true, message: 'OTP verified successfully' };
  } catch (error) {
    logError(error);
    return { success: false, message: error.message };
  }
};

exports.resendForgotOTP = async (email, role) => {
  return this.forgotPassword(email, role);
};

exports.resetPassword = async (email, code, role, newPassword) => {
  try {
    const user = await User.findOne({ where: { email, role } });
    if (!user) return { success: false, message: 'Email not found', errors: [], code: 404 };

    const verification = await Verification.findOne({ where: { userId: user.id, code } });

    if (!verification || new Date() > verification.expiresAt) {
      return { success: false, message: 'Invalid or expired OTP' };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.update({ password: hashedPassword }, { where: { id: user.id } });

    await verification.destroy();

    return { success: true, message: 'Password reset successfully' };
  } catch (error) {
    return { success: false, message: error.message };
  }
}