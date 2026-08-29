const { z } = require('zod');

const updateWorkerProfileSchema = z.object({
  profession: z.string().trim().min(2).max(60).optional(),
  skills: z.array(z.string().trim()).optional(),
  experienceYears: z.coerce.number().min(0).max(60).optional(),
  bio: z.string().max(1000).optional(),
  languages: z.array(z.string().trim()).optional(),
  rateType: z.enum(['hourly', 'daily']).optional(),
  rateAmount: z.coerce.number().min(0).optional(),
  availability: z.enum(['available', 'busy', 'offline']).optional(),
  city: z.string().trim().optional(),
  state: z.string().trim().optional(),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
});

const searchWorkersSchema = z.object({
  profession: z.string().trim().optional(),
  city: z.string().trim().optional(),
  minExperience: z.coerce.number().min(0).optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  availability: z.enum(['available', 'busy', 'offline']).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  skill: z.string().trim().optional(),
  search: z.string().trim().optional(),
  q: z.string().trim().optional(), // free text search
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(12),
  sort: z.enum(['rating', 'price_low', 'price_high', 'experience']).optional(),
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
  radiusKm: z.coerce.number().min(1).max(200).optional(),
});

module.exports = { updateWorkerProfileSchema, searchWorkersSchema };
