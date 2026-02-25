const express = require('express');
const router = express.Router();
const { searchColleges } = require('../controllers/collegeController');

// GET /api/colleges?q=...&district=...
router.get('/', searchColleges);

module.exports = router;
