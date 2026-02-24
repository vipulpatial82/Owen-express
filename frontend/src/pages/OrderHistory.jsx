import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaShoppingBag, FaMapMarkerAlt, FaPhone, FaUser, FaClock, FaStar } from 'react-icons/fa';

const btnStyle = "bg-red-600 text-white py-3 px-8 rounded-full font-bold hover:bg-red-700";

const OrderHistory = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [ratingModal, setRatingModal] = useState({ show: false, orderId: null, rating: 0, review: '' });
    const navigate = useNavigate();

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        console.log('User string from localStorage:', userStr);
        
        if (!userStr || userStr === 'undefined' || userStr === 'null') {
            console.log('No valid user found, redirecting to login');
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            return navigate('/login');
        }
        
        try {
            const user = JSON.parse(userStr);
            console.log('Parsed user:', user);
            
            if (!user || !user.email) {
                console.log('User or email missing, redirecting to login');
                localStorage.removeItem('user');
                localStorage.removeItem('token');
                return navigate('/login');
            }

            console.log('Fetching orders for email:', user.email);
            fetch(`http://localhost:5000/api/orders/user/${user.email}`)
                .then(res => {
                    console.log('Response status:', res.status);
                    return res.json();
                })
                .then(data => {
                    console.log('Orders received:', data);
                    setOrders(data);
                    setLoading(false);
                })
                .catch(err => {
                    console.error('Error fetching orders:', err);
                    setLoading(false);
                });
        } catch (error) {
            console.error('Error parsing user data:', error);
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            navigate('/login');
        }
    }, [navigate]);

    if (loading) return <div className="text-center py-20 text-xl">Loading orders...</div>;

    const submitRating = async () => {
        try {
            const res = await fetch(`http://localhost:5000/api/orders/${ratingModal.orderId}/rate`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rating: ratingModal.rating, review: ratingModal.review })
            });
            if (res.ok) {
                setOrders(orders.map(o => o._id === ratingModal.orderId ? { ...o, rating: ratingModal.rating, review: ratingModal.review } : o));
                setRatingModal({ show: false, orderId: null, rating: 0, review: '' });
            }
        } catch (err) {
            console.error('Error submitting rating:', err);
        }
    };

    return (
        <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
                    My Orders
                </h1>
                <p className="text-gray-500 text-lg">Track and view your order history</p>
            </div>
            
            {orders.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 shadow-lg text-center">
                    <FaShoppingBag className="text-6xl text-gray-300 mx-auto mb-4" />
                    <p className="text-xl text-gray-600 mb-6">You haven't placed any orders yet.</p>
                    <button onClick={() => navigate('/menu')} className={btnStyle}>Browse Menu</button>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map((order, idx) => (
                        <div key={order._id || idx} className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 hover:shadow-2xl transition">
                            <div className="flex justify-between items-start mb-4 border-b pb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-2">Order {idx + 1}</h3>
                                    <div className="flex items-center text-gray-500">
                                        <FaClock className="mr-2" />
                                        <p className="text-sm">
                                            {new Date(order.createdAt).toLocaleDateString('en-IN', { 
                                                year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">₹{order.total}</p>
                                    <p className="text-md text-black mt-1">Payment Type: <span className="uppercase">{order.paymentMethod}</span></p>
                                </div>
                            </div>

                            <div className="mb-4">
                                <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                                    <FaShoppingBag className="mr-2 text-gray-400" />
                                    Order Items:
                                </h4>
                                {order.cart?.map((item, i) => (
                                    <div key={i} className="flex justify-between bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-lg mb-2 border border-orange-100">
                                        <span className="font-medium text-gray-700">{item.name} {item.quantity > 1 && `x${item.quantity}`}</span>
                                        <span className="font-bold text-orange-600">₹{item.price * (item.quantity || 1)}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t pt-4 bg-gray-50 -mx-6 -mb-6 px-6 py-4 rounded-b-2xl">
                                <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                                    <FaMapMarkerAlt className="mr-2 text-red-500" />
                                    Delivery Details:
                                </h4>
                                <div className="space-y-2 text-gray-600">
                                    <p className="flex items-center">
                                        <FaUser className="mr-3 text-gray-400" />
                                        {order.name}
                                    </p>
                                    <p className="flex items-center">
                                        <FaMapMarkerAlt className="mr-3 text-gray-400" />
                                        {order.address}
                                    </p>
                                    <p className="flex items-center">
                                        <FaPhone className="mr-3 text-gray-400" />
                                        {order.phone}
                                    </p>
                                </div>
                            </div>

                            <div className="border-t pt-4 mt-4">
                                {order.rating ? (
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-500 mb-1">Your Rating:</p>
                                            <div className="flex">
                                                {[1,2,3,4,5].map(star => (
                                                    <FaStar key={star} className={`text-xl ${star <= order.rating ? 'text-yellow-400' : 'text-gray-300'}`} />
                                                ))}
                                            </div>
                                            {order.review && <p className="text-sm text-gray-600 mt-2 italic">"{order.review}"</p>}
                                        </div>
                                    </div>
                                ) : (
                                    <button 
                                        onClick={() => setRatingModal({ show: true, orderId: order._id, rating: 0, review: '' })}
                                        className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-2 rounded-lg font-semibold hover:from-orange-600 hover:to-red-600"
                                    >
                                        Rate this Order
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {ratingModal.show && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setRatingModal({ show: false, orderId: null, rating: 0, review: '' })}>
                    <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
                        <h3 className="text-2xl font-bold mb-4 text-gray-800">Rate Your Order</h3>
                        <div className="flex justify-center gap-2 mb-6">
                            {[1,2,3,4,5].map(star => (
                                <FaStar 
                                    key={star}
                                    className={`text-4xl cursor-pointer transition ${star <= ratingModal.rating ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-400`}
                                    onClick={() => setRatingModal({...ratingModal, rating: star})}
                                />
                            ))}
                        </div>
                        <textarea 
                            placeholder="Share your experience (optional)"
                            className="w-full border rounded-lg p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-orange-500"
                            rows="3"
                            value={ratingModal.review}
                            onChange={e => setRatingModal({...ratingModal, review: e.target.value})}
                        />
                        <div className="flex gap-3">
                            <button onClick={() => setRatingModal({ show: false, orderId: null, rating: 0, review: '' })} className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-300">Cancel</button>
                            <button onClick={submitRating} disabled={!ratingModal.rating} className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white py-2 rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 disabled:opacity-50">Submit</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderHistory;
