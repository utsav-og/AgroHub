import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, LogIn, AlertCircle, CheckCircle2, Sprout, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const infoMessage = location.state?.message;

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // If already logged in, redirect to role-specific dashboard
  React.useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.role === 'buyer') {
        navigate('/buyer-dashboard');
      } else {
        navigate('/farmer-dashboard');
      }
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error once user starts editing
    if (errorMessage) setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!formData.email || !formData.password) {
      setErrorMessage('Please enter both your email address and password.');
      return;
    }

    setLoading(true);
    const result = await login(formData.email, formData.password);
    setLoading(false);

    if (result.success) {
      const userRole = result.user?.role;
      let targetPath = '/farmer-dashboard';
      let dashboardName = 'Farmer Dashboard';

      if (userRole === 'admin') {
        targetPath = '/admin';
        dashboardName = 'Admin Dashboard';
      } else if (userRole === 'buyer') {
        targetPath = '/buyer-dashboard';
        dashboardName = 'Buyer Dashboard';
      }

      setSuccessMessage(`Login successful! Redirecting to ${dashboardName}...`);
      setTimeout(() => {
        navigate(targetPath);
      }, 900);
    } else {
      setErrorMessage(result.message || 'Unable to log in. Please check your credentials.');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Header */}
        <div className="auth-header">
          <div className="auth-brand-badge">
            <img src="/logo.png" alt="AgroHub Logo" className="auth-brand-logo-img" />
          </div>
          <h2>Welcome Back to AgroHub</h2>
          <p>Login to manage your agricultural listings, equipment rentals, and orders</p>
        </div>

        {/* Informational Message (from redirect) */}
        {infoMessage && !errorMessage && !successMessage && (
          <div className="alert alert-info">
            <Info size={20} />
            <span>{infoMessage}</span>
          </div>
        )}

        {/* Error Notification Alert */}
        {errorMessage && (
          <div className="alert alert-error">
            <AlertCircle size={20} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Success Notification Alert */}
        {successMessage && (
          <div className="alert alert-success">
            <CheckCircle2 size={20} />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-wrapper">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                id="email"
                name="email"
                placeholder="farmer@agrohub.com"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <Lock size={18} className="input-icon" />
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
              />
            </div>
          </div>

          <button type="submit" className="btn-auth-submit" disabled={loading}>
            {loading ? (
              <span className="spinner-text">Authenticating...</span>
            ) : (
              <>
                <LogIn size={18} />
                <span>Sign In to AgroHub</span>
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="auth-footer">
          <p>
            Don't have an AgroHub account yet?{' '}
            <Link to="/register" className="auth-link">
              Register as Farmer or Buyer
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
