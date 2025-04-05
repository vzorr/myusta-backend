// Success Response Format
const successResponse = (res, message, data = {}, code = 200) => {
    return res.status(code).json({
      success: true,
      code,
      message,
      result: data,
    });
  };
  
  // Error Response Format
  const errorResponse = (res, message, errors = [], code = 500) => {
    return res.status(code).json({
      success: false,
      code,
      message,
      errors,
    });
  };
  
  module.exports = {
    successResponse,
    errorResponse,
  };
  