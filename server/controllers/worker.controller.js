const WorkerProfile = require('../models/WorkerProfile');
const User = require('../models/User');
const Report =require('../models/Report')
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const { uploadBuffer, deleteImage } = require('../services/cloudinary.service');
const {sendBanAppealEmailToAdmin} = require('../services/email.service');

// GET /api/workers — search & filter
const searchWorkers = asyncHandler(async (req, res) => {
  const {
    profession,
    search,
    city,
    minExperience,
    minRating,
    availability,
    minPrice,
    maxPrice,
    skill,
    q,
    page,
    limit,
    sort,
    lat,
    lng,
    radiusKm,
  } = req.query;

  const filter = { 'verification.status': { $ne: 'rejected' } };

  if (profession) filter.profession = new RegExp(profession, 'i');

if (search) {
  // Remove profession filter if search is present — they conflict
  delete filter.profession;
  filter.$or = [
    { profession: new RegExp(search, 'i') },
    { bio: new RegExp(search, 'i') },
    { skills: { $elemMatch: { $regex: search, $options: 'i' } } },
    { 'location.city': new RegExp(search, 'i') },
  ];
}
  if (city) filter['location.city'] = new RegExp(city, 'i');
  if (availability) filter.availability = availability;
  if (skill) filter.skills = { $in: [new RegExp(skill, 'i')] };
  if (minExperience) filter.experienceYears = { $gte: minExperience };
  if (minRating) filter.ratingAvg = { $gte: minRating };
  if (minPrice || maxPrice) {
    filter.rateAmount = {};
    if (minPrice) filter.rateAmount.$gte = minPrice;
    if (maxPrice) filter.rateAmount.$lte = maxPrice;
  }
  if (q) {
    filter.$text = { $search: q };
  }

  // Geospatial "nearby" search
  if (lat !== undefined && lng !== undefined) {
    filter['location.coordinates'] = {
      $near: {
        $geometry: { type: 'Point', coordinates: [lng, lat] },
        $maxDistance: (radiusKm || 25) * 1000,
      },
    };
  }

  const sortMap = {
    rating: { ratingAvg: -1 },
    price_low: { rateAmount: 1 },
    price_high: { rateAmount: -1 },
    experience: { experienceYears: -1 },
  };
  const sortStage = sortMap[sort] || { ratingAvg: -1 };

  const skip = (page - 1) * limit;

  const [workers, total] = await Promise.all([
    WorkerProfile.find(filter)
      .populate('user', 'name avatar phone')
      .sort(sortStage)
      .skip(skip)
      .limit(limit),
    WorkerProfile.countDocuments(filter),
  ]);

  return res.status(200).json(
    new ApiResponse(200, {
      workers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  );
});

// GET /api/workers/:id — public profile view
const getWorkerById = asyncHandler(async (req, res) => {
  const worker = await WorkerProfile.findById(req.params.id).populate(
    'user',
    'name avatar phone email isVerified'
  );

  if (!worker) {
    throw new ApiError(404, 'Worker not found');
  }

  return res.status(200).json(new ApiResponse(200, { worker }));
});

// GET /api/workers/me/profile — logged-in worker's own profile
const getMyProfile = asyncHandler(async (req, res) => {
  const worker = await WorkerProfile.findOne({ user: req.user._id }).populate(
    'user',
    'name avatar phone email'
  );

  // 🚨 FIX: Agar profile nahi mili (naya worker hai), toh 404 error mat feko. 
  // Iske bajaye success true aur worker: null bhejo taaki frontend use Onboarding par bhej sake!
  if (!worker) {
    return res.status(200).json(
      new ApiResponse(200, { worker: null, needsOnboarding: true }, 'Worker profile not found. Please complete onboarding.')
    );
  }

  return res.status(200).json(new ApiResponse(200, { worker }));
});

// PATCH /api/workers/me/profile — update own profile & handle onboarding upsert
const updateMyProfile = asyncHandler(async (req, res) => {
  const updates = { ...req.body };

  // Map flat lat/lng from the request into GeoJSON shape
  if (updates.latitude !== undefined && updates.longitude !== undefined) {
    updates.location = updates.location || {};
    updates.location.coordinates = {
      type: 'Point',
      coordinates: [updates.longitude, updates.latitude],
    };
    delete updates.latitude;
    delete updates.longitude;
  }
  if (updates.city || updates.state) {
    updates.location = updates.location || {};
    if (updates.city) updates.location.city = updates.city;
    if (updates.state) updates.location.state = updates.state;
    delete updates.city;
    delete updates.state;
  }

  // 🚨 FIX: 'upsert: true' add kar diya hai. 
  // Isse agar profile nahi bani hogi toh onboarding ke waqt pehli baar create ho jayegi!
  const worker = await WorkerProfile.findOneAndUpdate(
    { user: req.user._id },
    { $set: updates },
    { new: true, runValidators: true, upsert: true, setDefaultsOnInsert: true }
  );

  return res.status(200).json(new ApiResponse(200, { worker }, 'Profile published successfully!'));
});

// PATCH /api/workers/me/availability — quick toggle
const updateAvailability = asyncHandler(async (req, res) => {
  const { availability } = req.body;

  if (!['available', 'busy', 'offline'].includes(availability)) {
    throw new ApiError(400, 'Invalid availability value');
  }

  const worker = await WorkerProfile.findOneAndUpdate(
    { user: req.user._id },
    { availability },
    { new: true }
  );

  return res.status(200).json(new ApiResponse(200, { worker }, 'Availability updated'));
});

// POST /api/workers/me/avatar — upload profile photo
const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'No file uploaded');

  const user = await User.findById(req.user._id);

  if (user.avatar?.publicId) {
    await deleteImage(user.avatar.publicId);
  }

  const { url, publicId } = await uploadBuffer(req.file.buffer, 'workmitra/avatars');
  user.avatar = { url, publicId };
  await user.save({ validateBeforeSave: false });

  return res.status(200).json(new ApiResponse(200, { avatar: user.avatar }, 'Avatar updated'));
});

