import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaMoneyBillWave, FaCreditCard, FaCheckCircle, FaArrowLeft, FaLock, FaShieldAlt } from 'react-icons/fa';
import { API_URL } from '../config';
import confetti from 'canvas-confetti';
import { motion } from 'framer-motion';

const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        if (window.Razorpay) { resolve(true); return; }
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

const Payment = ({ clearCart }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [selected, setSelected] = useState('online');
    const [loading, setLoading] = useState(false);

    const { cart = [], address = {}, total = 0 } = location.state || {};

    useEffect(() => { loadRazorpayScript(); }, []);

    if (!cart.length) { navigate('/menu'); return null; }

    const fireSuccess = (orderId) => {
        clearCart();
        confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 }, colors: ['#ef4444', '#f97316', '#facc15', '#22c55e'] });
        const orderData = { cart, total, address, paymentMethod: selected, placedAt: Date.now(), orderId };
        localStorage.setItem('activeOrder', JSON.stringify(orderData));
        
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const userObj = JSON.parse(userStr);
                if (userObj) {
                    userObj.isNewUser = false;
                    localStorage.setItem('user', JSON.stringify(userObj));
                }
            } catch (err) {}
        }

        navigate('/track', { state: orderData });
    };

    const handleCOD = async () => {
        setLoading(true);
        const userStr = localStorage.getItem('user');
        let user = { email: 'demo@gmail.com', name: 'Demo User' };
        try { if (userStr) user = JSON.parse(userStr) || user; } catch { }
        try {
            const res = await fetch(`${API_URL}/api/orders/payment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: address.name, address: address.address, phone: address.phone, email: user.email, cart, total, paymentMethod: 'cod' })
            });
            const data = await res.json();
            fireSuccess(data.order?._id);
        } catch { fireSuccess(null); }
        setLoading(false);
    };

    const handleRazorpay = async () => {
        setLoading(true);
        const userStr = localStorage.getItem('user');
        let user = { email: 'demo@gmail.com', name: 'Demo User' };
        try { if (userStr) user = JSON.parse(userStr) || user; } catch { }
        try {
            const res = await fetch(`${API_URL}/api/orders/razorpay/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ total })
            });
            const { orderId: razorpayOrderId, amount, currency, keyId } = await res.json();
            const options = {
                key: keyId,
                amount,
                currency,
                name: 'Owen Express',
                description: 'Food Order Payment',
                order_id: razorpayOrderId,
                prefill: { name: address.name || user.name, email: user.email, contact: address.phone },
                theme: { color: '#dc2626' },
                handler: async (response) => {
                    try {
                        const verifyRes = await fetch(`${API_URL}/api/orders/razorpay/verify`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                name: address.name, address: address.address, phone: address.phone,
                                email: user.email, cart, total, paymentMethod: 'online'
                            })
                        });
                        const data = await verifyRes.json();
                        fireSuccess(data.order?._id);
                    } catch { fireSuccess(null); }
                },
                modal: { ondismiss: () => setLoading(false) }
            };
            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch { fireSuccess(null); setLoading(false); }
    };

    const handleProceed = () => {
        if (selected === 'cod') handleCOD();
        else handleRazorpay();
    };

    if (loading) return (
        <div className="flex flex-col justify-center items-center min-h-[60vh] gap-4">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
            <p className="text-gray-600 font-black text-lg">Processing your order...</p>
        </div>
    );

    return (
        <div className="max-w-3xl mx-auto my-6 sm:my-10 px-4 sm:px-0">
            <motion.button 
                whileHover={{ x: -4 }}
                onClick={() => navigate('/order-summary')} 
                className="flex items-center gap-2.5 px-6 py-3 bg-white text-gray-700 hover:text-red-600 rounded-xl font-bold transition-colors shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_25px_-4px_rgba(0,0,0,0.1)] mb-8 text-base"
            >
                <FaArrowLeft className="text-sm" /> Back to Order Summary
            </motion.button>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-[3rem] shadow-[0_25px_60px_rgba(0,0,0,0.06)] border border-gray-100 overflow-hidden relative"
            >
                <div className="bg-gradient-to-r from-red-600 to-orange-500 p-10 sm:p-12 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-black/10 rounded-full blur-2xl"></div>
                    <h2 className="text-4xl sm:text-5xl font-black text-white relative z-10 tracking-tight">Select Payment Method</h2>
                    <p className="text-white/85 font-semibold text-base sm:text-lg mt-3 relative z-10">Choose how you'd like to pay for your delicious meal</p>
                </div>

                <div className="p-10 sm:p-14">
                    {/* Payment Options */}
                    <div className="grid gap-5 mb-10">
                        {/* Online Payment */}
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setSelected('online')}
                            className={`p-8 border-2 rounded-3xl cursor-pointer transition-all flex items-center gap-6 relative overflow-hidden ${
                                selected === 'online' 
                                    ? 'border-red-500 bg-gradient-to-br from-red-50/70 to-orange-50/70 shadow-[0_15px_30px_-10px_rgba(239,68,68,0.2)]' 
                                    : 'border-gray-100 hover:border-gray-200 bg-gray-50/30'
                            }`}
                        >
                            <div className={`p-5 rounded-2xl flex items-center justify-center transition-colors ${
                                selected === 'online' ? 'bg-red-500 text-white shadow-lg' : 'bg-gray-100 text-gray-500'
                            }`}>
                                <FaCreditCard className="text-2xl" />
                            </div>
                            <div className="flex-1">
                                <span className={`text-xl font-black tracking-tight ${selected === 'online' ? 'text-gray-900' : 'text-gray-700'}`}>Pay Online</span>
                                <p className="text-sm sm:text-base text-gray-500 font-semibold mt-1">UPI, Cards, Net Banking, Wallets via Razorpay</p>
                            </div>
                            {selected === 'online' && (
                                <motion.div 
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="text-red-500 bg-white p-1.5 rounded-full shadow-md"
                                >
                                    <FaCheckCircle className="text-2xl" />
                                </motion.div>
                            )}
                        </motion.div>

                        {/* COD */}
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setSelected('cod')}
                            className={`p-8 border-2 rounded-3xl cursor-pointer transition-all flex items-center gap-6 relative overflow-hidden ${
                                selected === 'cod' 
                                    ? 'border-emerald-500 bg-gradient-to-br from-emerald-50/70 to-green-50/70 shadow-[0_15px_30px_-10px_rgba(16,185,129,0.2)]' 
                                    : 'border-gray-100 hover:border-gray-200 bg-gray-50/30'
                            }`}
                        >
                            <div className={`p-5 rounded-2xl flex items-center justify-center transition-colors ${
                                selected === 'cod' ? 'bg-emerald-500 text-white shadow-lg' : 'bg-gray-100 text-gray-500'
                            }`}>
                                <FaMoneyBillWave className="text-2xl" />
                            </div>
                            <div className="flex-1">
                                <span className={`text-xl font-black tracking-tight ${selected === 'cod' ? 'text-gray-900' : 'text-gray-700'}`}>Cash on Delivery</span>
                                <p className="text-sm sm:text-base text-gray-500 font-semibold mt-1">Pay when your order arrives at your door</p>
                            </div>
                            {selected === 'cod' && (
                                <motion.div 
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="text-emerald-500 bg-white p-1.5 rounded-full shadow-md"
                                >
                                    <FaCheckCircle className="text-2xl" />
                                </motion.div>
                            )}
                        </motion.div>
                    </div>

                    {/* Total */}
                    <div className="bg-[#0B0F19] text-white p-8 rounded-3xl mb-10 flex justify-between items-center relative overflow-hidden shadow-xl">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
                        <div>
                            <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-gray-400">Total Payable</span>
                            <h3 className="text-sm sm:text-base font-semibold text-gray-300 mt-1">Including all taxes</h3>
                        </div>
                        <div className="text-right">
                            <span className="text-4xl sm:text-5xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-orange-400">₹{total}</span>
                        </div>
                    </div>

                    {/* Proceed Button */}
                    <motion.button
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleProceed}
                        className={`w-full py-5 rounded-2xl font-black text-xl text-white shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2.5 mb-6 relative overflow-hidden ${
                            selected === 'cod' 
                                ? 'bg-gradient-to-r from-emerald-500 to-green-600 shadow-emerald-500/20' 
                                : 'bg-gradient-to-r from-red-600 to-orange-500 shadow-red-500/20'
                        }`}
                    >
                        {selected === 'cod' ? (
                            <>
                                🛵 Place Order (Cash on Delivery)
                            </>
                        ) : (
                            <>
                                <FaLock className="text-base opacity-90" /> Pay Securely via Razorpay
                            </>
                        )}
                    </motion.button>

                    <div className="flex items-center justify-center gap-2.5 mt-8 text-gray-400 text-sm font-bold">
                        <FaShieldAlt className="text-base text-green-500" />
                        <span>100% SECURE & ENCRYPTED PAYMENTS</span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Payment;
