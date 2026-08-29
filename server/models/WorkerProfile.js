const mongoose = require('mongoose');

const workerProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    profession: {
      type: String,
      required: [true, 'Profession is required'],
      trim: true,
      index: true,
    },
    skills: [{ type: String, trim: true }],
    experienceYears: {
      type: Number,
      default: 0,
      min: 0,
    },
    bio: {
      type: String,
      maxlength: 1000,
    },
    languages: [{ type: String, trim: true }],
    rateType: {
      type: String,
      enum: ['hourly', 'daily'],
      default: 'daily',
    },
    rateAmount: {
      type: Number,
      required: [true, 'Rate amount is required'],
      min: 0,
    },
    availability: {
      type: String,
      enum: ['available', 'busy', 'offline'],
      default: 'available',
    },
    workImages: [
      {
        url: String,
        publicId: String,
      },
    ],
    certifications: [
      {
        title: String,
        url: String,
        publicId: String,
      },
    ],
    location: {
      city: { type: String, index: true, trim: true },
      state: { type: String, trim: true },
      coordinates: {
        type: {
          type: String,
          enum: ['Point'],
          default: 'Point',
        },
        coordinates: {
          type: [Number], // [longitude, latitude]
          default: [0, 0],
        },
      },
    },
    verification: {
      status: {
        type: String,
        enum: ['unverified', 'pending', 'verified', 'rejected'],
        default: 'unverified',
      },
      aadhaarUrl: String,
      idProofUrl: String,
      rejectionReason: String,
      reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      reviewedAt: Date,
    },
    ratingAvg: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    ratingCount: {
      type: Number,
      default: 0,
    },
    jobsCompleted: {
      type: Number,
      default: 0,
    },
    earnings: {
      type: Number,
      default: 0,
    },
    walletBalance: {
      type: Number,
      default: 0, 
      // Negative = Worker owes platform (from Cash jobs)
      // Positive = Platform owes Worker (from Online jobs)
    },
  },
  
  { timestamps: true }
);

// Geospatial index for "nearby workers"
workerProfileSchema.index({ 'location.coordinates': '2dsphere' });

// Compound index for the most common filter combo: profession + city + availability
workerProfileSchema.index({ profession: 1, 'location.city': 1, availability: 1 });

// Rating sort index
workerProfileSchema.index({ ratingAvg: -1 });

// Text index for search suggestions / free text search
workerProfileSchema.index({ profession: 'text', skills: 'text', bio: 'text' });

module.exports = mongoose.model('WorkerProfile', workerProfileSchema);