// POST /api/workers/me/work-images — upload work sample photos (multiple)
const uploadWorkImages = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) throw new ApiError(400, 'No files uploaded');

  const worker = await WorkerProfile.findOne({ user: req.user._id });
  if (!worker) throw new ApiError(404, 'Worker profile not found');

  const uploaded = await Promise.all(
    req.files.map((f) => uploadBuffer(f.buffer, 'workmitra/work-images'))
  );

  worker.workImages.push(...uploaded);
  await worker.save();

  return res.status(200).json(new ApiResponse(200, { workImages: worker.workImages }, 'Images uploaded'));
});

// DELETE /api/workers/me/work-images/:publicId — remove a single work image
const deleteWorkImage = asyncHandler(async (req, res) => {
  const worker = await WorkerProfile.findOne({ user: req.user._id });
  if (!worker) throw new ApiError(404, 'Worker profile not found');

  const { publicId } = req.params;
  const image = worker.workImages.find((img) => img.publicId === publicId);
  if (!image) throw new ApiError(404, 'Image not found');

  await deleteImage(publicId);
  worker.workImages = worker.workImages.filter((img) => img.publicId !== publicId);
  await worker.save();

  return res.status(200).json(new ApiResponse(200, { workImages: worker.workImages }, 'Image removed'));
});

// POST /api/workers/me/verification — submit Aadhaar/ID for verification
const submitVerification = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) throw new ApiError(400, 'Upload at least one document');

  const worker = await WorkerProfile.findOne({ user: req.user._id });
  if (!worker) throw new ApiError(404, 'Worker profile not found');

  const uploaded = await Promise.all(
    req.files.map((f) => uploadBuffer(f.buffer, 'workmitra/verification'))
  );

  worker.verification.status = 'pending';
  worker.verification.aadhaarUrl = uploaded[0]?.url;
  worker.verification.idProofUrl = uploaded[1]?.url;
  await worker.save();

  const VerificationRequest = require('../models/VerificationRequest');
  await VerificationRequest.create({
    worker: worker._id,
    documents: uploaded.map((u) => ({ type: 'id', url: u.url })),
    status: 'pending',
  });

  return res
    .status(200)
    .json(new ApiResponse(200, { worker }, 'Verification documents submitted for review'));
});


 const reportWorker = async (req, res) => {
  try {
    const { reason, details } = req.body;
    const reportedWorkerId = req.params.id; // From the URL /api/workers/:id/report
    const reporterId = req.user._id; // From your auth middleware

    // 1. Basic validation
    if (!reason) {
      return res.status(400).json({ success: false, message: 'Reason is required' });
    }

    // 2. Prevent spam: Check if this user already reported this worker recently
    const existingReport = await Report.findOne({
      reporter: reporterId,
      reportedWorker: reportedWorkerId,
      status: 'pending'
    });

    if (existingReport) {
      return res.status(400).json({ 
        success: false, 
        message: 'You already have a pending report for this worker. Admin is reviewing it.' 
      });
    }

    // 3. Create and save the report for the Admin
    const newReport = await Report.create({
      reporter: reporterId,
      reportedWorker: reportedWorkerId,
      reason,
      details
    });

    res.status(201).json({ 
      success: true, 
      message: 'Report submitted successfully. Admin will review this shortly.',
      report: newReport 
    });

  } catch (error) {
    console.error('Report error:', error);
    res.status(500).json({ success: false, message: 'Server error while submitting report' });
  }
};


// Add this new function
const submitAppeal = async (req, res) => {
  try {
    const { message } = req.body;
    const workerId = req.user._id; // from protect middleware
    const worker = await User.findById(workerId);

    await sendBanAppealEmailToAdmin(worker, message);

    res.status(200).json({ success: true, message: 'Appeal submitted to Admin.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to submit appeal' });
  }
};

// GET /api/workers/wallet
const getMyWallet = async (req, res) => {
  try {
    const worker = await WorkerProfile.findOne({ user: req.user._id });
    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker profile not found' });
    }

    res.status(200).json({ 
      success: true, 
      walletBalance: worker.walletBalance || 0 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch wallet balance' });
  }
};

module.exports = {
  searchWorkers,
  getWorkerById,
  getMyProfile,
  updateMyProfile,
  updateAvailability,
  uploadAvatar,
  uploadWorkImages,
  deleteWorkImage,
  submitVerification,
  reportWorker,
  submitAppeal,
  getMyWallet,
};
