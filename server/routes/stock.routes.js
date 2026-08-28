const express = require('express');
const { getStock, getStockById, createStock, updateStock, deleteStock } = require('../controllers/stock.controller');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.use(protect);

router.route('/')
  .get(getStock)
  .post(createStock);

router.route('/:id')
  .get(getStockById)
  .put(updateStock)
  .delete(deleteStock);

module.exports = router;
