const express = require('express');
const router = express.Router();
const {
    createEvent,
    getEvents,
    getEventById,
    updateEvent,
    deleteEvent,
    getEventStats,
    getPublicEvents,
    getPublicEventById,
    addNode,
    deleteNode,
    getPublicNodes
} = require('../controllers/eventController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.get('/public', getPublicEvents);
router.get('/public/:id', getPublicEventById);
router.get('/public/:id/nodes', getPublicNodes);

// Stats
router.get('/stats/me', protect, getEventStats);

// Protected routes
router.route('/')
    .get(protect, getEvents)
    .post(protect, createEvent);

router.route('/:id')
    .get(protect, getEventById)
    .put(protect, updateEvent)
    .delete(protect, deleteEvent);

router.route('/:id/nodes')
    .post(protect, addNode);

router.route('/:id/nodes/:nodeId')
    .delete(protect, deleteNode);

module.exports = router;
