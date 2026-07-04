import React, { useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { WishlistContext } from '../context/WishlistContext';
import { Heart, Trash2, ArrowRight } from 'lucide-react';
import ProductCard from '../components/ProductCard';

const Wishlist = () => {
  const { wishlist, toggleWishlist } = useContext(WishlistContext);
  const navigate = useNavigate();

  if (wishlist.length === 0) {
    return (
      <div className="flex flex-col h-[70vh] items-center justify-center space-y-4 text-center px-4">
        <div className="p-4 bg-gray-50 rounded-full text-gray-400">
          <Heart size={48} />
        </div>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-400">Your wishlist is empty</h2>
        <p className="text-xs text-gray-500 max-w-xs leading-relaxed">
          Keep track of items you love by tapping the heart icon on any product card.
        </p>
        <button
          onClick={() => navigate('/products')}
          className="bg-black text-white text-xs font-bold px-8 py-3 rounded uppercase tracking-wider hover:bg-gray-800 transition"
        >
          Discover Trends
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
      
      <h1 className="text-xl font-black text-gray-900 tracking-wider uppercase mb-8">My Wishlist</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 animate-fade-in">
        {wishlist.map((product) => (
          <div key={product.id} className="relative group">
            <ProductCard product={product} />
          </div>
        ))}
      </div>

    </div>
  );
};

export default Wishlist;
