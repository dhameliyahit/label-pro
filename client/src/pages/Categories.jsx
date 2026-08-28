import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { toast } from 'react-hot-toast';
import { 
  FolderTree, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  Loader
} from 'lucide-react';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [name, setName] = useState('');

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await api.get('/categories', {
        params: {
          search: search || undefined
        }
      });
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [search]);

  const openAddModal = () => {
    setEditingCategory(null);
    setName('');
    setShowModal(true);
  };

  const openEditModal = (category) => {
    setEditingCategory(category);
    setName(category.name);
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Category name is required');
      return;
    }

    try {
      if (editingCategory) {
        await api.put(`/categories/${editingCategory._id}`, { name });
        toast.success('Category updated successfully');
      } else {
        await api.post('/categories', { name });
        toast.success('Category created successfully');
      }
      setShowModal(false);
      fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error(error.response?.data?.message || 'Error saving category');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;

    try {
      await api.delete(`/categories/${id}`);
      toast.success('Category deleted successfully');
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error(error.response?.data?.message || 'Error deleting category');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <FolderTree className="w-5.5 h-5.5 text-zinc-400" />
            Categories
          </h1>
          <p className="text-sm text-zinc-400">
            Define categories for your stock products
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg font-semibold text-sm hover:bg-zinc-200 active:scale-[0.98] transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {/* Filter */}
      <div className="bg-zinc-900/40 p-4 border border-zinc-900 rounded-lg">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            placeholder="Search by Category Name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-zinc-800 rounded-lg bg-zinc-950 text-white placeholder-zinc-650 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:border-zinc-400 transition-all"
          />
        </div>
      </div>

      {/* Categories List */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader className="w-8 h-8 animate-spin text-zinc-500" />
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-zinc-800 rounded-lg">
          <FolderTree className="w-10 h-10 mx-auto text-zinc-700 mb-2" />
          <p className="text-zinc-400 text-sm">No categories found</p>
          <p className="text-xs text-zinc-600 mt-1">Get started by creating a new category.</p>
        </div>
      ) : (
        <div className="bg-zinc-950 border border-zinc-900 rounded-lg overflow-hidden shadow-lg">
          <table className="min-w-full divide-y divide-zinc-900">
            <thead className="bg-zinc-900/40">
              <tr>
                <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Category Name
                </th>
                <th className="px-6 py-3.5 text-right text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900 bg-zinc-950">
              {categories.map((category) => (
                <tr key={category._id} className="hover:bg-zinc-900/20 transition-colors">
                  <td className="px-6 py-3.5 text-sm text-white font-medium">
                    {category.name}
                  </td>
                  <td className="px-6 py-3.5 text-sm text-right space-x-3 whitespace-nowrap">
                    <button
                      onClick={() => openEditModal(category)}
                      className="inline-flex text-zinc-400 hover:text-white cursor-pointer transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(category._id)}
                      className="inline-flex text-zinc-400 hover:text-red-400 cursor-pointer transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />

          <div className="bg-zinc-900 border border-zinc-800 rounded-lg max-w-md w-full z-10 overflow-hidden shadow-2xl p-6">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3 mb-4">
              <h2 className="text-sm font-semibold text-white uppercase tracking-widest">
                {editingCategory ? 'Edit Category' : 'Create Category'}
              </h2>
              <button 
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarees, Shirts, etc."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full px-3 py-2 border border-zinc-800 rounded-lg bg-zinc-950 text-white placeholder-zinc-700 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:border-zinc-400 transition-all"
                />
              </div>

              <div className="flex justify-end gap-3 pt-5 border-t border-zinc-800 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg text-sm transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-white text-black hover:bg-zinc-200 font-semibold rounded-lg text-sm transition-all cursor-pointer"
                >
                  {editingCategory ? 'Save Changes' : 'Confirm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
