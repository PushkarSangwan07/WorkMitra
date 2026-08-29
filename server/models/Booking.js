const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
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
    date: {
      type: Date,
      required: true,
    },
    timeSlot: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      maxlength: 1000,
    },
    address: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'in_progress', 'completed', 'cancelled'],
      default: 'pending',
    },
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    cancellationReason: String,
    totalAmount: Number,
  },
  { timestamps: true }
);

bookingSchema.index({ customer: 1, status: 1 });
bookingSchema.index({ worker: 1, status: 1 });
bookingSchema.index({ date: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
