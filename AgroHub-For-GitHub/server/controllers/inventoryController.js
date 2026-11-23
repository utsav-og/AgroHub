const mongoose = require('mongoose');
const Inventory = require('../models/Inventory');

/**
 * @desc    Get all inventory items for authenticated user (with category, search & lowStock filters)
 * @route   GET /api/inventory
 * @access  Private
 */
const getInventory = async (req, res) => {
  try {
    const { category, search, lowStock } = req.query;

    const filter = { owner: req.user._id };

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (search && search.trim() !== '') {
      const regex = new RegExp(search.trim(), 'i');
      filter.$or = [{ name: regex }, { description: regex }];
    }

    // Filter for low stock items where quantity <= minStockLevel
    if (lowStock === 'true') {
      filter.$expr = { $lte: ['$quantity', '$minStockLevel'] };
    }

    const items = await Inventory.find(filter).sort({ updatedAt: -1 });

    return res.status(200).json({
      status: 'success',
      count: items.length,
      data: items,
    });
  } catch (error) {
    console.error('[Inventory Controller] Get Inventory Error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Server error occurred while fetching inventory items.',
    });
  }
};

/**
 * @desc    Get inventory summary statistics (total items, low stock alerts count, categories count)
 * @route   GET /api/inventory/summary
 * @access  Private
 */
const getInventorySummary = async (req, res) => {
  try {
    const items = await Inventory.find({ owner: req.user._id });

    let lowStockCount = 0;
    const categoriesSet = new Set();

    items.forEach((item) => {
      categoriesSet.add(item.category);
      if (item.quantity <= item.minStockLevel) {
        lowStockCount++;
      }
    });

    return res.status(200).json({
      status: 'success',
      data: {
        totalItems: items.length,
        lowStockCount,
        totalCategories: categoriesSet.size,
      },
    });
  } catch (error) {
    console.error('[Inventory Controller] Get Inventory Summary Error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Server error occurred while generating inventory summary.',
    });
  }
};

/**
 * @desc    Get single inventory item by ID
 * @route   GET /api/inventory/:id
 * @access  Private
 */
const getInventoryById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid inventory ID format.',
      });
    }

    const item = await Inventory.findById(id);

    if (!item) {
      return res.status(404).json({
        status: 'fail',
        message: 'Inventory item not found.',
      });
    }

    if (item.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'fail',
        message: 'Not authorized: You can only view your own inventory.',
      });
    }

    return res.status(200).json({
      status: 'success',
      data: item,
    });
  } catch (error) {
    console.error('[Inventory Controller] Get Inventory By ID Error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Server error occurred while fetching inventory item.',
    });
  }
};

/**
 * @desc    Create a new inventory item
 * @route   POST /api/inventory
 * @access  Private
 */
const createInventory = async (req, res) => {
  try {
    const { name, category, quantity, unit, minStockLevel, description } = req.body;

    if (!name || name.trim() === '' || quantity === undefined || quantity === '') {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide item name and quantity.',
      });
    }

    if (Number(quantity) < 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'Quantity cannot be negative.',
      });
    }

    const validCategories = ['Seeds', 'Fertilizers', 'Pesticides', 'Equipment', 'Harvest', 'Other'];
    const itemCategory = category || 'Seeds';
    if (!validCategories.includes(itemCategory)) {
      return res.status(400).json({
        status: 'fail',
        message: `Invalid category. Permitted categories are: ${validCategories.join(', ')}`,
      });
    }

    const item = await Inventory.create({
      name: name.trim(),
      category: itemCategory,
      quantity: Number(quantity),
      unit: unit ? unit.trim() : 'kg',
      minStockLevel: minStockLevel !== undefined ? Math.max(0, Number(minStockLevel)) : 5,
      description: description ? description.trim() : '',
      owner: req.user._id,
    });

    return res.status(201).json({
      status: 'success',
      message: 'Inventory item added successfully.',
      data: item,
    });
  } catch (error) {
    console.error('[Inventory Controller] Create Inventory Error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Server error occurred while creating inventory item.',
    });
  }
};

/**
 * @desc    Update an inventory item (details or stock quantity)
 * @route   PUT /api/inventory/:id
 * @access  Private
 */
const updateInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, quantity, unit, minStockLevel, description } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid inventory ID format.',
      });
    }

    const item = await Inventory.findById(id);

    if (!item) {
      return res.status(404).json({
        status: 'fail',
        message: 'Inventory item not found.',
      });
    }

    if (item.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'fail',
        message: 'Not authorized: You can only update your own inventory.',
      });
    }

    if (quantity !== undefined && Number(quantity) < 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'Quantity cannot be negative.',
      });
    }

    if (name) item.name = name.trim();
    if (category) item.category = category;
    if (quantity !== undefined) item.quantity = Number(quantity);
    if (unit) item.unit = unit.trim();
    if (minStockLevel !== undefined) item.minStockLevel = Math.max(0, Number(minStockLevel));
    if (description !== undefined) item.description = description.trim();

    await item.save();

    return res.status(200).json({
      status: 'success',
      message: 'Inventory item updated successfully.',
      data: item,
    });
  } catch (error) {
    console.error('[Inventory Controller] Update Inventory Error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Server error occurred while updating inventory item.',
    });
  }
};

/**
 * @desc    Delete an inventory item
 * @route   DELETE /api/inventory/:id
 * @access  Private
 */
const deleteInventory = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid inventory ID format.',
      });
    }

    const item = await Inventory.findById(id);

    if (!item) {
      return res.status(404).json({
        status: 'fail',
        message: 'Inventory item not found.',
      });
    }

    if (item.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'fail',
        message: 'Not authorized: You can only delete your own inventory.',
      });
    }

    await Inventory.findByIdAndDelete(id);

    return res.status(200).json({
      status: 'success',
      message: 'Inventory item deleted successfully.',
    });
  } catch (error) {
    console.error('[Inventory Controller] Delete Inventory Error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Server error occurred while deleting inventory item.',
    });
  }
};

module.exports = {
  getInventory,
  getInventorySummary,
  getInventoryById,
  createInventory,
  updateInventory,
  deleteInventory,
};
