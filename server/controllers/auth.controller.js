const crypto = require('crypto');
const User = require('../models/User');
const WorkerProfile = require('../models/WorkerProfile');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const { refreshTokenCookieOptions, verifyRefreshToken } = require('../services/token.service');
const { sendPasswordResetEmail, sendVerificationOtpEmail } = require('../services/email.service');
const {sendBanAppealEmailToAdmin} = require('../services/email.service');

// Strips sensitive fields before sending user back to client
const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  avatar: user.avatar,
  isVerified: user.isVerified,
  createdAt: user.createdAt,
});

// POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, role } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, 'An account with this email already exists');
  }

  // Generate a 6-digit OTP and expiration time (10 minutes)
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpire = Date.now() + 10 * 60 * 1000; 

  const user = await User.create({
    name,
    email,
    password,
    phone,
    role: role || 'customer',
    otpCode,
    otpExpire,
    isEmailVerified: false
  });

  // If registering as a worker, create a minimal WorkerProfile shell
  if (user.role === 'worker') {
    await WorkerProfile.create({
      user: user._id,
      profession: 'Not specified',
      rateAmount: 0,
    });
  }

  // Send the OTP Email
  await sendVerificationOtpEmail(email, name, otpCode);

  // Notice we DO NOT generate tokens here anymore. They must verify first!
  return res
    .status(201)
    .json(new ApiResponse(201, { email }, 'Registered successfully. Please check your email for the OTP.'));
});


// POST /api/auth/verify-email
const verifyEmail = asyncHandler(async (req, res) => {
  const { email, otpCode } = req.body;

  // 1. Verify the OTP is correct and not expired
  const user = await User.findOne({
    email,
    otpCode,
    otpExpire: { $gt: Date.now() }, 
  });

  if (!user) {
    throw new ApiError(400, 'Invalid or expired OTP code.');
  }

  // 2. Mark user as verified and clear the OTP fields so they can't be reused
  user.isEmailVerified = true;
  user.otpCode = undefined;
  user.otpExpire = undefined;

  // 3. AUTO-LOGIN LOGIC: Generate tokens exactly like the login function
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  // 4. Update session variables
  user.refreshToken = refreshToken;
  user.lastLogin = new Date();
  
  // Save the user updates
  await user.save({ validateBeforeSave: false });

  // 5. Set the secure cookie (Make sure refreshTokenCookieOptions is defined above this!)
  res.cookie('refreshToken', refreshToken, refreshTokenCookieOptions);

  // 6. Return the exact same ApiResponse format as login
  return res
    .status(200)
    .json(
      new ApiResponse(
        200, 
        { user: sanitizeUser(user), accessToken }, 
        'Email verified and logged in successfully'
      )
    );
});


// POST /api/auth/verify-email (NEW FUNCTION)
// const verifyEmail = asyncHandler(async (req, res) => {
//   const { email, otpCode } = req.body;

//   const user = await User.findOne({
//     email,
//     otpCode,
//     otpExpire: { $gt: Date.now() }, // Ensures token isn't expired
//   });

//   if (!user) {
//     throw new ApiError(400, 'Invalid or expired OTP code.');
//   }

//   // Mark user as verified and clear the OTP fields
//   user.isEmailVerified = true;
//   user.otpCode = undefined;
//   user.otpExpire = undefined;
//   await user.save({ validateBeforeSave: false });

//   return res.status(200).json(new ApiResponse(200, null, 'Email verified successfully! You can now log in.'));
// });


// POST /api/auth/resend-otp
const resendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json(new ApiResponse(404, null, 'User not found'));
  }

  if (user.isEmailVerified) {
    return res.status(400).json(new ApiResponse(400, null, 'Email is already verified. Please log in.'));
  }

  // Generate a brand new OTP
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpire = Date.now() + 10 * 60 * 1000; 

  user.otpCode = otpCode;
  user.otpExpire = otpExpire;
  await user.save({ validateBeforeSave: false });

  // Send the new email
  await sendVerificationOtpEmail(email, user.name, otpCode);

  return res.status(200).json(new ApiResponse(200, null, 'A new verification code has been sent to your email.'));
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password +refreshToken');

  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid email or password');
  }

  // NEW CHECK: Block unverified emails
  if (!user.isEmailVerified) {
    throw new ApiError(403, 'Please verify your email before logging in.');
  }

  if (user.isSuspended || !user.isActive) {
    throw new ApiError(403, 'This account has been suspended. Contact support.');
  }

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  res.cookie('refreshToken', refreshToken, refreshTokenCookieOptions);

  return res
    .status(200)
    .json(new ApiResponse(200, { user: sanitizeUser(user), accessToken }, 'Logged in successfully'));
});

// POST /api/auth/logout
const logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;

  if (token) {
    await User.findOneAndUpdate({ refreshToken: token }, { $unset: { refreshToken: 1 } });
  }

  res.clearCookie('refreshToken', { path: '/api/auth' });

  return res.status(200).json(new ApiResponse(200, null, 'Logged out successfully'));
});

// POST /api/auth/refresh
const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;

  if (!token) {
    throw new ApiError(401, 'No refresh token provided');
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch (err) {
    throw new ApiError(401, 'Refresh token expired or invalid. Please log in again.');
  }

  const user = await User.findById(decoded.id).select('+refreshToken');

  if (!user || user.refreshToken !== token) {
    throw new ApiError(401, 'Refresh token is no longer valid. Please log in again.');
  }

  const newAccessToken = user.generateAccessToken();
  const newRefreshToken = user.generateRefreshToken();

  user.refreshToken = newRefreshToken;
  await user.save({ validateBeforeSave: false });

  res.cookie('refreshToken', newRefreshToken, refreshTokenCookieOptions);

  return res
    .status(200)
    .json(new ApiResponse(200, { accessToken: newAccessToken }, 'Token refreshed'));
});

// GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  return res.status(200).json(new ApiResponse(200, { user: sanitizeUser(req.user) }));
});

// POST /api/auth/forgot-password
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  const genericResponse = new ApiResponse(
    200,
    null,
    'If an account with that email exists, a reset link has been sent.'
  );

  if (!user) {
    return res.status(200).json(genericResponse);
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  user.passwordResetToken = hashedToken;
  user.passwordResetExpires = Date.now() + 15 * 60 * 1000; 
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

  try {
    await sendPasswordResetEmail(user.email, resetUrl);
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    throw new ApiError(500, 'Failed to send reset email. Please try again later.');
  }

  return res.status(200).json(genericResponse);
});

// POST /api/auth/reset-password
const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  }).select('+passwordResetToken +passwordResetExpires');

  if (!user) {
    throw new ApiError(400, 'Reset token is invalid or has expired');
  }

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.refreshToken = undefined; 
  await user.save();

  return res.status(200).json(new ApiResponse(200, null, 'Password reset successfully. Please log in.'));
});

// POST /api/auth/appeal-ban
const submitBanAppeal = asyncHandler(async (req, res) => {
  const { email, message } = req.body;

  if (!email || !message) {
    throw new ApiError(400, 'Email and message are required.');
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, 'User not found.');
  }

  // Double check that they are actually suspended
  if (!user.isSuspended) {
    throw new ApiError(400, 'This account is not currently suspended.');
  }

  // Send the appeal email directly to the Admin!
  await sendBanAppealEmailToAdmin(user, message);

  return res.status(200).json(new ApiResponse(200, null, 'Appeal submitted successfully. Our team will review it.'));
});

module.exports = {
  register,
  login,
  logout,
  refresh,
  getMe,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendOtp,
  submitBanAppeal
  
};
























