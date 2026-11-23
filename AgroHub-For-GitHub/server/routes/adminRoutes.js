const express = require('express');
const router = express.Router();
const {
  getAdminStats,
  getAdminUsers,
  deleteAdminUser,
  getAdminListings,
  deleteAdminProduct,
  deleteAdminMachinery,
  deleteAdminWorker,
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// All admin routes require authentication AND admin privileges
router.use(protect, adminOnly);

// System overview metrics
router.get('/stats', getAdminStats);

// User management
router.get('/users', getAdminUsers);
router.delete('/users/:id', deleteAdminUser);

// Platform listings moderation
router.get('/listings', getAdminListings);
router.delete('/products/:id', deleteAdminProduct);
router.delete('/machinery/:id', deleteAdminMachinery);
router.delete('/workers/:id', deleteAdminWorker);

module.exports = router;
