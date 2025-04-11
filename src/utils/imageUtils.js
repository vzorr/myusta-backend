const path = require('path');
const fs = require('fs');
const { uploadBase64MediaToS3 } = require('../helpers/s3');

const uploadImage = async (imageBase64) => {
  try {
    // Extract actual base64 data from the data URI
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');
    const imageName = `profile_${Date.now()}.png`;
    const imagePath = path.join(__dirname, '../../uploads', imageName);

    // Ensure uploads directory exists
    const uploadsDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadsDir)) {
      await fs.promises.mkdir(uploadsDir, { recursive: true });
    }

    // Save the image to the uploads directory
    await fs.promises.writeFile(imagePath, imageBuffer);
    return `/uploads/${imageName}`;
  } catch (error) {
    console.error('Image upload failed:', error);
    throw new Error('Image upload failed');
  }
};

const uploadJobImages = async (imageBase64Array) => {
  try {
    if (!Array.isArray(imageBase64Array)) {
      throw new Error('Input must be an array of base64 images');
    }

    const uploadPromises = imageBase64Array.map(async (imageBase64, index) => {
      try {
        // Extract mime type from data URI
        const mimeType = imageBase64.match(/^data:(.*?);/)?.[1];
        if (!mimeType) {
          throw new Error('Invalid image format');
        }

        // Generate a unique key for S3
        const timestamp = Date.now();
        const key = `jobs/images/job_${timestamp}_${index}.${mimeType.split('/')[1]}`;

        // Upload to S3 and get the URL
        const imageUrl = await uploadBase64MediaToS3(imageBase64, key, mimeType);
        return imageUrl;
      } catch (error) {
        throw new Error(`Failed to upload image ${index + 1}: ${error.message}`);
      }
    });

    const imageUrls = await Promise.all(uploadPromises);
    return imageUrls;
  } catch (error) {
    console.error('Job images upload failed:', error);
    throw new Error('Job images upload failed: ' + error.message);
  }
};

module.exports = { uploadImage, uploadJobImages };
