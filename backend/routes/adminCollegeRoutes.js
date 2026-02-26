const express = require('express');
const router = express.Router();
const {
    createCollege,
    listColleges,
    getCollege,
    updateCollege,
    deleteCollege
} = require('../controllers/collegeAdminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.use(protect);
router.use(adminOnly);

router.route('/').get(listColleges).post(createCollege);
router.route('/:id').get(getCollege).put(updateCollege).delete(deleteCollege);

module.exports = router;
