const path = require('path');
const fs = require('fs');

const uploadImage = async (imageBase64) => {
  try {
    const imageBuffer = Buffer.from(imageBase64, 'base64');
    const imageName = `profile_${Date.now()}.png`;
    const imagePath = path.join(__dirname, '../../uploads', imageName);

    // Save the image to the uploads directory
    await fs.promises.writeFile(imagePath, imageBuffer);
    return `/uploads/${imageName}`;
  } catch (error) {
    console.error('Image upload failed:', error);
    throw new Error('Image upload failed');
  }
};

module.exports = { uploadImage };
