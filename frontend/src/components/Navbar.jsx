import React, { useContext, useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { WishlistContext } from '../context/WishlistContext';
import { Search, Heart, ShoppingBag, User, LogOut, Menu, X, ShieldAlert } from 'lucide-react';
import API from '../services/api';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { getCartCount } = useContext(CartContext);
  const { wishlist } = useContext(WishlistContext);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  
  const suggestionRef = useRef(null);
  const profileRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch search suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.trim().length < 2) {
        setSuggestions([]);
        return;
      }
      try {
        const response = await API.get(`/products?search=${searchQuery}`);
        setSuggestions(response.data.slice(0, 5)); // Limit to 5
      } catch (error) {
        console.error('Error fetching suggestions', error);
      }
    };
    const delayDebounce = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (id) => {
    navigate(`/products/${id}`);
    setSearchQuery('');
    setShowSuggestions(false);
  };

  return (
    <nav className="glass fixed top-0 left-0 z-50 w-full border-b border-gray-100 px-4 py-3 md:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        
        {/* Mobile Menu Icon */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
          className="p-1 md:hidden"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Logo */}
        <Link to="/" className="flex items-center">
          <span className="text-xl font-extrabold tracking-[0.2em] text-black md:text-2xl">
            MERRKY LONDON
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden space-x-8 text-sm font-semibold tracking-widest uppercase md:flex">
          <Link to="/products?category=men" className="text-gray-700 transition hover:text-black">Men</Link>
          <Link to="/products?category=women" className="text-gray-700 transition hover:text-black">Women</Link>
          <Link to="/products?category=kids" className="text-gray-700 transition hover:text-black">Kids</Link>
          <Link to="/products?category=accessories" className="text-gray-700 transition hover:text-black">Accessories</Link>
        </div>

        {/* Search Bar */}
        <div ref={suggestionRef} className="relative hidden w-80 lg:block">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search products, brands..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              className="w-full rounded-full bg-gray-50 py-1.5 pr-10 pl-4 text-xs font-medium border border-gray-200 outline-none transition focus:border-black focus:bg-white"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black">
              <Search size={16} />
            </button>
          </form>

          {/* Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 mt-2 w-full rounded-lg border border-gray-100 bg-white p-2 shadow-xl animate-fade-in">
              {suggestions.map((product) => (
                <div
                  key={product.id}
                  onClick={() => handleSuggestionClick(product.id)}
                  className="flex cursor-pointer items-center space-x-3 rounded-md p-2 hover:bg-gray-50"
                >
                  <img
                    src={product.primary_image || 'https://via.placeholder.com/40'}
                    alt={product.name}
                    className="h-10 w-10 object-cover rounded"
                  />
                  <div className="flex-1 overflow-hidden">
                    <p className="truncate text-xs font-semibold text-gray-800">{product.name}</p>
                    <p className="text-[10px] text-gray-500">
                      ₹{product.discount_price !== null ? product.discount_price : product.price}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Side Icons */}
        <div className="flex items-center space-x-4">
          
          {/* Wishlist */}
          <Link to="/wishlist" className="relative p-1 text-gray-700 hover:text-red-500 transition">
            <Heart size={20} />
            {wishlist.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                {wishlist.length}
              </span>
            )}
          </Link>

          {/* Cart */}
          <Link to="/cart" className="relative p-1 text-gray-700 hover:text-black transition">
            <ShoppingBag size={20} />
            {getCartCount() > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-black text-[9px] font-bold text-white">
                {getCartCount()}
              </span>
            )}
          </Link>

          {/* Profile Dropdown */}
          <div ref={profileRef} className="relative">
            <button 
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center p-1 text-gray-700 hover:text-black transition"
            >
              <User size={20} />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-3 w-48 rounded-lg border border-gray-100 bg-white p-2 shadow-xl animate-fade-in">
                {user ? (
                  <>
                    <div className="border-b border-gray-50 px-3 py-2">
                      <p className="text-xs font-bold truncate">{user.name}</p>
                      <p className="text-[10px] text-gray-500 truncate">{user.email}</p>
                    </div>
                    {user.role === 'admin' && (
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center space-x-2 rounded-md px-3 py-2 text-xs font-medium text-amber-600 hover:bg-amber-50"
                      >
                        <ShieldAlert size={14} />
                        <span>Admin Panel</span>
                      </Link>
                    )}
                    <Link
                      to="/account"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center space-x-2 rounded-md px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
                    >
                      <User size={14} />
                      <span>My Profile</span>
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setProfileOpen(false);
                      }}
                      className="flex w-full items-center space-x-2 rounded-md px-3 py-2 text-left text-xs font-medium text-red-600 hover:bg-red-50"
                    >
                      <LogOut size={14} />
                      <span>Logout</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setProfileOpen(false)}
                      className="block rounded-md px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setProfileOpen(false)}
                      className="block rounded-md px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                    >
                      Create Account
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 z-40 w-full border-b border-gray-100 bg-white p-4 shadow-lg md:hidden animate-fade-in">
          {/* Mobile Search */}
          <form onSubmit={handleSearchSubmit} className="relative mb-4">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full bg-gray-50 py-2 pr-10 pl-4 text-xs font-medium border border-gray-200 outline-none"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Search size={16} />
            </button>
          </form>

          <div className="flex flex-col space-y-3 text-sm font-semibold tracking-wider uppercase">
            <Link to="/products?category=men" onClick={() => setMobileMenuOpen(false)} className="text-gray-700">Men</Link>
            <Link to="/products?category=women" onClick={() => setMobileMenuOpen(false)} className="text-gray-700">Women</Link>
            <Link to="/products?category=kids" onClick={() => setMobileMenuOpen(false)} className="text-gray-700">Kids</Link>
            <Link to="/products?category=accessories" onClick={() => setMobileMenuOpen(false)} className="text-gray-700">Accessories</Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
