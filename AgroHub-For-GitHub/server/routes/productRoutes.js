const express = require('express');
const router = express.Router();
const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const { protect, farmerOnly } = require('../middleware/authMiddleware');

// Route: /api/products
router
  .route('/')
  .get(getAllProducts)
  .post(protect, farmerOnly, createProduct);

// Route: /api/products/:id
router
  .route('/:id')
  .get(getProductById)
  .put(protect, farmerOnly, updateProduct)
  .delete(protect, farmerOnly, deleteProduct);

module.exports = router;
