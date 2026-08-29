const Booking = require('../models/Booking');
const WorkerProfile = require('../models/WorkerProfile');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const { notify } = require('../services/notification.service');
const Settings = require('../models/Settings');

// Which status transitions are allowed, and who is allowed to make them
const ALLOWED_TRANSITIONS = {
  pending:     { accepted: 'worker', rejected: 'worker', cancelled: 'customer' },
  accepted:    { in_progress: 'worker', cancelled: 'customer' },
  in_progress: { completed: 'worker' },
};

// POST /api/bookings — customer creates a booking request
const createBooking = asyncHandler(async (req, res) => {
  const { workerId, date, timeSlot, description, address } = req.body;

  const worker = await WorkerProfile.findById(workerId).populate('user', 'name phone');
  if (!worker) throw new ApiError(404, 'Worker not found');

  // ── VERIFICATION GATE ──────────────────────────────────────────────────────
  if (worker.verification?.status !== 'verified') {
    throw new ApiError(403,
      worker.verification?.status === 'pending'
        ? 'This worker\'s verification is currently under review. Please check back once they are verified.'
        : 'This worker is not yet verified by WorkMitra. Only verified workers can receive bookings to ensure your safety.'
    );
  }
  // ──────────────────────────────────────────────────────────────────────────

  // ── FINANCIAL PAYWALL GATE ────────────────────────────────────────────────
  const currentBalance = worker.walletBalance || 0;
  if (currentBalance <= -500) {
    throw new ApiError(400, 'This worker is currently unavailable to take new bookings. Please select another professional.');
  }
  // ──────────────────────────────────────────────────────────────────────────

  // 🚨 NEW: ACTIVE JOB LOCKOUT GATE (ANTI-LEAKAGE) ─────────────────────────
  const todayDateString = new Date().toISOString().split('T')[0];
  
  const overdueJobs = await Booking.countDocuments({
    worker: worker._id,
    status: { $in: ['accepted', 'in_progress'] },
    date: { $lt: todayDateString }
  });

  if (overdueJobs > 0) {
    throw new ApiError(400, 'This professional is currently occupied with uncompleted previous jobs and cannot accept new requests right now.');
  }
  // ──────────────────────────────────────────────────────────────────────────

// 🚨 NEW: DOUBLE BOOKING GUARD ─────────────────────────────────────────────
  // Check if the worker already has an active booking for this exact date and time slot
  const overlappingBooking = await Booking.findOne({
    worker: worker._id,
    date,
    timeSlot,
    status: { $in: ['pending', 'accepted', 'in_progress'] }
  });

  if (overlappingBooking) {
    throw new ApiError(400, `This professional is already booked for ${timeSlot} on this date. Please choose a different time or date.`);
  }
  // ──────────────────────────────────────────────────────────────────────────



  if (worker.user._id.equals(req.user._id)) {
    throw new ApiError(400, 'You cannot book yourself');
  }

  if (worker.availability === 'offline') {
    throw new ApiError(400, 'This worker is currently offline and not accepting bookings');
  }

  const booking = await Booking.create({
    customer: req.user._id,
    worker: worker._id,
    date,
    timeSlot,
    description,
    address,
    totalAmount: worker.rateAmount,
  });

  // Notify worker of new booking request
  await notify(req.app.get('io'), {
    userId: worker.user._id,
    type: 'booking_new',
    title: 'New booking request',
    body: `${req.user.name} requested a booking on ${new Date(date).toLocaleDateString('en-IN')}`,
    link: '/worker/bookings',
  });

  return res.status(201).json(
    new ApiResponse(201, { booking }, 'Booking request sent successfully')
  );
});

// GET /api/bookings/me
const getMyBookings = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  let filter;
  if (req.user.role === 'customer') {
    filter = { customer: req.user._id };
  } else if (req.user.role === 'worker') {
    const worker = await WorkerProfile.findOne({ user: req.user._id });
    if (!worker) throw new ApiError(404, 'Worker profile not found');
    filter = { worker: worker._id };
  } else {
    throw new ApiError(403, 'Admins should use /api/admin/bookings');
  }

  if (status) filter.status = status;

  const [bookings, total] = await Promise.all([
    Booking.find(filter)
      .populate('customer', 'name avatar phone')
      .populate({ path: 'worker', populate: { path: 'user', select: 'name avatar phone' } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Booking.countDocuments(filter),
  ]);

  return res.status(200).json(
    new ApiResponse(200, {
      bookings,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    })
  );
});

// GET /api/bookings/:id
const getBookingById = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate('customer', 'name avatar phone')
    .populate({ path: 'worker', populate: { path: 'user', select: 'name avatar phone' } });

  if (!booking) throw new ApiError(404, 'Booking not found');

  const worker = await WorkerProfile.findById(booking.worker._id);
  const isOwner =
    booking.customer._id.equals(req.user._id) ||
    (worker && worker.user.equals(req.user._id));

  if (!isOwner && req.user.role !== 'admin') {
    throw new ApiError(403, 'You do not have access to this booking');
  }

  return res.status(200).json(new ApiResponse(200, { booking }));
});

