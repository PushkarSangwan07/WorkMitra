const ApiError = require('../utils/ApiError');

// eslint-disable-next-line no-unused-vars
const errorMiddleware = (err, req, res, next) => {
  let error = err;

  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';
    error = new ApiError(statusCode, message, error.errors || []);
  }

  const response = {
    success: false,
    message: error.message,
    errors: error.errors,
    ...(process.env.NODE_ENV === 'development' ? { stack: error.stack } : {}),
  };

  return res.status(error.statusCode || 500).json(response);
};

module.exports = errorMiddleware;
