import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  DollarSign,
  Receipt,
  PlusCircle,
  Search,
  Calendar,
  Edit2,
  Trash2,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  X,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  BarChart3,
} from 'lucide-react';
import {
  getIncomesApi,
  getFinancialReportApi,
  createIncomeApi,
  updateIncomeApi,
  deleteIncomeApi,
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

function Reports() {
  const { user } = useAuth();
  const { confirmAction, showToast } = useNotification();
  const navigate = useNavigate();

  const [incomes, setIncomes] = useState([]);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState({
    cropName: '',
    quantity: '',
    unit: 'quintal',
    sellingPrice: '',
    buyerName: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
  });

  const commonUnits = ['quintal', 'kg', 'ton', 'bags', 'crates', 'boxes'];

  // Protect view
  useEffect(() => {
    if (!user) {
      navigate('/login', {
        state: { message: 'Authentication Required: Please sign in to view your farm crop sales & financial profit reports.' }
      });
    }
  }, [user, navigate]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, searchTerm, startDate, endDate]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [incomesRes, reportRes] = await Promise.all([
        getIncomesApi(searchTerm, startDate, endDate),
        getFinancialReportApi(),
      ]);
      setIncomes(incomesRes.data || []);
      setReport(reportRes.data || null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load financial profit reports.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      cropName: '',
      quantity: '',
      unit: 'quintal',
      sellingPrice: '',
      buyerName: '',
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
      cropName: item.cropName,
      quantity: item.quantity,
      unit: item.unit,
      sellingPrice: item.sellingPrice,
      buyerName: item.buyerName || '',
      date: new Date(item.date).toISOString().split('T')[0],
      description: item.description || '',
    });
    setShowForm(true);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.cropName.trim() || formData.sellingPrice === '') {
      setFormError('Please enter crop name and total selling income.');
      return;
    }

    if (Number(formData.sellingPrice) < 0) {
      setFormError('Selling price cannot be negative.');
      return;
    }

    setFormLoading(true);
    try {
      if (editingId) {
        await updateIncomeApi(editingId, {
          ...formData,
          quantity: Number(formData.quantity || 1),
          sellingPrice: Number(formData.sellingPrice),
        });
        showToast(`Crop sale for "${formData.cropName}" updated successfully!`, 'success');
      } else {
        await createIncomeApi({
          ...formData,
          quantity: Number(formData.quantity || 1),
          sellingPrice: Number(formData.sellingPrice),
        });
        showToast(`Crop sale for "${formData.cropName}" recorded successfully!`, 'success');
      }
      resetForm();
      loadData();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save sales income record.';
      setFormError(msg);
      showToast(msg, 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id, cropName) => {
    const confirmed = await confirmAction({
      title: 'Delete Crop Sale Record',
      message: `Are you sure you want to permanently delete the sale record for "${cropName}"?`,
      confirmText: 'Delete Record',
      isDestructive: true,
    });
    if (!confirmed) return;

    try {
      await deleteIncomeApi(id);
      showToast(`Sale record for "${cropName}" deleted.`, 'success');
      loadData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete sale record.', 'error');
    }
  };

  return (
    <div className="marketplace-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Income & Profitability Reports</h1>
          <p>Analyze crop harvest revenue, operating expenses, and net profit margins across your farm.</p>
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
          <span>{showForm ? 'Close Form' : 'Record Crop Sale'}</span>
        </button>
      </div>

      {/* Main Financial KPI Grid */}
      <div className="grid" style={{ marginBottom: '2rem' }}>
        {/* Total Income Card */}
        <div className="card">
          <div className="card-header">
            <TrendingUp size={24} className="icon-emerald" />
            <h3>Total Crop Sales</h3>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#15803d', margin: '0.25rem 0' }}>
            ₹{report ? report.totalIncome.toLocaleString('en-IN') : '0'}
          </div>
          <p className="card-description" style={{ marginBottom: 0 }}>
            {report?.totalSalesCount || 0} harvest sales recorded
          </p>
        </div>

        {/* Total Expenses Card */}
        <div className="card">
          <div className="card-header">
            <Receipt size={24} className="icon-purple" />
            <h3>Total Expenses</h3>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#b91c1c', margin: '0.25rem 0' }}>
            ₹{report ? report.totalExpenses.toLocaleString('en-IN') : '0'}
          </div>
          <p className="card-description" style={{ marginBottom: 0 }}>
            {report?.totalExpenseCount || 0} expenditure transactions
          </p>
        </div>

        {/* Net Profit Card */}
        <div
          className="card"
          style={report?.isProfitable ? { background: '#f0fdf4', borderColor: '#bbf7d0' } : { background: '#fff5f5', borderColor: '#fecaca' }}
        >
          <div className="card-header">
            {report?.isProfitable ? (
              <ArrowUpRight size={24} color="#15803d" />
            ) : (
              <ArrowDownRight size={24} color="#b91c1c" />
            )}
            <h3 style={{ color: report?.isProfitable ? '#15803d' : '#b91c1c' }}>Estimated Net Profit</h3>
          </div>
          <div
            style={{
              fontSize: '2rem',
              fontWeight: 800,
              color: report?.isProfitable ? '#15803d' : '#b91c1c',
              margin: '0.25rem 0',
            }}
          >
            ₹{report ? Math.abs(report.netProfit).toLocaleString('en-IN') : '0'}
            <small style={{ fontSize: '0.9rem', marginLeft: '0.4rem', fontWeight: 600 }}>
              {report?.isProfitable ? '(Profit)' : '(Deficit)'}
            </small>
          </div>
          <p className="card-description" style={{ marginBottom: 0, fontWeight: 600, color: report?.isProfitable ? '#166534' : '#991b1b' }}>
            Profit Margin: {report?.profitMargin || 0}%
          </p>
        </div>
      </div>

      {/* Record Crop Sale Form Panel */}
      {showForm && (
        <div className="auth-card register-card" style={{ maxWidth: '100%', marginBottom: '2.5rem' }}>
          <div className="auth-header" style={{ textAlign: 'left', marginBottom: '1.25rem' }}>
            <h3>{editingId ? 'Edit Crop Sale Entry' : 'Record Crop Harvest Sale'}</h3>
            <p>Log harvest revenue to calculate real farm margins and operating profits</p>
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
                <label htmlFor="cropName">Crop Name *</label>
                <input
                  type="text"
                  id="cropName"
                  placeholder="e.g. Sharbati Wheat, Basmati 1121 Paddy, Mustard"
                  value={formData.cropName}
                  onChange={(e) => setFormData({ ...formData, cropName: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="buyerName">Buyer / Trader / Mandi Name</label>
                <input
                  type="text"
                  id="buyerName"
                  placeholder="e.g. Ludhiana Grain Mandi, Adani Agri Logistics"
                  value={formData.buyerName}
                  onChange={(e) => setFormData({ ...formData, buyerName: e.target.value })}
                />
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label htmlFor="quantity">Quantity Sold *</label>
                <input
                  type="number"
                  id="quantity"
                  placeholder="e.g. 50"
                  min="0"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="unit">Unit *</label>
                <select
                  id="unit"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                >
                  {commonUnits.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label htmlFor="sellingPrice">Total Sale Revenue in INR (₹) *</label>
                <input
                  type="number"
                  id="sellingPrice"
                  placeholder="e.g. 125000"
                  min="0"
                  value={formData.sellingPrice}
                  onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="date">Sale Date *</label>
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
              <label htmlFor="description">Payment & Quality Notes</label>
              <textarea
                id="description"
                rows="2"
                placeholder="Paid via direct bank transfer, moisture percentage, payment receipt #..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              ></textarea>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              <button type="submit" className="btn-auth-submit" style={{ flex: 1 }} disabled={formLoading}>
                {formLoading ? 'Saving...' : editingId ? 'Update Sale Record' : 'Record Crop Sale'}
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

      {/* Monthly Financial Trend Breakdown */}
      {report && report.monthlyTrend && report.monthlyTrend.length > 0 && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div className="card-header">
            <BarChart3 size={20} className="icon-emerald" />
            <h3>Monthly Cash Flow Breakdown</h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b' }}>
                  <th style={{ padding: '0.75rem' }}>Month</th>
                  <th style={{ padding: '0.75rem' }}>Income (₹)</th>
                  <th style={{ padding: '0.75rem' }}>Expenses (₹)</th>
                  <th style={{ padding: '0.75rem' }}>Net Cash Flow (₹)</th>
                </tr>
              </thead>
              <tbody>
                {report.monthlyTrend.map((m) => (
                  <tr key={m.month} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.75rem', fontWeight: 600 }}>{m.month}</td>
                    <td style={{ padding: '0.75rem', color: '#15803d', fontWeight: 600 }}>
                      +₹{m.income.toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '0.75rem', color: '#b91c1c', fontWeight: 600 }}>
                      -₹{m.expenses.toLocaleString('en-IN')}
                    </td>
                    <td
                      style={{
                        padding: '0.75rem',
                        fontWeight: 700,
                        color: m.profit >= 0 ? '#15803d' : '#b91c1c',
                      }}
                    >
                      {m.profit >= 0 ? '+' : ''}₹{m.profit.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sales Transactions List */}
      <div className="page-header" style={{ marginBottom: '1rem' }}>
        <div>
          <h2>Crop Harvest Sales History</h2>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <RefreshCw size={28} className="spin" />
          <p>Compiling farm revenue reports from MongoDB...</p>
        </div>
      ) : error ? (
        <div className="alert alert-error">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      ) : incomes.length === 0 ? (
        <div className="empty-state">
          <TrendingUp size={48} color="#94a3b8" />
          <h3>No crop harvest sales recorded yet</h3>
          <p>Log your crop sales to see real-time net profit and expense calculations.</p>
          <button onClick={() => setShowForm(true)} className="btn-cta-primary">
            Record Your First Crop Sale
          </button>
        </div>
      ) : (
        <div className="products-grid">
          {incomes.map((item) => (
            <div key={item._id} className="product-card" style={{ borderLeft: '4px solid #16a34a' }}>
              <div className="product-header">
                <span className="product-category-tag">Crop Sale</span>
                <span className="product-price" style={{ color: '#15803d' }}>
                  +₹{item.sellingPrice.toLocaleString('en-IN')}
                </span>
              </div>

              <h3 className="product-name">{item.cropName}</h3>

              <div style={{ fontSize: '0.875rem', margin: '0.25rem 0', color: '#1e293b' }}>
                Sold: <strong>{item.quantity} {item.unit}</strong>
              </div>

              {item.buyerName && (
                <div style={{ fontSize: '0.825rem', color: '#64748b', marginBottom: '0.4rem' }}>
                  Buyer: <strong>{item.buyerName}</strong>
                </div>
              )}

              <div style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.5rem' }}>
                <Calendar size={13} />
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
                  onClick={() => handleDelete(item._id, item.cropName)}
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

export default Reports;
