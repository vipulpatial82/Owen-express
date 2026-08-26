import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaStar, FaEdit, FaTrash, FaPlus, FaLeaf, FaDrumstickBite, FaImage, FaTimes, FaUtensils, FaShoppingBag, FaCheck, FaBan, FaClock, FaMotorcycle, FaTag } from 'react-icons/fa';
import { API_URL } from '../config';

const Admin = () => {
    const [items, setItems] = useState([]);
    const [activeTab, setActiveTab] = useState('menu');
    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [ingredients, setIngredients] = useState('');
    const [type, setType] = useState('veg');
    const [isChefSpecial, setIsChefSpecial] = useState(false);
    const [prepTime, setPrepTime] = useState(15);
    const [deliveryTime, setDeliveryTime] = useState(30);
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [editingImage, setEditingImage] = useState('');
    const [status, setStatus] = useState({ msg: '', ok: true });
    const [loading, setLoading] = useState(false);
    const [acceptingOrder, setAcceptingOrder] = useState(null);
    const [accPrepTime, setAccPrepTime] = useState(20);
    const [accDeliveryTime, setAccDeliveryTime] = useState(30);
    const navigate = useNavigate();

    // Coupons State
    const [coupons, setCoupons] = useState([]);
    const [couponsLoading, setCouponsLoading] = useState(false);
    const [couponCode, setCouponCode] = useState('');
    const [couponDiscountType, setCouponDiscountType] = useState('percentage');
    const [couponDiscountValue, setCouponDiscountValue] = useState('');
    const [couponMinOrder, setCouponMinOrder] = useState('');

    useEffect(() => {
        let user = null;
        try { user = JSON.parse(localStorage.getItem('user')); } catch { navigate('/'); return; }
        if (!user || !user.isAdmin) { navigate('/'); return; }
        fetchItems();
        fetchOrders();
        fetchCoupons();

        const interval = setInterval(() => fetchOrders(true), 7000);
        return () => clearInterval(interval);
    }, [navigate]);

    const fetchCoupons = async () => {
        setCouponsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/coupons`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setCoupons(Array.isArray(data) ? data : []);
            }
        } catch {
            showStatus('Failed to load coupons', false);
        }
        setCouponsLoading(false);
    };

    const handleCouponSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/coupons`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    code: couponCode,
                    discountType: couponDiscountType,
                    discountValue: Number(couponDiscountValue),
                    minOrderAmount: Number(couponMinOrder) || 0
                })
            });
            if (response.ok) {
                showStatus('Coupon created successfully!', true);
                setCouponCode('');
                setCouponDiscountValue('');
                setCouponMinOrder('');
                fetchCoupons();
            } else {
                const err = await response.json().catch(() => ({}));
                showStatus(err.error || 'Failed to create coupon', false);
            }
        } catch {
            showStatus('Failed to create coupon', false);
        }
        setLoading(false);
    };

    const handleCouponDelete = async (id) => {
        if (!window.confirm('Delete this coupon code?')) return;
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/coupons/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                showStatus('Coupon deleted!', true);
                fetchCoupons();
            } else {
                showStatus('Failed to delete coupon', false);
            }
        } catch {
            showStatus('Failed to delete coupon', false);
        }
    };

    const fetchOrders = (silent = false) => {
        if (!silent) setOrdersLoading(true);
        fetch(`${API_URL}/api/orders/all`)
            .then(res => res.json())
            .then(data => { setOrders(Array.isArray(data) ? data : []); if (!silent) setOrdersLoading(false); })
            .catch(() => { if (!silent) setOrdersLoading(false); });
    };

    const updateStatus = async (id, status, extra = {}) => {
        try {
            const res = await fetch(`${API_URL}/api/orders/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status, ...extra })
            });
            if (res.ok) fetchOrders();
        } catch { }
    };

    const fetchItems = () => {
        fetch(`${API_URL}/api/items`)
            .then(res => res.json())
            .then(data => setItems(data))
            .catch(() => showStatus('Failed to load items', false));
    };

    const showStatus = (msg, ok = true) => {
        setStatus({ msg, ok });
        setTimeout(() => setStatus({ msg: '', ok: true }), 3000);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setImage(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('description', description);
            formData.append('price', price);
            formData.append('ingredients', ingredients);
            formData.append('type', type);
            formData.append('isChefSpecial', isChefSpecial);
            formData.append('prepTime', prepTime);
            formData.append('deliveryTime', deliveryTime);
            if (image) formData.append('image', image);

            const url = editingId ? `${API_URL}/api/items/${editingId}` : `${API_URL}/api/items`;
            const method = editingId ? 'PUT' : 'POST';

            const response = await fetch(url, { method, body: formData });
            if (response.ok) {
                showStatus(editingId ? 'Item updated!' : 'Item added!', true);
                resetForm();
                fetchItems();
            } else {
                const err = await response.json().catch(() => ({}));
                showStatus(err.error || 'Failed to save item', false);
            }
        } catch {
            showStatus('Failed to save item', false);
        }
        setLoading(false);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this item?')) return;
        try {
            const response = await fetch(`${API_URL}/api/items/${id}`, { method: 'DELETE' });
            if (response.ok) { showStatus('Item deleted!', true); fetchItems(); }
            else showStatus('Failed to delete item', false);
        } catch {
            showStatus('Failed to delete item', false);
        }
    };

    const handleEdit = (item) => {
        setEditingId(item._id);
        setName(item.name);
        setDescription(item.description);
        setPrice(item.price);
        setIngredients(item.ingredients || '');
        setType(item.type || 'veg');
        setIsChefSpecial(item.isChefSpecial || false);
        setPrepTime(item.prepTime || 15);
        setDeliveryTime(item.deliveryTime || 30);
        setImage(null);
        setImagePreview(null);
        setEditingImage(item.image || '');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetForm = () => {
        setEditingId(null);
        setName(''); setDescription(''); setPrice(''); setIngredients('');
        setType('veg'); setIsChefSpecial(false);
        setPrepTime(15); setDeliveryTime(30);
        setImage(null); setImagePreview(null); setEditingImage('');
        const input = document.getElementById('imageInput');
        if (input) input.value = '';
    };

    const currentPreview = imagePreview || (editingImage || null);
    const vegCount = items.filter(i => i.type === 'veg').length;
    const nonVegCount = items.filter(i => i.type === 'non-veg').length;
    const specialCount = items.filter(i => i.isChefSpecial).length;

    return (
        <div className="min-h-[85vh] relative z-10 px-0 sm:px-2">
            
            {/* Professional Admin Header */}
            <div className="bg-[#0B0F19] text-white rounded-[2.5rem] p-8 sm:p-10 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.7)] relative overflow-hidden my-6 border border-gray-800/60">
                {/* Premium Abstract Glows */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-red-600/15 to-orange-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3 pointer-events-none"></div>
                
                <div className="max-w-7xl mx-auto relative z-10 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-10">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-[1.25rem] bg-gradient-to-br from-red-600 to-orange-500 flex items-center justify-center shadow-lg shadow-red-600/30 border border-red-400/30">
                            <FaUtensils className="text-white text-2xl sm:text-3xl drop-shadow-md" />
                        </div>
                        <div>
                            <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-2 text-white flex items-center gap-3">
                                Admin <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">Portal</span>
                            </h1>
                            <div className="flex items-center gap-3 text-sm">
                                <span className="flex items-center gap-2 bg-green-500/10 text-green-400 font-bold px-3 py-1 rounded-full border border-green-500/20">
                                    <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)] animate-pulse"></span>
                                    System Online
                                </span>
                                <span className="text-gray-400 font-medium">Owen Express Live Management</span>
                            </div>
                        </div>
                    </div>
                    
                    {/* Modern Stats Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full xl:w-auto">
                        <div className="bg-gray-800/40 backdrop-blur-xl rounded-2xl p-5 border border-gray-700/50 shadow-inner group hover:bg-gray-800/60 transition-all">
                            <div className="text-gray-400 text-xs font-black uppercase tracking-widest mb-1 group-hover:text-gray-300 transition-colors">Total Items</div>
                            <div className="text-4xl font-black text-white">{items.length}</div>
                        </div>
                        <div className="bg-gray-800/40 backdrop-blur-xl rounded-2xl p-5 border border-gray-700/50 shadow-inner group hover:bg-gray-800/60 transition-all">
                            <div className="text-gray-400 text-xs font-black uppercase tracking-widest mb-1 group-hover:text-green-400/70 transition-colors">Veg Menu</div>
                            <div className="text-4xl font-black text-green-400">{vegCount}</div>
                        </div>
                        <div className="bg-gray-800/40 backdrop-blur-xl rounded-2xl p-5 border border-gray-700/50 shadow-inner group hover:bg-gray-800/60 transition-all">
                            <div className="text-gray-400 text-xs font-black uppercase tracking-widest mb-1 group-hover:text-red-400/70 transition-colors">Non-Veg</div>
                            <div className="text-4xl font-black text-red-500">{nonVegCount}</div>
                        </div>
                        <div className="bg-gray-800/40 backdrop-blur-xl rounded-2xl p-5 border border-gray-700/50 shadow-inner group hover:bg-gray-800/60 transition-all">
                            <div className="text-gray-400 text-xs font-black uppercase tracking-widest mb-1 group-hover:text-orange-400/70 transition-colors">Specials</div>
                            <div className="text-4xl font-black text-orange-400">{specialCount}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="max-w-7xl mx-auto mb-8 relative z-20">
                <div className="flex gap-3 bg-white/70 backdrop-blur-xl rounded-2xl p-2.5 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 w-fit mx-auto sm:mx-0">
                    <button onClick={() => setActiveTab('menu')}
                        className={`flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-black tracking-wide transition-all duration-300 ${activeTab === 'menu' ? 'bg-[#0B0F19] text-white shadow-md shadow-gray-900/20' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}>
                        <FaUtensils size={14} className={activeTab === 'menu' ? 'text-red-500' : ''} /> Menu Items
                    </button>
                    <button onClick={() => { setActiveTab('orders'); fetchOrders(); }}
                        className={`flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-black tracking-wide transition-all duration-300 ${activeTab === 'orders' ? 'bg-[#0B0F19] text-white shadow-md shadow-gray-900/20' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}>
                        <FaShoppingBag size={14} className={activeTab === 'orders' ? 'text-orange-500' : ''} /> Orders
                        {orders.filter(o => o.status === 'pending').length > 0 && (
                            <span className={`text-[11px] rounded-full px-2 py-0.5 flex items-center justify-center border font-black shadow-sm transition-all ml-1 ${activeTab === 'orders' ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-red-500 text-white border-red-600'}`}>
                                {orders.filter(o => o.status === 'pending').length} New
                            </span>
                        )}
                    </button>
                    <button onClick={() => { setActiveTab('coupons'); fetchCoupons(); }}
                        className={`flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-black tracking-wide transition-all duration-300 ${activeTab === 'coupons' ? 'bg-[#0B0F19] text-white shadow-md shadow-gray-900/20' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}>
                        <FaTag size={14} className={activeTab === 'coupons' ? 'text-yellow-500' : ''} /> Coupons
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto pb-12 flex flex-col lg:flex-row gap-8 items-start relative z-20">
                {activeTab === 'menu' && (<>
                {/* Form Panel */}
                <div className="w-full lg:w-96 lg:flex-shrink-0 lg:sticky lg:top-32">
                    <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] border border-white overflow-hidden transition-all">
                        <div className={`px-8 py-6 flex items-center justify-between border-b border-gray-100 ${editingId ? 'bg-blue-50/50' : 'bg-transparent'}`}>
                            <h2 className="text-xl font-black text-gray-900 flex items-center gap-3">
                                {editingId ? <><span className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shadow-sm"><FaEdit size={14} /></span> Edit Item</> : <><span className="w-8 h-8 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shadow-sm"><FaPlus size={14} /></span> Add New Item</>}
                            </h2>
                            {editingId && (
                                <button onClick={resetForm} className="w-8 h-8 rounded-xl bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-red-100 hover:text-red-500 transition-all">
                                    <FaTimes size={14} />
                                </button>
                            )}
                        </div>

                        <div className="p-6">
                            {status.msg && (
                                <div className={`mb-4 px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 ${status.ok ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                                    <span>{status.ok ? '✓' : '✕'}</span> {status.msg}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                                <input type="text" placeholder="Item Name" value={name} onChange={(e) => setName(e.target.value)} required
                                    className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl text-sm focus:border-orange-400 focus:outline-none bg-gray-50 focus:bg-white transition-all" />

                                <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} required rows={3}
                                    className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl text-sm resize-none focus:border-orange-400 focus:outline-none bg-gray-50 focus:bg-white transition-all" />

                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-sm">₹</span>
                                    <input type="number" placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} required min="0" step="0.01"
                                        className="w-full pl-8 pr-4 py-3 border-2 border-gray-100 rounded-xl text-sm focus:border-orange-400 focus:outline-none bg-gray-50 focus:bg-white transition-all" />
                                </div>

                                <textarea placeholder="Ingredients (e.g., Rice, Chicken, Spices)" value={ingredients} onChange={(e) => setIngredients(e.target.value)} required rows={2}
                                    className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl text-sm resize-none focus:border-orange-400 focus:outline-none bg-gray-50 focus:bg-white transition-all" />

                                {/* Type Toggle */}
                                <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl">
                                    <button type="button" onClick={() => setType('veg')}
                                        className={`py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-1.5 transition-all ${type === 'veg' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500 hover:text-green-600'}`}>
                                        <FaLeaf size={11} /> Veg
                                    </button>
                                    <button type="button" onClick={() => setType('non-veg')}
                                        className={`py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-1.5 transition-all ${type === 'non-veg' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-red-600'}`}>
                                        <FaDrumstickBite size={11} /> Non-Veg
                                    </button>
                                </div>

                                {/* Chef Special */}
                                <label className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer border-2 transition-all ${isChefSpecial ? 'bg-orange-50 border-orange-300' : 'bg-gray-50 border-gray-100 hover:border-orange-200'}`}>
                                    <input type="checkbox" checked={isChefSpecial} onChange={(e) => setIsChefSpecial(e.target.checked)} className="w-4 h-4 accent-orange-500 cursor-pointer" />
                                    <span className={`text-sm font-semibold flex items-center gap-2 ${isChefSpecial ? 'text-orange-600' : 'text-gray-500'}`}>
                                        <FaStar size={13} /> Chef's Special
                                    </span>
                                </label>

                                {/* Prep & Delivery Time */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 mb-1 block">Prep Time (mins)</label>
                                        <input type="number" min="1" max="120" value={prepTime} onChange={e => setPrepTime(e.target.value)}
                                            className="w-full px-3 py-2.5 border-2 border-gray-100 rounded-xl text-sm focus:border-orange-400 focus:outline-none bg-gray-50 focus:bg-white transition-all" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 mb-1 block">Delivery Time (mins)</label>
                                        <input type="number" min="1" max="120" value={deliveryTime} onChange={e => setDeliveryTime(e.target.value)}
                                            className="w-full px-3 py-2.5 border-2 border-gray-100 rounded-xl text-sm focus:border-orange-400 focus:outline-none bg-gray-50 focus:bg-white transition-all" />
                                    </div>
                                </div>

                                {/* Image Upload */}
                                <div className={`border-2 border-dashed rounded-xl overflow-hidden transition-colors ${currentPreview ? 'border-orange-300' : 'border-gray-200 hover:border-orange-300'}`}>
                                    {currentPreview ? (
                                        <div className="relative">
                                            <img src={currentPreview} alt="Preview" className="w-full h-40 object-cover" />
                                            <label htmlFor="imageInput" className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-all flex items-center justify-center cursor-pointer group">
                                                <span className="opacity-0 group-hover:opacity-100 bg-white text-gray-800 text-xs font-semibold px-3 py-1.5 rounded-lg transition-opacity">
                                                    Change Image
                                                </span>
                                            </label>
                                            {editingId && !imagePreview && (
                                                <span className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-md font-medium">Current</span>
                                            )}
                                        </div>
                                    ) : (
                                        <label htmlFor="imageInput" className="flex flex-col items-center justify-center h-28 cursor-pointer text-gray-300 hover:text-orange-400 transition-colors">
                                            <FaImage size={28} className="mb-1.5" />
                                            <span className="text-xs font-medium">Click to upload image</span>
                                        </label>
                                    )}
                                    <input type="file" id="imageInput" accept="image/*" onChange={handleImageChange} required={!editingId} className="hidden" />
                                </div>

                                <button type="submit" disabled={loading}
                                    className={`w-full py-3 rounded-xl text-white font-bold text-sm transition-all ${loading ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-lg hover:-translate-y-0.5'} ${editingId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gradient-to-r from-orange-500 to-red-500'}`}>
                                    {loading ? 'Saving...' : editingId ? 'Update Item' : 'Add Item'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Items Grid */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3 tracking-tight">
                            <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-orange-500 text-white flex items-center justify-center shadow-lg"><FaUtensils size={18} /></span> 
                            Menu Items
                            <span className="text-sm font-bold text-gray-400 bg-white shadow-sm border border-gray-100 px-3 py-1 rounded-lg ml-2">{items.length}</span>
                        </h2>
                    </div>

                    {items.length === 0 ? (
                        <div className="text-center py-20 bg-white/50 backdrop-blur-md rounded-[2rem] border border-white/50 shadow-sm relative overflow-hidden">
                            <FaUtensils size={56} className="mx-auto mb-6 text-gray-300 drop-shadow-sm" />
                            <p className="text-xl font-black text-gray-500 tracking-tight mb-2">No items yet</p>
                            <p className="text-gray-400 font-medium">Add your first menu item using the form</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                            {items.map(item => (
                                <div key={item._id} className={`bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1 border-2 ${editingId === item._id ? 'border-blue-400' : 'border-transparent'}`}>
                                    <div className="relative">
                                        {item.image ? (
                                            <img src={item.image} alt={item.name} className="w-full h-44 object-cover"
                                                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                                        ) : null}
                                        <div className={`w-full h-44 bg-gradient-to-br from-orange-50 to-red-50 items-center justify-center flex-col text-gray-300 ${item.image ? 'hidden' : 'flex'}`}>
                                            <FaImage size={36} className="mb-2" />
                                            <span className="text-xs">No Image</span>
                                        </div>

                                        {/* Badges */}
                                        <div className="absolute top-2 left-2 flex gap-1.5">
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${item.type === 'veg' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                                                {item.type === 'veg' ? <FaLeaf size={9} /> : <FaDrumstickBite size={9} />}
                                                {item.type === 'veg' ? 'Veg' : 'Non-Veg'}
                                            </span>
                                        </div>
                                        {item.isChefSpecial && (
                                            <div className="absolute top-2 right-2 bg-orange-500 text-white p-1.5 rounded-full shadow-md">
                                                <FaStar size={12} />
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-4">
                                        <div className="flex items-start justify-between gap-2 mb-1">
                                            <h3 className="font-bold text-gray-800 text-base leading-tight">{item.name}</h3>
                                            <span className="text-orange-500 font-bold text-lg whitespace-nowrap">₹{item.price}</span>
                                        </div>
                                        <p className="text-gray-500 text-xs line-clamp-2 mb-4">{item.description}</p>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleEdit(item)}
                                                className="flex-1 py-2 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-1.5 border border-blue-100 hover:border-blue-600">
                                                <FaEdit size={11} /> Edit
                                            </button>
                                            <button onClick={() => handleDelete(item._id)}
                                                className="flex-1 py-2 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-1.5 border border-red-100 hover:border-red-600">
                                                <FaTrash size={11} /> Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </>)}
                {activeTab === 'orders' && (
                /* Orders Tab */
                <div className="w-full">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                        <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3 tracking-tight">
                            <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-orange-500 text-white flex items-center justify-center shadow-lg"><FaShoppingBag size={18} /></span> 
                            Incoming Orders
                        </h2>
                        <button onClick={fetchOrders} className="px-5 py-2.5 bg-white border border-white/50 shadow-[0_4px_15px_rgb(0,0,0,0.04)] rounded-xl text-sm text-gray-600 font-bold hover:text-red-600 hover:border-red-200 hover:shadow-md transition-all flex items-center gap-2">↻ Refresh List</button>
                    </div>
                    {ordersLoading ? (
                        <div className="text-center py-32 bg-white/50 backdrop-blur-md rounded-[2rem] border border-white/50 shadow-sm">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-red-200 border-t-red-600 shadow-sm"></div>
                            <p className="mt-4 font-bold text-gray-500 tracking-wide">Fetching incoming orders...</p>
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="text-center py-32 bg-white/50 backdrop-blur-md rounded-[2rem] border border-white/50 shadow-sm relative overflow-hidden">
                            <FaShoppingBag size={56} className="mx-auto mb-6 text-gray-300 drop-shadow-sm" />
                            <p className="text-xl font-black text-gray-500 tracking-tight mb-2">No orders yet</p>
                            <p className="text-gray-400 font-medium">Waiting for hungry customers to place an order</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {orders.map(order => (
                                <div key={order._id} className={`bg-white rounded-2xl p-5 shadow-md border-2 transition-all ${
                                    order.status === 'pending' ? 'border-yellow-300' :
                                    order.status === 'accepted' || order.status === 'preparing' || order.status === 'out_for_delivery' ? 'border-green-300' :
                                    order.status === 'rejected' ? 'border-red-300' : 'border-gray-100'
                                }`}>
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-bold text-gray-800">{order.name}</h3>
                                                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                                                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                    order.status === 'accepted' ? 'bg-blue-100 text-blue-700' :
                                                    order.status === 'preparing' ? 'bg-orange-100 text-orange-700' :
                                                    order.status === 'out_for_delivery' ? 'bg-purple-100 text-purple-700' :
                                                    order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                                                    'bg-red-100 text-red-700'
                                                }`}>{order.status.replace('_', ' ').toUpperCase()}</span>
                                            </div>
                                            <p className="text-xs text-gray-400">{order.email} • {order.phone}</p>
                                            <p className="text-xs text-gray-400">{order.address}</p>
                                        </div>
                                        <div className="text-right">
                                            {order.discountAmount > 0 ? (
                                                <div className="mb-1">
                                                    <p className="text-[11px] font-bold text-gray-400 line-through">Subtotal: ₹{order.subtotal || (order.total + order.discountAmount)}</p>
                                                    <p className="text-[10px] font-black text-green-600">Discount: -₹{order.discountAmount} ({order.couponApplied})</p>
                                                </div>
                                            ) : null}
                                            <p className="text-xl font-black text-red-600">₹{order.total}</p>
                                            <p className="text-xs text-gray-400 uppercase">{order.paymentMethod}</p>
                                            <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
                                        </div>
                                    </div>

                                    {/* Items */}
                                    <div className="bg-gray-50 rounded-xl p-3 mb-4">
                                        {order.cart?.map((item, i) => (
                                            <div key={i} className="flex justify-between text-sm py-1">
                                                <span className="text-gray-600">{item.name} {item.quantity > 1 && `x${item.quantity}`}</span>
                                                <span className="font-semibold">₹{item.price * (item.quantity || 1)}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Action Buttons */}
                                    {order.status === 'pending' && (
                                        acceptingOrder === order._id ? (
                                            <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex flex-col gap-3">
                                                <p className="text-xs font-bold text-green-700 uppercase tracking-wider">Set Timings</p>
                                                <div className="flex gap-3">
                                                    <div className="flex-1">
                                                        <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Prep (mins)</label>
                                                        <input type="number" value={accPrepTime} onChange={e => setAccPrepTime(e.target.value)} className="w-full border border-green-200 rounded-lg p-2 text-sm font-bold bg-white outline-none" min="1" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Delivery (mins)</label>
                                                        <input type="number" value={accDeliveryTime} onChange={e => setAccDeliveryTime(e.target.value)} className="w-full border border-green-200 rounded-lg p-2 text-sm font-bold bg-white outline-none" min="1" />
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 mt-1">
                                                    <button onClick={() => { updateStatus(order._id, 'accepted', { prepTime: accPrepTime, deliveryTime: accDeliveryTime }); setAcceptingOrder(null); }} className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold text-xs py-2 rounded-lg transition-colors shadow-sm">Confirm</button>
                                                    <button onClick={() => setAcceptingOrder(null)} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold text-xs py-2 rounded-lg transition-colors">Cancel</button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex gap-3">
                                                <button onClick={() => { setAccPrepTime(20); setAccDeliveryTime(30); setAcceptingOrder(order._id); }}
                                                    className="flex-1 py-2.5 bg-green-500 text-white rounded-xl font-bold text-sm hover:bg-green-600 transition-all flex items-center justify-center gap-2">
                                                    <FaCheck size={12} /> Accept Order
                                                </button>
                                                <button onClick={() => updateStatus(order._id, 'rejected')}
                                                    className="flex-1 py-2.5 bg-red-500 text-white rounded-xl font-bold text-sm hover:bg-red-600 transition-all flex items-center justify-center gap-2">
                                                    <FaBan size={12} /> Reject Order
                                                </button>
                                            </div>
                                        )
                                    )}
                                    {order.status === 'accepted' && (
                                        <button onClick={() => updateStatus(order._id, 'preparing')}
                                            className="w-full py-2.5 bg-orange-500 text-white rounded-xl font-bold text-sm hover:bg-orange-600 transition-all flex items-center justify-center gap-2">
                                            <FaUtensils size={12} /> Start Preparing
                                        </button>
                                    )}
                                    {order.status === 'preparing' && (
                                        <button onClick={() => updateStatus(order._id, 'out_for_delivery')}
                                            className="w-full py-2.5 bg-purple-500 text-white rounded-xl font-bold text-sm hover:bg-purple-600 transition-all flex items-center justify-center gap-2">
                                            <FaMotorcycle size={14} /> Mark Out for Delivery
                                        </button>
                                    )}
                                    {order.status === 'out_for_delivery' && (
                                        <button onClick={() => updateStatus(order._id, 'delivered')}
                                            className="w-full py-2.5 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 transition-all flex items-center justify-center gap-2">
                                            <FaCheck size={12} /> Mark Delivered
                                        </button>
                                    )}
                                    {(order.status === 'delivered' || order.status === 'rejected') && (
                                        <div className={`text-center py-2 rounded-xl text-sm font-bold ${
                                            order.status === 'delivered' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                                        }`}>
                                            {order.status === 'delivered' ? '✓ Order Delivered' : '✕ Order Rejected'}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'coupons' && (
                <>
                    {/* Coupons Form */}
                    <div className="w-full lg:w-96 lg:flex-shrink-0 lg:sticky lg:top-32">
                        <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] border border-white overflow-hidden transition-all">
                            <div className="px-8 py-6 border-b border-gray-100 bg-transparent">
                                <h2 className="text-xl font-black text-gray-900 flex items-center gap-3">
                                    <span className="w-8 h-8 rounded-xl bg-yellow-100 text-yellow-600 flex items-center justify-center shadow-sm"><FaTag size={14} /></span> Add Coupon
                                </h2>
                            </div>
                            <div className="p-6">
                                {status.msg && (
                                    <div className={`mb-4 px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 ${status.ok ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                                        <span>{status.ok ? '✓' : '✕'}</span> {status.msg}
                                    </div>
                                )}
                                <form onSubmit={handleCouponSubmit} className="flex flex-col gap-4">
                                    <input type="text" placeholder="Coupon Code (e.g. OWEN50)" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} required
                                        className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl text-sm focus:border-orange-400 focus:outline-none bg-gray-50 focus:bg-white transition-all uppercase font-black tracking-wider" />
                                    
                                    <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl">
                                        <button type="button" onClick={() => setCouponDiscountType('percentage')}
                                            className={`py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-1.5 transition-all ${couponDiscountType === 'percentage' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-orange-500'}`}>
                                            Percent (%)
                                        </button>
                                        <button type="button" onClick={() => setCouponDiscountType('flat')}
                                            className={`py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-1.5 transition-all ${couponDiscountType === 'flat' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-orange-500'}`}>
                                            Flat (₹)
                                        </button>
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-gray-500 mb-1 block">Discount Value</label>
                                        <input type="number" placeholder={couponDiscountType === 'percentage' ? 'e.g. 10 for 10% off' : 'e.g. 50 for ₹50 off'} value={couponDiscountValue} onChange={(e) => setCouponDiscountValue(e.target.value)} required min="1"
                                            className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl text-sm focus:border-orange-400 focus:outline-none bg-gray-50 focus:bg-white transition-all font-bold" />
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-gray-500 mb-1 block">Min Order Amount (₹)</label>
                                        <input type="number" placeholder="e.g. 150 (0 for no minimum)" value={couponMinOrder} onChange={(e) => setCouponMinOrder(e.target.value)} min="0"
                                            className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl text-sm focus:border-orange-400 focus:outline-none bg-gray-50 focus:bg-white transition-all font-bold" />
                                    </div>

                                    <button type="submit" disabled={loading}
                                        className={`w-full py-3 rounded-xl text-white font-bold text-sm bg-gradient-to-r from-orange-500 to-red-500 hover:shadow-lg hover:-translate-y-0.5 transition-all ${loading ? 'opacity-65 cursor-not-allowed' : ''}`}>
                                        {loading ? 'Creating...' : 'Create Coupon'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>

                    {/* Coupons List Grid */}
                    <div className="flex-1 min-w-0 w-full">
                        <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3 tracking-tight mb-8">
                            <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-orange-500 text-white flex items-center justify-center shadow-lg"><FaTag size={18} /></span> 
                            Active Coupons
                            <span className="text-sm font-bold text-gray-400 bg-white shadow-sm border border-gray-100 px-3 py-1 rounded-lg ml-2">{coupons.length}</span>
                        </h2>

                        {couponsLoading ? (
                            <div className="text-center py-20 bg-white/50 backdrop-blur-md rounded-[2rem] border border-white/50 shadow-sm">
                                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-red-200 border-t-red-600 shadow-sm"></div>
                                <p className="mt-4 font-bold text-gray-500">Fetching coupons...</p>
                            </div>
                        ) : coupons.length === 0 ? (
                            <div className="text-center py-20 bg-white/50 backdrop-blur-md rounded-[2rem] border border-white/50 shadow-sm relative overflow-hidden">
                                <FaTag size={56} className="mx-auto mb-6 text-gray-300 drop-shadow-sm" />
                                <p className="text-xl font-black text-gray-500 tracking-tight mb-2">No coupons yet</p>
                                <p className="text-gray-400 font-medium">Create your first promo code using the form</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {coupons.map(coupon => (
                                    <div key={coupon._id} className="bg-white rounded-2xl shadow-md p-6 border-2 border-transparent hover:border-yellow-200 transition-all flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="font-black text-lg text-gray-900 bg-gray-100 px-3 py-1 rounded-lg tracking-wider border border-gray-200/50 uppercase">{coupon.code}</span>
                                                <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold bg-green-500/10 text-green-600 border border-green-500/20`}>
                                                    Active
                                                </span>
                                            </div>
                                            <div className="space-y-1.5 mb-5 text-sm font-semibold text-gray-600">
                                                <p>Discount: <span className="font-black text-gray-900">{coupon.discountType === 'percentage' ? `${coupon.discountValue}% Off` : `₹${coupon.discountValue} Off`}</span></p>
                                                <p>Min Order: <span className="font-black text-gray-900">₹{coupon.minOrderAmount}</span></p>
                                            </div>
                                        </div>
                                        <button onClick={() => handleCouponDelete(coupon._id)}
                                            className="w-full py-2 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-1.5 border border-red-100">
                                            <FaTrash size={11} /> Delete Coupon
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}
            </div>
        </div>
    );
};

export default Admin;
