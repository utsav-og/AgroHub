const mongoose = require('mongoose');

// Schema definition for Farm Inventory Management
const inventorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide inventory item name'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Please select an inventory category'],
      enum: ['Seeds', 'Fertilizers', 'Pesticides', 'Equipment', 'Harvest', 'Other'],
      default: 'Seeds',
    },
    quantity: {
      type: Number,
      required: [true, 'Please provide the current stock quantity'],
      min: [0, 'Quantity cannot be negative'],
    },
    unit: {
      type: String,
      required: [true, 'Please provide measurement unit (e.g. kg, litre, bags, pieces)'],
      trim: true,
      default: 'kg',
    },
    minStockLevel: {
      type: Number,
      default: 5,
      min: [0, 'Minimum stock level cannot be negative'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Inventory item must belong to a user account'],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Inventory', inventorySchema);
