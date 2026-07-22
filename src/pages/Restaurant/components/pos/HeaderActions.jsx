import React from 'react';
import { FaUtensils, FaUser, FaUsers, FaCommentAlt, FaUserTie } from 'react-icons/fa';
import { MOCK_WAITERS } from '../../constants/mockData';

const HeaderActions = ({
  assignedTableNo,
  customerName,
  paxCount,
  hasRemarks,
  waiter,
  onWaiterChange,
  isPaid,
  onTableClick,
  onCustomerClick,
  onPaxClick,
  onRemarksClick
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
      {/* Row 1: Table, Customer, PAX, Remarks */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
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

      {/* Row 2: Waiter dropdown */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '6px 10px', border: '1px solid #cbd5e1', borderRadius: '8px',
        background: '#ffffff'
      }}>
        <FaUserTie size={13} color="#0e7490" style={{ flexShrink: 0 }} />
        <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#0e7490', whiteSpace: 'nowrap' }}>Waiter:</span>
        <select
          value={waiter || ''}
          onChange={e => onWaiterChange && onWaiterChange(e.target.value)}
          disabled={isPaid}
          style={{
            flex: 1, height: '28px', borderRadius: '6px',
            border: '1px solid #e2e8f0', background: isPaid ? '#f1f5f9' : '#fff',
            fontSize: '0.75rem', fontWeight: 700, color: waiter ? '#0f172a' : '#94a3b8',
            outline: 'none', cursor: isPaid ? 'not-allowed' : 'pointer', paddingLeft: '6px'
          }}
        >
          <option value="">— Select Waiter —</option>
          {MOCK_WAITERS.map(w => (
            <option key={w} value={w}>{w}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default React.memo(HeaderActions);
