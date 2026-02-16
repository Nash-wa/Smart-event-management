const express = require('express');
const router = express.Router();
const {
    createEvent,
    getEvents,
    getEventById,
    updateEvent,
    deleteEvent,
    getEventStats
} = require('../controllers/eventController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getEvents)
    .post(protect, createEvent);

router.get('/stats/me', protect, getEventStats);

router.route('/:id')
    .get(protect, getEventById)
    .put(protect, updateEvent)
    .delete(protect, deleteEvent);

module.exports = router;
