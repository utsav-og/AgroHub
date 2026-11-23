const express = require('express');
const router = express.Router();
const {
  getExpenses,
  getExpenseSummary,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
} = require('../controllers/expenseController');
const { protect } = require('../middleware/authMiddleware');

// All expense routes require authentication
router.use(protect);

// Summary route (must precede /:id)
router.get('/summary', getExpenseSummary);

// Base /api/expenses routes
router
  .route('/')
  .get(getExpenses)
  .post(createExpense);

// Item specific /api/expenses/:id routes
router
  .route('/:id')
  .get(getExpenseById)
  .put(updateExpense)
  .delete(deleteExpense);

module.exports = router;
