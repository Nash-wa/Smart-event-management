const express = require('express');
const router = express.Router();
const { analyzeBudget, recommendServices } = require('../controllers/aiController');

router.get('/analyze-budget', analyzeBudget);
router.post('/recommend', recommendServices);

module.exports = router;
