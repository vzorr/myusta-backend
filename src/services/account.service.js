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
/*
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
        },
        {
          model: Location,
          as: 'locations'
        }
      ],
    });

    if (!usta) {
      return {
        success: false,
        message: 'Usta not found'
      };
    }

    return {
      success: true,
      message: 'Usta profile fetched successfully',
      data: {
        id: usta.id,
        firstName: usta.firstName,
        lastName: usta.lastName,
        email: usta.email,
        phone: usta.phone,
        profilePicture: usta.profilePicture,
        professionalDetail: usta.professionalDetail,
        portfolios: usta.portfolios,
        locations: usta.locations
          ? usta.locations.map(loc => ({
              id: loc.id,
              latitude: loc.latitude,
              longitude: loc.longitude,
              address: loc.address,
              maxDistance: loc.maxDistance,
              description: loc.description
            }))
          : []
      }
    };
  } catch (error) {
    logError(`Error in usta account creation/update: ${error.message}`);
    return {
      success: false,
      message: 'Failed to fetch usta profile',
      errors: [error.message],
    };
  }
};
*/

// Enhanced getUstaProfile for viewing other usta's profile
exports.getUstaProfile = async (currentUserId, ustaId) => {
  try {
    const usta = await User.findOne({
      where: { id: ustaId, role: 'usta', status: 'active' },
      include: [
        {
          model: ProfessionalDetail,
          as: 'professionalDetail'
        },
        {
          model: Portfolio,
          as: 'portfolios'
        },
        {
          model: Location,
          as: 'locations'
        },
        {
          model: Availability,
          as: 'availability',
          include: [{
            model: Location,
            as: 'location'
          }]
        }
      ]
    });

    if (!usta) {
      return {
        success: false,
        message: 'Usta not found',
        statusCode: 404
      };
    }

    // Calculate additional metrics
    const totalCompletedJobs = await Contract.count({
      where: { ustaId },
      include: [{
        model: Job,
        as: 'job',
        where: { status: 'completed' }
      }]
    });

    // Extract skills
    const skills = usta.professionalDetail?.experiences?.map(exp => {
      const categoryNames = {
        'plumber': 'Plumbing',
        'electrician': 'Electrical',
        'carpenter': 'Carpentry',
        'cleaner': 'Cleaning',
        'painter': 'Painting'
      };
      return categoryNames[exp.category] || exp.category;
    }) || [];

    // Calculate experience
    const experience = usta.professionalDetail?.experiences?.reduce((max, exp) => 
      Math.max(max, exp.yearsOfExp || 0), 0) || 0;

    // Increment view count if viewer is a customer
    const viewer = await User.findByPk(currentUserId);
    if (viewer && viewer.role === 'customer') {
      usta.totalViews = (usta.totalViews || 0) + 1;
      await usta.save();
    }

    return {
      success: true,
      message: 'Usta profile fetched successfully',
      data: {
        id: usta.id,
        firstName: usta.firstName,
        lastName: usta.lastName,
        profilePicture: usta.profilePicture,
        bio: usta.professionalDetail?.nipt || '',
        aboutMe: `Professional ${skills.join(', ')} specialist with ${experience} years of experience`,
        experience: experience,
        hourlyRate: usta.availability?.budgetAmount?.min || 50,
        rating: usta.averageRating || 0,
        totalJobs: totalCompletedJobs,
        skills: skills,
        locations: usta.locations?.map(loc => ({
          address: loc.address || 'Location not specified'
        })) || [],
        // Full profile data
        email: usta.email,
        phone: usta.phone,
        professionalDetail: usta.professionalDetail,
        portfolios: usta.portfolios,
        averageRating: usta.averageRating,
        totalRatings: usta.totalRatings,
        totalHires: usta.totalHires,
        totalViews: usta.totalViews,
        isVerified: usta.isVerified,
        isFeatured: usta.isFeatured
      }
    };
  } catch (error) {
    logError(`Error fetching usta profile: ${error.message}`);
    return {
      success: false,
      message: 'Failed to fetch usta profile',
      errors: [error.message]
    };
  }
};

/*
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
*/

// Enhanced getCustomerProfile for viewing other customer's profile
exports.getCustomerProfile = async (currentUstaId, customerId) => {
  try {
    const customer = await User.findOne({
      where: { id: customerId, role: 'customer' },
      include: [
        {
          model: Location,
          as: 'locations',
          where: { whoseLocation: 'customer' },
          required: false
        }
      ]
    });

    if (!customer) {
      return {
        success: false,
        message: 'Customer not found',
        statusCode: 404
      };
    }

    // Generate aboutMe
    const aboutMe = customer.customerPreferences?.length > 0
      ? `Looking for professional services in ${customer.customerPreferences.join(', ')}`
      : 'Customer profile';

    return {
      success: true,
      message: 'Customer profile fetched successfully',
      data: {
        id: customer.id,
        firstName: customer.firstName,
        lastName: customer.lastName,
        profilePicture: customer.profilePicture,
        aboutMe: aboutMe,
        locations: customer.locations?.map(loc => ({
          address: loc.address || 'Location not specified'
        })) || [],
        // Additional profile data for ustas
        phone: customer.phone,
        customerPreferences: customer.customerPreferences,
        memberSince: customer.createdAt
      }
    };
  } catch (error) {
    logError(`Error fetching customer profile: ${error.message}`);
    return {
      success: false,
      message: 'Failed to fetch customer profile',
      errors: [error.message]
    };
  }
};


exports.getPortfolioDetails = async (portfolioId) => {
  try {
    const portfolio = await Portfolio.findByPk(portfolioId, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName']
        }
      ]
    });

    if (!portfolio) {
      return {
        success: false,
        message: 'Portfolio not found',
        statusCode: 404
      };
    }

    // Get all portfolios for this user to create a project list
    const allPortfolios = await Portfolio.findAll({
      where: { userId: portfolio.userId },
      order: [['createdAt', 'DESC']]
    });

    // Format the response according to API spec
    return {
      success: true,
      message: 'Portfolio details fetched successfully',
      data: {
        images: portfolio.media
          ?.filter(m => m.type === 'image')
          ?.map(m => m.url) || [],
        description: portfolio.description,
        projects: allPortfolios.map(p => ({
          id: p.id,
          title: p.title,
          description: p.description,
          category: p.category,
          images: p.media
            ?.filter(m => m.type === 'image')
            ?.map(m => m.url) || [],
          videos: p.media
            ?.filter(m => m.type === 'video')
            ?.map(m => m.url) || []
        })),
        // Additional portfolio data
        id: portfolio.id,
        title: portfolio.title,
        category: portfolio.category,
        media: portfolio.media,
        usta: portfolio.user
      }
    };
  } catch (error) {
    logError(`Error fetching portfolio details: ${error.message}`);
    return {
      success: false,
      message: 'Failed to fetch portfolio details',
      errors: [error.message]
    };
  }
};