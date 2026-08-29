const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: String,
      required: true,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    readAt: {
      type: Date,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

messageSchema.index({ conversationId: 1, createdAt: 1 });

// Helper to build a deterministic conversation id from two user ids
messageSchema.statics.buildConversationId = function (userIdA, userIdB) {
  return [userIdA.toString(), userIdB.toString()].sort().join('_');
};

module.exports = mongoose.model('Message', messageSchema);
