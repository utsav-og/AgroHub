import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Filter,
  Search,
  MapPin,
  Phone,
  User,
  PlusCircle,
  AlertCircle,
  RefreshCw,
  Trash2,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Award,
  Eye,
  X,
  Mail,
} from 'lucide-react';
import { getWorkersApi, deleteWorkerApi, getWorkerByIdApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

function Workers() {
  const { user } = useAuth();
  const { showToast, confirmAction } = useNotification();
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSkill, setSelectedSkill] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [selectedWorkerModal, setSelectedWorkerModal] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const skillsList = [
    'All',
    'Harvesting',
    'Planting',
    'Irrigation',
    'Tractor Operation',
    'Weeding',
    'Pesticide Spraying',
    'Crop Bundling',
    'Orchard Pruning',
  ];

  useEffect(() => {
    fetchWorkerProfiles(selectedSkill === 'All' ? '' : selectedSkill, searchTerm);
  }, [selectedSkill, searchTerm]);

  const fetchWorkerProfiles = async (skill, search) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getWorkersApi(skill, search);
      setWorkers(res.data || []);
    } catch (err) {
      setError('Failed to load worker profiles from database. Make sure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchWorkerProfiles(selectedSkill === 'All' ? '' : selectedSkill, searchTerm);
  };

  const handleOpenDetails = async (item) => {
    setSelectedWorkerModal(item);
    setModalLoading(true);
    try {
      const res = await getWorkerByIdApi(item._id);
      if (res && res.data) {
        setSelectedWorkerModal(res.data);
      }
    } catch (e) {
      // Fallback to existing card item
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteWorker = async (id, name) => {
    const confirmed = await confirmAction({
      title: 'Delete Worker Profile?',
      message: `Are you sure you want to delete the worker profile for "${name}"? This action cannot be undone.`,
      confirmText: 'Delete Profile',
      cancelText: 'Cancel',
      isDestructive: true,
    });

    if (!confirmed) return;

    setDeletingId(id);
    try {
      await deleteWorkerApi(id);
      setWorkers((prev) => prev.filter((w) => w._id !== id));
      showToast(`Worker profile for "${name}" deleted successfully.`, 'success');
      if (selectedWorkerModal?._id === id) {
        setSelectedWorkerModal(null);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete worker profile.', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="marketplace-page">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1>Agricultural Labor & Worker Hiring</h1>
          <p>Hire experienced agricultural workers and seasonal labor groups with transparent daily wages.</p>
        </div>
        <div>
          {user ? (
            <Link to="/add-worker" className="btn-add-product">
              <PlusCircle size={18} />
              <span>Register Worker Profile</span>
            </Link>
          ) : (
            <Link to="/login" className="btn-add-product" title="Sign in to register worker profile">
              <PlusCircle size={18} />
              <span>Login to List Workers</span>
            </Link>
          )}
        </div>
      </div>

      {/* Info Banner */}
      <div className="services-info-banner">
        <div className="info-icon"><ShieldCheck size={24} color="#1b4332" /></div>
        <div>
          <strong>Direct Labor Sourcing & Fair Wages</strong>
          <p>Zero contractor cuts. Connect directly with labor team leaders and verified farm hands.</p>
        </div>
      </div>

      {/* Search and Skill Filter Toolbar */}
      <div className="category-filter-bar" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'stretch' }}>
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
          <div className="input-wrapper" style={{ flex: 1 }}>
            <Search size={18} className="input-icon" />
            <input
              type="text"
              placeholder="Search by worker name, skill or location (e.g. Sowing, Harvester crew, Gandhinagar, Gujarat)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
          <button type="submit" className="btn-cta-primary" style={{ padding: '0.65rem 1.25rem', fontSize: '0.9rem' }}>
            Search
          </button>
        </form>

        {/* Skill Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div className="filter-label">
            <Filter size={16} />
            <span>Filter by Skill:</span>
          </div>
          <div className="filter-pills">
            {skillsList.map((skill) => (
              <button
                key={skill}
                className={`pill-btn ${(selectedSkill === skill || (skill === 'All' && !selectedSkill)) ? 'active' : ''}`}
                onClick={() => setSelectedSkill(skill === 'All' ? '' : skill)}
              >
                {skill}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="loading-state">
          <RefreshCw size={28} className="spin" />
          <p>Loading agricultural worker profiles from MongoDB...</p>
        </div>
      ) : error ? (
        <div className="alert alert-error">
          <AlertCircle size={20} />
          <span>{error}</span>
          <button onClick={() => fetchWorkerProfiles(selectedSkill, searchTerm)} className="btn-retry">
            Retry
          </button>
        </div>
      ) : workers.length === 0 ? (
        <div className="empty-state">
          <Users size={48} color="#94a3b8" />
          <h3>No worker profiles found matching your search</h3>
          <p>Try searching for different skills or register an agricultural worker profile.</p>
          {user ? (
            <Link to="/add-worker" className="btn-cta-primary">
              Register Worker Profile Now
            </Link>
          ) : (
            <Link to="/register" className="btn-cta-primary">
              Create an Account to Register Workers
            </Link>
          )}
        </div>
      ) : (
        <div className="products-grid">
          {workers.map((worker) => {
            const isOwner = user && worker.owner && (user._id === worker.owner._id || user._id === worker.owner);

            return (
              <div key={worker._id} className="product-card">
                <div className="product-header">
                  <span className="product-category-tag">
                    <Award size={13} style={{ display: 'inline', marginRight: '3px' }} />
                    {worker.experienceYears} Yrs Experience
                  </span>
                  <span className="product-price">
                    ₹{worker.dailyWage} <small>/ day</small>
                  </span>
                </div>

                <h3 className="product-name">{worker.name}</h3>

                {/* Skills Badges */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', margin: '0.5rem 0 0.75rem' }}>
                  {worker.skills.map((skill, index) => (
                    <span
                      key={index}
                      style={{
                        backgroundColor: '#f1f5f9',
                        color: '#1e293b',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                <p className="product-description">
                  {worker.description || 'Experienced agricultural worker available for seasonal farm operations.'}
                </p>

                <div className="product-meta">
                  {/* Availability */}
                  <div className="meta-row">
                    <Clock size={15} color={worker.isAvailable ? '#16a34a' : '#d97706'} />
                    <span>
                      Status:{' '}
                      <strong style={{ color: worker.isAvailable ? '#16a34a' : '#d97706' }}>
                        {worker.isAvailable ? 'Available for Work' : 'Currently Engaged'}
                      </strong>
                    </span>
                  </div>

                  {/* Location */}
                  {worker.location && (
                    <div className="meta-row">
                      <MapPin size={15} color="#2d6a4f" />
                      <span>{worker.location}</span>
                    </div>
                  )}

                  {/* Phone */}
                  <div className="meta-row phone-row">
                    <Phone size={15} color="#2d6a4f" />
                    <span>Contact: <strong>{worker.phone}</strong></span>
                  </div>

                  {/* Listing Owner */}
                  {worker.owner && (
                    <div className="meta-row farmer-row">
                      <User size={15} color="#2d6a4f" />
                      <span>Posted by: {worker.owner.name}</span>
                    </div>
                  )}

                  {/* View Details Button */}
                  <button
                    type="button"
                    className="btn-view-details"
                    onClick={() => handleOpenDetails(worker)}
                  >
                    <Eye size={15} />
                    <span>View Worker Profile</span>
                  </button>

                  {/* Owner Delete Button */}
                  {isOwner && (
                    <div className="owner-actions-row">
                      <button
                        onClick={() => handleDeleteWorker(worker._id, worker.name)}
                        className="btn-delete-listing"
                        disabled={deletingId === worker._id}
                        title="Delete worker profile"
                      >
                        <Trash2 size={14} />
                        <span>{deletingId === worker._id ? 'Deleting...' : 'Delete My Listing'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Worker Detail Modal */}
      {selectedWorkerModal && (
        <div className="detail-modal-overlay" onClick={() => setSelectedWorkerModal(null)}>
          <div className="detail-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="detail-modal-header">
              <div>
                <span className="product-category-tag">
                  <Award size={13} style={{ display: 'inline', marginRight: '3px' }} />
                  {selectedWorkerModal.experienceYears} Years Agricultural Experience
                </span>
                <h2 className="detail-modal-title">{selectedWorkerModal.name}</h2>
              </div>
              <button
                className="detail-close-btn"
                onClick={() => setSelectedWorkerModal(null)}
                title="Close details"
              >
                <X size={20} />
              </button>
            </div>

            {/* Grid of Key Info */}
            <div className="detail-meta-grid">
              <div className="detail-meta-item">
                <div className="detail-meta-label">Daily Wage</div>
                <div className="detail-meta-value" style={{ color: '#2d6a4f' }}>
                  ₹{selectedWorkerModal.dailyWage}{' '}
                  <small style={{ fontSize: '0.8rem', color: '#64748b' }}>/ day</small>
                </div>
              </div>

              <div className="detail-meta-item">
                <div className="detail-meta-label">Work Availability</div>
                <div
                  className="detail-meta-value"
                  style={{
                    color: selectedWorkerModal.isAvailable ? '#16a34a' : '#d97706',
                    fontSize: '1rem',
                  }}
                >
                  {selectedWorkerModal.isAvailable ? 'Available Now' : 'Currently Engaged'}
                </div>
              </div>

              <div className="detail-meta-item">
                <div className="detail-meta-label">Base Location</div>
                <div className="detail-meta-value" style={{ fontSize: '0.95rem' }}>
                  {selectedWorkerModal.location || 'Local District'}
                </div>
              </div>

              <div className="detail-meta-item">
                <div className="detail-meta-label">Experience</div>
                <div className="detail-meta-value" style={{ fontSize: '0.95rem' }}>
                  {selectedWorkerModal.experienceYears} Years in Field
                </div>
              </div>
            </div>

            {/* Verified Skills */}
            <div style={{ marginBottom: '1.25rem' }}>
              <h4 style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>
                Agricultural Skills & Expertise
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {selectedWorkerModal.skills?.map((skill, idx) => (
                  <span
                    key={idx}
                    style={{
                      backgroundColor: '#f0fdf4',
                      color: '#15803d',
                      padding: '0.35rem 0.75rem',
                      borderRadius: '6px',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      border: '1px solid #bbf7d0',
                    }}
                  >
                    ✓ {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Description */}
            <div style={{ marginBottom: '1.25rem' }}>
              <h4 style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.4rem', letterSpacing: '0.05em' }}>
                Worker Profile & Experience Notes
              </h4>
              <p style={{ color: '#334155', lineHeight: 1.6, fontSize: '0.95rem' }}>
                {selectedWorkerModal.description || 'Dedicated agricultural worker with hands-on crop production and farm machinery experience.'}
              </p>
            </div>

            {/* Contact Card */}
            <div className="detail-contact-card">
              <div className="detail-contact-header">
                <ShieldCheck size={18} color="#15803d" />
                <span>Verified Direct Contact</span>
              </div>
              <div className="detail-contact-row">
                <strong>Worker Direct Phone:</strong>
                <span>{selectedWorkerModal.phone}</span>
              </div>
              {selectedWorkerModal.location && (
                <div className="detail-contact-row">
                  <MapPin size={15} color="#2d6a4f" />
                  <span>{selectedWorkerModal.location}</span>
                </div>
              )}
              {selectedWorkerModal.owner?.name && (
                <div className="detail-contact-row">
                  <User size={15} color="#2d6a4f" />
                  <span>Profile Posted By: {selectedWorkerModal.owner.name}</span>
                </div>
              )}
              {selectedWorkerModal.owner?.email && (
                <div className="detail-contact-row">
                  <Mail size={15} color="#2d6a4f" />
                  <span>{selectedWorkerModal.owner.email}</span>
                </div>
              )}

              <div className="detail-contact-actions">
                <a href={`tel:${selectedWorkerModal.phone}`} className="btn-contact-action btn-contact-phone">
                  <Phone size={15} />
                  <span>Call Worker</span>
                </a>
                {selectedWorkerModal.owner?.email && (
                  <a
                    href={`mailto:${selectedWorkerModal.owner.email}?subject=Hiring inquiry for ${selectedWorkerModal.name} via AgroHub`}
                    className="btn-contact-action btn-contact-email"
                  >
                    <Mail size={15} />
                    <span>Contact Poster</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Workers;
