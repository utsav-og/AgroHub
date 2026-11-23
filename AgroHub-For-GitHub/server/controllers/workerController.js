const mongoose = require('mongoose');
const Worker = require('../models/Worker');

/**
 * @desc    Fetch all worker profiles (with optional skill, location, and search filtering)
 * @route   GET /api/workers
 * @access  Public
 */
const getWorkers = async (req, res) => {
  try {
    const { skill, location, search, available } = req.query;

    const filter = {};

    // Skill filter
    if (skill && skill !== 'All') {
      filter.skills = { $regex: new RegExp(skill.trim(), 'i') };
    }

    // Location filter
    if (location && location.trim() !== '') {
      filter.location = { $regex: new RegExp(location.trim(), 'i') };
    }

    // Availability filter
    if (available !== undefined && available !== '') {
      filter.isAvailable = available === 'true';
    }

    // Keyword search across name, skills, location, and description
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { name: searchRegex },
        { location: searchRegex },
        { skills: { $in: [searchRegex] } },
        { description: searchRegex },
      ];
    }

    const workers = await Worker.find(filter)
      .populate('owner', 'name email phone location')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      status: 'success',
      count: workers.length,
      data: workers,
    });
  } catch (error) {
    console.error('[Worker Controller] Get Workers Error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Server error occurred while fetching worker profiles.',
    });
  }
};

/**
 * @desc    Fetch a single worker profile by ID
 * @route   GET /api/workers/:id
 * @access  Public
 */
const getWorkerById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid worker ID format.',
      });
    }

    const worker = await Worker.findById(id).populate('owner', 'name email phone location');

    if (!worker) {
      return res.status(404).json({
        status: 'fail',
        message: 'Worker profile not found.',
      });
    }

    return res.status(200).json({
      status: 'success',
      data: worker,
    });
  } catch (error) {
    console.error('[Worker Controller] Get Worker By ID Error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Server error occurred while fetching worker details.',
    });
  }
};

/**
 * @desc    Create a new worker profile
 * @route   POST /api/workers
 * @access  Private (Authenticated users)
 */
const createWorker = async (req, res) => {
  try {
    const { name, skills, experienceYears, dailyWage, location, phone, isAvailable, description } = req.body;

    // 1. Validation
    if (!name || name.trim() === '' || dailyWage === undefined || dailyWage === '') {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide worker name and expected daily wage.',
      });
    }

    if (!location || location.trim() === '') {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide worker location or region.',
      });
    }

    if (!phone || phone.trim() === '') {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide a valid contact phone number.',
      });
    }

    if (Number(dailyWage) < 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'Daily wage cannot be a negative amount.',
      });
    }

    // 2. Parse Skills into clean array
    let skillsArray = [];
    if (Array.isArray(skills)) {
      skillsArray = skills.map((s) => String(s).trim()).filter(Boolean);
    } else if (typeof skills === 'string') {
      skillsArray = skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    }

    if (skillsArray.length === 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please specify at least one skill (e.g. Harvesting, Planting, Irrigation).',
      });
    }

    // 3. Create Worker Document linked to authenticated user
    const worker = await Worker.create({
      name: name.trim(),
      skills: skillsArray,
      experienceYears: experienceYears !== undefined ? Math.max(0, Number(experienceYears)) : 1,
      dailyWage: Number(dailyWage),
      location: location.trim(),
      phone: phone.trim(),
      owner: req.user._id,
      isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : true,
      description: description ? description.trim() : '',
    });

    return res.status(201).json({
      status: 'success',
      message: 'Worker profile created successfully.',
      data: worker,
    });
  } catch (error) {
    console.error('[Worker Controller] Create Worker Error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Server error occurred while creating worker profile.',
    });
  }
};

/**
 * @desc    Delete a worker profile
 * @route   DELETE /api/workers/:id
 * @access  Private (Owner only)
 */
const deleteWorker = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid worker ID format.',
      });
    }

    const worker = await Worker.findById(id);

    if (!worker) {
      return res.status(404).json({
        status: 'fail',
        message: 'Worker profile not found with the specified ID.',
      });
    }

    // Security check: Only the owner who created the profile can delete it
    if (worker.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'fail',
        message: 'Not authorized: You can only delete worker profiles that you listed yourself.',
      });
    }

    await Worker.findByIdAndDelete(id);

    return res.status(200).json({
      status: 'success',
      message: 'Worker profile deleted successfully.',
    });
  } catch (error) {
    console.error('[Worker Controller] Delete Worker Error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Server error occurred while deleting worker profile.',
    });
  }
};

module.exports = {
  getWorkers,
  getWorkerById,
  createWorker,
  deleteWorker,
};
