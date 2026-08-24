import React, { useState, useEffect } from 'react';
import { FaUtensils, FaUser, FaUsers, FaCommentAlt, FaUserTie, FaTruck, FaTag } from 'react-icons/fa';
import posApi from '../../../../api/posApi';
import { useRestaurant } from '../../../../context/RestaurantContext';

const formatTableNoDisplay = (tableVal) => {
  if (!tableVal) return 'Table';
  return String(tableVal).trim();
};

const resolveStoreId = (val, outletsList = []) => {
  if (!val || val === 'All' || val === 'ALL') return 'All';
  const str = String(val).trim();
  
  if (Array.isArray(outletsList) && outletsList.length > 0) {
    const matched = outletsList.find(o => 
      String(o.store_id || '').toLowerCase() === str.toLowerCase() ||
      String(o.id || '') === str ||
      `store_${o.id}`.toLowerCase() === str.toLowerCase() ||
      String(o.store_name || '').toLowerCase() === str.toLowerCase() ||
      String(o.name || '').toLowerCase() === str.toLowerCase()
    );
    if (matched) {
      return matched.store_id || `STORE_${matched.id}`;
    }
  }

  if (str.toLowerCase().includes('main') || str === '1') {
    return 'STORE_1';
  }

  const num = parseInt(str.replace(/\D/g, ''), 10);
  if (!isNaN(num)) {
    return `STORE_${num}`;
  }

  return str.toUpperCase();
};

