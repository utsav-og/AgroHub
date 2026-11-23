import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home, ShoppingBag, LayoutDashboard, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function NotFound() {
  const { user } = useAuth();

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'buyer') return '/buyer-dashboard';
    return '/farmer-dashboard';
  };

  return (
    <div className="not-found-page">
      <div className="not-found-card">
        <div className="not-found-badge">
          <Compass size={48} color="#1b4332" />
        </div>
        <div className="not-found-code">404</div>
        <h1>Agricultural Page Not Found</h1>
        <p>
          The field, marketplace listing, or agricultural tool you are looking for does not exist,
          has been harvested, or has been relocated.
        </p>

        <div className="not-found-actions">
          <Link to="/" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
            <Home size={18} />
            <span>Return Home</span>
          </Link>
          <Link to="/marketplace" className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
            <ShoppingBag size={18} />
            <span>Explore Marketplace</span>
          </Link>
          {user && (
            <Link to={getDashboardPath()} className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
              <LayoutDashboard size={18} />
              <span>Go to My Dashboard</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default NotFound;
