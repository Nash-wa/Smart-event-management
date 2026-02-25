const express = require('express');
const router = express.Router();
const { getAllUsers, getStats, deleteUser, getCategories, addCategory, deleteCategory, broadcastMessage } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Note: In production, we'd add adminOnly middleware
router.get('/users', protect, adminOnly, getAllUsers);
router.get('/stats', protect, adminOnly, getStats);
router.delete('/users/:id', protect, adminOnly, deleteUser);

// Category management
router.get('/categories', protect, adminOnly, getCategories);
router.post('/categories', protect, adminOnly, addCategory);
router.delete('/categories/:id', protect, adminOnly, deleteCategory);

// Broadcast to users
router.post('/broadcast', protect, adminOnly, broadcastMessage);

module.exports = router;
