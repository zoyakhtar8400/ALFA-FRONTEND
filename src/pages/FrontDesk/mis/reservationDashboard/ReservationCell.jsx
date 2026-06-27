import React from 'react';
import { FaPlus } from 'react-icons/fa';

const ReservationCell = ({ onClick }) => (
  <td
    onClick={onClick}
    style={{
      padding: '6px 4px', cursor: 'pointer', textAlign: 'center',
      borderRight: '1px solid var(--border)', height: '52px',
      width: '110px', minWidth: '110px', transition: 'background 0.15s',
    }}
    onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-light)'}
    onMouseLeave={e => e.currentTarget.style.background = ''}
  >
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', fontWeight: 700, color: 'var(--primary)', opacity: 0, transition: 'opacity 0.15s' }}
      onMouseEnter={e => e.currentTarget.style.opacity = '1'}
    >
      <FaPlus size={8} /> Book
    </span>
  </td>
);

export default ReservationCell;
