import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Home,
  LayoutDashboard,
  ShoppingBag,
  Tractor,
  Users,
  CloudSun,
  Receipt,
  Package,
  TrendingUp,
  ShieldAlert,
  User,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ProfileModal from './ProfileModal';

function Navbar() {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const navigate = useNavigate();

  const dashboardPath = user
    ? user.role === 'admin'
      ? '/admin'
      : user.role === 'buyer'
      ? '/buyer-dashboard'
      : '/farmer-dashboard'
    : '/dashboard';

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/');
  };

  const closeMenu = () => setMobileMenuOpen(false);

  // If already on the clicked path, smoothly scroll to top; close mobile menu
  const handleNavClick = (to) => {
    closeMenu();
    if (window.location.pathname === to) {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }
  };

  // Close mobile drawer on Escape key or when window is resized to desktop width
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        closeMenu();
      }
    };

    const handleResize = () => {
      if (window.innerWidth > 1180 && mobileMenuOpen) {
        closeMenu();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
    };
  }, [mobileMenuOpen]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  return (
    <>
      <nav className="navbar" role="navigation" aria-label="Main Navigation">
        <div className="nav-container">
          {/* Brand Logo */}
          <Link to="/" className="nav-brand" onClick={() => handleNavClick('/')} aria-label="AgroHub Home">
            <img src="/logo.png" alt="AgroHub Logo" className="brand-logo-img" />
            <div className="brand-text">
              <span className="brand-title">AgroHub</span>
              <span className="brand-subtitle">Smart Agriculture</span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="nav-links desktop-only">
            <NavLink
              to="/"
              onClick={() => handleNavClick('/')}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              end
            >
              <Home size={15} />
              <span>Home</span>
            </NavLink>

            {user && (
              <NavLink
                to={dashboardPath}
                onClick={() => handleNavClick(dashboardPath)}
                className={({ isActive }) => (isActive ? 'nav-link active nav-link-dashboard' : 'nav-link nav-link-dashboard')}
              >
                <LayoutDashboard size={15} />
                <span>Dashboard</span>
              </NavLink>
            )}

            <NavLink
              to="/marketplace"
              onClick={() => handleNavClick('/marketplace')}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              <ShoppingBag size={15} />
              <span>Marketplace</span>
            </NavLink>

            <NavLink
              to="/machinery"
              onClick={() => handleNavClick('/machinery')}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              title="Machinery Rental"
            >
              <Tractor size={15} />
              <span>Machinery</span>
            </NavLink>

            <NavLink
              to="/workers"
              onClick={() => handleNavClick('/workers')}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              title="Worker Hiring"
            >
              <Users size={15} />
              <span>Workers</span>
            </NavLink>

            <NavLink
              to="/weather"
              onClick={() => handleNavClick('/weather')}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              <CloudSun size={15} />
              <span>Weather</span>
            </NavLink>

            {user && user.role === 'farmer' && (
              <>
                <NavLink
                  to="/expenses"
                  onClick={() => handleNavClick('/expenses')}
                  className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                >
                  <Receipt size={15} />
                  <span>Expenses</span>
                </NavLink>
                <NavLink
                  to="/inventory"
                  onClick={() => handleNavClick('/inventory')}
                  className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                >
                  <Package size={15} />
                  <span>Inventory</span>
                </NavLink>
                <NavLink
                  to="/reports"
                  onClick={() => handleNavClick('/reports')}
                  className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                >
                  <TrendingUp size={15} />
                  <span>Reports</span>
                </NavLink>
              </>
            )}

            {user && user.role === 'admin' && (
              <>
                <NavLink
                  to="/reports"
                  onClick={() => handleNavClick('/reports')}
                  className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                >
                  <TrendingUp size={15} />
                  <span>Reports</span>
                </NavLink>
                <NavLink
                  to="/admin"
                  onClick={() => handleNavClick('/admin')}
                  className={({ isActive }) => (isActive ? 'nav-link active nav-link-admin' : 'nav-link nav-link-admin')}
                >
                  <ShieldAlert size={15} />
                  <span>Admin</span>
                </NavLink>
              </>
            )}
          </div>

          {/* User Auth Buttons (Desktop) */}
          <div className="nav-auth desktop-only">
            {user ? (
              <div className="user-profile-menu">
                <button
                  type="button"
                  onClick={() => setProfileModalOpen(true)}
                  className="user-tag btn-user-profile"
                  title="Click to view and edit your profile"
                  aria-label="User Profile"
                >
                  <User size={15} />
                  <span className="user-name">{user.name.split(' ')[0]}</span>
                  <span className={`role-badge ${user.role}`}>{user.role}</span>
                </button>
                <button onClick={handleLogout} className="btn-logout" title="Log Out" aria-label="Log Out">
                  <LogOut size={15} />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="auth-actions">
                <Link to="/login" onClick={() => handleNavClick('/login')} className="btn-nav-login">
                  Login
                </Link>
                <Link to="/register" onClick={() => handleNavClick('/register')} className="btn-nav-register">
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>

        {/* Mobile Drawer Menu */}
        {mobileMenuOpen && (
          <div className="mobile-menu" role="menu">
            <NavLink
              to="/"
              onClick={() => handleNavClick('/')}
              className={({ isActive }) => (isActive ? 'mobile-link active' : 'mobile-link')}
              end
            >
              <Home size={18} />
              <span>Home</span>
            </NavLink>

            {user && (
              <NavLink
                to={dashboardPath}
                onClick={() => handleNavClick(dashboardPath)}
                className={({ isActive }) => (isActive ? 'mobile-link active mobile-link-dashboard' : 'mobile-link mobile-link-dashboard')}
              >
                <LayoutDashboard size={18} />
                <span>{user.role === 'admin' ? 'Admin Dashboard' : user.role === 'buyer' ? 'Buyer Dashboard' : 'Farmer Dashboard'}</span>
              </NavLink>
            )}

            <NavLink
              to="/marketplace"
              onClick={() => handleNavClick('/marketplace')}
              className={({ isActive }) => (isActive ? 'mobile-link active' : 'mobile-link')}
            >
              <ShoppingBag size={18} />
              <span>Marketplace</span>
            </NavLink>

            <NavLink
              to="/machinery"
              onClick={() => handleNavClick('/machinery')}
              className={({ isActive }) => (isActive ? 'mobile-link active' : 'mobile-link')}
            >
              <Tractor size={18} />
              <span>Machinery Rental</span>
            </NavLink>

            <NavLink
              to="/workers"
              onClick={() => handleNavClick('/workers')}
              className={({ isActive }) => (isActive ? 'mobile-link active' : 'mobile-link')}
            >
              <Users size={18} />
              <span>Worker Hiring</span>
            </NavLink>

            <NavLink
              to="/weather"
              onClick={() => handleNavClick('/weather')}
              className={({ isActive }) => (isActive ? 'mobile-link active' : 'mobile-link')}
            >
              <CloudSun size={18} />
              <span>Weather Forecast</span>
            </NavLink>

            {user && user.role === 'farmer' && (
              <>
                <NavLink
                  to="/expenses"
                  onClick={() => handleNavClick('/expenses')}
                  className={({ isActive }) => (isActive ? 'mobile-link active' : 'mobile-link')}
                >
                  <Receipt size={18} />
                  <span>Farm Expense Tracker</span>
                </NavLink>
                <NavLink
                  to="/inventory"
                  onClick={() => handleNavClick('/inventory')}
                  className={({ isActive }) => (isActive ? 'mobile-link active' : 'mobile-link')}
                >
                  <Package size={18} />
                  <span>Farm Inventory</span>
                </NavLink>
                <NavLink
                  to="/reports"
                  onClick={() => handleNavClick('/reports')}
                  className={({ isActive }) => (isActive ? 'mobile-link active' : 'mobile-link')}
                >
                  <TrendingUp size={18} />
                  <span>Financial &amp; Profit Reports</span>
                </NavLink>
              </>
            )}

            {user && user.role === 'admin' && (
              <NavLink
                to="/admin"
                onClick={() => handleNavClick('/admin')}
                className={({ isActive }) => (isActive ? 'mobile-link active mobile-link-admin' : 'mobile-link mobile-link-admin')}
              >
                <ShieldAlert size={18} />
                <span>Admin Portal</span>
              </NavLink>
            )}

            {/* Mobile Auth / User Section */}
            <div className="mobile-auth-section">
              {user ? (
                <div className="mobile-user-box">
                  <button
                    type="button"
                    onClick={() => {
                      closeMenu();
                      setProfileModalOpen(true);
                    }}
                    className="mobile-user-info btn-mobile-user-profile"
                    title="Click to view and edit your profile"
                  >
                    <User size={18} />
                    <span className="mobile-user-name">{user.name}</span>
                    <span className={`role-badge ${user.role}`}>{user.role}</span>
                  </button>
                  <button onClick={handleLogout} className="btn-mobile-logout" title="Log Out">
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <div className="mobile-auth-buttons">
                  <Link to="/login" onClick={() => handleNavClick('/login')} className="btn-nav-login block">
                    Login
                  </Link>
                  <Link to="/register" onClick={() => handleNavClick('/register')} className="btn-nav-register block">
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Mobile Drawer Backdrop Overlay */}
      {mobileMenuOpen && (
        <div
          className="mobile-menu-backdrop"
          onClick={closeMenu}
          aria-hidden="true"
        />
      )}

      {/* User Profile Popup Modal */}
      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      />
    </>
  );
}

export default Navbar;
