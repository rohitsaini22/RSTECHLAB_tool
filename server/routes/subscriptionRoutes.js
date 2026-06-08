const express = require('express');
const router = express.Router();
const Subscription = require('../models/Subscription');
const License = require('../models/License');
const Software = require('../models/Software');
const { protect } = require('../middleware/authMiddleware');

const generateLicenseKey = () => {
  return `${Math.random().toString(36).substr(2, 5).toUpperCase()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
};

// @desc    Create a new subscription
// @route   POST /api/subscriptions
// @access  Private
router.post('/', protect, async (req, res) => {
  const { softwareId, plan } = req.body;

  try {
    const software = await Software.findById(softwareId);
    if (!software) {
      return res.status(404).json({ message: 'Software not found' });
    }

    const now = new Date();
    const endDate = new Date();
    if (plan === 'MONTHLY') {
      endDate.setMonth(endDate.getMonth() + 1);
    } else {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    // 1. Create Subscription
    const subscription = await Subscription.create({
      user: req.user._id,
      software: softwareId,
      plan,
      startDate: now,
      endDate: endDate,
      amountPaid: plan === 'MONTHLY' ? software.priceMonthly : software.priceYearly,
      status: 'ACTIVE'
    });

    // 2. Generate License
    const license = await License.create({
      key: generateLicenseKey(),
      user: req.user._id,
      software: softwareId,
      subscription: subscription._id,
      expiryDate: endDate,
      isActive: true
    });

    res.status(201).json({ subscription, license });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get logged in user licenses
// @route   GET /api/subscriptions/mylicenses
// @access  Private
router.get('/mylicenses', protect, async (req, res) => {
  try {
    // Return licenses populated with software details
    const licenses = await License.find({ user: req.user._id })
      .populate('software')
      .sort({ createdAt: -1 });
      
    res.json(licenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Verify license (Example for desktop app)
// @route   POST /api/subscriptions/verify
// @access  Public
router.post('/verify', async (req, res) => {
  const { licenseKey } = req.body;
  try {
    const license = await License.findOne({ key: licenseKey });
    
    if (license && license.isActive && new Date(license.expiryDate) > new Date()) {
      res.json({ valid: true, expiry: license.expiryDate });
    } else {
      res.status(400).json({ valid: false, message: 'Invalid or expired license' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;