import React, { useState, useEffect, useRef } from 'react';
import api from '../utils/api';
import { toast } from 'react-hot-toast';
import { 
  Barcode, 
  Search, 
  FileText, 
  Download,
  Loader,
  Sparkles
} from 'lucide-react';

const Label = () => {
  // Suggestion states
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searching, setSearching] = useState(false);
  
  // Selected product variation
  const [selectedStock, setSelectedStock] = useState(null);

  // Form states
  const [netQuantity, setNetQuantity] = useState('1N');
  const [orderId, setOrderId] = useState('');
  const [mfgDate, setMfgDate] = useState('');
  const [generating, setGenerating] = useState(false);

  const autocompleteRef = useRef(null);

  // Detect clicks outside suggestions dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (autocompleteRef.current && !autocompleteRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch suggestions when query changes (with simple debounce check)
  useEffect(() => {
    if (!query || (selectedStock && query === selectedStock.sku)) {
      setSuggestions([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setSearching(true);
      try {
        const response = await api.get(`/labels/suggest?q=${query}`);
        setSuggestions(response.data);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query, selectedStock]);

  const handleSelectProduct = (product) => {
    setSelectedStock(product);
    setQuery(product.sku);
    setShowSuggestions(false);
  };

  const handleGenerateLabel = async (e) => {
    e.preventDefault();

    if (!selectedStock) {
      toast.error('Please search and select a product variation');
      return;
    }

    if (!netQuantity.trim()) {
      toast.error('Please enter Net Quantity');
      return;
    }

    if (!orderId.trim()) {
      toast.error('Please enter Order ID');
      return;
    }

    setGenerating(true);
    try {
      const response = await api.post('/labels/generate', {
        stockId: selectedStock._id,
        netQuantity: netQuantity.trim(),
        orderId: orderId.trim(),
        mfgDate: mfgDate.trim() || undefined
      }, {
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const downloadUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `label-${orderId.trim()}.pdf`);
      document.body.appendChild(link);
      link.click();
      
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
      toast.success('Label PDF generated and downloading!');
    } catch (error) {
      console.error('Error generating label PDF:', error);
      toast.error('Failed to generate label PDF');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <Barcode className="w-5.5 h-5.5 text-zinc-400" />
          Generate Label PDF
        </h1>
        <p className="text-sm text-zinc-400">
          Create portrait shipping labels (50mm x 90mm) with dynamic barcodes
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Form Column */}
        <div className="md:col-span-3 space-y-6">
          <form onSubmit={handleGenerateLabel} className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-5">
            
            {/* SKU Autocomplete Search */}
            <div ref={autocompleteRef} className="relative">
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                ASIN Number / SKU Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                  {searching ? <Loader className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                </div>
                <input
                  type="text"
                  required
                  placeholder="Type SKU or product name to search..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
                  className="block w-full pl-10 pr-3 py-2 border border-zinc-800 rounded-lg bg-zinc-950 text-white placeholder-zinc-700 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:border-zinc-400 transition-all"
                />
              </div>

              {/* Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl z-20 divide-y divide-zinc-800/60">
                  {suggestions.map((item) => (
                    <button
                      key={item._id}
                      type="button"
                      onClick={() => handleSelectProduct(item)}
                      className="w-full text-left px-4 py-3 hover:bg-zinc-950 text-sm transition-colors cursor-pointer"
                    >
                      <p className="font-semibold text-zinc-300 font-mono text-xs truncate">{item.sku}</p>
                      <p className="text-xs text-zinc-500 truncate mt-0.5">
                        {item.productName} &bull; {item.brand?.name} &bull; {item.color} / {item.size}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Net Quantity */}
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                Net Quantity
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 1N, 2N"
                value={netQuantity}
                onChange={(e) => setNetQuantity(e.target.value)}
                className="block w-full px-3 py-2 border border-zinc-800 rounded-lg bg-zinc-950 text-white placeholder-zinc-700 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:border-zinc-400 transition-all"
              />
            </div>

            {/* Order ID */}
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                Enter Order ID / Barcode Value
              </label>
              <input
                type="text"
                required
                placeholder="e.g. B0DMPCMLTP"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className="block w-full px-3 py-2 border border-zinc-800 rounded-lg bg-zinc-950 text-white placeholder-zinc-700 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:border-zinc-400 transition-all"
              />
            </div>

            {/* Optional MFG Date */}
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                Manufacturing Date (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. 08/2026 (Defaults to current month/year)"
                value={mfgDate}
                onChange={(e) => setMfgDate(e.target.value)}
                className="block w-full px-3 py-2 border border-zinc-800 rounded-lg bg-zinc-950 text-white placeholder-zinc-700 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:border-zinc-400 transition-all"
              />
            </div>

            {/* Action */}
            <div className="pt-5 border-t border-zinc-800 mt-6">
              <button
                type="submit"
                disabled={generating || !selectedStock}
                className="w-full flex items-center justify-center gap-2 py-3 bg-white text-black font-semibold rounded-lg text-sm transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
              >
                {generating ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Generating PDF...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    Generate & Download PDF
                  </>
                )}
              </button>
            </div>

          </form>
        </div>

        {/* Selected Product Preview Column */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 h-full flex flex-col justify-between shadow-lg">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-4 border-b border-zinc-800 pb-2">
                Selected Product Info
              </h2>

              {selectedStock ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Product SKU</p>
                    <p className="font-mono text-xs text-white font-bold break-all">{selectedStock.sku}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Product Name</p>
                    <p className="text-sm text-white font-semibold">{selectedStock.productName}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Brand</p>
                      <p className="text-xs text-zinc-250 font-semibold">{selectedStock.brand?.name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Category</p>
                      <p className="text-xs text-zinc-250 font-semibold">{selectedStock.category?.name || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Size / Color</p>
                      <p className="text-xs text-zinc-250 font-semibold">{selectedStock.size} / {selectedStock.color}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">MRP</p>
                      <p className="text-xs font-bold text-white">Rs.{selectedStock.mrp}/-</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="w-10 h-10 text-zinc-750 mx-auto mb-2" />
                  <p className="text-xs text-zinc-555">
                    No product selected. Search and select a SKU on the left to see specs here.
                  </p>
                </div>
              )}
            </div>

            {selectedStock && (
              <div className="bg-zinc-950 p-4 border border-zinc-800 rounded-lg text-xs text-zinc-400 mt-6 flex items-start gap-3">
                <Sparkles className="w-4.5 h-4.5 text-zinc-500 shrink-0" />
                <span>
                  The label will contain manufactured details and consumer service contacts of <strong>{selectedStock.brand?.name}</strong>.
                </span>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default Label;
