const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    name: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    cart: { type: Array, required: true },
    subtotal: { type: Number, default: null },
    discountAmount: { type: Number, default: 0 },
    couponApplied: { type: String, default: '' },
    total: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['upi', 'credit', 'cod'], default: 'cod' },
    status: { type: String, default: 'pending', enum: ['pending', 'accepted', 'preparing', 'out_for_delivery', 'delivered', 'rejected'] },
    prepTime: { type: Number, default: null },
    deliveryTime: { type: Number, default: null },
    acceptedAt: { type: Date, default: null },
    outForDeliveryAt: { type: Date, default: null },
    rating: { type: Number, min: 1, max: 5, default: null },
    review: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
