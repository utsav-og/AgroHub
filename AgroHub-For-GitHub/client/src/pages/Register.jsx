import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Phone, MapPin, UserPlus, AlertCircle, CheckCircle2, Sprout, Tractor, ShoppingCart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function Register() {
  const { register, user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'farmer',
    phone: '',
    location: '',
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
    if (errorMessage) setErrorMessage('');
  };

  const handleRoleSelect = (selectedRole) => {
    setFormData({
      ...formData,
      role: selectedRole,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    // Validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.password) {
      setErrorMessage('Please fill in all required fields (Name, Email, Password).');
      return;
    }

    if (formData.password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);

    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      password: formData.password,
      role: formData.role,
      phone: formData.phone.trim(),
      location: formData.location.trim(),
    };

    const result = await register(payload);
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

      setSuccessMessage(`Account registered successfully! Redirecting to ${dashboardName}...`);
      setTimeout(() => {
        navigate(targetPath);
      }, 1000);
    } else {
      setErrorMessage(result.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card register-card">
        {/* Header */}
        <div className="auth-header">
          <div className="auth-brand-badge">
            <img src="/logo.png" alt="AgroHub Logo" className="auth-brand-logo-img" />
          </div>
          <h2>Join AgroHub Platform</h2>
          <p>Create your free account to access direct crop trading, machinery rental, and labor</p>
        </div>

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
          {/* Role Selection */}
          <div className="form-group">
            <label>Select Your Account Type</label>
            <div className="role-selector-grid">
              <button
                type="button"
                className={`role-card-btn ${formData.role === 'farmer' ? 'active' : ''}`}
                onClick={() => handleRoleSelect('farmer')}
              >
                <Tractor size={22} />
                <div className="role-details">
                  <strong>Farmer / Grower</strong>
                  <span>Sell crops & rent equipment</span>
                </div>
              </button>

              <button
                type="button"
                className={`role-card-btn ${formData.role === 'buyer' ? 'active' : ''}`}
                onClick={() => handleRoleSelect('buyer')}
              >
                <ShoppingCart size={22} />
                <div className="role-details">
                  <strong>Buyer / Consumer</strong>
                  <span>Purchase produce directly</span>
                </div>
              </button>
            </div>
          </div>

          {/* Full Name */}
          <div className="form-group">
            <label htmlFor="name">Full Name *</label>
            <div className="input-wrapper">
              <User size={18} className="input-icon" />
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Ramesh Patel"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Email Address */}
          <div className="form-group">
            <label htmlFor="email">Email Address *</label>
            <div className="input-wrapper">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                id="email"
                name="email"
                placeholder="ramesh@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </div>
          </div>

          {/* Passwords in Two Columns */}
          <div className="form-row-2">
            <div className="form-group">
              <label htmlFor="password">Password (min 6 chars) *</label>
              <div className="input-wrapper">
                <Lock size={18} className="input-icon" />
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Create password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password *</label>
              <div className="input-wrapper">
                <Lock size={18} className="input-icon" />
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="Re-enter password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
                />
              </div>
            </div>
          </div>

          {/* Phone & Location in Two Columns */}
          <div className="form-row-2">
            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <div className="input-wrapper">
                <Phone size={18} className="input-icon" />
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  placeholder="+91 9876543210"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="location">District / State</label>
              <div className="input-wrapper">
                <MapPin size={18} className="input-icon" />
                <input
                  type="text"
                  id="location"
                  name="location"
                  placeholder="Ludhiana, Punjab"
                  value={formData.location}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <button type="submit" className="btn-auth-submit" disabled={loading}>
            {loading ? (
              <span className="spinner-text">Creating Account...</span>
            ) : (
              <>
                <UserPlus size={18} />
                <span>Register as {formData.role === 'farmer' ? 'Farmer' : 'Buyer'}</span>
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="auth-link">
              Sign In here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
