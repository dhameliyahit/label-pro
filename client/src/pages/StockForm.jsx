import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { toast } from 'react-hot-toast';
import { 
  ArrowLeft, 
  Layers, 
  Loader,
  Save
} from 'lucide-react';

const StockForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(isEditMode);

  // Dropdown lists
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);

  // Form fields state
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('');
  const [productName, setProductName] = useState('');
  const [sku, setSku] = useState('');
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [mrp, setMrp] = useState('');

  useEffect(() => {
    const loadDropdownData = async () => {
      try {
        const [brandRes, catRes] = await Promise.all([
          api.get('/brands'),
          api.get('/categories')
        ]);
        setBrands(brandRes.data);
        setCategories(catRes.data);

        if (isEditMode) {
          const stockRes = await api.get(`/stock/${id}`);
          const item = stockRes.data;
          setBrand(item.brand?._id || '');
          setCategory(item.category?._id || '');
          setProductName(item.productName || '');
          setSku(item.sku || '');
          setSize(item.size || '');
          setColor(item.color || '');
          setMrp(item.mrp || '');
        }
      } catch (error) {
        console.error('Error fetching stock form dependencies:', error);
        toast.error('Failed to load form details');
      } finally {
        setFetchingData(false);
      }
    };

    loadDropdownData();
  }, [id, isEditMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!brand || !category || !productName || !sku || !size || !color || !mrp) {
      toast.error('All fields are required');
      return;
    }

    const payload = {
      brand,
      category,
      productName,
      sku,
      size,
      color,
      mrp: Number(mrp)
    };

    setLoading(true);
    try {
      if (isEditMode) {
        await api.put(`/stock/${id}`, payload);
        toast.success('Stock item updated successfully');
      } else {
        await api.post('/stock', payload);
        toast.success('Stock item created successfully');
      }
      navigate('/dashboard/stock');
    } catch (error) {
      console.error('Error saving stock:', error);
      toast.error(error.response?.data?.message || 'Error saving stock item');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData) {
    return (
      <div className="flex justify-center items-center py-20 font-mono text-zinc-500">
        <Loader className="w-8 h-8 animate-spin text-zinc-500" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back link */}
      <div>
        <Link 
          to="/dashboard/stock" 
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4 text-zinc-500" />
          Back to Inventory
        </Link>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <Layers className="w-5.5 h-5.5 text-zinc-400" />
          {isEditMode ? 'Edit Stock Variation' : 'Create A Stock Variation'}
        </h1>
        <p className="text-sm text-zinc-400">
          {isEditMode ? 'Modify stock product attributes and properties' : 'Register a new stock variant/SKU'}
        </p>
      </div>

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Brand select */}
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">
              Select Brand
            </label>
            <select
              value={brand}
              required
              onChange={(e) => setBrand(e.target.value)}
              className="block w-full px-3 py-2 border border-zinc-800 rounded-lg bg-zinc-950 text-white text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:border-zinc-400 transition-all cursor-pointer"
            >
              <option value="">Choose a Brand</option>
              {brands.map((b) => (
                <option key={b._id} value={b._id}>{b.name}</option>
              ))}
            </select>
          </div>

          {/* Category select */}
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">
              Select Category
            </label>
            <select
              value={category}
              required
              onChange={(e) => setCategory(e.target.value)}
              className="block w-full px-3 py-2 border border-zinc-800 rounded-lg bg-zinc-950 text-white text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:border-zinc-400 transition-all cursor-pointer"
            >
              <option value="">Choose a Category</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Product Name */}
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1.5">
            Product Name
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Cotton Sarees"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            className="block w-full px-3 py-2 border border-zinc-800 rounded-lg bg-zinc-950 text-white placeholder-zinc-700 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:border-zinc-400 transition-all"
          />
        </div>

        {/* SKU */}
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1.5">
            SKU Number
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Tikli-Kids-purple-11-12-Years"
            value={sku}
            disabled={isEditMode}
            onChange={(e) => setSku(e.target.value)}
            className="block w-full px-3 py-2 border border-zinc-800 rounded-lg bg-zinc-950 text-white placeholder-zinc-700 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:border-zinc-400 transition-all disabled:opacity-40"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Size */}
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">
              Size
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 11-12 Years, XL, L"
              value={size}
              onChange={(e) => setSize(e.target.value)}
              className="block w-full px-3 py-2 border border-zinc-800 rounded-lg bg-zinc-950 text-white placeholder-zinc-700 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:border-zinc-400 transition-all"
            />
          </div>

          {/* Color */}
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">
              Color
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Purple, Navy Blue"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="block w-full px-3 py-2 border border-zinc-800 rounded-lg bg-zinc-950 text-white placeholder-zinc-700 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:border-zinc-400 transition-all"
            />
          </div>

          {/* MRP */}
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">
              MRP (M.R.P. in Rs.)
            </label>
            <input
              type="number"
              required
              placeholder="e.g. 1999"
              value={mrp}
              onChange={(e) => setMrp(e.target.value)}
              className="block w-full px-3 py-2 border border-zinc-800 rounded-lg bg-zinc-950 text-white placeholder-zinc-700 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:border-zinc-400 transition-all"
            />
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-end gap-3 pt-6 border-t border-zinc-800 mt-6">
          <button
            type="button"
            onClick={() => navigate('/dashboard/stock')}
            className="px-4 py-2 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg text-sm transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white text-black font-semibold rounded-lg text-sm transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isEditMode ? 'Save Changes' : 'Confirm New Stock'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StockForm;
