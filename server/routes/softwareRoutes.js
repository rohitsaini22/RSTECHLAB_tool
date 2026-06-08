const express = require('express');
const router = express.Router();
const Software = require('../models/Software');
const { protect, admin } = require('../middleware/authMiddleware');

// @desc    Fetch all software
// @route   GET /api/software
// @access  Public
router.get('/', async (req, res) => {
  try {
    const software = await Software.find({});
    res.json(software);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Create a software
// @route   POST /api/software
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
  const { name, version, description, category, priceMonthly, priceYearly, fileUrl, imageUrl } = req.body;

  try {
    const software = new Software({
      name,
      version,
      description,
      category,
      priceMonthly,
      priceYearly,
      fileUrl,
      imageUrl
    });

    const createdSoftware = await software.save();
    res.status(201).json(createdSoftware);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Delete software
// @route   DELETE /api/software/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const software = await Software.findById(req.params.id);

    if (software) {
      await software.remove();
      res.json({ message: 'Software removed' });
    } else {
      res.status(404).json({ message: 'Software not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;