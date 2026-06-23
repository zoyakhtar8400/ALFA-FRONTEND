import React, { useState } from 'react';

const NightAuditForm = ({ mode, initialData, onSave, onCancel }) => {
  const [auditDate, setAuditDate] = useState(
    initialData?.auditDate || new Date().toISOString().split('T')[0]
  );
  const [running, setRunning] = useState(false);

  const handleNightAudit = () => {
    setRunning(true);
    setTimeout(() => {
      setRunning(false);
      onSave({ auditDate });
    }, 1500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div className="form-field">
        <label className="form-label">Audit Date <span className="text-red-500">*</span></label>
        <input
          className="form-input"
          type="date"
          value={auditDate}
          onChange={(e) => setAuditDate(e.target.value)}
          required
          disabled={running}
        />
      </div>

      {running && (
        <div style={{ padding: '14px 18px', background: 'var(--primary-light)', borderRadius: '10px', fontSize: '0.875rem', color: 'var(--dark)', fontWeight: 500 }}>
          ⟳ Running night audit for {auditDate}, please wait...
        </div>
      )}

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '16px', marginTop: '8px' }}>
        <button type="button" onClick={onCancel} className="btn-secondary" disabled={running}>
          Cancel
        </button>
        <button
          type="button"
          onClick={handleNightAudit}
          disabled={running}
          className="btn-primary"
          style={{ minWidth: '140px' }}
        >
          {running ? '⟳ Running...' : 'Run Audit'}
        </button>
      </div>
    </div>
  );
};

export default NightAuditForm;
