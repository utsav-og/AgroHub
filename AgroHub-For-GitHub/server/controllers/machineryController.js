const mongoose = require('mongoose');
const Machinery = require('../models/Machinery');
const { deleteLocalImage } = require('../utils/fileUpload');

/**
 * @desc    Fetch all machinery listings (with optional category and search filters)
 * @route   GET /api/machinery
 * @access  Public
 */
const getMachinery = async (req, res) => {
  try {
    const { category, search, available } = req.query;

    const filter = {};

    // Category filter
    if (category && category !== 'All') {
      filter.category = category;
    }

    // Availability filter
    if (available !== undefined && available !== '') {
      filter.isAvailable = available === 'true';
    }

    // Keyword search across name, description, and location
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { name: searchRegex },
        { description: searchRegex },
        { location: searchRegex },
      ];
    }

    const machinery = await Machinery.find(filter)
      .populate('owner', 'name email phone location')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      status: 'success',
      count: machinery.length,
      data: machinery,
    });
  } catch (error) {
    console.error('[Machinery Controller] Get Machinery Error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Server error occurred while fetching machinery listings.',
    });
  }
};

/**
 * @desc    Fetch a single machinery item by ID
 * @route   GET /api/machinery/:id
 * @access  Public
 */
const getMachineryById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid machinery ID format.',
      });
    }

    const item = await Machinery.findById(id).populate('owner', 'name email phone location');

    if (!item) {
      return res.status(404).json({
        status: 'fail',
        message: 'Machinery listing not found.',
      });
    }

    return res.status(200).json({
      status: 'success',
      data: item,
    });
  } catch (error) {
    console.error('[Machinery Controller] Get Machinery By ID Error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Server error occurred while fetching machinery details.',
    });
  }
};

/**
 * @desc    Create a new machinery rental listing
 * @route   POST /api/machinery
 * @access  Private (Authenticated users)
 */
const createMachinery = async (req, res) => {
  try {
    const { name, category, description, rentalPricePerDay, location, isAvailable, imageUrl } = req.body;

    // 1. Validation
    if (!name || name.trim() === '' || rentalPricePerDay === undefined || rentalPricePerDay === '') {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide machinery name and rental price per day.',
      });
    }

    if (Number(rentalPricePerDay) < 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'Rental price cannot be negative.',
      });
    }

    const validCategories = ['Tractor', 'Harvester', 'Tillage', 'Seeding', 'Irrigation', 'Sprayer', 'Other'];
    const machineCategory = category || 'Tractor';
    if (!validCategories.includes(machineCategory)) {
      return res.status(400).json({
        status: 'fail',
        message: `Invalid category. Permitted categories are: ${validCategories.join(', ')}`,
      });
    }

    // 2. Create Machinery document linked to authenticated user (req.user._id)
    const machinery = await Machinery.create({
      name: name.trim(),
      category: machineCategory,
      description: description ? description.trim() : '',
      rentalPricePerDay: Number(rentalPricePerDay),
      location: location ? location.trim() : (req.user.location || ''),
      owner: req.user._id,
      isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : true,
      imageUrl: imageUrl ? imageUrl.trim() : '',
    });

    return res.status(201).json({
      status: 'success',
      message: 'Machinery listed for rental successfully.',
      data: machinery,
    });
  } catch (error) {
    console.error('[Machinery Controller] Create Machinery Error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Server error occurred while listing machinery.',
    });
  }
};

/**
 * @desc    Update a machinery listing (including photograph and details)
 * @route   PUT /api/machinery/:id
 * @access  Private (Owner or admin only)
 */
const updateMachinery = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid machinery ID format.',
      });
    }

    const machinery = await Machinery.findById(id);

    if (!machinery) {
      return res.status(404).json({
        status: 'fail',
        message: 'Machinery listing not found with the specified ID.',
      });
    }

    // Security check: Only the owner or admin can update
    if (machinery.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'fail',
        message: 'Not authorized: You can only update machinery equipment that you listed yourself.',
      });
    }

    const { name, category, rentalPricePerDay, description, location, isAvailable, imageUrl } = req.body;

    if (name !== undefined) machinery.name = name.trim();
    if (category !== undefined) machinery.category = category;
    if (rentalPricePerDay !== undefined) machinery.rentalPricePerDay = Number(rentalPricePerDay);
    if (description !== undefined) machinery.description = description.trim();
    if (location !== undefined) machinery.location = location.trim();
    if (isAvailable !== undefined) machinery.isAvailable = Boolean(isAvailable);

    // Handle image update and cleanup of old image
    if (imageUrl !== undefined) {
      const trimmedUrl = imageUrl.trim();
      if (machinery.imageUrl && machinery.imageUrl !== trimmedUrl && machinery.imageUrl.startsWith('/uploads/')) {
        deleteLocalImage(machinery.imageUrl);
      }
      machinery.imageUrl = trimmedUrl;
    }

    const updated = await machinery.save();

    return res.status(200).json({
      status: 'success',
      message: 'Machinery listing updated successfully.',
      data: updated,
    });
  } catch (error) {
    console.error('[Machinery Controller] Update Machinery Error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Server error occurred while updating machinery listing.',
    });
  }
};

/**
 * @desc    Delete a machinery listing
 * @route   DELETE /api/machinery/:id
 * @access  Private (Owner only)
 */
const deleteMachinery = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid machinery ID format.',
      });
    }

    const machinery = await Machinery.findById(id);

    if (!machinery) {
      return res.status(404).json({
        status: 'fail',
        message: 'Machinery listing not found with the specified ID.',
      });
    }

    // Security check: Only the owner who listed the machine can delete it
    if (machinery.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'fail',
        message: 'Not authorized: You can only delete machinery equipment that you listed yourself.',
      });
    }

    // Delete image file from server if locally uploaded
    if (machinery.imageUrl && machinery.imageUrl.startsWith('/uploads/')) {
      deleteLocalImage(machinery.imageUrl);
    }

    await Machinery.findByIdAndDelete(id);

    return res.status(200).json({
      status: 'success',
      message: 'Machinery listing deleted successfully.',
    });
  } catch (error) {
    console.error('[Machinery Controller] Delete Machinery Error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Server error occurred while deleting machinery listing.',
    });
  }
};

module.exports = {
  getMachinery,
  getMachineryById,
  createMachinery,
  updateMachinery,
  deleteMachinery,
};
