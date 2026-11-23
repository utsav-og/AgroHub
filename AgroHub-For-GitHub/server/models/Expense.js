const mongoose = require('mongoose');

// Schema definition for Farm Expenses
const expenseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide an expense title or item name'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Please select an expense category'],
      enum: ['Seeds', 'Fertilizers', 'Pesticides', 'Labour', 'Machinery', 'Irrigation', 'Other'],
      default: 'Seeds',
    },
    amount: {
      type: Number,
      required: [true, 'Please provide the expense amount in INR'],
      min: [0, 'Expense amount cannot be negative'],
    },
    date: {
      type: Date,
      required: [true, 'Please provide the transaction date'],
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
      required: [true, 'Expense must be linked to a user account'],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Expense', expenseSchema);
