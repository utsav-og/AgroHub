const express = require('express');
const router = express.Router();
const {
  getMachinery,
  getMachineryById,
  createMachinery,
  updateMachinery,
  deleteMachinery,
} = require('../controllers/machineryController');
const { protect } = require('../middleware/authMiddleware');

// Route: /api/machinery
router
  .route('/')
  .get(getMachinery)
  .post(protect, createMachinery);

// Route: /api/machinery/:id
router
  .route('/:id')
  .get(getMachineryById)
  .put(protect, updateMachinery)
  .delete(protect, deleteMachinery);

module.exports = router;
