/**
 * Image helper utility for AgroHub
 * Resolves static uploaded paths, provides client-side file validation,
 * and supplies curated agricultural imagery for empty places.
 */

const BACKEND_BASE = 'http://localhost:5000';

// Curated high-resolution agricultural imagery by produce category
export const DEFAULT_CROP_IMAGES = {
  Grains: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80',
  Vegetables: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=800&q=80',
  Fruits: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=800&q=80',
  Pulses: 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?auto=format&fit=crop&w=800&q=80',
  Seeds: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&w=800&q=80',
  Fertilizers: 'https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?auto=format&fit=crop&w=800&q=80',
  Other: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80',
};

// Curated high-resolution agricultural machinery imagery by category
export const DEFAULT_MACHINERY_IMAGES = {
  Tractor: '/images/machinery/sonalika-tractor.jpg',
  Harvester: '/images/machinery/combine-harvester.jpg',
  Tillage: '/images/machinery/rotary-tiller.jpg',
  Seeding: '/images/machinery/seeder.jpg',
  Irrigation: '/images/machinery/john-deere-tractor.jpg',
  Sprayer: '/images/machinery/sprayer.jpg',
  Other: '/images/machinery/mahindra-tractor.jpg',
};

/**
 * Returns full reachable URL for an image path
 * @param {string} path - stored image URL or relative path
 * @returns {string|null} - absolute URL or null
 */
export const getImageUrl = (path) => {
  if (!path || typeof path !== 'string' || path.trim() === '') {
    return null;
  }

  const clean = path.trim();

  // If already absolute URL (e.g. Unsplash or Cloudinary)
  if (clean.startsWith('http://') || clean.startsWith('https://')) {
    return clean;
  }

  // If relative path from local Express uploads
  if (clean.startsWith('/uploads/')) {
    return `${BACKEND_BASE}${clean}`;
  }

  if (clean.startsWith('uploads/')) {
    return `${BACKEND_BASE}/${clean}`;
  }

  return clean;
};

/**
 * Returns guaranteed display image (user uploaded photo or curated category fallback)
 * Ensures no empty or broken placeholders across AgroHub cards and modals
 * @param {string} imageUrl
 * @param {string} category
 * @param {'crop'|'machinery'} type
 * @returns {string} - guaranteed image URL
 */
export const getDisplayImageUrl = (imageUrl, category = 'Other', type = 'crop') => {
  const resolved = getImageUrl(imageUrl);
  if (resolved) return resolved;

  if (type === 'crop') {
    return DEFAULT_CROP_IMAGES[category] || DEFAULT_CROP_IMAGES.Other;
  }
  return DEFAULT_MACHINERY_IMAGES[category] || DEFAULT_MACHINERY_IMAGES.Other;
};

/**
 * Validate image file before upload
 * Checks file type and 5 MB size limit
 * @param {File} file
 * @returns {{ valid: boolean, error?: string }}
 */
export const validateImageFile = (file) => {
  if (!file) {
    return { valid: false, error: 'No file selected.' };
  }

  const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
  const validExtensions = ['.jpg', '.jpeg', '.png', '.webp'];

  const fileName = file.name.toLowerCase();
  const hasValidExt = validExtensions.some((ext) => fileName.endsWith(ext));
  const hasValidMime = validTypes.includes(file.type);

  if (!hasValidExt && !hasValidMime) {
    return {
      valid: false,
      error: 'Invalid file format. Please upload a photograph in JPG, JPEG, PNG, or WEBP format.',
    };
  }

  const maxSizeBytes = 5 * 1024 * 1024; // 5 MB
  if (file.size > maxSizeBytes) {
    const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File size (${sizeInMb} MB) exceeds the 5 MB maximum limit. Please choose a smaller photograph.`,
    };
  }

  return { valid: true };
};
