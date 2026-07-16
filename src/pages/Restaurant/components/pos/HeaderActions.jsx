import React from 'react';
import { FaUtensils, FaUser, FaUsers, FaCommentAlt } from 'react-icons/fa';

const HeaderActions = ({
  assignedTableNo,
  customerName,
  paxCount,
  hasRemarks,
  onTableClick,
  onCustomerClick,
  onPaxClick,
  onRemarksClick
}) => {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '8px',
      marginTop: '8px'
    }}>
      {/* Table Selector Action */}
      <button
        type="button"
        onClick={onTableClick}
        style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
          padding: '8px 4px', border: '1px solid #cbd5e1', borderRadius: '8px',
          background: '#ffffff', color: '#0e7490', fontWeight: 800, fontSize: '0.68rem',
          cursor: 'pointer', transition: 'all 0.15s'
        }}
        onMouseEnter={e => e.currentTarget.style.background = '#f0f9ff'}
        onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}
      >
        <FaUtensils size={14} />
        <span>{assignedTableNo ? `Table: T${assignedTableNo}` : 'Select Table'}</span>
      </button>

      {/* Customer Action */}
      <button
        type="button"
        onClick={onCustomerClick}
        style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
          padding: '8px 4px', border: '1px solid #cbd5e1', borderRadius: '8px',
          background: '#ffffff', color: '#0e7490', fontWeight: 800, fontSize: '0.68rem',
          cursor: 'pointer', transition: 'all 0.15s', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
        }}
        onMouseEnter={e => e.currentTarget.style.background = '#f0f9ff'}
        onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}
      >
        <FaUser size={14} />
        <span>{customerName ? `${customerName}` : 'Customer'}</span>
      </button>

      {/* PAX Action */}
      <button
        type="button"
        onClick={onPaxClick}
        style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
          padding: '8px 4px', border: '1px solid #cbd5e1', borderRadius: '8px',
          background: '#ffffff', color: '#0e7490', fontWeight: 800, fontSize: '0.68rem',
          cursor: 'pointer', transition: 'all 0.15s'
        }}
        onMouseEnter={e => e.currentTarget.style.background = '#f0f9ff'}
        onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}
      >
        <FaUsers size={14} />
        <span>{paxCount > 0 ? `PAX: ${paxCount}` : 'Set PAX'}</span>
      </button>

      {/* Remarks Action */}
      <button
        type="button"
        onClick={onRemarksClick}
        style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
          padding: '8px 4px', border: '1px solid #cbd5e1', borderRadius: '8px',
          background: '#ffffff', color: '#0e7490', fontWeight: 800, fontSize: '0.68rem',
          cursor: 'pointer', transition: 'all 0.15s', position: 'relative'
        }}
        onMouseEnter={e => e.currentTarget.style.background = '#f0f9ff'}
        onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}
      >
        <FaCommentAlt size={14} />
        <span>Remarks</span>
        {hasRemarks && (
          <span style={{
            position: 'absolute', top: '6px', right: '16px',
            width: '6px', height: '6px', background: '#ef4444',
            borderRadius: '50%'
          }} />
        )}
      </button>
    </div>
  );
};

export default React.memo(HeaderActions);
