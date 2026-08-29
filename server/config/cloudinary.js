const cloudinary = require('cloudinary').v2;


if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
} else {
  console.warn('[cloudinary] No credentials found — image uploads will be unavailable until CLOUDINARY_* env vars are set.');
}

module.exports = cloudinary;
