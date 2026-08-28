import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { toast } from 'react-hot-toast';
import { 
  Layers, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  Loader
} from 'lucide-react';

const Stock = () => {
  const navigate = useNavigate();
  
  // Stock list data state
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter lists
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  
  // Current filter criteria
  const [search, setSearch] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 10;

  const fetchFilters = async () => {
    try {
      const [brandRes, catRes] = await Promise.all([
        api.get('/brands'),
        api.get('/categories')
      ]);
      setBrands(brandRes.data);
      setCategories(catRes.data);
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  };

  const fetchStock = async () => {
    setLoading(true);
    try {
      const response = await api.get('/stock', {
        params: {
          page,
          limit,
          brand: brandFilter || undefined,
          category: categoryFilter || undefined,
          search: search || undefined,
        }
      });
      setStock(response.data.items);
      setTotalPages(response.data.totalPages);
      setTotalItems(response.data.totalItems);
    } catch (error) {
      console.error('Error fetching stock:', error);
      toast.error('Failed to load stock data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilters();
  }, []);

  useEffect(() => {
    fetchStock();
  }, [page, brandFilter, categoryFilter, search]);

  const handleFilterChange = (setter, value) => {
    setter(value);
    setPage(1);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this stock item?')) return;

    try {
      await api.delete(`/stock/${id}`);
      toast.success('Stock item deleted');
      fetchStock();
    } catch (error) {
      console.error('Error deleting stock:', error);
      toast.error(error.response?.data?.message || 'Error deleting stock item');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Layers className="w-5.5 h-5.5 text-zinc-400" />
            Stock Inventory
          </h1>
          <p className="text-sm text-zinc-400">
            Manage product variations, SKUs, and pricing
          </p>
        </div>
        <button
          onClick={() => navigate('/dashboard/stock/new')}
          className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg font-semibold text-sm hover:bg-zinc-200 active:scale-[0.98] transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Stock
        </button>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-zinc-900/40 p-4 border border-zinc-900 rounded-lg">
        {/* Search */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            placeholder="Search by Product Name or SKU..."
            value={search}
            onChange={(e) => handleFilterChange(setSearch, e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-zinc-800 rounded-lg bg-zinc-950 text-white placeholder-zinc-600 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:border-zinc-400 transition-all"
          />
        </div>

        {/* Brand Dropdown */}
        <div className="relative">
          <select
            value={brandFilter}
            onChange={(e) => handleFilterChange(setBrandFilter, e.target.value)}
            className="block w-full px-3 py-2 border border-zinc-800 rounded-lg bg-zinc-950 text-white text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:border-zinc-400 transition-all cursor-pointer"
          >
            <option value="">All Brands</option>
            {brands.map((b) => (
              <option key={b._id} value={b._id}>{b.name}</option>
            ))}
          </select>
        </div>

        {/* Category Dropdown */}
        <div className="relative">
          <select
            value={categoryFilter}
            onChange={(e) => handleFilterChange(setCategoryFilter, e.target.value)}
            className="block w-full px-3 py-2 border border-zinc-800 rounded-lg bg-zinc-950 text-white text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:border-zinc-400 transition-all cursor-pointer"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stock Table */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader className="w-8 h-8 animate-spin text-zinc-500" />
        </div>
      ) : stock.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-zinc-800 rounded-lg">
          <Layers className="w-10 h-10 mx-auto text-zinc-700 mb-2" />
          <p className="text-zinc-400 text-sm">No stock items found</p>
          <p className="text-xs text-zinc-650 mt-1 font-mono">Try adjusting your filters or add a new stock item.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="border border-zinc-900 rounded-lg bg-zinc-950 overflow-x-auto shadow-lg">
            <table className="min-w-full divide-y divide-zinc-900 text-sm">
              <thead className="bg-zinc-900/40 text-left">
                <tr>
                  <th className="px-6 py-3.5 font-semibold text-zinc-400">Product Name</th>
                  <th className="px-6 py-3.5 font-semibold text-zinc-400">SKU</th>
                  <th className="px-6 py-3.5 font-semibold text-zinc-400">Brand</th>
                  <th className="px-6 py-3.5 font-semibold text-zinc-400">Category</th>
                  <th className="px-6 py-3.5 font-semibold text-zinc-400">Size</th>
                  <th className="px-6 py-3.5 font-semibold text-zinc-400">Color</th>
                  <th className="px-6 py-3.5 font-semibold text-zinc-400">MRP</th>
                  <th className="px-6 py-3.5 font-semibold text-zinc-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900 bg-zinc-950">
                {stock.map((item) => (
                  <tr key={item._id} className="hover:bg-zinc-900/20 transition-colors">
                    <td className="px-6 py-3.5 text-white font-medium truncate max-w-xs">{item.productName}</td>
                    <td className="px-6 py-3.5 font-mono text-xs text-zinc-300">{item.sku}</td>
                    <td className="px-6 py-3.5 text-zinc-350">{item.brand?.name || 'N/A'}</td>
                    <td className="px-6 py-3.5 text-zinc-355">{item.category?.name || 'N/A'}</td>
                    <td className="px-6 py-3.5 text-zinc-355 font-mono">{item.size}</td>
                    <td className="px-6 py-3.5 text-zinc-355">{item.color}</td>
                    <td className="px-6 py-3.5 font-bold text-white">Rs.{item.mrp}/-</td>
                    <td className="px-6 py-3.5 text-right space-x-3 whitespace-nowrap">
                      <button
                        onClick={() => navigate(`/dashboard/stock/edit/${item._id}`)}
                        className="inline-flex text-zinc-400 hover:text-white cursor-pointer transition-colors"
                        title="Edit Item"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="inline-flex text-zinc-400 hover:text-red-400 cursor-pointer transition-colors"
                        title="Delete Item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-zinc-900/30 p-4 border border-zinc-900 rounded-lg text-xs">
            <span className="text-zinc-400">
              Showing <span className="font-semibold text-white">{stock.length}</span> of{' '}
              <span className="font-semibold text-white">{totalItems}</span> stock records
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                className="p-2 border border-zinc-800 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-zinc-300 font-semibold">
                Page <span className="text-white font-bold">{page}</span> of {totalPages || 1}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                className="p-2 border border-zinc-800 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Stock;
