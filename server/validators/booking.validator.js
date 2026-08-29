const { z } = require('zod');

const createBookingSchema = z.object({
  workerId: z.string().min(1, 'workerId is required'),
  date: z.coerce.date({ errorMap: () => ({ message: 'A valid date is required' }) }),
  timeSlot: z.string().min(1, 'Time slot is required'),
  description: z.string().max(1000).optional(),
  address: z.string().min(5, 'Address is required'),
});

const updateBookingStatusSchema = z.object({
  status: z.enum(['accepted', 'rejected', 'in_progress', 'completed', 'cancelled']),
  cancellationReason: z.string().max(500).optional(),
});

module.exports = { createBookingSchema, updateBookingStatusSchema };
