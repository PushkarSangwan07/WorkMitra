const User = require('../models/User');
const WorkerProfile = require('../models/WorkerProfile');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const VerificationRequest = require('../models/VerificationRequest');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const { notify } = require('../services/notification.service');
const Report = require('../models/Report'); 
const {sendBanNotificationEmail,sendUnbanNotificationEmail} = require('../services/email.service');
const Category = require('../models/Category'); 
const Settings = require('../models/Settings')

// GET /api/admin/analytics
const getAnalytics = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalCustomers,
    totalWorkers,
    totalBookings,
    activeBookings,
    completedBookings,
    revenueAgg,
    topProfessions,
    topCities,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'customer' }),
    User.countDocuments({ role: 'worker' }),
    Booking.countDocuments(),
    Booking.countDocuments({ status: { $in: ['pending', 'accepted', 'in_progress'] } }),
    Booking.countDocuments({ status: 'completed' }),
    Booking.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]),
    WorkerProfile.aggregate([
      { $group: { _id: '$profession', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]),
    WorkerProfile.aggregate([
      { $match: { 'location.city': { $ne: null, $ne: '' } } },
      { $group: { _id: '$location.city', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]),
  ]);

  return res.status(200).json(
    new ApiResponse(200, {
      totalUsers,
      totalCustomers,
      totalWorkers,
      totalBookings,
      activeBookings,
      completedBookings,
      totalRevenue: revenueAgg[0]?.total || 0,
      topProfessions: topProfessions.map((p) => ({ profession: p._id, count: p.count })),
      topCities: topCities.map((c) => ({ city: c._id, count: c.count })),
    })
  );
});

// GET /api/admin/users
const getAllUsers = asyncHandler(async (req, res) => {
  const { role, search, page = 1, limit = 20 } = req.query;
  const skip = (page - 1) * limit;

  const filter = {};
  if (role) filter.role = role;
  if (search) {
    filter.$or = [
      { name: new RegExp(search, 'i') },
      { email: new RegExp(search, 'i') },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    User.countDocuments(filter),
  ]);

  return res.status(200).json(
    new ApiResponse(200, {
      users,
      pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / limit) },
    })
  );
});

// GET /api/admin/workers
const getAllWorkers = asyncHandler(async (req, res) => {
  const { verificationStatus, page = 1, limit = 20 } = req.query;
  const skip = (page - 1) * limit;

  const filter = {};
  if (verificationStatus) filter['verification.status'] = verificationStatus;

  const [workers, total] = await Promise.all([
    WorkerProfile.find(filter)
      .populate('user', 'name email phone avatar isSuspended')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    WorkerProfile.countDocuments(filter),
  ]);

  return res.status(200).json(
    new ApiResponse(200, {
      workers,
      pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / limit) },
    })
  );
});

// GET /api/admin/bookings
const getAllBookings = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const skip = (page - 1) * limit;

  const filter = {};
  if (status) filter.status = status;

  const [bookings, total] = await Promise.all([
    Booking.find(filter)
      .populate('customer', 'name email')
      .populate({ path: 'worker', populate: { path: 'user', select: 'name email' } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Booking.countDocuments(filter),
  ]);

  return res.status(200).json(
    new ApiResponse(200, {
      bookings,
      pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / limit) },
    })
  );
});

// PATCH /api/admin/users/:id/suspend
const suspendUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found');
  if (user.role === 'admin') throw new ApiError(400, 'Cannot suspend an admin account');

  // THE FIX: Flip BOTH switches
  user.isSuspended = true;
  user.isActive = false; 
  await user.save({ validateBeforeSave: false });

  return res.status(200).json(new ApiResponse(200, { user }, 'User suspended'));
});

// PATCH /api/admin/users/:id/unsuspend
const unsuspendUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found');

  // THE FIX: Flip BOTH switches back to normal
  user.isSuspended = false;
  user.isActive = true;
  await user.save({ validateBeforeSave: false });

  // OPTIONAL BONUS: You can also send them the unban email from here!
  if (typeof sendUnbanNotificationEmail === 'function') {
    await sendUnbanNotificationEmail(user.email, user.name);
  }

  return res.status(200).json(new ApiResponse(200, { user }, 'User unsuspended'));
});

// DELETE /api/admin/users/:id
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found');
  if (user.role === 'admin') throw new ApiError(400, 'Cannot delete an admin account');

  if (user.role === 'worker') {
    await WorkerProfile.deleteOne({ user: user._id });
  }
  await user.deleteOne();

  return res.status(200).json(new ApiResponse(200, null, 'User deleted'));
});

// GET /api/admin/verification-requests
const getVerificationRequests = asyncHandler(async (req, res) => {
  const { status = 'pending', page = 1, limit = 20 } = req.query;
  const skip = (page - 1) * limit;

  const filter = { status };

  const [requests, total] = await Promise.all([
    VerificationRequest.find(filter)
      .populate({ path: 'worker', populate: { path: 'user', select: 'name email phone' } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    VerificationRequest.countDocuments(filter),
  ]);

  return res.status(200).json(
    new ApiResponse(200, {
      requests,
      pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / limit) },
    })
  );
});

