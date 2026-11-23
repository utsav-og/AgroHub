import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Tractor, AlertCircle, CheckCircle2, ArrowLeft, PlusCircle } from 'lucide-react';
import { createMachineryApi, uploadImageApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import ImageUploadInput from '../components/ImageUploadInput';

function AddMachinery() {
  const { user } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    category: 'Tractor',
    rentalPricePerDay: '',
    location: user?.location || '',
    description: '',
    isAvailable: true,
  });

  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const categories = ['Tractor', 'Harvester', 'Tillage', 'Seeding', 'Irrigation', 'Sprayer', 'Other'];

  // Protect view: must be authenticated
  React.useEffect(() => {
    if (!user) {
      navigate('/login', {
        state: { message: 'Authentication Required: Please sign in to list agricultural machinery for rent.' }
      });
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
    if (errorMessage) setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!formData.name.trim() || formData.rentalPricePerDay === '') {
      setErrorMessage('Please provide machinery name and daily rental price.');
      return;
    }

    if (Number(formData.rentalPricePerDay) < 0) {
      setErrorMessage('Rental price cannot be negative.');
      return;
    }

    setLoading(true);
    try {
      let uploadedImageUrl = '';

      if (selectedImageFile) {
        try {
          const uploadRes = await uploadImageApi(selectedImageFile);
          if (uploadRes && uploadRes.imageUrl) {
            uploadedImageUrl = uploadRes.imageUrl;
          }
        } catch (uploadErr) {
          const msg = uploadErr.response?.data?.message || 'Failed to upload machinery photograph.';
          setErrorMessage(msg);
          showToast(msg, 'error');
          setLoading(false);
          return;
        }
      }

      await createMachineryApi({
        ...formData,
        rentalPricePerDay: Number(formData.rentalPricePerDay),
        imageUrl: uploadedImageUrl,
      });

      showToast(`Machinery "${formData.name}" listed successfully!`, 'success');
      setSuccessMessage('Machinery listed for rent successfully! Redirecting...');
      setTimeout(() => {
        navigate('/machinery');
      }, 1000);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to list machinery. Please check input details.';
      setErrorMessage(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card register-card">
        <div className="auth-header">
          <Link to="/machinery" className="back-link">
            <ArrowLeft size={16} /> Back to Machinery Rental
          </Link>
          <div className="auth-brand-badge" style={{ marginTop: '0.75rem' }}>
            <Tractor size={28} color="#1b4332" />
          </div>
          <h2>List Agricultural Machinery</h2>
          <p>Rent out your tractor, harvester, or farm implements to local farmers</p>
        </div>

        {errorMessage && (
          <div className="alert alert-error">
            <AlertCircle size={20} />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="alert alert-success">
            <CheckCircle2 size={20} />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">Machinery / Model Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="e.g. Mahindra 575 DI (45 HP) or Combine Harvester"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label htmlFor="category">Equipment Category *</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="rentalPricePerDay">Rental Rate (₹ per day) *</label>
              <input
                type="number"
                id="rentalPricePerDay"
                name="rentalPricePerDay"
                placeholder="e.g. 1500"
                min="0"
                value={formData.rentalPricePerDay}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="location">Stationed Location *</label>
            <input
              type="text"
              id="location"
              name="location"
              placeholder="e.g. Ludhiana, Punjab"
              value={formData.location}
              onChange={handleChange}
              required
            />
          </div>

          {/* Machinery Photograph Upload with Live Preview */}
          <ImageUploadInput
            label="Upload Machinery Photograph"
            selectedFile={selectedImageFile}
            onFileChange={setSelectedImageFile}
            disabled={loading}
          />

          <div className="form-group">
            <label htmlFor="description">Specifications & Implement Attachments</label>
            <textarea
              id="description"
              name="description"
              rows="3"
              placeholder="Include details such as horsepower, attachments included (rotavator, trolley), fuel terms..."
              value={formData.description}
              onChange={handleChange}
            ></textarea>
          </div>

          <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.6rem' }}>
            <input
              type="checkbox"
              id="isAvailable"
              name="isAvailable"
              checked={formData.isAvailable}
              onChange={handleChange}
              style={{ width: 'auto' }}
            />
            <label htmlFor="isAvailable" style={{ margin: 0, cursor: 'pointer' }}>
              Mark as immediately available for rent
            </label>
          </div>

          <button type="submit" className="btn-auth-submit" disabled={loading}>
            {loading ? (
              <span className="spinner-text">Publishing Machinery Listing...</span>
            ) : (
              <>
                <PlusCircle size={18} />
                <span>List Equipment for Rent</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddMachinery;
