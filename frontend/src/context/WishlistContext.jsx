import React, { createContext, useState, useEffect, useContext } from 'react';
import API from '../services/api';
import { AuthContext } from './AuthContext';

export const WishlistContext = createContext();

// Helper: safely extract array from any API response shape
const extractArray = (responseData) => {
  if (Array.isArray(responseData)) return responseData;
  if (responseData && Array.isArray(responseData.data)) return responseData.data;
  return [];
};

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]); // always an array
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user) {
      fetchWishlist();
    } else {
      setWishlist([]);
    }
  }, [user]);

  const fetchWishlist = async () => {
    try {
      const response = await API.get('/wishlist');
      setWishlist(extractArray(response.data));
    } catch (error) {
      console.error('Error fetching wishlist', error);
      setWishlist([]);
    }
  };

  const toggleWishlist = async (productId) => {
    if (!user) {
      alert('Please login to use the Wishlist feature.');
      return false;
    }
    try {
      const response = await API.post('/wishlist', { product_id: productId });
      const { status } = response.data;
      if (status === 'added') {
        // Re-fetch to get full product object in wishlist
        await fetchWishlist();
      } else {
        // Optimistic remove — safe because wishlist is always an array
        setWishlist((prev) => prev.filter((item) => item.id !== productId));
      }
      return true;
    } catch (error) {
      console.error('Error toggling wishlist', error);
      return false;
    }
  };

  // Safe check — wishlist is always an array, but guard anyway
  const isInWishlist = (productId) => {
    if (!Array.isArray(wishlist)) return false;
    return wishlist.some((item) => item.id === productId);
  };

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist, fetchWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};
