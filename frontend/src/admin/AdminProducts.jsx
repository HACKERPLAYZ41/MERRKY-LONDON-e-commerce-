import React, { useEffect, useState } from 'react';
import API from '../services/api';
import AdminSidebar from '../components/AdminSidebar';
import { Plus, Edit2, Trash2, Upload, X, Search, AlertCircle } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

const AdminProducts = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  // Form fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [stock, setStock] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [sizes, setSizes] = useState('');
  const [colors, setColors] = useState('');
  const [images, setImages] = useState([]); // List of image URLs
  
  const [uploadLoading, setUploadLoading] = useState(false);
  const [formSubmitLoading, setFormSubmitLoading] = useState(false);

  // Sync low stock query param
  const filterLowStock = searchParams.get('low_stock') === 'true';

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterLowStock) params.low_stock = 'true';
      const response = await API.get('/products', { params });
      // API returns { data: [...], links: {}, meta: {} } — extract the array
      setProducts(Array.isArray(response.data.data) ? response.data.data : []);
    } catch (error) {
      console.error('Error fetching products', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    
    // Fetch categories for selector
    const fetchCategories = async () => {
      try {
        const response = await API.get('/categories');
        // API returns { data: [...] } — extract the array
        setCategories(Array.isArray(response.data.data) ? response.data.data : []);
      } catch (error) {
        console.error('Error fetching categories', error);
      }
    };
    fetchCategories();
  }, [filterLowStock]);

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setName('');
    setDescription('');
    setPrice('');
    setDiscountPrice('');
    setStock('');
    setCategoryId('');
    setSizes('S, M, L, XL');
    setColors('Black, White');
    setImages([]);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = async (product) => {
    setEditingProduct(product);
    setLoading(true);
    try {
      // Get detailed product view containing images list
      const response = await API.get(`/products/${product.id}`);
      // Single product returns { data: { ...product } }
      const data = response.data.data ?? response.data;
      
      setName(data.name);
      setDescription(data.description || '');
      setPrice(data.price);
      setDiscountPrice(data.discount_price || '');
      setStock(data.stock);
      setCategoryId(data.category_id || '');
      setSizes(data.sizes || '');
      setColors(data.colors || '');
      setImages(data.images?.map(img => img.image_url) || []);
      setIsModalOpen(true);
    } catch (error) {
      alert('Failed to retrieve product details.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await API.delete(`/control-panel-x7k/products/${id}`);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      alert('Product deleted successfully.');
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to delete product.');
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setUploadLoading(true);
    try {
      const response = await API.post('/control-panel-x7k/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setImages((prev) => [...prev, response.data.image_url]);
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to upload image.');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !price || stock === '') return;

    setFormSubmitLoading(true);

    const payload = {
      name,
      description,
      price,
      discount_price: discountPrice || null,
      stock,
      category_id: categoryId || null,
      sizes,
      colors,
      images
    };

    try {
      if (editingProduct) {
        // Edit product
        await API.put(`/control-panel-x7k/products/${editingProduct.id}`, payload);
        alert('Product updated successfully.');
      } else {
        // Create product
        await API.post('/control-panel-x7k/products', payload);
        alert('Product created successfully.');
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (error) {
      alert(error.response?.data?.error || 'Form submission failed.');
    } finally {
      setFormSubmitLoading(false);
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 pl-64 pb-12">
      <AdminSidebar />

      {/* Header */}
      <header className="bg-white border-b border-gray-150 py-5 px-8 flex justify-between items-center sticky top-0 z-20">
        <div>
          <h1 className="text-sm font-bold text-gray-800 tracking-wider uppercase">
            {filterLowStock ? 'Low Stock Alerts' : 'Product Inventory'}
          </h1>
          <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest mt-0.5">
            Add, update, or remove clothing items and manage descriptions.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="bg-black text-white text-xs font-bold px-4 py-2 rounded-md hover:bg-neutral-800 transition flex items-center space-x-1.5 shadow"
        >
          <Plus size={14} />
          <span>Add Product</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="p-8 max-w-7xl mx-auto space-y-6">
        
        {/* Search Toolbar */}
        <div className="bg-white border border-gray-150 rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div className="relative w-80">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Search size={14} /></span>
            <input
              type="text"
              placeholder="Search products by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-md border border-gray-200 py-1.5 pr-4 pl-9 text-xs outline-none focus:border-black transition"
            />
          </div>
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
            Total Displayed: {filteredProducts.length} Items
          </span>
        </div>

        {/* Product Table */}
        <div className="bg-white border border-gray-150 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-gray-50 text-gray-400 border-b border-gray-150 uppercase text-[9px] font-bold">
                  <th className="px-6 py-3.5">Image</th>
                  <th className="px-6 py-3.5">Product Name</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Pricing</th>
                  <th className="px-6 py-3.5">Stock</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map((prod) => (
                  <tr key={prod.id} className="text-gray-700 hover:bg-gray-50/50">
                    <td className="px-6 py-3.5">
                      <img
                        src={prod.primary_image || 'https://via.placeholder.com/50'}
                        alt=""
                        className="h-12 w-9 object-cover rounded border border-gray-100 bg-gray-50"
                      />
                    </td>
                    <td className="px-6 py-3.5">
                      <p className="font-bold text-gray-900 leading-normal">{prod.name}</p>
                      <p className="text-[9px] text-gray-400 uppercase font-semibold">SKU ID: #{prod.id}</p>
                    </td>
                    <td className="px-6 py-3.5 text-gray-500 font-medium">
                      {prod.category_name || 'Unmapped'}
                    </td>
                    <td className="px-6 py-3.5">
                      <p className="font-bold text-black">₹{prod.discount_price !== null ? prod.discount_price : prod.price}</p>
                      {prod.discount_price !== null && (
                        <p className="text-[10px] text-gray-400 line-through">₹{prod.price}</p>
                      )}
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center space-x-1.5">
                        <span className={`font-bold ${prod.stock <= 5 ? 'text-red-600' : 'text-gray-800'}`}>
                          {prod.stock} Units
                        </span>
                        {prod.stock <= 5 && (
                          <span className="text-red-500" title="Low inventory count alert"><AlertCircle size={12} /></span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-3.5 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => handleOpenEditModal(prod)}
                        className="p-2 border border-gray-200 rounded-md text-gray-500 hover:text-black hover:border-black transition"
                        title="Edit details"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(prod.id)}
                        className="p-2 border border-gray-200 rounded-md text-gray-400 hover:text-red-600 hover:border-red-150 transition"
                        title="Delete product"
                      >
                        <Trash2 size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-400 text-xs">
                      No matching products found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>

      {/* Modal Slide-Over Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col p-6 animate-fade-in border border-gray-200">
            
            <div className="flex justify-between items-center border-b border-gray-100 pb-3 mb-6">
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
                {editingProduct ? 'Modify Product Details' : 'Add New Clothing Product'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-gray-400 hover:text-black">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1 col-span-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Product Title</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Slim Fit Cotton Linen Shirt"
                    className="w-full rounded border border-gray-250 px-3 py-2 text-xs outline-none focus:border-black"
                    required
                  />
                </div>

                <div className="space-y-1 col-span-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Description Details</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide details about sizing fit, fabric details, care tips..."
                    className="w-full rounded border border-gray-250 p-3 text-xs outline-none focus:border-black resize-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Base Price (INR)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="e.g. 2999"
                    className="w-full rounded border border-gray-250 px-3 py-2 text-xs outline-none focus:border-black"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Discount Price (Optional)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={discountPrice}
                    onChange={(e) => setDiscountPrice(e.target.value)}
                    placeholder="e.g. 2499"
                    className="w-full rounded border border-gray-250 px-3 py-2 text-xs outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Available Stock Units</label>
                  <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    placeholder="e.g. 40"
                    className="w-full rounded border border-gray-250 px-3 py-2 text-xs outline-none focus:border-black"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Category Map</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full rounded border border-gray-250 px-3 py-2 text-xs outline-none bg-white"
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.parent_name ? `${cat.parent_name} → ${cat.name}` : cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Size Options (Comma separated)</label>
                  <input
                    type="text"
                    value={sizes}
                    onChange={(e) => setSizes(e.target.value)}
                    placeholder="e.g. S, M, L, XL"
                    className="w-full rounded border border-gray-250 px-3 py-2 text-xs outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Color Swatches (Comma separated)</label>
                  <input
                    type="text"
                    value={colors}
                    onChange={(e) => setColors(e.target.value)}
                    placeholder="e.g. Black, White, Navy Blue"
                    className="w-full rounded border border-gray-250 px-3 py-2 text-xs outline-none"
                  />
                </div>
              </div>

              {/* Image Upload Area */}
              <div className="space-y-2 pt-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase block">Product Image Gallery</label>
                
                {/* Images Preview Grid */}
                <div className="flex flex-wrap gap-2 mb-2">
                  {images.map((imgUrl, idx) => (
                    <div key={idx} className="relative h-16 w-12 border rounded bg-gray-50 overflow-hidden">
                      <img src={imgUrl} alt="" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-bl p-0.5"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}

                  {/* Upload trigger card */}
                  <label className="flex h-16 w-12 flex-col items-center justify-center rounded border border-dashed border-gray-300 hover:border-black cursor-pointer bg-gray-50/50">
                    <Upload size={14} className="text-gray-400" />
                    <span className="text-[8px] text-gray-400 mt-1 uppercase font-bold">
                      {uploadLoading ? '...' : 'Upload'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploadLoading}
                    />
                  </label>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="border border-gray-200 text-gray-500 text-xs font-bold px-6 py-2.5 rounded uppercase hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitLoading}
                  className="bg-black text-white text-xs font-bold px-6 py-2.5 rounded uppercase hover:bg-neutral-800 transition"
                >
                  {formSubmitLoading ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default AdminProducts;
