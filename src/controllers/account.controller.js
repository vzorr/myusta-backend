const accountService = require('../services/account.service');
const { uploadMediaToS3 } = require('../helpers/s3');  // Import the upload function

const { successResponse, errorResponse } = require('../utils/response');

// Account Creation or Update
exports.customerAccount = async (req, res) => {
  try {
    const body = req.body;
    const userId = req.user.id;
    
    // Handle file upload for profile picture
    let profilePictureUrl = null;
    if (req.file) {  // Check if a file was uploaded
      const profilePictureKey = `${req.file.originalname}`;
      // Upload buffer to S3 (handle memory storage)
      profilePictureUrl = await uploadMediaToS3(req.file, profilePictureKey); // Passing buffer to S3
    }

    // Pass the data including the profile picture URL (if uploaded)
    const result = await accountService.customerAccountCreation(userId, {
      ...body,
      basicInfo: {
        ...body.basicInfo,
        profilePicture: profilePictureUrl || body.basicInfo.profilePicture  // Use uploaded URL or original URL
      },
    });

    if (!result.success) {
      return errorResponse(res, result.message, result.errors, 400);
    }

    return successResponse(res, result.message, result.data);
  } catch (error) {
    console.error('Error in customerAccount:', error);
    return errorResponse(res, 'Error during account creation/update', [error.message], 500);
  }
};



exports.ustaAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    const body = req.body;

    const result = await accountService.ustaAccountCreation(userId, {
      ...body
    });

    if (!result.success) {
      return errorResponse(res, result.message, result.errors, 400);
    }

    return successResponse(res, result.message, result.data);
  } catch (error) {
    console.error('Error in ustaAccount:', error);
    return errorResponse(res, 'Error during account creation/update', [error.message], 500);
  }
};
