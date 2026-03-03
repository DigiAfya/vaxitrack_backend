const sendResponse = require('../utilities/response.util');
const ApiError = require('../utilities/ApiErr.util');

const errorHandler = (err, req, res, next) => {
  if (err instanceof ApiError) {
    return sendResponse(res, {
      success: false,
      message: err.message,
      data: err.errors || null,
      statusCode: err.statusCode,
    });
  }

  // Fallback for unhandled errors
  console.error(err);
  return sendResponse(res, {
    success: false,
    message: 'Internal Server Error',
    data: null,
    statusCode: 500,
  });
};

module.exports = errorHandler;
