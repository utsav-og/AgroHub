const mongoose = require('mongoose');
const Expense = require('../models/Expense');

/**
 * @desc    Get all expenses for the authenticated user (with category, date & search filters)
 * @route   GET /api/expenses
 * @access  Private
 */
const getExpenses = async (req, res) => {
  try {
    const { category, search, startDate, endDate } = req.query;

    // Strict ownership: users can only see their own expenses
    const filter = { owner: req.user._id };

    // Category filter
    if (category && category !== 'All') {
      filter.category = category;
    }

    // Date range filter
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) {
        filter.date.$gte = new Date(startDate);
      }
      if (endDate) {
        // Set to end of day
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.date.$lte = end;
      }
    }

    // Keyword search
    if (search && search.trim() !== '') {
      const regex = new RegExp(search.trim(), 'i');
      filter.$or = [{ title: regex }, { description: regex }];
    }

    const expenses = await Expense.find(filter).sort({ date: -1, createdAt: -1 });

    return res.status(200).json({
      status: 'success',
      count: expenses.length,
      data: expenses,
    });
  } catch (error) {
    console.error('[Expense Controller] Get Expenses Error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Server error occurred while fetching expenses.',
    });
  }
};

/**
 * @desc    Get expense summary (total spent & category-wise breakdown)
 * @route   GET /api/expenses/summary
 * @access  Private
 */
const getExpenseSummary = async (req, res) => {
  try {
    const expenses = await Expense.find({ owner: req.user._id });

    let totalAmount = 0;
    const categoryTotals = {
      Seeds: 0,
      Fertilizers: 0,
      Pesticides: 0,
      Labour: 0,
      Machinery: 0,
      Irrigation: 0,
      Other: 0,
    };

    expenses.forEach((item) => {
      totalAmount += item.amount;
      if (categoryTotals[item.category] !== undefined) {
        categoryTotals[item.category] += item.amount;
      } else {
        categoryTotals.Other += item.amount;
      }
    });

    // Find highest spending category
    let topCategory = 'None';
    let maxSpent = 0;
    Object.entries(categoryTotals).forEach(([cat, spent]) => {
      if (spent > maxSpent) {
        maxSpent = spent;
        topCategory = cat;
      }
    });

    return res.status(200).json({
      status: 'success',
      data: {
        totalAmount,
        totalTransactions: expenses.length,
        topCategory,
        categoryTotals,
      },
    });
  } catch (error) {
    console.error('[Expense Controller] Get Expense Summary Error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Server error occurred while generating expense summary.',
    });
  }
};

/**
 * @desc    Get single expense by ID
 * @route   GET /api/expenses/:id
 * @access  Private
 */
const getExpenseById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid expense ID format.',
      });
    }

    const expense = await Expense.findById(id);

    if (!expense) {
      return res.status(404).json({
        status: 'fail',
        message: 'Expense record not found.',
      });
    }

    // Ownership check
    if (expense.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'fail',
        message: 'Not authorized: You can only view your own expense records.',
      });
    }

    return res.status(200).json({
      status: 'success',
      data: expense,
    });
  } catch (error) {
    console.error('[Expense Controller] Get Expense By ID Error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Server error occurred while fetching expense record.',
    });
  }
};

/**
 * @desc    Create a new expense entry
 * @route   POST /api/expenses
 * @access  Private
 */
const createExpense = async (req, res) => {
  try {
    const { title, category, amount, date, description } = req.body;

    if (!title || title.trim() === '' || amount === undefined || amount === '') {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide expense title and amount.',
      });
    }

    if (Number(amount) < 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'Expense amount cannot be negative.',
      });
    }

    const validCategories = ['Seeds', 'Fertilizers', 'Pesticides', 'Labour', 'Machinery', 'Irrigation', 'Other'];
    const expenseCategory = category || 'Other';
    if (!validCategories.includes(expenseCategory)) {
      return res.status(400).json({
        status: 'fail',
        message: `Invalid category. Permitted categories are: ${validCategories.join(', ')}`,
      });
    }

    const expense = await Expense.create({
      title: title.trim(),
      category: expenseCategory,
      amount: Number(amount),
      date: date ? new Date(date) : new Date(),
      description: description ? description.trim() : '',
      owner: req.user._id,
    });

    return res.status(201).json({
      status: 'success',
      message: 'Expense recorded successfully.',
      data: expense,
    });
  } catch (error) {
    console.error('[Expense Controller] Create Expense Error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Server error occurred while recording expense.',
    });
  }
};

/**
 * @desc    Update an expense entry
 * @route   PUT /api/expenses/:id
 * @access  Private
 */
const updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, category, amount, date, description } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid expense ID format.',
      });
    }

    const expense = await Expense.findById(id);

    if (!expense) {
      return res.status(404).json({
        status: 'fail',
        message: 'Expense record not found.',
      });
    }

    // Ownership check
    if (expense.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'fail',
        message: 'Not authorized: You can only edit your own expenses.',
      });
    }

    if (amount !== undefined && Number(amount) < 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'Expense amount cannot be negative.',
      });
    }

    if (title) expense.title = title.trim();
    if (category) expense.category = category;
    if (amount !== undefined) expense.amount = Number(amount);
    if (date) expense.date = new Date(date);
    if (description !== undefined) expense.description = description.trim();

    await expense.save();

    return res.status(200).json({
      status: 'success',
      message: 'Expense updated successfully.',
      data: expense,
    });
  } catch (error) {
    console.error('[Expense Controller] Update Expense Error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Server error occurred while updating expense.',
    });
  }
};

/**
 * @desc    Delete an expense entry
 * @route   DELETE /api/expenses/:id
 * @access  Private
 */
const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid expense ID format.',
      });
    }

    const expense = await Expense.findById(id);

    if (!expense) {
      return res.status(404).json({
        status: 'fail',
        message: 'Expense record not found.',
      });
    }

    // Ownership check
    if (expense.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'fail',
        message: 'Not authorized: You can only delete your own expenses.',
      });
    }

    await Expense.findByIdAndDelete(id);

    return res.status(200).json({
      status: 'success',
      message: 'Expense record deleted successfully.',
    });
  } catch (error) {
    console.error('[Expense Controller] Delete Expense Error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Server error occurred while deleting expense.',
    });
  }
};

module.exports = {
  getExpenses,
  getExpenseSummary,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
};
