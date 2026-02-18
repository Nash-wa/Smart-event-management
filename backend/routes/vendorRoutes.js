const express = require('express');
const router = express.Router();
<<<<<<< HEAD
const { getVendors, createVendor, approveVendor, getVendorRequests, createVendorReview } = require('../controllers/vendorController');
=======
const {
    getVendors,
    createVendor,
    approveVendor,
    getVendorRequests,
    getVendorById,
    createVendorReview,
    getVendorReviews
} = require('../controllers/vendorController');
>>>>>>> origin/nashwa
const { protect, adminOnly, vendorOnly } = require('../middleware/authMiddleware');

router.route('/')
    .get(getVendors)
    .post(protect, vendorOnly, createVendor);

<<<<<<< HEAD
router.post('/:id/reviews', protect, createVendorReview);

router.put('/:id/approve', protect, adminOnly, approveVendor);

=======
>>>>>>> origin/nashwa
router.get('/requests/:ownerId', protect, vendorOnly, getVendorRequests);

router.put('/:id/approve', protect, adminOnly, approveVendor);

router.route('/:id/reviews')
    .get(getVendorReviews)
    .post(protect, createVendorReview);

router.get('/:id', getVendorById);

module.exports = router;
