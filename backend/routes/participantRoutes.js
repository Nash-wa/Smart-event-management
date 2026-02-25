const express = require('express');
const router = express.Router();
const { addParticipant, getParticipantsByEvent, deleteParticipant, bulkAddParticipants, publicAddParticipant, validateTicket, getTicketById } = require('../controllers/participantController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, addParticipant);

router.route('/bulk')
    .post(protect, bulkAddParticipants);

router.route('/rsvp')
    .post(publicAddParticipant);

router.route('/ticket/:ticketId')
    .get(getTicketById);

router.route('/:eventId')
    .get(protect, getParticipantsByEvent);

router.route('/:id')
    .delete(protect, deleteParticipant);

router.route('/validate/:ticketId')
    .put(protect, validateTicket);

module.exports = router;
