const express = require('express');
const router = express.Router();
const { getAllUsers, getStats, deleteUser, getUserEvents, getCategories, addCategory, deleteCategory, getAllVendors, getVendorBookings, broadcastMessage } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Note: In production, we'd add adminOnly middleware
router.get('/users', protect, adminOnly, getAllUsers);
router.get('/stats', protect, adminOnly, getStats);
router.delete('/users/:id', protect, adminOnly, deleteUser);
router.get('/users/:id/events', protect, adminOnly, getUserEvents);

// Vendor management
router.get('/vendors', protect, adminOnly, getAllVendors);
router.get('/vendors/:id/bookings', protect, adminOnly, getVendorBookings);

// Category management
router.get('/categories', protect, adminOnly, getCategories);
router.post('/categories', protect, adminOnly, addCategory);
router.delete('/categories/:id', protect, adminOnly, deleteCategory);

// Broadcast to users
router.post('/broadcast', protect, adminOnly, broadcastMessage);

// Historical Ledger
const { authorize } = require('../middleware/authMiddleware');
const { getPastEvents } = require('../controllers/adminController');
router.get('/past-events', protect, authorize('admin'), getPastEvents);

module.exports = router;
