const router = require('express').Router();
const { getConversations, getMessages, sendMessage } = require('../controllers/chat.controller');
const verifyJWT = require('../middleware/auth.middleware');

router.use(verifyJWT);

router.get('/conversations', getConversations);
router.get('/messages/:otherUserId', getMessages);
router.post('/messages', sendMessage); // ← ADD THIS

module.exports = router;