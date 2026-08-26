import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaClipboardCheck, FaUtensils, FaMotorcycle, FaHome, FaPhone, FaMapMarkerAlt, FaStar, FaFrown, FaHourglassHalf, FaBoxOpen } from 'react-icons/fa';
import { API_URL } from '../config';

const STAGES = [
    { id: 0, label: 'Order Placed', sublabel: 'We received your order', icon: FaClipboardCheck, duration: 4000, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200', activeBg: 'bg-blue-500' },
    { id: 1, label: 'Preparing', sublabel: 'Chef is cooking your food', icon: FaUtensils, duration: 8000, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-200', activeBg: 'bg-orange-500' },
    { id: 2, label: 'Out for Delivery', sublabel: 'Rider is on the way', icon: FaMotorcycle, duration: 8000, color: 'text-purple-500', bg: 'bg-purple-50', border: 'border-purple-200', activeBg: 'bg-purple-500' },
    { id: 3, label: 'Delivered', sublabel: 'Enjoy your meal!', icon: FaHome, duration: null, color: 'text-green-500', bg: 'bg-green-50', border: 'border-green-200', activeBg: 'bg-green-500' },
];

const RIDER = { name: 'Rahul Kumar', phone: '+91 98765 43210', rating: 4.8, vehicle: 'Bike • MH 02 AB 1234' };

const OrderTracking = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [stage, setStage] = useState(0);
    const [eta, setEta] = useState(28);
    const [realStatus, setRealStatus] = useState(null);

    const saved = localStorage.getItem('activeOrder');
    const orderData = location.state || (saved ? JSON.parse(saved) : null);
    const { cart = [], total = 0, address = {}, paymentMethod = 'upi', orderId } = orderData || {};
    const hasOrder = !!orderData;

    const STATUS_TO_STAGE = { pending: 0, accepted: 0, preparing: 1, out_for_delivery: 2, delivered: 3 };

    // Poll real order status every 5 seconds
    useEffect(() => {
        if (!orderId) return;
        const poll = async () => {
            try {
                const res = await fetch(`${API_URL}/api/orders/${orderId}/status`);
                const data = await res.json();
                if (data.status) {
                    setRealStatus(data.status);
                    if (STATUS_TO_STAGE[data.status] !== undefined) setStage(STATUS_TO_STAGE[data.status]);
                    
                    const calcRemaining = (startTimeStr, totalMinutes) => {
                        if (!startTimeStr || !totalMinutes) return totalMinutes || 0;
                        const elapsedMs = new Date() - new Date(startTimeStr);
                        return Math.max(0, totalMinutes - Math.floor(elapsedMs / 60000));
                    };

                    if (data.status === 'accepted' || data.status === 'preparing') {
                        setEta(calcRemaining(data.acceptedAt, data.prepTime || 15));
                    } else if (data.status === 'out_for_delivery') {
                        setEta(calcRemaining(data.outForDeliveryAt, data.deliveryTime || 30));
                    } else if (data.status === 'delivered') {
                        setEta(0);
                    }
                }
            } catch { }
        };
        poll();
        const interval = setInterval(poll, 5000);
        return () => clearInterval(interval);
    }, [orderId]);

    useEffect(() => {
        if (!hasOrder) return;
        const etaInterval = setInterval(() => {
            setEta(prev => prev > 1 ? prev - 1 : 0);
        }, 60000);

        return () => { clearInterval(etaInterval); };
    }, [hasOrder]);

    const currentStage = STAGES[stage];
    const Icon = currentStage.icon;
    const delivered = stage === 3;

    if (realStatus === 'rejected') return (
        <div className="max-w-2xl mx-auto py-16 px-4 text-center">
            <FaFrown className="text-6xl mb-4 mx-auto text-red-500/80 drop-shadow-md" />
            <h2 className="text-2xl font-black text-red-600 mb-2">Order Rejected</h2>
            <p className="text-gray-500 mb-6">Sorry, the restaurant couldn't accept your order at this time.</p>
            <button onClick={() => { localStorage.removeItem('activeOrder'); navigate('/menu'); }}
                className="bg-red-600/80 backdrop-blur-sm border border-red-400/50 text-white py-3 px-8 rounded-2xl font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-900/30">
                Order Again
            </button>
        </div>
    );

    if (orderId && realStatus === 'pending') return (
        <div className="max-w-2xl mx-auto py-16 px-4 text-center">
            <FaHourglassHalf className="text-6xl mb-4 mx-auto text-yellow-500/80 drop-shadow-md animate-pulse" />
            <h2 className="text-2xl font-black text-yellow-600 mb-2">Waiting for Confirmation</h2>
            <p className="text-gray-500 mb-2">Your order has been placed and is waiting for restaurant approval.</p>
            <p className="text-xs text-gray-400">This page will update automatically...</p>
        </div>
    );

    if (!hasOrder) return (
        <div className="max-w-2xl mx-auto py-16 px-4 text-center">
            <FaBoxOpen className="text-6xl mb-4 mx-auto text-gray-400 drop-shadow-md" />
            <h2 className="text-2xl font-black text-gray-800 mb-2">No Active Order</h2>
            <p className="text-gray-500 mb-6">You haven't placed any order yet. Browse our menu and place an order!</p>
            <button onClick={() => navigate('/menu')}
                className="bg-red-600/80 backdrop-blur-sm border border-red-400/50 text-white py-3 px-8 rounded-2xl font-bold hover:bg-red-600 hover:scale-105 transition-all shadow-lg shadow-red-900/30">
                Browse Menu
            </button>
        </div>
    );

    return (
        <div className="max-w-2xl mx-auto py-4 sm:py-6 px-4 relative z-10">

            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
                {!delivered && (
                    <button onClick={() => navigate('/')} className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold shadow-sm hover:text-red-600 transition-all text-sm">
                        ← Home
                    </button>
                )}
                <h1 className="text-2xl font-black tracking-tight">
                    <span className="text-gray-900">Track</span> <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-orange-500">Order</span>
                </h1>
            </div>

            {/* Status Card */}
            <div className={`relative bg-white rounded-2xl p-4 mb-4 border border-gray-100 shadow-sm overflow-hidden transition-all duration-700`}>
                <div className={`absolute top-0 left-0 w-1.5 h-full ${currentStage.activeBg} transition-colors duration-700`}></div>
                <div className="flex items-center gap-4 pl-2">
                    <div className={`w-12 h-12 rounded-xl ${currentStage.activeBg} flex items-center justify-center shadow-md transition-colors duration-700 shrink-0`}>
                        <Icon className="text-white text-xl animate-bounce" />
                    </div>
                    <div className="flex-1">
                        <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Current Status</p>
                        <h2 className={`text-lg font-black ${currentStage.color} leading-tight`}>{currentStage.label}</h2>
                        <p className="text-gray-400 text-xs">{currentStage.sublabel}</p>
                    </div>
                    {!delivered && (
                        <div className="text-right bg-gray-50 px-3 py-2 rounded-xl border border-gray-100 shrink-0">
                            <p className="text-xs text-gray-400 font-bold uppercase">ETA</p>
                            <p className="text-2xl font-black text-gray-900 leading-none">{eta}</p>
                            <p className="text-xs font-bold text-gray-400">mins</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Progress Tracker */}
            <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-100">
                <h3 className="font-black text-gray-700 mb-4 text-xs uppercase tracking-widest border-b border-gray-100 pb-2">Order Progress</h3>
                <div className="relative pl-1">
                    {STAGES.map((s, i) => {
                        const SIcon = s.icon;
                        const done = i <= stage;
                        const active = i === stage;
                        return (
                            <div key={s.id} className="flex items-start gap-3 relative">
                                {i < STAGES.length - 1 && (
                                    <div className="absolute left-4 top-8 w-0.5 h-8 bg-gray-100">
                                        <div className={`w-full transition-all duration-700 ${done && i < stage ? 'h-full bg-green-400' : 'h-0'}`} />
                                    </div>
                                )}
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-500 ${done ? `${s.activeBg} text-white shadow-sm` : 'bg-gray-100 text-gray-300'} ${active ? 'ring-2 ring-offset-1 ring-opacity-40 ' + s.activeBg.replace('bg-', 'ring-') : ''}`}>
                                    <SIcon size={12} />
                                </div>
                                <div className={`pb-6 ${i === STAGES.length - 1 ? 'pb-0' : ''}`}>
                                    <p className={`font-bold text-xs ${done ? 'text-gray-800' : 'text-gray-400'}`}>{s.label}</p>
                                    <p className={`text-xs ${done ? 'text-gray-400' : 'text-gray-300'}`}>{s.sublabel}</p>
                                    {active && !delivered && (
                                        <span className="inline-flex items-center gap-1 mt-0.5 text-xs font-semibold px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">
                                            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" /> In progress
                                        </span>
                                    )}
                                    {done && i < stage && (
                                        <span className="inline-flex items-center gap-1 mt-0.5 text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">✓ Done</span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Order Summary & Address Grid */}
            <div className="grid sm:grid-cols-2 gap-4">
                {/* Order Summary */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                    <h3 className="font-black text-gray-700 mb-3 text-xs uppercase tracking-widest flex items-center gap-2 border-b border-gray-100 pb-2">
                        <FaClipboardCheck className="text-gray-400" /> Order Details
                    </h3>
                    <div className="space-y-2 mb-3">
                        {cart.map((item, i) => (
                            <div key={i} className="flex justify-between items-center text-xs">
                                <span className="font-semibold text-gray-600">{item.name} {item.quantity > 1 && <span className="bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded ml-1">x{item.quantity}</span>}</span>
                                <span className="font-black text-gray-900">₹{item.price * (item.quantity || 1)}</span>
                            </div>
                        ))}
                    </div>
                    <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                        <span className="font-bold text-gray-500 text-xs uppercase tracking-widest">Total</span>
                        <span className="font-black text-xl bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-orange-500">₹{total}</span>
                    </div>
                    <p className="text-[10px] uppercase font-bold text-gray-400 mt-2 flex justify-between">
                        <span>Payment</span>
                        <span className="text-gray-700 bg-gray-100 px-2 py-0.5 rounded">{paymentMethod}</span>
                    </p>
                </div>

                {/* Delivery Address */}
                <div className="bg-gradient-to-br from-red-600 to-orange-500 rounded-2xl p-4 shadow-sm text-white relative overflow-hidden">
                    <FaMapMarkerAlt className="absolute -bottom-4 -right-4 text-7xl text-white/10" />
                    <h3 className="font-black text-white/90 mb-3 text-xs uppercase tracking-widest flex items-center gap-2 border-b border-white/20 pb-2">
                        <FaMapMarkerAlt /> Delivering To
                    </h3>
                    <p className="font-black text-base mb-1">{address.name || 'User'}</p>
                    <p className="text-xs text-white/80 mb-3 leading-relaxed">{address.address || 'Address not provided'}</p>
                    <p className="inline-flex items-center gap-1.5 text-xs font-bold bg-white/20 px-2.5 py-1 rounded-lg">
                        <FaPhone size={10} /> {address.phone || '9876543210'}
                    </p>
                </div>
            </div>

            {/* Delivered CTA */}
            {delivered && (
                <div className="mt-4 bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
                    <h3 className="text-base font-black text-green-700 mb-1">Order Delivered! 🎉</h3>
                    <p className="text-gray-500 text-xs mb-3">Hope you enjoyed your meal</p>
                    <div className="flex gap-2 justify-center">
                        <button onClick={() => navigate('/orders')}
                            className="px-4 py-2 bg-white border border-green-400 text-green-700 rounded-xl font-bold text-xs hover:bg-green-50 transition-all">
                            Rate Order
                        </button>
                        <button onClick={() => { localStorage.removeItem('activeOrder'); navigate('/'); }}
                            className="px-4 py-2 bg-red-600 text-white rounded-xl font-bold text-xs hover:bg-red-700 transition-all">
                            Back to Home
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderTracking;
