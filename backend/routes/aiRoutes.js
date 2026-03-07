const express = require('express');
const router = express.Router();
const { analyzeBudget, recommendServices, handleChat } = require('../controllers/aiController');

router.get('/analyze-budget', analyzeBudget);
router.post('/analyze', analyzeBudget);
router.post('/recommend', recommendServices);
router.post('/chat', handleChat);

module.exports = router;
