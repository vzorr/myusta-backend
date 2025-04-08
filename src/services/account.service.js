const { User, ProfessionalDetail, Portfolio, Location } = require('../models');
const bcrypt = require("bcrypt");
const { logError } = require('../utils/logger');
const { uploadImage } = require("../utils/imageUtils");

exports.customerAccountCreation = async (userId, data) => {
  try {
    const {
      basicInfo,
      location,
      customerPreferences,
      notificationViaEmail,
      notificationViaSMS,
      notificationViaApp,
      termsAndConditions,
    } = data;

    if (!termsAndConditions) {
      return {
        success: false,
        message: "Terms and conditions must be accepted",
      };
    }

    // Find the existing user by ID
    const user = await User.findByPk(userId);
    if (!user) {
      return {
        success: false,
        message: "User not found",
        errors: ["User not found"],
        code: 404,
      };
    }

    // Hash the password if provided
    let hashedPassword;
    if (basicInfo.password) {
      hashedPassword = await bcrypt.hash(basicInfo.password, 10);
    }

    // Update user details
    await user.update({
      firstName: basicInfo.firstName,
      lastName: basicInfo.lastName,
      phone: basicInfo.phoneNumber,
      password: hashedPassword || user.password,
      profilePicture: basicInfo.profilePicture,
      customerPreferences: customerPreferences,
      notificationViaEmail,
      notificationViaSMS,
      notificationViaApp,
    });

    // Remove existing locations for the user
    await Location.destroy({ where: { userId } });

    // Create new locations
    if (location && location.length > 0) {
      await Promise.all(
        location.map(async (loc) => {
          await Location.create({
            userId,
            latitude: loc.latitude,
            longitude: loc.longitude,
            address: loc.address,
          });
        })
      );
    }

    // Prepare the response
    const responseData = {
      basicInfo: {
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phone,
        profilePicture: user.profilePicture,
      },
      location,
      customerPreferences,
      notificationViaEmail,
      notificationViaSMS,
      notificationViaApp,
    };

    return {
      success: true,
      message: "Customer account created successfully",
      data: responseData,
    };
  } catch (error) {
    logError(`Error in customer account creation/update: ${error.message}`);
    return {
      success: false,
      message: "Failed to create customer account",
      errors: [error.message],
    };
  }
};

exports.ustaAccountCreation = async (userId, data) => {
  try {
    const {
      basicInfo,
      professionalDetail,
      availability,
      notificationViaEmail,
      notificationViaSMS,
      notificationViaApp,
      termsAndConditions,
    } = data;

    if (!termsAndConditions) {
      return { success: false, message: 'Terms and conditions must be accepted' };
    }

    // Find the existing user by ID
    const user = await User.findByPk(userId);
    if (!user) {
      return { success: false, message: 'User not found', errors: ['User not found'] };
    }

    // Hash the password if provided
    let hashedPassword;
    if (basicInfo.password) {
      hashedPassword = await bcrypt.hash(basicInfo.password, 10);
    }

    // Update user details
    await user.update({
      firstName: basicInfo.firstName,
      lastName: basicInfo.lastName,
      phone: basicInfo.phoneNumber,
      password: hashedPassword || user.password,
      profilePicture: basicInfo.profilePicture,
      notificationViaEmail,
      notificationViaSMS,
      notificationViaApp,
    });

    // Update Professional Details
    await ProfessionalDetail.upsert({
      userId,
      nipt: professionalDetail.nipt,
      experiences: professionalDetail.experiences,
      portfolio: professionalDetail.portfolio,
    });

    // Update Location and Availability
    await Location.destroy({ where: { userId } });
    await Location.create({
      userId,
      latitude: availability.locations.latitude,
      longitude: availability.locations.longitude,
      address: availability.locations.address,
    });

    // Prepare the response
    const responseData = {
      basicInfo,
      professionalDetail,
      availability,
      notificationViaEmail,
      notificationViaSMS,
      notificationViaApp,
    };

    return { success: true, message: 'Usta account created/updated successfully', data: responseData };
  } catch (error) {
    logError(`Error in usta account creation/update: ${error.message}`);
    return { success: false, message: 'Failed to create/update usta account', errors: [error.message] };
  }
};
