const asyncHandler = require('express-async-handler');
const Booking = require('../models/bookingModel');
const Vendor = require('../models/vendorModel'); // Using Vendor instead of Service
const Event = require('../models/eventModel');

// @desc    Create a booking
// @route   POST /api/bookings
// @access  Private
const createBooking = asyncHandler(async (req, res) => {
    const { vendorId, eventId, serviceDate, notes } = req.body;

    if (!vendorId || !eventId || !serviceDate) {
        res.status(400);
        throw new Error('Please provide vendorId, eventId, and serviceDate');
    }

    const vendorDoc = await Vendor.findById(vendorId);
    if (!vendorDoc) {
        res.status(404);
        throw new Error('Vendor not found');
    }

    const event = await Event.findById(eventId);
    if (!event) {
        res.status(404);
        throw new Error('Event not found');
    }

    // Verify ownership
    if (event.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        res.status(403);
        throw new Error('Not authorized to book services for this event');
    }

    // Check availability: Existing confirmed bookings on the same date
    const existingBooking = await Booking.findOne({
        vendor: vendorId,
        serviceDate: new Date(serviceDate),
        status: 'confirmed'
    });

    if (existingBooking) {
        res.status(400);
        throw new Error('Vendor is already booked/confirmed for this date');
    }

    // Check availability: Vendor's marked unavailability
    const isUnavailable = vendorDoc.unavailability.some(d => 
        new Date(d).toDateString() === new Date(serviceDate).toDateString()
    );

    if (isUnavailable) {
        res.status(400);
        throw new Error('Vendor is not available on this date');
    }

    const totalPrice = vendorDoc.price;

    const booking = await Booking.create({
        user: req.user._id,
        vendor: vendorId,
        event: eventId,
        serviceDate,
        totalPrice,
        notes,
        status: 'pending'
    });

    // Ensure selectedVendors Map exists
    if (!event.selectedVendors) {
        event.selectedVendors = new Map();
    }

    // Update event selected vendors Map
    event.selectedVendors.set(vendorDoc.category, {
        _id: vendorDoc.owner,
        vendorId: vendorId,
        name: vendorDoc.name,
        price: vendorDoc.price,
        status: 'Booked'
    });

    // If the booked service is a venue, update the event's central location for spatial AR navigation
    const venueKeywords = ['venue', 'auditorium', 'hall', 'convention', 'stadium', 'building', 'establishment', 'center'];
    const isVenue = venueKeywords.some(kw => 
        (vendorDoc.category || '').toLowerCase().includes(kw) || 
        (vendorDoc.name || '').toLowerCase().includes(kw)
    );

    if (isVenue && vendorDoc.location && vendorDoc.location.lat && vendorDoc.location.lng) {
        event.venue = vendorDoc.name;
        event.address = vendorDoc.address || event.address;
        event.location = {
            lat: vendorDoc.location.lat,
            lng: vendorDoc.location.lng,
            displayAddress: vendorDoc.address || (event.location ? event.location.displayAddress : '')
        };
    }

    event.usedBudget = (event.usedBudget || 0) + totalPrice;
    event.remainingBudget = (event.budget || 0) - event.usedBudget;
    await event.save();

    res.status(201).json(booking);
});

// @desc    Get user's my bookings
// @route   GET /api/bookings/my
// @access  Private
const getMyBookings = asyncHandler(async (req, res) => {
    const bookings = await Booking.find({ user: req.user._id })
        .populate('vendor') // Populate vendor instead of service
        .populate('event', 'name startDate')
        .sort({ createdAt: -1 });

    res.status(200).json(bookings);
});

// @desc    Get vendor's bookings
// @route   GET /api/bookings/vendor
// @access  Private (Vendor only)
const getVendorBookings = asyncHandler(async (req, res) => {
    // Find vendors owned by this user
    const vendors = await Vendor.find({ owner: req.user._id }).select('_id');
    const vendorIds = vendors.map(v => v._id);

    const bookings = await Booking.find({ vendor: { $in: vendorIds } })
        .populate('vendor')
        .populate('event', 'name startDate')
        .populate('user', 'name email')
        .sort({ createdAt: -1 });

    res.status(200).json(bookings);
});

// @desc    Get all bookings (Admin only)
// @route   GET /api/bookings/admin/all
// @access  Private (Admin only)
const getAllBookings = asyncHandler(async (req, res) => {
    if (req.user.role !== 'admin') {
        res.status(403);
        throw new Error('Not authorized as admin');
    }

    const bookings = await Booking.find({})
        .populate('vendor', 'name category price owner')
        .populate('event', 'name startDate')
        .populate('user', 'name email')
        .sort({ createdAt: -1 });

    res.status(200).json(bookings);
});

// @desc    Update booking status
// @route   PUT /api/bookings/:id
// @access  Private (Vendor only)
const updateStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id).populate('vendor');

    if (!booking) {
        res.status(404);
        throw new Error('Booking not found');
    }

    // Auth check: Is this the vendor for this service?
    // Vendor owner check via the vendor model
    const vendor = await Vendor.findById(booking.vendor);
    if (!vendor || (vendor.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin')) {
        res.status(403);
        throw new Error('Not authorized to update this booking status');
    }

    booking.status = status;
    const updated = await booking.save();

    // Also update the status in the event's selectedVendors map
    const event = await Event.findById(booking.event);
    if (event && event.selectedVendors) {
        // Find which category this vendor belongs to
        const vendor = await Vendor.findById(booking.vendor);
        if (vendor && event.selectedVendors.has(vendor.category)) {
            const vendorInfo = event.selectedVendors.get(vendor.category);
            vendorInfo.status = status.charAt(0).toUpperCase() + status.slice(1); // e.g. 'Confirmed'
            event.selectedVendors.set(vendor.category, vendorInfo);

            // Recalculate readiness if confirmed
            if (status === 'confirmed') {
                let score = 30; // Base
                if (event.venue) score += 20;
                if (event.budget > 0) score += 20;
                const confirmedCount = Array.from(event.selectedVendors.values()).filter(v => v.status === 'Confirmed').length;
                if (confirmedCount >= 2) score += 30;
                event.readinessScore = Math.min(score, 100);
            }

            await event.save();
        }
    }

    res.status(200).json(updated);
});

// @desc    Get all bookings for a specific event
// @route   GET /api/bookings/event/:eventId
// @access  Private
const getEventBookings = asyncHandler(async (req, res) => {
    const bookings = await Booking.find({ event: req.params.eventId })
        .populate('vendor')
        .populate('user', 'name email')
        .sort({ createdAt: -1 });

    res.status(200).json(bookings);
});

module.exports = {
    createBooking,
    getMyBookings,
    getVendorBookings,
    getAllBookings,
    getEventBookings,
    updateStatus
};
