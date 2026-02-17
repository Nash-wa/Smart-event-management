const asyncHandler = require('express-async-handler');
const Review = require('../models/reviewModel');
const Vendor = require('../models/vendorModel');
const Event = require('../models/eventModel');

// @desc    Create a verified review
// @route   POST /api/reviews
// @access  Private
const createReview = asyncHandler(async (req, res) => {
    const { event: eventId, vendor: vendorId, rating, comment, metrics } = req.body;

    // Verify event exists and belongs to user
    const event = await Event.findById(eventId);
    if (!event || event.user.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Not authorized to review for this event');
    }

    // Check if review already exists
    const existingReview = await Review.findOne({ event: eventId, vendor: vendorId });
    if (existingReview) {
        res.status(400);
        throw new Error('You have already reviewed this vendor for this event');
    }

    const review = await Review.create({
        event: eventId,
        user: req.user._id,
        vendor: vendorId,
        rating,
        comment,
        metrics,
        isVerified: true
    });

    // Update Vendor reliability and rating
    const vendor = await Vendor.findById(vendorId);
    if (vendor) {
        const reviews = await Review.find({ vendor: vendorId });
        const count = reviews.length;

        // Calculate cumulative average rating
        const avgRating = reviews.reduce((acc, item) => item.rating + acc, 0) / count;

        // Calculate cumulative reliability score (0-100)
        // Average of responsiveness, punctuality, quality (each 1-5) converted to percentage
        const avgMetrics = reviews.reduce((acc, item) => {
            return {
                resp: acc.resp + (item.metrics.responsiveness || 5),
                punc: acc.punc + (item.metrics.punctuality || 5),
                qual: acc.qual + (item.metrics.quality || 5)
            };
        }, { resp: 0, punc: 0, qual: 0 });

        const finalMetrics = {
            responsiveness: avgMetrics.resp / count,
            punctuality: avgMetrics.punc / count,
            quality: avgMetrics.qual / count
        };

        const reliabilityScore = ((finalMetrics.responsiveness + finalMetrics.punctuality + finalMetrics.quality) / 15) * 100;

        vendor.rating = avgRating;
        vendor.reviewCount = count;
        vendor.performanceMetrics = finalMetrics;
        vendor.reliabilityScore = Math.round(reliabilityScore);

        await vendor.save();
    }

    res.status(201).json(review);
});

// @desc    Get reviews for a vendor
// @route   GET /api/reviews/vendor/:vendorId
// @access  Public
const getVendorReviews = asyncHandler(async (req, res) => {
    const reviews = await Review.find({ vendor: req.params.vendorId })
        .populate('user', 'name')
        .sort('-createdAt');
    res.json(reviews);
});

module.exports = { createReview, getVendorReviews };
