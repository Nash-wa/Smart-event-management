const express = require('express');
const router = express.Router();
const { createEvent, getEvents, getEventById } = require('../controllers/eventController');

router.route('/').get(getEvents).post(createEvent);
router.route('/:id').get(getEventById);

module.exports = router;
