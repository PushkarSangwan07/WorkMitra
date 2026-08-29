const Favorite = require('../models/Favorite');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

// POST /api/favorites/:workerId — add to favorites
const addFavorite = asyncHandler(async (req, res) => {
  const existing = await Favorite.findOne({ customer: req.user._id, worker: req.params.workerId });
  if (existing) throw new ApiError(409, 'Already in favorites');

  const favorite = await Favorite.create({ customer: req.user._id, worker: req.params.workerId });
  return res.status(201).json(new ApiResponse(201, { favorite }, 'Added to favorites'));
});

// DELETE /api/favorites/:workerId — remove from favorites
const removeFavorite = asyncHandler(async (req, res) => {
  const result = await Favorite.findOneAndDelete({
    customer: req.user._id,
    worker: req.params.workerId,
  });
  if (!result) throw new ApiError(404, 'Favorite not found');

  return res.status(200).json(new ApiResponse(200, null, 'Removed from favorites'));
});

// GET /api/favorites/me
const getMyFavorites = asyncHandler(async (req, res) => {
  const favorites = await Favorite.find({ customer: req.user._id }).populate({
    path: 'worker',
    populate: { path: 'user', select: 'name avatar' },
  });

  return res.status(200).json(new ApiResponse(200, { favorites }));
});

module.exports = { addFavorite, removeFavorite, getMyFavorites };