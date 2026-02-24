import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaStar } from 'react-icons/fa';

const btnStyle = "bg-white text-red-600 px-8 py-4 rounded-full font-semibold hover:bg-gray-100 hover:scale-105 shadow-lg";

const Showcase = ({ isLoggedIn }) => {
    const [featuredItems, setFeaturedItems] = useState([]);
    const [flipped, setFlipped] = useState({});
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        setLoading(true);
        fetch('http://localhost:5000/api/items')
            .then(res => res.json())
            .then(data => {
                const chefSpecials = data.filter(item => item.isChefSpecial);
                setFeaturedItems(chefSpecials.length > 0 ? chefSpecials.slice(0, 3) : data.slice(0, 3));
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const toggleFlip = (id) => {
        setFlipped(prev => ({ ...prev, [id]: !prev[id] }));
    };

    return (
        <div>
            <section className="relative bg-gradient-to-r from-orange-500 to-red-600 text-white py-24 px-8 text-center rounded-2xl mb-12 shadow-xl overflow-hidden">
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/images/backimg.jpg')" }}></div>
                <div className="absolute inset-0 bg-black opacity-50"></div>
                <div className="relative z-10">
                    <h1 className="text-5xl md:text-6xl font-extrabold mb-4 drop-shadow-lg">Authentic Indian Cuisine</h1>
                    <p className="text-2xl  mb-8 opacity-95 font-bold">Experience the rich flavors of traditional Indian cooking</p>
                    <button className={btnStyle} onClick={() => navigate(isLoggedIn ? '/menu' : '/login')}>
                        {isLoggedIn ? 'Explore Full Menu' : 'Login to Explore Menu'}
                    </button>
                </div>
            </section>

            <section>
                <div className="text-center mb-10">
                    <h2 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-3">Chef's Specials</h2>
                    <p className="text-gray-500 text-lg">Our most popular Indian dishes, crafted with love</p>
                </div>
                {loading ? (
                    <div className="text-center py-20">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
                        <p className="mt-4 text-gray-600">Loading delicious items...</p>
                    </div>
                ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-5">
                    {featuredItems.map(item => (
                        <div key={item._id} className="relative h-[420px]" style={{ perspective: '1000px' }}>
                            <div 
                                className="relative w-full h-full transition-transform duration-500"
                                style={{ 
                                    transformStyle: 'preserve-3d',
                                    transform: flipped[item._id] ? 'rotateY(180deg)' : 'rotateY(0deg)'
                                }}
                            >
                                {/* Front */}
                                <div 
                                    className="absolute w-full h-full bg-white rounded-xl overflow-hidden shadow-lg hover:-translate-y-1 transition-transform cursor-pointer border-0"
                                    style={{ backfaceVisibility: 'hidden' }}
                                    onClick={() => toggleFlip(item._id)}
                                >
                                    <div className="w-full h-52 bg-cover bg-center" style={{ backgroundImage: `url(/images/${item.image})` }} />
                                    <div className="p-5">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="text-xl font-semibold">{item.name}</h3>
                                            <div className="flex items-center gap-2">
                                                {item.isChefSpecial && <FaStar className="text-orange-500" />}
                                                <span className={`w-5 h-5 border-2 flex items-center justify-center ${item.type === 'veg' ? 'border-green-600' : 'border-red-600'}`}>
                                                    <span className={`w-2.5 h-2.5 rounded-full ${item.type === 'veg' ? 'bg-green-600' : 'bg-red-600'}`}></span>
                                                </span>
                                            </div>
                                        </div>
                                        <p className="text-gray-600 mb-3">{item.description}</p>
                                        <span className="text-xl font-bold text-orange-500">Price:₹{item.price}</span>
                                    </div>
                                    <hr className="border-gray-300 w-full" />
                                    <div className="px-5 pb-5 pt-3">
                                        <p className="text-md text-black text-center">Click to see ingredients</p>
                                    </div>
                                </div>

                                {/* Back */}
                                <div 
                                    className="absolute w-full h-full bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg cursor-pointer p-6 flex flex-col justify-center"
                                    style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                                    onClick={() => toggleFlip(item._id)}
                                >
                                    <h3 className="text-2xl font-bold text-white mb-4 text-center">Ingredients</h3>
                                    <div className="bg-white/90 rounded-lg p-4 flex-1 overflow-auto">
                                        <p className="text-gray-800 leading-relaxed">{item.ingredients || 'Ingredients information not available'}</p>
                                    </div>
                                    <p className="text-md text-white mt-3 text-center">Click to flip back</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                )}
            </section>
        </div>
    );
};

export default Showcase;