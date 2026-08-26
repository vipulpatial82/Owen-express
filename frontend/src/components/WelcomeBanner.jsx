import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaGift, FaCopy, FaCheck, FaTimes } from 'react-icons/fa';
import { API_URL } from '../config';

const WelcomeBanner = ({ isLoggedIn }) => {
    const [show, setShow] = useState(false);
    const [copied, setCopied] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const checkEligibility = () => {
            const userStr = localStorage.getItem('user');
            if (!userStr) {
                setShow(false);
                return;
            }

            try {
                const user = JSON.parse(userStr);
                // Do not show for admins
                if (user && user.isAdmin) {
                    setShow(false);
                    return;
                }

                // Show only if the user is a registered new user
                if (user && user.isNewUser === true) {
                    setShow(true);
                } else {
                    setShow(false);
                }
            } catch (err) {
                console.error(err);
            }
        };

        checkEligibility();
    }, [isLoggedIn, location.pathname]);

    const updateNewUserStatus = async () => {
        const userStr = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        if (userStr && token) {
            try {
                const user = JSON.parse(userStr);
                const res = await fetch(`${API_URL}/api/users/dismiss-welcome-coupon`, {
                    method: 'PUT',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (res.ok) {
                    const data = await res.json();
                    localStorage.setItem('user', JSON.stringify(data.user));
                } else {
                    user.isNewUser = false;
                    localStorage.setItem('user', JSON.stringify(user));
                }
            } catch (err) {
                console.error('Error dismissing welcome coupon:', err);
                try {
                    const user = JSON.parse(userStr);
                    user.isNewUser = false;
                    localStorage.setItem('user', JSON.stringify(user));
                } catch (_) {}
            }
        }
    };

    const handleCopy = async () => {
        navigator.clipboard.writeText('WELCOMEOWEN');
        setCopied(true);
        await updateNewUserStatus();
        setTimeout(() => {
            setShow(false);
            setCopied(false);
        }, 1000);
    };

    const handleDismiss = async () => {
        await updateNewUserStatus();
        setShow(false);
    };

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0, y: 100, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 50, scale: 0.9 }}
                    transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                    className="fixed bottom-6 right-6 z-[999] max-w-sm bg-white/85 backdrop-blur-xl border border-orange-200/50 rounded-3xl p-6 shadow-[0_20px_50px_-15px_rgba(234,88,12,0.25)] flex gap-4 overflow-hidden"
                >
                    {/* Glowing background effects */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-400/10 rounded-full blur-2xl pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-red-400/10 rounded-full blur-xl pointer-events-none"></div>

                    {/* Icon Container */}
                    <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-md shadow-orange-500/20 text-white text-xl">
                        <FaGift className="animate-pulse" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 relative z-10 pr-4">
                        <h4 className="font-black text-gray-900 text-lg mb-1 flex items-center gap-2">
                            Welcome Offer! 🎁
                        </h4>
                        <p className="text-gray-600 text-sm font-semibold leading-relaxed mb-4">
                            Get <span className="text-orange-500 font-bold">50% OFF</span> on your very first order at Owen Express.
                        </p>
                        
                        {/* Coupon Code copy box */}
                        <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl p-2.5">
                            <span className="font-black text-sm text-gray-800 tracking-wider flex-1 select-all px-1">
                                WELCOMEOWEN
                            </span>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleCopy}
                                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${
                                    copied 
                                        ? 'bg-green-500 text-white' 
                                        : 'bg-[#0B0F19] text-white hover:bg-orange-600'
                                }`}
                            >
                                {copied ? (
                                    <>
                                        <FaCheck size={10} /> Copied
                                    </>
                                ) : (
                                    <>
                                        <FaCopy size={10} /> Copy
                                    </>
                                )}
                            </motion.button>
                        </div>
                    </div>

                    {/* Close Button */}
                    <button
                        onClick={handleDismiss}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <FaTimes size={12} />
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default WelcomeBanner;
