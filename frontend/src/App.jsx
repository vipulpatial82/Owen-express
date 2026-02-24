import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaSearch } from 'react-icons/fa';
import Home from './pages/Home';
import Showcase from './pages/Showcase';
import Search from './pages/Search';
import Payment from './components/Payment';
import OrderForm from './components/OrderForm';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Admin from './pages/Admin';
import OrderHistory from './pages/OrderHistory';
import ProtectedRoute from './components/ProtectedRoute';

const btnStyle = "bg-transparent border-none text-base font-medium text-gray-900 cursor-pointer px-4 py-2 rounded-xl hover:text-red-500 transition-all";

function Header({ cartCount, isLoggedIn, onLogout }) {
    const nav = useNavigate();
    
    return (
        <header className="bg-white shadow-md py-4 px-8 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <h1 className="text-red-500 text-3xl font-bold cursor-pointer" onClick={() => nav('/')}>Owen Express</h1>
                
                <nav className="flex gap-6 items-center">
                    {isLoggedIn ? (
                        <>
                            <button className={btnStyle} onClick={() => nav('/')}>Home</button>
                            <button className={btnStyle} onClick={() => nav('/menu')}>Menu</button>
                            <button className={btnStyle} onClick={() => nav('/orders')}>My Orders</button>
                            
                            {/* Search Button */}
                            <button 
                                className={btnStyle} 
                                onClick={() => nav('/search')}
                                title="Search Menu"
                            >
                                <FaSearch className="text-xl" />
                            </button>
                            
                            <button className={`relative ${btnStyle}`} onClick={() => nav('/order-summary')}>
                                {cartCount > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold">
                                        {cartCount}
                                    </span>
                                )}
                                <FaShoppingCart className="text-xl" />
                            </button>
                            <button className={btnStyle} onClick={onLogout}>Logout</button>
                        </>
                    ) : (
                        <>
                            <button className={btnStyle} onClick={() => nav('/')}>Home</button>
                            <button className={btnStyle} onClick={() => nav('/login')}>Login</button>
                            <button className={btnStyle} onClick={() => nav('/signup')}>Sign Up</button>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
}

function App() {
    const [cart, setCart] = useState(() => {
        const saved = localStorage.getItem('cart');
        return saved ? JSON.parse(saved) : [];
    });
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    useEffect(() => {
        const verifyToken = async () => {
            const token = localStorage.getItem('token');
            const user = localStorage.getItem('user');
            
            if (token && user && user !== 'undefined' && user !== 'null') {
                try {
                    const res = await fetch('http://localhost:5000/api/users/verify', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (res.ok) {
                        const data = await res.json();
                        localStorage.setItem('user', JSON.stringify(data.user));
                        setIsLoggedIn(true);
                    } else {
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        setIsLoggedIn(false);
                    }
                } catch (error) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    setIsLoggedIn(false);
                }
            } else {
                setIsLoggedIn(false);
            }
            setLoading(false);
        };
        verifyToken();
    }, []);

    const removeFromCart = (index) => setCart(cart.filter((_, i) => i !== index));
    const clearCart = () => setCart([]);
    const handleLogout = () => {
        setIsLoggedIn(false);
        setCart([]);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('cart');
        window.location.href = '/';
    };

    if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;

    return (
        <Router>
            <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#fff5f0' }}>
                <Header cartCount={cart.length} isLoggedIn={isLoggedIn} onLogout={handleLogout} />
                
                <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
                    <Routes>
                        <Route path="/" element={<Showcase isLoggedIn={isLoggedIn} />} />
                        <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
                        <Route path="/signup" element={<Signup />} />
                        <Route path="/admin" element={<Admin />} />
                        <Route path="/search" element={<ProtectedRoute isLoggedIn={isLoggedIn}><Search cart={cart} setCart={setCart} /></ProtectedRoute>} />
                        <Route path="/orders" element={<ProtectedRoute isLoggedIn={isLoggedIn}><OrderHistory /></ProtectedRoute>} />
                        <Route path="/menu" element={<ProtectedRoute isLoggedIn={isLoggedIn}><Home cart={cart} setCart={setCart} /></ProtectedRoute>} />
                        <Route path="/order-summary" element={<ProtectedRoute isLoggedIn={isLoggedIn}><OrderForm cart={cart} removeFromCart={removeFromCart} /></ProtectedRoute>} />
                        <Route path="/payment" element={<ProtectedRoute isLoggedIn={isLoggedIn}><Payment clearCart={clearCart} /></ProtectedRoute>} />
                    </Routes>
                </main>
                
                <footer className="bg-gray-900 text-white py-12 px-8">
                    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div>
                            <h3 className="text-2xl font-bold text-red-500 mb-3">Owen Express</h3>
                            <p className="text-gray-300 leading-relaxed">Premium food delivery service bringing authentic flavors to your doorstep</p>
                        </div>
                        <div>
                            <h4 className="text-lg font-semibold mb-4 text-white">Quick Links</h4>
                            <a href="/" className="block text-gray-300 hover:text-red-500 mb-2 transition">Home</a>
                            <a href="/menu" className="block text-gray-300 hover:text-red-500 mb-2 transition">Menu</a>
                        </div>
                        <div>
                            <h4 className="text-lg font-semibold mb-4 text-white">Contact Us</h4>
                            <p className="text-gray-300 mb-2"> owenexpress@gmail.com</p>
                            <p className="text-gray-300"> +91 9876543210</p>
                        </div>
                    </div>
                    <div className="text-center pt-6 mt-8 border-t border-white/10">
                        <p className="text-gray-400">Made  by React Rebel</p>
                    </div>
                </footer>
            </div>
        </Router>
    );
}

export default App;