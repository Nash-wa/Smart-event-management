const express = require('express');
const router = express.Router();
<<<<<<< HEAD
const { createEvent, getEvents, getEventById, updateEvent, getPublicEventById } = require('../controllers/eventController');
=======
const {
    createEvent,
    getEvents,
    getEventById,
    updateEvent,
    deleteEvent,
    getEventStats,
    getPublicEvents
} = require('../controllers/eventController');
>>>>>>> origin/nashwa
const { protect } = require('../middleware/authMiddleware');

router.get('/public', getPublicEvents);

router.route('/')
    .get(protect, getEvents)
    .post(protect, createEvent);

<<<<<<< HEAD
router.route('/public/:id')
    .get(getPublicEventById);

router.route('/:id')
    .get(protect, getEventById)
    .put(protect, updateEvent);
=======
router.get('/stats/me', protect, getEventStats);

router.route('/:id')
    .get(protect, getEventById)
    .put(protect, updateEvent)
    .delete(protect, deleteEvent);
>>>>>>> origin/nashwa

module.exports = router;
