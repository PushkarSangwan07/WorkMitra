const Message = require('../models/Message');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

// GET /api/chat/conversations — list of people the user has chatted with,
// with their last message, for a conversation list sidebar.
const getConversations = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  

const conversations = await Message.aggregate([
    { $match: { $or: [{ sender: userId }, { receiver: userId }] } },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: '$conversationId',
        lastMessage: { $first: '$$ROOT' },
      },
    },
    { $sort: { 'lastMessage.createdAt': -1 } },
  ]);

  const populated = await Promise.all(
    conversations.map(async (c) => {
      // <--- Fix applied here: Convert both IDs to strings for a guaranteed match
      const otherUserId = c.lastMessage.sender.toString() === userId.toString()
        ? c.lastMessage.receiver
        : c.lastMessage.sender;
        
      const otherUser = await User.findById(otherUserId).select('name avatar role');
      const unreadCount = await Message.countDocuments({
        conversationId: c._id,
        receiver: userId,
        readAt: null,
      });
      return {
        conversationId: c._id,
        otherUser,
        lastMessage: c.lastMessage,
        unreadCount,
      };
    })
  );

  return res.status(200).json(new ApiResponse(200, { conversations: populated }));
});

// GET /api/chat/messages/:otherUserId — full history with one person
const getMessages = asyncHandler(async (req, res) => {
  const { otherUserId } = req.params;
  const { page = 1, limit = 30 } = req.query;
  const skip = (page - 1) * limit;

  const conversationId = Message.buildConversationId(req.user._id, otherUserId);

  const [messages, total] = await Promise.all([
    Message.find({ conversationId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Message.countDocuments({ conversationId }),
  ]);

  // Mark messages sent to me as read
  await Message.updateMany(
    { conversationId, receiver: req.user._id, readAt: null },
    { readAt: new Date() }
  );

  return res.status(200).json(
    new ApiResponse(200, {
      messages: messages.reverse(), // oldest first for chat UI
      pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / limit) },
    })
  );
});

// POST /api/chat/messages — send a message
const sendMessage = asyncHandler(async (req, res) => {
  const { receiverId, text } = req.body;

  if (!receiverId || !text?.trim()) {
    throw new ApiError(400, 'receiverId and text are required');
  }

  const receiver = await User.findById(receiverId).select('_id');
  if (!receiver) throw new ApiError(404, 'Receiver not found');

  const conversationId = Message.buildConversationId(req.user._id, receiverId);

  const message = await Message.create({
    sender:         req.user._id,
    receiver:       receiverId,
    conversationId,
    text:           text.trim(),
  });

  // Populate sender so frontend gets name + avatar immediately
  await message.populate('sender', 'name avatar');

  // Emit to receiver's socket room in real time
  const io = req.app.get('io');
  if (io) {
    // 👇 FIX: Changed 'message' to 'message:new' so the React frontend catches it!
    io.to(receiverId.toString()).emit('message:new', message);
  }

  return res.status(201).json(new ApiResponse(201, { message }));
});

module.exports = { getConversations, getMessages,sendMessage };
