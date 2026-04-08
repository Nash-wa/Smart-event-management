const express = require('express');
const router = express.Router();
const {
    createBooking,
    getMyBookings,
    getVendorBookings,
    getEventBookings,
    getAllBookings,
    updateStatus
} = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', createBooking);
router.get('/my', getMyBookings);
router.get('/vendor', getVendorBookings);
router.get('/admin/all', getAllBookings);
router.get('/event/:eventId', getEventBookings);
router.put('/:id', updateStatus);

module.exports = router;
