const express = require('express');
const router = express.Router();
const { 
    createOrder, 
    getUserOrders, 
    rateOrder, 
    getAllOrders, 
    updateOrderStatus, 
    getOrderStatus,
    createRazorpayOrder,
    verifyRazorpayPayment
} = require('../controllers/orderController');

router.post('/payment', createOrder);
router.post('/razorpay/create', createRazorpayOrder);
router.post('/razorpay/verify', verifyRazorpayPayment);
router.get('/all', getAllOrders);
router.get('/user/:email', getUserOrders);
router.get('/:id/status', getOrderStatus);
router.put('/:id/status', updateOrderStatus);
router.put('/:id/rate', rateOrder);

module.exports = router;
