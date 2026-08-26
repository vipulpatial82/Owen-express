import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaTrash, FaPlus, FaMinus, FaTag } from 'react-icons/fa';
import { API_URL } from '../config';

const OrderForm = ({ cart, removeFromCart, setCart }) => {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');
    const [error, setError] = useState('');
    const [couponCode, setCouponCode] = useState('');
    const [discountAmount, setDiscountAmount] = useState(0);
    const [couponApplied, setCouponApplied] = useState('');
    const [couponError, setCouponError] = useState('');
    const [couponSuccess, setCouponSuccess] = useState('');

    const userStr = localStorage.getItem('user');
    let user = null;
    try { if (userStr) user = JSON.parse(userStr); } catch {}

    const handleApplyCoupon = async () => {
        setCouponError('');
        setCouponSuccess('');
        if (!couponCode.trim()) return;

        try {
            const res = await fetch(`${API_URL}/api/coupons/validate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: couponCode, subtotal: total, email: user?.email || '' })
            });
            const data = await res.json();
            if (res.ok && data.isValid) {
                setDiscountAmount(data.discountAmount);
                setCouponApplied(data.code);
                setCouponSuccess(`Coupon applied! You saved ₹${data.discountAmount}.`);
                setCouponCode('');
            } else {
                setCouponError(data.error || 'Failed to validate coupon');
            }
        } catch (err) {
            setCouponError('Error connecting to validation service');
        }
    };

    const handleRemoveCoupon = () => {
        setDiscountAmount(0);
        setCouponApplied('');
        setCouponSuccess('');
        setCouponError('');
    };

    const grouped = cart.reduce((acc, item) => {
        const found = acc.find(i => i._id === item._id);
        found ? found.quantity += 1 : acc.push({ ...item, quantity: 1 });
        return acc;
    }, []);

    const total = cart.reduce((sum, item) => sum + item.price, 0);

    useEffect(() => {
        if (couponApplied) {
            const revalidate = async () => {
                try {
                    const res = await fetch(`${API_URL}/api/coupons/validate`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ code: couponApplied, subtotal: total, email: user?.email || '' })
                    });
                    const data = await res.json();
                    if (res.ok && data.isValid) {
                        setDiscountAmount(data.discountAmount);
                        setCouponSuccess(`Coupon applied! You saved ₹${data.discountAmount}.`);
                    } else {
                        handleRemoveCoupon();
                        setCouponError(data.error || 'Coupon removed because cart was updated');
                    }
                } catch {
                    handleRemoveCoupon();
                }
            };
            revalidate();
        }
    }, [total]);

    const increaseQty = (item) => setCart([...cart, item]);
    const decreaseQty = (item) => {
        const idx = cart.findLastIndex ? cart.findLastIndex(c => c._id === item._id) : [...cart].reverse().findIndex(c => c._id === item._id);
        const actualIdx = cart.findLastIndex ? idx : cart.length - 1 - idx;
        removeFromCart(actualIdx);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        if (!name || !address || !phone) return setError('Please fill all fields');
        if (!/^[6-9]\d{9}$/.test(phone)) return setError('Please enter a valid 10-digit Indian phone number starting with 6-9');
        navigate('/payment', { 
            state: { 
                cart: grouped, 
                total: total - discountAmount, 
                subtotal: total, 
                discountAmount, 
                couponApplied, 
                address: { name, address, phone } 
            } 
        });
    };

    return (
        <div className="max-w-5xl mx-auto my-8 sm:my-12 px-4 relative z-10">
            {/* Ambient glows removed based on user feedback */}

            <button onClick={() => navigate('/menu')} className="relative z-20 px-6 py-2.5 bg-white/80 backdrop-blur-md border border-white/60 text-gray-700 rounded-xl font-bold transition-all shadow-sm hover:shadow-md hover:text-red-600 hover:-translate-y-0.5 mb-8 flex items-center gap-2">
                ← Continue Browsing
            </button>

            <div className="bg-white/70 backdrop-blur-3xl rounded-[2rem] shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] border border-white overflow-hidden relative z-20 grid lg:grid-cols-5 divide-y lg:divide-y-0 lg:divide-x divide-gray-200/50">
                
                {/* Left Side: Cart Items */}
                <div className="col-span-3 bg-white/30 p-8 sm:p-10">
                    <h2 className="text-3xl font-black text-gray-900 flex items-center gap-3 mb-8 tracking-tight">
                        <FaShoppingCart className="text-red-500" /> Order Summary
                    </h2>

                    {cart.length === 0 ? (
                        <div className="text-center py-16 px-6 bg-white/50 rounded-3xl border border-white">
                            <p className="text-xl font-bold text-gray-500 mb-6">Your cart is empty.</p>
                            <button onClick={() => navigate('/menu')} className="bg-gradient-to-r from-red-600 to-orange-500 text-white py-3 px-8 rounded-2xl font-bold hover:shadow-[0_8px_25px_-5px_rgba(220,38,38,0.5)] hover:-translate-y-0.5 transition-all">Browse Menu</button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {grouped.map((item, idx) => (
                                <div key={idx} className="group flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white/60 hover:bg-white/80 border border-white/60 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all">
                                    <div className="mb-4 sm:mb-0">
                                        <h4 className="font-bold text-lg text-gray-900">{item.name}</h4>
                                        <p className="text-sm font-semibold text-gray-500">₹{item.price} each</p>
                                    </div>
                                    <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                                        <div className="flex items-center gap-3 bg-white px-3 py-1.5 rounded-xl border border-gray-100 shadow-sm">
                                            <button onClick={() => decreaseQty(item)}
                                                className="w-7 h-7 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all flex items-center justify-center font-bold">
                                                <FaMinus size={10} />
                                            </button>
                                            <span className="font-black text-gray-800 w-5 text-center">{item.quantity}</span>
                                            <button onClick={() => increaseQty(item)}
                                                className="w-7 h-7 rounded-lg bg-green-50 text-green-600 hover:bg-green-600 hover:text-white transition-all flex items-center justify-center font-bold">
                                                <FaPlus size={10} />
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="font-black text-xl text-gray-900 w-16 text-right">₹{item.price * item.quantity}</span>
                                            <button className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-xl transition-all"
                                                onClick={() => {
                                                    const indices = cart.reduce((acc, c, i) => c._id === item._id ? [...acc, i] : acc, []);
                                                    indices.forEach((_, i) => removeFromCart(indices[indices.length - 1 - i]));
                                                }}>
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {/* Coupon Code Section */}
                            <div className="mt-6 p-6 bg-white/50 border border-white rounded-2xl shadow-sm space-y-4">
                                <div className="flex justify-between items-center mb-1">
                                    <h4 className="font-black text-gray-800 text-sm flex items-center gap-2 uppercase tracking-wide">
                                        <FaTag className="text-red-500 animate-pulse" /> Have a Coupon?
                                    </h4>
                                    {couponApplied && (
                                        <span className="text-[10px] bg-green-500/10 text-green-600 font-bold px-2 py-0.5 rounded-full border border-green-500/20">
                                            Applied
                                        </span>
                                    )}
                                </div>

                                {!couponApplied ? (
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Enter Promo Code (e.g. WELCOME10)"
                                            value={couponCode}
                                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                            className="flex-1 px-4 py-2.5 border-2 border-gray-100 rounded-xl text-sm focus:border-red-400 focus:outline-none bg-white transition-all uppercase placeholder-gray-400 font-black tracking-wider text-gray-800"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleApplyCoupon}
                                            className="px-6 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-black hover:bg-red-600 hover:shadow-md transition-all shrink-0 active:scale-95"
                                        >
                                            Apply
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between bg-green-500/5 border border-green-500/15 p-3.5 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                                                <FaTag className="text-green-600" />
                                            </div>
                                            <div>
                                                <span className="font-black text-sm text-green-800 tracking-wide">{couponApplied}</span>
                                                <p className="text-[11px] text-green-600 font-bold">{couponSuccess}</p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleRemoveCoupon}
                                            className="text-red-500 hover:text-red-700 font-bold text-xs bg-red-50 hover:bg-red-100/80 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 border border-red-100"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                )}

                                {couponError && (
                                    <p className="text-red-600 text-xs font-bold bg-red-50 border border-red-100/50 p-3.5 rounded-xl">
                                        ✕ {couponError}
                                    </p>
                                )}
                            </div>

                            {/* Subtotal & Discount Breakdown */}
                            <div className="mt-6 space-y-2.5 bg-gray-50/50 p-6 rounded-2xl border border-gray-200/40">
                                <div className="flex justify-between items-center text-sm font-bold text-gray-500">
                                    <span>Subtotal</span>
                                    <span>₹{total}</span>
                                </div>
                                {discountAmount > 0 && (
                                    <div className="flex justify-between items-center text-sm font-black text-green-600">
                                        <span className="flex items-center gap-1.5"><FaTag size={12} /> Coupon ({couponApplied})</span>
                                        <span>-₹{discountAmount}</span>
                                    </div>
                                )}
                                <div className="h-[1px] bg-gray-200/80 my-2"></div>
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-bold text-gray-800 uppercase tracking-widest">Grand Total</span>
                                    <span className="font-black text-4xl bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">₹{total - discountAmount}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Side: Address Form */}
                <div className="col-span-2 bg-gradient-to-br from-red-600 to-orange-500 p-8 sm:p-10 text-white relative overflow-hidden flex flex-col">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay pointer-events-none"></div>
                    <div className="relative z-10 flex-1">
                        <h3 className="text-2xl mb-8 font-black tracking-tight">Delivery Details</h3>
                        <form onSubmit={handleSubmit} className="flex flex-col gap-5 h-full">
                            <div className="group relative">
                                <input type="text" placeholder="Full Name" required value={name} onChange={(e) => setName(e.target.value)} 
                                    className="w-full p-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/60 focus:bg-white/20 focus:border-white/40 focus:outline-none transition-all backdrop-blur-sm" />
                            </div>
                            <div className="group relative">
                                <textarea placeholder="Complete Delivery Address" required value={address} onChange={(e) => setAddress(e.target.value)} 
                                    className="w-full p-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/60 focus:bg-white/20 focus:border-white/40 focus:outline-none transition-all backdrop-blur-sm min-h-[120px] resize-none" />
                            </div>
                            <div className="group relative">
                                <input type="tel" placeholder="Phone Number (10 digits)" required pattern="[0-9]{10}" value={phone} onChange={(e) => setPhone(e.target.value)} 
                                    className="w-full p-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/60 focus:bg-white/20 focus:border-white/40 focus:outline-none transition-all backdrop-blur-sm" />
                            </div>
                            
                            {error && <p className="text-red-200 text-sm font-bold bg-black/20 p-3 rounded-lg backdrop-blur-sm">{error}</p>}
                            
                            <div className="mt-8">
                                <button type="submit" disabled={cart.length === 0} 
                                    className="w-full bg-white text-red-600 py-4 px-8 rounded-2xl font-black text-lg hover:shadow-[0_8px_30px_rgb(255,255,255,0.3)] hover:-translate-y-1 transition-all disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none">
                                    Proceed to Payment
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderForm;
