const jwt = require('jsonwebtoken');
const { JWT } = require('../config/index')


const generateToken = (payload) => {
  return jwt.sign(payload, JWT.SECRET_KEY, { expiresIn: JWT.EXPIRES_IN });
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT.SECRET_KEY);
  } catch (err) {
    return null;
  }
};

module.exports = { generateToken, verifyToken };
