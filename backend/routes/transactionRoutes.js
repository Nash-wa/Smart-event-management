const express = require('express');
const router = express.Router();
const { processPayment, getEarnings } = require('../controllers/transactionController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.post('/pay', protect, processPayment);
router.get('/earnings', protect, adminOnly, getEarnings);

module.exports = router;
