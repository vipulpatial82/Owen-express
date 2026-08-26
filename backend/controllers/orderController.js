const Order = require('../models/Order');
const Coupon = require('../models/Coupon');
const User = require('../models/User');

exports.createOrder = async (req, res) => {
    try {
        const { name, address, phone, email, cart, total, subtotal, discountAmount, couponApplied, paymentMethod } = req.body;
        if (!cart || cart.length === 0) return res.status(400).json({ error: 'Cart is empty' });
        if (!name || !address || !phone || !email) return res.status(400).json({ error: 'All fields are required' });
        if (isNaN(total) || total < 0) return res.status(400).json({ error: 'Invalid total amount' });

        // Server-side validation of coupon discount to prevent tampering
        let calculatedDiscount = 0;
        let appliedCouponCode = '';
        if (couponApplied) {
            const coupon = await Coupon.findOne({ code: couponApplied.toUpperCase().trim(), isActive: true });
            const calculatedSubtotal = subtotal !== undefined ? Number(subtotal) : Number(total);
            if (coupon && calculatedSubtotal >= coupon.minOrderAmount) {
                if (coupon.code === 'WELCOMEOWEN') {
                    const orderCount = await Order.countDocuments({ email: email.toLowerCase() });
                    if (orderCount > 0) {
                        return res.status(400).json({ error: 'The WELCOMEOWEN coupon is only valid for your first order!' });
                    }
                }
                if (coupon.discountType === 'percentage') {
                    calculatedDiscount = Math.round((calculatedSubtotal * coupon.discountValue) / 100);
                } else {
                    calculatedDiscount = coupon.discountValue;
                }
                calculatedDiscount = Math.min(calculatedDiscount, calculatedSubtotal);
                appliedCouponCode = coupon.code;
            }
        }

        const finalSubtotal = subtotal !== undefined ? Number(subtotal) : Number(total);
        const finalDiscount = couponApplied ? calculatedDiscount : (discountAmount !== undefined ? Number(discountAmount) : 0);
        const finalTotal = finalSubtotal - finalDiscount;

        // Prevent duplicate orders placed within a short time window (10 seconds)
        const tenSecondsAgo = new Date(Date.now() - 10000);
        const duplicateOrder = await Order.findOne({
            email: email.toLowerCase(),
            total: finalTotal,
            createdAt: { $gte: tenSecondsAgo }
        });

        if (duplicateOrder) {
            // Check if cart contents are identical to be absolutely sure
            const isCartIdentical = JSON.stringify(duplicateOrder.cart) === JSON.stringify(cart);
            if (isCartIdentical) {
                return res.status(200).json({ 
                    message: 'Order already placed successfully (duplicate prevented)', 
                    order: duplicateOrder 
                });
            }
        }

        const order = new Order({
            name,
            address,
            phone,
            email: email.toLowerCase(),
            cart,
            subtotal: finalSubtotal,
            discountAmount: finalDiscount,
            couponApplied: appliedCouponCode,
            total: finalTotal,
            paymentMethod: paymentMethod || 'cod'
        });
        
        await order.save();
        await User.findOneAndUpdate({ email: email.toLowerCase() }, { isNewUser: false });
        res.status(201).json({ message: 'Order placed successfully', order });
    } catch (err) {
        res.status(500).json({ error: 'Failed to create order' });
    }
};

exports.getUserOrders = async (req, res) => {
    try {
        const orders = await Order.find({ email: req.params.email.toLowerCase() }).sort({ createdAt: -1 });
        res.json(orders);
    } catch {
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
};

exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.json(orders);
    } catch {
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const { status, prepTime, deliveryTime } = req.body;
        const validStatuses = ['pending', 'accepted', 'rejected', 'preparing', 'out_for_delivery', 'delivered'];
        if (!validStatuses.includes(status)) return res.status(400).json({ error: 'Invalid status' });
        
        const updateData = { status };
        if (prepTime) updateData.prepTime = prepTime;
        if (deliveryTime) updateData.deliveryTime = deliveryTime;
        
        if (status === 'accepted') updateData.acceptedAt = new Date();
        if (status === 'out_for_delivery') updateData.outForDeliveryAt = new Date();

        const order = await Order.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!order) return res.status(404).json({ error: 'Order not found' });
        res.json({ message: 'Status updated', order });
    } catch {
        res.status(500).json({ error: 'Failed to update status' });
    }
};

exports.getOrderStatus = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).select('status prepTime deliveryTime acceptedAt outForDeliveryAt');
        if (!order) return res.status(404).json({ error: 'Order not found' });
        res.json(order);
    } catch {
        res.status(500).json({ error: 'Failed to fetch status' });
    }
};

exports.rateOrder = async (req, res) => {
    try {
        const { rating, review } = req.body;
        if (!rating || rating < 1 || rating > 5) return res.status(400).json({ error: 'Rating must be between 1 and 5' });
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { rating: Number(rating), review: review || '' },
            { new: true }
        );
        if (!order) return res.status(404).json({ error: 'Order not found' });
        res.json({ message: 'Rating submitted successfully', order });
    } catch {
        res.status(500).json({ error: 'Failed to submit rating' });
    }
};

const Razorpay = require('razorpay');
const crypto = require('crypto');

const getRazorpayInstance = () => {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        return null;
    }
    return new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
    });
};

exports.createRazorpayOrder = async (req, res) => {
    try {
        const amount = req.body.amount || req.body.total;
        if (isNaN(amount) || amount <= 0) return res.status(400).json({ error: 'Invalid amount' });

        const razorpay = getRazorpayInstance();
        if (!razorpay) {
            console.error('Razorpay Error: keys not configured in env');
            return res.status(500).json({ error: 'Razorpay keys not configured on the server.' });
        }

        const options = {
            amount: Math.round(amount * 100), // in paise
            currency: 'INR',
            receipt: `receipt_order_${Date.now()}`
        };

        const rzpOrder = await razorpay.orders.create(options);
        res.json({
            id: rzpOrder.id,
            orderId: rzpOrder.id,
            amount: rzpOrder.amount,
            currency: rzpOrder.currency || 'INR',
            key: process.env.RAZORPAY_KEY_ID,
            keyId: process.env.RAZORPAY_KEY_ID
        });
    } catch (error) {
        console.error('Razorpay order creation error:', error);
        res.status(500).json({ error: 'Failed to create Razorpay order', details: error.message });
    }
};

exports.verifyRazorpayPayment = async (req, res) => {
    try {
        const { 
            razorpay_order_id, 
            razorpay_payment_id, 
            razorpay_signature,
            name,
            address,
            phone,
            email,
            cart,
            total,
            paymentMethod
        } = req.body;
        
        const razorpay = getRazorpayInstance();
        if (!razorpay) {
            return res.status(400).json({ error: 'Razorpay keys not configured' });
        }

        const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
        hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
        const generated_signature = hmac.digest('hex');

        if (generated_signature === razorpay_signature) {
            // Save the order to DB upon successful verification
            const order = new Order({
                name,
                address,
                phone,
                email: email.toLowerCase(),
                cart,
                total,
                paymentMethod: paymentMethod || 'upi',
                status: 'pending'
            });
            await order.save();
            await User.findOneAndUpdate({ email: email.toLowerCase() }, { isNewUser: false });
            res.json({ success: true, message: 'Payment verified and order saved', order });
        } else {
            res.status(400).json({ error: 'Signature verification failed' });
        }
    } catch (error) {
        console.error('Razorpay verification error:', error);
        res.status(500).json({ error: 'Failed to verify payment', details: error.message });
    }
};
