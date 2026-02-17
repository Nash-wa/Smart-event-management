const express = require('express');
const router = express.Router();
const { getVendors, createVendor, approveVendor, getVendorRequests, createVendorReview } = require('../controllers/vendorController');
const { protect, adminOnly, vendorOnly } = require('../middleware/authMiddleware');

router.route('/')
    .get(getVendors)
    .post(protect, vendorOnly, createVendor);

router.post('/:id/reviews', protect, createVendorReview);

router.put('/:id/approve', protect, adminOnly, approveVendor);

router.get('/requests/:ownerId', protect, vendorOnly, getVendorRequests);

module.exports = router;
