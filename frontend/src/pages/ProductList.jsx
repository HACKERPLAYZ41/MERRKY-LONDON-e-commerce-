import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import API from '../services/api';
import ProductCard from '../components/ProductCard';
import { SlidersHorizontal, ChevronDown, Check, X } from 'lucide-react';

const ProductList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('min_price') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('max_price') || '');
  const [selectedSizes, setSelectedSizes] = useState(searchParams.get('sizes') ? searchParams.get('sizes').split(',') : []);
  const [selectedColors, setSelectedColors] = useState(searchParams.get('colors') ? searchParams.get('colors').split(',') : []);
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Available Filter Options
  const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'One Size', '30', '32', '34', '36'];
  const colorOptions = ['White', 'Black', 'Navy Blue', 'Olive Green', 'Sage Green', 'Beige', 'Red', 'Tan', 'Light Blue', 'Dark Indigo'];

  // Sync state with URL params when they change (e.g. clicking Nav links)
  useEffect(() => {
    setSelectedCategory(searchParams.get('category') || '');
    setMinPrice(searchParams.get('min_price') || '');
    setMaxPrice(searchParams.get('max_price') || '');
    setSelectedSizes(searchParams.get('sizes') ? searchParams.get('sizes').split(',') : []);
    setSelectedColors(searchParams.get('colors') ? searchParams.get('colors').split(',') : []);
    setSort(searchParams.get('sort') || 'newest');
    setSearchQuery(searchParams.get('search') || '');
  }, [searchParams]);

  // Fetch Categories
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const response = await API.get('/categories');
        setCategories(Array.isArray(response.data.data) ? response.data.data : []);
      } catch (error) {
        console.error('Error fetching categories', error);
      }
    };
    fetchCats();
  }, []);

  // Fetch Products based on filters
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = {};
        if (selectedCategory) params.category = selectedCategory;
        if (minPrice) params.min_price = minPrice;
        if (maxPrice) params.max_price = maxPrice;
        if (selectedSizes.length > 0) params.sizes = selectedSizes.join(',');
        if (selectedColors.length > 0) params.colors = selectedColors.join(',');
        if (sort) params.sort = sort;
        if (searchQuery) params.search = searchQuery;

        const response = await API.get('/products', { params });
        // API returns { data: [...], links: {}, meta: {} } — extract the array
        setProducts(Array.isArray(response.data.data) ? response.data.data : []);
      } catch (error) {
        console.error('Error fetching products', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory, minPrice, maxPrice, selectedSizes, selectedColors, sort, searchQuery]);

  // Update query params helper
  const updateURLParams = (updatedFilters) => {
    const currentParams = Object.fromEntries(searchParams.entries());
    const newParams = { ...currentParams, ...updatedFilters };
    
    // Clean empty values
    Object.keys(newParams).forEach(key => {
      if (newParams[key] === '' || (Array.isArray(newParams[key]) && newParams[key].length === 0)) {
        delete newParams[key];
      }
    });

    setSearchParams(newParams);
  };

  const handleCategorySelect = (slug) => {
    const nextVal = selectedCategory === slug ? '' : slug;
    setSelectedCategory(nextVal);
    updateURLParams({ category: nextVal });
  };

  const handleSizeToggle = (size) => {
    const nextSizes = selectedSizes.includes(size)
      ? selectedSizes.filter(s => s !== size)
      : [...selectedSizes, size];
    setSelectedSizes(nextSizes);
    updateURLParams({ sizes: nextSizes.join(',') });
  };

  const handleColorToggle = (color) => {
    const nextColors = selectedColors.includes(color)
      ? selectedColors.filter(c => c !== color)
      : [...selectedColors, color];
    setSelectedColors(nextColors);
    updateURLParams({ colors: nextColors.join(',') });
  };

  const handleSortChange = (newSort) => {
    setSort(newSort);
    updateURLParams({ sort: newSort });
  };

  const handleResetFilters = () => {
    setSelectedCategory('');
    setMinPrice('');
    setMaxPrice('');
    setSelectedSizes([]);
    setSelectedColors([]);
    setSort('newest');
    setSearchParams({});
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
      
      {/* Search Header Banner */}
      {searchQuery && (
        <div className="mb-6 bg-gray-50 border border-gray-100 rounded-lg p-4">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Search Results For</p>
          <h2 className="text-xl font-bold text-black">"{searchQuery}"</h2>
        </div>
      )}

      {/* Toolbar / Actions Header */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
        <button
          onClick={() => setMobileFiltersOpen(true)}
          className="flex items-center space-x-2 rounded-md border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 md:hidden"
        >
          <SlidersHorizontal size={14} />
          <span>Filters</span>
        </button>

        <span className="hidden text-xs font-semibold text-gray-500 md:inline">
          Showing {products.length} {products.length === 1 ? 'Product' : 'Products'}
        </span>

        {/* Sort Dropdown */}
        <div className="flex items-center space-x-2">
          <span className="text-xs font-medium text-gray-400">Sort by:</span>
          <select
            value={sort}
            onChange={(e) => handleSortChange(e.target.value)}
            className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 outline-none hover:bg-gray-50 transition"
          >
            <option value="newest">Newest Arrivals</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Customer Rating</option>
          </select>
        </div>
      </div>

      <div className="flex space-x-8">
        
        {/* Desktop Sidebar Filters */}
        <aside className="hidden w-64 flex-shrink-0 space-y-6 md:block">
          
          <div className="flex justify-between items-center pb-2 border-b border-gray-100">
            <h3 className="text-xs font-bold text-gray-800 tracking-widest uppercase">FILTERS</h3>
            <button onClick={handleResetFilters} className="text-[10px] font-bold text-gray-400 hover:text-black transition">
              RESET ALL
            </button>
          </div>

          {/* Categories */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Categories</h4>
            <div className="space-y-1.5">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat.slug)}
                  className={`flex w-full items-center justify-between text-left text-xs px-2 py-1.5 rounded transition ${
                    selectedCategory === cat.slug 
                      ? 'bg-black text-white font-semibold' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span>{cat.name}</span>
                  {selectedCategory === cat.slug && <Check size={12} />}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Price Range</h4>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => {
                  setMinPrice(e.target.value);
                  updateURLParams({ min_price: e.target.value });
                }}
                className="w-full rounded border border-gray-200 px-3 py-1.5 text-xs outline-none focus:border-black"
              />
              <span className="text-gray-300 text-xs">to</span>
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => {
                  setMaxPrice(e.target.value);
                  updateURLParams({ max_price: e.target.value });
                }}
                className="w-full rounded border border-gray-200 px-3 py-1.5 text-xs outline-none focus:border-black"
              />
            </div>
          </div>

          {/* Sizes */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Sizes</h4>
            <div className="grid grid-cols-4 gap-2">
              {sizeOptions.map((size) => (
                <button
                  key={size}
                  onClick={() => handleSizeToggle(size)}
                  className={`flex h-8 items-center justify-center rounded text-xs font-semibold border transition ${
                    selectedSizes.includes(size)
                      ? 'border-black bg-black text-white'
                      : 'border-gray-200 text-gray-600 hover:border-black'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Colors */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Colors</h4>
            <div className="flex flex-wrap gap-1.5">
              {colorOptions.map((color) => (
                <button
                  key={color}
                  onClick={() => handleColorToggle(color)}
                  className={`text-[10px] font-medium px-2.5 py-1 rounded-full border transition ${
                    selectedColors.includes(color)
                      ? 'bg-black border-black text-white'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-black'
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>

        </aside>

        {/* Product Grids */}
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="animate-pulse flex flex-col space-y-3 aspect-[3/4] bg-gray-50 rounded-lg" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
              <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest">No Products Found</p>
              <p className="text-xs text-gray-500 max-w-xs leading-relaxed">
                We couldn't find matches for the selected filter combinations. Try clearing some filters.
              </p>
              <button
                onClick={handleResetFilters}
                className="bg-black text-white text-xs font-bold px-6 py-2.5 rounded hover:bg-gray-800 transition uppercase tracking-wider"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 animate-fade-in">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Mobile Drawer Slide-Over Filter Panel */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50">
          <div className="h-full w-80 bg-white p-6 overflow-y-auto flex flex-col space-y-6 animate-fade-in shadow-2xl">
            
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="text-sm font-bold text-gray-800 tracking-wider">FILTERS</h3>
              <div className="flex items-center space-x-4">
                <button onClick={handleResetFilters} className="text-[10px] font-bold text-gray-400 hover:text-black">
                  RESET
                </button>
                <button onClick={() => setMobileFiltersOpen(false)} className="p-1 text-gray-500 hover:text-black">
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Categories */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Categories</h4>
              <div className="flex flex-wrap gap-1.5">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategorySelect(cat.slug)}
                    className={`text-xs px-3 py-1.5 rounded border transition ${
                      selectedCategory === cat.slug 
                        ? 'bg-black border-black text-white' 
                        : 'bg-white border-gray-200 text-gray-600'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Price Range</h4>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => {
                    setMinPrice(e.target.value);
                    updateURLParams({ min_price: e.target.value });
                  }}
                  className="w-full rounded border border-gray-200 px-3 py-1.5 text-xs outline-none"
                />
                <span className="text-gray-300 text-xs">to</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => {
                    setMaxPrice(e.target.value);
                    updateURLParams({ max_price: e.target.value });
                  }}
                  className="w-full rounded border border-gray-200 px-3 py-1.5 text-xs outline-none"
                />
              </div>
            </div>

            {/* Sizes */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Sizes</h4>
              <div className="grid grid-cols-4 gap-2">
                {sizeOptions.map((size) => (
                  <button
                    key={size}
                    onClick={() => handleSizeToggle(size)}
                    className={`flex h-8 items-center justify-center rounded text-xs font-semibold border transition ${
                      selectedSizes.includes(size)
                        ? 'border-black bg-black text-white'
                        : 'border-gray-200 text-gray-600'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Colors */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Colors</h4>
              <div className="flex flex-wrap gap-1.5">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    onClick={() => handleColorToggle(color)}
                    className={`text-[10px] font-medium px-2.5 py-1 rounded-full border transition ${
                      selectedColors.includes(color)
                        ? 'bg-black border-black text-white'
                        : 'bg-white border-gray-200 text-gray-600'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setMobileFiltersOpen(false)}
              className="w-full bg-black text-white text-xs font-bold py-3 uppercase tracking-wider hover:bg-gray-800 transition"
            >
              Apply Filters
            </button>

          </div>
        </div>
      )}

    </div>
  );
};

export default ProductList;
