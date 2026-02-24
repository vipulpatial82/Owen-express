const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    name: String,
    address: String,
    phone: String,
    email: String,
    cart: Array,
    total: Number,
    paymentMethod: String,
    rating: { type: Number, min: 1, max: 5, default: null },
    review: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
