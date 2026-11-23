import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  DollarSign,
  TrendingUp,
  Receipt,
  PlusCircle,
  Filter,
  Search,
  Calendar,
  Edit2,
  Trash2,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  X,
  PieChart,
} from 'lucide-react';
import {
  getExpensesApi,
  getExpenseSummaryApi,
  createExpenseApi,
  updateExpenseApi,
  deleteExpenseApi,
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

function ExpenseTracker() {
  const { user } = useAuth();
  const { confirmAction, showToast } = useNotification();
  const navigate = useNavigate();

  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Form State (for both Add and Edit)
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    category: 'Seeds',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
  });

  const categories = ['All', 'Seeds', 'Fertilizers', 'Pesticides', 'Labour', 'Machinery', 'Irrigation', 'Other'];
  const formCategories = ['Seeds', 'Fertilizers', 'Pesticides', 'Labour', 'Machinery', 'Irrigation', 'Other'];

  // Protect view
  useEffect(() => {
    if (!user) {
      navigate('/login', {
        state: { message: 'Authentication Required: Please sign in to access your farm expense tracker.' }
      });
    }
  }, [user, navigate]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, selectedCategory, searchTerm, startDate, endDate]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [expensesRes, summaryRes] = await Promise.all([
        getExpensesApi(selectedCategory === 'All' ? '' : selectedCategory, searchTerm, startDate, endDate),
        getExpenseSummaryApi(),
      ]);
      setExpenses(expensesRes.data || []);
      setSummary(summaryRes.data || null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load expense records.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      category: 'Seeds',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      description: '',
    });
    setEditingId(null);
    setFormError('');
    setShowForm(false);
  };

  const handleEditClick = (item) => {
    setEditingId(item._id);
    setFormData({
      title: item.title,
      category: item.category,
      amount: item.amount,
      date: new Date(item.date).toISOString().split('T')[0],
      description: item.description || '',
    });
    setShowForm(true);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.title.trim() || formData.amount === '') {
      setFormError('Please enter an expense title and amount.');
      return;
    }

    if (Number(formData.amount) < 0) {
      setFormError('Amount cannot be negative.');
      return;
    }

    setFormLoading(true);
    try {
      if (editingId) {
        await updateExpenseApi(editingId, {
          ...formData,
          amount: Number(formData.amount),
        });
        showToast(`Expense "${formData.title}" updated successfully!`, 'success');
      } else {
        await createExpenseApi({
          ...formData,
          amount: Number(formData.amount),
        });
        showToast(`Expense "${formData.title}" recorded successfully!`, 'success');
      }
      resetForm();
      loadData();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save expense record.';
      setFormError(msg);
      showToast(msg, 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id, title) => {
    const confirmed = await confirmAction({
      title: 'Delete Expense Entry',
      message: `Are you sure you want to permanently delete the expense entry "${title}"?`,
      confirmText: 'Delete Entry',
      isDestructive: true,
    });
    if (!confirmed) return;

    try {
      await deleteExpenseApi(id);
      showToast(`Expense entry "${title}" removed.`, 'success');
      loadData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete expense entry.', 'error');
    }
  };

  return (
    <div className="marketplace-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Farm Expense Tracker</h1>
          <p>Monitor agricultural expenditures, seasonal operating costs, and input investments.</p>
        </div>
        <button
          onClick={() => {
            if (showForm && !editingId) {
              setShowForm(false);
            } else {
              resetForm();
              setShowForm(true);
            }
          }}
          className="btn-add-product"
        >
          {showForm ? <X size={18} /> : <PlusCircle size={18} />}
          <span>{showForm ? 'Close Form' : 'Record New Expense'}</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid" style={{ marginBottom: '2rem' }}>
        <div className="card">
          <div className="card-header">
            <DollarSign size={24} className="icon-emerald" />
            <h3>Total Expenditure</h3>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#1b4332', margin: '0.25rem 0' }}>
            ₹{summary ? summary.totalAmount.toLocaleString('en-IN') : '0'}
          </div>
          <p className="card-description" style={{ marginBottom: 0 }}>
            Cumulative season expenses recorded
          </p>
        </div>

        <div className="card">
          <div className="card-header">
            <TrendingUp size={24} className="icon-purple" />
            <h3>Top Spending Category</h3>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#2d6a4f', margin: '0.25rem 0' }}>
            {summary?.topCategory || 'N/A'}
          </div>
          <p className="card-description" style={{ marginBottom: 0 }}>
            Highest farm input cost category
          </p>
        </div>

        <div className="card">
          <div className="card-header">
            <Receipt size={24} className="icon-blue" />
            <h3>Total Entries</h3>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', margin: '0.25rem 0' }}>
            {summary?.totalTransactions || 0}
          </div>
          <p className="card-description" style={{ marginBottom: 0 }}>
            Individual transactions tracked
          </p>
        </div>
      </div>

      {/* Create / Edit Expense Form Panel */}
      {showForm && (
        <div className="auth-card register-card" style={{ maxWidth: '100%', marginBottom: '2.5rem' }}>
          <div className="auth-header" style={{ textAlign: 'left', marginBottom: '1.25rem' }}>
            <h3>{editingId ? 'Edit Expense Record' : 'Record New Farm Expense'}</h3>
            <p>Log details to maintain accurate crop cost economics</p>
          </div>

          {formError && (
            <div className="alert alert-error">
              <AlertCircle size={20} />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleFormSubmit} className="auth-form">
            <div className="form-row-2">
              <div className="form-group">
                <label htmlFor="title">Expense Title / Item Name *</label>
                <input
                  type="text"
                  id="title"
                  placeholder="e.g. Urea & DAP Fertilizer, Hybrid Wheat Seeds, Diesel"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="category">Category *</label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {formCategories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label htmlFor="amount">Amount in INR (₹) *</label>
                <input
                  type="number"
                  id="amount"
                  placeholder="e.g. 4500"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="date">Transaction Date *</label>
                <input
                  type="date"
                  id="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">Notes / Vendor Details</label>
              <textarea
                id="description"
                rows="2"
                placeholder="Purchased from Kisan Seva Kendra, bill receipt #..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              ></textarea>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              <button type="submit" className="btn-auth-submit" style={{ flex: 1 }} disabled={formLoading}>
                {formLoading ? 'Saving...' : editingId ? 'Update Expense Entry' : 'Save Expense Entry'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="btn-secondary"
                style={{ padding: '0.75rem 1.5rem', borderRadius: '6px' }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="category-filter-bar" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'stretch' }}>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Keyword Search */}
          <div className="input-wrapper" style={{ flex: 1, minWidth: '220px' }}>
            <Search size={18} className="input-icon" />
            <input
              type="text"
              placeholder="Search expenses by title or notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          {/* Date Range Start */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Calendar size={16} color="#64748b" />
            <input
              type="date"
              title="Start Date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{ padding: '0.55rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem' }}
            />
          </div>

          {/* Date Range End */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>to</span>
            <input
              type="date"
              title="End Date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{ padding: '0.55rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem' }}
            />
          </div>

          {(startDate || endDate || searchTerm) && (
            <button
              onClick={() => {
                setStartDate('');
                setEndDate('');
                setSearchTerm('');
              }}
              className="btn-secondary"
              style={{ padding: '0.5rem 0.8rem', fontSize: '0.8rem' }}
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div className="filter-label">
            <Filter size={16} />
            <span>Category:</span>
          </div>
          <div className="filter-pills">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`pill-btn ${(selectedCategory === cat || (cat === 'All' && !selectedCategory)) ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat === 'All' ? '' : cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Expenses Table / Cards */}
      {loading ? (
        <div className="loading-state">
          <RefreshCw size={28} className="spin" />
          <p>Loading farm expenses from MongoDB...</p>
        </div>
      ) : error ? (
        <div className="alert alert-error">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      ) : expenses.length === 0 ? (
        <div className="empty-state">
          <Receipt size={48} color="#94a3b8" />
          <h3>No expense records found</h3>
          <p>Track your seed purchases, tractor diesel, fertilizers, and labor costs to maintain healthy farm books.</p>
          <button onClick={() => setShowForm(true)} className="btn-cta-primary">
            Record Your First Expense
          </button>
        </div>
      ) : (
        <div className="products-grid">
          {expenses.map((item) => (
            <div key={item._id} className="product-card" style={{ borderLeft: '4px solid #2d6a4f' }}>
              <div className="product-header">
                <span className="product-category-tag">{item.category}</span>
                <span className="product-price" style={{ color: '#b91c1c' }}>
                  ₹{item.amount.toLocaleString('en-IN')}
                </span>
              </div>

              <h3 className="product-name">{item.title}</h3>

              <div style={{ fontSize: '0.825rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.5rem' }}>
                <Calendar size={14} />
                <span>{new Date(item.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
              </div>

              {item.description && (
                <p className="product-description" style={{ fontSize: '0.85rem' }}>
                  {item.description}
                </p>
              )}

              <div className="owner-actions-row" style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                <button
                  onClick={() => handleEditClick(item)}
                  className="btn-secondary"
                  style={{ flex: 1, padding: '0.4rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}
                >
                  <Edit2 size={13} />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(item._id, item.title)}
                  className="btn-delete-listing"
                  style={{ flex: 1, margin: 0 }}
                >
                  <Trash2 size={13} />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ExpenseTracker;
