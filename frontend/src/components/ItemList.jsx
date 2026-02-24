import React, { useState } from 'react';

const btnStyle = "bg-white text-red-600 border-2 border-red-600 py-2 px-4 rounded-full font-bold hover:bg-red-600 hover:text-white hover:scale-105 transition-all text-sm";

const ItemList = ({ items, addToCart }) => {
    const [flipped, setFlipped] = useState({});

    const toggleFlip = (id) => {
        setFlipped(prev => ({ ...prev, [id]: !prev[id] }));
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-5">
            {items.map(item => (
                <div key={item._id || item.id} className="relative h-[430px]" style={{ perspective: '1000px' }}>
                    <div 
                        className="relative w-full h-full transition-transform duration-500"
                        style={{ 
                            transformStyle: 'preserve-3d',
                            transform: flipped[item._id] ? 'rotateY(180deg)' : 'rotateY(0deg)'
                        }}
                    >
                        {/* Front */}
                        <div 
                            className="absolute w-full h-full bg-white rounded-xl overflow-hidden shadow-lg hover:-translate-y-1 transition-transform cursor-pointer"
                            style={{ backfaceVisibility: 'hidden' }}
                            onClick={() => toggleFlip(item._id)}
                        >
                            <div className="w-full h-52 bg-cover bg-center" style={{ backgroundImage: `url(/images/${item.image})` }} />
                            <div className="p-5">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-xl font-semibold">{item.name}</h3>
                                    <span className={`w-5 h-5 border-2 flex items-center justify-center ${item.type === 'veg' ? 'border-green-600' : 'border-red-600'}`}>
                                        <span className={`w-2.5 h-2.5 rounded-full ${item.type === 'veg' ? 'bg-green-600' : 'bg-red-600'}`}></span>
                                    </span>
                                </div>
                                <p className="text-gray-600 mb-3">{item.description}</p>
                                <div className="flex justify-between items-center">
                                    <span className="text-xl font-bold text-orange-500">Price:₹{item.price}</span>
                                    {addToCart && (
                                        <button 
                                            className={btnStyle} 
                                            onClick={(e) => { e.stopPropagation(); addToCart(item); }}
                                        >
                                            Add to Cart
                                        </button>
                                    )}
                                </div>
                            </div>
                            <hr className="border-gray-300 w-full" />
                            <div className="px-5 pb-2 pt-5">
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
    );
};

export default ItemList;