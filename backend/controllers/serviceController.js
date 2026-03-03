const asyncHandler = require('express-async-handler');
const Service = require('../models/serviceModel');

// @desc    Get all services
// @route   GET /api/services
// @access  Public
const getServices = asyncHandler(async (req, res) => {
    const { category } = req.query;
    let filter = { isActive: true };
    if (category) filter.category = category;

    const services = await Service.find(filter)
        .populate('vendor', 'name email')
        .sort({ createdAt: -1 });

    res.status(200).json(services);
});

// @desc    Get service by ID
// @route   GET /api/services/:id
// @access  Public
const getServiceById = asyncHandler(async (req, res) => {
    const service = await Service.findById(req.params.id)
        .populate('vendor', 'name email');

    if (!service) {
        res.status(404);
        throw new Error('Service not found');
    }
    res.status(200).json(service);
});

// @desc    Create service
// @route   POST /api/services
// @access  Private (Vendor only)
const createService = asyncHandler(async (req, res) => {
    const { name, category, description, price, images } = req.body;

    if (!name || !category || !price) {
        res.status(400);
        throw new Error('Please provide name, category and price');
    }

    const service = await Service.create({
        name,
        category,
        description,
        price,
        images: images || [],
        vendor: req.user._id
    });

    res.status(201).json(service);
});

// @desc    Update service
// @route   PUT /api/services/:id
// @access  Private (Vendor owner)
const updateService = asyncHandler(async (req, res) => {
    const service = await Service.findById(req.params.id);

    if (!service) {
        res.status(404);
        throw new Error('Service not found');
    }

    if (service.vendor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        res.status(403);
        throw new Error('Not authorized to update this service');
    }

    const updatedService = await Service.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
    );

    res.status(200).json(updatedService);
});

// @desc    Delete service
// @route   DELETE /api/services/:id
// @access  Private (Vendor owner)
const deleteService = asyncHandler(async (req, res) => {
    const service = await Service.findById(req.params.id);

    if (!service) {
        res.status(404);
        throw new Error('Service not found');
    }

    if (service.vendor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        res.status(403);
        throw new Error('Not authorized to delete this service');
    }

    await Service.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Service deleted' });
});

module.exports = {
    getServices,
    getServiceById,
    createService,
    updateService,
    deleteService
};
