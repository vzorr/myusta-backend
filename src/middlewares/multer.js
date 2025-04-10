const multer = require('multer');

// Set up multer for file storage (in memory for uploading to S3)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Exporting multer upload as middleware
module.exports = upload;