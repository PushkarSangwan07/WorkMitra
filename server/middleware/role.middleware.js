const ApiError = require('../utils/ApiError');

// Usage: restrictTo('admin') or restrictTo('worker', 'admin')
// Must be used AFTER verifyJWT, since it relies on req.user being set
const restrictTo = (...allowedRoles) => (req, res, next) => {
  if (!req.user) {
    return next(new ApiError(401, 'Not authenticated'));
  }

  if (!allowedRoles.includes(req.user.role)) {
    return next(new ApiError(403, 'You do not have permission to perform this action'));
  }

  next();
};

module.exports = restrictTo;
