import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaTrash } from 'react-icons/fa';

const OrderForm = ({ cart, removeFromCart }) => {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');

    const grouped = cart.reduce((acc, item) => {
        const found = acc.find(i => i.name === item.name);
        found ? found.quantity += 1 : acc.push({ ...item, quantity: 1 });
        return acc;
    }, []);

    const total = cart.reduce((sum, item) => sum + item.price, 0);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name || !address || !phone) {
            alert('Please fill all fields');
            return;
        }
        if (!/^[6-9]\d{9}$/.test(phone)) {
            alert('Please enter a valid 10-digit Indian phone number starting with 6-9');
            return;
        }
        navigate('/payment', { state: { cart: grouped, total, address: { name, address, phone } } });
    };

    return (
        <div className="max-w-5xl mx-auto my-8">
            <button onClick={() => navigate('/menu')} className="px-5 py-2.5 bg-white text-red-600 rounded-xl font-medium transition-all shadow-lg hover:shadow-xl mb-6">
                ← Back to Menu
            </button>

            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-orange-600 to-red-600 p-6">
                    <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                        <FaShoppingCart /> Order Summary
                    </h2>
                </div>

                {cart.length === 0 ? (
                    <div className="text-center py-12 px-6">
                        <p className="text-xl text-gray-600 mb-6">Your cart is empty.</p>
                        <button onClick={() => navigate('/menu')} className="bg-gradient-to-r from-orange-600 to-red-600 text-white py-3 px-8 rounded-xl font-bold hover:shadow-lg transition-all">Browse Menu</button>
                    </div>
                ) : (
                    <div className="p-8">
                        <div className="overflow-x-auto mb-4 -mx-8">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b-2 border-gray-200">
                                        <th className="text-left p-4 text-gray-700 font-semibold pl-8">Item</th>
                                        <th className="text-right p-4 text-gray-700 font-semibold">Price</th>
                                        <th className="text-center p-4 text-gray-700 font-semibold pr-8">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {grouped.map((item, idx) => (
                                        <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                                            <td className="p-4 pl-8">
                                                <span className="font-medium">{item.name}</span>
                                                {item.quantity > 1 && <span className="ml-2 text-orange-600 font-semibold">x{item.quantity}</span>}
                                            </td>
                                            <td className="text-right p-4 font-semibold text-gray-800">₹{item.price * item.quantity}</td>
                                            <td className="text-center p-4 pr-8">
                                                <button className="bg-red-100 text-red-600 p-2 rounded-lg hover:bg-red-600 hover:text-white transition-all" onClick={() => removeFromCart(cart.findIndex(i => i.name === item.name))}>
                                                    <FaTrash />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    <tr className="border-t-2 border-gray-300">
                                        <td className="p-4 pl-8 font-bold text-lg text-gray-800">Total:</td>
                                        <td className="text-right p-4 font-bold text-xl bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">₹{total}</td>
                                        <td className="pr-8"></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <h3 className="text-2xl mb-6 font-bold text-gray-800">Delivery Address</h3>
                        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                            <input type="text" placeholder="Your Name" required value={name} onChange={(e) => setName(e.target.value)} className="p-4 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none transition-colors" />
                            <textarea placeholder="Your Address" required value={address} onChange={(e) => setAddress(e.target.value)} className="p-4 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none transition-colors min-h-[100px]" />
                            <input type="tel" placeholder="Your Phone" required pattern="[0-9]{10}" value={phone} onChange={(e) => setPhone(e.target.value)} className="p-4 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none transition-colors" />
                            <button type="submit" className="bg-gradient-to-r from-orange-600 to-red-600 text-white py-4 px-8 rounded-xl font-bold hover:shadow-lg transition-all mt-2">Proceed to Payment</button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderForm;
