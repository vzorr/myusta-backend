const path = require('path');
const fs = require('fs');

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
      // Extract actual base64 data from the data URI
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
      const imageBuffer = Buffer.from(base64Data, 'base64');
      const imageName = `job_${Date.now()}_${index}.png`;
      const imagePath = path.join(__dirname, '../../uploads', imageName);

      // Ensure uploads directory exists
      const uploadsDir = path.join(__dirname, '../../uploads');
      if (!fs.existsSync(uploadsDir)) {
        await fs.promises.mkdir(uploadsDir, { recursive: true });
      }

      // Save the image to the uploads directory
      await fs.promises.writeFile(imagePath, imageBuffer);
      return `/uploads/${imageName}`;
    });

    const imageUrls = await Promise.all(uploadPromises);
    return imageUrls;
  } catch (error) {
    console.error('Job images upload failed:', error);
    throw new Error('Job images upload failed');
  }
};

module.exports = { uploadImage, uploadJobImages };
