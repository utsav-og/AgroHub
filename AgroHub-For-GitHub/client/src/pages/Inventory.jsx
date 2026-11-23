import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Package,
  AlertTriangle,
  Layers,
  PlusCircle,
  Filter,
  Search,
  Edit2,
  Trash2,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  X,
  Plus,
  Minus,
} from 'lucide-react';
import {
  getInventoryApi,
  getInventorySummaryApi,
  createInventoryApi,
  updateInventoryApi,
  deleteInventoryApi,
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

function Inventory() {
  const { user } = useAuth();
  const { confirmAction, showToast } = useNotification();
  const navigate = useNavigate();

  const [inventory, setInventory] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    category: 'Seeds',
    quantity: '',
    unit: 'kg',
    minStockLevel: '5',
    description: '',
  });

  const categories = ['All', 'Seeds', 'Fertilizers', 'Pesticides', 'Equipment', 'Harvest', 'Other'];
  const formCategories = ['Seeds', 'Fertilizers', 'Pesticides', 'Equipment', 'Harvest', 'Other'];
  const commonUnits = ['kg', 'quintal', 'bags', 'litre', 'bottles', 'packets', 'pieces'];

  // Protect view
  useEffect(() => {
    if (!user) {
      navigate('/login', {
        state: { message: 'Authentication Required: Please sign in to access your farm inventory management.' }
      });
    }
  }, [user, navigate]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, selectedCategory, searchTerm, showLowStockOnly]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [itemsRes, summaryRes] = await Promise.all([
        getInventoryApi(selectedCategory === 'All' ? '' : selectedCategory, searchTerm, showLowStockOnly),
        getInventorySummaryApi(),
      ]);
      setInventory(itemsRes.data || []);
      setSummary(summaryRes.data || null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load farm inventory.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'Seeds',
      quantity: '',
      unit: 'kg',
      minStockLevel: '5',
      description: '',
    });
    setEditingId(null);
    setFormError('');
    setShowForm(false);
  };

  const handleEditClick = (item) => {
    setEditingId(item._id);
    setFormData({
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      minStockLevel: item.minStockLevel,
      description: item.description || '',
    });
    setShowForm(true);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name.trim() || formData.quantity === '') {
      setFormError('Please enter item name and quantity.');
      return;
    }

    if (Number(formData.quantity) < 0) {
      setFormError('Quantity cannot be negative.');
      return;
    }

    setFormLoading(true);
    try {
      if (editingId) {
        await updateInventoryApi(editingId, {
          ...formData,
          quantity: Number(formData.quantity),
          minStockLevel: Number(formData.minStockLevel || 0),
        });
        showToast(`Inventory item "${formData.name}" updated successfully!`, 'success');
      } else {
        await createInventoryApi({
          ...formData,
          quantity: Number(formData.quantity),
          minStockLevel: Number(formData.minStockLevel || 0),
        });
        showToast(`Inventory item "${formData.name}" added to stock!`, 'success');
      }
      resetForm();
      loadData();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save inventory item.';
      setFormError(msg);
      showToast(msg, 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleQuickAdjust = async (item, delta) => {
    const newQty = Math.max(0, item.quantity + delta);
    try {
      await updateInventoryApi(item._id, { quantity: newQty });
      setInventory((prev) =>
        prev.map((i) => (i._id === item._id ? { ...i, quantity: newQty } : i))
      );
      // Refresh summary
      const summaryRes = await getInventorySummaryApi();
      setSummary(summaryRes.data || null);
      showToast(`${item.name} quantity updated to ${newQty} ${item.unit}.`, 'info');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update stock quantity.', 'error');
    }
  };

  const handleDelete = async (id, name) => {
    const confirmed = await confirmAction({
      title: 'Delete Inventory Item',
      message: `Are you sure you want to permanently delete "${name}" from your farm inventory?`,
      confirmText: 'Delete Item',
      isDestructive: true,
    });
    if (!confirmed) return;

    try {
      await deleteInventoryApi(id);
      showToast(`Item "${name}" removed from inventory.`, 'success');
      loadData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete inventory item.', 'error');
    }
  };

  return (
    <div className="marketplace-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Farm Inventory Management</h1>
          <p>Track seeds, fertilizers, chemical pesticides, harvest yields, and equipment stocks in real-time.</p>
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
          <span>{showForm ? 'Close Form' : 'Add Stock Item'}</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid" style={{ marginBottom: '2rem' }}>
        <div className="card">
          <div className="card-header">
            <Package size={24} className="icon-emerald" />
            <h3>Total Items</h3>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#1b4332', margin: '0.25rem 0' }}>
            {summary?.totalItems || 0}
          </div>
          <p className="card-description" style={{ marginBottom: 0 }}>
            Unique agricultural supplies tracked
          </p>
        </div>

        <div className="card" style={summary?.lowStockCount > 0 ? { borderColor: '#fca5a5', background: '#fff5f5' } : {}}>
          <div className="card-header">
            <AlertTriangle size={24} color={summary?.lowStockCount > 0 ? '#dc2626' : '#64748b'} />
            <h3 style={summary?.lowStockCount > 0 ? { color: '#dc2626' } : {}}>Low Stock Alerts</h3>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: summary?.lowStockCount > 0 ? '#dc2626' : '#2d6a4f', margin: '0.25rem 0' }}>
            {summary?.lowStockCount || 0}
          </div>
          <p className="card-description" style={{ marginBottom: 0 }}>
            {summary?.lowStockCount > 0 ? 'Items below minimum threshold level' : 'All stock levels healthy'}
          </p>
        </div>

        <div className="card">
          <div className="card-header">
            <Layers size={24} className="icon-blue" />
            <h3>Categories Tracked</h3>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', margin: '0.25rem 0' }}>
            {summary?.totalCategories || 0}
          </div>
          <p className="card-description" style={{ marginBottom: 0 }}>
            Active farm supply categories
          </p>
        </div>
      </div>

      {/* Create / Edit Inventory Form */}
      {showForm && (
        <div className="auth-card register-card" style={{ maxWidth: '100%', marginBottom: '2.5rem' }}>
          <div className="auth-header" style={{ textAlign: 'left', marginBottom: '1.25rem' }}>
            <h3>{editingId ? 'Edit Inventory Item' : 'Add New Farm Supply to Inventory'}</h3>
            <p>Ensure accurate counts to avoid unexpected shortages during critical farming windows</p>
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
                <label htmlFor="name">Item Name *</label>
                <input
                  type="text"
                  id="name"
                  placeholder="e.g. Basmati Paddy Seeds 1121, DAP Fertilizer"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                <label htmlFor="quantity">Stock Quantity *</label>
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
                <label htmlFor="unit">Unit of Measure *</label>
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

            <div className="form-group">
              <label htmlFor="minStockLevel">Minimum Stock Alert Threshold (units)</label>
              <input
                type="number"
                id="minStockLevel"
                placeholder="Alert when stock falls to this number (e.g. 10)"
                min="0"
                value={formData.minStockLevel}
                onChange={(e) => setFormData({ ...formData, minStockLevel: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Storage Location & Supplier Notes</label>
              <textarea
                id="description"
                rows="2"
                placeholder="Stored in South Barn Shed, Batch #B4, Expiry date..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              ></textarea>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              <button type="submit" className="btn-auth-submit" style={{ flex: 1 }} disabled={formLoading}>
                {formLoading ? 'Saving...' : editingId ? 'Update Stock Item' : 'Add to Inventory'}
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
              placeholder="Search inventory by item name or storage notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          {/* Low Stock Toggle Button */}
          <button
            type="button"
            className={`btn-secondary ${showLowStockOnly ? 'active-filter' : ''}`}
            onClick={() => setShowLowStockOnly(!showLowStockOnly)}
            style={{
              padding: '0.55rem 1rem',
              borderRadius: '6px',
              fontSize: '0.85rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: showLowStockOnly ? '#fee2e2' : '#f1f5f9',
              color: showLowStockOnly ? '#dc2626' : '#334155',
              borderColor: showLowStockOnly ? '#fca5a5' : '#cbd5e1',
            }}
          >
            <AlertTriangle size={15} color={showLowStockOnly ? '#dc2626' : '#64748b'} />
            <span>Low Stock Only ({summary?.lowStockCount || 0})</span>
          </button>
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

      {/* Inventory Items List */}
      {loading ? (
        <div className="loading-state">
          <RefreshCw size={28} className="spin" />
          <p>Loading farm inventory from MongoDB...</p>
        </div>
      ) : error ? (
        <div className="alert alert-error">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      ) : inventory.length === 0 ? (
        <div className="empty-state">
          <Package size={48} color="#94a3b8" />
          <h3>No inventory items found</h3>
          <p>Keep your farm organized by recording seed bags, fertilizer sacks, and harvest yields.</p>
          <button onClick={() => setShowForm(true)} className="btn-cta-primary">
            Add Your First Inventory Item
          </button>
        </div>
      ) : (
        <div className="products-grid">
          {inventory.map((item) => {
            const isLowStock = item.quantity <= item.minStockLevel;

            return (
              <div
                key={item._id}
                className="product-card"
                style={isLowStock ? { borderColor: '#fca5a5', background: '#fffafa' } : {}}
              >
                <div className="product-header">
                  <span className="product-category-tag">{item.category}</span>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '0.2rem 0.6rem',
                      borderRadius: '9999px',
                      backgroundColor: isLowStock ? '#fee2e2' : '#dcfce7',
                      color: isLowStock ? '#b91c1c' : '#15803d',
                      border: `1px solid ${isLowStock ? '#fca5a5' : '#86efac'}`,
                    }}
                  >
                    {isLowStock ? <AlertTriangle size={12} /> : <CheckCircle2 size={12} />}
                    {isLowStock ? 'LOW STOCK' : 'IN STOCK'}
                  </span>
                </div>

                <h3 className="product-name">{item.name}</h3>

                {/* Current Quantity Display */}
                <div style={{ margin: '0.75rem 0', display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                  <span style={{ fontSize: '2rem', fontWeight: 800, color: isLowStock ? '#dc2626' : '#1b4332', lineHeight: 1 }}>
                    {item.quantity}
                  </span>
                  <span style={{ fontSize: '1rem', color: '#64748b', fontWeight: 600 }}>{item.unit}</span>
                  <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#94a3b8' }}>
                    Threshold: {item.minStockLevel} {item.unit}
                  </span>
                </div>

                {/* Quick Quantity Adjuster */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <button
                    onClick={() => handleQuickAdjust(item, -1)}
                    disabled={item.quantity <= 0}
                    className="btn-secondary"
                    title="Deduct 1 unit"
                    style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '2px' }}
                  >
                    <Minus size={14} /> 1
                  </button>
                  <button
                    onClick={() => handleQuickAdjust(item, 1)}
                    className="btn-secondary"
                    title="Add 1 unit"
                    style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '2px' }}
                  >
                    <Plus size={14} /> 1
                  </button>
                  <button
                    onClick={() => handleQuickAdjust(item, 5)}
                    className="btn-secondary"
                    title="Add 5 units"
                    style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem' }}
                  >
                    +5
                  </button>
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
                    onClick={() => handleDelete(item._id, item.name)}
                    className="btn-delete-listing"
                    style={{ flex: 1, margin: 0 }}
                  >
                    <Trash2 size={13} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Inventory;
