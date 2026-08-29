require('dotenv').config();

const required = [
  'MONGO_URI',
  'ACCESS_TOKEN_SECRET',
  'REFRESH_TOKEN_SECRET',
];

const missing = required.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.warn(
    `Warning: missing environment variables: ${missing.join(', ')}. Copy .env.example to .env and fill these in.`
  );
}

module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGO_URI,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  accessToken: {
    secret: process.env.ACCESS_TOKEN_SECRET,
    expiry: process.env.ACCESS_TOKEN_EXPIRY || '15m',
  },
  refreshToken: {
    secret: process.env.REFRESH_TOKEN_SECRET,
    expiry: process.env.REFRESH_TOKEN_EXPIRY || '7d',
  },
};
