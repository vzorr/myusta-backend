const { User, ProfessionalDetail, Location, Availability, Portfolio } = require('../models');
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
      notificationViaSms,
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
      notificationViaSms,
      notificationViaApp,
      termsAndConditions,
      status: "active",
    });

    // Remove existing locations for the user
    await Location.destroy({ where: { userId, whoseLocation: "customer" } });

    // Create new locations
    if (location && location.length > 0) {
      await Promise.all(
        location.map(async (loc) => {
          await Location.create({
            userId,
            whoseLocation: "customer",
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
      notificationViaSms,
      notificationViaApp,
      termsAndConditions,
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
      notificationViaSms,
      notificationViaApp,
      termsAndConditions,
    } = data;

    if (!termsAndConditions) {
      return { success: false, message: 'Terms and conditions must be accepted' };
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return { success: false, message: 'User not found', errors: ['User not found'] };
    }

    let hashedPassword = user.password;
    if (basicInfo.password) {
      hashedPassword = await bcrypt.hash(basicInfo.password, 10);
    }

    await user.update({
      firstName: basicInfo.firstName,
      lastName: basicInfo.lastName,
      phone: basicInfo.phoneNumber,
      password: hashedPassword,
      profilePicture: basicInfo.profilePicture,
      notificationViaEmail,
      notificationViaSms,
      notificationViaApp,
      status: 'active',
    });

    let professional = await ProfessionalDetail.findOne({ where: { userId } });
    if (professional) {
      await professional.update({
        nipt: professionalDetail.nipt,
        experiences: professionalDetail.experiences,
      });
    } else {
      await ProfessionalDetail.create({
        userId,
        nipt: professionalDetail.nipt,
        experiences: professionalDetail.experiences,
      });
    }

    if (Array.isArray(professionalDetail.portfolio)) {
      await Portfolio.destroy({ where: { userId } });
      for (const item of professionalDetail.portfolio) {
        await Portfolio.create({
          userId,
          title: item.title,
          description: item.description,
          category: item.category,
          media: item.media || [],
        });
      }
    }

    // ✅ Upsert Location (create if not exist, else update)
    const locationPayload = availability.location;
    let location = await Location.findOne({ where: { userId } });

    if (location) {
      await location.update({
        whoseLocation: 'usta',
        latitude: locationPayload.latitude,
        longitude: locationPayload.longitude,
        address: locationPayload.address || null,
        maxDistance: availability.maxDistance,
      });
    } else {
      location = await Location.create({
        userId,
        latitude: locationPayload.latitude,
        longitude: locationPayload.longitude,
        address: locationPayload.address || null,
        whoseLocation: 'usta',
        maxDistance: availability.maxDistance,
      });
    }

    // ✅ Upsert Availability
    let existingAvailability = await Availability.findOne({ where: { userId } });

    const availabilityData = {
      userId,
      locationId: location.id,
      budgetAmount: availability.budgetAmount,
      preferredJobTypes: availability.preferredJobTypes,
    };

    if (existingAvailability) {
      await existingAvailability.update(availabilityData);
    } else {
      await Availability.create(availabilityData);
    }

    return {
      success: true,
      message: 'Usta account created/updated successfully',
      data: {
        userId,
        basicInfo,
        professionalDetail,
        availability,
        notificationViaEmail,
        notificationViaSms,
        notificationViaApp,
        termsAndConditions,
      },
    };
  } catch (error) {
    logError(`Error in usta account creation/update: ${error.message}`);
    return {
      success: false,
      message: 'Failed to create/update usta account',
      errors: [error.message],
    };
  }
};

exports.getUstaProfile = async (currentCustmerId, ustaId) => {
  try {

    const usta = await User.findOne({
      where: { id: ustaId },
      include: [
        {
          model: ProfessionalDetail,
          as: 'professionalDetail'
        },
        {
          model: Portfolio,
          as: 'portfolios'
        }
      ],
    })
    if (!usta) {
      return {
        success: false,
        message: 'Usta not found'
      }
    }

    return {
      success: true,
      message: 'Usta profile fetched successfully',
      data: {
        id: usta.id,
        firstName: usta.firstName,
        lastName: usta.lastName,
        phone: usta.phone,
        profilePicture: usta.profilePicture,
        professionalDetail: usta.professionalDetail ? {
          id: usta.professionalDetail.id,
          nipt: usta.professionalDetail.nipt,
          experiences: usta.professionalDetail.experiences,
        } : {},
        portfolios: usta.portfolios ? usta.portfolios.map(item => {
          return {
            id: item.id,
            title: item.title,
            description: item.description,
            category: item.category,
            media: item.media
          }
        }) : [],

      }
    };
  }
  catch (error) {
    logError(`Error in fetching usta profile: ${error.message}`);
    return {
      success: false,
      message: 'Failed to fetch usta profile',
      errors: [error.message],
    };
  }
};
exports.getCustomerProfile = async (userId, customerId) => {
  try {
    const customer = await User.findOne({
      where: { id: customerId, role: 'customer' },
      include: [
        {
          model: Location,
          as: 'locations',
          where: { whoseLocation: 'customer' },
        }
      ],
    });

    if (!customer) {
      return {
        success: false,
        message: 'Customer not found',
      };
    }

    return {
      success: true,
      message: 'Customer profile fetched successfully',
      data: {
        id: customer.id,
        firstName: customer.firstName,
        lastName: customer.lastName,
        phone: customer.phone,
        profilePicture: customer.profilePicture,
        locations: customer.locations ? customer.locations.map(item => {
          return {
            id: item.id,
            latitude: item.latitude,
            longitude: item.longitude,
            address: item.address,
            maxDistance: item.maxDistance,
          };
        }
        ) : [],

      }
    };

  } catch (error) {
    logError(`Error in fetching customer profile: ${error.message}`);
    return {
      success: false,
      message: 'Failed to fetch customer profile',
      errors: [error.message],
    };
  }
};

