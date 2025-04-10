const accountService = require('../services/account.service');
const { uploadMediaToS3, uploadBase64MediaToS3 } = require('../helpers/s3');  // Import the upload function

const { successResponse, errorResponse } = require('../utils/response');

const mime = require('mime-types');

const getExtensionFromBase64 = (base64String) => {
  const matches = base64String.match(/^data:(.+);base64,/);
  if (!matches || matches.length < 2) {
    throw new Error('Invalid base64 string');
  }
  const mimeType = matches[1]; // e.g., image/jpeg
  const ext = mime.extension(mimeType); // e.g., jpg
  if (!ext) {
    throw new Error(`Unsupported MIME type: ${mimeType}`);
  }
  return { mimeType, ext };
};

// Account Creation or Update
exports.customerAccount = async (req, res) => {
  try {
    const body = req.body;
    const userId = req.user.id;
    let profilePictureUrl = null;
    
    // // Handle file upload for profile picture
    // if (req.file) {  // Check if a file was uploaded
    //   const profilePictureKey = `${req.file.originalname}`;
    //   // Upload buffer to S3 (handle memory storage)
    //   profilePictureUrl = await uploadMediaToS3(req.file, profilePictureKey); // Passing buffer to S3
    // }

    // ✅ Upload profile picture if base64
    if (body.basicInfo?.profilePicture?.startsWith('data:')) {
      const { mimeType, ext } = getExtensionFromBase64(body.basicInfo.profilePicture);
      const profilePictureKey = `profile/${userId}/${Date.now()}.${ext}`;
      const profilePictureUrl = await uploadBase64MediaToS3(body.basicInfo.profilePicture, profilePictureKey, mimeType);
      body.basicInfo.profilePicture = profilePictureUrl;
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

    // ✅ Upload profile picture if base64
    if (body.basicInfo?.profilePicture?.startsWith('data:')) {
      const { mimeType, ext } = getExtensionFromBase64(body.basicInfo.profilePicture);
      const profilePictureKey = `profile/${userId}/${Date.now()}.${ext}`;
      const profilePictureUrl = await uploadBase64MediaToS3(body.basicInfo.profilePicture, profilePictureKey, mimeType);
      body.basicInfo.profilePicture = profilePictureUrl;
    }

    // ✅ Upload portfolio media if base64
    if (body.professionalDetail?.portfolio) {
      for (let portfolioItem of body.professionalDetail.portfolio) {
        for (let media of portfolioItem.media) {
          if (media.url.startsWith('data:')) {
            const { mimeType, ext } = getExtensionFromBase64(media.url);
            const key = `portfolio/${userId}/${Date.now()}-${Math.random().toString(36).substr(2, 5)}.${ext}`;
            const fileUrl = await uploadBase64MediaToS3(media.url, key, mimeType);
            media.url = fileUrl;
          }
        }
      }
    }

    // ✅ Proceed with account creation
    const result = await accountService.ustaAccountCreation(userId, {
      ...body,
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