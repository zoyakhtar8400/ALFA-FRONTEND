import React from 'react';

const ServiceChargeTypeFilter = ({ value, onChange }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Service Charge Category</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="custom-form-input"
        style={{ paddingRight: '28px', appearance: 'none', background: 'url("data:image/svg+xml;utf8,<svg fill=\'%2364748b\' height=\'24\' viewBox=\'0 0 24 24\' width=\'24\' xmlns=\'http://www.w3.org/2000/svg\'><path d=\'M7 10l5 5 5-5z\'/></svg>") no-repeat right 10px center/16px' }}
      >
        <option value="All">All Services</option>
        <option value="Room Dining">Room Dining</option>
        <option value="Travel Desk">Travel Desk / Airport Transfer</option>
        <option value="Laundry Service">Laundry Service</option>
        <option value="Extra Bed">Extra Bed Charges</option>
      </select>
    </div>
  );
};

export default ServiceChargeTypeFilter;
