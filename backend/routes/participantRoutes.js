const express = require('express');
const router = express.Router();
const { addParticipant, getParticipantsByEvent, deleteParticipant, bulkAddParticipants, publicAddParticipant } = require('../controllers/participantController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, addParticipant);

router.route('/bulk')
    .post(protect, bulkAddParticipants);

router.route('/rsvp')
    .post(publicAddParticipant);

router.route('/:eventId')
    .get(protect, getParticipantsByEvent);

router.route('/:id')
    .delete(protect, deleteParticipant);

module.exports = router;
