const mongoose = require('mongoose');
const Product = require('../models/Product');
const { deleteLocalImage } = require('../utils/fileUpload');

/**
 * @desc    Create a new agricultural product / crop listing
 * @route   POST /api/products
 * @access  Private (Farmer only)
 */
const createProduct = async (req, res) => {
  try {
    const { name, category, price, quantity, unit, description, location, imageUrl } = req.body;

    // 1. Validation
    if (!name || price === undefined || quantity === undefined) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide all required fields: name, price, and quantity.',
      });
    }

    if (Number(price) < 0 || Number(quantity) < 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'Price and quantity must be non-negative values.',
      });
    }

    // Category validation
    const validCategories = ['Grains', 'Vegetables', 'Fruits', 'Pulses', 'Seeds', 'Fertilizers', 'Other'];
    const productCategory = category || 'Grains';
    if (!validCategories.includes(productCategory)) {
      return res.status(400).json({
        status: 'fail',
        message: `Invalid category. Permitted categories are: ${validCategories.join(', ')}`,
      });
    }

    // 2. Create Product linked to the authenticated farmer
    const product = await Product.create({
      name: name.trim(),
      category: productCategory,
      price: Number(price),
      quantity: Number(quantity),
      unit: unit || 'kg',
      description: description ? description.trim() : '',
      location: location ? location.trim() : (req.user.location || ''),
      imageUrl: imageUrl ? imageUrl.trim() : '',
      farmer: req.user._id,
      isAvailable: true,
    });

    return res.status(201).json({
      status: 'success',
      message: 'Product listing created successfully.',
      data: product,
    });
  } catch (error) {
    console.error('[Product Controller] Create Product Error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Server error occurred while creating product.',
    });
  }
};

/**
 * @desc    Fetch all available products (with optional category filtering)
 * @route   GET /api/products
 * @access  Public
 */
const getAllProducts = async (req, res) => {
  try {
    const { category } = req.query;

    // Build filter query
    const filter = { isAvailable: true };
    if (category) {
      filter.category = category;
    }

    // Retrieve products with farmer contact details
    const products = await Product.find(filter)
      .populate('farmer', 'name email phone location')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      status: 'success',
      count: products.length,
      data: products,
    });
  } catch (error) {
    console.error('[Product Controller] Get All Products Error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Server error occurred while fetching products.',
    });
  }
};

/**
 * @desc    Fetch a single product by ID
 * @route   GET /api/products/:id
 * @access  Public
 */
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid product ID format.',
      });
    }

    const product = await Product.findById(id).populate('farmer', 'name email phone location');

    if (!product) {
      return res.status(404).json({
        status: 'fail',
        message: 'Product not found.',
      });
    }

    return res.status(200).json({
      status: 'success',
      data: product,
    });
  } catch (error) {
    console.error('[Product Controller] Get Product By ID Error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Server error occurred while fetching product details.',
    });
  }
};

/**
 * @desc    Update a product listing (including image and details)
 * @route   PUT /api/products/:id
 * @access  Private (Farmer only - only owner or admin can update)
 */
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid product ID format.',
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        status: 'fail',
        message: 'Product not found with the specified ID.',
      });
    }

    // Security check: Only the owner farmer or admin can update
    if (product.farmer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'fail',
        message: 'Not authorized: You can only update products that you listed yourself.',
      });
    }

    const { name, category, price, quantity, unit, description, location, imageUrl, isAvailable } = req.body;

    if (name !== undefined) product.name = name.trim();
    if (category !== undefined) product.category = category;
    if (price !== undefined) product.price = Number(price);
    if (quantity !== undefined) product.quantity = Number(quantity);
    if (unit !== undefined) product.unit = unit;
    if (description !== undefined) product.description = description.trim();
    if (location !== undefined) product.location = location.trim();
    if (isAvailable !== undefined) product.isAvailable = Boolean(isAvailable);

    // Handle image update and cleanup of old image
    if (imageUrl !== undefined) {
      const trimmedUrl = imageUrl.trim();
      if (product.imageUrl && product.imageUrl !== trimmedUrl && product.imageUrl.startsWith('/uploads/')) {
        deleteLocalImage(product.imageUrl);
      }
      product.imageUrl = trimmedUrl;
    }

    const updatedProduct = await product.save();

    return res.status(200).json({
      status: 'success',
      message: 'Product listing updated successfully.',
      data: updatedProduct,
    });
  } catch (error) {
    console.error('[Product Controller] Update Product Error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Server error occurred while updating product listing.',
    });
  }
};

/**
 * @desc    Delete a product listing
 * @route   DELETE /api/products/:id
 * @access  Private (Farmer only - only owner can delete)
 */
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid product ID format.',
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        status: 'fail',
        message: 'Product not found with the specified ID.',
      });
    }

    // Security Check: Only the farmer who created the product can delete it
    if (product.farmer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'fail',
        message: 'Not authorized: You can only delete products that you listed yourself.',
      });
    }

    // Delete image file from server if it was locally uploaded
    if (product.imageUrl && product.imageUrl.startsWith('/uploads/')) {
      deleteLocalImage(product.imageUrl);
    }

    await Product.findByIdAndDelete(id);

    return res.status(200).json({
      status: 'success',
      message: 'Product listing deleted successfully.',
    });
  } catch (error) {
    console.error('[Product Controller] Delete Product Error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Server error occurred while deleting product.',
    });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
