const express = require('express');
const router = express.Router();
const { createOrder, getUserOrders, rateOrder } = require('../controllers/orderController');

router.post('/payment', createOrder);
router.get('/user/:email', getUserOrders);
router.put('/:id/rate', rateOrder);

module.exports = router;
