const express = require('express');
const router = express.Router();
const { broadcastMessage, getMessagesByEvent, getUserMessages } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

router.post('/broadcast', protect, broadcastMessage);
router.get('/feed', protect, getUserMessages);
router.get('/:eventId', getMessagesByEvent);

module.exports = router;
