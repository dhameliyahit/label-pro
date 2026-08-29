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

    // Centralized Layout and Typography Configuration
    let config = {
      fontFamily: {
        bold: 'Helvetica-Bold',
        regular: 'Helvetica'
      },
      fontSize: {
        mainKey: 7.0,
        mainValue: 7.0,
        mrpKey: 7.0,
        mrpValue: 7.0,
        mrpTaxes: 5.2,
        barcodeText: 7.0,
        header: 6.5,
        details: 5.5
      },
      width: {
        keyCol: 44, // Default key column width for 7.0 fontSize
        barcode: 110,
        fullWidth: 141.73 - 16
      },
      height: {
        barcode: 22
      },
      spacing: {
        rowGap: 1.5,
        mrpTotal: 15,
        beforeBarcode: 6,
        belowBarcode: 5,
        belowBarcodeText: 6,
        belowDivider: 6,
        belowHeader: 7.5,
        belowConsumerBrand: 6.5,
        belowMfgSection: 8,
        belowConsumerSection: 6,
        contactGap: 6.5
      }
    };

    const addressStr = `${brand.address}, ${brand.city}, ${brand.state} - ${brand.pincode}`;

    // Helper to dynamically estimate total height of rendering content
    const estimateHeight = (cfg) => {
      let h = 6; // start top margin

      const getRowHeight = (key, val) => {
        const keyHeight = doc.font(cfg.fontFamily.bold).fontSize(cfg.fontSize.mainKey).heightOfString(key, { width: cfg.width.keyCol });
        const valHeight = doc.font(cfg.fontFamily.regular).fontSize(cfg.fontSize.mainValue).heightOfString(`:  ${val}`, { width: cfg.width.fullWidth - cfg.width.keyCol });
        return Math.max(keyHeight, valHeight) + cfg.spacing.rowGap;
      };

      if (category && category.name) h += getRowHeight('Category', category.name);
      h += getRowHeight('Product', stockItem.productName);
      h += getRowHeight('Brand', brand.name);
      h += getRowHeight('Net Quantity', netQuantity);
      h += getRowHeight('Size', stockItem.size || '');
      h += getRowHeight('Colour', stockItem.color || '');
      h += getRowHeight('MFG. Date', finalMfgDate);
      h += getRowHeight('SKU', stockItem.sku);

      // MRP section height
      h += cfg.spacing.mrpTotal;

      // Barcode height
      h += cfg.spacing.beforeBarcode + cfg.height.barcode + cfg.spacing.belowBarcode;
      
      // Barcode text height
      h += doc.font(cfg.fontFamily.regular).fontSize(cfg.fontSize.barcodeText).heightOfString(orderId, { width: cfg.width.fullWidth });
      h += cfg.spacing.belowBarcodeText;

      // Divider line space
      h += cfg.spacing.belowDivider;

      // Manufactured By space
      h += cfg.spacing.belowHeader;
      h += doc.font(cfg.fontFamily.regular).fontSize(cfg.fontSize.details).heightOfString(addressStr, { width: cfg.width.fullWidth });
      h += cfg.spacing.belowMfgSection;

      // Consumer Service Contact space
      h += cfg.spacing.belowHeader;
      h += doc.font(cfg.fontFamily.bold).fontSize(cfg.fontSize.mrpValue).heightOfString(brand.name, { width: cfg.width.fullWidth });
      h += cfg.spacing.belowConsumerBrand;
      h += doc.font(cfg.fontFamily.regular).fontSize(cfg.fontSize.details).heightOfString(addressStr, { width: cfg.width.fullWidth });
      h += cfg.spacing.belowConsumerSection;

      // Phone & Email contact detail space
      h += doc.font(cfg.fontFamily.regular).fontSize(cfg.fontSize.details).heightOfString(`Phone No. : ${brand.phone}`, { width: cfg.width.fullWidth });
      h += cfg.spacing.contactGap;
      h += doc.font(cfg.fontFamily.regular).fontSize(cfg.fontSize.details).heightOfString(`E-mail : ${brand.email}`, { width: cfg.width.fullWidth });
      h += cfg.spacing.contactGap;

      return h;
    };

    // MFG. Date format (default to current MM/YYYY if not provided)
    let finalMfgDate = mfgDate;
    if (!finalMfgDate) {
      const today = new Date();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const year = today.getFullYear();
      finalMfgDate = `${month}/${year}`;
    }

    // Dynamic Font Scaling: shrink fonts if content height exceeds the printable area (243.12 pt)
    let estimated = estimateHeight(config);
    let scalePasses = 0;
    while (estimated > 243.12 && config.fontSize.mainKey > 5.5 && scalePasses < 3) {
      config.fontSize.mainKey -= 0.5;
      config.fontSize.mainValue -= 0.5;
      config.fontSize.header -= 0.5;
      config.fontSize.details -= 0.5;
      // Adjust keyCol width dynamically to avoid empty space for smaller fonts
      config.width.keyCol = config.fontSize.mainKey <= 6.0 ? 38 : 44;
      estimated = estimateHeight(config);
      scalePasses++;
    }

    // Dynamic Spacing Distribution: allocate remaining vertical space to fill the page gaps nicely
    const maxPrintableHeight = 243.12;
    const remainingSpace = maxPrintableHeight - estimated;
    if (remainingSpace > 0) {
      const distributedGap = remainingSpace / 5;
      config.spacing.beforeBarcode += distributedGap;
      config.spacing.belowBarcodeText += distributedGap;
      config.spacing.belowDivider += distributedGap;
      config.spacing.belowMfgSection += distributedGap;
      config.spacing.belowConsumerSection += distributedGap;
    }

    // Draw Outer Card/Label Border outline (0.75 points)
    doc.rect(4, 4, 141.73 - 8, 255.12 - 8).lineWidth(0.75).strokeColor('#000000').stroke();

    // Helper to draw a key-value row
    const drawRow = (key, value, y) => {
      doc.font(config.fontFamily.bold).fontSize(config.fontSize.mainKey).text(key, 8, y, { width: config.width.keyCol });
      doc.font(config.fontFamily.regular).fontSize(config.fontSize.mainValue).text(`:  ${value}`, 8 + config.width.keyCol, y, { width: config.width.fullWidth - config.width.keyCol });
      const keyHeight = doc.font(config.fontFamily.bold).fontSize(config.fontSize.mainKey).heightOfString(key, { width: config.width.keyCol });
      const valHeight = doc.font(config.fontFamily.regular).fontSize(config.fontSize.mainValue).heightOfString(`:  ${value}`, { width: config.width.fullWidth - config.width.keyCol });
      return Math.max(keyHeight, valHeight) + config.spacing.rowGap;
    };

    // Draw Main Product Info
    if (category && category.name) {
      currentY += drawRow('Category', category.name, currentY);
    }
    currentY += drawRow('Product', stockItem.productName, currentY);
    currentY += drawRow('Brand', brand.name, currentY);
    currentY += drawRow('Net Quantity', netQuantity, currentY);
    currentY += drawRow('Size', stockItem.size || '', currentY);
    currentY += drawRow('Colour', stockItem.color || '', currentY);
    currentY += drawRow('MFG. Date', finalMfgDate, currentY);
    currentY += drawRow('SKU', stockItem.sku, currentY);

    // M.R.P. Row with custom bolding and separate taxes line
    doc.font(config.fontFamily.bold).fontSize(config.fontSize.mrpKey).text('M.R.P', 8, currentY, { width: config.width.keyCol });
    doc.font(config.fontFamily.bold).fontSize(config.fontSize.mrpValue).text(`:  Rs.${stockItem.mrp}/-`, 8 + config.width.keyCol, currentY);
    doc.font(config.fontFamily.regular).fontSize(config.fontSize.mrpTaxes).text('(Inclusive of all Taxes)', 8 + config.width.keyCol, currentY + config.fontSize.mrpKey + 1.0);
    currentY += config.spacing.mrpTotal;

    // Spacer before barcode
    currentY += config.spacing.beforeBarcode;

    // Draw Barcode Image
    const barcodeX = (141.73 - config.width.barcode) / 2;
    doc.image(barcodeBuffer, barcodeX, currentY, { width: config.width.barcode, height: config.height.barcode });
    currentY += config.height.barcode + config.spacing.belowBarcode;

    // Draw Barcode Text (Order ID)
    doc.font(config.fontFamily.regular).fontSize(config.fontSize.barcodeText).text(orderId, 8, currentY, { align: 'center', width: config.width.fullWidth });
    currentY += config.spacing.belowBarcodeText;

    // Horizontal Divider Line
    doc.moveTo(8, currentY).lineTo(141.73 - 8, currentY).lineWidth(0.5).strokeColor('#000000').stroke();
    currentY += config.spacing.belowDivider;

    // Manufactured By
    doc.font(config.fontFamily.bold).fontSize(config.fontSize.header).text('Manufactured By :', 8, currentY, { width: config.width.fullWidth });
    currentY += config.spacing.belowHeader;
    doc.font(config.fontFamily.regular).fontSize(config.fontSize.details).text(addressStr, 8, currentY, { width: config.width.fullWidth });
    currentY += doc.heightOfString(addressStr, { width: config.width.fullWidth }) + config.spacing.belowMfgSection;

    // Lighter Horizontal Divider Line between Manufactured By and Consumer Service Contact
    doc.moveTo(8, currentY - config.spacing.belowMfgSection / 2)
       .lineTo(141.73 - 8, currentY - config.spacing.belowMfgSection / 2)
       .lineWidth(0.3)
       .strokeColor('#cccccc')
       .stroke();

    // Consumer Service Contact
    doc.font(config.fontFamily.bold).fontSize(config.fontSize.header).text('Consumer Service Contact :', 8, currentY, { width: config.width.fullWidth });
    currentY += config.spacing.belowHeader;
    doc.font(config.fontFamily.bold).fontSize(config.fontSize.mrpValue).text(brand.name, 8, currentY, { width: config.width.fullWidth });
    currentY += config.spacing.belowConsumerBrand;
    doc.font(config.fontFamily.regular).fontSize(config.fontSize.details).text(addressStr, 8, currentY, { width: config.width.fullWidth });
    currentY += doc.heightOfString(addressStr, { width: config.width.fullWidth }) + config.spacing.belowConsumerSection;
    
    // Phone & Email with colons
    doc.font(config.fontFamily.regular).fontSize(config.fontSize.details).text(`Phone No. : ${brand.phone}`, 8, currentY, { width: config.width.fullWidth });
    currentY += config.spacing.contactGap;
    doc.font(config.fontFamily.regular).fontSize(config.fontSize.details).text(`E-mail : ${brand.email}`, 8, currentY, { width: config.width.fullWidth });

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
