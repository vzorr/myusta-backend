const nodemailer = require('nodemailer');
const { EMAIL } = require('./index.js');

// Dynamically determine if the connection is secure based on the port
const secure = EMAIL.PORT === '465'; // Port 465 requires SSL/TLS, other ports do not

// Function to create the email transport
const createEmailTransport = () => {
  return nodemailer.createTransport({
    service: EMAIL.SERVICE,  // e.g., 'gmail'
    host: EMAIL.HOST,        // smtp.gmail.com
    port: Number(EMAIL.PORT), // 587 or 465
    secure: secure,  // true for 465, false for other ports
    auth: {
      user: EMAIL.USER,
      pass: EMAIL.PASSWORD,
    },
    logger: true,
    // debug: true,  // Enable debugging for detailed logs (disable in production)
  });
};

module.exports = { createEmailTransport };
