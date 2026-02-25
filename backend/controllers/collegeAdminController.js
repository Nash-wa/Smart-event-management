const asyncHandler = require('express-async-handler');
const College = require('../models/collegeModel');

// @desc    Create a new college
// @route   POST /api/admin/colleges
// @access  Private/Admin
const createCollege = asyncHandler(async (req, res) => {
    const { name, district, address, description, location, tags, isApproved } = req.body;
    if (!name) {
        res.status(400);
        throw new Error('Name is required');
    }

    const exists = await College.findOne({ name });
    if (exists) {
        res.status(400);
        throw new Error('College already exists');
    }

    const college = await College.create({
        name,
        district,
        address,
        description,
        location,
        tags,
        isApproved: isApproved !== undefined ? isApproved : true,
        createdBy: req.user?._id
    });

    res.status(201).json(college);
});

// @desc    Get list of colleges (admin)
// @route   GET /api/admin/colleges
// @access  Private/Admin
const listColleges = asyncHandler(async (req, res) => {
    const { district, page = 1, limit = 100 } = req.query;
    const filter = {};
    if (district) filter.district = district;

    const colleges = await College.find(filter).sort({ name: 1 }).limit(parseInt(limit)).skip((parseInt(page) - 1) * parseInt(limit));
    const total = await College.countDocuments(filter);
    res.json({ data: colleges, total });
});

// @desc    Get a college
// @route   GET /api/admin/colleges/:id
// @access  Private/Admin
const getCollege = asyncHandler(async (req, res) => {
    const college = await College.findById(req.params.id);
    if (!college) {
        res.status(404);
        throw new Error('College not found');
    }
    res.json(college);
});

// @desc    Update a college
// @route   PUT /api/admin/colleges/:id
// @access  Private/Admin
const updateCollege = asyncHandler(async (req, res) => {
    const college = await College.findById(req.params.id);
    if (!college) {
        res.status(404);
        throw new Error('College not found');
    }

    const { name, district, address, description, location, tags, isApproved } = req.body;
    college.name = name || college.name;
    college.district = district || college.district;
    college.address = address || college.address;
    college.description = description || college.description;
    college.location = location || college.location;
    college.tags = tags || college.tags;
    if (isApproved !== undefined) college.isApproved = isApproved;

    const updated = await college.save();
    res.json(updated);
});

// @desc    Delete a college
// @route   DELETE /api/admin/colleges/:id
// @access  Private/Admin
const deleteCollege = asyncHandler(async (req, res) => {
    const college = await College.findById(req.params.id);
    if (!college) {
        res.status(404);
        throw new Error('College not found');
    }
    await college.deleteOne();
    res.json({ message: 'College removed' });
});

module.exports = {
    createCollege,
    listColleges,
    getCollege,
    updateCollege,
    deleteCollege
};
