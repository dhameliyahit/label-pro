const Brand = require('../models/brand');

// @desc    Get all brands with search & filter
// @route   GET /api/brands
// @access  Private
const getBrands = async (req, res) => {
  try {
    const { search, city, state } = req.query;
    let query = {};

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    if (city) {
      query.city = { $regex: city, $options: 'i' };
    }

    if (state) {
      query.state = { $regex: state, $options: 'i' };
    }

    // Sort by name ascending
    const brands = await Brand.find(query).sort({ name: 1 });
    res.json(brands);
  } catch (error) {
    console.error('Error fetching brands:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single brand
// @route   GET /api/brands/:id
// @access  Private
const getBrandById = async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand) {
      return res.status(404).json({ message: 'Brand not found' });
    }
    res.json(brand);
  } catch (error) {
    console.error('Error fetching brand:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create a brand
// @route   POST /api/brands
// @access  Private
const createBrand = async (req, res) => {
  const { name, address, city, state, pincode, email, phone, mfgBy } = req.body;

  if (!name || !address || !city || !state || !pincode || !email || !phone) {
    return res.status(400).json({ message: 'Please provide all fields' });
  }

  try {
    const brand = new Brand({
      name,
      address,
      city,
      state,
      pincode,
      email,
      phone,
      mfgBy
    });

    const createdBrand = await brand.save();
    res.status(201).json(createdBrand);
  } catch (error) {
    console.error('Error creating brand:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update a brand
// @route   PUT /api/brands/:id
// @access  Private
const updateBrand = async (req, res) => {
  const { name, address, city, state, pincode, email, phone, mfgBy } = req.body;

  try {
    const brand = await Brand.findById(req.params.id);

    if (!brand) {
      return res.status(404).json({ message: 'Brand not found' });
    }

    brand.name = name || brand.name;
    brand.address = address || brand.address;
    brand.city = city || brand.city;
    brand.state = state || brand.state;
    brand.pincode = pincode || brand.pincode;
    brand.email = email || brand.email;
    brand.phone = phone || brand.phone;
    if (mfgBy !== undefined) {
      brand.mfgBy = mfgBy;
    }

    const updatedBrand = await brand.save();
    res.json(updatedBrand);
  } catch (error) {
    console.error('Error updating brand:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a brand
// @route   DELETE /api/brands/:id
// @access  Private
const deleteBrand = async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);

    if (!brand) {
      return res.status(404).json({ message: 'Brand not found' });
    }

    await Brand.deleteOne({ _id: req.params.id });
    res.json({ message: 'Brand removed' });
  } catch (error) {
    console.error('Error deleting brand:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getBrands,
  getBrandById,
  createBrand,
  updateBrand,
  deleteBrand,
};
