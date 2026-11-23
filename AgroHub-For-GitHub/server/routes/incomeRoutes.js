const express = require('express');
const router = express.Router();
const {
  getIncomes,
  getFinancialReport,
  getIncomeById,
  createIncome,
  updateIncome,
  deleteIncome,
} = require('../controllers/incomeController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

// Financial report calculation (must precede /:id)
router.get('/financial-report', getFinancialReport);

// Base /api/income routes
router
  .route('/')
  .get(getIncomes)
  .post(createIncome);

// Item specific /api/income/:id routes
router
  .route('/:id')
  .get(getIncomeById)
  .put(updateIncome)
  .delete(deleteIncome);

module.exports = router;
