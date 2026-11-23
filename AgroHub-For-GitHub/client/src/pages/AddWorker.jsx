import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Users, AlertCircle, CheckCircle2, ArrowLeft, PlusCircle } from 'lucide-react';
import { createWorkerApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

function AddWorker() {
  const { user } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    selectedSkills: ['Harvesting'],
    customSkill: '',
    experienceYears: 2,
    dailyWage: '',
    location: user?.location || '',
    phone: user?.phone || '',
    description: '',
    isAvailable: true,
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const commonSkills = [
    'Harvesting',
    'Planting',
    'Irrigation',
    'Tractor Operation',
    'Weeding',
    'Pesticide Spraying',
    'Crop Bundling',
    'Orchard Pruning',
  ];

  // Protect view: must be authenticated
  React.useEffect(() => {
    if (!user) {
      navigate('/login', {
        state: { message: 'Authentication Required: Please sign in to register agricultural worker profiles.' }
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

  const handleSkillToggle = (skill) => {
    const current = [...formData.selectedSkills];
    const index = current.indexOf(skill);
    if (index > -1) {
      if (current.length > 1) {
        current.splice(index, 1);
      }
    } else {
      current.push(skill);
    }
    setFormData({ ...formData, selectedSkills: current });
  };

  const handleAddCustomSkill = () => {
    if (formData.customSkill.trim()) {
      const trimmed = formData.customSkill.trim();
      if (!formData.selectedSkills.includes(trimmed)) {
        setFormData({
          ...formData,
          selectedSkills: [...formData.selectedSkills, trimmed],
          customSkill: '',
        });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!formData.name.trim() || formData.dailyWage === '' || !formData.location.trim() || !formData.phone.trim()) {
      setErrorMessage('Please fill in worker name, daily wage, location, and contact phone.');
      return;
    }

    if (Number(formData.dailyWage) < 0) {
      setErrorMessage('Daily wage cannot be a negative amount.');
      return;
    }

    if (formData.selectedSkills.length === 0) {
      setErrorMessage('Please select at least one agricultural skill.');
      return;
    }

    setLoading(true);
    try {
      await createWorkerApi({
        name: formData.name.trim(),
        skills: formData.selectedSkills,
        experienceYears: Number(formData.experienceYears),
        dailyWage: Number(formData.dailyWage),
        location: formData.location.trim(),
        phone: formData.phone.trim(),
        description: formData.description.trim(),
        isAvailable: formData.isAvailable,
      });

      showToast(`Worker profile for "${formData.name.trim()}" registered successfully!`, 'success');
      setSuccessMessage('Worker profile registered successfully! Redirecting...');
      setTimeout(() => {
        navigate('/workers');
      }, 1000);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to register worker profile. Please check details.';
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
          <Link to="/workers" className="back-link">
            <ArrowLeft size={16} /> Back to Worker Hiring
          </Link>
          <div className="auth-brand-badge" style={{ marginTop: '0.75rem' }}>
            <Users size={28} color="#1b4332" />
          </div>
          <h2>Register Agricultural Worker Profile</h2>
          <p>List farm labor profiles or experienced work groups available for seasonal hiring</p>
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
            <label htmlFor="name">Worker / Team Leader Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="e.g. Bharat Patel or Gujarat Harvester Crew (8 Members)"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          {/* Skill Selector */}
          <div className="form-group">
            <label>Agricultural Skills & Specializations *</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
              {commonSkills.map((skill) => (
                <button
                  type="button"
                  key={skill}
                  className={`pill-btn ${formData.selectedSkills.includes(skill) ? 'active' : ''}`}
                  onClick={() => handleSkillToggle(skill)}
                >
                  {skill}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                placeholder="Add other skill (e.g. Cotton Picking)"
                value={formData.customSkill}
                onChange={(e) => setFormData({ ...formData, customSkill: e.target.value })}
              />
              <button
                type="button"
                className="btn-cta-secondary"
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', color: '#1b4332', borderColor: '#2d6a4f' }}
                onClick={handleAddCustomSkill}
              >
                Add
              </button>
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label htmlFor="dailyWage">Daily Wage (₹ per day) *</label>
              <input
                type="number"
                id="dailyWage"
                name="dailyWage"
                placeholder="e.g. 550"
                min="0"
                value={formData.dailyWage}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="experienceYears">Experience (Years) *</label>
              <input
                type="number"
                id="experienceYears"
                name="experienceYears"
                placeholder="e.g. 4"
                min="0"
                value={formData.experienceYears}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label htmlFor="phone">Contact Phone *</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="location">District / State *</label>
              <input
                type="text"
                id="location"
                name="location"
                placeholder="e.g. Gandhinagar, Gujarat"
                value={formData.location}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Crew Details & Work Capacity</label>
            <textarea
              id="description"
              name="description"
              rows="3"
              placeholder="State team size (e.g., group of 6 laborers), preferred crop operations, tools provided..."
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
              Mark as currently available for immediate field booking
            </label>
          </div>

          <button type="submit" className="btn-auth-submit" disabled={loading}>
            {loading ? (
              <span className="spinner-text">Registering Profile...</span>
            ) : (
              <>
                <PlusCircle size={18} />
                <span>Register Worker Profile</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddWorker;
