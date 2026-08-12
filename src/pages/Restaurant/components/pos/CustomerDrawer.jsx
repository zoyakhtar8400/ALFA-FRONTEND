import React, { useState, useEffect, useRef } from 'react';
import { FaTimes, FaUserAlt, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import { customerService } from '../../../../services/customerService';

const CustomerDrawer = ({ isOpen, onClose, currentCustomer, onSaveCustomer }) => {
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [locality, setLocality] = useState('');
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef(null);

  // Hydrate form on open
  useEffect(() => {
    if (isOpen) {
      setPhone(currentCustomer?.phone || '');
      setName(currentCustomer?.name || '');
      setAddress(currentCustomer?.address || '');
      setLocality(currentCustomer?.locality || '');
    }
  }, [isOpen, currentCustomer]);

  // Handle phone changes — debounced live lookup from backend
  const handlePhoneChange = (e) => {
    const val = e.target.value;
    setPhone(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (val.length === 10) {
      debounceRef.current = setTimeout(async () => {
        try {
          setSearching(true);
          const res = await customerService.getCustomers(val);
          const customers = res?.customers || res?.data || [];
          const match = Array.isArray(customers) && customers.find(
            c => String(c.phone) === val || String(c.mobile) === val
          );
          if (match) {
            setName(match.name || '');
            setAddress(match.address || '');
            setLocality(match.locality || match.area || '');
          }
        } catch (err) {
          // silently ignore lookup errors
        } finally {
          setSearching(false);
        }
      }, 300);
    }
  };

  const handleConfirm = async (e) => {
    e.preventDefault();
    if (!phone) return;
    const custData = { phone, name: name || 'Walk-in', address, locality };
    try {
      await customerService.createCustomer(custData);
    } catch (err) {
      // persist failure is non-blocking
    }
    onSaveCustomer(custData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)',
      zIndex: 9999, display: 'flex', justifyContent: 'flex-end',
      fontFamily: 'var(--font-family, system-ui)'
    }}>
      <div style={{
        background: '#fff', width: '380px', height: '100%',
        boxShadow: '-4px 0 25px rgba(0,0,0,0.15)', display: 'flex',
        flexDirection: 'column', animation: 'slideIn 0.2s ease-out'
      }}>
        {/* Drawer Header */}
        <div style={{
          background: '#0e7490', color: '#fff', padding: '18px 20px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>
            Customer Profiler
          </h3>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1.1rem' }}
          >
            <FaTimes />
          </button>
        </div>

        {/* Drawer Body */}
        <form onSubmit={handleConfirm} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, overflowY: 'auto' }}>
          {/* Phone Field */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '0.7rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>Phone Number *</label>
            <div style={{ position: 'relative' }}>
              <FaPhone style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                autoFocus
                required
                maxLength="10"
                value={phone}
                onChange={handlePhoneChange}
                placeholder="Enter 10-digit mobile..."
                style={{ width: '100%', padding: '10px 12px 10px 34px', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem', background: searching ? '#f0f9ff' : '#fff' }}
              />
            </div>
          </div>

          {/* Name Field */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '0.7rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>Customer Name</label>
            <div style={{ position: 'relative' }}>
              <FaUserAlt style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Guest full name..."
                style={{ width: '100%', padding: '10px 12px 10px 34px', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: 600, fontSize: '0.85rem' }}
              />
            </div>
          </div>

          {/* Address Field */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '0.7rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>Address</label>
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="Delivery address details..."
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.85rem' }}
            />
          </div>

          {/* Locality Field */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '0.7rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>Locality</label>
            <div style={{ position: 'relative' }}>
              <FaMapMarkerAlt style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                value={locality}
                onChange={e => setLocality(e.target.value)}
                placeholder="Locality area..."
                style={{ width: '100%', padding: '10px 12px 10px 34px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.85rem' }}
              />
            </div>
          </div>

          {/* Submit Action */}
          <div style={{ marginTop: 'auto', display: 'flex', gap: '10px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              style={{ flex: 1, padding: '12px 0', borderRadius: '8px', fontWeight: 700 }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              style={{ flex: 2, padding: '12px 0', borderRadius: '8px', fontWeight: 800 }}
            >
              Link Customer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default React.memo(CustomerDrawer);
