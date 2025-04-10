const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');

const { AWS } = require('../config/index');

// Configure AWS SDK
AWS.config.update({
  accessKeyId: AWS.ACCESS_KEY,
  secretAccessKey: AWS.SECRET_KEY,  
  region: AWS.REGION
});

// Create an S3 instance
const s3 = new AWS.S3();

// Function to upload image to S3
const uploadImageToS3 = async (filePath, key) => {
  try {
    // Read image file
    const fileContent = fs.readFileSync(filePath);

    // S3 upload parameters
    const params = {
      Bucket: AWS.BUCKET_NAME,
      Key: key,            // Unique key for the image
      Body: fileContent,   // File content
      ContentType: 'image/jpeg',  // Content type for images
      ACL: 'public-read',  // Makes the file publicly readable
    };

    // Upload image to S3
    const data = await s3.upload(params).promise();
    console.log(`Image uploaded successfully. URL: ${data.Location}`);
    return data.Location; // Return the image URL
  } catch (error) {
    console.error('Error uploading image to S3:', error.message);
    throw error;
  }
};

// Function to upload video to S3
const uploadVideoToS3 = async (filePath, bucketName, key) => {
  try {
    // Read video file
    const fileContent = fs.readFileSync(filePath);

    // S3 upload parameters
    const params = {
      Bucket: AWS.BUCKET_NAME,
      Key: key,            // Unique key for the video
      Body: fileContent,   // File content
      ContentType: 'video/mp4',  // Content type for videos (you can change it based on file type)
      ACL: 'public-read',  // Makes the file publicly readable
    };

    // Upload video to S3
    const data = await s3.upload(params).promise();
    console.log(`Video uploaded successfully. URL: ${data.Location}`);
    return data.Location; // Return the video URL
  } catch (error) {
    console.error('Error uploading video to S3:', error.message);
    throw error;
  }
};

module.exports = {
  uploadImageToS3,
  uploadVideoToS3,
};
