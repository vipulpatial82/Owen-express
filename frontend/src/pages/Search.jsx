import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';
import ItemList from '../components/ItemList';

const Search = ({ cart, setCart }) => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [menuItems, setMenuItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');

    useEffect(() => {
        fetch('http://localhost:5000/api/items')
            .then(res => res.json())
            .then(setMenuItems)
            .catch(console.error);
    }, []);

    useEffect(() => {
        if (searchQuery.trim()) {
            const filtered = menuItems.filter(item => 
                item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.description.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredItems(filtered);
        } else {
            setFilteredItems([]);
        }
    }, [searchQuery, menuItems]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            setSearchParams({ q: searchQuery });
        }
    };

    const addToCart = (item) => setCart([...cart, item]);

    return (
        <div className="min-h-[70vh]">
            <div className="text-center mb-10">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-6">
                    Search Menu
                </h1>
                
                <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
                    <div className="relative">
                        <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
                        <input
                            type="text"
                            placeholder="Search for dishes, ingredients, or cuisine..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-14 pr-6 py-4 text-lg border-2 border-gray-300 rounded-full focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition shadow-lg"
                            autoFocus
                        />
                    </div>
                </form>

                {searchQuery && (
                    <p className="text-gray-500 text-lg mb-4">
                        {filteredItems.length > 0 
                            ? `Found ${filteredItems.length} result(s) for "${searchQuery}"`
                            : `No results found for "${searchQuery}"`
                        }
                    </p>
                )}
            </div>

            {filteredItems.length > 0 ? (
                <ItemList items={filteredItems} addToCart={addToCart} />
            ) : searchQuery ? (
                <div className="text-center py-12">
                    <p className="text-gray-400 text-xl mb-4"> No dishes found</p>
                    <p className="text-gray-500">Try searching with different keywords</p>
                    <button 
                        onClick={() => navigate('/menu')}
                        className="mt-6 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-red-600 transition"
                    >
                        Browse Full Menu
                    </button>
                </div>
            ) : (
                <div className="text-center py-12">
                    <p className="text-gray-400 text-xl"> Start typing to search for your favorite dishes</p>
                </div>
            )}
        </div>
    );
};

export default Search;
