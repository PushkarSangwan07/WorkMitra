const Message = require('../models/Message');
const { notify } = require('../services/notification.service');
const User = require('../models/User');

module.exports = function registerChatSocket(io, socket) {
  const userId = socket.user.id;

  // Join a personal room so we can target this user directly (used by
  // notification.service too) and broadcast their online status.
  socket.join(userId.toString());
  socket.broadcast.emit('user:online', { userId });

  // ---- Send a message ----
  socket.on('message:send', async ({ receiverId, text }, callback) => {
    try {
      if (!text || !text.trim()) {
        return callback?.({ success: false, error: 'Message cannot be empty' });
      }

      const conversationId = Message.buildConversationId(userId, receiverId);

      const message = await Message.create({
        conversationId,
        sender: userId,
        receiver: receiverId,
        text: text.trim(),
      });

      // Deliver to receiver if they're online
      io.to(receiverId.toString()).emit('message:new', message);
      // Echo back to sender (for multi-tab/device sync)
      socket.emit('message:new', message);

      callback?.({ success: true, message });

      // Fire a persisted notification too, so it shows up even if they're offline
      const sender = await User.findById(userId).select('name');
      await notify(io, {
        userId: receiverId,
        type: 'new_message',
        title: 'New message',
        body: `${sender?.name || 'Someone'}: ${text.slice(0, 60)}`,
        link: '/chat',
      });
    } catch (err) {
      callback?.({ success: false, error: 'Failed to send message' });
    }
  });

  // ---- Typing indicator ----
  socket.on('typing:start', ({ receiverId }) => {
    io.to(receiverId.toString()).emit('typing:start', { userId });
  });

  socket.on('typing:stop', ({ receiverId }) => {
    io.to(receiverId.toString()).emit('typing:stop', { userId });
  });

  // ---- Read receipts ----
  socket.on('message:read', async ({ otherUserId }) => {
    const conversationId = Message.buildConversationId(userId, otherUserId);
    await Message.updateMany(
      { conversationId, receiver: userId, readAt: null },
      { readAt: new Date() }
    );
    io.to(otherUserId.toString()).emit('message:read', { byUserId: userId, conversationId });
  });

  // ---- Disconnect ----
  socket.on('disconnect', () => {
    socket.broadcast.emit('user:offline', { userId });
  });
};