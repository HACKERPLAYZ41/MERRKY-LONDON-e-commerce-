import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import ProductCard from '../components/ProductCard';
import { ArrowRight, ShoppingBag, Truck, RotateCcw, CreditCard } from 'lucide-react';

const Home = () => {
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=80',
      title: 'THE SUMMER ANTHOLOGY',
      subtitle: 'Premium linen fabric cuts tailored for light breeze afternoons.',
      link: '/products?category=women',
      align: 'text-left'
    },
    {
      image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=1600&q=80',
      title: 'MODERN TAILORED MENSWEAR',
      subtitle: 'Upgrade your smart-casual look with custom slim silhouettes.',
      link: '/products?category=men',
      align: 'text-center'
    },
    {
      image: 'https://images.unsplash.com/photo-1509319117193-57bab727e09d?auto=format&fit=crop&w=1600&q=80',
      title: 'FINISHING TOUCHES',
      subtitle: 'Curated accessory selections including full-grain leather and analog watches.',
      link: '/products?category=accessories',
      align: 'text-right'
    }
  ];

  useEffect(() => {
    // Autoplay slider
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const response = await API.get('/products');
        // API returns { data: [...], links: {}, meta: {} } — extract the array
        const arr = Array.isArray(response.data.data) ? response.data.data : [];
        setTrendingProducts(arr.slice(0, 4)); // Show first 4
      } catch (error) {
        console.error('Error fetching trending products', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTrending();
  }, []);

  return (
    <div className="w-full space-y-12 pb-16">
      
      {/* Hero Slide Banner */}
      <div className="relative h-[480px] w-full overflow-hidden bg-gray-900 md:h-[600px]">
        {slides.map((slide, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 h-full w-full transition-opacity duration-1000 ease-in-out ${
              idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <div className="absolute inset-0 bg-black/30" />
            <img src={slide.image} alt={slide.title} className="h-full w-full object-cover" />
            
            <div className="absolute inset-0 flex items-center px-6 md:px-16 text-white">
              <div className={`w-full max-w-xl space-y-4 md:space-y-6 ${slide.align === 'text-center' ? 'mx-auto text-center' : slide.align === 'text-right' ? 'ml-auto text-right' : 'text-left'}`}>
                <span className="text-[10px] md:text-xs font-bold tracking-[0.3em] text-white/80 uppercase">New Arrivals</span>
                <h1 className="text-3xl font-extrabold tracking-tight md:text-5xl leading-tight font-sans">
                  {slide.title}
                </h1>
                <p className="text-sm font-light text-white/90 leading-relaxed max-w-lg mx-auto">
                  {slide.subtitle}
                </p>
                <div className="pt-2">
                  <Link
                    to={slide.link}
                    className="inline-flex items-center space-x-2 bg-white text-black font-semibold text-xs px-6 py-3 tracking-widest uppercase hover:bg-black hover:text-white transition duration-300 rounded shadow-md"
                  >
                    <span>Shop Collection</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Slide Indicators */}
        <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 space-x-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 w-2 rounded-full transition-all ${idx === currentSlide ? 'bg-white w-6' : 'bg-white/50'}`}
            />
          ))}
        </div>
      </div>

      {/* Trust Highlights */}
      <div className="mx-auto max-w-7xl px-4 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex items-center space-x-4 p-4 border border-gray-100 rounded-lg bg-white">
          <div className="p-3 bg-gray-50 rounded-full text-black"><Truck size={20} /></div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-800">Free Shipping</h4>
            <p className="text-[10px] text-gray-500">On all orders above ₹999</p>
          </div>
        </div>
        <div className="flex items-center space-x-4 p-4 border border-gray-100 rounded-lg bg-white">
          <div className="p-3 bg-gray-50 rounded-full text-black"><RotateCcw size={20} /></div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-800">14 Days Returns</h4>
            <p className="text-[10px] text-gray-500">Hassle-free sizing exchanges</p>
          </div>
        </div>
        <div className="flex items-center space-x-4 p-4 border border-gray-100 rounded-lg bg-white">
          <div className="p-3 bg-gray-50 rounded-full text-black"><CreditCard size={20} /></div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-800">Secure Checkout</h4>
            <p className="text-[10px] text-gray-500">Integrated Razorpay gateway protection</p>
          </div>
        </div>
      </div>

      {/* Shop by Category */}
      <div className="mx-auto max-w-7xl px-4 space-y-6">
        <div className="flex justify-between items-end border-b border-gray-100 pb-4">
          <div>
            <span className="text-[10px] font-bold text-gray-400 tracking-[0.2em] uppercase">Collections</span>
            <h2 className="text-lg font-extrabold tracking-wider text-gray-800">SHOP BY CATEGORY</h2>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {[
            { name: 'Men', slug: 'men', img: 'https://images.unsplash.com/photo-1488161628813-04466f872be2?auto=format&fit=crop&w=600&q=80' },
            { name: 'Women', slug: 'women', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80' },
            { name: 'Kids', slug: 'kids', img: 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&w=600&q=80' },
            { name: 'Accessories', slug: 'accessories', img: 'https://images.unsplash.com/photo-1524498250077-390f9e378fc0?auto=format&fit=crop&w=600&q=80' }
          ].map((cat, idx) => (
            <Link
              key={idx}
              to={`/products?category=${cat.slug}`}
              className="group relative overflow-hidden aspect-[4/5] rounded-lg bg-gray-900 shadow-sm"
            >
              <img
                src={cat.img}
                alt={cat.name}
                className="h-full w-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-105 group-hover:opacity-75"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-4 left-4 text-white">
                <h3 className="text-sm font-bold tracking-widest uppercase">{cat.name}</h3>
                <span className="text-[10px] font-medium text-gray-300 tracking-wider inline-flex items-center space-x-1">
                  <span>Explore</span>
                  <ArrowRight size={10} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Trending / Featured Items */}
      <div className="mx-auto max-w-7xl px-4 space-y-6">
        <div className="flex justify-between items-end border-b border-gray-100 pb-4">
          <div>
            <span className="text-[10px] font-bold text-gray-400 tracking-[0.2em] uppercase">Best Sellers</span>
            <h2 className="text-lg font-extrabold tracking-wider text-gray-800">TRENDING NOW</h2>
          </div>
          <Link
            to="/products"
            className="text-xs font-bold tracking-wider uppercase text-black hover:underline inline-flex items-center space-x-1"
          >
            <span>View All</span>
            <ArrowRight size={12} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="animate-pulse flex flex-col space-y-3 aspect-[3/4] bg-gray-100 rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {trendingProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>

      {/* Promotional Bento Section */}
      <div className="mx-auto max-w-7xl px-4">
        <div className="relative rounded-2xl overflow-hidden bg-zinc-950 text-white p-8 md:p-12 flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
          <div className="space-y-3 text-center md:text-left">
            <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-zinc-400">Exclusive Event Offer</span>
            <h3 className="text-2xl font-extrabold tracking-wider">UP TO 40% OFF AUTUMN KNITS</h3>
            <p className="text-xs font-light text-zinc-400 max-w-md">
              Discover timeless, premium quality knits, shirts, and crop silhouettes crafted to look refined on every occasion.
            </p>
          </div>
          <Link
            to="/products"
            className="bg-white text-black text-xs font-bold tracking-widest px-8 py-3.5 uppercase rounded hover:bg-zinc-200 transition"
          >
            Shop Sale
          </Link>
        </div>
      </div>

    </div>
  );
};

export default Home;
