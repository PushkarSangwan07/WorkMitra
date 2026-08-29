const cloudinary = require('../config/cloudinary');
const ApiError = require('../utils/ApiError');

const checkCredentials = () => {
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    throw new ApiError(503, 'Image uploads are not configured. Add CLOUDINARY_* credentials to your .env file.');
  }
};

// Uploads a buffer (from multer memoryStorage) to Cloudinary via stream
const uploadBuffer = (buffer, folder = 'workmitra') => {
  checkCredentials();
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: `workmitra/${folder}`, resource_type: 'auto' },
      (error, result) => {
        if (error) return reject(error);
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    stream.end(buffer);
  });
};

const deleteAsset = async (publicId) => {
  if (!publicId || !process.env.CLOUDINARY_CLOUD_NAME) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.warn('[cloudinary.service] Failed to delete asset:', err.message);
  }
};

module.exports = { uploadBuffer, deleteAsset, deleteImage: deleteAsset };
