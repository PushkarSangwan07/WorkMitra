const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

// GET /api/notifications/me
const getMyNotifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, unreadOnly } = req.query;
  const skip = (page - 1) * limit;

  const filter = { user: req.user._id };
  if (unreadOnly === 'true') filter.isRead = false;

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Notification.countDocuments(filter),
    Notification.countDocuments({ user: req.user._id, isRead: false }),
  ]);

  return res.status(200).json(
    new ApiResponse(200, {
      notifications,
      unreadCount,
      pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / limit) },
    })
  );
});

// PATCH /api/notifications/:id/read
const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { isRead: true },
    { new: true }
  );

  if (!notification) throw new ApiError(404, 'Notification not found');

  return res.status(200).json(new ApiResponse(200, { notification }));
});

// PATCH /api/notifications/read-all
const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
  return res.status(200).json(new ApiResponse(200, null, 'All notifications marked as read'));
});

module.exports = { getMyNotifications, markAsRead, markAllAsRead };
