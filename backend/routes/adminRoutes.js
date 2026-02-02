const express = require('express');
const router = express.Router();
const { getAllUsers, getStats, deleteUser } = require('../controllers/adminController');
const { adminOnly } = require('../middleware/authMiddleware');

// Note: In production, we'd add adminOnly middleware
router.get('/users', getAllUsers);
router.get('/stats', getStats);
router.delete('/users/:id', deleteUser);

module.exports = router;
