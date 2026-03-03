const express = require('express');
const router = express.Router();
const { saveARLayout, getARLayout } = require('../controllers/arController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, saveARLayout);
router.get('/:event_id', protect, getARLayout);

module.exports = router;