const HeaderActions = ({
  serviceType,
  assignedTableNo,
  customerName,
  mobileNumber,
  paxCount,
  hasRemarks,
  waiter,
  onWaiterChange,
  deliveryBoy,
  onDeliveryBoyChange,
  ncType,
  onNcTypeChange,
  isPaid,
  onTableClick,
  onCustomerClick,
  onPaxClick,
  onRemarksClick
}) => {
  const { activeStoreId, activeOutletId, allOutlets } = useRestaurant ? useRestaurant() : {};
  const [waitersList, setWaitersList] = useState([]);
  const [deliveryBoysList, setDeliveryBoysList] = useState([]);
  const [ncTypesList, setNcTypesList] = useState([]);

  useEffect(() => {
    const loadHeaderMasters = () => {
      const rawOutlet = activeStoreId || activeOutletId || localStorage.getItem('activeOutletId') || 'STORE_1';
      const normCurrent = resolveStoreId(rawOutlet, allOutlets);

      // 1. Stewards / Waiters filtered strictly by active outlet
      posApi.getStewards({ store_id: normCurrent }).then(res => {
        const stewards = Array.isArray(res?.data) ? res.data : (Array.isArray(res?.waiters) ? res.waiters : (Array.isArray(res) ? res : []));
        const filtered = stewards.filter(s => {
          const normItem = resolveStoreId(s.store_id, allOutlets);
          return normCurrent === 'All' || normCurrent === normItem || (normCurrent === 'STORE_1' && (!s.store_id || normItem === 'STORE_1'));
        });
        const targetList = filtered.length > 0 ? filtered : stewards;
        const mapped = targetList
          .filter(s => s.status !== 'Inactive')
          .map(s => (s.name || s.waiter_name || `Steward ${s.id}`).trim())
          .filter(Boolean);
        const uniqueWaiters = Array.from(new Set(mapped.length > 0 ? mapped : ['Staff']));
        setWaitersList(uniqueWaiters);
      }).catch(err => {
        console.error('Error fetching waiters for POS header:', err);
        setWaitersList(['Staff']);
      });

      // 2. Delivery Boys / Partners filtered strictly by active outlet
      posApi.getDeliveryBoys({ store_id: normCurrent }).then(res => {
        const boys = Array.isArray(res?.data) ? res.data : (Array.isArray(res?.delivery_boys) ? res.delivery_boys : (Array.isArray(res) ? res : []));
        const filtered = boys.filter(b => {
          const normItem = resolveStoreId(b.store_id, allOutlets);
          return normCurrent === 'All' || normCurrent === normItem || (normCurrent === 'STORE_1' && (!b.store_id || normItem === 'STORE_1'));
        });
        const targetList = filtered.length > 0 ? filtered : boys;
        const mapped = targetList
          .filter(b => b.status !== 'Inactive')
          .map(b => (b.name || b.delivery_boy_name || b.partner || `Delivery ${b.id}`).trim())
          .filter(Boolean);
        const uniqueBoys = Array.from(new Set(mapped.length > 0 ? mapped : ['Direct Delivery']));
        setDeliveryBoysList(uniqueBoys);
      }).catch(err => {
        console.error('Error fetching delivery boys for POS header:', err);
        setDeliveryBoysList(['Direct Delivery']);
      });

      // 3. NC Types (Non-Chargeable Types) loaded strictly from NC Type Master database
      posApi.getNCTypes({ store_id: normCurrent }).then(res => {
        const ncs = Array.isArray(res?.data) ? res.data : (Array.isArray(res?.ncTypes) ? res.ncTypes : (Array.isArray(res) ? res : []));
        const filtered = ncs.filter(n => {
          const normItem = resolveStoreId(n.store_id, allOutlets);
          return normCurrent === 'All' || normCurrent === normItem || (normCurrent === 'STORE_1' && (!n.store_id || normItem === 'STORE_1'));
        });
        const targetList = filtered.length > 0 ? filtered : (ncs.length > 0 ? ncs : []);
        const mapped = targetList
          .filter(n => n.status !== 'Inactive')
          .map(n => (n.name || n.nc_type_name || n.title || '').trim())
          .filter(Boolean);
        const uniqueNcs = Array.from(new Set(mapped));
        setNcTypesList(uniqueNcs);
      }).catch(err => {
        console.error('Error fetching NC types for POS header:', err);
        setNcTypesList([]);
      });
    };

    loadHeaderMasters();
    window.addEventListener('outletChanged', loadHeaderMasters);
    window.addEventListener('ncTypesMasterRefreshed', loadHeaderMasters);
    window.addEventListener('stewardsMasterRefreshed', loadHeaderMasters);
    window.addEventListener('deliveryMasterRefreshed', loadHeaderMasters);
    return () => {
      window.removeEventListener('outletChanged', loadHeaderMasters);
      window.removeEventListener('ncTypesMasterRefreshed', loadHeaderMasters);
      window.removeEventListener('stewardsMasterRefreshed', loadHeaderMasters);
      window.removeEventListener('deliveryMasterRefreshed', loadHeaderMasters);
    };
  }, [activeStoreId, activeOutletId, allOutlets]);

  const isCustomerLinked = Boolean(customerName || (mobileNumber && mobileNumber !== '—'));
  const customerLabel = isCustomerLinked
    ? `${customerName || 'Customer'}${mobileNumber && mobileNumber !== '—' ? ` (${mobileNumber})` : ''}`
    : 'Customer';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
      {/* Row 1: Table, Customer, PAX, Remarks */}
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        gap: '6px',
        boxSizing: 'border-box'
      }}>
        {serviceType === 'Dine In' && (
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
            title="Select Assigned Table"
          >
            <FaUtensils size={11} style={{ flexShrink: 0 }} />
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {formatTableNoDisplay(assignedTableNo)}
            </span>
          </button>
        )}

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
          title="Attach Customer Information"
        >
          <FaUser size={11} style={{ flexShrink: 0 }} />
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {customerLabel}
          </span>
        </button>

        {serviceType === 'Dine In' && (
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
            title="Guest PAX Count"
          >
            <FaUsers size={11} style={{ flexShrink: 0 }} />
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {paxCount > 0 ? `PAX:${paxCount}` : 'PAX:1'}
            </span>
          </button>
        )}

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
          title="Add Order / Kitchen Remarks"
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

      {/* Row 2: Waiter, Delivery, NC Type Dropdowns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', minWidth: 0 }}>
        {/* 1. Waiter */}
        {serviceType === 'Dine In' && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            padding: '3px 6px', border: '1px solid #cbd5e1', borderRadius: '6px',
            background: '#ffffff', minWidth: 0, overflow: 'hidden'
          }}>
            <FaUserTie size={11} color="#0e7490" style={{ flexShrink: 0 }} />
            <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#0e7490', whiteSpace: 'nowrap', flexShrink: 0 }}>Waiter:</span>
            <select
              id="pos-waiter-select"
              value={waiter || ''}
              onChange={e => onWaiterChange && onWaiterChange(e.target.value)}
              disabled={isPaid}
              style={{
                flex: 1, minWidth: 0, width: '100%', height: '24px', borderRadius: '4px',
                border: '1px solid #e2e8f0', background: isPaid ? '#f1f5f9' : '#fff',
                fontSize: '0.7rem', fontWeight: 700, color: waiter ? '#0f172a' : '#94a3b8',
                outline: 'none', cursor: isPaid ? 'not-allowed' : 'pointer', paddingLeft: '2px',
                textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden'
              }}
            >
              <option value="">— Waiter —</option>
              {waitersList.map((w, idx) => (
                <option key={`waiter-${w}-${idx}`} value={w}>{w}</option>
              ))}
            </select>
          </div>
        )}

        {/* 2. Delivery */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '4px',
          padding: '3px 6px', border: '1px solid #cbd5e1', borderRadius: '6px',
          background: '#ffffff', minWidth: 0, overflow: 'hidden'
        }}>
          <FaTruck size={11} color="#0e7490" style={{ flexShrink: 0 }} />
          <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#0e7490', whiteSpace: 'nowrap', flexShrink: 0 }}>Delivery:</span>
          <select
            id="pos-delivery-select"
            value={deliveryBoy || ''}
            onChange={e => onDeliveryBoyChange && onDeliveryBoyChange(e.target.value)}
            disabled={isPaid}
            style={{
              flex: 1, minWidth: 0, width: '100%', height: '24px', borderRadius: '4px',
              border: '1px solid #e2e8f0', background: isPaid ? '#f1f5f9' : '#fff',
              fontSize: '0.7rem', fontWeight: 700, color: deliveryBoy ? '#0f172a' : '#94a3b8',
              outline: 'none', cursor: isPaid ? 'not-allowed' : 'pointer', paddingLeft: '2px',
              textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden'
            }}
          >
            <option value="">— Delivery —</option>
            {deliveryBoysList.map((b, idx) => (
              <option key={`delivery-${b}-${idx}`} value={b}>{b}</option>
            ))}
          </select>
        </div>

        {/* 3. NC Type */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '4px',
          padding: '3px 6px', border: '1px solid #cbd5e1', borderRadius: '6px',
          background: '#ffffff', minWidth: 0, overflow: 'hidden'
        }}>
          <FaTag size={11} color="#0e7490" style={{ flexShrink: 0 }} />
          <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#0e7490', whiteSpace: 'nowrap', flexShrink: 0 }}>NC Type:</span>
          <select
            id="pos-nctype-select"
            value={ncType || ''}
            onChange={e => onNcTypeChange && onNcTypeChange(e.target.value)}
            disabled={isPaid}
            style={{
              flex: 1, minWidth: 0, width: '100%', height: '24px', borderRadius: '4px',
              border: '1px solid #e2e8f0', background: isPaid ? '#f1f5f9' : '#fff',
              fontSize: '0.7rem', fontWeight: 700, color: ncType ? '#0f172a' : '#94a3b8',
              outline: 'none', cursor: isPaid ? 'not-allowed' : 'pointer', paddingLeft: '2px',
              textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden'
            }}
          >
            <option value="">— NC Type —</option>
            {ncTypesList.map((nc, idx) => (
              <option key={`nctype-${nc}-${idx}`} value={nc}>{nc}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default React.memo(HeaderActions);
