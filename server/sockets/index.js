const jwt = require('jsonwebtoken');
const User = require('../models/User');
const registerChatSocket = require('./chat.socket');

module.exports = function initSockets(io) {
  // Authenticate every socket connection using the same access token
  // the REST API uses, passed via the Socket.io auth payload.
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Authentication required'));

      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      const user = await User.findById(decoded.id).select('name role');

      if (!user) return next(new Error('User not found'));

      socket.user = { id: user._id.toString(), name: user.name, role: user.role };
      next();
    } catch (err) {
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    registerChatSocket(io, socket);
  });
};
