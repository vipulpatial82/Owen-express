import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaCreditCard, FaMoneyBillWave, FaMobileAlt, FaCheckCircle } from 'react-icons/fa';

const paymentOptions = [
    { id: 'upi', name: 'UPI Payment', icon: FaMobileAlt },
    { id: 'credit', name: 'Credit Card', icon: FaCreditCard },
    { id: 'cod', name: 'Cash on Delivery', icon: FaMoneyBillWave }
];

const Payment = ({ clearCart }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [selected, setSelected] = useState('upi');
    const [paid, setPaid] = useState(false);
    
    const { cart = [], address = {}, total = 0 } = location.state || {};

    if (!cart.length && !paid) {
        navigate('/menu');
        return null;
    }

    const handlePay = async () => {
        const userStr = localStorage.getItem('user');
        let user = null;
        
        try {
            if (userStr) {
                user = JSON.parse(userStr);
            }
        } catch (error) {
            console.error('Error parsing user data:', error);
        }
        
        try {
            const res = await fetch('http://localhost:5000/api/orders/payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: address.name,
                    address: address.address,
                    phone: user?.email || address.phone,
                    cart,
                    total,
                    paymentMethod: selected
                })
            });
            if (res.ok) {
                setPaid(true);
                clearCart();
            } else {
                alert('Failed to place order.');
            }
        } catch {
            alert('Error connecting to server.');
        }
    };

    return (
        <div className="max-w-2xl mx-auto my-8">
            <button onClick={() => navigate('/order-summary')} className="px-5 py-2.5 bg-white text-red-600 rounded-xl font-medium transition-all shadow-lg hover:shadow-xl mb-6">
                ← Back to Order Summary
            </button>
            
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                {!paid ? (
                    <>
                        <div className="bg-gradient-to-r from-orange-600 to-red-600 p-6">
                            <h2 className="text-3xl font-bold text-white text-center">Payment Method</h2>
                        </div>
                        
                        <div className="p-8">
                            <div className="grid gap-4 mb-8">
                                {paymentOptions.map(option => {
                                    const Icon = option.icon;
                                    return (
                                        <div key={option.id}
                                            className={`p-5 border-2 rounded-xl cursor-pointer transition-all flex items-center gap-4 ${
                                                selected === option.id 
                                                    ? 'border-orange-500 bg-gradient-to-r from-orange-50 to-red-50 shadow-md' 
                                                    : 'border-gray-200 hover:border-orange-300 hover:shadow-sm'
                                            }`}
                                            onClick={() => setSelected(option.id)}>
                                            <Icon className={`text-2xl ${selected === option.id ? 'text-orange-600' : 'text-gray-400'}`} />
                                            <span className={`text-lg font-semibold ${selected === option.id ? 'text-gray-800' : 'text-gray-600'}`}>
                                                {option.name}
                                            </span>
                                            {selected === option.id && <FaCheckCircle className="ml-auto text-orange-600" />}
                                        </div>
                                    );
                                })}
                            </div>
                            
                            <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-xl mb-6">
                                <div className="flex justify-between items-center">
                                    <span className="text-xl font-bold text-gray-800">Total Amount:</span>
                                    <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">₹{total}</span>
                                </div>
                            </div>
                            
                            <button className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg transition-all" onClick={handlePay}>
                                Pay Now
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="text-center p-12">
                        <div className="text-7xl mb-6 text-green-500">
                            <FaCheckCircle className="inline-block" />
                        </div>
                        <h2 className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent font-bold text-4xl mb-4">Payment Successful!</h2>
                        <p className="text-gray-600 text-lg mb-8">Your order has been placed and will be delivered soon.</p>
                        <button onClick={() => navigate('/')} className="bg-gradient-to-r from-orange-600 to-red-600 text-white py-4 px-10 rounded-xl font-bold hover:shadow-lg transition-all">Back to Home</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Payment;
