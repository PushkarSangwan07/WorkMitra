const router = require('express').Router();

const {
  createBooking,
  getMyBookings,
  getBookingById,
  updateBookingStatus,
} = require('../controllers/booking.controller');

const verifyJWT = require('../middleware/auth.middleware');
const restrictTo = require('../middleware/role.middleware');
const validate = require('../middleware/validate.middleware');
const { createBookingSchema, updateBookingStatusSchema } = require('../validators/booking.validator');

router.use(verifyJWT);

router.post('/', restrictTo('customer'), validate(createBookingSchema), createBooking);
router.get('/me', getMyBookings);
router.get('/:id', getBookingById);
router.patch('/:id/status', validate(updateBookingStatusSchema), updateBookingStatus);

module.exports = router;
