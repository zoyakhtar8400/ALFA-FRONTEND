import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBuilding, FaSave, FaTrashAlt, FaUpload, FaSyncAlt, FaArrowLeft } from 'react-icons/fa';
import PageHeader from '../../../components/common/PageHeader';
import FormCard from '../../../components/common/FormCard';
import companyProfileService from '../../../services/companyProfileService';

const CompanyProfilePage = ({ showToast }) => {
  const navigate = useNavigate();

  const [profileId, setProfileId] = useState(null);
  const [loading, setLoading] = useState(true);
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

  // Fetch existing company profile directly from PostgreSQL on mount
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
        try {
          localStorage.setItem('alfa_company_profile', JSON.stringify(p));
          localStorage.setItem('companyProfile', JSON.stringify(p));
        } catch (e) {}
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
    fetchProfile();
  }, []);

  // Formatters & Validators
  const formatGSTIN = (val) => {
    if (!val) return '';
    return val.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 15);
  };

  const isValidGSTIN = (val) => {
    if (!val) return true;
    const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return gstinRegex.test(val);
  };

  const formatFSSAI = (val) => {
    if (!val) return '';
    return val.replace(/\D/g, '').slice(0, 14);
  };

  const isValidFSSAI = (val) => {
    if (!val) return true;
    return /^[0-9]{14}$/.test(val);
  };

  const formatLicenseKey = (val) => {
    if (!val) return '';
    let clean = val.toUpperCase().replace(/[^A-Z0-9\-]/g, '');
    if (!clean.includes('-')) {
      const parts = clean.match(/.{1,4}/g) || [];
      return parts.join('-').slice(0, 24);
    }
    return clean.slice(0, 32);
  };

  const isValidLicenseKey = (val) => {
    if (!val) return true;
    return val.trim().length >= 8;
  };

  const handleChange = (field, value) => {
    if (field === 'gstin') {
      setFormData(prev => ({ ...prev, gstin: formatGSTIN(value) }));
    } else if (field === 'fssai') {
      setFormData(prev => ({ ...prev, fssai: formatFSSAI(value) }));
    } else if (field === 'license_key') {
      setFormData(prev => ({ ...prev, license_key: formatLicenseKey(value) }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  // Handle Logo file upload (base64)
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
    if (formData.gstin && !isValidGSTIN(formData.gstin)) {
      toast('Invalid GSTIN format. Expected 15 characters (e.g. 09AAACA1234A1Z5)', 'error');
      return false;
    }
    if (formData.fssai && !isValidFSSAI(formData.fssai)) {
      toast('Invalid FSSAI format. Expected 14 numeric digits (e.g. 10019051000001)', 'error');
      return false;
    }
    if (formData.license_key && !isValidLicenseKey(formData.license_key)) {
      toast('Invalid License Key format. Expected format like ALFA-XXXX-XXXX-XXXX', 'error');
      return false;
    }
    return true;
  };

  // Save / Update to PostgreSQL
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      let res;
      if (profileId) {
        res = await companyProfileService.updateProfile(profileId, formData);
        toast('Company profile updated successfully in PostgreSQL!');
      } else {
        res = await companyProfileService.createProfile(formData);
        toast('Company profile created successfully in PostgreSQL!');
      }

      const saved = res?.data || res?.companyProfile || (res && res.id ? res : null);
      if (saved && saved.id) {
        setProfileId(saved.id);
      }
      const finalProfile = saved || formData;
      try {
        localStorage.setItem('alfa_company_profile', JSON.stringify(finalProfile));
        localStorage.setItem('companyProfile', JSON.stringify(finalProfile));
      } catch (e) {}
      window.dispatchEvent(new CustomEvent('companyProfileUpdated', { detail: finalProfile }));
      await fetchProfile();
    } catch (err) {
      toast(err?.response?.data?.message || err.message || 'Failed to save company profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Delete from PostgreSQL
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
    } catch (err) {
      toast(err?.response?.data?.message || err.message || 'Failed to delete company profile', 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="page-container" style={{ padding: '24px 32px', maxWidth: '1100px', margin: '0 auto' }}>
      <PageHeader
        title="Company Profile"
        subtitle="Manage business identity, GSTIN, FSSAI licensing and branding"
        breadcrumbs={['Dashboard', 'Setting', 'Company Profile']}
        actions={
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={fetchProfile}
              disabled={loading}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '6px',
                background: '#f1f5f9',
                border: '1px solid #cbd5e1',
                color: '#334155',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <FaSyncAlt size={12} className={loading ? 'animate-spin' : ''} />
              <span>Reload</span>
            </button>
          </div>
        }
      />

      {loading ? (
        <div style={{ padding: '60px 20px', textAlign: 'center', color: '#64748b' }}>
          <div style={{ fontSize: '1rem', fontWeight: 600 }}>Loading company information from PostgreSQL...</div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ marginTop: '16px' }}>
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
                  placeholder="e.g. +91 9876543210"
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '6px' }}>
                  {formData.logo ? (
                    <div style={{
                      position: 'relative',
                      width: '140px',
                      height: '90px',
                      borderRadius: '8px',
                      border: '1.5px solid #cbd5e1',
                      overflow: 'hidden',
                      background: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '6px',
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
                          top: 4,
                          right: 4,
                          background: 'rgba(239, 68, 68, 0.95)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '50%',
                          width: '22px',
                          height: '22px',
                          cursor: 'pointer',
                          fontSize: '11px',
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
                      width: '140px',
                      height: '90px',
                      borderRadius: '8px',
                      border: '1.5px dashed #cbd5e1',
                      background: '#f8fafc',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#94a3b8'
                    }}>
                      <FaUpload size={24} />
                      <span style={{ fontSize: '11px', marginTop: '4px' }}>No Logo</span>
                    </div>
                  )}

                  <div>
                    <label style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      background: '#f1f5f9',
                      border: '1px solid #cbd5e1',
                      color: '#334155',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}>
                      <FaUpload size={13} />
                      <span>{formData.logo ? 'Change Logo' : 'Upload Logo'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        style={{ display: 'none' }}
                      />
                    </label>
                    <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                      Supports PNG, JPG, JPEG, or SVG up to 5MB
                    </div>
                  </div>
                </div>
              </div>

              {/* 5. GSTIN */}
              <div className="form-field">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label">GSTIN</label>
                  {formData.gstin && (
                    <span style={{ fontSize: '11px', fontWeight: 600, color: isValidGSTIN(formData.gstin) ? '#16a34a' : '#ea580c' }}>
                      {isValidGSTIN(formData.gstin) ? '✓ Valid (15 chars)' : `${formData.gstin.length}/15 chars`}
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  maxLength={15}
                  placeholder="e.g. 09AAACA1234A1Z5"
                  value={formData.gstin}
                  onChange={e => handleChange('gstin', e.target.value)}
                  className="form-input"
                  style={{ textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: 'monospace' }}
                />
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '3px' }}>
                  Format: 15 alphanumeric (e.g. 22AAAAA0000A1Z5)
                </div>
              </div>

              {/* 6. FSSAI */}
              <div className="form-field">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label">FSSAI</label>
                  {formData.fssai && (
                    <span style={{ fontSize: '11px', fontWeight: 600, color: isValidFSSAI(formData.fssai) ? '#16a34a' : '#ea580c' }}>
                      {isValidFSSAI(formData.fssai) ? '✓ Valid (14 digits)' : `${formData.fssai.length}/14 digits`}
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  maxLength={14}
                  placeholder="e.g. 10019051000001"
                  value={formData.fssai}
                  onChange={e => handleChange('fssai', e.target.value)}
                  className="form-input"
                  style={{ letterSpacing: '0.5px', fontFamily: 'monospace' }}
                />
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '3px' }}>
                  Format: 14 numeric digits (e.g. 10019051000001)
                </div>
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label">License Key</label>
                  {formData.license_key && (
                    <span style={{ fontSize: '11px', fontWeight: 600, color: isValidLicenseKey(formData.license_key) ? '#16a34a' : '#ea580c' }}>
                      {isValidLicenseKey(formData.license_key) ? '✓ Valid' : 'Incomplete'}
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  maxLength={32}
                  placeholder="e.g. ALFA-XXXX-XXXX-XXXX"
                  value={formData.license_key}
                  onChange={e => handleChange('license_key', e.target.value)}
                  className="form-input"
                  style={{ textTransform: 'uppercase', letterSpacing: '0.8px', fontFamily: 'monospace' }}
                />
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '3px' }}>
                  Format: ALFA-XXXX-XXXX-XXXX or XXXX-XXXX-XXXX-XXXX
                </div>
              </div>
            </div>
          </FormCard>

          {/* Delete Confirmation Alert */}
          {showDeleteConfirm && (
            <div style={{
              margin: '16px 0',
              padding: '14px 18px',
              borderRadius: '8px',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px'
            }}>
              <span style={{ fontSize: '0.85rem', color: '#991b1b', fontWeight: 600 }}>
                Are you sure you want to permanently delete this company profile from PostgreSQL?
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '6px',
                    background: '#dc2626',
                    color: '#fff',
                    border: 'none',
                    fontSize: '0.8rem',
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
                    padding: '6px 14px',
                    borderRadius: '6px',
                    background: '#e2e8f0',
                    color: '#475569',
                    border: 'none',
                    fontSize: '0.8rem',
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px' }}>
            <div>
              {profileId && !showDeleteConfirm && (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '10px 18px',
                    borderRadius: '6px',
                    background: 'transparent',
                    border: '1px solid #ef4444',
                    color: '#ef4444',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <FaTrashAlt size={14} />
                  <span>Delete Profile</span>
                </button>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={() => navigate(-1)}
                style={{
                  padding: '10px 20px',
                  borderRadius: '6px',
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  color: '#475569',
                  fontSize: '0.84rem',
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
                  gap: '8px',
                  padding: '10px 24px',
                  borderRadius: '6px',
                  background: '#0f766e',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(15, 118, 110, 0.3)'
                }}
              >
                <FaSave size={14} />
                <span>{saving ? 'Saving...' : (profileId ? 'Update Profile' : 'Save Profile')}</span>
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default CompanyProfilePage;
