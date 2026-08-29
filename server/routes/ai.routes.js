const router = require('express').Router();
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const WorkerProfile = require('../models/WorkerProfile');
const calculateScore = require('../utils/matchWorkers')


// POST /api/ai/match-workers
// Takes job description, city, budget — returns top 3 worker matches
router.post('/match-workers', asyncHandler(async (req, res) => {
 const { job, city, budget } = req.body;

if (!job || !city || !budget) {
  throw new ApiError(400, "job, city and budget are required");
}

let minBudget = 0;
let maxBudget = 99999;

if (typeof budget === "string") {
  const parts = budget.split("-");
  minBudget = Number(parts[0]) || 0;
  maxBudget = Number(parts[1]) || 99999;
}

const helper = calculateScore(
  {
    profession: "",
    skills: [],
    rateAmount: 0,
    verification: { status: "unverified" },
    ratingAvg: 0,
    experienceYears: 0,
    jobsCompleted: 0
  },
  job,
  0,
  99999
);

let query = {
  "location.city": new RegExp(city, "i"),
  availability: "available",
};

if (helper.detectedProfession) {
  query.profession = new RegExp(helper.detectedProfession, "i");
}

let workers = await WorkerProfile.find(query)
  .populate("user", "name avatar")
  .limit(30);

// Fallback if no profession match
if (workers.length === 0) {
  workers = await WorkerProfile.find({
    "location.city": new RegExp(city, "i"),
    availability: "available",
  })
    .populate("user", "name avatar")
    .limit(30);
}

const rankedWorkers = workers
  .map((worker) => {
    const result = calculateScore(
      worker,
      job,
      minBudget,
      maxBudget
    );

    return {
      worker,
      score: result.score,
      reason: result.reason,
    };
  })
  .sort((a, b) => b.score - a.score);

const results = rankedWorkers
  .slice(0, 3)
  .map(({ worker, score, reason }) => ({
    worker: {
      _id: worker._id,
      profession: worker.profession,
      skills: worker.skills,
      experienceYears: worker.experienceYears,
      rateAmount: worker.rateAmount,
      rateType: worker.rateType,
      ratingAvg: worker.ratingAvg,
      ratingCount: worker.ratingCount,
      jobsCompleted: worker.jobsCompleted,
      availability: worker.availability,
      location: worker.location,
      verification: worker.verification,
      user: worker.user,
    },
    score,
    reason,
  }));

return res.status(200).json(
  new ApiResponse(
    200,
    {
      matches: results,
      total: workers.length,
    },
    "Workers matched successfully"
  )
);
}));



module.exports = router;