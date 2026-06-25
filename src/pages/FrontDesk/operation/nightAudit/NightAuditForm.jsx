import React, { useState } from 'react';
import CommonActionButtons from '../../../../components/common/CommonActionButtons';

const F = ({ label, type = 'text', placeholder, required, disabled, children, value, onChange, style, inputStyle, inputClassName }) => (
  <div className="form-field" style={{ marginBottom: '4px', ...style }}>
    <label className="form-label" style={{ marginBottom: '2px' }}>
      {label}{required && <span className="text-red-500"> *</span>}
    </label>
    {children || (
      <input
        className={`form-input${disabled ? ' bg-slate-50 cursor-not-allowed' : ''} ${inputClassName || ''}`}
        type={type}
        value={value ?? ''}
        onChange={disabled ? undefined : onChange}
        disabled={disabled}
        placeholder={placeholder}
        required={required}
        style={{ fontSize: '0.9rem', padding: '4px 8px', height: '34px', minHeight: '34px', ...inputStyle }}
      />
    )}
  </div>
);

const NightAuditForm = ({ mode, initialData, onSave, onCancel }) => {
  const [auditDate, setAuditDate] = useState(
    initialData?.auditDate || new Date().toISOString().split('T')[0]
  );
  const [running, setRunning] = useState(false);

  const handleNightAudit = () => {
    setRunning(true);
    setTimeout(() => {
      setRunning(false);
      onSave({ auditDate, notes: 'Night audit ran and posting completed successfully.', active: 'Yes' });
    }, 1500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      
      <F label="Audit Date" required>
        <input
          className="form-input"
          type="date"
          value={auditDate}
          onChange={(e) => setAuditDate(e.target.value)}
          required
          disabled={running}
          style={{ fontSize: '0.95rem', fontWeight: 600, padding: '4px 8px', height: '34px' }}
        />
      </F>

      {running && (
        <div style={{
          padding: '12px 14px',
          background: 'linear-gradient(135deg, #6d28d9 0%, #4f46e5 100%)',
          borderRadius: '6px',
          fontSize: '0.85rem',
          color: '#fff',
          fontWeight: 600,
          boxShadow: '0 4px 10px rgba(109, 40, 217, 0.2)',
          textAlign: 'center',
          animation: 'pulse 1.5s infinite ease-in-out'
        }}>
          ⟳ Running night audit for {auditDate}, please wait...
        </div>
      )}

      <CommonActionButtons
        onSave={handleNightAudit}
        onCancel={onCancel}
        saveText={running ? 'Running...' : 'Run Audit'}
        cancelText="Exit"
        loading={running}
      />
    </div>
  );
};

export default NightAuditForm;
