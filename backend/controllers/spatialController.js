const asyncHandler = require('express-async-handler');

// @desc    Save spatial scan data (AR)
// @route   POST /api/spatial/save-scan
// @access  Public
const saveScan = asyncHandler(async (req, res) => {
    const { coordinates } = req.body;
    console.log(`Received Spatial Scan: ${coordinates}`);
    res.json({
        success: true,
        message: "Scan data processed",
        coordinates
    });
});

module.exports = { saveScan };
