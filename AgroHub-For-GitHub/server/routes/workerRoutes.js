const express = require('express');
const router = express.Router();
const {
  getWorkers,
  getWorkerById,
  createWorker,
  deleteWorker,
} = require('../controllers/workerController');
const { protect } = require('../middleware/authMiddleware');

// Route: /api/workers
router
  .route('/')
  .get(getWorkers)
  .post(protect, createWorker);

// Route: /api/workers/:id
router
  .route('/:id')
  .get(getWorkerById)
  .delete(protect, deleteWorker);

module.exports = router;
