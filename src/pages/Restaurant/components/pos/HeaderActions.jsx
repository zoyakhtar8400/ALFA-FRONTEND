import React from 'react';
import { FaUtensils, FaUser, FaUsers, FaCommentAlt, FaUserTie } from 'react-icons/fa';
import { MOCK_WAITERS } from '../../constants/mockData';

const formatTableNoDisplay = (tableVal) => {
  if (!tableVal) return 'Table';
  const str = String(tableVal).trim();
  const numMatches = str.match(/\d+/);
  if (numMatches) {
    return `T${numMatches[0].padStart(2, '0')}`;
  }
  if (str.startsWith('T')) return str;
  return `T${str}`;
};

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
      {/* Single Horizontal Row: Table, Customer, PAX, Remarks */}
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        gap: '6px',
        boxSizing: 'border-box'
      }}>
        <button
          type="button"
          onClick={onTableClick}
          style={{
            flex: '1 1 0',
            minWidth: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            padding: '6px 4px',
            border: '1px solid #cbd5e1',
            borderRadius: '6px',
            background: '#ffffff',
            color: '#0e7490',
            fontWeight: 800,
            fontSize: '0.68rem',
            cursor: 'pointer',
            transition: 'all 0.15s',
            boxSizing: 'border-box',
            height: '36px'
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#f0f9ff'}
          onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}
        >
          <FaUtensils size={11} style={{ flexShrink: 0 }} />
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {formatTableNoDisplay(assignedTableNo)}
          </span>
        </button>

        <button
          type="button"
          onClick={onCustomerClick}
          style={{
            flex: '1 1 0',
            minWidth: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            padding: '6px 4px',
            border: '1px solid #cbd5e1',
            borderRadius: '6px',
            background: '#ffffff',
            color: '#0e7490',
            fontWeight: 800,
            fontSize: '0.68rem',
            cursor: 'pointer',
            transition: 'all 0.15s',
            boxSizing: 'border-box',
            height: '36px'
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#f0f9ff'}
          onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}
        >
          <FaUser size={11} style={{ flexShrink: 0 }} />
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {customerName ? `${customerName}` : 'Customer'}
          </span>
        </button>

        <button
          type="button"
          onClick={onPaxClick}
          style={{
            flex: '1 1 0',
            minWidth: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            padding: '6px 4px',
            border: '1px solid #cbd5e1',
            borderRadius: '6px',
            background: '#ffffff',
            color: '#0e7490',
            fontWeight: 800,
            fontSize: '0.68rem',
            cursor: 'pointer',
            transition: 'all 0.15s',
            boxSizing: 'border-box',
            height: '36px'
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#f0f9ff'}
          onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}
        >
          <FaUsers size={11} style={{ flexShrink: 0 }} />
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {paxCount > 0 ? `PAX:${paxCount}` : 'PAX:1'}
          </span>
        </button>

        <button
          type="button"
          onClick={onRemarksClick}
          style={{
            flex: '1 1 0',
            minWidth: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            padding: '6px 4px',
            border: '1px solid #cbd5e1',
            borderRadius: '6px',
            background: '#ffffff',
            color: '#0e7490',
            fontWeight: 800,
            fontSize: '0.68rem',
            cursor: 'pointer',
            transition: 'all 0.15s',
            position: 'relative',
            boxSizing: 'border-box',
            height: '36px'
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#f0f9ff'}
          onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}
        >
          <FaCommentAlt size={11} style={{ flexShrink: 0 }} />
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Remarks</span>
          {hasRemarks && (
            <span style={{
              position: 'absolute', top: '3px', right: '4px',
              width: '5px', height: '5px', background: '#ef4444',
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
