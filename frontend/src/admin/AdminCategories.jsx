import React, { useEffect, useState } from 'react';
import API from '../services/api';
import AdminSidebar from '../components/AdminSidebar';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [parentCategoryId, setParentCategoryId] = useState('');
  const [formSubmitLoading, setFormSubmitLoading] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await API.get('/categories');
      // API returns { data: [...] } — extract the array
      setCategories(Array.isArray(response.data.data) ? response.data.data : []);
    } catch (error) {
      console.error('Error fetching categories', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenAddModal = () => {
    setEditingCategory(null);
    setName('');
    setSlug('');
    setParentCategoryId('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cat) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setParentCategoryId(cat.parent_category_id || '');
    setIsModalOpen(true);
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category? (Note: Ensure no products or subcategories are linked to it)')) return;
    try {
      await API.delete(`/control-panel-x7k/categories/${id}`);
      setCategories((prev) => prev.filter((cat) => cat.id !== id));
      alert('Category deleted successfully.');
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to delete category.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !slug) return;

    setFormSubmitLoading(true);
    const payload = {
      name,
      slug,
      parent_category_id: parentCategoryId || null
    };

    try {
      if (editingCategory) {
        await API.put(`/control-panel-x7k/categories/${editingCategory.id}`, payload);
        alert('Category updated successfully.');
      } else {
        await API.post('/control-panel-x7k/categories', payload);
        alert('Category created successfully.');
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (error) {
      alert(error.response?.data?.error || 'Form submission failed.');
    } finally {
      setFormSubmitLoading(false);
    }
  };

  // Only list categories that don't have a parent as potential parent options
  const rootCategories = categories.filter((c) => !c.parent_category_id);

  return (
    <div className="min-h-screen bg-gray-50 pl-64 pb-12">
      <AdminSidebar />

      {/* Header */}
      <header className="bg-white border-b border-gray-150 py-5 px-8 flex justify-between items-center sticky top-0 z-20">
        <div>
          <h1 className="text-sm font-bold text-gray-800 tracking-wider uppercase">Category Management</h1>
          <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest mt-0.5">
            Configure root departments (Men, Women) and mapped subcategories.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="bg-black text-white text-xs font-bold px-4 py-2 rounded-md hover:bg-neutral-800 transition flex items-center space-x-1.5 shadow"
        >
          <Plus size={14} />
          <span>Add Category</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="p-8 max-w-5xl mx-auto">
        
        {loading ? (
          <div className="text-center py-12 text-xs text-gray-400">Loading categories data...</div>
        ) : (
          <div className="bg-white border border-gray-150 rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-gray-50 text-gray-400 border-b border-gray-150 uppercase text-[9px] font-bold">
                  <th className="px-6 py-3.5">Category ID</th>
                  <th className="px-6 py-3.5">Name</th>
                  <th className="px-6 py-3.5">Slug Handle</th>
                  <th className="px-6 py-3.5">Parent Category</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-3.5 font-mono text-[10px]">#{cat.id}</td>
                    <td className="px-6 py-3.5 font-bold text-gray-900">{cat.name}</td>
                    <td className="px-6 py-3.5 font-mono text-[10px] text-gray-400">{cat.slug}</td>
                    <td className="px-6 py-3.5">
                      {cat.parent_name ? (
                        <span className="inline-block text-[10px] bg-zinc-50 border border-zinc-150 px-2 py-0.5 rounded text-zinc-600">
                          {cat.parent_name}
                        </span>
                      ) : (
                        <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Root</span>
                      )}
                    </td>
                    <td className="px-6 py-3.5 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => handleOpenEditModal(cat)}
                        className="p-2 border border-gray-200 rounded-md text-gray-500 hover:text-black hover:border-black transition"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="p-2 border border-gray-200 rounded-md text-gray-400 hover:text-red-600 hover:border-red-150 transition"
                      >
                        <Trash2 size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </main>

      {/* Category Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-fade-in border border-gray-200 space-y-6">
            
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
                {editingCategory ? 'Edit Category' : 'Create Category'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-gray-400 hover:text-black">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Category Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!editingCategory) {
                      setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                    }
                  }}
                  placeholder="e.g. Slim Shirts"
                  className="w-full rounded border border-gray-250 px-3 py-2 text-xs outline-none focus:border-black"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Slug Identifier (URL friendly)</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'))}
                  placeholder="e.g. men-slim-shirts"
                  className="w-full rounded border border-gray-250 px-3 py-2 text-xs outline-none focus:border-black"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Parent Category (Optional)</label>
                <select
                  value={parentCategoryId}
                  onChange={(e) => setParentCategoryId(e.target.value)}
                  className="w-full rounded border border-gray-250 px-3 py-2 text-xs outline-none bg-white"
                >
                  <option value="">None (Makes this a Root Category)</option>
                  {rootCategories.map((rc) => (
                    <option key={rc.id} value={rc.id}>
                      {rc.name}
                    </option>
                  ))}
                </select>
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
                  {formSubmitLoading ? 'Saving...' : 'Save Category'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default AdminCategories;
