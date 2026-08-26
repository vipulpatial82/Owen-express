const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const itemRoutes = require('./routes/itemRoutes');
const orderRoutes = require('./routes/orderRoutes');
const userRoutes = require('./routes/userRoutes');
const couponRoutes = require('./routes/couponRoutes');

const app = express();

app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:3000',
        'https://owen-express-food.vercel.app',
        /\.vercel\.app$/
    ],
    credentials: true
}));
app.use((req, res, next) => {
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
    next();
});
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.get('/health',(req,res)=>{
    res.send("OK")
})
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('MongoDB Connected');
        const Coupon = require('./models/Coupon');
        Coupon.findOne({ code: 'WELCOMEOWEN' }).then(existing => {
            if (!existing) {
                new Coupon({
                    code: 'WELCOMEOWEN',
                    discountType: 'percentage',
                    discountValue: 50,
                    minOrderAmount: 100,
                    isActive: true
                }).save()
                  .then(() => console.log('Seeded WELCOMEOWEN coupon'))
                  .catch(err => console.error('Error seeding WELCOMEOWEN coupon:', err));
            }
        }).catch(err => console.error('Error checking WELCOMEOWEN coupon:', err));
    })
    .catch(err => console.error('MongoDB connection error:', err.message));

app.use('/api/items', itemRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/coupons', couponRoutes);

app.use((req, res) => res.status(404).json({ message: 'Route not found' }));
app.use((err, req, res, next) => {
    console.error('SERVER ERROR:', err);
    res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
