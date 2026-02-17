const asyncHandler = require('express-async-handler');
const Vendor = require('../models/vendorModel');
const mongoose = require('mongoose');

// @desc    Get all approved vendors
// @route   GET /api/vendors
// @access  Public
const getVendors = asyncHandler(async (req, res) => {
    const category = req.query.category;
    const isApproved = req.query.isApproved === 'false' ? false : true;

    // Fallback data if DB is down
    if (mongoose.connection.readyState !== 1) {
        const dummyVendors = [
            { _id: 'v1', name: 'Pixel Perfect Studios', category: 'Photography', price: 500, rating: 4.8, description: 'Capturing moments that last forever.' },
            { _id: 'v2', name: 'Royal Feast Catering', category: 'Catering', price: 1200, rating: 4.9, description: 'Premium buffer and dining.' },
            { _id: 'v3', name: 'DJ Blast', category: 'Music/DJ', price: 300, rating: 4.7, description: 'Rock the dance floor.' },
            { _id: 'v4', name: 'Elegant Decors', category: 'Decoration', price: 400, rating: 4.3, description: 'Minimalist and classy designs.' },
            { _id: 'v5', name: 'Paper & Ink', category: 'Invitation', price: 50, rating: 4.1, description: 'Custom printed and digital cards.' }
        ];

        const filtered = category
            ? dummyVendors.filter(v => v.category === category)
            : dummyVendors;

        return res.json(filtered);
    }

    let query = { isApproved };

    if (category) {
        query.category = category;
    }

    const vendors = await Vendor.find(query);
    res.json(vendors);
});

// @desc    Create a new vendor (requires approval)
// @route   POST /api/vendors
// @access  Private (Vendor)
const createVendor = asyncHandler(async (req, res) => {
    const { name, category, price, description, portfolio, googleReviewsUrl, instagramUrl } = req.body;

    const vendor = await Vendor.create({
        name,
        category,
        price,
        description,
        portfolio: portfolio || [],
        googleReviewsUrl,
        instagramUrl,
        owner: req.user._id, // Secured: uses authenticated user ID
        isApproved: false // Always false on creation
    });

    res.status(201).json(vendor);
});

// @desc    Approve a vendor
// @route   PUT /api/vendors/:id/approve
// @access  Private (Admin)
const approveVendor = asyncHandler(async (req, res) => {
    const vendor = await Vendor.findById(req.params.id);

    if (vendor) {
        vendor.isApproved = true;
        const updatedVendor = await vendor.save();
        res.json(updatedVendor);
    } else {
        res.status(404);
        throw new Error('Vendor not found');
    }
});

const Event = require('../models/eventModel');

// @desc    Get bookings/requests for a specific vendor
// @route   GET /api/vendors/requests/:ownerId
// @access  Private (Vendor)
const getVendorRequests = asyncHandler(async (req, res) => {
    // Find all vendors owned by this user
    const userVendors = await Vendor.find({ owner: req.params.ownerId });
    const vendorIds = userVendors.map(v => v._id.toString());

    // Find events where any of these vendor IDs are in selectedVendors
    // Since selectedVendors is a Map of objects, we might need to search specifically
    const allEvents = await Event.find({}).populate('user', 'name email');

    // Filter events where any selected vendor ID matches our owner's vendors
    const requests = allEvents.filter(event => {
        if (!event.selectedVendors) return false;
        return Array.from(event.selectedVendors.values()).some(v => vendorIds.includes(v._id?.toString()));
    });

    res.json(requests);
});

// @desc    Get vendor by ID
// @route   GET /api/vendors/:id
// @access  Public
const getVendorById = asyncHandler(async (req, res) => {
    const vendor = await Vendor.findById(req.params.id);

    if (vendor) {
        res.json(vendor);
    } else {
        res.status(404);
        throw new Error('Vendor not found');
    }
});

const Review = require('../models/reviewModel');

// @desc    Add review for a vendor
// @route   POST /api/vendors/:id/reviews
// @access  Private
const createVendorReview = asyncHandler(async (req, res) => {
    const { rating, comment } = req.body;

    const vendor = await Vendor.findById(req.params.id);

    if (vendor) {
        const alreadyReviewed = await Review.findOne({ vendor: req.params.id, user: req.user._id });

        if (alreadyReviewed) {
            res.status(400);
            throw new Error('Vendor already reviewed');
        }

        const review = await Review.create({
            vendor: req.params.id,
            user: req.user._id,
            rating: Number(rating),
            comment,
        });

        // Update vendor average rating
        const reviews = await Review.find({ vendor: req.params.id });
        vendor.rating = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;
        await vendor.save();

        res.status(201).json({ message: 'Review added' });
    } else {
        res.status(404);
        throw new Error('Vendor not found');
    }
});

// @desc    Get reviews for a vendor
// @route   GET /api/vendors/:id/reviews
// @access  Public
const getVendorReviews = asyncHandler(async (req, res) => {
    const reviews = await Review.find({ vendor: req.params.id }).populate('user', 'name profilePic');
    res.json(reviews);
});

module.exports = {
    getVendors,
    createVendor,
    approveVendor,
    getVendorRequests,
    getVendorById,
    createVendorReview,
    getVendorReviews
};
