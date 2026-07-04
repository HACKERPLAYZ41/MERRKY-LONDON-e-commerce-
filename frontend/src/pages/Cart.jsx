import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react';

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, getCartTotal } = useContext(CartContext);
  const navigate = useNavigate();

  const shippingLimit = 999;
  const subtotal = getCartTotal();
  const shipping = subtotal >= shippingLimit || subtotal === 0 ? 0 : 99;
  const total = subtotal + shipping;

  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col h-[70vh] items-center justify-center space-y-4 text-center px-4">
        <div className="p-4 bg-gray-50 rounded-full text-gray-400">
          <ShoppingBag size={48} />
        </div>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-400">Your shopping cart is empty</h2>
        <p className="text-xs text-gray-500 max-w-xs leading-relaxed">
          Looks like you haven't added anything to your cart yet. Explore our latest collections to find premium wear.
        </p>
        <button
          onClick={() => navigate('/products')}
          className="bg-black text-white text-xs font-bold px-8 py-3 rounded uppercase tracking-wider hover:bg-gray-800 transition"
        >
          Explore Collections
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
      
      <h1 className="text-xl font-black text-gray-900 tracking-wider uppercase mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Cart Items List (2/3 Column) */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item, idx) => {
            const activePrice = item.discount_price !== null ? parseFloat(item.discount_price) : parseFloat(item.price);
            
            return (
              <div 
                key={`${item.id}-${item.size}-${item.color}`}
                className="flex items-center space-x-4 border border-gray-100 bg-white p-4 rounded-lg shadow-sm"
              >
                {/* Product Thumbnail */}
                <img
                  src={item.primary_image || 'https://via.placeholder.com/80'}
                  alt={item.name}
                  className="h-20 w-16 object-cover rounded bg-gray-50"
                />

                {/* Details */}
                <div className="flex-1 space-y-1 min-w-0">
                  <Link to={`/products/${item.id}`} className="block text-xs font-bold text-gray-800 truncate hover:underline">
                    {item.name}
                  </Link>
                  <p className="text-[10px] text-gray-400 font-semibold space-x-2">
                    {item.size && <span>SIZE: {item.size}</span>}
                    {item.color && <span>COLOR: {item.color}</span>}
                  </p>
                  
                  {/* Quantity Actions */}
                  <div className="flex items-center space-x-2 pt-1">
                    <button
                      onClick={() => updateQuantity(item.id, item.size, item.color, item.quantity - 1)}
                      className="flex h-6 w-6 items-center justify-center rounded border border-gray-200 text-xs font-bold"
                    >
                      -
                    </button>
                    <span className="text-xs font-semibold w-4 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.size, item.color, item.quantity + 1)}
                      className="flex h-6 w-6 items-center justify-center rounded border border-gray-200 text-xs font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Price and Remove Actions */}
                <div className="text-right space-y-2">
                  <p className="text-xs font-extrabold text-black">₹{activePrice * item.quantity}</p>
                  {item.quantity > 1 && (
                    <p className="text-[9px] text-gray-400">₹{activePrice} each</p>
                  )}
                  <button
                    onClick={() => removeFromCart(item.id, item.size, item.color)}
                    className="p-1 text-gray-400 hover:text-red-500 transition"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary (1/3 Column) */}
        <div className="border border-gray-100 bg-white p-6 rounded-lg shadow-sm space-y-6">
          <h3 className="text-xs font-bold text-gray-800 tracking-wider uppercase border-b border-gray-50 pb-3">
            Order Summary
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal</span>
              <span className="font-semibold text-gray-800">₹{subtotal}</span>
            </div>
            
            <div className="flex justify-between text-gray-500">
              <span>Estimated Shipping</span>
              <span className="font-semibold text-gray-800">
                {shipping === 0 ? <span className="text-green-600 font-bold uppercase text-[10px]">FREE</span> : `₹${shipping}`}
              </span>
            </div>

            {shipping > 0 && (
              <div className="bg-gray-50 border border-gray-100 p-2.5 rounded text-[10px] text-gray-500 text-center">
                Add <span className="font-bold text-black">₹{shippingLimit - subtotal}</span> more to unlock <span className="font-bold text-green-600">FREE SHIPPING</span>.
              </div>
            )}

            <div className="flex justify-between border-t border-gray-100 pt-4 text-sm font-black text-black">
              <span>Total Amount</span>
              <span>₹{total}</span>
            </div>
          </div>

          <button
            onClick={() => navigate('/checkout')}
            className="w-full inline-flex items-center justify-center space-x-2 bg-black text-white font-semibold text-xs py-3.5 tracking-widest uppercase hover:bg-neutral-900 transition duration-300 rounded shadow-md"
          >
            <span>Proceed To Checkout</span>
            <ArrowRight size={14} />
          </button>
        </div>

      </div>

    </div>
  );
};

export default Cart;
