const asyncHandler = require('express-async-handler');
const Vendor = require('../models/vendorModel');
const mongoose = require('mongoose');

// @desc    Get all approved vendors
// @route   GET /api/vendors
// @access  Public
const getVendors = asyncHandler(async (req, res) => {
    const { lat, lng, owner, district, category, date } = req.query;
    const isApproved = req.query.isApproved === 'false' ? false : true;

    let query = { isApproved };

    if (owner) {
        query.owner = owner;
    }

    if (category) {
        query.category = category;
    }

    if (district) {
        query.district = district;
    }

    let vendors = await Vendor.find(query);

    // If date is provided, check availability for each vendor
    if (date) {
        const Booking = require('../models/bookingModel');
        const searchDate = new Date(date);

        const vendorsWithAvailability = await Promise.all(vendors.map(async (vendor) => {
            const v = vendor.toObject();
            
            // Check manual unavailability
            const isManuallyUnavailable = v.unavailability?.some(d => 
                new Date(d).toDateString() === searchDate.toDateString()
            );

            // Check existing confirmed bookings
            const hasConfirmedBooking = await Booking.findOne({
                vendor: v._id,
                serviceDate: searchDate,
                status: 'confirmed'
            });

            v.isAvailable = !isManuallyUnavailable && !hasConfirmedBooking;
            return v;
        }));
        vendors = vendorsWithAvailability;
    }

    if (lat && lng) {
        const userLat = parseFloat(lat);
        const userLng = parseFloat(lng);

        vendors = vendors.map(vendor => {
            const v = vendor.toObject ? vendor.toObject() : vendor; // Handle both doc and plain obj
            if (v.location && v.location.lat && v.location.lng) {
                const distance = calculateDistance(userLat, userLng, v.location.lat, v.location.lng);
                return { ...v, distance };
            }
            return { ...v, distance: Infinity };
        }).sort((a, b) => a.distance - b.distance);
    }
    res.json(vendors);
});

// Helper: Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
}

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

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

// @desc    Create a new vendor (requires approval)
// @route   POST /api/vendors
// @access  Private (Vendor)
const createVendor = asyncHandler(async (req, res) => {
    const { name, category, price, description, portfolio, location, district } = req.body;

    const vendor = await Vendor.create({
        name,
        category,
        price,
        description,
        portfolio: portfolio || [],
        location,
        district: district || 'Default District',
        owner: req.user._id, // Secured: uses authenticated user ID
        isApproved: false // Always false on creation
    });

    res.status(201).json(vendor);
});

// @desc    Get vendor reviews
// @route   GET /api/vendors/:id/reviews
// @access  Public
const getVendorReviews = asyncHandler(async (req, res) => {
    const vendor = await Vendor.findById(req.params.id).populate('reviews');
    if (vendor) {
        res.json(vendor.reviews);
    } else {
        res.status(404);
        throw new Error('Vendor not found');
    }
});

// @desc    Add review to vendor
// @route   POST /api/vendors/:id/reviews
// @access  Private
const Review = require('../models/reviewModel');

// @desc    Add review to vendor
// @route   POST /api/vendors/:id/reviews
// @access  Private
const createVendorReview = asyncHandler(async (req, res) => {
    const { rating, comment } = req.body;
    const vendor = await Vendor.findById(req.params.id);

    if (vendor) {
        // Check if user already reviewed
        const alreadyReviewed = await Review.findOne({
            user: req.user._id,
            vendor: vendor._id
        });

        if (alreadyReviewed) {
            res.status(400);
            throw new Error('Vendor already reviewed');
        }

        const review = await Review.create({
            name: req.user.name,
            rating: Number(rating),
            comment,
            user: req.user._id,
            vendor: vendor._id
        });

        vendor.reviews.push(review._id);

        // Recalculate average rating
        const numReviews = vendor.reviewCount || 0;
        const currentRating = vendor.rating || 0;

        vendor.rating = (currentRating * numReviews + Number(rating)) / (numReviews + 1);
        vendor.reviewCount = numReviews + 1;

        await vendor.save();
        res.status(201).json({ message: 'Review added' });
    } else {
        res.status(404);
        throw new Error('Vendor not found');
    }
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
        // Check both direct _id and vendorId field in the Map values
        return Array.from(event.selectedVendors.values()).some(v =>
            vendorIds.includes(v.vendorId?.toString()) || vendorIds.includes(v._id?.toString())
        );
    });

    res.json(requests);
});

// @desc    Update vendor availability
// @route   PUT /api/vendors/:id/availability
// @access  Private (Vendor owner or Admin)
const updateAvailability = asyncHandler(async (req, res) => {
    const { unavailability, workingDays } = req.body;
    const vendor = await Vendor.findById(req.params.id);

    if (vendor) {
        if (vendor.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            res.status(403);
            throw new Error('Not authorized to update this vendor');
        }

        if (unavailability) vendor.unavailability = unavailability;
        if (workingDays) vendor.workingDays = workingDays;

        const updatedVendor = await vendor.save();
        res.json(updatedVendor);
    } else {
        res.status(404);
        throw new Error('Vendor not found');
    }
});

module.exports = {
    getVendors,
    getVendorById,
    createVendor,
    getVendorReviews,
    createVendorReview,
    approveVendor,
    getVendorRequests,
    updateAvailability
};
