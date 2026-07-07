import React from 'react';

const GRCFilter = ({ value, onChange }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>GRC No.</label>
      <input
        type="text"
        placeholder="Enter GRC No."
        value={value}
        onChange={e => onChange(e.target.value)}
        className="custom-form-input"
      />
    </div>
  );
};

export default GRCFilter;
