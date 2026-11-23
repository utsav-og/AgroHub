const express = require('express');
const router = express.Router();
const multer = require('multer');
const { upload } = require('../utils/fileUpload');
const { protect } = require('../middleware/authMiddleware');

/**
 * @desc    Upload an image file (crops, machinery, etc.)
 * @route   POST /api/upload
 * @access  Private (Authenticated users only)
 */
router.post('/', protect, (req, res) => {
  upload.single('image')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          status: 'fail',
          message: 'Image size exceeds the 5 MB limit. Please select a photo smaller than 5 MB.',
        });
      }
      return res.status(400).json({
        status: 'fail',
        message: `Upload error: ${err.message}`,
      });
    } else if (err) {
      return res.status(400).json({
        status: 'fail',
        message: err.message || 'Failed to upload image. Please ensure it is a valid JPG, PNG, or WEBP file.',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        status: 'fail',
        message: 'No image file uploaded. Please select an image file.',
      });
    }

    // Return the relative URL path for local serving
    const imageUrl = `/uploads/${req.file.filename}`;

    return res.status(200).json({
      status: 'success',
      message: 'Image uploaded successfully.',
      imageUrl,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype,
    });
  });
});

module.exports = router;
