const express = require('express');
const router = express.Router();
const {
  getInventory,
  getInventorySummary,
  getInventoryById,
  createInventory,
  updateInventory,
  deleteInventory,
} = require('../controllers/inventoryController');
const { protect } = require('../middleware/authMiddleware');

// All inventory routes require authentication
router.use(protect);

// Summary route (must precede /:id)
router.get('/summary', getInventorySummary);

// Base /api/inventory routes
router
  .route('/')
  .get(getInventory)
  .post(createInventory);

// Item specific /api/inventory/:id routes
router
  .route('/:id')
  .get(getInventoryById)
  .put(updateInventory)
  .delete(deleteInventory);

module.exports = router;
