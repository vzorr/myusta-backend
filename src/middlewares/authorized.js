const { errorResponse } = require('../utils/response');
const { ROLES } = require('../utils/constant');

const authorized = (...allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.user?.role;

    if (!userRole || !allowedRoles.includes(userRole)) {
      return errorResponse(res, 'Access denied. Unauthorized role', [], 403);
    }

    next(); // user is authorized
  };
};

module.exports = authorized;
