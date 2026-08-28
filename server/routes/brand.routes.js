const express = require('express');
const { getBrands, getBrandById, createBrand, updateBrand, deleteBrand } = require('../controllers/brand.controller');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.use(protect);

router.route('/')
  .get(getBrands)
  .post(createBrand);

router.route('/:id')
  .get(getBrandById)
  .put(updateBrand)
  .delete(deleteBrand);

module.exports = router;
