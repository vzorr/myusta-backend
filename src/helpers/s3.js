const AWS = require('aws-sdk');
const awsConfig = require('../config/index').AWS; // Import AWS configuration from your config file

const BUCKET = "myusta-images-videos";

// Configure AWS SDK
AWS.config.update({
  accessKeyId: awsConfig.ACCESS_KEY,
  secretAccessKey: awsConfig.SECRET_KEY,
  region: awsConfig.REGION,
});

const s3 = new AWS.S3();

// Function to upload a file to S3
const uploadMediaToS3 = async (file, key) => {
  
  const params = {
    Bucket: BUCKET,
    Key: key, // Unique key for the file
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  try {
    const s3Upload = await s3.upload(params).promise();
    return s3Upload.Location; // Return the URL of the uploaded file
  } catch (error) {
    throw new Error('Error uploading to S3: ' + error.message);
  }
};

const uploadBase64MediaToS3 = async (base64String, key, contentType) => {
  const base64Data = base64String.replace(/^data:.*;base64,/, '');

  const buffer = Buffer.from(base64Data, 'base64');

  const params = {
    Bucket: BUCKET,
    Key: key,
    Body: buffer,
    ContentType: contentType, // e.g. image/png, video/mp4
  };

  try {
    const s3Upload = await s3.upload(params).promise();
    return s3Upload.Location;
  } catch (error) {
    throw new Error('Error uploading to S3: ' + error.message);
  }
};

module.exports = { uploadMediaToS3, uploadBase64MediaToS3 };