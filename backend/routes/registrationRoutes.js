const express = require('express');
const router = express.Router();
const { registerForEvent, getMyRegistrations, checkInAttendee } = require('../controllers/registrationController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, registerForEvent);
router.get('/my', protect, getMyRegistrations);
router.put('/:id/checkin', protect, checkInAttendee);

module.exports = router;
