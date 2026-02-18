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
    getPublicEventById
} = require('../controllers/eventController');
const { protect } = require('../middleware/authMiddleware');

router.get('/public', getPublicEvents);
router.get('/public/:id', getPublicEventById);
router.get('/stats/me', protect, getEventStats);

router.route('/')
    .get(protect, getEvents)
    .post(protect, createEvent);

router.route('/:id')
    .get(protect, getEventById)
    .put(protect, updateEvent)
    .delete(protect, deleteEvent);

module.exports = router;
