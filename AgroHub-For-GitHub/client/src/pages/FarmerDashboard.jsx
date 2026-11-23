import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sprout,
  Receipt,
  Package,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  PlusCircle,
  RefreshCw,
  CloudSun,
  Tractor,
  Users,
  ShoppingBag,
  IndianRupee,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Trash2,
  Calendar,
} from 'lucide-react';
import {
  getProductsApi,
  deleteProductApi,
  getExpenseSummaryApi,
  getInventorySummaryApi,
  getFinancialReportApi,
  getWeatherApi,
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { getImageUrl } from '../utils/imageHelper';

function FarmerDashboard() {
  const { user } = useAuth();
  const { confirmAction, showToast } = useNotification();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState('');

  // Dashboard Metrics
  const [myCrops, setMyCrops] = useState([]);
  const [expenseSummary, setExpenseSummary] = useState(null);
  const [inventorySummary, setInventorySummary] = useState(null);
  const [financialReport, setFinancialReport] = useState(null);
  const [weatherData, setWeatherData] = useState(null);

  // Authentication & Access Check
  useEffect(() => {
    if (!user) {
      navigate('/login', {
        state: { message: 'Authentication Required: Please sign in as a farmer to access the Farmer Operations Hub.' }
      });
    } else if (user.role === 'admin') {
      navigate('/admin');
    } else if (user.role === 'buyer') {
      navigate('/buyer-dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (user && user.role === 'farmer') {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Load all products & filter by current farmer
      const productsRes = await getProductsApi();
      const allProducts = Array.isArray(productsRes.data) ? productsRes.data : [];
      const currentUserId = user?._id || user?.id;
      const farmerCrops = allProducts.filter((p) => {
        const farmerId = p.farmer?._id || p.farmer?.id || p.farmer;
        return (
          (farmerId && currentUserId && farmerId.toString() === currentUserId.toString()) ||
          (p.farmer?.email && user?.email && p.farmer.email.toLowerCase() === user.email.toLowerCase())
        );
      });
      setMyCrops(farmerCrops);

      // 2. Load Expense Summary
      try {
        const expRes = await getExpenseSummaryApi();
        setExpenseSummary(expRes.data || null);
      } catch (e) {
        console.warn('Expense summary unavailable:', e.message);
      }

      // 3. Load Inventory Summary
      try {
        const invRes = await getInventorySummaryApi();
        setInventorySummary(invRes.data || null);
      } catch (e) {
        console.warn('Inventory summary unavailable:', e.message);
      }

      // 4. Load Financial & Profitability Report
      try {
        const finRes = await getFinancialReportApi();
        setFinancialReport(finRes.data || null);
      } catch (e) {
        console.warn('Financial report unavailable:', e.message);
      }

      // 5. Load Local Weather Advisory
      try {
        const locationCity = user?.location ? user.location.split(',')[0].trim() : 'Ludhiana';
        const weatherRes = await getWeatherApi(locationCity || 'Ludhiana');
        setWeatherData(weatherRes.data || null);
      } catch (e) {
        console.warn('Weather advisory unavailable:', e.message);
      }
    } catch (err) {
      console.error('Farmer Dashboard Load Error:', err);
      setError('Unable to load some farmer dashboard data. Please try refreshing.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCrop = async (id, name) => {
    const confirmed = await confirmAction({
      title: 'Remove Crop Listing',
      message: `Are you sure you want to remove your crop listing "${name}" from the marketplace?`,
      confirmText: 'Remove Listing',
      isDestructive: true,
    });
    if (!confirmed) return;

    try {
      await deleteProductApi(id);
      setMyCrops((prev) => prev.filter((p) => p._id !== id));
      showToast(`Listing "${name}" successfully deleted.`, 'success');
      setActionSuccess(`Listing "${name}" successfully deleted.`);
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete listing.', 'error');
    }
  };

  if (!user || user.role !== 'farmer') {
    return null;
  }

  // Calculated values
  const totalIncome = financialReport?.totalIncome ?? 0;
  const totalExpenses = financialReport?.totalExpenses ?? (expenseSummary?.totalAmount ?? 0);
  const netProfit = financialReport?.netProfit ?? (totalIncome - totalExpenses);
  const isProfitable = financialReport?.isProfitable ?? (netProfit >= 0);
  const lowStockCount = inventorySummary?.lowStockCount ?? 0;

  return (
    <div className="marketplace-page">
      {/* Header Banner */}
      <div className="page-header">
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#16a34a', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.25rem' }}>
            <Sprout size={16} />
            <span>Farmer Operations Hub</span>
          </div>
          <h1>Welcome, {user.name}</h1>
          <p>Real-time farm financials, crop listings, inventory alerts, and agricultural modules.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button onClick={loadDashboardData} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <RefreshCw size={15} className={loading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>
          <Link to="/add-product" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', textDecoration: 'none' }}>
            <PlusCircle size={16} />
            <span>Post New Crop</span>
          </Link>
        </div>
      </div>

      {actionSuccess && (
        <div className="alert alert-success">
          <CheckCircle2 size={20} />
          <span>{actionSuccess}</span>
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          <AlertTriangle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Low-Stock Warning Alert Banner */}
      {lowStockCount > 0 && (
        <div
          style={{
            backgroundColor: '#fef3c7',
            border: '1px solid #f59e0b',
            borderRadius: '8px',
            padding: '1rem 1.25rem',
            marginBottom: '1.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <AlertTriangle size={22} color="#b45309" />
            <div>
              <strong style={{ color: '#92400e', fontSize: '0.95rem' }}>Inventory Low-Stock Warning:</strong>
              <span style={{ color: '#78350f', marginLeft: '0.5rem', fontSize: '0.9rem' }}>
                You have {lowStockCount} inventory supply item{lowStockCount > 1 ? 's' : ''} at or below minimum safety thresholds.
              </span>
            </div>
          </div>
          <Link
            to="/inventory"
            className="btn-secondary"
            style={{ padding: '0.4rem 0.9rem', fontSize: '0.85rem', textDecoration: 'none', backgroundColor: '#ffffff', borderColor: '#f59e0b', color: '#92400e' }}
          >
            Review Inventory Stock &rarr;
          </Link>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid" style={{ marginBottom: '2.5rem' }}>
        {/* Card 1: Crop Listings */}
        <div className="card">
          <div className="card-header">
            <ShoppingBag size={24} className="icon-emerald" />
            <h3>Active Crop Listings</h3>
          </div>
          <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#1b4332' }}>
            {myCrops.length}
          </div>
          <p className="card-description" style={{ marginBottom: '1rem' }}>
            Produce actively available for direct buyers on the marketplace.
          </p>
          <Link to="/marketplace" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#2d6a4f', fontWeight: 700, fontSize: '0.88rem', textDecoration: 'none' }}>
            <span>View in Marketplace</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* Card 2: Farm Expenses */}
        <div className="card">
          <div className="card-header">
            <Receipt size={24} className="icon-emerald" />
            <h3>Total Farm Expenses</h3>
          </div>
          <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#b91c1c' }}>
            ₹{totalExpenses.toLocaleString('en-IN')}
          </div>
          <p className="card-description" style={{ marginBottom: '1rem' }}>
            {expenseSummary?.totalTransactions || 0} expenses recorded &bull; Top category: {expenseSummary?.topCategory || 'N/A'}
          </p>
          <Link to="/expenses" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#2d6a4f', fontWeight: 700, fontSize: '0.88rem', textDecoration: 'none' }}>
            <span>Manage Farm Expenses</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* Card 3: Inventory Status */}
        <div className="card">
          <div className="card-header">
            <Package size={24} className="icon-emerald" />
            <h3>Farm Supplies Inventory</h3>
          </div>
          <div style={{ fontSize: '2.25rem', fontWeight: 800, color: lowStockCount > 0 ? '#b45309' : '#1b4332' }}>
            {inventorySummary?.totalItems ?? 0}
            <span style={{ fontSize: '1rem', fontWeight: 600, color: '#64748b', marginLeft: '6px' }}>Items</span>
          </div>
          <p className="card-description" style={{ marginBottom: '1rem' }}>
            {lowStockCount > 0 ? (
              <span style={{ color: '#b45309', fontWeight: 600 }}>⚠️ {lowStockCount} items low in stock!</span>
            ) : (
              <span style={{ color: '#16a34a', fontWeight: 600 }}>✓ All supply levels optimal</span>
            )}
          </p>
          <Link to="/inventory" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#2d6a4f', fontWeight: 700, fontSize: '0.88rem', textDecoration: 'none' }}>
            <span>Update Supply Stock</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* Card 4: Total Crop Income & Profit */}
        <div className="card" style={{ gridColumn: 'span 3' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={22} color="#1b4332" />
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#1b4332' }}>
                Crop Sales Income & Farm Profitability Overview
              </h3>
            </div>
            <Link
              to="/reports"
              className="btn-secondary"
              style={{ padding: '0.4rem 0.9rem', fontSize: '0.85rem', textDecoration: 'none' }}
            >
              Open Full Financial Report &rarr;
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
            <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>
                Total Crop Revenue
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#16a34a', marginTop: '0.25rem' }}>
                ₹{totalIncome.toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>
                {financialReport?.totalSalesCount || 0} recorded crop transactions
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>
                Total Farm Expenses
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#b91c1c', marginTop: '0.25rem' }}>
                ₹{totalExpenses.toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>
                Seeds, fertilizer, machinery & labor
              </div>
            </div>

            <div style={{ background: isProfitable ? '#f0fdf4' : '#fef2f2', padding: '1.25rem', borderRadius: '8px', border: `1px solid ${isProfitable ? '#bbf7d0' : '#fecaca'}` }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>
                  Estimated Net Profit
                </span>
                {isProfitable ? (
                  <span style={{ color: '#16a34a', display: 'flex', alignItems: 'center', fontSize: '0.85rem', fontWeight: 700 }}>
                    <ArrowUpRight size={16} /> Profitable
                  </span>
                ) : (
                  <span style={{ color: '#b91c1c', display: 'flex', alignItems: 'center', fontSize: '0.85rem', fontWeight: 700 }}>
                    <ArrowDownRight size={16} /> Net Deficit
                  </span>
                )}
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: isProfitable ? '#15803d' : '#b91c1c', marginTop: '0.25rem' }}>
                ₹{netProfit.toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>
                Profit Margin: <strong>{financialReport?.profitMargin ?? 0}%</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Weather Advisory Card */}
      {weatherData && (
        <div
          style={{
            background: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%)',
            color: '#ffffff',
            borderRadius: '12px',
            padding: '1.5rem 2rem',
            marginBottom: '2.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1.5rem',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.15)', padding: '0.75rem', borderRadius: '50%' }}>
              <CloudSun size={32} color="#fef08a" />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: '#a7f3d0', letterSpacing: '0.05em', fontWeight: 700 }}>
                Live Agro-Meteorological Advisory &bull; {weatherData.city || user.location || 'Local Region'}
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '0.25rem' }}>
                {weatherData.temperature}°C &bull; {weatherData.condition} &bull; Humidity: {weatherData.humidity}%
              </div>
              <p style={{ margin: '0.35rem 0 0', color: '#e2e8f0', fontSize: '0.88rem', maxWidth: '750px', lineHeight: 1.4 }}>
                {weatherData.advisory}
              </p>
            </div>
          </div>
          <Link
            to="/weather"
            className="btn-secondary"
            style={{
              backgroundColor: '#ffffff',
              color: '#1b4332',
              borderColor: '#ffffff',
              fontWeight: 700,
              padding: '0.5rem 1.1rem',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            Check 7-Day Forecast &rarr;
          </Link>
        </div>
      )}

      {/* Quick Links to All Farmer Modules */}
      <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1b4332', marginBottom: '1rem' }}>
        Quick Access to Farmer Modules
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem', marginBottom: '3rem' }}>
        <Link
          to="/add-product"
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '1.25rem',
            textDecoration: 'none',
            color: '#1e293b',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            transition: 'all 0.2s',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
          className="farmer-module-card"
        >
          <div style={{ background: '#d8f3dc', padding: '0.65rem', borderRadius: '8px' }}>
            <PlusCircle size={22} color="#1b4332" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>List New Crop</div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Post produce for buyers</div>
          </div>
        </Link>

        <Link
          to="/marketplace"
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '1.25rem',
            textDecoration: 'none',
            color: '#1e293b',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
          className="farmer-module-card"
        >
          <div style={{ background: '#e0f2fe', padding: '0.65rem', borderRadius: '8px' }}>
            <ShoppingBag size={22} color="#0369a1" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Crop Marketplace</div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Browse wholesale prices</div>
          </div>
        </Link>

        <Link
          to="/expenses"
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '1.25rem',
            textDecoration: 'none',
            color: '#1e293b',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
          className="farmer-module-card"
        >
          <div style={{ background: '#fee2e2', padding: '0.65rem', borderRadius: '8px' }}>
            <Receipt size={22} color="#b91c1c" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Expense Tracker</div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Log farming costs</div>
          </div>
        </Link>

        <Link
          to="/inventory"
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '1.25rem',
            textDecoration: 'none',
            color: '#1e293b',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
          className="farmer-module-card"
        >
          <div style={{ background: '#fef3c7', padding: '0.65rem', borderRadius: '8px' }}>
            <Package size={22} color="#b45309" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Farm Inventory</div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Seeds, fertilizer & stock</div>
          </div>
        </Link>

        <Link
          to="/reports"
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '1.25rem',
            textDecoration: 'none',
            color: '#1e293b',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
          className="farmer-module-card"
        >
          <div style={{ background: '#f3e8ff', padding: '0.65rem', borderRadius: '8px' }}>
            <TrendingUp size={22} color="#7e22ce" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Income & Profit Reports</div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Sales vs expense trends</div>
          </div>
        </Link>

        <Link
          to="/machinery"
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '1.25rem',
            textDecoration: 'none',
            color: '#1e293b',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
          className="farmer-module-card"
        >
          <div style={{ background: '#ecfdf5', padding: '0.65rem', borderRadius: '8px' }}>
            <Tractor size={22} color="#047857" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Machinery Rental</div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Rent or list equipment</div>
          </div>
        </Link>

        <Link
          to="/workers"
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '1.25rem',
            textDecoration: 'none',
            color: '#1e293b',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
          className="farmer-module-card"
        >
          <div style={{ background: '#fef2f2', padding: '0.65rem', borderRadius: '8px' }}>
            <Users size={22} color="#dc2626" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Worker Hiring</div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Hire harvesting labor</div>
          </div>
        </Link>

        <Link
          to="/weather"
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '1.25rem',
            textDecoration: 'none',
            color: '#1e293b',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
          className="farmer-module-card"
        >
          <div style={{ background: '#f0fdf4', padding: '0.65rem', borderRadius: '8px' }}>
            <CloudSun size={22} color="#16a34a" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Weather Forecast</div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Rain, wind & advisories</div>
          </div>
        </Link>
      </div>

      {/* Farmer's Crop Listings Table / Card List */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1b4332', margin: 0 }}>
            My Active Produce Listings ({myCrops.length})
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.88rem', margin: '0.25rem 0 0' }}>
            Manage the agricultural crops you have published to the marketplace.
          </p>
        </div>
        <Link
          to="/add-product"
          className="btn-primary"
          style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.88rem' }}
        >
          <PlusCircle size={15} />
          <span>Add Crop</span>
        </Link>
      </div>

      {myCrops.length === 0 ? (
        <div style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '10px', padding: '3rem 2rem', textAlign: 'center' }}>
          <ShoppingBag size={42} color="#94a3b8" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.2rem', color: '#334155', fontWeight: 700 }}>No crops listed yet</h3>
          <p style={{ color: '#64748b', maxWidth: '450px', margin: '0 auto 1.5rem', fontSize: '0.9rem' }}>
            Start selling your harvest directly to commercial buyers and food processors without intermediary commissions.
          </p>
          <Link to="/add-product" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <PlusCircle size={16} />
            <span>List Your First Crop</span>
          </Link>
        </div>
      ) : (
        <div style={{ background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontWeight: 600 }}>
                  <th style={{ padding: '0.9rem 1.25rem' }}>Crop / Produce</th>
                  <th style={{ padding: '0.9rem 1.25rem' }}>Category</th>
                  <th style={{ padding: '0.9rem 1.25rem' }}>Selling Price</th>
                  <th style={{ padding: '0.9rem 1.25rem' }}>Available Stock</th>
                  <th style={{ padding: '0.9rem 1.25rem' }}>Location</th>
                  <th style={{ padding: '0.9rem 1.25rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {myCrops.map((crop) => (
                  <tr key={crop._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.9rem 1.25rem', fontWeight: 700, color: '#1e293b' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {crop.imageUrl && getImageUrl(crop.imageUrl) ? (
                          <img
                            src={getImageUrl(crop.imageUrl)}
                            alt={crop.name}
                            style={{ width: '38px', height: '38px', borderRadius: '6px', objectFit: 'cover', border: '1px solid #e2e8f0' }}
                          />
                        ) : (
                          <div style={{ width: '38px', height: '38px', borderRadius: '6px', backgroundColor: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #dcfce7' }}>
                            <Sprout size={18} color="#16a34a" />
                          </div>
                        )}
                        <span>{crop.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '0.9rem 1.25rem' }}>
                      <span style={{ backgroundColor: '#d8f3dc', color: '#1b4332', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 600 }}>
                        {crop.category}
                      </span>
                    </td>
                    <td style={{ padding: '0.9rem 1.25rem', fontWeight: 700, color: '#16a34a' }}>
                      ₹{crop.price} / {crop.unit || 'kg'}
                    </td>
                    <td style={{ padding: '0.9rem 1.25rem', color: '#475569' }}>
                      {crop.quantity} {crop.unit || 'kg'}
                    </td>
                    <td style={{ padding: '0.9rem 1.25rem', color: '#64748b' }}>
                      {crop.location || 'Not specified'}
                    </td>
                    <td style={{ padding: '0.9rem 1.25rem', textAlign: 'right' }}>
                      <button
                        onClick={() => handleDeleteCrop(crop._id, crop.name)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#dc2626',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '0.35rem 0.6rem',
                          borderRadius: '4px',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                        }}
                        title="Delete listing"
                      >
                        <Trash2 size={15} />
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

export default FarmerDashboard;
