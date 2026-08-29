const router = require('express').Router();

// 1. IMPORT EVERY SINGLE FUNCTION WE CREATED
const {
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
  unbanWorker,
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
} = require('../controllers/admin.controller');

const verifyJWT = require('../middleware/auth.middleware');
const restrictTo = require('../middleware/role.middleware');

// Protect all admin routes
router.use(verifyJWT, restrictTo('admin'));

// --- DASHBOARD & USERS ---
router.get('/analytics', getAnalytics);
router.get('/users', getAllUsers);
router.get('/workers', getAllWorkers);
router.get('/bookings', getAllBookings);

// --- USER MANAGEMENT ---
router.patch('/users/:id/suspend', suspendUser);
router.patch('/users/:id/unsuspend', unsuspendUser);
router.delete('/users/:id', deleteUser);

// --- WORKER MANAGEMENT ---
router.post('/workers/:id/ban', banWorker);
router.post('/workers/:id/unban', unbanWorker);
router.get('/verification-requests', getVerificationRequests);
router.patch('/verification-requests/:id', reviewVerification);

// --- REPORTS & REVIEWS ---
router.get('/reports', getAllReports);
router.patch('/reports/:id/status', updateReportStatus);
router.get('/reviews', getAllReviews);
router.delete('/reviews/:id', deleteReview);

// --- CATEGORIES (Make sure sync is ABOVE the /:id routes!) ---
router.post('/categories/sync', autoSyncCategories);
router.get('/categories', getCategories);
router.post('/categories', createCategory);
router.delete('/categories/:id', deleteCategory);



// --- PLATFORM SETTINGS ---
router.get('/settings', getSettings);
router.patch('/settings', updateSettings);
router.get('/financials', getFinancials);


// --- REVENUE LEDGER ---
router.get('/revenue', getRevenueLedger);
module.exports = router;
