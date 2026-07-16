import React, { useState, useEffect } from 'react';
import { FaTimes, FaCog } from 'react-icons/fa';

const CustomerSettingsModal = ({
  isOpen,
  onClose,
  settings = { enableLoyalty: false, customerType: 'Regular', creditAllowed: false, creditLimit: 0 },
  onSaveSettings
}) => {
  const [loyalty, setLoyalty] = useState(false);
  const [type, setType] = useState('Regular');
  const [credit, setCredit] = useState(false);
  const [limit, setLimit] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setLoyalty(!!settings?.enableLoyalty);
      setType(settings?.customerType || 'Regular');
      setCredit(!!settings?.creditAllowed);
      setLimit(settings?.creditLimit || 0);
    }
  }, [isOpen, settings]);

  const handleConfirm = () => {
    onSaveSettings({
      enableLoyalty: loyalty,
      customerType: type,
      creditAllowed: credit,
      creditLimit: limit
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)',
      zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--font-family, system-ui)'
    }}>
      <div style={{
        background: '#fff', borderRadius: '12px', padding: '24px', width: '380px',
        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #cbd5e1', paddingBottom: '8px', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0e7490', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaCog /> Customer Account Settings
          </h3>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '1.1rem' }}
          >
            <FaTimes />
          </button>
        </div>

        {/* Inputs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              id="enableLoyaltySetting"
              checked={loyalty}
              onChange={e => setLoyalty(e.target.checked)}
              style={{ width: '16px', height: '16px', cursor: 'pointer' }}
            />
            <label htmlFor="enableLoyaltySetting" style={{ fontSize: '12px', fontWeight: 700, color: '#334155', cursor: 'pointer' }}>
              Enable Loyalty Points Program
            </label>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b' }}>Customer Classification</label>
            <select
              value={type}
              onChange={e => setType(e.target.value)}
              style={{ padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', fontWeight: 700, background: '#fff' }}
            >
              <option value="Regular">Regular Account</option>
              <option value="Corporate">Corporate Group</option>
              <option value="VIP">VIP Tier Account</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
            <input
              type="checkbox"
              id="creditAllowedSetting"
              checked={credit}
              onChange={e => setCredit(e.target.checked)}
              style={{ width: '16px', height: '16px', cursor: 'pointer' }}
            />
            <label htmlFor="creditAllowedSetting" style={{ fontSize: '12px', fontWeight: 700, color: '#334155', cursor: 'pointer' }}>
              Allow Bill to Account / Credit Line
            </label>
          </div>

          {credit && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b' }}>Credit Limit (₹)</label>
              <input
                type="number"
                value={limit}
                onChange={e => setLimit(parseFloat(e.target.value) || 0)}
                style={{ padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', fontWeight: 700 }}
              />
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button onClick={onClose} className="btn-secondary" style={{ padding: '8px 16px', borderRadius: '6px' }}>
            Cancel
          </button>
          <button onClick={handleConfirm} className="btn-primary" style={{ padding: '8px 16px', borderRadius: '6px' }}>
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(CustomerSettingsModal);
