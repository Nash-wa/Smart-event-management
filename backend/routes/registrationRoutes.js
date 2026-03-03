const express = require('express');
const router = express.Router();
const { registerForEvent, getMyRegistrations, getEventAttendees, checkInAttendee } = require('../controllers/registrationController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, registerForEvent);

router.get('/me', protect, getMyRegistrations);
router.get('/event/:eventId', protect, getEventAttendees);
router.put('/:id/checkin', protect, checkInAttendee);

module.exports = router;
