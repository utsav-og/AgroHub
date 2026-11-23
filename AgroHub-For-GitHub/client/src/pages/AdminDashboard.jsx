import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Users,
  ShoppingBag,
  Tractor,
  UserCheck,
  Trash2,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Lock,
  Layers,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react';
import {
  getAdminStatsApi,
  getAdminUsersApi,
  deleteAdminUserApi,
  getAdminListingsApi,
  deleteAdminProductApi,
  deleteAdminMachineryApi,
  deleteAdminWorkerApi,
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

function AdminDashboard() {
  const { user } = useAuth();
  const { confirmAction, showToast } = useNotification();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [listings, setListings] = useState({ products: [], machinery: [], workers: [] });
  const [activeTab, setActiveTab] = useState('users'); // 'users', 'products', 'machinery', 'workers'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState('');

  // Access control check
  useEffect(() => {
    if (!user) {
      navigate('/login', {
        state: { message: 'Administrator Authentication Required: Please sign in with administrator credentials.' }
      });
    } else if (user.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (user && user.role === 'admin') {
      loadAdminData();
    }
  }, [user]);

  const loadAdminData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, usersRes, listingsRes] = await Promise.all([
        getAdminStatsApi(),
        getAdminUsersApi(),
        getAdminListingsApi(),
      ]);
      setStats(statsRes.data);
      setUsersList(usersRes.data || []);
      setListings(listingsRes.data || { products: [], machinery: [], workers: [] });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load administrator portal data.');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (msg) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(''), 4000);
  };

  // Safe Deletion Handlers
  const handleDeleteUser = async (userId, name) => {
    const confirmed = await confirmAction({
      title: 'Delete User Account',
      message: `SECURITY CONFIRMATION: Are you sure you want to delete the user account "${name}"? This will remove their profile and all associated listings permanently.`,
      confirmText: 'Delete User',
      isDestructive: true,
    });
    if (!confirmed) return;

    try {
      await deleteAdminUserApi(userId);
      setUsersList((prev) => prev.filter((u) => u._id !== userId));
      showToast(`User "${name}" deleted successfully.`, 'success');
      showNotification(`User "${name}" deleted successfully.`);
      // Refresh stats
      const statsRes = await getAdminStatsApi();
      setStats(statsRes.data);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete user.', 'error');
    }
  };

  const handleDeleteProduct = async (id, name) => {
    const confirmed = await confirmAction({
      title: 'Delete Crop Listing',
      message: `Moderator action: Are you sure you want to remove crop listing "${name}" from the marketplace?`,
      confirmText: 'Delete Listing',
      isDestructive: true,
    });
    if (!confirmed) return;

    try {
      await deleteAdminProductApi(id);
      setListings((prev) => ({ ...prev, products: prev.products.filter((p) => p._id !== id) }));
      showToast(`Product "${name}" removed.`, 'success');
      showNotification(`Product "${name}" removed.`);
    } catch (err) {
      showToast(err.message || 'Error deleting product', 'error');
    }
  };

  const handleDeleteMachinery = async (id, name) => {
    const confirmed = await confirmAction({
      title: 'Delete Machinery Listing',
      message: `Moderator action: Are you sure you want to remove machinery rental "${name}"?`,
      confirmText: 'Delete Machinery',
      isDestructive: true,
    });
    if (!confirmed) return;

    try {
      await deleteAdminMachineryApi(id);
      setListings((prev) => ({ ...prev, machinery: prev.machinery.filter((m) => m._id !== id) }));
      showToast(`Machinery "${name}" removed.`, 'success');
      showNotification(`Machinery "${name}" removed.`);
    } catch (err) {
      showToast(err.message || 'Error deleting machinery', 'error');
    }
  };

  const handleDeleteWorker = async (id, name) => {
    const confirmed = await confirmAction({
      title: 'Delete Worker Profile',
      message: `Moderator action: Are you sure you want to remove worker profile "${name}"?`,
      confirmText: 'Delete Profile',
      isDestructive: true,
    });
    if (!confirmed) return;

    try {
      await deleteAdminWorkerApi(id);
      setListings((prev) => ({ ...prev, workers: prev.workers.filter((w) => w._id !== id) }));
      showToast(`Worker profile "${name}" removed.`, 'success');
      showNotification(`Worker profile "${name}" removed.`);
    } catch (err) {
      showToast(err.message || 'Error deleting worker', 'error');
    }
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="marketplace-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#16a34a', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.25rem' }}>
            <Lock size={15} />
            <span>Administrator Control Center</span>
          </div>
          <h1>Platform Administration Dashboard</h1>
          <p>System-wide metrics, user account moderation, and platform listings oversight.</p>
        </div>
        <button onClick={loadAdminData} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <RefreshCw size={15} className={loading ? 'spin' : ''} />
          <span>Refresh Data</span>
        </button>
      </div>

      {actionSuccess && (
        <div className="alert alert-success">
          <CheckCircle2 size={20} />
          <span>{actionSuccess}</span>
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid" style={{ marginBottom: '2.5rem' }}>
        <div className="card">
          <div className="card-header">
            <Users size={24} className="icon-emerald" />
            <h3>Registered Users</h3>
          </div>
          <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#1b4332' }}>
            {stats?.users.total || 0}
          </div>
          <p className="card-description" style={{ marginBottom: 0 }}>
            {stats?.users.farmers || 0} Farmers &bull; {stats?.users.buyers || 0} Buyers
          </p>
        </div>

        <div className="card">
          <div className="card-header">
            <ShoppingBag size={24} className="icon-blue" />
            <h3>Marketplace Listings</h3>
          </div>
          <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#2563eb' }}>
            {stats?.listings.products || 0}
          </div>
          <p className="card-description" style={{ marginBottom: 0 }}>
            Active farm produce listings
          </p>
        </div>

        <div className="card">
          <div className="card-header">
            <Tractor size={24} className="icon-purple" />
            <h3>Machinery Rentals</h3>
          </div>
          <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#7c3aed' }}>
            {stats?.listings.machinery || 0}
          </div>
          <p className="card-description" style={{ marginBottom: 0 }}>
            Equipment & tractors listed
          </p>
        </div>

        <div className="card">
          <div className="card-header">
            <UserCheck size={24} className="icon-emerald" />
            <h3>Labor Profiles</h3>
          </div>
          <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#059669' }}>
            {stats?.listings.workers || 0}
          </div>
          <p className="card-description" style={{ marginBottom: 0 }}>
            Agricultural worker groups
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="category-filter-bar" style={{ marginBottom: '1.5rem' }}>
        <div className="filter-pills">
          <button
            className={`pill-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            Registered Users ({usersList.length})
          </button>
          <button
            className={`pill-btn ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            Crop Listings ({listings.products.length})
          </button>
          <button
            className={`pill-btn ${activeTab === 'machinery' ? 'active' : ''}`}
            onClick={() => setActiveTab('machinery')}
          >
            Machinery ({listings.machinery.length})
          </button>
          <button
            className={`pill-btn ${activeTab === 'workers' ? 'active' : ''}`}
            onClick={() => setActiveTab('workers')}
          >
            Worker Profiles ({listings.workers.length})
          </button>
        </div>
      </div>

      {/* Tab 1: Users List */}
      {activeTab === 'users' && (
        <div className="card">
          <div className="card-header" style={{ marginBottom: '1rem' }}>
            <Users size={20} className="icon-emerald" />
            <h3>Registered User Accounts (Safe Moderation)</h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b', textAlign: 'left' }}>
                  <th style={{ padding: '0.75rem' }}>Name</th>
                  <th style={{ padding: '0.75rem' }}>Email</th>
                  <th style={{ padding: '0.75rem' }}>Role</th>
                  <th style={{ padding: '0.75rem' }}>Phone</th>
                  <th style={{ padding: '0.75rem' }}>Location</th>
                  <th style={{ padding: '0.75rem' }}>Joined</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {usersList.map((u) => {
                  const isCurrentAdmin = u._id === user._id;

                  return (
                    <tr key={u._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.75rem', fontWeight: 600 }}>{u.name}</td>
                      <td style={{ padding: '0.75rem', color: '#64748b' }}>{u.email}</td>
                      <td style={{ padding: '0.75rem' }}>
                        <span className={`role-badge ${u.role}`}>{u.role}</span>
                      </td>
                      <td style={{ padding: '0.75rem' }}>{u.phone || '—'}</td>
                      <td style={{ padding: '0.75rem' }}>{u.location || '—'}</td>
                      <td style={{ padding: '0.75rem', color: '#94a3b8', fontSize: '0.8rem' }}>
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                        {!isCurrentAdmin ? (
                          <button
                            onClick={() => handleDeleteUser(u._id, u.name)}
                            className="btn-delete-listing"
                            style={{ display: 'inline-flex', width: 'auto', padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                            title="Delete user account and cascade delete listings"
                          >
                            <Trash2 size={13} />
                            <span>Delete</span>
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600 }}>Active Admin</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Products List */}
      {activeTab === 'products' && (
        <div className="card">
          <div className="card-header" style={{ marginBottom: '1rem' }}>
            <ShoppingBag size={20} className="icon-blue" />
            <h3>Marketplace Crop Listings</h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b', textAlign: 'left' }}>
                  <th style={{ padding: '0.75rem' }}>Produce Name</th>
                  <th style={{ padding: '0.75rem' }}>Category</th>
                  <th style={{ padding: '0.75rem' }}>Price</th>
                  <th style={{ padding: '0.75rem' }}>Quantity</th>
                  <th style={{ padding: '0.75rem' }}>Farmer</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {listings.products.map((p) => (
                  <tr key={p._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.75rem', fontWeight: 600 }}>{p.name}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <span className="product-category-tag">{p.category}</span>
                    </td>
                    <td style={{ padding: '0.75rem', fontWeight: 700, color: '#15803d' }}>
                      ₹{p.price} / {p.unit}
                    </td>
                    <td style={{ padding: '0.75rem' }}>{p.quantity} {p.unit}</td>
                    <td style={{ padding: '0.75rem' }}>{p.farmer?.name || 'Unknown'}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                      <button
                        onClick={() => handleDeleteProduct(p._id, p.name)}
                        className="btn-delete-listing"
                        style={{ display: 'inline-flex', width: 'auto', padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                      >
                        <Trash2 size={13} />
                        <span>Delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Machinery List */}
      {activeTab === 'machinery' && (
        <div className="card">
          <div className="card-header" style={{ marginBottom: '1rem' }}>
            <Tractor size={20} className="icon-purple" />
            <h3>Machinery Rental Listings</h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b', textAlign: 'left' }}>
                  <th style={{ padding: '0.75rem' }}>Machine Name</th>
                  <th style={{ padding: '0.75rem' }}>Category</th>
                  <th style={{ padding: '0.75rem' }}>Rental Rate</th>
                  <th style={{ padding: '0.75rem' }}>Location</th>
                  <th style={{ padding: '0.75rem' }}>Owner</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {listings.machinery.map((m) => (
                  <tr key={m._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.75rem', fontWeight: 600 }}>{m.name}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <span className="product-category-tag">{m.category}</span>
                    </td>
                    <td style={{ padding: '0.75rem', fontWeight: 700, color: '#1b4332' }}>
                      ₹{m.rentalPricePerDay} / day
                    </td>
                    <td style={{ padding: '0.75rem' }}>{m.location}</td>
                    <td style={{ padding: '0.75rem' }}>{m.owner?.name || 'Unknown'}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                      <button
                        onClick={() => handleDeleteMachinery(m._id, m.name)}
                        className="btn-delete-listing"
                        style={{ display: 'inline-flex', width: 'auto', padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                      >
                        <Trash2 size={13} />
                        <span>Delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Workers List */}
      {activeTab === 'workers' && (
        <div className="card">
          <div className="card-header" style={{ marginBottom: '1rem' }}>
            <UserCheck size={20} className="icon-emerald" />
            <h3>Agricultural Worker Profiles</h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b', textAlign: 'left' }}>
                  <th style={{ padding: '0.75rem' }}>Worker Name</th>
                  <th style={{ padding: '0.75rem' }}>Skills</th>
                  <th style={{ padding: '0.75rem' }}>Daily Wage</th>
                  <th style={{ padding: '0.75rem' }}>Experience</th>
                  <th style={{ padding: '0.75rem' }}>Contact</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {listings.workers.map((w) => (
                  <tr key={w._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.75rem', fontWeight: 600 }}>{w.name}</td>
                    <td style={{ padding: '0.75rem' }}>{w.skills.join(', ')}</td>
                    <td style={{ padding: '0.75rem', fontWeight: 700, color: '#1b4332' }}>
                      ₹{w.dailyWage} / day
                    </td>
                    <td style={{ padding: '0.75rem' }}>{w.experienceYears} Yrs</td>
                    <td style={{ padding: '0.75rem' }}>{w.phone}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                      <button
                        onClick={() => handleDeleteWorker(w._id, w.name)}
                        className="btn-delete-listing"
                        style={{ display: 'inline-flex', width: 'auto', padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                      >
                        <Trash2 size={13} />
                        <span>Delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
