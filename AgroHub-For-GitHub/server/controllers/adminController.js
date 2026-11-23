const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');
const Machinery = require('../models/Machinery');
const Worker = require('../models/Worker');
const Expense = require('../models/Expense');
const Income = require('../models/Income');

/**
 * @desc    Get system-wide platform statistics for Admin Dashboard
 * @route   GET /api/admin/stats
 * @access  Private (Admin only)
 */
const getAdminStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalFarmers,
      totalBuyers,
      totalProducts,
      totalMachinery,
      totalWorkers,
      totalExpenses,
      totalIncomes,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'farmer' }),
      User.countDocuments({ role: 'buyer' }),
      Product.countDocuments(),
      Machinery.countDocuments(),
      Worker.countDocuments(),
      Expense.countDocuments(),
      Income.countDocuments(),
    ]);

    return res.status(200).json({
      status: 'success',
      data: {
        users: {
          total: totalUsers,
          farmers: totalFarmers,
          buyers: totalBuyers,
        },
        listings: {
          products: totalProducts,
          machinery: totalMachinery,
          workers: totalWorkers,
        },
        records: {
          expenses: totalExpenses,
          incomes: totalIncomes,
        },
      },
    });
  } catch (error) {
    console.error('[Admin Controller] Get Stats Error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Server error occurred while fetching admin platform statistics.',
    });
  }
};

/**
 * @desc    Get all registered users (excluding passwords)
 * @route   GET /api/admin/users
 * @access  Private (Admin only)
 */
const getAdminUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });

    return res.status(200).json({
      status: 'success',
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.error('[Admin Controller] Get Users Error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Server error occurred while fetching users list.',
    });
  }
};

/**
 * @desc    Delete a user account
 * @route   DELETE /api/admin/users/:id
 * @access  Private (Admin only)
 */
const deleteAdminUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid user ID format.',
      });
    }

    // Safety: Prevent admin from deleting their own active session
    if (id === req.user._id.toString()) {
      return res.status(400).json({
        status: 'fail',
        message: 'Security protection: You cannot delete your own active administrator account.',
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User account not found.',
      });
    }

    // Cascade clean user listings
    await Promise.all([
      Product.deleteMany({ farmer: id }),
      Machinery.deleteMany({ owner: id }),
      Worker.deleteMany({ owner: id }),
      Expense.deleteMany({ owner: id }),
      Income.deleteMany({ owner: id }),
      User.findByIdAndDelete(id),
    ]);

    return res.status(200).json({
      status: 'success',
      message: `User account "${user.name}" and associated records deleted successfully.`,
    });
  } catch (error) {
    console.error('[Admin Controller] Delete User Error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Server error occurred while deleting user.',
    });
  }
};

/**
 * @desc    Get all listings across modules for Admin moderation
 * @route   GET /api/admin/listings
 * @access  Private (Admin only)
 */
const getAdminListings = async (req, res) => {
  try {
    const [products, machinery, workers] = await Promise.all([
      Product.find().populate('farmer', 'name email phone').sort({ createdAt: -1 }),
      Machinery.find().populate('owner', 'name email phone').sort({ createdAt: -1 }),
      Worker.find().populate('owner', 'name email phone').sort({ createdAt: -1 }),
    ]);

    return res.status(200).json({
      status: 'success',
      data: {
        products,
        machinery,
        workers,
      },
    });
  } catch (error) {
    console.error('[Admin Controller] Get Listings Error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Server error occurred while fetching platform listings.',
    });
  }
};

/**
 * @desc    Delete any product listing (Admin moderation)
 * @route   DELETE /api/admin/products/:id
 * @access  Private (Admin only)
 */
const deleteAdminProduct = async (req, res) => {
  try {
    const { id } = req.params;
    await Product.findByIdAndDelete(id);
    return res.status(200).json({
      status: 'success',
      message: 'Product removed by administrator.',
    });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

/**
 * @desc    Delete any machinery listing (Admin moderation)
 * @route   DELETE /api/admin/machinery/:id
 * @access  Private (Admin only)
 */
const deleteAdminMachinery = async (req, res) => {
  try {
    const { id } = req.params;
    await Machinery.findByIdAndDelete(id);
    return res.status(200).json({
      status: 'success',
      message: 'Machinery listing removed by administrator.',
    });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

/**
 * @desc    Delete any worker profile (Admin moderation)
 * @route   DELETE /api/admin/workers/:id
 * @access  Private (Admin only)
 */
const deleteAdminWorker = async (req, res) => {
  try {
    const { id } = req.params;
    await Worker.findByIdAndDelete(id);
    return res.status(200).json({
      status: 'success',
      message: 'Worker profile removed by administrator.',
    });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

module.exports = {
  getAdminStats,
  getAdminUsers,
  deleteAdminUser,
  getAdminListings,
  deleteAdminProduct,
  deleteAdminMachinery,
  deleteAdminWorker,
};
