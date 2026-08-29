const Booking = require('../models/Booking');
const WorkerProfile = require('../models/WorkerProfile');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const Settings = require('../models/Settings');

const getRevenueHistory = asyncHandler(async (req, res) => {
  const worker = await WorkerProfile.findOne({ user: req.user._id });
  if (!worker) {
    return res.status(404).json({ success: false, message: 'Worker not found' });
  }

  // Fetch global fee setting (fallback to 10%)
  let settings = await Settings.findOne();
  const feePercentage = settings ? settings.platformFeePercentage : 10;

  // Find all completed jobs for this worker
  const completedBookings = await Booking.find({ 
    worker: worker._id, 
    status: 'completed' 
  })
  .populate('customer', 'name')
  .sort({ updatedAt: -1 });

  let dynamicLedger = [];

  // Generate dynamic transactions based on past jobs
  completedBookings.forEach((job) => {
    const amount = job.totalAmount || 0;
    const platformFee = amount * (feePercentage / 100);
    const workerEarned = amount - platformFee;

    // 1. Credit: What the worker earned
    dynamicLedger.push({
      _id: `credit_${job._id}`,
      title: `Job Payout: ${job.customer?.name || 'Customer'}`,
      amount: workerEarned,
      type: 'credit',
      status: 'completed',
      createdAt: job.updatedAt
    });

    // 2. Debit: The platform fee deducted
    dynamicLedger.push({
      _id: `debit_${job._id}`,
      title: `Platform Fee (${feePercentage}%)`,
      amount: -platformFee,
      type: 'debit',
      status: 'completed',
      createdAt: job.updatedAt
    });
  });

  // Sort the combined ledger so newest events are at the top
  dynamicLedger.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return res.status(200).json(
    new ApiResponse(200, { transactions: dynamicLedger }, 'Revenue history generated')
  );
});

module.exports = { getRevenueHistory };