const jwt = require('jsonwebtoken');

// httpOnly cookie options for storing the refresh token securely
const refreshTokenCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days, keep in sync with REFRESH_TOKEN_EXPIRY
  path: '/api/auth', // only sent to auth routes
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
};

module.exports = {
  refreshTokenCookieOptions,
  verifyRefreshToken,
};
