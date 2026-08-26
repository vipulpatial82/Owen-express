const express = require('express');
const router = express.Router();
const { getCoupons, createCoupon, deleteCoupon, validateCoupon } = require('../controllers/couponController');
const { verifyToken } = require('../middleware/auth');

// Admin-only check middleware
const isAdmin = (req, res, next) => {
    if (req.userId !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Admin only.' });
    }
    next();
};

router.post('/validate', validateCoupon);
router.get('/', verifyToken, isAdmin, getCoupons);
router.post('/', verifyToken, isAdmin, createCoupon);
router.delete('/:id', verifyToken, isAdmin, deleteCoupon);

module.exports = router;
