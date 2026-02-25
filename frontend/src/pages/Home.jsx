import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ItemList from '../components/ItemList';
import { API_URL } from '../config';

const Home = ({ cart, setCart }) => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [menuItems, setMenuItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [showNonVeg, setShowNonVeg] = useState(false);
    const [loading, setLoading] = useState(true);
    const searchQuery = searchParams.get('search') || '';

    useEffect(() => {
        setLoading(true);
        fetch(`${API_URL}/api/items`)
            .then(res => res.json())
            .then(data => {
                setMenuItems(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        let items = menuItems;
        
        // Filter by veg/non-veg
        if (showNonVeg) {
            items = items.filter(item => item.type === 'non-veg');
        } else {
            items = items.filter(item => item.type === 'veg');
        }
        
        // Filter by search query
        if (searchQuery) {
            items = items.filter(item => 
                item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.description.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        
        setFilteredItems(items);
    }, [searchQuery, menuItems, showNonVeg]);

    const addToCart = (item) => {
        const existingIndex = cart.findIndex(cartItem => cartItem._id === item._id);
        if (existingIndex < 0) {
            setCart([...cart, item]);
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between relative mb-10">
                <button className="px-5 py-2.5 bg-white text-red-600 rounded-xl font-medium transition-all shadow-lg" onClick={() => navigate('/')}>
                    ← Back to Home
                </button>
                <div className="text-center flex-1">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
                        {searchQuery ? `Search Results for "${searchQuery}"` : 'Our Full Menu'}
                    </h1>
                    <p className="text-gray-500 text-lg">
                        {searchQuery ? `Found ${filteredItems.length} item(s)` : 'Explore our complete selection of premium dishes'}
                    </p>
                </div>
                
                {/* Veg/Non-Veg Toggle Switch */}
                <div className="flex items-center">
                    <span className="flex items-center text-lg font-semibold mr-3">
                        <span className="w-5 h-5 border-2 border-green-600 flex items-center justify-center mr-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-green-600"></span>
                        </span>
                        <span className="text-green-600">Veg</span>
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={showNonVeg} 
                            onChange={() => setShowNonVeg(!showNonVeg)}
                            className="sr-only peer"
                        />
                        <div className="w-14 h-7 bg-green-500 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-red-600"></div>
                    </label>
                    <span className="flex items-center text-lg font-semibold ml-3">
                        <span className="w-5 h-5 border-2 border-red-600 flex items-center justify-center mr-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
                        </span>
                        <span className="text-red-600">Non-Veg</span>
                    </span>
                </div>
            </div>
            
            {loading ? (
                <div className="text-center py-20">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
                    <p className="mt-4 text-gray-600">Loading menu...</p>
                </div>
            ) : filteredItems.length === 0 ? (
                <div className="text-center py-20">
                    <p className="text-2xl text-gray-600 mb-4">No items found</p>
                    <p className="text-gray-500">Try adjusting your filters or search query</p>
                </div>
            ) : (
                <ItemList items={filteredItems} addToCart={addToCart} />
            )}
        </div>
    );
};

export default Home;