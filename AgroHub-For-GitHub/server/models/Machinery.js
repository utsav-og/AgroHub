const mongoose = require('mongoose');

// Schema definition for Agricultural Machinery and Equipment Rental
const machinerySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide the machinery/equipment name'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Please select a machinery category'],
      enum: ['Tractor', 'Harvester', 'Tillage', 'Seeding', 'Irrigation', 'Sprayer', 'Other'],
      default: 'Tractor',
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    rentalPricePerDay: {
      type: Number,
      required: [true, 'Please provide rental price per day in INR'],
      min: [0, 'Rental price cannot be negative'],
    },
    location: {
      type: String,
      trim: true,
      default: '',
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Machinery must have an associated owner'],
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    imageUrl: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Machinery', machinerySchema);
