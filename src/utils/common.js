function generateOTP() {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }
  
  function getExpiryTime() {
    return new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
  }
  
  module.exports = { generateOTP, getExpiryTime };
  