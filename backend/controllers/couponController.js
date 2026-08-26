const Coupon = require('../models/Coupon');
const Order = require('../models/Order');

exports.getCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find().sort({ createdAt: -1 });
        res.json(coupons);
    } catch {
        res.status(500).json({ error: 'Failed to fetch coupons' });
    }
};

exports.createCoupon = async (req, res) => {
    try {
        const { code, discountType, discountValue, minOrderAmount, isActive } = req.body;
        if (!code || !discountType || isNaN(discountValue)) {
            return res.status(400).json({ error: 'Code, type, and value are required' });
        }
        
        const existing = await Coupon.findOne({ code: code.toUpperCase().trim() });
        if (existing) {
            return res.status(400).json({ error: 'Coupon code already exists' });
        }

        const coupon = new Coupon({
            code: code.toUpperCase().trim(),
            discountType,
            discountValue: Number(discountValue),
            minOrderAmount: Number(minOrderAmount) || 0,
            isActive: isActive !== undefined ? isActive : true
        });

        await coupon.save();
        res.status(201).json(coupon);
    } catch {
        res.status(500).json({ error: 'Failed to create coupon' });
    }
};

exports.deleteCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findByIdAndDelete(req.params.id);
        if (!coupon) return res.status(404).json({ error: 'Coupon not found' });
        res.json({ message: 'Coupon deleted successfully' });
    } catch {
        res.status(500).json({ error: 'Failed to delete coupon' });
    }
};

exports.validateCoupon = async (req, res) => {
    try {
        const { code, subtotal, email } = req.body;
        if (!code) return res.status(400).json({ error: 'Coupon code is required' });
        if (isNaN(subtotal) || subtotal <= 0) return res.status(400).json({ error: 'Invalid subtotal' });

        const coupon = await Coupon.findOne({ code: code.toUpperCase().trim(), isActive: true });
        if (!coupon) {
            return res.status(404).json({ error: 'Invalid or inactive coupon code' });
        }

        if (coupon.code === 'WELCOMEOWEN') {
            if (!email) {
                return res.status(400).json({ error: 'Email is required to validate this welcome coupon. Please log in.' });
            }
            const orderCount = await Order.countDocuments({ email: email.toLowerCase() });
            if (orderCount > 0) {
                return res.status(400).json({ error: 'The WELCOMEOWEN coupon is only valid for your first order!' });
            }
        }

        if (subtotal < coupon.minOrderAmount) {
            return res.status(400).json({ error: `Minimum order amount of ₹${coupon.minOrderAmount} required for this coupon` });
        }

        let discountAmount = 0;
        if (coupon.discountType === 'percentage') {
            discountAmount = Math.round((subtotal * coupon.discountValue) / 100);
        } else {
            discountAmount = coupon.discountValue;
        }

        // Cap discount at subtotal
        discountAmount = Math.min(discountAmount, subtotal);
        const newTotal = subtotal - discountAmount;

        res.json({
            isValid: true,
            code: coupon.code,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
            discountAmount,
            newTotal
        });
    } catch {
        res.status(500).json({ error: 'Failed to validate coupon' });
    }
};
