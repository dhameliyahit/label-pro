const Stock = require('../models/stock');

// @desc    Get all stock with pagination, search, and filters
// @route   GET /api/stock
// @access  Private
const getStock = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const { brand, category, search } = req.query;

    let query = {};

    if (brand) {
      query.brand = brand;
    }

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { productName: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } }
      ];
    }

    const skipIndex = (page - 1) * limit;

    const totalItems = await Stock.countDocuments(query);
    const items = await Stock.find(query)
      .populate('brand')
      .populate('category')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skipIndex);

    res.json({
      items,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error('Error fetching stock:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single stock item
// @route   GET /api/stock/:id
// @access  Private
const getStockById = async (req, res) => {
  try {
    const stockItem = await Stock.findById(req.params.id)
      .populate('brand')
      .populate('category');

    if (!stockItem) {
      return res.status(404).json({ message: 'Stock item not found' });
    }
    res.json(stockItem);
  } catch (error) {
    console.error('Error fetching stock item:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create stock item
// @route   POST /api/stock
// @access  Private
const createStock = async (req, res) => {
  const { brand, category, productName, sku, size, color, mrp } = req.body;

  if (!brand || !category || !productName || !sku || !size || !color || !mrp) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }

  try {
    // Check if SKU already exists
    const skuExists = await Stock.findOne({ sku: sku.trim() });
    if (skuExists) {
      return res.status(400).json({ message: 'Stock item with this SKU already exists' });
    }

    const stockItem = new Stock({
      brand,
      category,
      productName: productName.trim(),
      sku: sku.trim(),
      size: size.trim(),
      color: color.trim(),
      mrp
    });

    const createdStock = await stockItem.save();
    res.status(201).json(createdStock);
  } catch (error) {
    console.error('Error creating stock item:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update stock item
// @route   PUT /api/stock/:id
// @access  Private
const updateStock = async (req, res) => {
  const { brand, category, productName, sku, size, color, mrp } = req.body;

  try {
    const stockItem = await Stock.findById(req.params.id);

    if (!stockItem) {
      return res.status(404).json({ message: 'Stock item not found' });
    }

    // Check SKU uniqueness if SKU is being changed
    if (sku && sku.trim() !== stockItem.sku) {
      const skuExists = await Stock.findOne({ sku: sku.trim() });
      if (skuExists) {
        return res.status(400).json({ message: 'Stock item with this SKU already exists' });
      }
      stockItem.sku = sku.trim();
    }

    stockItem.brand = brand || stockItem.brand;
    stockItem.category = category || stockItem.category;
    stockItem.productName = productName !== undefined ? productName.trim() : stockItem.productName;
    stockItem.size = size !== undefined ? size.trim() : stockItem.size;
    stockItem.color = color !== undefined ? color.trim() : stockItem.color;
    stockItem.mrp = mrp !== undefined ? mrp : stockItem.mrp;

    const updatedStock = await stockItem.save();
    res.json(updatedStock);
  } catch (error) {
    console.error('Error updating stock item:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete stock item
// @route   DELETE /api/stock/:id
// @access  Private
const deleteStock = async (req, res) => {
  try {
    const stockItem = await Stock.findById(req.params.id);

    if (!stockItem) {
      return res.status(404).json({ message: 'Stock item not found' });
    }

    await Stock.deleteOne({ _id: req.params.id });
    res.json({ message: 'Stock item removed' });
  } catch (error) {
    console.error('Error deleting stock item:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getStock,
  getStockById,
  createStock,
  updateStock,
  deleteStock,
};
