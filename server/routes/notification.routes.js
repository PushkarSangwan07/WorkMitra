const router = require('express').Router();
const { getMyNotifications, markAsRead, markAllAsRead } = require('../controllers/notification.controller');
const verifyJWT = require('../middleware/auth.middleware');

router.use(verifyJWT);

router.get('/me', getMyNotifications);
router.patch('/:id/read', markAsRead);
router.patch('/read-all', markAllAsRead);

module.exports = router;