// PATCH /api/admin/verification-requests/:id
const reviewVerification = asyncHandler(async (req, res) => {
  const { decision, note } = req.body; 

  if (!['approved', 'rejected'].includes(decision)) {
    throw new ApiError(400, 'decision must be "approved" or "rejected"');
  }

  const request = await VerificationRequest.findById(req.params.id);
  if (!request) throw new ApiError(404, 'Verification request not found');

  request.status = decision;
  request.reviewedBy = req.user._id;
  request.reviewNote = note;
  await request.save();

  const worker = await WorkerProfile.findById(request.worker);
  worker.verification.status = decision === 'approved' ? 'verified' : 'rejected';
  worker.verification.reviewedBy = req.user._id;
  worker.verification.reviewedAt = new Date();
  if (decision === 'rejected') worker.verification.rejectionReason = note;
  await worker.save();

  await notify(req.app.get('io'), {
    userId: worker.user,
    type: 'account_verified',
    title: decision === 'approved' ? 'You are now verified!' : 'Verification rejected',
    body: decision === 'approved'
      ? 'Your worker profile has been verified. You now have a verified badge.'
      : `Your verification was rejected: ${note || 'No reason given'}`,
    link: '/worker/dashboard',
  });

  return res.status(200).json(new ApiResponse(200, { worker }, `Verification ${decision}`));
});

 const getAllReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate('reporter', 'name email') 
      .populate('reportedWorker', 'name') 
      .sort({ createdAt: -1 }); 

    res.status(200).json({ success: true, reports });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch reports' });
  }
};

// Update report status (e.g., pending -> resolved)
 const updateReportStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const report = await Report.findByIdAndUpdate(
      req.params.id, 
      { status }, 
      { new: true }
    );
    
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    res.status(200).json({ success: true, report });
  } catch (error) {
    console.error('Error updating report:', error);
    res.status(500).json({ success: false, message: 'Failed to update report status' });
  }
};

const banWorker = async (req, res) => {
  try {
    const providedId = req.params.id;
    // Get the reason from the frontend, or use a default if they didn't provide one
    const { reason = 'Violation of platform policies' } = req.body; 
    
    if (!providedId || providedId === 'undefined') {
      return res.status(400).json({ success: false, message: 'Invalid ID provided.' });
    }
    
    const workerProfile = await WorkerProfile.findById(providedId);
    const targetUserId = workerProfile ? workerProfile.user : providedId;

    const user = await User.findByIdAndUpdate(
      targetUserId,
      { isSuspended: true, isActive: false },
      { new: true }
    );
    
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    
    await sendBanNotificationEmail(user.email, user.name, reason);

    res.status(200).json({ success: true, message: 'Account suspended successfully.' });
  } catch (error) {
    console.error('Error banning:', error);
    res.status(500).json({ success: false, message: 'Failed to ban account' });
  }
};

const unbanWorker = async (req, res) => {
  try {
    const providedId = req.params.id;

    if (!providedId || providedId === 'undefined') {
      return res.status(400).json({ success: false, message: 'Invalid ID provided.' });
    }

    // SMART ID CHECK: Is this a WorkerProfile ID or a User ID?
    const workerProfile = await WorkerProfile.findById(providedId);
    const targetUserId = workerProfile ? workerProfile.user : providedId;

    // Flip BOTH switches back to normal
    const user = await User.findByIdAndUpdate(
      targetUserId,
      { isSuspended: false, isActive: true }, 
      { new: true }
    );

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Send email notification (if you have this imported)
    if (typeof sendUnbanNotificationEmail === 'function') {
      await sendUnbanNotificationEmail(user.email, user.name);
    }

    res.status(200).json({ success: true, message: 'Account restored successfully.' });
  } catch (error) {
    console.error('Error unbanning:', error);
    res.status(500).json({ success: false, message: 'Failed to unban account' });
  }
};



const getAllReviews = async (req, res) => {
  try {
    // Fetches all reviews and populates who wrote it and who received it
    const reviews = await Review.find()
      .populate('customer', 'name email')
      .populate({
        path: 'worker',
        populate: { path: 'user', select: 'name email' }
      })
      .sort({ createdAt: -1 }); 

    res.status(200).json({ success: true, reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch reviews' });
  }
};

const deleteReview = async (req, res) => {
  try {
    const reviewId = req.params.id;
    const review = await Review.findByIdAndDelete(reviewId);
    
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }


    res.status(200).json({ success: true, message: 'Review permanently deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete review' });
  }
};


// --- CATEGORY MANAGEMENT ---
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch categories' });
  }
};

const createCategory = async (req, res) => {
  try {
    const { name, description, icon } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Category name is required' });

    const existing = await Category.findOne({ name });
    if (existing) return res.status(400).json({ success: false, message: 'Category already exists' });

    const newCategory = await Category.create({ name, description, icon });
    res.status(201).json({ success: true, category: newCategory, message: 'Category added!' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create category' });
  }
};

const deleteCategory = async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete category' });
  }
};




