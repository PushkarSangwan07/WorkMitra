const Review = require('../models/Review');
const Booking = require('../models/Booking');
const WorkerProfile = require('../models/WorkerProfile');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const { notify } = require('../services/notification.service');

// Recalculates a worker's ratingAvg/ratingCount from all their reviews.
// Called after create/update/delete so the aggregate is always accurate.
const recalcWorkerRating = async (workerId) => {
  const stats = await Review.aggregate([
    { $match: { worker: workerId } },
    { $group: { _id: '$worker', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  const { avg = 0, count = 0 } = stats[0] || {};

  await WorkerProfile.findByIdAndUpdate(workerId, {
    ratingAvg: Math.round(avg * 10) / 10,
    ratingCount: count,
  });
};

// POST /api/reviews
const createReview = asyncHandler(async (req, res) => {
  const { bookingId, rating, comment } = req.body;

  const booking = await Booking.findById(bookingId);
  if (!booking) throw new ApiError(404, 'Booking not found');

  if (!booking.customer.equals(req.user._id)) {
    throw new ApiError(403, 'You can only review your own bookings');
  }

  if (booking.status !== 'completed') {
    throw new ApiError(400, 'You can only review completed bookings');
  }

  const existing = await Review.findOne({ booking: bookingId });
  if (existing) throw new ApiError(409, 'You have already reviewed this booking');

  const review = await Review.create({
    booking: bookingId,
    customer: req.user._id,
    worker: booking.worker,
    rating,
    comment,
  });

  await recalcWorkerRating(booking.worker);

  const worker = await WorkerProfile.findById(booking.worker);
  await notify(req.app.get('io'), {
    userId: worker.user,
    type: 'new_review',
    title: 'New review received',
    body: `You received a ${rating}-star review`,
    link: '/worker/dashboard',
  });

  return res.status(201).json(new ApiResponse(201, { review }, 'Review submitted'));
});

// GET /api/reviews/worker/:workerId
const getWorkerReviews = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  const [reviews, total] = await Promise.all([
    Review.find({ worker: req.params.workerId })
      .populate('customer', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Review.countDocuments({ worker: req.params.workerId }),
  ]);

  return res.status(200).json(
    new ApiResponse(200, {
      reviews,
      pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / limit) },
    })
  );
});

// PATCH /api/reviews/:id
const updateReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw new ApiError(404, 'Review not found');

  if (!review.customer.equals(req.user._id)) {
    throw new ApiError(403, 'You can only edit your own review');
  }

  if (req.body.rating !== undefined) review.rating = req.body.rating;
  if (req.body.comment !== undefined) review.comment = req.body.comment;
  await review.save();

  await recalcWorkerRating(review.worker);

  return res.status(200).json(new ApiResponse(200, { review }, 'Review updated'));
});

// DELETE /api/reviews/:id
const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw new ApiError(404, 'Review not found');

  if (!review.customer.equals(req.user._id) && req.user.role !== 'admin') {
    throw new ApiError(403, 'You can only delete your own review');
  }

  const workerId = review.worker;
  await review.deleteOne();
  await recalcWorkerRating(workerId);

  return res.status(200).json(new ApiResponse(200, null, 'Review deleted'));
});

module.exports = {
  createReview,
  getWorkerReviews,
  updateReview,
  deleteReview,
};
