import React from 'react';

const MonthFilter = ({ value, onChange, label = "Month" }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="custom-form-input"
        style={{ paddingRight: '28px', appearance: 'none', background: 'url("data:image/svg+xml;utf8,<svg fill=\'%2364748b\' height=\'24\' viewBox=\'0 0 24 24\' width=\'24\' xmlns=\'http://www.w3.org/2000/svg\'><path d=\'M7 10l5 5 5-5z\'/></svg>") no-repeat right 10px center/16px' }}
      >
        <option value="Select">Select</option>
        <option value="January">JANUARY</option>
        <option value="February">FEBRUARY</option>
        <option value="March">MARCH</option>
        <option value="April">APRIL</option>
        <option value="May">MAY</option>
        <option value="June">JUNE</option>
        <option value="July">JULY</option>
        <option value="August">AUGUST</option>
        <option value="September">SEPTEMBER</option>
        <option value="October">OCTOBER</option>
        <option value="November">NOVEMBER</option>
        <option value="December">DECEMBER</option>
      </select>
    </div>
  );
};

export default MonthFilter;
