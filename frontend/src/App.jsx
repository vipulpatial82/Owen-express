import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { FaShoppingCart, FaSearch, FaUtensils, FaEnvelope, FaPhone, FaBars, FaTimes, FaHome, FaBoxOpen, FaMapMarkerAlt, FaKey } from 'react-icons/fa';
import { API_URL } from './config';
import Home from './pages/Home';
import Showcase from './pages/Showcase';
import Search from './pages/Search';
import Payment from './components/Payment';
import OrderForm from './components/OrderForm';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Admin from './pages/Admin';
import OrderHistory from './pages/OrderHistory';
import OrderTracking from './pages/OrderTracking';
import ProtectedRoute from './components/ProtectedRoute';
import WelcomeBanner from './components/WelcomeBanner';

function Header({ cartCount, isLoggedIn, onLogout, userName, isAdmin }) {
    const nav = useNavigate();
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // close menu on route change
    const go = (path) => { nav(path); setMenuOpen(false); };

    return (
        <header className={`fixed w-full top-0 z-50 transition-all duration-500 ease-out px-4 sm:px-8 mt-4 ${scrolled ? 'py-1' : 'py-2'}`}>
            <div className={`max-w-7xl mx-auto flex justify-between items-center bg-white/70 backdrop-blur-3xl rounded-[2rem] border border-white transition-all duration-500 overflow-visible ${scrolled ? 'shadow-[0_8px_30px_rgb(0,0,0,0.08)] px-6 py-3' : 'shadow-md shadow-gray-200/50 px-8 py-5'}`}>
                {/* Logo */}
                <div className="flex items-center gap-3 cursor-pointer group relative" onClick={() => go('/')}>
                    <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center shadow-md group-hover:-translate-y-0.5 transition-all duration-300 relative z-10">
                        <FaUtensils className="text-white text-base" />
                    </div>
                    <h1 className="text-2xl font-black tracking-tight text-gray-900">Owen Express</h1>
                </div>

                {/* Desktop Nav */}
                <nav className="hidden md:flex gap-1 items-center bg-white/40 p-1.5 rounded-2xl border border-white/50 shadow-inner">
                    {isLoggedIn ? (
                        <>
                            <button className="relative bg-transparent border-none text-sm font-bold text-gray-600 cursor-pointer px-5 py-2.5 rounded-xl hover:text-red-600 hover:bg-red-50/50 hover:backdrop-blur-md hover:shadow-sm transition-all duration-200" onClick={() => go('/')}>Home</button>
                            <button className="relative bg-transparent border-none text-sm font-bold text-gray-600 cursor-pointer px-5 py-2.5 rounded-xl hover:text-red-600 hover:bg-red-50/50 hover:backdrop-blur-md hover:shadow-sm transition-all duration-200" onClick={() => go('/menu')}>Menu</button>
                            {isAdmin ? (
                                <button className="relative bg-transparent border-none text-sm font-bold text-red-600 cursor-pointer px-5 py-2.5 rounded-xl hover:text-red-700 hover:bg-red-100/50 hover:backdrop-blur-md hover:shadow-sm transition-all duration-200" onClick={() => go('/admin')}>Admin Control</button>
                            ) : (
                                <>
                                    <button className="relative bg-transparent border-none text-sm font-bold text-gray-600 cursor-pointer px-5 py-2.5 rounded-xl hover:text-red-600 hover:bg-red-50/50 hover:backdrop-blur-md hover:shadow-sm transition-all duration-200" onClick={() => go('/orders')}>My Orders</button>
                                    <button className="relative bg-transparent border-none text-sm font-bold text-gray-600 cursor-pointer px-5 py-2.5 rounded-xl hover:text-red-600 hover:bg-red-50/50 hover:backdrop-blur-md hover:shadow-sm transition-all duration-200" onClick={() => go('/track')}>Track Order</button>
                                </>
                            )}
                            <button className="relative bg-transparent border-none text-sm font-bold text-gray-600 cursor-pointer px-5 py-2.5 rounded-xl hover:text-red-600 hover:bg-red-50/50 hover:backdrop-blur-md hover:shadow-sm transition-all duration-200" onClick={() => go('/search')}><FaSearch className="text-base" /></button>
                            {!isAdmin && (
                                <button className="relative bg-white border border-gray-100 shadow-sm text-sm font-bold text-gray-900 cursor-pointer px-5 py-2.5 rounded-xl hover:text-red-600 hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center gap-2 group ml-2" onClick={() => go('/order-summary')}>
                                    {cartCount > 0 && (
                                        <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-600 to-orange-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-black shadow-md z-20 group-hover:scale-110 transition-transform">{cartCount}</span>
                                    )}
                                    <FaShoppingCart className="text-base group-hover:text-red-500 transition-colors" /> Cart
                                </button>
                            )}
                            {userName && <div className="h-6 w-[1px] bg-gray-200 mx-2"></div>}
                            {userName && <span className="text-sm font-bold text-gray-500 px-3 bg-gray-50/50 py-2 rounded-xl border border-gray-100 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-400"></span>{userName}</span>}
                            <button className="ml-2 px-6 py-2.5 text-sm font-bold text-red-600 bg-red-50 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm border border-red-100" onClick={onLogout}>Logout</button>
                        </>
                    ) : (
                        <>
                            <button className="relative bg-transparent border-none text-sm font-bold text-gray-600 cursor-pointer px-5 py-2.5 rounded-xl hover:text-red-600 hover:bg-red-50/50 hover:backdrop-blur-md hover:shadow-sm transition-all duration-200" onClick={() => go('/')}>Home</button>
                            <div className="h-6 w-[1px] bg-gray-200 mx-1"></div>
                            <button className="relative bg-transparent border-none text-sm font-bold text-gray-600 cursor-pointer px-5 py-2.5 rounded-xl hover:text-red-600 hover:bg-red-50/50 hover:backdrop-blur-md hover:shadow-sm transition-all duration-200" onClick={() => go('/login')}>Login</button>
                            <button className="ml-2 px-6 py-2.5 text-sm font-black bg-gradient-to-r from-red-600 to-orange-500 text-white rounded-xl hover:shadow-[0_4px_15px_rgba(239,68,68,0.4)] hover:-translate-y-0.5 transition-all" onClick={() => go('/signup')}>Signup</button>
                        </>
                    )}
                </nav>

                {/* Mobile right side */}
                <div className="flex md:hidden items-center gap-3">
                    {isLoggedIn && !isAdmin && (
                        <button className="relative p-3 bg-white border border-gray-100 rounded-xl shadow-sm text-gray-800" onClick={() => go('/order-summary')}>
                            {cartCount > 0 && (
                                <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-600 to-orange-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-black shadow-md">{cartCount}</span>
                            )}
                            <FaShoppingCart className="text-lg" />
                        </button>
                    )}
                    <button className="p-3 bg-gray-50 border border-gray-100 rounded-xl text-gray-800" onClick={() => setMenuOpen(!menuOpen)}>
                        {menuOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
                    </button>
                </div>
            </div>

            {/* Mobile Dropdown Menu */}
            {menuOpen && (
                <div className="md:hidden absolute top-[calc(100%+10px)] left-4 right-4 bg-white/95 backdrop-blur-xl border border-white rounded-[2rem] shadow-[0_20px_40px_rgba(0,0,0,0.1)] p-4 flex flex-col gap-2 z-50 animate-fadeIn">
                    {isLoggedIn ? (
                        <>
                            <button className="text-left px-5 py-4 rounded-xl text-gray-800 font-bold hover:bg-red-50 hover:text-red-600 transition-all flex items-center gap-3" onClick={() => go('/')}><span className="text-gray-400"><FaHome /></span> Home</button>
                            <button className="text-left px-5 py-4 rounded-xl text-gray-800 font-bold hover:bg-red-50 hover:text-red-600 transition-all flex items-center gap-3" onClick={() => go('/menu')}><span className="text-gray-400"><FaUtensils /></span> Menu</button>
                            {isAdmin ? (
                                <button className="text-left px-5 py-4 rounded-xl text-red-600 font-bold hover:bg-red-50 transition-all flex items-center gap-3" onClick={() => go('/admin')}><span className="text-red-400"><FaKey /></span> Admin Control</button>
                            ) : (
                                <>
                                    <button className="text-left px-5 py-4 rounded-xl text-gray-800 font-bold hover:bg-red-50 hover:text-red-600 transition-all flex items-center gap-3" onClick={() => go('/orders')}><span className="text-gray-400"><FaBoxOpen /></span> My Orders</button>
                                    <button className="text-left px-5 py-4 rounded-xl text-gray-800 font-bold hover:bg-red-50 hover:text-red-600 transition-all flex items-center gap-3" onClick={() => go('/track')}><span className="text-gray-400"><FaMapMarkerAlt /></span> Track Order</button>
                                </>
                            )}
                            <button className="text-left px-5 py-4 rounded-xl text-gray-800 font-bold hover:bg-red-50 hover:text-red-600 transition-all flex items-center gap-3" onClick={() => go('/search')}><span className="text-gray-400"><FaSearch /></span> Search</button>
                            <div className="h-[1px] bg-gray-100 my-2"></div>
                            <button className="mt-2 px-5 py-4 text-center font-black text-red-600 bg-red-50 border border-red-100 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm" onClick={() => { onLogout(); setMenuOpen(false); }}>Logout</button>
                        </>
                    ) : (
                        <>
                            <button className="text-left px-5 py-4 rounded-xl text-gray-800 font-bold hover:bg-red-50 hover:text-red-600 transition-all flex items-center gap-3" onClick={() => go('/')}><span className="text-gray-400"><FaHome /></span> Home</button>
                            <button className="text-left px-5 py-4 rounded-xl text-gray-800 font-bold hover:bg-red-50 hover:text-red-600 transition-all flex items-center gap-3" onClick={() => go('/login')}><span className="text-gray-400"><FaKey /></span> Login</button>
                            <button className="mt-2 px-5 py-4 text-center font-black bg-gradient-to-r from-red-600 to-orange-500 text-white rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all" onClick={() => go('/signup')}>Sign Up</button>
                        </>
                    )}
                </div>
            )}
        </header>
    );
}

function AnimatedRoutes({ cart, setCart, removeFromCart, clearCart, isLoggedIn, setIsLoggedIn, setIsAdmin, setUserName }) {
    const location = useLocation();
    return (
        <div key={location.pathname} className="animate-fadeIn">
            <Routes location={location}>
                <Route path="/" element={<Showcase isLoggedIn={isLoggedIn} />} />
                <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} setIsAdmin={setIsAdmin} setUserName={setUserName} />} />
                <Route path="/signup" element={<Signup setIsLoggedIn={setIsLoggedIn} setIsAdmin={setIsAdmin} setUserName={setUserName} />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/search" element={<ProtectedRoute isLoggedIn={isLoggedIn}><Search cart={cart} setCart={setCart} /></ProtectedRoute>} />
                <Route path="/orders" element={<ProtectedRoute isLoggedIn={isLoggedIn}><OrderHistory /></ProtectedRoute>} />
                <Route path="/menu" element={<ProtectedRoute isLoggedIn={isLoggedIn}><Home cart={cart} setCart={setCart} /></ProtectedRoute>} />
                <Route path="/order-summary" element={<ProtectedRoute isLoggedIn={isLoggedIn}><OrderForm cart={cart} removeFromCart={removeFromCart} setCart={setCart} /></ProtectedRoute>} />
                <Route path="/payment" element={<ProtectedRoute isLoggedIn={isLoggedIn}><Payment clearCart={clearCart} /></ProtectedRoute>} />
                <Route path="/order-tracking" element={<ProtectedRoute isLoggedIn={isLoggedIn}><OrderTracking /></ProtectedRoute>} />
                <Route path="/track" element={<ProtectedRoute isLoggedIn={isLoggedIn}><OrderTracking /></ProtectedRoute>} />
            </Routes>
        </div>
    );
}

