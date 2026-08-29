const router = require('express').Router();

const {
  createReview,
  getWorkerReviews,
  updateReview,
  deleteReview,
} = require('../controllers/review.controller');

const verifyJWT = require('../middleware/auth.middleware');
const restrictTo = require('../middleware/role.middleware');
const validate = require('../middleware/validate.middleware');
const { createReviewSchema, updateReviewSchema } = require('../validators/review.validator');

router.get('/worker/:workerId', getWorkerReviews); // public

router.use(verifyJWT);
router.post('/', restrictTo('customer'), validate(createReviewSchema), createReview);
router.patch('/:id', restrictTo('customer'), validate(updateReviewSchema), updateReview);
router.delete('/:id', deleteReview);

module.exports = router;
