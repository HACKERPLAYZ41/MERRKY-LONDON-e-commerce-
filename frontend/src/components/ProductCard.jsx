import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star } from 'lucide-react';
import { WishlistContext } from '../context/WishlistContext';

const ProductCard = ({ product }) => {
  const { isInWishlist, toggleWishlist } = useContext(WishlistContext);

  const activePrice = product.discount_price !== null ? parseFloat(product.discount_price) : parseFloat(product.price);
  const isDiscounted = product.discount_price !== null;
  const discountPercent = isDiscounted 
    ? Math.round(((parseFloat(product.price) - parseFloat(product.discount_price)) / parseFloat(product.price)) * 100) 
    : 0;

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  return (
    <div className="group relative flex flex-col bg-white border border-gray-100 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-md">
      
      {/* Product Image Box */}
      <Link to={`/products/${product.id}`} className="relative block overflow-hidden aspect-[3/4] bg-gray-100">
        <img
          src={product.primary_image || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80'}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Discount Badge */}
        {isDiscounted && (
          <span className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded tracking-wider uppercase">
            {discountPercent}% OFF
          </span>
        )}

        {/* Out of stock overlay */}
        {product.stock <= 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="bg-white text-black text-xs font-bold px-3 py-1 uppercase tracking-wider">
              Out Of Stock
            </span>
          </div>
        )}
        
        {/* Wishlist Button */}
        <button
          onClick={handleWishlistClick}
          className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm border border-gray-50 transition-all hover:bg-red-50 text-gray-400 hover:text-red-500"
        >
          <Heart
            size={16}
            className={`transition-colors ${isInWishlist(product.id) ? 'fill-red-500 text-red-500' : ''}`}
          />
        </button>
      </Link>

      {/* Product Info */}
      <div className="flex flex-col flex-grow p-4">
        {/* Category & Rating */}
        <div className="flex justify-between items-center text-[10px] text-gray-500 font-semibold tracking-wider uppercase mb-1">
          <span>{product.category_name}</span>
          <div className="flex items-center space-x-1 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
            <Star size={10} className="fill-amber-400 text-amber-400" />
            <span className="text-gray-700">{parseFloat(product.rating) > 0 ? parseFloat(product.rating).toFixed(1) : '4.2'}</span>
          </div>
        </div>

        {/* Title */}
        <Link to={`/products/${product.id}`} className="block mb-2">
          <h3 className="text-xs font-bold text-gray-800 truncate group-hover:text-black transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Price Tag */}
        <div className="mt-auto flex items-baseline space-x-2">
          <span className="text-xs font-extrabold text-black">₹{activePrice}</span>
          {isDiscounted && (
            <>
              <span className="text-[10px] text-gray-400 line-through">₹{parseFloat(product.price)}</span>
              <span className="text-[9px] font-bold text-green-600">({discountPercent}% OFF)</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
