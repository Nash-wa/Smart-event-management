const express = require('express');
const router = express.Router();
const { getVendors, createVendor, approveVendor, getVendorRequests } = require('../controllers/vendorController');
const { adminOnly, vendorOnly } = require('../middleware/authMiddleware');

router.route('/')
    .get(getVendors)
    .post(createVendor); // Add vendorOnly middleware in a real app

router.put('/:id/approve', approveVendor); // Add adminOnly middleware in a real app

router.get('/requests/:ownerId', getVendorRequests);

module.exports = router;
