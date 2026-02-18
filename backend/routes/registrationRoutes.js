const express = require('express');
const router = express.Router();
<<<<<<< HEAD
const { registerForEvent, getMyRegistrations, checkInAttendee } = require('../controllers/registrationController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, registerForEvent);
router.get('/my', protect, getMyRegistrations);
=======
const { registerForEvent, getMyRegistrations, getEventAttendees, checkInAttendee } = require('../controllers/registrationController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, registerForEvent);

router.get('/me', protect, getMyRegistrations);
router.get('/event/:eventId', protect, getEventAttendees);
>>>>>>> origin/nashwa
router.put('/:id/checkin', protect, checkInAttendee);

module.exports = router;
