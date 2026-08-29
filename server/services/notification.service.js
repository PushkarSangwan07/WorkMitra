const Notification = require('../models/Notification');

// Creates a notification in MongoDB and emits it live via Socket.io if the
// user has an active socket connection (room name = userId).
const notify = async (io, { userId, type, title, body, link }) => {
  const notification = await Notification.create({ user: userId, type, title, body, link });

  if (io) {
    io.to(userId.toString()).emit('notification:new', notification);
  }

  return notification;
};

module.exports = { notify };