const autoSyncCategories = async (req, res) => {
  try {
    // 1. Get all unique professions from existing workers
    const uniqueProfessions = await WorkerProfile.distinct('profession');
    
    let addedCount = 0;

    // 2. Loop through them and add them if they don't exist yet
    for (const prof of uniqueProfessions) {
      if (!prof) continue; 
      
      const exists = await Category.findOne({ name: { $regex: new RegExp(`^${prof}$`, 'i') } });
      
      if (!exists) {
        await Category.create({ 
          name: prof, 
          description: `Professional ${prof} services.`, 
          icon: '✨' 
        });
        addedCount++;
      }
    }

    res.status(200).json({ 
      success: true, 
      message: `Successfully synced ${addedCount} new categories!`,
      addedCount 
    });
  } catch (error) {
    console.error('Sync Error:', error);
    res.status(500).json({ success: false, message: 'Failed to sync categories' });
  }
};


// --- GLOBAL SETTINGS ---
const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = await Settings.create({}); 
    }
    res.status(200).json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch settings' });
  }
};

const updateSettings = async (req, res) => {
  try {
    const { platformFeePercentage, supportEmail, maintenanceMode } = req.body;
    
    // Find the one settings document and update it
    const settings = await Settings.findOneAndUpdate(
      {}, 
      { platformFeePercentage, supportEmail, maintenanceMode },
      { new: true, upsert: true } 
    );
    
    res.status(200).json({ success: true, settings, message: 'Settings saved!' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update settings' });
  }
};


// --- FINANCIALS & TRANSACTIONS ---
const getFinancials = async (req, res) => {
  try {
    // 1. Fetch the platform fee from settings (default to 10% if not found)
    let settings = await Settings.findOne();
    const feePercentage = settings ? settings.platformFeePercentage : 10;
    const feeMultiplier = feePercentage / 100;

    // 2. Fetch all COMPLETED bookings (because you only make money when the job is done)
    const completedBookings = await Booking.find({ status: 'completed' })
      .populate('customer', 'name email')
      .populate({
        path: 'worker',
        populate: { path: 'user', select: 'name email' }
      })
      .sort({ date: -1, createdAt: -1 });

    // 3. Calculate the totals and map the transactions
    let totalVolume = 0;
    
    const transactions = completedBookings.map(b => {
      const amount = b.totalAmount || 0;
      totalVolume += amount;
      
      const platformFee = amount * feeMultiplier;
      const workerPayout = amount - platformFee;

      return {
        _id: b._id,
        date: b.date || b.createdAt,
        customerName: b.customer?.name || 'Unknown Customer',
        workerName: b.worker?.user?.name || 'Unknown Worker',
        totalAmount: amount,
        platformFee: platformFee,
        workerPayout: workerPayout,
        status: 'completed' 
      };
    });

    const totalPlatformEarnings = totalVolume * feeMultiplier;
    const totalWorkerEarnings = totalVolume - totalPlatformEarnings;

    res.status(200).json({
      success: true,
      stats: {
        totalVolume,
        totalPlatformEarnings,
        totalWorkerEarnings,
        feePercentage
      },
      transactions
    });
  } catch (error) {
    console.error('Financials Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch financial data' });
  }
};

// GET /api/admin/revenue
const getRevenueLedger = async (req, res) => {
  try {
    // 1. Calculate total outstanding dues (Sum of all negative wallet balances)
    const pipeline = await WorkerProfile.aggregate([
      { $match: { walletBalance: { $lt: 0 } } },
      { $group: { _id: null, totalPendingDues: { $sum: "$walletBalance" }, debtorsCount: { $sum: 1 } } }
    ]);

    const stats = pipeline[0] || { totalPendingDues: 0, debtorsCount: 0 };

    // 2. Fetch the top 50 workers who owe the most money
    const topDebtors = await WorkerProfile.find({ walletBalance: { $lt: 0 } })
      .populate('user', 'name phone email')
      .sort({ walletBalance: 1 }) // Ascending (most negative first)
      .limit(50);

    // 3. Calculate total gross earnings across the entire platform
    const grossPipeline = await WorkerProfile.aggregate([
      { $group: { _id: null, totalWorkerEarnings: { $sum: "$earnings" } } }
    ]);
    const totalEarnings = grossPipeline[0]?.totalWorkerEarnings || 0;

    res.status(200).json({
      success: true,
      stats: {
        pendingDues: Math.abs(stats.totalPendingDues),
        debtorsCount: stats.debtorsCount,
        totalWorkerEarnings: totalEarnings
      },
      topDebtors
    });
  } catch (error) {
    console.error('Revenue Fetch Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch revenue data' });
  }
};


module.exports = {
  getAnalytics,
  getAllUsers,
  getAllWorkers,
  getAllBookings,
  suspendUser,
  unsuspendUser,
  deleteUser,
  getVerificationRequests,
  reviewVerification,
  getAllReports,
  updateReportStatus, 
  banWorker,
  unbanWorker ,
  getAllReviews,
  deleteReview,
  getCategories,
  createCategory,
  deleteCategory,
  autoSyncCategories,
  getSettings,
  updateSettings,
  getFinancials,
  getRevenueLedger
  
};
