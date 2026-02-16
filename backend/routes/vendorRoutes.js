const express = require('express');
const router = express.Router();
const { getVendors, createVendor, approveVendor, getVendorRequests, getVendorById } = require('../controllers/vendorController');
const { protect, adminOnly, vendorOnly } = require('../middleware/authMiddleware');

router.route('/')
    .get(getVendors)
    .post(protect, vendorOnly, createVendor);

router.get('/requests/:ownerId', protect, vendorOnly, getVendorRequests);

router.put('/:id/approve', protect, adminOnly, approveVendor);

router.get('/:id', getVendorById);

module.exports = router;
