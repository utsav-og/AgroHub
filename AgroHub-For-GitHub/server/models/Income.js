const mongoose = require('mongoose');

// Schema definition for Farmer Crop Sales & Income Records
const incomeSchema = new mongoose.Schema(
  {
    cropName: {
      type: String,
      required: [true, 'Please provide the sold crop or produce name'],
      trim: true,
    },
    quantity: {
      type: Number,
      required: [true, 'Please provide the sold quantity'],
      min: [0, 'Quantity cannot be negative'],
    },
    unit: {
      type: String,
      required: [true, 'Please specify unit (e.g. quintal, kg, ton, bags)'],
      trim: true,
      default: 'quintal',
    },
    sellingPrice: {
      type: Number,
      required: [true, 'Please provide the total selling revenue / income in INR'],
      min: [0, 'Selling price cannot be negative'],
    },
    buyerName: {
      type: String,
      trim: true,
      default: 'Direct Market Buyer',
    },
    date: {
      type: Date,
      required: [true, 'Please specify the sale date'],
      default: Date.now,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Income record must be linked to a user account'],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Income', incomeSchema);
