const Report = require('../models/Report');
const Product = require('../models/Product');

const submitReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, customReason } = req.body;
    const reportedBy = req.user.id;

    // Check if product exists
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Create the report
    const report = new Report({
      product: id,
      reportedBy,
      reason,
      customReason: customReason || '',
    });

    await report.save();

    res.status(201).json({ message: 'Report submitted successfully' });
  } catch (error) {
    console.error('Error submitting report:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { submitReport };
