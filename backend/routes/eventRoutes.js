const express = require('express');
const router = express.Router();
const { createEvent, getEvents, getEventById, updateEvent, getPublicEventById } = require('../controllers/eventController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getEvents)
    .post(protect, createEvent);

router.route('/public/:id')
    .get(getPublicEventById);

router.route('/:id')
    .get(protect, getEventById)
    .put(protect, updateEvent);

module.exports = router;
