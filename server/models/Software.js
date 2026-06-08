const mongoose = require('mongoose');

const softwareSchema = mongoose.Schema({
  name: { type: String, required: true },
  version: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  priceMonthly: { type: Number, required: true },
  priceYearly: { type: Number, required: true },
  fileUrl: { type: String, required: true }, // URL to secure S3 bucket or internal storage
  imageUrl: { type: String, required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Software', softwareSchema);