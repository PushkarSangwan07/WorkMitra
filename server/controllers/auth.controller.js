const crypto = require('crypto');
const User = require('../models/User');
const WorkerProfile = require('../models/WorkerProfile');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const { verifyRefreshToken } = require('../services/token.service');
const { sendPasswordResetEmail, sendVerificationOtpEmail, sendBanAppealEmailToAdmin } = require('../services/email.service');

// 🚨 THE FIX FOR REFRESH LOGOUT: Strict Cookie Options for Cross-Origin (Render -> Vercel)
const cookieOptions = {
  httpOnly: true,
  secure: true, // Must be true if frontend is HTTPS (Vercel)
  sameSite: 'none', // Allows cookies to be sent across different domains
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 Days
};

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


  if (role === 'worker' && !phone) {
    throw new ApiError(400, 'Phone number is required for workers to receive WhatsApp messages.');
  }

  // 2. Agar customer ne phone nahi diya, toh empty string ko undefined bana do
  // Taaki MongoDB ka `sparse: true` perfectly kaam kare aur duplicate error na aaye
  if (!phone || phone.trim() === '') {
    phone = undefined;
  }
  
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, 'An account with this email already exists');
  }

  // 1. Generate Real 6-digit OTP and Expiry (10 mins)
  const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpire = new Date(Date.now() + 10 * 60 * 1000); 

  // 2. Create user with isEmailVerified = FALSE aur OTP save karein
  const user = await User.create({
    name,
    email,
    password,
    phone,
    role: role || 'customer',
    isEmailVerified: false, 
    otpCode: generatedOtp,
    otpExpire: otpExpire
  });

  if (user.role === 'worker') {
    await WorkerProfile.create({
      user: user._id,
      profession: 'Not specified',
      rateAmount: 0,
    });
  }

  // 3. Send REAL Email via Mailjet
  await sendVerificationOtpEmail(user.email, user.name, generatedOtp);

  return res.status(201).json(
    new ApiResponse(
      201, 
      { email: user.email }, 
      'Registered successfully! Please check your email for the OTP.'
    )
  );
});


// POST /api/auth/verify-email
const verifyEmail = asyncHandler(async (req, res) => {
  const { email, otpCode } = req.body; 

  if (!email || !otpCode) {
    throw new ApiError(400, 'Email and OTP code are required');
  }

  otpCode = String(otpCode).trim();

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, 'User not found.');
  }

  // STRICT OTP CHECKING
  if (user.otpCode !== otpCode) {
    throw new ApiError(400, 'Invalid OTP code. Please try again.');
  }

  if (user.otpExpire < new Date()) {
    throw new ApiError(400, 'OTP code has expired. Please request a new one.');
  }

  user.isEmailVerified = true;
  user.otpCode = undefined;
  user.otpExpire = undefined;

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  // 🚨 Setting the cookie securely
  res.cookie('refreshToken', refreshToken, cookieOptions);

  return res.status(200).json(
    new ApiResponse(
      200, 
      { user: sanitizeUser(user), accessToken }, 
      'Email verified and logged in successfully'
    )
  );
});

// POST /api/auth/resend-otp
const resendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json(new ApiResponse(404, null, 'User not found'));
  if (user.isEmailVerified) return res.status(400).json(new ApiResponse(400, null, 'Email is already verified. Please log in.'));

  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpire = Date.now() + 10 * 60 * 1000; 

  user.otpCode = otpCode;
  user.otpExpire = otpExpire;
  await user.save({ validateBeforeSave: false });

  await sendVerificationOtpEmail(email, user.name, otpCode);

  return res.status(200).json(new ApiResponse(200, null, 'A new verification code has been sent to your email.'));
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password +refreshToken');
  if (!user || !(await user.comparePassword(password))) throw new ApiError(401, 'Invalid email or password');
  
  if (!user.isEmailVerified) throw new ApiError(403, 'Please verify your email before logging in.');
  if (user.isSuspended || !user.isActive) throw new ApiError(403, 'This account has been suspended. Contact support.');

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  // 🚨 Setting the cookie securely
  res.cookie('refreshToken', refreshToken, cookieOptions);

  return res.status(200).json(new ApiResponse(200, { user: sanitizeUser(user), accessToken }, 'Logged in successfully'));
});

// POST /api/auth/logout
const logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;

  if (token) {
    await User.findOneAndUpdate({ refreshToken: token }, { $unset: { refreshToken: 1 } });
  }

  // 🚨 Must clear cookie with exact same options it was set with
  res.clearCookie('refreshToken', cookieOptions);

  return res.status(200).json(new ApiResponse(200, null, 'Logged out successfully'));
});

// POST /api/auth/refresh
const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;

  if (!token) throw new ApiError(401, 'No refresh token provided');

  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch (err) {
    throw new ApiError(401, 'Refresh token expired or invalid. Please log in again.');
  }

  const user = await User.findById(decoded.id).select('+refreshToken');
  if (!user || user.refreshToken !== token) throw new ApiError(401, 'Refresh token is no longer valid. Please log in again.');

  const newAccessToken = user.generateAccessToken();
  const newRefreshToken = user.generateRefreshToken();

  user.refreshToken = newRefreshToken;
  await user.save({ validateBeforeSave: false });

  // 🚨 Set the newly rotated cookie securely
  res.cookie('refreshToken', newRefreshToken, cookieOptions);

  return res.status(200).json(new ApiResponse(200, { accessToken: newAccessToken, user: sanitizeUser(user) }, 'Token refreshed'));
});

// GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  return res.status(200).json(new ApiResponse(200, { user: sanitizeUser(req.user) }));
});

// POST /api/auth/forgot-password
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  const genericResponse = new ApiResponse(200, null, 'If an account with that email exists, a reset link has been sent.');
  if (!user) return res.status(200).json(genericResponse);

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
    return res.status(500).json({ success: false, message: 'Email failed to send', debugError: err.message });
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

  if (!user) throw new ApiError(400, 'Reset token is invalid or has expired');

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
  if (!email || !message) throw new ApiError(400, 'Email and message are required.');

  const user = await User.findOne({ email });
  if (!user) throw new ApiError(404, 'User not found.');
  if (!user.isSuspended) throw new ApiError(400, 'This account is not currently suspended.');

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

