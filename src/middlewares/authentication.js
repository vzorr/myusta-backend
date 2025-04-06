const { verifyToken } = require('../helpers/jwt');
const { User } = require('../models');
const { errorResponse } = require('../utils/response');

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return errorResponse(res, 'Authorization token missing', [], 401);
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);

  if (!decoded) {
    return errorResponse(res, 'Invalid or expired token', [], 401);
  }

  try {
    // Fetch user details using user ID from decoded token
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return errorResponse(res, 'User not found', [], 404);
    }

    req.user = user; // Attach user object to request
    next();
  } catch (error) {
    return errorResponse(res, 'User authentication failed', [error.message], 500);
  }
};

module.exports = authenticate;
