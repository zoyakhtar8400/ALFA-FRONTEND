import React, { useState, useEffect } from 'react';
import { FaMapMarkerAlt, FaPhoneAlt, FaUser, FaStickyNote, FaMotorcycle, FaCheckCircle, FaTimes, FaBuilding } from 'react-icons/fa';

const DEFAULT_COMPANIES = [
  {
    id: 1,
    companyName: 'Tata Consultancy Services Ltd',
    gstin: '27AAACT2727Q1ZW',
    phone: '9820011223',
    contactPerson: 'Rajesh Gopinathan',
    address: 'TCS House, Raveline Street, Fort',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001',
    status: 'Active',
    remark: 'Corporate billing agreement with 30-day payment cycle'
  },
  {
    id: 2,
    companyName: 'Infosys BPM Limited',
    gstin: '29AAACI4398E1ZY',
    phone: '9988776655',
    contactPerson: 'Sudha Murty',
    address: 'Electronics City, Hosur Road',
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: '560100',
    status: 'Active',
    remark: 'Monthly invoice settlement'
  },
  {
    id: 3,
    companyName: 'Reliance Retail Ventures',
    gstin: '27AABCR0371R1ZT',
    phone: '9819988776',
    contactPerson: 'Isha Ambani',
    address: 'Reliance Corporate Park, Thane-Belapur Road',
    city: 'Navi Mumbai',
    state: 'Maharashtra',
    pincode: '400701',
    status: 'Active',
    remark: 'Corporate cafeteria & guest catering bills'
  }
];

const loadCompanyMasters = () => {
  try {
    const stored = localStorage.getItem('alfa_company_masters');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to load alfa_company_masters from localStorage:', e);
  }
  return DEFAULT_COMPANIES;
};

const AddressConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  customerName = '',
  mobileNumber = '',
  customerAddress = '',
  customerLocality = '',
  remarks = '',
  serviceType = 'Delivery',
  company = '',
  companyList = null
}) => {
  const [selectedCompany, setSelectedCompany] = useState(company || '');
  const [companies, setCompanies] = useState(() => (Array.isArray(companyList) && companyList.length > 0 ? companyList : loadCompanyMasters()));
  const [name, setName] = useState(customerName);
  const [phone, setPhone] = useState(mobileNumber);
  const [address, setAddress] = useState(customerAddress);
  const [locality, setLocality] = useState(customerLocality);
  const [deliveryNotes, setDeliveryNotes] = useState(remarks);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setName(customerName || '');
      setPhone(mobileNumber || '');
      setAddress(customerAddress || '');
      setLocality(customerLocality || '');
      setDeliveryNotes(remarks || '');
      setSelectedCompany(company || '');
      setErrorMsg('');
      const loaded = (Array.isArray(companyList) && companyList.length > 0)
        ? companyList
        : loadCompanyMasters();
      setCompanies(loaded);
    }
  }, [isOpen, customerName, mobileNumber, customerAddress, customerLocality, remarks, company, companyList]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleCompanyChange = (e) => {
    const compName = e.target.value;
    setSelectedCompany(compName);
    if (!compName) return;

    const found = companies.find(c => (c.companyName || c.name) === compName);
    if (found) {
      if (found.companyName || found.name) {
        setName(found.contactPerson ? `${found.contactPerson} (${found.companyName || found.name})` : (found.companyName || found.name));
      }
      if (found.phone || found.mobile || found.phoneNo) {
        setPhone(found.phone || found.mobile || found.phoneNo || '');
      }
      if (found.address) {
        setAddress(found.address);
      }
      if (found.city || found.locality || found.state) {
        const locParts = [found.city || found.locality, found.state].filter(Boolean);
        setLocality(locParts.join(', '));
      }
      if (found.remark) {
        setDeliveryNotes(found.remark);
      }
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (serviceType === 'Delivery' && !address.trim()) {
      setErrorMsg('Delivery address is required before placing a delivery order.');
      return;
    }
    setErrorMsg('');
    onConfirm?.({
      name: name.trim() || 'Walk-in',
      phone: phone.trim(),
      address: address.trim(),
      locality: locality.trim(),
      remarks: deliveryNotes.trim(),
      company: selectedCompany.trim()
    });
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(15, 23, 42, 0.70)', backdropFilter: 'blur(4px)',
      zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--font-family, system-ui)'
    }}>
      <div style={{
        background: '#fff', borderRadius: '16px', padding: '0', width: '480px', maxWidth: '92vw',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', overflow: 'hidden',
        border: '1px solid #e2e8f0'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: '#fff', padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '10px',
              background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.2rem', color: '#38bdf8'
            }}>
              <FaMotorcycle />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Confirm Address Before Ordering
                <span style={{
                  fontSize: '0.68rem', fontWeight: 800, background: serviceType === 'Delivery' ? '#ef4444' : '#0284c7',
                  color: '#fff', padding: '2px 8px', borderRadius: '12px', textTransform: 'uppercase'
                }}>
                  {serviceType}
                </span>
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '2px 0 0 0' }}>
                Please verify customer details & delivery address
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent', border: 'none', color: '#94a3b8',
              fontSize: '1.2rem', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center'
            }}
          >
            <FaTimes />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} style={{ padding: '20px 24px' }}>
          {errorMsg && (
            <div style={{
              background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626',
              padding: '10px 14px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700,
              marginBottom: '16px'
            }}>
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Company Master Dropdown */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ fontSize: '0.72rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
              <FaBuilding style={{ color: '#6366f1' }} /> Company
            </label>
            <select
              value={selectedCompany}
              onChange={handleCompanyChange}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1.5px solid #cbd5e1',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: selectedCompany ? '#1e293b' : '#64748b',
                outline: 'none',
                background: '#f8fafc',
                cursor: 'pointer',
                boxSizing: 'border-box'
              }}
            >
              <option value="">-- Select Company (Optional) --</option>
              {companies.map(comp => {
                const compName = comp.companyName || comp.name;
                return (
                  <option key={comp.id || compName} value={compName}>
                    {compName} {comp.gstin ? `(${comp.gstin})` : ''}
                  </option>
                );
              })}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                <FaUser style={{ color: '#0284c7' }} /> Customer Name
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Customer name"
                style={{
                  width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1',
                  fontSize: '0.85rem', fontWeight: 600, color: '#1e293b', outline: 'none', boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                <FaPhoneAlt style={{ color: '#16a34a' }} /> Phone Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="Mobile number"
                style={{
                  width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1',
                  fontSize: '0.85rem', fontWeight: 600, color: '#1e293b', outline: 'none', boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* Delivery Address */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ fontSize: '0.72rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
              <FaMapMarkerAlt style={{ color: '#ef4444' }} /> Delivery Address {serviceType === 'Delivery' && <span style={{ color: '#ef4444' }}>*</span>}
            </label>
            <textarea
              rows={3}
              value={address}
              onChange={e => {
                setAddress(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              placeholder="Flat / Building no., Street name, Landmark..."
              style={{
                width: '100%', padding: '9px 12px', borderRadius: '8px', border: errorMsg ? '1.5px solid #ef4444' : '1.5px solid #cbd5e1',
                fontSize: '0.85rem', fontWeight: 500, color: '#1e293b', outline: 'none', resize: 'vertical', boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '18px' }}>
            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                Locality / Area
              </label>
              <input
                type="text"
                value={locality}
                onChange={e => setLocality(e.target.value)}
                placeholder="Sector / Area name"
                style={{
                  width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1',
                  fontSize: '0.85rem', fontWeight: 600, color: '#1e293b', outline: 'none', boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                <FaStickyNote style={{ color: '#eab308' }} /> Order Notes
              </label>
              <input
                type="text"
                value={deliveryNotes}
                onChange={e => setDeliveryNotes(e.target.value)}
                placeholder="Gate code, landmark notes..."
                style={{
                  width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1',
                  fontSize: '0.85rem', fontWeight: 600, color: '#1e293b', outline: 'none', boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '9px 18px', borderRadius: '8px', border: '1px solid #cbd5e1',
                background: '#fff', color: '#475569', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer'
              }}
            >
              Cancel (Esc)
            </button>
            <button
              type="submit"
              style={{
                padding: '9px 22px', borderRadius: '8px', border: 'none',
                background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                color: '#fff', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(22, 163, 74, 0.35)'
              }}
            >
              <FaCheckCircle /> Confirm & Place Order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default React.memo(AddressConfirmationModal);
