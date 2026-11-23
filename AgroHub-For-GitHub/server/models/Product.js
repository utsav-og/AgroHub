const mongoose = require('mongoose');

// Schema definition for AgroHub agricultural products and crops
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide product/crop name'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      enum: ['Grains', 'Vegetables', 'Fruits', 'Pulses', 'Seeds', 'Fertilizers', 'Other'],
      default: 'Grains',
    },
    price: {
      type: Number,
      required: [true, 'Please provide price per unit'],
      min: [0, 'Price cannot be negative'],
    },
    quantity: {
      type: Number,
      required: [true, 'Please provide available quantity'],
      min: [0, 'Quantity cannot be negative'],
    },
    unit: {
      type: String,
      enum: ['kg', 'quintal', 'ton', 'box', 'piece'],
      default: 'kg',
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    location: {
      type: String,
      trim: true,
      default: '',
    },
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      // Optional for now until authentication is fully plugged in
    },
    imageUrl: {
      type: String,
      default: '',
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Product', productSchema);
