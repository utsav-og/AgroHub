const mongoose = require('mongoose');
const Income = require('../models/Income');
const Expense = require('../models/Expense');

/**
 * @desc    Get all crop sales income records for the authenticated user
 * @route   GET /api/income
 * @access  Private
 */
const getIncomes = async (req, res) => {
  try {
    const { search, startDate, endDate } = req.query;

    const filter = { owner: req.user._id };

    if (search && search.trim() !== '') {
      const regex = new RegExp(search.trim(), 'i');
      filter.$or = [{ cropName: regex }, { buyerName: regex }, { description: regex }];
    }

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.date.$lte = end;
      }
    }

    const incomes = await Income.find(filter).sort({ date: -1, createdAt: -1 });

    return res.status(200).json({
      status: 'success',
      count: incomes.length,
      data: incomes,
    });
  } catch (error) {
    console.error('[Income Controller] Get Incomes Error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Server error occurred while fetching income records.',
    });
  }
};

/**
 * @desc    Generate comprehensive Financial & Profitability Report (Income vs Expense)
 * @route   GET /api/income/financial-report
 * @access  Private
 */
const getFinancialReport = async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch user's incomes and expenses in parallel
    const [incomes, expenses] = await Promise.all([
      Income.find({ owner: userId }),
      Expense.find({ owner: userId }),
    ]);

    let totalIncome = 0;
    const cropIncomeMap = {};
    const monthlyData = {};

    incomes.forEach((item) => {
      totalIncome += item.sellingPrice;

      // Crop income breakdown
      const crop = item.cropName || 'Other Crop';
      cropIncomeMap[crop] = (cropIncomeMap[crop] || 0) + item.sellingPrice;

      // Monthly aggregation
      const monthKey = new Date(item.date).toISOString().substring(0, 7); // YYYY-MM
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { month: monthKey, income: 0, expenses: 0, profit: 0 };
      }
      monthlyData[monthKey].income += item.sellingPrice;
    });

    let totalExpenses = 0;
    const expenseCategoryMap = {};

    expenses.forEach((item) => {
      totalExpenses += item.amount;

      // Expense category breakdown
      const cat = item.category || 'Other';
      expenseCategoryMap[cat] = (expenseCategoryMap[cat] || 0) + item.amount;

      // Monthly aggregation
      const monthKey = new Date(item.date).toISOString().substring(0, 7);
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { month: monthKey, income: 0, expenses: 0, profit: 0 };
      }
      monthlyData[monthKey].expenses += item.amount;
    });

    // Calculate monthly profit
    Object.values(monthlyData).forEach((m) => {
      m.profit = m.income - m.expenses;
    });

    const netProfit = totalIncome - totalExpenses;
    const profitMargin = totalIncome > 0 ? Math.round((netProfit / totalIncome) * 1000) / 10 : 0;

    return res.status(200).json({
      status: 'success',
      data: {
        totalIncome,
        totalExpenses,
        netProfit,
        profitMargin,
        isProfitable: netProfit >= 0,
        totalSalesCount: incomes.length,
        totalExpenseCount: expenses.length,
        cropIncomeMap,
        expenseCategoryMap,
        monthlyTrend: Object.values(monthlyData).sort((a, b) => b.month.localeCompare(a.month)),
      },
    });
  } catch (error) {
    console.error('[Income Controller] Financial Report Error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Server error occurred while compiling financial profit report.',
    });
  }
};

/**
 * @desc    Get single income record by ID
 * @route   GET /api/income/:id
 * @access  Private
 */
const getIncomeById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid income record ID format.',
      });
    }

    const income = await Income.findById(id);

    if (!income) {
      return res.status(404).json({
        status: 'fail',
        message: 'Income record not found.',
      });
    }

    if (income.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'fail',
        message: 'Not authorized: You can only view your own crop sales income records.',
      });
    }

    return res.status(200).json({
      status: 'success',
      data: income,
    });
  } catch (error) {
    console.error('[Income Controller] Get Income By ID Error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Server error occurred while fetching income record.',
    });
  }
};

/**
 * @desc    Record a new crop sale income entry
 * @route   POST /api/income
 * @access  Private
 */
const createIncome = async (req, res) => {
  try {
    const { cropName, quantity, unit, sellingPrice, buyerName, date, description } = req.body;

    if (!cropName || cropName.trim() === '' || sellingPrice === undefined || sellingPrice === '') {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide crop name and total selling income.',
      });
    }

    if (Number(sellingPrice) < 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'Selling price cannot be negative.',
      });
    }

    if (quantity !== undefined && Number(quantity) < 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'Quantity cannot be negative.',
      });
    }

    const income = await Income.create({
      cropName: cropName.trim(),
      quantity: quantity !== undefined ? Number(quantity) : 1,
      unit: unit ? unit.trim() : 'quintal',
      sellingPrice: Number(sellingPrice),
      buyerName: buyerName ? buyerName.trim() : 'Direct Market Buyer',
      date: date ? new Date(date) : new Date(),
      description: description ? description.trim() : '',
      owner: req.user._id,
    });

    return res.status(201).json({
      status: 'success',
      message: 'Crop sale income recorded successfully.',
      data: income,
    });
  } catch (error) {
    console.error('[Income Controller] Create Income Error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Server error occurred while recording income.',
    });
  }
};

/**
 * @desc    Update a crop sale income entry
 * @route   PUT /api/income/:id
 * @access  Private
 */
const updateIncome = async (req, res) => {
  try {
    const { id } = req.params;
    const { cropName, quantity, unit, sellingPrice, buyerName, date, description } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid income ID format.',
      });
    }

    const income = await Income.findById(id);

    if (!income) {
      return res.status(404).json({
        status: 'fail',
        message: 'Income record not found.',
      });
    }

    if (income.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'fail',
        message: 'Not authorized: You can only update your own income entries.',
      });
    }

    if (cropName) income.cropName = cropName.trim();
    if (quantity !== undefined) income.quantity = Number(quantity);
    if (unit) income.unit = unit.trim();
    if (sellingPrice !== undefined) income.sellingPrice = Number(sellingPrice);
    if (buyerName !== undefined) income.buyerName = buyerName.trim();
    if (date) income.date = new Date(date);
    if (description !== undefined) income.description = description.trim();

    await income.save();

    return res.status(200).json({
      status: 'success',
      message: 'Crop sale income updated successfully.',
      data: income,
    });
  } catch (error) {
    console.error('[Income Controller] Update Income Error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Server error occurred while updating income.',
    });
  }
};

/**
 * @desc    Delete a crop sale income entry
 * @route   DELETE /api/income/:id
 * @access  Private
 */
const deleteIncome = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid income ID format.',
      });
    }

    const income = await Income.findById(id);

    if (!income) {
      return res.status(404).json({
        status: 'fail',
        message: 'Income record not found.',
      });
    }

    if (income.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'fail',
        message: 'Not authorized: You can only delete your own income entries.',
      });
    }

    await Income.findByIdAndDelete(id);

    return res.status(200).json({
      status: 'success',
      message: 'Crop sale income record deleted successfully.',
    });
  } catch (error) {
    console.error('[Income Controller] Delete Income Error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Server error occurred while deleting income record.',
    });
  }
};

module.exports = {
  getIncomes,
  getFinancialReport,
  getIncomeById,
  createIncome,
  updateIncome,
  deleteIncome,
};
