import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Shield,
  X,
  Edit2,
  Check,
  LogOut,
  LayoutDashboard,
  Sprout,
  Receipt,
  Package,
  ShoppingBag,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { updateUserProfileApi } from '../services/api';

function ProfileModal({ isOpen, onClose }) {
  const { user, logout, updateUser } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    location: user?.location || '',
  });

  // Keep form data in sync if user changes
  React.useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        location: user.location || '',
      });
    }
  }, [user, isOpen]);

  // Handle ESC key press
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !user) return null;

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Name cannot be empty.', 'error');
      return;
    }

    setSaving(true);
    try {
      const res = await updateUserProfileApi({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        location: formData.location.trim(),
      });

      if (res && res.data) {
        updateUser(res.data);
        showToast('Profile updated successfully!', 'success');
        setIsEditing(false);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update profile. Please try again.';
      showToast(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleNavigate = (path) => {
    onClose();
    navigate(path);
  };

  const handleLogoutClick = () => {
    onClose();
    logout();
    navigate('/login');
    showToast('You have been logged out safely.', 'info');
  };

  const getDashboardPath = () => {
    if (user.role === 'admin') return '/admin';
    if (user.role === 'buyer') return '/buyer-dashboard';
    return '/farmer-dashboard';
  };

  const userInitial = user.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <div className="profile-modal-overlay" onClick={onClose}>
      <div
        className="profile-modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-modal-title"
      >
        {/* Header Banner */}
        <div className="profile-card-banner">
          <button
            onClick={onClose}
            className="profile-modal-close-btn"
            title="Close Profile (Esc)"
            aria-label="Close Profile"
          >
            <X size={20} />
          </button>
        </div>

        {/* Profile Avatar & Identity */}
        <div className="profile-identity-section">
          <div className="profile-avatar-circle">
            <span>{userInitial}</span>
          </div>

          <div className="profile-identity-info">
            <div className="profile-name-row">
              <h2 id="profile-modal-title" className="profile-full-name">
                {user.name}
              </h2>
              <span className={`role-badge ${user.role}`}>
                {user.role}
              </span>
            </div>
            <p className="profile-email-text">{user.email}</p>
          </div>
        </div>

        {/* Main Content Body */}
        <div className="profile-body-content">
          {!isEditing ? (
            /* VIEW MODE */
            <div className="profile-details-view">
              <div className="profile-info-grid">
                <div className="profile-info-item">
                  <div className="profile-info-icon-box">
                    <User size={18} color="#2d6a4f" />
                  </div>
                  <div>
                    <span className="profile-info-label">Full Name</span>
                    <span className="profile-info-val">{user.name}</span>
                  </div>
                </div>

                <div className="profile-info-item">
                  <div className="profile-info-icon-box">
                    <Mail size={18} color="#2d6a4f" />
                  </div>
                  <div>
                    <span className="profile-info-label">Email Address</span>
                    <span className="profile-info-val">{user.email}</span>
                  </div>
                </div>

                <div className="profile-info-item">
                  <div className="profile-info-icon-box">
                    <Phone size={18} color="#2d6a4f" />
                  </div>
                  <div>
                    <span className="profile-info-label">Contact Number</span>
                    <span className="profile-info-val">
                      {user.phone ? user.phone : <em style={{ color: '#94a3b8' }}>Not provided</em>}
                    </span>
                  </div>
                </div>

                <div className="profile-info-item">
                  <div className="profile-info-icon-box">
                    <MapPin size={18} color="#2d6a4f" />
                  </div>
                  <div>
                    <span className="profile-info-label">Farm / Operating Location</span>
                    <span className="profile-info-val">
                      {user.location ? user.location : <em style={{ color: '#94a3b8' }}>Not provided</em>}
                    </span>
                  </div>
                </div>

                <div className="profile-info-item full-span">
                  <div className="profile-info-icon-box">
                    <Shield size={18} color="#2d6a4f" />
                  </div>
                  <div>
                    <span className="profile-info-label">Account Role & Privileges</span>
                    <span className="profile-info-val" style={{ fontSize: '0.88rem', color: '#475569' }}>
                      {user.role === 'farmer' &&
                        'Verified Farmer: Full authorization to list agricultural produce, manage inventory, record operational expenses, and hire machinery or workers.'}
                      {user.role === 'buyer' &&
                        'Verified Buyer: Authorized to discover farm produce, connect directly with growers, and place procurement inquiries.'}
                      {user.role === 'admin' &&
                        'Platform Administrator: System-wide authority for user governance, content moderation, and agricultural platform metrics.'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Links Section */}
              <div className="profile-shortcuts-section">
                <span className="profile-shortcuts-title">Quick Actions</span>
                <div className="profile-shortcuts-grid">
                  <button
                    onClick={() => handleNavigate(getDashboardPath())}
                    className="profile-shortcut-btn"
                  >
                    <LayoutDashboard size={15} />
                    <span>My Dashboard</span>
                  </button>

                  <button
                    onClick={() => handleNavigate('/marketplace')}
                    className="profile-shortcut-btn"
                  >
                    <ShoppingBag size={15} />
                    <span>Marketplace</span>
                  </button>

                  {user.role === 'farmer' && (
                    <>
                      <button
                        onClick={() => handleNavigate('/add-product')}
                        className="profile-shortcut-btn"
                      >
                        <Sprout size={15} />
                        <span>Post New Crop</span>
                      </button>
                      <button
                        onClick={() => handleNavigate('/expenses')}
                        className="profile-shortcut-btn"
                      >
                        <Receipt size={15} />
                        <span>Farm Expenses</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="profile-modal-actions">
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="btn-edit-profile"
                >
                  <Edit2 size={15} />
                  <span>Edit Profile</span>
                </button>

                <button
                  type="button"
                  onClick={handleLogoutClick}
                  className="btn-profile-logout"
                >
                  <LogOut size={15} />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          ) : (
            /* EDIT MODE */
            <form onSubmit={handleSaveProfile} className="profile-edit-form">
              <h3 className="profile-edit-heading">Edit Profile Information</h3>

              <div className="profile-form-group">
                <label htmlFor="profile-name">Full Name</label>
                <div className="profile-input-wrapper">
                  <User size={16} className="profile-input-icon" />
                  <input
                    id="profile-name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter full name"
                    required
                  />
                </div>
              </div>

              <div className="profile-form-group">
                <label htmlFor="profile-phone">Contact Phone Number</label>
                <div className="profile-input-wrapper">
                  <Phone size={16} className="profile-input-icon" />
                  <input
                    id="profile-phone"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="e.g. +91 98765 43210"
                  />
                </div>
              </div>

              <div className="profile-form-group">
                <label htmlFor="profile-location">Farm / Village Location</label>
                <div className="profile-input-wrapper">
                  <MapPin size={16} className="profile-input-icon" />
                  <input
                    id="profile-location"
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="e.g. Gandhinagar, Gujarat"
                  />
                </div>
              </div>

              <div className="profile-edit-buttons">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="btn-profile-cancel"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-profile-save"
                  disabled={saving}
                >
                  <Check size={16} />
                  <span>{saving ? 'Saving Changes...' : 'Save Profile'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfileModal;
