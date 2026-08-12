import React, { useState, useEffect } from 'react';
import { FaUtensils, FaUser, FaUsers, FaCommentAlt, FaUserTie, FaTruck } from 'react-icons/fa';
import posApi from '../../../../api/posApi';

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
  mobileNumber,
  paxCount,
  hasRemarks,
  waiter,
  onWaiterChange,
  deliveryBoy,
  onDeliveryBoyChange,
  isPaid,
  onTableClick,
  onCustomerClick,
  onPaxClick,
  onRemarksClick
}) => {
  const [waitersList, setWaitersList] = useState([]);
  const [deliveryBoysList, setDeliveryBoysList] = useState([]);

  useEffect(() => {
    posApi.getStewards().then(res => {
      const stewards = Array.isArray(res?.data) ? res.data : (Array.isArray(res?.waiters) ? res.waiters : []);
      const mapped = stewards.map(s => s.name || s.waiter_name || `Steward ${s.id}`);
      const uniqueWaiters = Array.from(new Set(mapped.length > 0 ? mapped : ['Staff', 'Steward Michael', 'Steward Alex', 'Steward John']));
      setWaitersList(uniqueWaiters);
    }).catch(err => {
      console.error('Error fetching waiters for POS header:', err);
      setWaitersList(['Staff', 'Steward Michael', 'Steward Alex', 'Steward John']);
    });

    posApi.getDeliveryBoys().then(res => {
      const boys = Array.isArray(res?.data) ? res.data : [];
      const mapped = boys.map(b => b.name || b.delivery_boy_name || b.partner || `Delivery ${b.id}`);
      const uniqueBoys = Array.from(new Set(mapped.length > 0 ? mapped : ['Swiggy Partner', 'Zomato Partner', 'Direct Delivery']));
      setDeliveryBoysList(uniqueBoys);
    }).catch(err => {
      console.error('Error fetching delivery boys for POS header:', err);
      setDeliveryBoysList(['Swiggy Partner', 'Zomato Partner', 'Direct Delivery']);
    });
  }, []);

  const isCustomerLinked = Boolean(customerName || (mobileNumber && mobileNumber !== '—'));
  const customerLabel = isCustomerLinked
    ? `${customerName || 'Customer'}${mobileNumber && mobileNumber !== '—' ? ` (${mobileNumber})` : ''}`
    : 'Customer';

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
            border: isCustomerLinked ? '1px solid #0e7490' : '1px solid #cbd5e1',
            borderRadius: '6px',
            background: isCustomerLinked ? '#f0f9ff' : '#ffffff',
            color: '#0e7490',
            fontWeight: 800,
            fontSize: '0.68rem',
            cursor: 'pointer',
            transition: 'all 0.15s',
            boxSizing: 'border-box',
            height: '36px'
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#f0f9ff'}
          onMouseLeave={e => e.currentTarget.style.background = isCustomerLinked ? '#f0f9ff' : '#ffffff'}
        >
          <FaUser size={11} style={{ flexShrink: 0 }} />
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {customerLabel}
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

      {/* Row 2: Waiter & Delivery Boy dropdowns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '4px 8px', border: '1px solid #cbd5e1', borderRadius: '8px',
          background: '#ffffff'
        }}>
          <FaUserTie size={12} color="#0e7490" style={{ flexShrink: 0 }} />
          <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#0e7490', whiteSpace: 'nowrap' }}>Waiter:</span>
          <select
            value={waiter || ''}
            onChange={e => onWaiterChange && onWaiterChange(e.target.value)}
            disabled={isPaid}
            style={{
              flex: 1, height: '26px', borderRadius: '4px',
              border: '1px solid #e2e8f0', background: isPaid ? '#f1f5f9' : '#fff',
              fontSize: '0.72rem', fontWeight: 700, color: waiter ? '#0f172a' : '#94a3b8',
              outline: 'none', cursor: isPaid ? 'not-allowed' : 'pointer', paddingLeft: '4px'
            }}
          >
            <option value="">— Select Waiter —</option>
            {waitersList.map((w, idx) => (
              <option key={`waiter-${w}-${idx}`} value={w}>{w}</option>
            ))}
          </select>
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '4px 8px', border: '1px solid #cbd5e1', borderRadius: '8px',
          background: '#ffffff'
        }}>
          <FaTruck size={12} color="#0e7490" style={{ flexShrink: 0 }} />
          <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#0e7490', whiteSpace: 'nowrap' }}>Delivery:</span>
          <select
            value={deliveryBoy || ''}
            onChange={e => onDeliveryBoyChange && onDeliveryBoyChange(e.target.value)}
            disabled={isPaid}
            style={{
              flex: 1, height: '26px', borderRadius: '4px',
              border: '1px solid #e2e8f0', background: isPaid ? '#f1f5f9' : '#fff',
              fontSize: '0.72rem', fontWeight: 700, color: deliveryBoy ? '#0f172a' : '#94a3b8',
              outline: 'none', cursor: isPaid ? 'not-allowed' : 'pointer', paddingLeft: '4px'
            }}
          >
            <option value="">— Select Delivery Partner —</option>
            {deliveryBoysList.map((b, idx) => (
              <option key={`delivery-${b}-${idx}`} value={b}>{b}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default React.memo(HeaderActions);
