const express = require('express');
const { suggestStock, generateLabelPDF } = require('../controllers/label.controller');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.use(protect);

router.get('/suggest', suggestStock);
router.post('/generate', generateLabelPDF);

module.exports = router;
