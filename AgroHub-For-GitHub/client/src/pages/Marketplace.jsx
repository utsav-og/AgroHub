import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  Filter,
  MapPin,
  Phone,
  User,
  PlusCircle,
  AlertCircle,
  RefreshCw,
  Trash2,
  Eye,
  X,
  Mail,
  ShieldCheck,
  Edit2,
  Save,
} from 'lucide-react';
import {
  getProductsApi,
  deleteProductApi,
  getProductByIdApi,
  updateProductApi,
  uploadImageApi,
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { getImageUrl, getDisplayImageUrl, DEFAULT_CROP_IMAGES } from '../utils/imageHelper';
import ImageUploadInput from '../components/ImageUploadInput';

function Marketplace() {
  const { user } = useAuth();
  const { showToast, confirmAction } = useNotification();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [selectedCropModal, setSelectedCropModal] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Edit Listing State
  const [editingCrop, setEditingCrop] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    category: 'Grains',
    price: '',
    quantity: '',
    unit: 'kg',
    description: '',
    location: '',
    imageUrl: '',
  });
  const [editImageFile, setEditImageFile] = useState(null);
  const [editSaving, setEditSaving] = useState(false);

  const categories = ['All', 'Grains', 'Vegetables', 'Fruits', 'Pulses', 'Seeds', 'Fertilizers'];
  const units = ['kg', 'quintal', 'ton', 'box', 'piece'];

  useEffect(() => {
    fetchProducts(selectedCategory === 'All' ? '' : selectedCategory);
  }, [selectedCategory]);

  const fetchProducts = async (cat) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getProductsApi(cat);
      setProducts(res.data || []);
    } catch (err) {
      setError('Failed to load marketplace products. Make sure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetails = async (item) => {
    setSelectedCropModal(item);
    setModalLoading(true);
    try {
      const res = await getProductByIdApi(item._id);
      if (res && res.data) {
        setSelectedCropModal(res.data);
      }
    } catch (e) {
      // Fallback: keep existing card item info
    } finally {
      setModalLoading(false);
    }
  };

  const handleOpenEdit = (crop) => {
    setEditingCrop(crop);
    setEditFormData({
      name: crop.name || '',
      category: crop.category || 'Grains',
      price: crop.price ?? '',
      quantity: crop.quantity ?? '',
      unit: crop.unit || 'kg',
      description: crop.description || '',
      location: crop.location || '',
      imageUrl: crop.imageUrl || '',
    });
    setEditImageFile(null);
  };

  const handleCloseEdit = () => {
    setEditingCrop(null);
    setEditImageFile(null);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingCrop) return;

    if (!editFormData.name.trim() || editFormData.price === '' || editFormData.quantity === '') {
      showToast('Please fill in product name, price, and available quantity.', 'error');
      return;
    }

    setEditSaving(true);
    try {
      let finalImageUrl = editFormData.imageUrl;

      // If farmer chose a new image file, upload it first
      if (editImageFile) {
        try {
          const uploadRes = await uploadImageApi(editImageFile);
          if (uploadRes && uploadRes.imageUrl) {
            finalImageUrl = uploadRes.imageUrl;
          }
        } catch (uploadErr) {
          showToast(uploadErr.response?.data?.message || 'Failed to upload new image.', 'error');
          setEditSaving(false);
          return;
        }
      }

      const updatePayload = {
        ...editFormData,
        price: Number(editFormData.price),
        quantity: Number(editFormData.quantity),
        imageUrl: finalImageUrl,
      };

      const res = await updateProductApi(editingCrop._id, updatePayload);
      const updatedItem = res.data;

      // Update state in place
      setProducts((prev) =>
        prev.map((p) => (p._id === editingCrop._id ? { ...p, ...updatedItem } : p))
      );

      // If detail modal is open for this item, update it too
      if (selectedCropModal?._id === editingCrop._id) {
        setSelectedCropModal((prev) => ({ ...prev, ...updatedItem }));
      }

      showToast(`Listing for "${editFormData.name}" updated successfully!`, 'success');
      handleCloseEdit();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update listing.', 'error');
    } finally {
      setEditSaving(false);
    }
  };

  const handleDeleteProduct = async (productId, productName) => {
    const confirmed = await confirmAction({
      title: 'Delete Crop Listing?',
      message: `Are you sure you want to permanently remove "${productName}" from the marketplace? This action cannot be undone.`,
      confirmText: 'Delete Listing',
      cancelText: 'Cancel',
      isDestructive: true,
    });

    if (!confirmed) return;

    setDeletingId(productId);
    try {
      await deleteProductApi(productId);
      setProducts((prev) => prev.filter((p) => p._id !== productId));
      showToast(`Listing for "${productName}" deleted successfully.`, 'success');
      if (selectedCropModal?._id === productId) {
        setSelectedCropModal(null);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete listing. Please try again.', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="marketplace-page">
      {/* Marketplace Header */}
      <div className="page-header">
        <div>
          <h1>Agricultural Crop Marketplace</h1>
          <p>Direct farm-gate produce, verified growers, and transparent trading without middlemen.</p>
        </div>
        {user && user.role === 'farmer' && (
          <Link to="/add-product" className="btn-add-product">
            <PlusCircle size={18} />
            <span>List New Crop</span>
          </Link>
        )}
      </div>

      {/* Category Filter Pills */}
      <div className="category-filter-bar">
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

      {/* Content Area */}
      {loading ? (
        <div className="loading-state">
          <RefreshCw size={28} className="spin" />
          <p>Loading fresh produce listings from database...</p>
        </div>
      ) : error ? (
        <div className="alert alert-error">
          <AlertCircle size={20} />
          <span>{error}</span>
          <button onClick={() => fetchProducts(selectedCategory)} className="btn-retry">
            Retry
          </button>
        </div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <ShoppingBag size={48} color="#94a3b8" />
          <h3>No crops listed in this category yet</h3>
          <p>Be the first farmer to list freshly harvested crops on AgroHub.</p>
          {user && user.role === 'farmer' ? (
            <Link to="/add-product" className="btn-cta-primary">
              List Your Produce Now
            </Link>
          ) : (
            <Link to="/register" className="btn-cta-primary">
              Join as a Farmer
            </Link>
          )}
        </div>
      ) : (
        <div className="products-grid">
          {products.map((item) => {
            const isOwner = user && item.farmer && (user._id === item.farmer._id || user._id === item.farmer);
            const displayImg = getDisplayImageUrl(item.imageUrl, item.category, 'crop');

            return (
              <div key={item._id} className="product-card">
                {/* Product Card Image */}
                <div className="product-card-media">
                  <img
                    src={displayImg}
                    alt={item.name}
                    className="product-card-img"
                    onError={(e) => {
                      e.currentTarget.src = DEFAULT_CROP_IMAGES[item.category] || DEFAULT_CROP_IMAGES.Grains;
                    }}
                  />
                </div>

                <div className="product-header">
                  <span className="product-category-tag">{item.category}</span>
                  <span className="product-price">
                    ₹{item.price} <small>/ {item.unit}</small>
                  </span>
                </div>

                <h3 className="product-name">{item.name}</h3>
                <p className="product-description">
                  {item.description || 'Freshly harvested produce directly available from local farm.'}
                </p>

                <div className="product-meta">
                  <div className="meta-row">
                    <span className="meta-label">Quantity:</span>
                    <strong>{item.quantity} {item.unit}</strong>
                  </div>

                  {item.location && (
                    <div className="meta-row">
                      <MapPin size={15} color="#2d6a4f" />
                      <span>{item.location}</span>
                    </div>
                  )}

                  {item.farmer && (
                    <div className="meta-row farmer-row">
                      <User size={15} color="#2d6a4f" />
                      <span>Farmer: <strong>{item.farmer.name}</strong></span>
                    </div>
                  )}

                  {item.farmer?.phone && (
                    <div className="meta-row phone-row">
                      <Phone size={15} color="#2d6a4f" />
                      <span>Contact: {item.farmer.phone}</span>
                    </div>
                  )}

                  {/* View Details Button */}
                  <button
                    type="button"
                    className="btn-view-details"
                    onClick={() => handleOpenDetails(item)}
                  >
                    <Eye size={15} />
                    <span>View Crop Details</span>
                  </button>

                  {/* Owner Farmer Actions (Edit & Delete) */}
                  {isOwner && (
                    <div className="owner-actions-row">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(item)}
                        className="btn-edit-listing"
                        title="Edit crop details or photograph"
                      >
                        <Edit2 size={13} />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(item._id, item.name)}
                        className="btn-delete-listing"
                        disabled={deletingId === item._id}
                        title="Delete your crop listing"
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

      {/* Crop Detail Modal */}
      {selectedCropModal && (
        <div className="detail-modal-overlay" onClick={() => setSelectedCropModal(null)}>
          <div className="detail-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="detail-modal-header">
              <div>
                <span className="product-category-tag">{selectedCropModal.category}</span>
                <h2 className="detail-modal-title">{selectedCropModal.name}</h2>
              </div>
              <button
                className="detail-close-btn"
                onClick={() => setSelectedCropModal(null)}
                title="Close details"
              >
                <X size={20} />
              </button>
            </div>

            {/* Large Photograph Preview in Modal */}
            <div className="detail-modal-media">
              <img
                src={getDisplayImageUrl(selectedCropModal.imageUrl, selectedCropModal.category, 'crop')}
                alt={selectedCropModal.name}
                className="detail-modal-img"
                onError={(e) => {
                  e.currentTarget.src = DEFAULT_CROP_IMAGES[selectedCropModal.category] || DEFAULT_CROP_IMAGES.Grains;
                }}
              />
            </div>

            {/* Grid of Key Info */}
            <div className="detail-meta-grid">
              <div className="detail-meta-item">
                <div className="detail-meta-label">Selling Price</div>
                <div className="detail-meta-value" style={{ color: '#2d6a4f' }}>
                  ₹{selectedCropModal.price}{' '}
                  <small style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    / {selectedCropModal.unit}
                  </small>
                </div>
              </div>

              <div className="detail-meta-item">
                <div className="detail-meta-label">Available Quantity</div>
                <div className="detail-meta-value">
                  {selectedCropModal.quantity} {selectedCropModal.unit}
                </div>
              </div>

              <div className="detail-meta-item">
                <div className="detail-meta-label">Farm Location</div>
                <div className="detail-meta-value" style={{ fontSize: '0.95rem' }}>
                  {selectedCropModal.location || 'Local Farm'}
                </div>
              </div>

              <div className="detail-meta-item">
                <div className="detail-meta-label">Category</div>
                <div className="detail-meta-value" style={{ fontSize: '0.95rem' }}>
                  {selectedCropModal.category}
                </div>
              </div>
            </div>

            {/* Description */}
            <div style={{ marginBottom: '1.25rem' }}>
              <h4 style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.4rem', letterSpacing: '0.05em' }}>
                Crop Description & Harvest Notes
              </h4>
              <p style={{ color: '#334155', lineHeight: 1.6, fontSize: '0.95rem' }}>
                {selectedCropModal.description || 'Freshly harvested produce available directly from farm gate without middlemen.'}
              </p>
            </div>

            {/* Farmer Contact Card */}
            <div className="detail-contact-card">
              <div className="detail-contact-header">
                <ShieldCheck size={18} color="#15803d" />
                <span>Verified Farmer & Producer Contact</span>
              </div>
              <div className="detail-contact-row">
                <strong>Farmer Name:</strong>
                <span>{selectedCropModal.farmer?.name || 'Local AgroHub Farmer'}</span>
              </div>
              {selectedCropModal.farmer?.location && (
                <div className="detail-contact-row">
                  <MapPin size={15} color="#2d6a4f" />
                  <span>{selectedCropModal.farmer.location}</span>
                </div>
              )}
              {selectedCropModal.farmer?.phone && (
                <div className="detail-contact-row">
                  <Phone size={15} color="#2d6a4f" />
                  <span>{selectedCropModal.farmer.phone}</span>
                </div>
              )}
              {selectedCropModal.farmer?.email && (
                <div className="detail-contact-row">
                  <Mail size={15} color="#2d6a4f" />
                  <span>{selectedCropModal.farmer.email}</span>
                </div>
              )}

              <div className="detail-contact-actions">
                {selectedCropModal.farmer?.phone && (
                  <a href={`tel:${selectedCropModal.farmer.phone}`} className="btn-contact-action btn-contact-phone">
                    <Phone size={15} />
                    <span>Call Farmer</span>
                  </a>
                )}
                {selectedCropModal.farmer?.email && (
                  <a
                    href={`mailto:${selectedCropModal.farmer.email}?subject=Inquiry about ${selectedCropModal.name} on AgroHub`}
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

      {/* Edit Crop Listing Modal */}
      {editingCrop && (
        <div className="detail-modal-overlay" onClick={handleCloseEdit}>
          <div className="detail-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '620px' }}>
            <div className="detail-modal-header">
              <div>
                <span className="product-category-tag">Listing Management</span>
                <h2 className="detail-modal-title">Edit Crop Listing</h2>
              </div>
              <button className="detail-close-btn" onClick={handleCloseEdit} title="Close edit">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.88rem' }}>
                  Crop / Product Name *
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
                    Unit *
                  </label>
                  <select
                    value={editFormData.unit}
                    onChange={(e) => setEditFormData({ ...editFormData, unit: e.target.value })}
                    required
                  >
                    {units.map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row-2" style={{ marginBottom: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '0.88rem' }}>
                    Price (₹ per {editFormData.unit}) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editFormData.price}
                    onChange={(e) => setEditFormData({ ...editFormData, price: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '0.88rem' }}>
                    Available Quantity ({editFormData.unit}) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editFormData.quantity}
                    onChange={(e) => setEditFormData({ ...editFormData, quantity: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.88rem' }}>
                  Farm Location
                </label>
                <input
                  type="text"
                  value={editFormData.location}
                  onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                />
              </div>

              {/* Crop Photograph Upload & Replacement */}
              <ImageUploadInput
                label="Update Crop Photograph"
                selectedFile={editImageFile}
                onFileChange={setEditImageFile}
                currentImageUrl={editFormData.imageUrl}
                onRemoveCurrentImage={() => setEditFormData({ ...editFormData, imageUrl: '' })}
                disabled={editSaving}
              />

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.88rem' }}>
                  Harvest Notes & Description
                </label>
                <textarea
                  rows="3"
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                ></textarea>
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

export default Marketplace;
