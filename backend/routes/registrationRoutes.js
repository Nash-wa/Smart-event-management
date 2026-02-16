const express = require('express');
const router = express.Router();
const { registerForEvent, getMyRegistrations, getEventAttendees } = require('../controllers/registrationController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, registerForEvent);

router.get('/me', protect, getMyRegistrations);
router.get('/event/:eventId', protect, getEventAttendees);

module.exports = router;
