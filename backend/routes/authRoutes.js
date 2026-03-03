const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    verifyOTP,
    getUserProfile,
    updateUserProfile,
    forgotPassword,
    verifyResetOTP,
    resetPassword
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/verify-otp', verifyOTP);
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-otp', verifyResetOTP);
router.post('/reset-password', resetPassword);

router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile);

module.exports = router;
