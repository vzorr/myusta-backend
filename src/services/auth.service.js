const bcrypt = require('bcrypt');
const { User, Verification } = require('../models');
const { generateOTP, getExpiryTime } = require('../utils/common');
const { generateToken } = require('../helpers/jwt');
const { logError, logger } = require('../utils/logger');



exports.login = async (email, password) => {
  try {
    // Find the user by email
    const user = await User.findOne({ where: { email } });

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


exports.signup = async ({ identifier, signupMethod }) => {
  try {
    let user = await User.findOne({ where: { [signupMethod]: identifier } });

    if (user) {
      const isVerified = signupMethod === 'email' ? user.emailVerified : user.phoneVerified;
      if (isVerified) {
        return {
          success: false,
          message: `This ${signupMethod} is already registered and verified.`,
          errors: [`${signupMethod} already exists`],
        };
      }
    }

    if (!user) {
      user = await User.create({
        [signupMethod]: identifier,
        authProvider: signupMethod,
        role: 'customer',
      });
    }

    // Generate JWT token
    const token = generateToken({ id: user.id  });

    const otp = generateOTP();
    const expiresAt = getExpiryTime();

    await Verification.upsert({
      userId: user.id,
      code: otp,
      type: signupMethod,
      expiresAt,
    });

    return {
      success: true,
      message: 'Sign-up successful. OTP sent.',
      data: { userId: user.id, otp, token },
    };
  } catch (error) {
    return { success: false, message: 'Sign-up failed.', errors: [error.message] };
  }
};

exports.signupResend = async (currentUser) => {
  try {
    const { id: userId, authProvider, emailVerified, phoneVerified } = currentUser;

    // Check verification status based on type
    const isVerified = authProvider === 'email' ? emailVerified : phoneVerified;
    if (isVerified) {
      return { success: false, message: `User already verified with ${authProvider}`, errors: [], code: 409 };
    }

    // Find existing OTP
    const verification = await Verification.findOne({ where: { userId, type: authProvider } });

    if (verification) {

      // Update OTP and expiry time
      const newOtp = generateOTP();
      const newExpiryTime = getExpiryTime();

      verification.code = newOtp;
      verification.expiresAt = newExpiryTime;
      await verification.save();

      return { success: true, message: 'OTP resent successfully', data: { otp: newOtp } };
    }

    // If no existing OTP, create a new one
    const otp = generateOTP();
    const expiresAt = getExpiryTime();

    await Verification.create({ userId, code: otp, type, expiresAt });

    return { success: true, message: 'OTP generated and sent successfully', data: { otp } };
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

exports.forgotPassword = async (email) => {
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return { success: false, message: 'Email not found', errors: [], code: 404 };

    const code = generateOTP();
    const expiresAt = getExpiryTime();

    await Verification.upsert({ userId: user.id, code, type: 'email', expiresAt });

    // await sendEmail(email, 'Password Reset OTP', `Your OTP: ${otp}`);

    return { success: true, message: 'Code sent to your email', data: { code }, code: 200 };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

exports.verifyForgotOTP = async (email, code) => {
  try {
    const user = await User.findOne({ where: { email } });

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

exports.resendForgotOTP = async (email) => {
  return this.forgotPassword(email);
};

exports.resetPassword = async (email, code, newPassword) => {
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return { success: false, message: 'Email not found', errors: [], code: 404 };

    const verification = await Verification.findOne({ where: { userId: user.id, code } });

    if (!verification || new Date() > verification.expiresAt) {
      return { success: false, message: 'Invalid or expired OTP' };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.update({ password: hashedPassword }, { where: { id: user.id } });

    return { success: true, message: 'Password reset successfully' };
  } catch (error) {
    return { success: false, message: error.message };
  }
};
