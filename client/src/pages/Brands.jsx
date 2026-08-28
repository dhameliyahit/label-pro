import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { toast } from 'react-hot-toast';
import { 
  Award, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  MapPin, 
  Mail, 
  Phone,
  Building,
  Loader
} from 'lucide-react';

const Brands = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter state
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  
  // Form modal state
  const [showModal, setShowModal] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  
  // Form fields state
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const response = await api.get('/brands', {
        params: {
          search: search || undefined,
          city: cityFilter || undefined,
        }
      });
      setBrands(response.data);
    } catch (error) {
      console.error('Error fetching brands:', error);
      toast.error('Failed to load brands');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, [search, cityFilter]);

  const openAddModal = () => {
    setEditingBrand(null);
    setName('');
    setAddress('');
    setCity('');
    setState('');
    setPincode('');
    setEmail('');
    setPhone('');
    setShowModal(true);
  };

  const openEditModal = (brand) => {
    setEditingBrand(brand);
    setName(brand.name);
    setAddress(brand.address);
    setCity(brand.city);
    setState(brand.state);
    setPincode(brand.pincode);
    setEmail(brand.email);
    setPhone(brand.phone);
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!name || !address || !city || !state || !pincode || !email || !phone) {
      toast.error('All fields are required');
      return;
    }

    const payload = { name, address, city, state, pincode, email, phone };

    try {
      if (editingBrand) {
        await api.put(`/brands/${editingBrand._id}`, payload);
        toast.success('Brand updated successfully');
      } else {
        await api.post('/brands', payload);
        toast.success('Brand created successfully');
      }
      setShowModal(false);
      fetchBrands();
    } catch (error) {
      console.error('Error saving brand:', error);
      toast.error(error.response?.data?.message || 'Error saving brand');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this brand?')) return;

    try {
      await api.delete(`/brands/${id}`);
      toast.success('Brand deleted successfully');
      fetchBrands();
    } catch (error) {
      console.error('Error deleting brand:', error);
      toast.error(error.response?.data?.message || 'Error deleting brand');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Award className="w-5.5 h-5.5 text-zinc-400" />
            Brands
          </h1>
          <p className="text-sm text-zinc-400">
            Manage company brand profiles and addresses
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg font-semibold text-sm hover:bg-zinc-200 active:scale-[0.98] transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Brand
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-zinc-900/40 p-4 border border-zinc-900 rounded-lg">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            placeholder="Search by Brand Name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-zinc-800 rounded-lg bg-zinc-950 text-white placeholder-zinc-650 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-450 focus:border-zinc-450 transition-all"
          />
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
            <Building className="h-4 w-4" />
          </div>
          <input
            type="text"
            placeholder="Filter by City..."
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-zinc-800 rounded-lg bg-zinc-950 text-white placeholder-zinc-650 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-450 focus:border-zinc-455 transition-all"
          />
        </div>
      </div>

      {/* Brands List */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader className="w-8 h-8 animate-spin text-zinc-500" />
        </div>
      ) : brands.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-zinc-800 rounded-lg">
          <Award className="w-10 h-10 mx-auto text-zinc-750 mb-2" />
          <p className="text-zinc-400 text-sm">No brands found</p>
          <p className="text-xs text-zinc-600 mt-1">Get started by creating a new Brand profile.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {brands.map((brand) => (
            <div 
              key={brand._id}
              className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 flex flex-col justify-between hover:border-zinc-750 transition-colors"
            >
              <div>
                <div className="flex justify-between items-start gap-4 mb-4">
                  <h3 className="font-semibold text-base text-white tracking-wide">{brand.name}</h3>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => openEditModal(brand)}
                      className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white cursor-pointer transition-colors"
                      title="Edit Brand"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(brand._id)}
                      className="p-1.5 rounded hover:bg-red-950/20 text-zinc-400 hover:text-red-400 cursor-pointer transition-colors"
                      title="Delete Brand"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs text-zinc-400">
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-zinc-550 shrink-0 mt-0.5" />
                    <span>
                      {brand.address}, {brand.city}, {brand.state} - {brand.pincode}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Mail className="w-4 h-4 text-zinc-550 shrink-0" />
                    <span className="truncate">{brand.email}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Phone className="w-4 h-4 text-zinc-550 shrink-0" />
                    <span>{brand.phone}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />

          <div className="bg-zinc-900 border border-zinc-800 rounded-lg max-w-lg w-full z-10 overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center px-6 py-4 border-b border-zinc-800">
              <h2 className="text-sm font-semibold text-white">
                {editingBrand ? 'Edit Brand' : 'Create A Brand'}
              </h2>
              <button 
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  Brand Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter Brand Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full px-3 py-2 border border-zinc-800 rounded-lg bg-zinc-950 text-white placeholder-zinc-700 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:border-zinc-400 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  Brand Address
                </label>
                <textarea
                  required
                  rows="2"
                  placeholder="Enter Brand Address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="block w-full px-3 py-2 border border-zinc-800 rounded-lg bg-zinc-950 text-white placeholder-zinc-700 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:border-zinc-400 transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="City"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="block w-full px-3 py-2 border border-zinc-800 rounded-lg bg-zinc-950 text-white placeholder-zinc-700 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:border-zinc-400 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="State"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="block w-full px-3 py-2 border border-zinc-800 rounded-lg bg-zinc-950 text-white placeholder-zinc-700 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:border-zinc-400 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">
                    Pincode
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Pincode"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="block w-full px-3 py-2 border border-zinc-800 rounded-lg bg-zinc-950 text-white placeholder-zinc-700 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:border-zinc-400 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="contact@brand.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full px-3 py-2 border border-zinc-800 rounded-lg bg-zinc-950 text-white placeholder-zinc-700 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:border-zinc-400 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">
                    Contact Number
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="block w-full px-3 py-2 border border-zinc-800 rounded-lg bg-zinc-950 text-white placeholder-zinc-700 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:border-zinc-400 transition-all"
                  />
                </div>
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
                  {editingBrand ? 'Confirm Changes' : 'Confirm New Brand'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Brands;
