const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const User = require('../models/User');

// Verifies the access token and attaches the user to req.user
const verifyJWT = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.split(' ')[1]
    : null;

  if (!token) {
    throw new ApiError(401, 'Not authenticated. Please log in.');
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  } catch (err) {
    throw new ApiError(401, 'Access token expired or invalid');
  }

  const user = await User.findById(decoded.id);

  if (!user) {
    throw new ApiError(401, 'User belonging to this token no longer exists');
  }

  if (user.isSuspended || !user.isActive) {
    throw new ApiError(403, 'This account has been suspended');
  }

  req.user = user;
  next();
});

module.exports = verifyJWT;
