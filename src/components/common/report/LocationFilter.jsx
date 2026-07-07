import React from 'react';

const LocationFilter = ({ country, onCountryChange, state, onStateChange, city, onCityChange }) => {
  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Country</label>
        <input
          type="text"
          placeholder="Enter Country"
          value={country}
          onChange={e => onCountryChange(e.target.value)}
          className="custom-form-input"
        />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>State</label>
        <input
          type="text"
          placeholder="Enter State"
          value={state}
          onChange={e => onStateChange(e.target.value)}
          className="custom-form-input"
        />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>City</label>
        <input
          type="text"
          placeholder="Enter City"
          value={city}
          onChange={e => onCityChange(e.target.value)}
          className="custom-form-input"
        />
      </div>
    </>
  );
};

export default LocationFilter;
