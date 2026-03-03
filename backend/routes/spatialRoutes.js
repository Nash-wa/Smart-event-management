const express = require('express');
const router = express.Router();
const { saveScan } = require('../controllers/spatialController');

router.post('/save-scan', saveScan);

module.exports = router;
