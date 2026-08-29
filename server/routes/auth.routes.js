const router = require('express').Router();

const {
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
} = require('../controllers/auth.controller');

const verifyJWT = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const authLimiter = require('../middleware/rateLimiter.middleware');

const {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema
} = require('../validators/auth.validator');

// 1. Standard Auth Routes (With Zod Validation)
router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', authLimiter, validate(resetPasswordSchema), resetPassword);

// 2. Email Verification Routes (Removed Zod Validation to prevent the safeParse error)
router.post('/verify-email', authLimiter, verifyEmail);
router.post('/resend-otp', authLimiter, resendOtp); // Fixed the typo here!

// 3. Ban Appeal Route
router.post('/appeal-ban', submitBanAppeal);

// 3. Token & Session Routes
router.post('/logout', logout);
router.post('/refresh', refresh);
router.get('/me', verifyJWT, getMe);

module.exports = router;