// PATCH /api/bookings/:id/status
const updateBookingStatus = asyncHandler(async (req, res) => {
  const { status, cancellationReason } = req.body;

  const booking = await Booking.findById(req.params.id).populate('customer', 'name');
  if (!booking) throw new ApiError(404, 'Booking not found');

  const worker = await WorkerProfile.findById(booking.worker).populate('user', 'name');
  if (!worker) throw new ApiError(404, 'Worker not found');

  const isCustomer = booking.customer._id.equals(req.user._id);
  const isWorker   = worker.user._id.equals(req.user._id);

  if (!isCustomer && !isWorker) {
    throw new ApiError(403, 'You do not have access to this booking');
  }

  const rule = ALLOWED_TRANSITIONS[booking.status]?.[status];
  if (!rule) {
    throw new ApiError(400, `Cannot change booking from "${booking.status}" to "${status}"`);
  }

  const actingRole = isWorker ? 'worker' : 'customer';
  if (rule !== actingRole) {
    throw new ApiError(403, `Only the ${rule} can perform this action`);
  }

  // ── WORKER PAYWALL LOCKOUT ───────────────────────────────────────────────
  if (status === 'accepted' && isWorker) {
    const currentBalance = worker.walletBalance || 0;
    if (currentBalance <= -500) {
      throw new ApiError(403, 'Account locked. Please clear your pending platform dues of ₹500 to accept new jobs.');
    }
  }
  // ─────────────────────────────────────────────────────────────────────────

  booking.status = status;

  if (status === 'cancelled') {
    booking.cancelledBy = req.user._id;
    booking.cancellationReason = cancellationReason;
  }

  // ── FINANCIAL LEDGER MATH ────────────────────────────────────────────────
  if (status === 'completed') {
    const amount = booking.totalAmount || 0;
    const paymentMethod = booking.paymentMethod || 'cash'; 
    
    // Fetch global fee setting
    let settings = await Settings.findOne();
    const feePercentage = settings ? settings.platformFeePercentage : 10;
    
    const platformFee = amount * (feePercentage / 100);
    const workerCut = amount - platformFee;

    // Update Lifetime Stats (Tracking NET earnings for accuracy)
    worker.jobsCompleted += 1;
    worker.earnings += workerCut; 
    
    // Ensure walletBalance exists (fallback for older records)
    worker.walletBalance = worker.walletBalance || 0;

    // Ledger Calculation
    if (paymentMethod === 'cash') {
      // The worker kept the physical cash. They owe WorkMitra the commission.
      worker.walletBalance -= platformFee;
    } else {
      // (Future Proofing) WorkMitra collected the money online. You owe the worker their cut.
      worker.walletBalance += workerCut;
    }

    await worker.save();
  }
  // ─────────────────────────────────────────────────────────────────────────

  await booking.save();

  const io = req.app.get('io');

  // Notify on accept/reject
  const notifyMap = {
    accepted: {
      userId: booking.customer._id,
      type: 'booking_accepted',
      title: '✅ Booking accepted',
      body: `${worker.user.name} accepted your booking. You can now chat with them.`,
      link: '/customer/bookings',
    },
    rejected: {
      userId: booking.customer._id,
      type: 'booking_rejected',
      title: 'Booking rejected',
      body: `${worker.user.name} could not take this booking. Try finding another worker.`,
      link: '/customer/bookings',
    },
    completed: {
      userId: booking.customer._id,
      type: 'booking_accepted',
      title: '🎉 Job completed',
      body: `${worker.user.name} marked the job as complete. Leave a review!`,
      link: '/customer/bookings',
    },
  };

  if (notifyMap[status]) {
    await notify(io, { ...notifyMap[status] });
  }

  return res.status(200).json(
    new ApiResponse(200, { booking }, `Booking ${status.replace('_', ' ')}`)
  );
});

// POST /api/bookings/:id/report — customer reports a worker
const reportWorker = asyncHandler(async (req, res) => {
  const { reason, details } = req.body;

  if (!reason) throw new ApiError(400, 'Reason is required');

  const booking = await Booking.findById(req.params.id).populate('worker');

  if (!booking) throw new ApiError(404, 'Booking not found');

  if (!booking.customer.equals(req.user._id)) {
    throw new ApiError(403, 'You can only report your own bookings');
  }

  // Flag the worker profile for admin review
  await WorkerProfile.findByIdAndUpdate(booking.worker._id, {
    $push: {
      reports: {
        reportedBy: req.user._id,
        bookingId: booking._id,
        reason,
        details,
        reportedAt: new Date(),
      },
    },
  });

  return res.status(200).json(
    new ApiResponse(200, null, 'Report submitted. Our team will review within 24 hours.')
  );
});

module.exports = {
  createBooking,
  getMyBookings,
  getBookingById,
  updateBookingStatus,
  reportWorker,
};








