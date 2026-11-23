import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { PlusCircle, AlertCircle, CheckCircle2, ArrowLeft, Sprout, ShieldAlert, ShoppingBag } from 'lucide-react';
import { createProductApi, uploadImageApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import ImageUploadInput from '../components/ImageUploadInput';

function AddProduct() {
  const { user } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    category: 'Grains',
    price: '',
    quantity: '',
    unit: 'kg',
    description: '',
    location: user?.location || '',
  });

  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const categories = ['Grains', 'Vegetables', 'Fruits', 'Pulses', 'Seeds', 'Fertilizers', 'Other'];
  const units = ['kg', 'quintal', 'ton', 'box', 'piece'];

  // Protect view: only farmers can access
  React.useEffect(() => {
    if (!user) {
      navigate('/login', {
        state: { message: 'Authentication Required: Please sign in as a registered farmer to publish crop listings.' }
      });
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (errorMessage) setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!formData.name.trim() || formData.price === '' || formData.quantity === '') {
      setErrorMessage('Please fill in product name, price, and available quantity.');
      return;
    }

    if (Number(formData.price) < 0 || Number(formData.quantity) < 0) {
      setErrorMessage('Price and quantity must be non-negative values.');
      return;
    }

    setLoading(true);
    try {
      let uploadedImageUrl = '';

      // Upload image first if a file was chosen
      if (selectedImageFile) {
        try {
          const uploadRes = await uploadImageApi(selectedImageFile);
          if (uploadRes && uploadRes.imageUrl) {
            uploadedImageUrl = uploadRes.imageUrl;
          }
        } catch (uploadErr) {
          const msg = uploadErr.response?.data?.message || 'Failed to upload crop photograph.';
          setErrorMessage(msg);
          showToast(msg, 'error');
          setLoading(false);
          return;
        }
      }

      await createProductApi({
        ...formData,
        price: Number(formData.price),
        quantity: Number(formData.quantity),
        imageUrl: uploadedImageUrl,
      });

      showToast(`Crop listing "${formData.name.trim()}" published successfully!`, 'success');
      setSuccessMessage('Crop listing created successfully! Redirecting to marketplace...');
      setTimeout(() => {
        navigate('/marketplace');
      }, 1000);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create listing. Please check input values.';
      setErrorMessage(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  // If logged in as Buyer or Admin, render friendly access restriction
  if (user && user.role !== 'farmer') {
    return (
      <div className="marketplace-page">
        <div className="card" style={{ maxWidth: '600px', margin: '3rem auto', textAlign: 'center', padding: '3.5rem 2rem' }}>
          <div style={{ background: '#fef3c7', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', border: '2px solid #f59e0b' }}>
            <ShieldAlert size={32} color="#b45309" />
          </div>
          <h2 style={{ fontSize: '1.6rem', color: '#1b4332', fontWeight: 800, marginBottom: '0.75rem' }}>
            Farmer Privilege Required
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem' }}>
            You are currently signed in as <strong>{user.name}</strong> with the <strong>{user.role}</strong> role.
            Only registered farmers can publish crop listings to the AgroHub marketplace.
            Buyers can browse, search, and procure farm produce directly from verified growers.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/marketplace" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShoppingBag size={18} />
              <span>Explore Marketplace</span>
            </Link>
            {user.role === 'buyer' && (
              <Link to="/buyer-dashboard" className="btn-secondary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>Go to Buyer Dashboard</span>
              </Link>
            )}
            {user.role === 'admin' && (
              <Link to="/admin" className="btn-secondary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>Go to Admin Portal</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card register-card">
        <div className="auth-header">
          <Link to="/marketplace" className="back-link">
            <ArrowLeft size={16} /> Back to Marketplace
          </Link>
          <div className="auth-brand-badge" style={{ marginTop: '0.75rem' }}>
            <Sprout size={28} color="#1b4332" />
          </div>
          <h2>List Your Produce</h2>
          <p>Post fresh crops directly to buyers on the AgroHub network</p>
        </div>

        {errorMessage && (
          <div className="alert alert-error">
            <AlertCircle size={18} />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="alert alert-success">
            <CheckCircle2 size={18} />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">Crop / Product Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="e.g. Organic Basmati Rice (Pusa 1121)"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label htmlFor="category">Produce Category *</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="unit">Selling Unit *</label>
              <select
                id="unit"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                required
              >
                {units.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label htmlFor="price">Price (₹ per {formData.unit}) *</label>
              <input
                type="number"
                id="price"
                name="price"
                placeholder="e.g. 3500"
                min="0"
                value={formData.price}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="quantity">Available Quantity ({formData.unit}) *</label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                placeholder="e.g. 50"
                min="0"
                value={formData.quantity}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="location">Farm / Harvest Location</label>
            <input
              type="text"
              id="location"
              name="location"
              placeholder="e.g. Karnal, Haryana"
              value={formData.location}
              onChange={handleChange}
            />
          </div>

          {/* Crop Photograph Upload with Live Preview */}
          <ImageUploadInput
            label="Upload Crop Photograph"
            selectedFile={selectedImageFile}
            onFileChange={setSelectedImageFile}
            disabled={loading}
          />

          <div className="form-group">
            <label htmlFor="description">Description & Harvest Details</label>
            <textarea
              id="description"
              name="description"
              rows="3"
              placeholder="Describe grain quality, moisture level, harvest date, packaging..."
              value={formData.description}
              onChange={handleChange}
            ></textarea>
          </div>

          <button type="submit" className="btn-auth-submit" disabled={loading}>
            {loading ? (
              <span className="spinner-text">Publishing Listing...</span>
            ) : (
              <>
                <PlusCircle size={18} />
                <span>Publish Crop Listing</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddProduct;
