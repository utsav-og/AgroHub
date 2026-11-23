import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Tractor,
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
  Eye,
  X,
  Mail,
  Edit2,
  Save,
} from 'lucide-react';
import {
  getMachineryApi,
  deleteMachineryApi,
  getMachineryByIdApi,
  updateMachineryApi,
  uploadImageApi,
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { getImageUrl, getDisplayImageUrl, DEFAULT_MACHINERY_IMAGES } from '../utils/imageHelper';
import ImageUploadInput from '../components/ImageUploadInput';

function Machinery() {
  const { user } = useAuth();
  const { showToast, confirmAction } = useNotification();
  const [machinery, setMachinery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [selectedMachineryModal, setSelectedMachineryModal] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Edit State
  const [editingMachinery, setEditingMachinery] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    category: 'Tractor',
    rentalPricePerDay: '',
    location: '',
    description: '',
    isAvailable: true,
    imageUrl: '',
  });
  const [editImageFile, setEditImageFile] = useState(null);
  const [editSaving, setEditSaving] = useState(false);

  const categories = ['All', 'Tractor', 'Harvester', 'Tillage', 'Seeding', 'Irrigation', 'Sprayer', 'Other'];

  useEffect(() => {
    fetchMachineryList(selectedCategory === 'All' ? '' : selectedCategory, searchTerm);
  }, [selectedCategory, searchTerm]);

  const fetchMachineryList = async (cat, search) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getMachineryApi(cat, search);
      setMachinery(res.data || []);
    } catch (err) {
      setError('Failed to load machinery listings from database. Make sure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchMachineryList(selectedCategory === 'All' ? '' : selectedCategory, searchTerm);
  };

  const handleOpenDetails = async (item) => {
    setSelectedMachineryModal(item);
    setModalLoading(true);
    try {
      const res = await getMachineryByIdApi(item._id);
      if (res && res.data) {
        setSelectedMachineryModal(res.data);
      }
    } catch (e) {
      // Fallback to existing card item
    } finally {
      setModalLoading(false);
    }
  };

  const handleOpenEdit = (item) => {
    setEditingMachinery(item);
    setEditFormData({
      name: item.name || '',
      category: item.category || 'Tractor',
      rentalPricePerDay: item.rentalPricePerDay ?? '',
      location: item.location || '',
      description: item.description || '',
      isAvailable: item.isAvailable !== undefined ? item.isAvailable : true,
      imageUrl: item.imageUrl || '',
    });
    setEditImageFile(null);
  };

  const handleCloseEdit = () => {
    setEditingMachinery(null);
    setEditImageFile(null);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingMachinery) return;

    if (!editFormData.name.trim() || editFormData.rentalPricePerDay === '') {
      showToast('Please provide equipment name and daily rental rate.', 'error');
      return;
    }

    setEditSaving(true);
    try {
      let finalImageUrl = editFormData.imageUrl;

      if (editImageFile) {
        try {
          const uploadRes = await uploadImageApi(editImageFile);
          if (uploadRes && uploadRes.imageUrl) {
            finalImageUrl = uploadRes.imageUrl;
          }
        } catch (uploadErr) {
          showToast(uploadErr.response?.data?.message || 'Failed to upload machinery photograph.', 'error');
          setEditSaving(false);
          return;
        }
      }

      const updatePayload = {
        ...editFormData,
        rentalPricePerDay: Number(editFormData.rentalPricePerDay),
        imageUrl: finalImageUrl,
      };

      const res = await updateMachineryApi(editingMachinery._id, updatePayload);
      const updatedItem = res.data;

      // Update state in place
      setMachinery((prev) =>
        prev.map((m) => (m._id === editingMachinery._id ? { ...m, ...updatedItem } : m))
      );

      if (selectedMachineryModal?._id === editingMachinery._id) {
        setSelectedMachineryModal((prev) => ({ ...prev, ...updatedItem }));
      }

      showToast(`Machinery listing "${editFormData.name}" updated successfully!`, 'success');
      handleCloseEdit();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update machinery listing.', 'error');
    } finally {
      setEditSaving(false);
    }
  };

  const handleDeleteMachinery = async (id, name) => {
    const confirmed = await confirmAction({
      title: 'Delete Machinery Listing?',
      message: `Are you sure you want to delete your machinery rental listing for "${name}"? This action cannot be undone.`,
      confirmText: 'Delete Listing',
      cancelText: 'Cancel',
      isDestructive: true,
    });

    if (!confirmed) return;

    setDeletingId(id);
    try {
      await deleteMachineryApi(id);
      setMachinery((prev) => prev.filter((m) => m._id !== id));
      showToast(`Machinery "${name}" listing deleted successfully.`, 'success');
      if (selectedMachineryModal?._id === id) {
        setSelectedMachineryModal(null);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete listing. Please try again.', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="marketplace-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Agricultural Machinery & Equipment Rental</h1>
          <p>Access modern tractors and farm implements on affordable daily rentals directly from local owners.</p>
        </div>
        <div>
          {user ? (
            <Link to="/add-machinery" className="btn-add-product">
              <PlusCircle size={18} />
              <span>List Machinery</span>
            </Link>
          ) : (
            <Link to="/login" className="btn-add-product" title="Sign in to list equipment">
              <PlusCircle size={18} />
              <span>Login to List Equipment</span>
            </Link>
          )}
        </div>
      </div>

      {/* Info Banner */}
      <div className="services-info-banner">
        <div className="info-icon"><ShieldCheck size={24} color="#1b4332" /></div>
        <div>
          <strong>Verified Farm Mechanization</strong>
          <p>Direct owner contact with transparent daily rates, avoiding dealer commissions.</p>
        </div>
      </div>

      {/* Search and Category Filter Toolbar */}
      <div className="category-filter-bar" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'stretch' }}>
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="machinery-search-form" style={{ display: 'flex', gap: '0.5rem' }}>
          <div className="input-wrapper" style={{ flex: 1 }}>
            <Search size={18} className="input-icon" />
            <input
              type="text"
              placeholder="Search machinery by name, model, attachment or location (e.g. Mahindra, Rotavator, Punjab)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
          <button type="submit" className="btn-cta-primary" style={{ padding: '0.65rem 1.25rem', fontSize: '0.9rem' }}>
            Search
          </button>
        </form>

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

      {/* Content Grid */}
      {loading ? (
        <div className="loading-state">
          <RefreshCw size={28} className="spin" />
          <p>Loading machinery rentals from MongoDB...</p>
        </div>
      ) : error ? (
        <div className="alert alert-error">
          <AlertCircle size={20} />
          <span>{error}</span>
          <button onClick={() => fetchMachineryList(selectedCategory, searchTerm)} className="btn-retry">
            Retry
          </button>
        </div>
      ) : machinery.length === 0 ? (
        <div className="empty-state">
          <Tractor size={48} color="#94a3b8" />
          <h3>No machinery found matching your criteria</h3>
          <p>Try clearing your search filters or be the first to list equipment for rent.</p>
          {user ? (
            <Link to="/add-machinery" className="btn-cta-primary">
              List Your Machinery Now
            </Link>
          ) : (
            <Link to="/register" className="btn-cta-primary">
              Create an Account to List Equipment
            </Link>
          )}
        </div>
      ) : (
        <div className="products-grid">
          {machinery.map((item) => {
            const isOwner = user && item.owner && (user._id === item.owner._id || user._id === item.owner);
            const displayImg = getDisplayImageUrl(item.imageUrl, item.category, 'machinery');

            return (
              <div key={item._id} className="product-card">
                {/* Machinery Card Image */}
                <div className="product-card-media">
                  <img
                    src={displayImg}
                    alt={item.name}
                    className="product-card-img"
                    onError={(e) => {
                      e.currentTarget.src = DEFAULT_MACHINERY_IMAGES[item.category] || DEFAULT_MACHINERY_IMAGES.Tractor;
                    }}
                  />
                </div>

                <div className="product-header">
                  <span className="product-category-tag">{item.category}</span>
                  <span className="product-price">
                    ₹{item.rentalPricePerDay} <small>/ day</small>
                  </span>
                </div>

                <h3 className="product-name">{item.name}</h3>

                <p className="product-description">
                  {item.description || 'Agricultural machinery available for field operations and seasonal rental.'}
                </p>

                <div className="product-meta">
                  {/* Availability Badge */}
                  <div className="meta-row">
                    <Clock size={15} color={item.isAvailable ? '#16a34a' : '#d97706'} />
                    <span>
                      Status:{' '}
                      <strong style={{ color: item.isAvailable ? '#16a34a' : '#d97706' }}>
                        {item.isAvailable ? 'Available for Rent' : 'Currently Booked'}
                      </strong>
                    </span>
                  </div>

                  {/* Location */}
                  {item.location && (
                    <div className="meta-row">
                      <MapPin size={15} color="#2d6a4f" />
                      <span>{item.location}</span>
                    </div>
                  )}

                  {/* Owner */}
                  {item.owner && (
                    <div className="meta-row farmer-row">
                      <User size={15} color="#2d6a4f" />
                      <span>Owner: <strong>{item.owner.name}</strong></span>
                    </div>
                  )}

                  {/* Phone */}
                  {item.owner?.phone && (
                    <div className="meta-row phone-row">
                      <Phone size={15} color="#2d6a4f" />
                      <span>Contact: {item.owner.phone}</span>
                    </div>
                  )}

                  {/* View Details Button */}
                  <button
                    type="button"
                    className="btn-view-details"
                    onClick={() => handleOpenDetails(item)}
                  >
                    <Eye size={15} />
                    <span>View Equipment Details</span>
                  </button>

                  {/* Owner Actions (Edit & Delete) */}
                  {isOwner && (
                    <div className="owner-actions-row">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(item)}
                        className="btn-edit-listing"
                        title="Edit machinery details or photograph"
                      >
                        <Edit2 size={13} />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteMachinery(item._id, item.name)}
                        className="btn-delete-listing"
                        disabled={deletingId === item._id}
                        title="Delete your machinery listing"
                      >
                        <Trash2 size={13} />
                        <span>{deletingId === item._id ? 'Deleting...' : 'Delete'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Machinery Detail Modal */}
      {selectedMachineryModal && (
        <div className="detail-modal-overlay" onClick={() => setSelectedMachineryModal(null)}>
          <div className="detail-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="detail-modal-header">
              <div>
                <span className="product-category-tag">{selectedMachineryModal.category}</span>
                <h2 className="detail-modal-title">{selectedMachineryModal.name}</h2>
              </div>
              <button
                className="detail-close-btn"
                onClick={() => setSelectedMachineryModal(null)}
                title="Close details"
              >
                <X size={20} />
              </button>
            </div>

            {/* Large Equipment Photograph */}
            <div className="detail-modal-media">
              <img
                src={getDisplayImageUrl(selectedMachineryModal.imageUrl, selectedMachineryModal.category, 'machinery')}
                alt={selectedMachineryModal.name}
                className="detail-modal-img"
                onError={(e) => {
                  e.currentTarget.src = DEFAULT_MACHINERY_IMAGES[selectedMachineryModal.category] || DEFAULT_MACHINERY_IMAGES.Tractor;
                }}
              />
            </div>

            {/* Grid of Key Info */}
            <div className="detail-meta-grid">
              <div className="detail-meta-item">
                <div className="detail-meta-label">Rental Rate</div>
                <div className="detail-meta-value" style={{ color: '#2d6a4f' }}>
                  ₹{selectedMachineryModal.rentalPricePerDay}{' '}
                  <small style={{ fontSize: '0.8rem', color: '#64748b' }}>/ day</small>
                </div>
              </div>

              <div className="detail-meta-item">
                <div className="detail-meta-label">Availability</div>
                <div
                  className="detail-meta-value"
                  style={{
                    color: selectedMachineryModal.isAvailable ? '#16a34a' : '#d97706',
                    fontSize: '1rem',
                  }}
                >
                  {selectedMachineryModal.isAvailable ? 'Ready for Rent' : 'Currently Booked'}
                </div>
              </div>

              <div className="detail-meta-item">
                <div className="detail-meta-label">Service Area / Location</div>
                <div className="detail-meta-value" style={{ fontSize: '0.95rem' }}>
                  {selectedMachineryModal.location || 'Local Region'}
                </div>
              </div>

              <div className="detail-meta-item">
                <div className="detail-meta-label">Category</div>
                <div className="detail-meta-value" style={{ fontSize: '0.95rem' }}>
                  {selectedMachineryModal.category}
                </div>
              </div>
            </div>

            {/* Description */}
            <div style={{ marginBottom: '1.25rem' }}>
              <h4 style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.4rem', letterSpacing: '0.05em' }}>
                Equipment Specifications & Usage Terms
              </h4>
              <p style={{ color: '#334155', lineHeight: 1.6, fontSize: '0.95rem' }}>
                {selectedMachineryModal.description || 'Agricultural machinery well-maintained and available for seasonal farm operations.'}
              </p>
            </div>

            {/* Owner Contact Card */}
            <div className="detail-contact-card">
              <div className="detail-contact-header">
                <ShieldCheck size={18} color="#15803d" />
                <span>Verified Equipment Owner Contact</span>
              </div>
              <div className="detail-contact-row">
                <strong>Owner Name:</strong>
                <span>{selectedMachineryModal.owner?.name || 'AgroHub Equipment Provider'}</span>
              </div>
              {selectedMachineryModal.owner?.location && (
                <div className="detail-contact-row">
                  <MapPin size={15} color="#2d6a4f" />
                  <span>{selectedMachineryModal.owner.location}</span>
                </div>
              )}
              {selectedMachineryModal.owner?.phone && (
                <div className="detail-contact-row">
                  <Phone size={15} color="#2d6a4f" />
                  <span>{selectedMachineryModal.owner.phone}</span>
                </div>
              )}
              {selectedMachineryModal.owner?.email && (
                <div className="detail-contact-row">
                  <Mail size={15} color="#2d6a4f" />
                  <span>{selectedMachineryModal.owner.email}</span>
                </div>
              )}

              <div className="detail-contact-actions">
                {selectedMachineryModal.owner?.phone && (
                  <a href={`tel:${selectedMachineryModal.owner.phone}`} className="btn-contact-action btn-contact-phone">
                    <Phone size={15} />
                    <span>Call Owner</span>
                  </a>
                )}
                {selectedMachineryModal.owner?.email && (
                  <a
                    href={`mailto:${selectedMachineryModal.owner.email}?subject=Inquiry about ${selectedMachineryModal.name} rental on AgroHub`}
                    className="btn-contact-action btn-contact-email"
                  >
                    <Mail size={15} />
                    <span>Send Email</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Machinery Listing Modal */}
      {editingMachinery && (
        <div className="detail-modal-overlay" onClick={handleCloseEdit}>
          <div className="detail-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '620px' }}>
            <div className="detail-modal-header">
              <div>
                <span className="product-category-tag">Listing Management</span>
                <h2 className="detail-modal-title">Edit Machinery Listing</h2>
              </div>
              <button className="detail-close-btn" onClick={handleCloseEdit} title="Close edit">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.88rem' }}>
                  Equipment / Model Name *
                </label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-row-2" style={{ marginBottom: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '0.88rem' }}>
                    Category *
                  </label>
                  <select
                    value={editFormData.category}
                    onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                    required
                  >
                    {categories.filter((c) => c !== 'All').map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '0.88rem' }}>
                    Rental Rate (₹ per day) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editFormData.rentalPricePerDay}
                    onChange={(e) => setEditFormData({ ...editFormData, rentalPricePerDay: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.88rem' }}>
                  Stationed Location
                </label>
                <input
                  type="text"
                  value={editFormData.location}
                  onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                />
              </div>

              {/* Machinery Photograph Upload & Replacement */}
              <ImageUploadInput
                label="Update Machinery Photograph"
                selectedFile={editImageFile}
                onFileChange={setEditImageFile}
                currentImageUrl={editFormData.imageUrl}
                onRemoveCurrentImage={() => setEditFormData({ ...editFormData, imageUrl: '' })}
                disabled={editSaving}
              />

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.88rem' }}>
                  Specifications & Implements Included
                </label>
                <textarea
                  rows="3"
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                ></textarea>
              </div>

              <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
                <input
                  type="checkbox"
                  id="editIsAvailable"
                  checked={editFormData.isAvailable}
                  onChange={(e) => setEditFormData({ ...editFormData, isAvailable: e.target.checked })}
                  style={{ width: 'auto' }}
                />
                <label htmlFor="editIsAvailable" style={{ margin: 0, cursor: 'pointer', fontWeight: 600, fontSize: '0.88rem' }}>
                  Mark as currently available for rent
                </label>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={handleCloseEdit}
                  className="btn-secondary"
                  disabled={editSaving}
                  style={{ padding: '0.6rem 1.25rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={editSaving}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1.5rem' }}
                >
                  <Save size={16} />
                  <span>{editSaving ? 'Saving Changes...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Machinery;
