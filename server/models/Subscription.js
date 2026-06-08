const mongoose = require('mongoose');

const subscriptionSchema = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  software: { type: mongoose.Schema.Types.ObjectId, ref: 'Software', required: true },
  plan: { 
    type: String, 
    enum: ['MONTHLY', 'YEARLY'], 
    required: true 
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'EXPIRED', 'CANCELLED'],
    default: 'ACTIVE'
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  amountPaid: { type: Number, required: true },
  paymentId: { type: String } // Reference to Stripe/Razorpay payment ID
}, { timestamps: true });

module.exports = mongoose.model('Subscription', subscriptionSchema);