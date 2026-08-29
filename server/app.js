const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');

const errorMiddleware = require('./middleware/error.middleware');
const checkMaintenance = require('./middleware/maintainance.middleware');

const app = express();

// Security headers
app.use(helmet());

// CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);

// Body parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Sanitize data against NoSQL query injection
app.use(mongoSanitize());

// Sanitize data against XSS
app.use(xss());

// Rate limiting (general API limiter; stricter limiter applied separately on auth routes)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests, please try again later.',
});
app.use('/api', apiLimiter);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'WorkMitra API is running' });
});

// Maintenance mode middleware
app.use('/api', checkMaintenance);

// ---- Routes ----
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/workers', require('./routes/worker.routes'));
app.use('/api/bookings', require('./routes/booking.routes'));
app.use('/api/reviews', require('./routes/review.routes'));
app.use('/api/favorites', require('./routes/favorite.routes'));
app.use('/api/chat', require('./routes/chat.routes'));
app.use('/api/notifications', require('./routes/notification.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/ai', require('./routes/ai.routes'));


// 404 handler for unknown API routes
app.use('/api', (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Centralized error handler (must be last)
app.use(errorMiddleware);

module.exports = app;
