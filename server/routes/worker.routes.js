const router = require('express').Router();

const {
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
  getMyWallet
} = require('../controllers/worker.controller');

const {getRevenueHistory} = require('../controllers/revenue.controller')
const verifyJWT = require('../middleware/auth.middleware');
const restrictTo = require('../middleware/role.middleware');
const validate = require('../middleware/validate.middleware');
const upload = require('../middleware/upload.middleware');
const { updateWorkerProfileSchema, searchWorkersSchema } = require('../validators/worker.validator');
const {createOrder,verifyPayment} = require('../controllers/payment.controller')



// Public search
router.get('/', validate(searchWorkersSchema, 'query'), searchWorkers);

// ⚠️  /me/* routes MUST come before /:id — otherwise Express treats
// the literal string "me" as a MongoDB ObjectId and the request crashes.
router.get('/me/profile', verifyJWT, restrictTo('worker'), getMyProfile);
router.patch('/me/profile', verifyJWT, restrictTo('worker'), validate(updateWorkerProfileSchema), updateMyProfile);
router.patch('/me/availability', verifyJWT, restrictTo('worker'), updateAvailability);
router.post('/me/avatar', verifyJWT, restrictTo('worker'), upload.single('avatar'), uploadAvatar);
router.post('/me/work-images', verifyJWT, restrictTo('worker'), upload.array('images', 6), uploadWorkImages);
router.delete('/me/work-images/:publicId', verifyJWT, restrictTo('worker'), deleteWorkImage);
router.post('/me/verification', verifyJWT, restrictTo('worker'), upload.array('documents', 3), submitVerification);
router.post('/:id/report', verifyJWT, restrictTo('customer'), reportWorker);
router.post('/me/appeal', verifyJWT, restrictTo('worker'), submitAppeal);
router.get('/me/wallet', verifyJWT, restrictTo('worker'), getMyWallet);
router.get('/me/history',verifyJWT,restrictTo('worker'),getRevenueHistory)

// Payment routes
router.post('/payment/create-order', verifyJWT, restrictTo('worker'), createOrder);
router.post('/payment/verify', verifyJWT, restrictTo('worker'), verifyPayment);
// Public profile view — comes AFTER /me/* routes
router.get('/:id', getWorkerById);

module.exports = router;
