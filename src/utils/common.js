function generateOTP() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

function getExpiryTime() {
  return new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
}

// compare password function via bcrypt
const bcrypt = require("bcrypt");

function comparePassword(plainPassword, hashedPassword) {
  return bcrypt.compare(plainPassword, hashedPassword);
}

function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

const base64ToBuffer = (base64String) => {
  const buffer = Buffer.from(base64String, 'base64');
  return buffer;
};

module.exports = { generateOTP, getExpiryTime, comparePassword, hashPassword, base64ToBuffer };
