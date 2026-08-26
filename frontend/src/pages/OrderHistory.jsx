import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaShoppingBag, FaMapMarkerAlt, FaPhone, FaUser, FaClock, FaStar } from 'react-icons/fa';
import { API_URL } from '../config';
import { motion, AnimatePresence } from 'framer-motion';

const OrderHistory = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [ratingModal, setRatingModal] = useState({ show: false, orderId: null, rating: 0, review: '' });
    const navigate = useNavigate();

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        
        if (!userStr || userStr === 'undefined' || userStr === 'null') {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            return navigate('/login');
        }
        
        try {
            const user = JSON.parse(userStr);
            if (!user || !user.email) {
                localStorage.removeItem('user');
                localStorage.removeItem('token');
                return navigate('/login');
            }

            const token = localStorage.getItem('token');
            fetch(`${API_URL}/api/orders/user/${user.email}`)
                .then(res => res.json())
                .then(data => {
                    setOrders(Array.isArray(data) ? data : []);
                    setLoading(false);
                })
                .catch(() => {
                    setOrders([]);
                    setLoading(false);
                });
        } catch {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            navigate('/login');
        }
    }, [navigate]);

    if (loading) return (
        <div className="flex flex-col justify-center items-center min-h-[60vh] gap-4">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-transparent"></div>
            <p className="font-black text-2xl text-gray-700">Loading your orders...</p>
        </div>
    );

    const submitRating = async () => {
        try {
            const res = await fetch(`${API_URL}/api/orders/${ratingModal.orderId}/rate`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rating: ratingModal.rating, review: ratingModal.review })
            });
            if (res.ok) {
                setOrders(orders.map(o => o._id === ratingModal.orderId ? { ...o, rating: ratingModal.rating, review: ratingModal.review } : o));
                setRatingModal({ show: false, orderId: null, rating: 0, review: '' });
            }
        } catch {
            setRatingModal({ show: false, orderId: null, rating: 0, review: '' });
        }
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        const optionsDate = { day: 'numeric', month: 'long', year: 'numeric' };
        const formattedDate = date.toLocaleDateString('en-US', optionsDate);
        let hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12;
        hours = hours ? hours : 12;
        const minutesStr = minutes < 10 ? '0' + minutes : minutes;
        return `${formattedDate} at ${hours}:${minutesStr} ${ampm}`;
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'rejected':
                return (
                    <span className="px-5 py-2 rounded-full text-xs font-black uppercase tracking-wider bg-red-50 text-red-600 border border-red-100 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Rejected
                    </span>
                );
            case 'delivered':
                return (
                    <span className="px-5 py-2 rounded-full text-xs font-black uppercase tracking-wider bg-green-50 text-green-600 border border-green-100 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span> Delivered
                    </span>
                );
            case 'pending':
                return (
                    <span className="px-5 py-2 rounded-full text-xs font-black uppercase tracking-wider bg-amber-50 text-amber-600 border border-amber-100 flex items-center gap-2 animate-pulse">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Pending Approval
                    </span>
                );
            case 'out_for_delivery':
                return (
                    <span className="px-5 py-2 rounded-full text-xs font-black uppercase tracking-wider bg-blue-50 text-blue-600 border border-blue-100 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span> Out for Delivery
                    </span>
                );
            case 'accepted':
            case 'preparing':
                return (
                    <span className="px-5 py-2 rounded-full text-xs font-black uppercase tracking-wider bg-orange-50 text-orange-600 border border-orange-100 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse"></span> Preparing
                    </span>
                );
            default:
                return (
                    <span className="px-5 py-2 rounded-full text-xs font-black uppercase tracking-wider bg-gray-50 text-gray-600 border border-gray-100 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-gray-500"></span> {status}
                    </span>
                );
        }
    };

    const getStatusMessage = (status) => {
        switch (status) {
            case 'rejected':
                return <span className="text-red-500 font-black text-sm sm:text-base">We're sorry, this order was rejected by the kitchen.</span>;
            case 'delivered':
                return <span className="text-green-600 font-black text-sm sm:text-base">Delivered! Thank you for ordering from Owen Express.</span>;
            case 'pending':
                return <span className="text-amber-600 font-black text-sm sm:text-base">Waiting for the kitchen to accept your order...</span>;
            case 'out_for_delivery':
                return <span className="text-blue-600 font-black text-sm sm:text-base">Your food is hot and on its way to you!</span>;
            case 'accepted':
            case 'preparing':
                return <span className="text-orange-600 font-black text-sm sm:text-base">Our chefs are preparing your delicious meal...</span>;
            default:
                return null;
        }
    };

    const handleTrackOrder = (order) => {
        const orderData = { 
            cart: order.cart, 
            total: order.total, 
            address: { name: order.name, address: order.address, phone: order.phone }, 
            paymentMethod: order.paymentMethod, 
            placedAt: new Date(order.createdAt).getTime(), 
            orderId: order._id 
        };
        navigate('/track', { state: orderData });
    };

    const getActionSection = (order) => {
        if (order.status === 'rejected') {
            return null;
        }
        
        if (order.status === 'delivered') {
            if (order.rating) {
                return (
                    <div className="bg-orange-50/40 p-5 rounded-2xl border border-orange-100/50 flex flex-col gap-1.5 items-end max-w-sm text-right shadow-sm">
                        <div className="flex gap-1.5">
                            {[1, 2, 3, 4, 5].map(star => (
                                <FaStar key={star} className={`text-lg sm:text-xl ${star <= order.rating ? 'text-yellow-400 drop-shadow-sm' : 'text-gray-200'}`} />
                            ))}
                        </div>
                        {order.review && <p className="text-sm sm:text-base text-gray-500 font-bold italic">"{order.review}"</p>}
                    </div>
                );
            }
            return (
                <motion.button 
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setRatingModal({ show: true, orderId: order._id, rating: 0, review: '' })}
                    className="w-full sm:w-auto bg-gradient-to-r from-red-600 to-orange-500 text-white py-4 px-10 rounded-2xl font-black text-sm uppercase tracking-widest shadow-md hover:shadow-lg transition-all"
                >
                    Rate Experience
                </motion.button>
            );
        }

        // Active orders
        return (
            <motion.button 
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleTrackOrder(order)}
                className="w-full sm:w-auto bg-gray-950 text-white py-4 px-10 rounded-2xl font-black text-sm uppercase tracking-widest shadow-md hover:shadow-lg hover:bg-red-600 transition-all flex items-center justify-center gap-1.5"
            >
                Track Realtime
            </motion.button>
        );
    };

    return (
        <div className="max-w-6xl mx-auto py-10 sm:py-16 relative z-10 px-4">
            <div className="text-center mb-16">
                <h1 className="text-5xl sm:text-6xl font-black mb-4 tracking-tight relative inline-block">
                    <span className="text-gray-900">My</span>{' '}
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-orange-500">Orders</span>
                    <div className="absolute -bottom-2 left-1/4 right-1/4 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-50 rounded-full"></div>
                </h1>
                <p className="text-xl sm:text-2xl font-bold mt-2 text-gray-500">Track and review your past culinary experiences</p>
            </div>
            
            {orders.length === 0 ? (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white/70 backdrop-blur-3xl rounded-[3rem] p-20 border border-gray-100 text-center shadow-[0_25px_60px_-15px_rgba(0,0,0,0.03)]"
                >
                    <div className="text-8xl mb-8 opacity-40 mix-blend-luminosity">🛍️</div>
                    <p className="text-3xl font-black text-gray-500 mb-10 tracking-tight">You haven't placed any orders yet.</p>
                    <button onClick={() => navigate('/menu')} className="bg-gradient-to-r from-red-600 to-orange-500 text-white py-5 px-12 rounded-3xl font-black text-xl hover:shadow-[0_8px_25px_-5px_rgba(220,38,38,0.5)] hover:-translate-y-1 transition-all">Browse Menu</button>
                </motion.div>
            ) : (
                <div className="space-y-10">
                    {orders.map((order, idx) => (
                        <motion.div 
                            key={order._id || idx}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: idx * 0.05 }}
                            className="bg-white rounded-[3rem] p-8 sm:p-12 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.06)] border border-gray-100 hover:shadow-[0_30px_60px_-20px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden flex flex-col gap-8"
                        >
                            {/* Card Top Header */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-gray-100">
                                <div>
                                    <div className="flex items-center gap-4 flex-wrap">
                                        <span className="text-gray-900 font-black text-3xl sm:text-4xl tracking-tight">Order #{orders.length - idx}</span>
                                        {getStatusBadge(order.status)}
                                    </div>
                                    <span className="text-base sm:text-lg font-bold text-gray-400 mt-3 flex items-center gap-2">
                                        <FaClock className="text-gray-300 text-sm" /> {formatDate(order.createdAt)}
                                    </span>
                                </div>
                                
                                {/* Total Price & Payment Method */}
                                <div className="flex items-center gap-5 bg-gradient-to-br from-red-50/50 to-orange-50/50 px-6 py-4 rounded-3xl border border-orange-100/30 sm:min-w-[200px]">
                                    <div className="flex-1">
                                        <span className="text-sm text-gray-400 font-black uppercase tracking-wider block mb-1">Total Payable</span>
                                        <span className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">₹{order.total}</span>
                                    </div>
                                    <div className="bg-[#0B0F19] text-white text-sm font-black uppercase tracking-widest px-4 py-2.5 rounded-xl">
                                        {order.paymentMethod}
                                    </div>
                                </div>
                            </div>

                            {/* Items and Delivery Details */}
                            <div className="grid md:grid-cols-2 gap-8">
                                {/* Items */}
                                <div className="bg-gray-50/40 p-6 sm:p-8 rounded-3xl border border-gray-100/50">
                                    <h4 className="font-extrabold text-gray-800 text-base sm:text-lg uppercase tracking-wider mb-5 flex items-center gap-2">
                                        <FaShoppingBag className="text-red-500 text-lg" /> Items
                                    </h4>
                                    <div className="space-y-4">
                                        {order.cart?.map((item, i) => (
                                            <div key={i} className="flex justify-between items-center text-base sm:text-lg">
                                                <span className="font-bold text-gray-700">
                                                    {item.name} 
                                                    {item.quantity > 1 && (
                                                        <span className="text-xs sm:text-sm bg-red-50 text-red-600 font-black px-2.5 py-0.5 rounded-md ml-2">
                                                            x{item.quantity}
                                                        </span>
                                                    )}
                                                </span>
                                                <span className="font-black text-gray-900 text-lg sm:text-xl">₹{item.price * (item.quantity || 1)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Delivery Details */}
                                <div className="bg-gray-50/40 p-6 sm:p-8 rounded-3xl border border-gray-100/50">
                                    <h4 className="font-extrabold text-gray-800 text-base sm:text-lg uppercase tracking-wider mb-5 flex items-center gap-2">
                                        <FaMapMarkerAlt className="text-red-500 text-lg" /> Delivery Details
                                    </h4>
                                    <div className="space-y-4 text-base sm:text-lg text-gray-600 font-semibold">
                                        <div className="flex items-center gap-3">
                                            <FaUser className="text-gray-400 text-base" />
                                            <span className="font-black text-gray-900 text-lg sm:text-xl">{order.name}</span>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <FaMapMarkerAlt className="text-gray-400 text-base mt-1.5 shrink-0" />
                                            <span className="leading-relaxed text-gray-700 font-semibold">{order.address}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <FaPhone className="text-gray-400 text-base" />
                                            <span className="font-bold text-gray-700">{order.phone}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Card Footer Actions */}
                            <div className="pt-5 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-6">
                                <div className="text-lg sm:text-xl font-black">
                                    {getStatusMessage(order.status)}
                                </div>
                                {getActionSection(order)}
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Rating Modal */}
            <AnimatePresence>
                {ratingModal.show && (
                    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn" onClick={() => setRatingModal({ show: false, orderId: null, rating: 0, review: '' })}>
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white border border-gray-100 rounded-[2.5rem] p-8 max-w-md w-full shadow-[0_20px_60px_rgba(0,0,0,0.15)]" 
                            onClick={e => e.stopPropagation()}
                        >
                            <h3 className="text-2.5xl font-black mb-6 text-gray-900 text-center tracking-tight">Rate Your Experience</h3>
                            
                            <div className="flex justify-center gap-3 mb-8 bg-gray-50 py-4 rounded-xl border border-gray-100">
                                {[1,2,3,4,5].map(star => (
                                    <FaStar 
                                        key={star}
                                        className={`text-4xl cursor-pointer transition-all duration-300 hover:scale-110 ${star <= ratingModal.rating ? 'text-yellow-400 drop-shadow-md' : 'text-gray-200'}`}
                                        onClick={() => setRatingModal({...ratingModal, rating: star})}
                                    />
                                ))}
                            </div>
                            
                            <textarea 
                                placeholder="Tell us what you loved... (optional)"
                                className="w-full border-2 border-gray-100 rounded-xl p-4 mb-8 focus:outline-none focus:border-red-400 focus:ring-4 focus:ring-red-100 transition-all resize-none font-medium text-gray-700 bg-white"
                                rows="4"
                                value={ratingModal.review}
                                onChange={e => setRatingModal({...ratingModal, review: e.target.value})}
                            />
                            
                            <div className="flex gap-4">
                                <button onClick={() => setRatingModal({ show: false, orderId: null, rating: 0, review: '' })} className="flex-1 bg-white border-2 border-gray-100 text-gray-655 py-3.5 rounded-xl font-bold hover:bg-gray-50 hover:border-gray-200 transition-all">Cancel</button>
                                <button onClick={submitRating} disabled={!ratingModal.rating} className="flex-1 bg-gradient-to-r from-red-600 to-orange-500 text-white py-3.5 rounded-xl font-bold hover:shadow-[0_8px_25px_-5px_rgba(220,38,38,0.5)] transition-all disabled:opacity-50 disabled:hover:shadow-none disabled:cursor-not-allowed">Submit Rating</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default OrderHistory;
