import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Tractor,
  Users,
  Search,
  ArrowRight,
  RefreshCw,
  MapPin,
  Phone,
  Mail,
  User,
  CheckCircle2,
  AlertCircle,
  Tag,
  CloudSun,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { getProductsApi, getMachineryApi, getWorkersApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

function BuyerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Data sets
  const [crops, setCrops] = useState([]);
  const [machinery, setMachinery] = useState([]);
  const [workers, setWorkers] = useState([]);

  // Access control check
  useEffect(() => {
    if (!user) {
      navigate('/login', {
        state: { message: 'Authentication Required: Please sign in as a buyer to access the Buyer & Consumer Portal.' }
      });
    } else if (user.role === 'admin') {
      navigate('/admin');
    } else if (user.role === 'farmer') {
      navigate('/farmer-dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (user && user.role === 'buyer') {
      loadBuyerData();
    }
  }, [user]);

  const loadBuyerData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [cropsRes, machRes, workersRes] = await Promise.all([
        getProductsApi(),
        getMachineryApi(),
        getWorkersApi(),
      ]);

      setCrops(Array.isArray(cropsRes.data) ? cropsRes.data : []);
      setMachinery(Array.isArray(machRes.data) ? machRes.data : []);
      setWorkers(Array.isArray(workersRes.data) ? workersRes.data : []);
    } catch (err) {
      console.error('Buyer Dashboard Load Error:', err);
      setError('Unable to fetch live marketplace listings. Please try refreshing.');
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== 'buyer') {
    return null;
  }

  // Previews (top 3 for each module)
  const recentCrops = crops.slice(0, 3);
  const recentMachinery = machinery.slice(0, 3);
  const recentWorkers = workers.slice(0, 3);

  const categories = ['Grains', 'Vegetables', 'Fruits', 'Pulses', 'Seeds'];

  return (
    <div className="marketplace-page">
      {/* Header Banner */}
      <div className="page-header">
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#16a34a', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.25rem' }}>
            <ShoppingBag size={16} />
            <span>Buyer & Consumer Portal</span>
          </div>
          <h1>Welcome, {user.name}</h1>
          <p>Browse farm-fresh produce directly from verified growers, rent machinery, and hire agricultural labor.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button onClick={loadBuyerData} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <RefreshCw size={15} className={loading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>
          <Link to="/marketplace" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', textDecoration: 'none' }}>
            <ShoppingBag size={16} />
            <span>Full Marketplace</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Quick Access to Marketplace Hero Card */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%)',
          color: '#ffffff',
          borderRadius: '12px',
          padding: '2rem',
          marginBottom: '2.5rem',
          boxShadow: '0 4px 15px rgba(27, 67, 50, 0.15)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 255, 255, 0.2)', padding: '0.25rem 0.75rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <Sparkles size={14} color="#fef08a" />
              <span>Direct Farm-Gate Sourcing</span>
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0.5rem 0 0.25rem', color: '#ffffff' }}>
              Quick Access to Crop Marketplace
            </h2>
            <p style={{ margin: 0, color: '#e2e8f0', fontSize: '0.95rem', maxWidth: '650px' }}>
              Buy wholesale grains, vegetables, and pulses with 0% intermediary commission. Contact farmers directly via verified phone and location.
            </p>
          </div>
          <Link
            to="/marketplace"
            className="btn-secondary"
            style={{
              backgroundColor: '#ffffff',
              color: '#1b4332',
              borderColor: '#ffffff',
              fontWeight: 700,
              padding: '0.65rem 1.4rem',
              fontSize: '0.95rem',
              textDecoration: 'none',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            }}
          >
            Explore All Produce &rarr;
          </Link>
        </div>

        {/* Category Filter Shortcuts */}
        <div>
          <div style={{ fontSize: '0.82rem', color: '#a7f3d0', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.65rem' }}>
            Fast Category Shortcuts:
          </div>
          <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
            {categories.map((cat) => (
              <Link
                key={cat}
                to={`/marketplace?category=${encodeURIComponent(cat)}`}
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  padding: '0.35rem 0.85rem',
                  borderRadius: '20px',
                  textDecoration: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  transition: 'background 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Tag size={12} />
                <span>{cat}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid" style={{ marginBottom: '3rem' }}>
        <div className="card">
          <div className="card-header">
            <ShoppingBag size={24} className="icon-emerald" />
            <h3>Fresh Crops Listed</h3>
          </div>
          <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#1b4332' }}>
            {crops.length}
          </div>
          <p className="card-description" style={{ marginBottom: '1rem' }}>
            Available crop harvests from local farmers across the region.
          </p>
          <Link to="/marketplace" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#2d6a4f', fontWeight: 700, fontSize: '0.88rem', textDecoration: 'none' }}>
            <span>Browse All Produce</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="card">
          <div className="card-header">
            <Tractor size={24} className="icon-emerald" />
            <h3>Machinery for Rent</h3>
          </div>
          <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#1b4332' }}>
            {machinery.length}
          </div>
          <p className="card-description" style={{ marginBottom: '1rem' }}>
            Tractors, harvesters, tillers, and sprayers ready for hire.
          </p>
          <Link to="/machinery" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#2d6a4f', fontWeight: 700, fontSize: '0.88rem', textDecoration: 'none' }}>
            <span>Explore Machinery</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="card">
          <div className="card-header">
            <Users size={24} className="icon-emerald" />
            <h3>Verified Workers</h3>
          </div>
          <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#1b4332' }}>
            {workers.length}
          </div>
          <p className="card-description" style={{ marginBottom: '1rem' }}>
            Skilled labor profiles for planting, weeding, and harvesting.
          </p>
          <Link to="/workers" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#2d6a4f', fontWeight: 700, fontSize: '0.88rem', textDecoration: 'none' }}>
            <span>Find Farm Labor</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* SECTION 1: Browse Available Crops */}
      <div style={{ marginBottom: '3.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1b4332', margin: 0 }}>
              Featured Fresh Crops
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.88rem', margin: '0.25rem 0 0' }}>
              Direct from farm harvests with transparent pricing and verified grower details.
            </p>
          </div>
          <Link
            to="/marketplace"
            className="btn-secondary"
            style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
          >
            <span>View All ({crops.length})</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {recentCrops.length === 0 ? (
          <div style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '10px', padding: '2.5rem', textAlign: 'center', color: '#64748b' }}>
            No crops currently listed. Check back soon!
          </div>
        ) : (
          <div className="grid">
            {recentCrops.map((crop) => (
              <div key={crop._id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <span style={{ backgroundColor: '#d8f3dc', color: '#1b4332', padding: '0.25rem 0.65rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700 }}>
                      {crop.category}
                    </span>
                    <span style={{ color: '#16a34a', fontWeight: 800, fontSize: '1.25rem' }}>
                      ₹{crop.price} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#64748b' }}>/ {crop.unit || 'kg'}</span>
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.5rem' }}>
                    {crop.name}
                  </h3>
                  <p style={{ color: '#64748b', fontSize: '0.88rem', lineHeight: 1.5, marginBottom: '1rem' }}>
                    {crop.description || 'Farm-fresh harvest ready for immediate wholesale or retail dispatch.'}
                  </p>
                </div>

                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#475569', fontSize: '0.82rem', marginBottom: '0.35rem' }}>
                    <User size={14} color="#16a34a" />
                    <span>Farmer: <strong>{crop.farmer?.name || 'Local Farmer'}</strong></span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', fontSize: '0.82rem', marginBottom: '0.85rem' }}>
                    <MapPin size={14} />
                    <span>{crop.location || 'Regional Mandi'} &bull; Available: {crop.quantity} {crop.unit || 'kg'}</span>
                  </div>
                  <Link
                    to="/marketplace"
                    className="btn-primary"
                    style={{ width: '100%', textAlign: 'center', display: 'block', textDecoration: 'none', padding: '0.55rem', fontSize: '0.88rem' }}
                  >
                    View in Marketplace
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 2: Explore Machinery Rentals */}
      <div style={{ marginBottom: '3.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1b4332', margin: 0 }}>
              Available Agricultural Machinery
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.88rem', margin: '0.25rem 0 0' }}>
              Rent heavy-duty tractors, harvesters, and sprayers at affordable daily rates.
            </p>
          </div>
          <Link
            to="/machinery"
            className="btn-secondary"
            style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
          >
            <span>View All Machinery ({machinery.length})</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {recentMachinery.length === 0 ? (
          <div style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '10px', padding: '2.5rem', textAlign: 'center', color: '#64748b' }}>
            No machinery currently listed for rent.
          </div>
        ) : (
          <div className="grid">
            {recentMachinery.map((item) => (
              <div key={item._id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <span style={{ backgroundColor: '#e0f2fe', color: '#0369a1', padding: '0.25rem 0.65rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700 }}>
                      {item.category}
                    </span>
                    <span style={{ color: '#0369a1', fontWeight: 800, fontSize: '1.25rem' }}>
                      ₹{item.rentalPricePerDay} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#64748b' }}>/ day</span>
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.5rem' }}>
                    {item.name}
                  </h3>
                  <p style={{ color: '#64748b', fontSize: '0.88rem', lineHeight: 1.5, marginBottom: '1rem' }}>
                    {item.description || 'Reliable agricultural equipment maintained in excellent working order.'}
                  </p>
                </div>

                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', fontSize: '0.82rem', marginBottom: '0.85rem' }}>
                    <MapPin size={14} />
                    <span>Location: <strong>{item.location || 'Local Region'}</strong></span>
                  </div>
                  <Link
                    to="/machinery"
                    className="btn-secondary"
                    style={{ width: '100%', textAlign: 'center', display: 'block', textDecoration: 'none', padding: '0.55rem', fontSize: '0.88rem', fontWeight: 700 }}
                  >
                    View Rental Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 3: Find Agricultural Workers */}
      <div style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1b4332', margin: 0 }}>
              Verified Agricultural Workers
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.88rem', margin: '0.25rem 0 0' }}>
              Connect directly with verified farm hands for sowing, harvesting, and equipment operation.
            </p>
          </div>
          <Link
            to="/workers"
            className="btn-secondary"
            style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
          >
            <span>View All Workers ({workers.length})</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {recentWorkers.length === 0 ? (
          <div style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '10px', padding: '2.5rem', textAlign: 'center', color: '#64748b' }}>
            No worker profiles registered yet.
          </div>
        ) : (
          <div className="grid">
            {recentWorkers.map((w) => (
              <div key={w._id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <span style={{ backgroundColor: '#fef2f2', color: '#dc2626', padding: '0.25rem 0.65rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700 }}>
                      {w.experienceYears} Years Exp.
                    </span>
                    <span style={{ color: '#dc2626', fontWeight: 800, fontSize: '1.25rem' }}>
                      ₹{w.dailyWage} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#64748b' }}>/ day</span>
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.5rem' }}>
                    {w.name}
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1rem' }}>
                    {w.skills && w.skills.map((s, idx) => (
                      <span key={idx} style={{ background: '#f1f5f9', color: '#334155', fontSize: '0.75rem', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', fontSize: '0.82rem', marginBottom: '0.4rem' }}>
                    <MapPin size={14} />
                    <span>{w.location || 'Local Region'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#16a34a', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.85rem' }}>
                    <Phone size={14} />
                    <span>Contact: {w.phone || 'Direct in Profile'}</span>
                  </div>
                  <Link
                    to="/workers"
                    className="btn-secondary"
                    style={{ width: '100%', textAlign: 'center', display: 'block', textDecoration: 'none', padding: '0.55rem', fontSize: '0.88rem', fontWeight: 700 }}
                  >
                    View Worker Profile
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default BuyerDashboard;
