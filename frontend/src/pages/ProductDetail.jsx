import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { CartContext } from '../context/CartContext';
import { WishlistContext } from '../context/WishlistContext';
import { AuthContext } from '../context/AuthContext';
import { Star, Heart, ShoppingBag, ArrowRight, Check } from 'lucide-react';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);
  const { isInWishlist, toggleWishlist } = useContext(WishlistContext);
  const { user } = useContext(AuthContext);

  const [product, setProduct] = useState(null);
  const [activeImage, setActiveImage] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  // Review state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewSubmitLoading, setReviewSubmitLoading] = useState(false);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
      const response = await API.get(`/products/${id}`);
      // Single product returns { data: { ...product } }
      const productData = response.data.data ?? response.data;
      setProduct(productData);
      if (productData.images && productData.images.length > 0) {
        setActiveImage(productData.images[0].image_url || productData.images[0]);
      } else {
        setActiveImage(productData.primary_image || 'https://via.placeholder.com/600');
      }
      } catch (error) {
        console.error('Error fetching product details', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProductDetails();
  }, [id]);

  if (loading) {
    return <div className="flex h-[80vh] items-center justify-center">Loading product details...</div>;
  }

  if (!product) {
    return (
      <div className="flex flex-col h-[70vh] items-center justify-center space-y-4">
        <p className="text-sm font-semibold uppercase tracking-widest text-gray-400">Product Not Found</p>
        <button onClick={() => navigate('/products')} className="bg-black text-white text-xs px-6 py-2.5 rounded font-bold uppercase">
          Back to Shop
        </button>
      </div>
    );
  }

  // Parse sizes and colors — API returns arrays already
  const sizes = Array.isArray(product.sizes)
    ? product.sizes
    : (product.sizes ? product.sizes.split(',').map((s) => s.trim()) : []);
  const colors = Array.isArray(product.colors)
    ? product.colors
    : (product.colors ? product.colors.split(',').map((c) => c.trim()) : []);

  const handleAddToCart = () => {
    if (sizes.length > 0 && !selectedSize) {
      alert('Please select a size before adding to cart.');
      return;
    }
    if (colors.length > 0 && !selectedColor) {
      alert('Please select a color before adding to cart.');
      return;
    }
    addToCart(product, quantity, selectedSize, selectedColor);
    alert('Product added to shopping cart!');
  };

  const handleBuyNow = () => {
    if (sizes.length > 0 && !selectedSize) {
      alert('Please select a size.');
      return;
    }
    if (colors.length > 0 && !selectedColor) {
      alert('Please select a color.');
      return;
    }
    // Add to cart and immediately checkout
    addToCart(product, quantity, selectedSize, selectedColor);
    navigate('/checkout');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setReviewSubmitLoading(true);
    try {
      const response = await API.post('/reviews', {
        product_id: product.id,
        rating,
        comment,
      });

      // Update product rating and reviews lists locally
      const newReview = response.data.review;
      setProduct((prev) => ({
        ...prev,
        rating: response.data.new_product_rating,
        reviews: [newReview, ...prev.reviews],
      }));
      setComment('');
      setRating(5);
      alert('Thank you for your feedback reviews!');
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to submit review.');
    } finally {
      setReviewSubmitLoading(false);
    }
  };

  const activePrice = product.discount_price !== null ? parseFloat(product.discount_price) : parseFloat(product.price);
  const isDiscounted = product.discount_price !== null;
  const discountPercent = isDiscounted 
    ? Math.round(((parseFloat(product.price) - parseFloat(product.discount_price)) / parseFloat(product.price)) * 100) 
    : 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start">
        
        {/* Left Side: Images Gallery */}
        <div className="space-y-4">
          <div className="aspect-[3/4] bg-gray-100 overflow-hidden rounded-lg border border-gray-100">
            <img src={activeImage} alt={product.name} className="h-full w-full object-cover transition-all" />
          </div>

          {/* Thumbnails */}
          {product.images && product.images.length > 0 && (
            <div className="grid grid-cols-5 gap-2.5">
              {product.images.map((img) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImage(img.image_url)}
                  className={`aspect-square overflow-hidden rounded-md border ${
                    activeImage === img.image_url ? 'border-black ring-1 ring-black' : 'border-gray-200'
                  }`}
                >
                  <img src={img.image_url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Product Details */}
        <div className="space-y-6">
          
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-gray-400 tracking-[0.2em] uppercase">{product.category_name}</span>
            <h1 className="text-xl md:text-2xl font-extrabold text-gray-900 tracking-wide">{product.name}</h1>
            
            {/* Rating Stars Summary */}
            <div className="flex items-center space-x-2 pt-1">
              <div className="flex items-center text-amber-400">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star
                    key={n}
                    size={14}
                    className={n <= Math.round(product.rating || 4) ? 'fill-current' : 'text-gray-200'}
                  />
                ))}
              </div>
              <span className="text-xs font-semibold text-gray-500">
                {parseFloat(product.rating) > 0 ? parseFloat(product.rating).toFixed(1) : '4.2'} ({product.reviews?.length || 0} Reviews)
              </span>
            </div>
          </div>

          {/* Pricing */}
          <div className="flex items-baseline space-x-4 border-t border-b border-gray-100 py-3">
            <span className="text-xl font-black text-black">₹{activePrice}</span>
            {isDiscounted && (
              <>
                <span className="text-xs text-gray-400 line-through">₹{parseFloat(product.price)}</span>
                <span className="text-xs font-bold text-red-500">({discountPercent}% OFF)</span>
              </>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Product details</h4>
            <p className="text-xs text-gray-500 leading-relaxed font-light">{product.description || 'No description available for this item.'}</p>
          </div>

          {/* Sizes Selection */}
          {sizes.length > 0 && (
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Select Size</h4>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`flex h-9 min-w-9 items-center justify-center rounded border px-2 text-xs font-semibold transition ${
                      selectedSize === size
                        ? 'border-black bg-black text-white'
                        : 'border-gray-200 text-gray-600 hover:border-black'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Colors Selection */}
          {colors.length > 0 && (
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Select Color</h4>
              <div className="flex flex-wrap gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`text-xs px-3.5 py-1.5 rounded-full border transition font-medium ${
                      selectedColor === color
                        ? 'bg-black border-black text-white'
                        : 'bg-white border-gray-200 text-gray-600 hover:border-black'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          {product.stock > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Quantity</h4>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="flex h-8 w-8 items-center justify-center rounded border border-gray-200 text-xs font-semibold"
                >
                  -
                </button>
                <span className="text-xs font-bold w-4 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  className="flex h-8 w-8 items-center justify-center rounded border border-gray-200 text-xs font-semibold"
                >
                  +
                </button>
                <span className="text-[10px] text-gray-400">({product.stock} items left in stock)</span>
              </div>
            </div>
          )}

          {/* Cart Buttons */}
          <div className="flex items-center space-x-3 pt-4">
            {product.stock > 0 ? (
              <>
                <button
                  onClick={handleAddToCart}
                  className="flex-1 inline-flex items-center justify-center space-x-2 bg-zinc-900 text-white font-semibold text-xs py-3.5 tracking-widest uppercase hover:bg-zinc-800 transition duration-300 rounded shadow-md"
                >
                  <ShoppingBag size={14} />
                  <span>Add To Cart</span>
                </button>

                <button
                  onClick={handleBuyNow}
                  className="flex-1 inline-flex items-center justify-center space-x-2 bg-black text-white font-semibold text-xs py-3.5 tracking-widest uppercase hover:bg-neutral-900 transition duration-300 rounded shadow-md"
                >
                  <span>Buy Now</span>
                </button>
              </>
            ) : (
              <button disabled className="w-full bg-gray-200 text-gray-400 text-xs font-bold py-3.5 rounded uppercase cursor-not-allowed">
                Out Of Stock
              </button>
            )}

            <button
              onClick={() => toggleWishlist(product.id)}
              className={`flex h-12 w-12 items-center justify-center rounded border border-gray-200 transition ${
                isInWishlist(product.id) ? 'bg-red-50 text-red-500 border-red-200' : 'bg-white hover:bg-gray-50'
              }`}
            >
              <Heart size={20} className={isInWishlist(product.id) ? 'fill-current' : ''} />
            </button>
          </div>

        </div>
      </div>

      {/* Review Section */}
      <div className="mt-16 border-t border-gray-100 pt-12 max-w-4xl mx-auto space-y-12">
        <h2 className="text-lg font-bold tracking-wider text-gray-800 uppercase">Customer Feedback & Reviews</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          
          {/* Write a Review */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Write a Review</h3>
            {user ? (
              <form onSubmit={handleReviewSubmit} className="space-y-4 border border-gray-100 p-4 rounded-lg bg-white">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Rating</label>
                  <div className="flex space-x-1.5">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        type="button"
                        key={num}
                        onClick={() => setRating(num)}
                        className="text-amber-400 focus:outline-none"
                      >
                        <Star size={20} className={num <= rating ? 'fill-current' : 'text-gray-200'} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Your comments</label>
                  <textarea
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Tell us what you liked or disliked about this product..."
                    className="w-full rounded border border-gray-200 p-3 text-xs outline-none focus:border-black resize-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={reviewSubmitLoading}
                  className="bg-black text-white text-[10px] font-bold tracking-widest px-6 py-2.5 rounded uppercase hover:bg-gray-800 transition"
                >
                  {reviewSubmitLoading ? 'Submitting...' : 'Submit Feedback'}
                </button>
              </form>
            ) : (
              <div className="border border-gray-100 p-4 rounded-lg bg-gray-50 text-center text-xs text-gray-500">
                Please <Link to="/login" className="font-semibold text-black hover:underline">login</Link> to share your product experience feedback.
              </div>
            )}
          </div>

          {/* List Reviews */}
          <div className="space-y-6">
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Latest Reviews</h3>
            
            {product.reviews && product.reviews.length > 0 ? (
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {product.reviews.map((rev) => (
                  <div key={rev.id} className="border-b border-gray-100 pb-4 space-y-1.5">
                    <div className="flex justify-between items-center">
                      <p className="text-xs font-bold text-gray-800">{rev.user_name}</p>
                      <span className="text-[9px] text-gray-400">{new Date(rev.created_at).toLocaleDateString()}</span>
                    </div>

                    <div className="flex text-amber-400">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <Star key={num} size={10} className={num <= rev.rating ? 'fill-current' : 'text-gray-200'} />
                      ))}
                    </div>

                    <p className="text-xs text-gray-500 font-light leading-relaxed">{rev.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-gray-400">
                No reviews have been written for this product yet. Be the first to review!
              </div>
            )}
          </div>

        </div>
      </div>

    </div>
  );
};

export default ProductDetail;
