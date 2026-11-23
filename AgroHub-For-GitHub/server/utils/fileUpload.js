const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate clean safe unique filename
    const cleanExt = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const prefix = file.fieldname || 'image';
    cb(null, `${prefix}-${uniqueSuffix}${cleanExt}`);
  },
});

// File filter for allowed image types (JPG, JPEG, PNG, WEBP)
const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];

  const ext = path.extname(file.originalname).toLowerCase();
  const isExtAllowed = allowedExtensions.includes(ext);
  const isMimeAllowed = allowedMimeTypes.includes(file.mimetype);

  if (isExtAllowed && isMimeAllowed) {
    cb(null, true);
  } else {
    cb(
      new Error(
        'Invalid file type. Only JPG, JPEG, PNG, and WEBP image files are allowed.'
      ),
      false
    );
  }
};

// Multer upload middleware instance (5 MB max)
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 Megabytes
  },
});

/**
 * Safely delete a locally stored image file from the uploads directory
 * @param {string} imageUrl e.g. "/uploads/image-1234.jpg"
 */
const deleteLocalImage = (imageUrl) => {
  if (!imageUrl || typeof imageUrl !== 'string') return;

  // Only handle files located in the local /uploads/ directory
  if (imageUrl.startsWith('/uploads/')) {
    const filename = path.basename(imageUrl);
    const filePath = path.join(uploadDir, filename);

    fs.unlink(filePath, (err) => {
      if (err && err.code !== 'ENOENT') {
        console.warn(`[File Cleanup] Could not delete image at ${filePath}:`, err.message);
      } else if (!err) {
        console.log(`[File Cleanup] Successfully deleted previous image: ${filename}`);
      }
    });
  }
};

module.exports = {
  upload,
  uploadDir,
  deleteLocalImage,
};
