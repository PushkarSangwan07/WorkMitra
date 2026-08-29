const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    worker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WorkerProfile',
      required: true,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Prevent duplicate favorites
favoriteSchema.index({ customer: 1, worker: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema);
