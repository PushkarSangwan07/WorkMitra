// server/models/Report.model.js
const mongoose = require('mongoose');
const reportSchema = new mongoose.Schema(
  {
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // The Customer who is reporting
      required: true,
    },
    reportedWorker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // The Worker being reported
      required: true,
    },
    reason: {
      type: String,
      required: true,
    enum: ['scam', 'no_show', 'unprofessional', 'fake_profile', 'other'], 
    },
    details: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
      default: 'pending',
    },
  },
  { timestamps: true }
);


module.exports = mongoose.model('Report', reportSchema);
