const mongoose = require('mongoose');

const verificationRequestSchema = new mongoose.Schema(
  {
    worker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WorkerProfile',
      required: true,
      index: true,
    },
    documents: [
      {
        type: { type: String }, // e.g. "aadhaar", "idProof", "certification"
        url: String,
      },
    ],
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewNote: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('VerificationRequest', verificationRequestSchema);
