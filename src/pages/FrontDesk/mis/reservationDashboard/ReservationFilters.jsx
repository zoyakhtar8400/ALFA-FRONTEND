import React from 'react';

const ReservationFilters = ({
  filters = {}, onFilterChange, onResetFilters,
  roomTypes = [], floors = [], segments = [], sources = [], bookingSources = []
}) => {
  const Field = ({ label, children }) => (
    <div className="form-field">
      <label className="form-label">{label}</label>
      {children}
    </div>
  );

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderBottom: '1px solid var(--border)', background: 'linear-gradient(180deg, #F8FAFC 0%, #F1F5F9 100%)' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.75px', color: 'var(--dark)' }}>Filters</span>
        <button onClick={onResetFilters} style={{ background: 'none', border: 'none', fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', cursor: 'pointer' }}>
          Clear All
        </button>
      </div>

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <Field label="Room Type">
          <select className="form-select" value={filters.roomType || 'All'} onChange={e => onFilterChange('roomType', e.target.value)}>
            <option value="All">All Room Types</option>
            {roomTypes.map(rt => <option key={rt.key} value={rt.key}>{rt.name}</option>)}
          </select>
        </Field>

        <Field label="Floor">
          <select className="form-select" value={filters.floor || 'All'} onChange={e => onFilterChange('floor', e.target.value)}>
            <option value="All">All Floors</option>
            {floors.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </Field>

        <Field label="Room No.">
          <input className="form-input" type="text" placeholder="Select Room" value={filters.roomNo || ''} onChange={e => onFilterChange('roomNo', e.target.value)} />
        </Field>

        <Field label="Booking Status">
          <select className="form-select" value={filters.status || 'All'} onChange={e => onFilterChange('status', e.target.value)}>
            <option value="All">All Status</option>
            <option value="Checked-In">Checked In</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Reserved">Reserved</option>
            <option value="Checked-Out">Checked Out</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </Field>

        <Field label="Market Segment">
          <select className="form-select" value={filters.segment || 'All'} onChange={e => onFilterChange('segment', e.target.value)}>
            <option value="All">All Segments</option>
            {segments.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>

        <Field label="Business Source">
          <select className="form-select" value={filters.source || 'All'} onChange={e => onFilterChange('source', e.target.value)}>
            <option value="All">All Sources</option>
            {sources.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>

        <Field label="Booking Source">
          <select className="form-select" value={filters.bookingSource || 'All'} onChange={e => onFilterChange('bookingSource', e.target.value)}>
            <option value="All">All Sources</option>
            {bookingSources.map(bs => <option key={bs} value={bs}>{bs}</option>)}
          </select>
        </Field>

        <Field label="VIP">
          <select className="form-select" value={filters.isVip ? 'vip' : 'All'} onChange={e => onFilterChange('isVip', e.target.value === 'vip')}>
            <option value="All">All</option>
            <option value="vip">VIP Only</option>
          </select>
        </Field>

        <button className="btn-primary" style={{ width: '100%', marginTop: '4px', borderRadius: '10px' }}>
          Apply Filters
        </button>
      </div>
    </div>
  );
};

export default ReservationFilters;
