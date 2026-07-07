import React from 'react';

const GuestFilter = ({ value, onChange }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Guest Name</label>
      <input
        type="text"
        placeholder="Enter Guest Name"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="custom-form-input"
      />
    </div>
  );
};

export default GuestFilter;
