const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken } = require('../middleware/auth');

router.post('/signup', userController.signup);
router.post('/login', userController.login);
router.post('/google', userController.googleAuth);
router.get('/verify', verifyToken, userController.verifyAuth);
router.put('/dismiss-welcome-coupon', verifyToken, userController.dismissWelcomeCoupon);

module.exports = router;