function App() {
    const [cart, setCart] = useState(() => {
        try {
            const saved = localStorage.getItem('cart');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const [userName, setUserName] = useState('');

    useEffect(() => { localStorage.setItem('cart', JSON.stringify(cart)); }, [cart]);

    useEffect(() => {
        const verifyToken = async () => {
            const token = localStorage.getItem('token');
            const user = localStorage.getItem('user');
            if (token && user && user !== 'undefined' && user !== 'null') {
                try {
                    const res = await fetch(`${API_URL}/api/users/verify`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (res.ok) {
                        const data = await res.json();
                        localStorage.setItem('user', JSON.stringify(data.user));
                        setUserName(data.user.name);
                        setIsLoggedIn(true);
                        setIsAdmin(data.user.isAdmin || false);
                    } else {
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                    }
                } catch {
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
        setIsAdmin(false);
        setCart([]);
        ['token', 'user', 'cart'].forEach(k => localStorage.removeItem(k));
        window.location.href = '/';
    };

    if (loading) return (
        <div className="flex justify-center items-center min-h-screen bg-slate-50 relative overflow-hidden">
            <div className="text-center relative z-10 flex flex-col items-center">
                <div className="w-20 h-20 rounded-3xl bg-red-600 flex items-center justify-center mb-6 shadow-md animate-pulse relative">
                    <FaUtensils className="text-white text-3xl drop-shadow-md" />
                </div>
                <p className="font-black text-2xl text-red-600 tracking-tight">Authenticating...</p>
            </div>
        </div>
    );

    return (
        <Router>
            <div className="min-h-screen flex flex-col bg-slate-50 relative selection:bg-red-200 selection:text-red-900 overflow-x-hidden">
                {/* Global subtle textures */}
                <div className="fixed inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02] mix-blend-overlay pointer-events-none z-[-1]"></div>
                
                <Header cartCount={cart.length} isLoggedIn={isLoggedIn} onLogout={handleLogout} userName={userName} isAdmin={isAdmin} />
                
                <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full mt-28 relative z-10">
                    <AnimatedRoutes cart={cart} setCart={setCart} removeFromCart={removeFromCart} clearCart={clearCart} isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} setIsAdmin={setIsAdmin} setUserName={setUserName} />
                </main>

                <WelcomeBanner isLoggedIn={isLoggedIn} />

                <footer className="bg-gray-950 text-white pt-20 pb-12 px-8 mt-auto relative overflow-hidden border-t border-gray-800">
                    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 relative z-10">
                        <div className="md:col-span-2">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-red-600 flex items-center justify-center shadow-md relative">
                                    <FaUtensils className="text-white text-lg drop-shadow-sm" />
                                </div>
                                <h3 className="text-3xl font-black text-white tracking-tight">Owen Express</h3>
                            </div>
                            <p className="text-gray-400 text-sm leading-relaxed max-w-sm font-medium">Elevating your dining experience with premium food delivery. Bringing authentic, chef-crafted recipes directly to your doorstep with speed and elegance.</p>
                        </div>
                        
                        <div>
                            <h4 className="text-sm font-black text-white mb-6 uppercase tracking-widest flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500"></div> Explore</h4>
                            <div className="space-y-4">
                                <a href="/" className="block text-gray-400 hover:text-white font-medium hover:translate-x-1 transition-all text-sm">Home</a>
                                <a href="/menu" className="block text-gray-400 hover:text-white font-medium hover:translate-x-1 transition-all text-sm">Main Menu</a>
                                <a href="/search" className="block text-gray-400 hover:text-white font-medium hover:translate-x-1 transition-all text-sm">Search</a>
                            </div>
                        </div>
                        
                        <div>
                            <h4 className="text-sm font-black text-white mb-6 uppercase tracking-widest flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-orange-500"></div> Contact</h4>
                            <div className="space-y-4">
                                <a href="mailto:owenexpress@gmail.com" className="flex items-center gap-3 text-gray-400 hover:text-white font-medium group transition-all text-sm"><span className="w-8 h-8 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-center group-hover:bg-gray-800 transition-colors"><FaEnvelope className="text-gray-300" /></span> owenexpress@gmail.com</a>
                                <a href="tel:+919876543210" className="flex items-center gap-3 text-gray-400 hover:text-white font-medium group transition-all text-sm"><span className="w-8 h-8 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-center group-hover:bg-gray-800 transition-colors"><FaPhone className="text-gray-300" /></span> +91 98765 43210</a>
                            </div>
                        </div>
                    </div>
                    
                    <div className="max-w-7xl mx-auto border-t border-gray-800/80 pt-8 mt-16 text-center relative z-10">
                        <p className="text-gray-500 text-sm font-medium">© 2026 Owen Express. All rights reserved.</p>
                    </div>
                </footer>
            </div>
        </Router>
    );
}

export default App;
