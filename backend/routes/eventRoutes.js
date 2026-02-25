const express = require('express');
const router = express.Router();
const {
    createEvent,
    getEvents,
    getEventById,
    updateEvent,
    getPublicEventById,
    addNode,
    deleteNode,
    getPublicNodes
} = require('../controllers/eventController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.get('/public/:id', getPublicEventById);
router.get('/public/:id/nodes', getPublicNodes);

// Protected routes
router.route('/')
    .get(protect, getEvents)
    .post(protect, createEvent);

router.route('/:id')
    .get(protect, getEventById)
    .put(protect, updateEvent);

router.route('/:id/nodes')
    .post(protect, addNode);

router.route('/:id/nodes/:nodeId')
    .delete(protect, deleteNode);

module.exports = router;
