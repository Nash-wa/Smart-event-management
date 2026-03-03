const express = require('express');
const router = express.Router();
const { searchVenues } = require('../controllers/venueController');

router.get('/search', searchVenues);

module.exports = router;
