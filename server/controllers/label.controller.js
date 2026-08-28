const Stock = require('../models/stock');
const Brand = require('../models/brand');
const Category = require('../models/category');
const PDFDocument = require('pdfkit');
const bwipjs = require('bwip-js');

// Helper to generate barcode buffer using bwip-js
const generateBarcodeBuffer = (text) => {
  return new Promise((resolve, reject) => {
    bwipjs.toBuffer({
      bcid: 'code128',       // Code 128 barcode type
      text: text,            // The text to encode (Order ID)
      scale: 3,              // Scaling factor
      height: 10,            // Bar height in mm
      includetext: false,    // We will print the text below the barcode manually
    }, (err, png) => {
      if (err) reject(err);
      else resolve(png);
    });
  });
};

// @desc    Suggest stock items based on SKU or Product Name search
// @route   GET /api/labels/suggest
// @access  Private
const suggestStock = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.json([]);
    }

    const suggestions = await Stock.find({
      $or: [
        { sku: { $regex: q, $options: 'i' } },
        { productName: { $regex: q, $options: 'i' } }
      ]
    })
      .populate('brand')
      .populate('category')
      .limit(10);

    res.json(suggestions);
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Generate PDF Label (50mm x 90mm)
// @route   POST /api/labels/generate
// @access  Private
const generateLabelPDF = async (req, res) => {
  const { stockId, netQuantity, orderId, mfgDate } = req.body;

  if (!stockId || !netQuantity || !orderId) {
    return res.status(400).json({ message: 'Please provide stockId, netQuantity, and orderId' });
  }

  try {
    const stockItem = await Stock.findById(stockId)
      .populate('brand')
      .populate('category');

    if (!stockItem) {
      return res.status(404).json({ message: 'Stock item not found' });
    }

    const brand = stockItem.brand;
    const category = stockItem.category;

    // Generate Barcode PNG Buffer
    let barcodeBuffer;
    try {
      barcodeBuffer = await generateBarcodeBuffer(orderId);
    } catch (err) {
      console.error('Barcode generation failed:', err);
      return res.status(500).json({ message: 'Barcode generation failed' });
    }

    // Set page size for 50mm x 90mm label
    // 1 inch = 72 points, 1 inch = 25.4 mm
    // Width: 50mm = 50 * (72 / 25.4) = ~141.73 points
    // Height: 90mm = 90 * (72 / 25.4) = ~255.12 points
    const doc = new PDFDocument({
      size: [141.73, 255.12],
      margins: { top: 6, bottom: 6, left: 8, right: 8 }
    });

    // Pipe the PDF direct to the response
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=label-${orderId}.pdf`);
    doc.pipe(res);

    let currentY = 6;

    // Helper to draw a key-value row
    const drawRow = (key, value, y, keyWidth = 42) => {
      doc.font('Helvetica-Bold').fontSize(5.5).text(key, 8, y, { width: keyWidth });
      doc.font('Helvetica').fontSize(5.5).text(`:  ${value}`, 8 + keyWidth, y, { width: 141.73 - 16 - keyWidth });
      const keyHeight = doc.heightOfString(key, { width: keyWidth });
      const valHeight = doc.heightOfString(`:  ${value}`, { width: 141.73 - 16 - keyWidth });
      return Math.max(keyHeight, valHeight) + 1.5;
    };

    // MFG. Date format (default to current MM/YYYY if not provided)
    let finalMfgDate = mfgDate;
    if (!finalMfgDate) {
      const today = new Date();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const year = today.getFullYear();
      finalMfgDate = `${month}/${year}`;
    }

    // Draw Main Product Info
    currentY += drawRow('Category', category.name, currentY);
    currentY += drawRow('Product', stockItem.productName, currentY);
    currentY += drawRow('Brand', brand.name, currentY);
    currentY += drawRow('Net Quantity', netQuantity, currentY);
    currentY += drawRow('Size', stockItem.size || '', currentY);
    currentY += drawRow('Colour', stockItem.color || '', currentY);
    currentY += drawRow('MFG. Date', finalMfgDate, currentY);
    currentY += drawRow('SKU', stockItem.sku, currentY);

    // M.R.P. Row with custom bolding
    doc.font('Helvetica-Bold').fontSize(5.5).text('M.R.P', 8, currentY, { width: 42 });
    doc.font('Helvetica-Bold').fontSize(6).text(`:  Rs.${stockItem.mrp}/-`, 8 + 42, currentY, { continued: true });
    doc.font('Helvetica').fontSize(4.5).text(' (Inclusive of all Taxes)');
    currentY += 8;

    // Spacer before barcode
    currentY += 3;

    // Draw Barcode Image
    const barcodeWidth = 110;
    const barcodeHeight = 22;
    const barcodeX = (141.73 - barcodeWidth) / 2;
    doc.image(barcodeBuffer, barcodeX, currentY, { width: barcodeWidth, height: barcodeHeight });
    currentY += barcodeHeight + 2;

    // Draw Barcode Text (Order ID)
    doc.font('Helvetica').fontSize(6).text(orderId, 8, currentY, { align: 'center', width: 141.73 - 16 });
    currentY += 8;

    // Horizontal Divider Line
    doc.moveTo(8, currentY).lineTo(141.73 - 8, currentY).lineWidth(0.5).strokeColor('#000000').stroke();
    currentY += 4;

    // Draw Manufactured & Consumer Service Info
    const addressStr = `${brand.address}, ${brand.city}, ${brand.state} - ${brand.pincode}`;

    // Manufactured By
    doc.font('Helvetica-Bold').fontSize(5).text('Manufactured By', 8, currentY, { width: 141.73 - 16 });
    currentY += 6.5;
    doc.font('Helvetica').fontSize(4.5).text(addressStr, 8, currentY, { width: 141.73 - 16 });
    currentY += doc.heightOfString(addressStr, { width: 141.73 - 16 }) + 2;

    // Consumer Service Contact
    doc.font('Helvetica-Bold').fontSize(5).text('Consumer Service Contact', 8, currentY, { width: 141.73 - 16 });
    currentY += 6.5;
    doc.font('Helvetica-Bold').fontSize(4.5).text(brand.name, 8, currentY, { width: 141.73 - 16 });
    currentY += 5.5;
    doc.font('Helvetica').fontSize(4.5).text(addressStr, 8, currentY, { width: 141.73 - 16 });
    currentY += doc.heightOfString(addressStr, { width: 141.73 - 16 }) + 1.5;
    
    // Phone & Email
    doc.font('Helvetica').fontSize(4.5).text(`Phone No. ${brand.phone}`, 8, currentY, { width: 141.73 - 16 });
    currentY += 5.5;
    doc.font('Helvetica').fontSize(4.5).text(`E-mail : ${brand.email}`, 8, currentY, { width: 141.73 - 16 });

    // End Document
    doc.end();

  } catch (error) {
    console.error('Error generating PDF label:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  suggestStock,
  generateLabelPDF,
};
