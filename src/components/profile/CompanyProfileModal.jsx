import React, { useState, useEffect } from 'react';
import CommonModal from '../common/CommonModal';
import FormCard from '../common/FormCard';
import companyProfileService from '../../services/companyProfileService';
import { FaBuilding, FaTrashAlt, FaSave, FaUpload, FaCheckCircle } from 'react-icons/fa';

const CompanyProfileModal = ({ isOpen, onClose, showToast }) => {
  const [profileId, setProfileId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [formData, setFormData] = useState({
    company_name: '',
    phone: '',
    email: '',
    logo: '',
    gstin: '',
    fssai: '',
    address: '',
    state: '',
    city: '',
    country: '',
    license_key: ''
  });

  const toast = (msg, type = 'success') => {
    if (typeof showToast === 'function') {
      showToast(msg);
    } else if (window.showToast) {
      window.showToast(msg, type);
    }
  };

  // Fetch existing profile from PostgreSQL when modal opens
  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await companyProfileService.getProfile();
      const p = res?.data || res?.companyProfile || (res && res.id ? res : null);
      if (p && p.id) {
        setProfileId(p.id);
        setFormData({
          company_name: p.company_name || p.name || '',
          phone: p.phone || '',
          email: p.email || '',
          logo: p.logo || '',
          gstin: p.gstin || '',
          fssai: p.fssai || '',
          address: p.address || '',
          state: p.state || '',
          city: p.city || '',
          country: p.country || '',
          license_key: p.license_key || ''
        });
      } else {
        setProfileId(null);
        setFormData({
          company_name: '',
          phone: '',
          email: '',
          logo: '',
          gstin: '',
          fssai: '',
          address: '',
          state: '',
          city: '',
          country: '',
          license_key: ''
        });
      }
    } catch (err) {
      console.warn('Error fetching company profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setShowDeleteConfirm(false);
      fetchProfile();
    }
  }, [isOpen]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle Logo file upload
  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast('Please upload an image file (PNG, JPG, JPEG, SVG)', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast('Image size should be less than 5MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFormData(prev => ({ ...prev, logo: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setFormData(prev => ({ ...prev, logo: '' }));
  };

  // Validation
  const validate = () => {
    if (!formData.company_name.trim()) {
      toast('Company Name is required', 'error');
      return false;
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      toast('Please enter a valid email address', 'error');
      return false;
    }
    if (formData.phone && !/^[0-9+\-\s()]{7,20}$/.test(formData.phone.trim())) {
      toast('Please enter a valid phone number', 'error');
      return false;
    }
    return true;
  };

  // Save / Update
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      let res;
      if (profileId) {
        res = await companyProfileService.updateProfile(profileId, formData);
        toast('Company profile updated successfully!');
      } else {
        res = await companyProfileService.createProfile(formData);
        toast('Company profile created successfully!');
      }
      
      const saved = res?.data || res?.companyProfile || (res && res.id ? res : null);
      if (saved && saved.id) {
        setProfileId(saved.id);
      }
      window.dispatchEvent(new CustomEvent('companyProfileUpdated', { detail: saved || formData }));
      await fetchProfile();
      onClose();
    } catch (err) {
      toast(err?.response?.data?.message || err.message || 'Failed to save company profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Delete
  const handleDelete = async () => {
    if (!profileId) {
      setFormData({
        company_name: '',
        phone: '',
        email: '',
        logo: '',
        gstin: '',
        fssai: '',
        address: '',
        state: '',
        city: '',
        country: '',
        license_key: ''
      });
      window.dispatchEvent(new CustomEvent('companyProfileUpdated', { detail: null }));
      setShowDeleteConfirm(false);
      return;
    }

    setDeleting(true);
    try {
      await companyProfileService.deleteProfile(profileId);
      toast('Company profile deleted successfully from PostgreSQL.');
      setProfileId(null);
      setFormData({
        company_name: '',
        phone: '',
        email: '',
        logo: '',
        gstin: '',
        fssai: '',
        address: '',
        state: '',
        city: '',
        country: '',
        license_key: ''
      });
      window.dispatchEvent(new CustomEvent('companyProfileUpdated', { detail: null }));
      setShowDeleteConfirm(false);
      onClose();
    } catch (err) {
      toast(err?.response?.data?.message || err.message || 'Failed to delete company profile', 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <CommonModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FaBuilding style={{ color: '#0f766e' }} />
          <span>{profileId ? 'Company Profile' : 'Create Company Profile'}</span>
        </div>
      }
      maxWidth="720px"
    >
      {loading ? (
        <div style={{ padding: '40px 20px', textAlign: 'center', color: '#64748b' }}>
          <div style={{ fontSize: '1rem', fontWeight: 600 }}>Loading company information from PostgreSQL...</div>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <FormCard>
            <div className="form-grid-2">
              {/* 1. Company Name */}
              <div className="form-field form-span-2">
                <label className="form-label">Company Name *</label>
                <input
                  type="text"
                  placeholder="e.g. ALFA Restaurant & Hotel"
                  value={formData.company_name}
                  onChange={e => handleChange('company_name', e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              {/* 2. Phone */}
              <div className="form-field">
                <label className="form-label">Phone</label>
                <input
                  type="text"
                  placeholder="e.g. 9876543210"
                  value={formData.phone}
                  onChange={e => handleChange('phone', e.target.value)}
                  className="form-input"
                />
              </div>

              {/* 3. Email */}
              <div className="form-field">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  placeholder="e.g. admin@alfahms.com"
                  value={formData.email}
                  onChange={e => handleChange('email', e.target.value)}
                  className="form-input"
                />
              </div>

              {/* 4. Logo */}
              <div className="form-field form-span-2">
                <label className="form-label">Logo</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '4px' }}>
                  {formData.logo ? (
                    <div style={{
                      position: 'relative',
                      width: '120px',
                      height: '80px',
                      borderRadius: '8px',
                      border: '1.5px solid #cbd5e1',
                      overflow: 'hidden',
                      background: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '4px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
                    }}>
                      <img
                        src={formData.logo}
                        alt="Company Logo"
                        style={{
                          maxWidth: '100%',
                          maxHeight: '100%',
                          width: 'auto',
                          height: 'auto',
                          objectFit: 'contain',
                          imageRendering: '-webkit-optimize-contrast'
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleRemoveLogo}
                        style={{
                          position: 'absolute',
                          top: 3,
                          right: 3,
                          background: 'rgba(239, 68, 68, 0.95)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '50%',
                          width: '20px',
                          height: '20px',
                          cursor: 'pointer',
                          fontSize: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                        }}
                        title="Remove Logo"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div style={{
                      width: '120px',
                      height: '80px',
                      borderRadius: '8px',
                      border: '1.5px dashed #cbd5e1',
                      background: '#f8fafc',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#94a3b8'
                    }}>
                      <FaUpload size={20} />
                      <span style={{ fontSize: '10px', marginTop: '4px' }}>No Logo</span>
                    </div>
                  )}

                  <div>
                    <label style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 14px',
                      borderRadius: '6px',
                      background: '#f1f5f9',
                      border: '1px solid #cbd5e1',
                      color: '#334155',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}>
                      <FaUpload size={12} />
                      <span>{formData.logo ? 'Change Logo' : 'Upload Logo'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        style={{ display: 'none' }}
                      />
                    </label>
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                      PNG, JPG, or SVG up to 5MB
                    </div>
                  </div>
                </div>
              </div>

              {/* 5. GSTIN */}
              <div className="form-field">
                <label className="form-label">GSTIN</label>
                <input
                  type="text"
                  placeholder="e.g. 09AAACA1234A1Z5"
                  value={formData.gstin}
                  onChange={e => handleChange('gstin', e.target.value.toUpperCase())}
                  className="form-input"
                />
              </div>

              {/* 6. FSSAI */}
              <div className="form-field">
                <label className="form-label">FSSAI</label>
                <input
                  type="text"
                  placeholder="e.g. 10019051000001"
                  value={formData.fssai}
                  onChange={e => handleChange('fssai', e.target.value)}
                  className="form-input"
                />
              </div>

              {/* 7. Address */}
              <div className="form-field form-span-2">
                <label className="form-label">Address</label>
                <textarea
                  rows="2"
                  placeholder="e.g. 123 Hotel Boulevard, Main Market"
                  value={formData.address}
                  onChange={e => handleChange('address', e.target.value)}
                  className="form-input"
                  style={{ resize: 'vertical' }}
                />
              </div>

              {/* 8. State */}
              <div className="form-field">
                <label className="form-label">State</label>
                <input
                  type="text"
                  placeholder="e.g. Uttar Pradesh"
                  value={formData.state}
                  onChange={e => handleChange('state', e.target.value)}
                  className="form-input"
                />
              </div>

              {/* 9. City */}
              <div className="form-field">
                <label className="form-label">City</label>
                <input
                  type="text"
                  placeholder="e.g. Gorakhpur"
                  value={formData.city}
                  onChange={e => handleChange('city', e.target.value)}
                  className="form-input"
                />
              </div>

              {/* 10. Country */}
              <div className="form-field">
                <label className="form-label">Country</label>
                <input
                  type="text"
                  placeholder="e.g. India"
                  value={formData.country}
                  onChange={e => handleChange('country', e.target.value)}
                  className="form-input"
                />
              </div>

              {/* 11. License Key */}
              <div className="form-field">
                <label className="form-label">License Key</label>
                <input
                  type="text"
                  placeholder="e.g. ALFA-HMS-LIC-XXXX"
                  value={formData.license_key}
                  onChange={e => handleChange('license_key', e.target.value)}
                  className="form-input"
                />
              </div>
            </div>
          </FormCard>

          {/* Delete Confirmation Alert */}
          {showDeleteConfirm && (
            <div style={{
              margin: '16px 0',
              padding: '12px 16px',
              borderRadius: '8px',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px'
            }}>
              <span style={{ fontSize: '0.82rem', color: '#991b1b', fontWeight: 600 }}>
                Are you sure you want to delete this company profile from PostgreSQL?
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    background: '#dc2626',
                    color: '#fff',
                    border: 'none',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {deleting ? 'Deleting...' : 'Yes, Delete'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    background: '#e2e8f0',
                    color: '#475569',
                    border: 'none',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
            <div>
              {profileId && !showDeleteConfirm && (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    background: 'transparent',
                    border: '1px solid #ef4444',
                    color: '#ef4444',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <FaTrashAlt size={13} />
                  <span>Delete Profile</span>
                </button>
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: '8px 18px',
                  borderRadius: '6px',
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  color: '#475569',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 20px',
                  borderRadius: '6px',
                  background: '#0f766e',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(15, 118, 110, 0.3)'
                }}
              >
                <FaSave size={13} />
                <span>{saving ? 'Saving...' : (profileId ? 'Update' : 'Save')}</span>
              </button>
            </div>
          </div>
        </form>
      )}
    </CommonModal>
  );
};

export default CompanyProfileModal;
