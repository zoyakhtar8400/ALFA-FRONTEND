import React, { useState } from 'react';
import {
  FaMotorcycle,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaClock,
  FaPrint,
  FaCheckCircle,
  FaUserCheck,
  FaRupeeSign,
  FaShoppingBag,
  FaUser,
  FaUtensils,
  FaExclamationCircle
} from 'react-icons/fa';

export const TakeawayOrdersTab = ({
  orders = [],
  loading = false,
  statusFilter = 'All',
  onFilterChange,
  onPrintKot,
  onPrintBill,
  onQuickPay,
  onUpdateStatus,
  onNewOrder
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filterTabs = ['All', 'Preparing', 'Ready for Pickup', 'Completed', 'Cancelled'];

  const filteredOrders = orders.filter(order => {
    const rawState = (order.order_state || order.order_status || order.status || 'Preparing').toLowerCase();
    const isPaid = String(order.payment_status || '').toLowerCase() === 'paid';
    
    // Status tab matching
    if (statusFilter === 'Preparing') {
      if (rawState.includes('complete') || rawState.includes('ready') || rawState.includes('cancel')) return false;
    } else if (statusFilter === 'Ready for Pickup') {
      if (!rawState.includes('ready')) return false;
    } else if (statusFilter === 'Completed') {
      if (!rawState.includes('complete') && !(rawState.includes('paid') && isPaid)) return false;
    } else if (statusFilter === 'Cancelled') {
      if (!rawState.includes('cancel')) return false;
    }

    // Search matching
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchNo = String(order.billNo || order.orderNo || order.order_id || '').toLowerCase().includes(q);
      const matchCust = String(order.customer_name || order.customerName || '').toLowerCase().includes(q);
      const matchPhone = String(order.customer_phone || order.phone || order.mobileNo || '').includes(q);
      return matchNo || matchCust || matchPhone;
    }
    return true;
  });

  const getStatusBadge = (order) => {
    const state = String(order.order_state || order.order_status || order.status || 'Preparing');
    const upper = state.toUpperCase();
    if (upper.includes('READY')) {
      return { bg: '#fef3c7', text: '#b45309', label: 'Ready for Pickup', border: '#fde68a' };
    }
    if (upper.includes('COMPLET') || upper.includes('PICKED')) {
      return { bg: '#dcfce7', text: '#15803d', label: 'Picked Up / Completed', border: '#bbf7d0' };
    }
    if (upper.includes('CANCEL')) {
      return { bg: '#fee2e2', text: '#b91c1c', label: 'Cancelled', border: '#fecaca' };
    }
    return { bg: '#e0f2fe', text: '#0369a1', label: 'Preparing', border: '#bae6fd' };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#f8fafc', flex: 1 }}>
      {/* Sub-header Filter Row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 24px',
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        gap: '16px',
        flexWrap: 'wrap'
      }}>
        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {filterTabs.map(tab => {
            const isSelected = statusFilter === tab;
            return (
              <button
                key={tab}
                onClick={() => onFilterChange(tab)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  border: isSelected ? '1px solid #0d9488' : '1px solid #cbd5e1',
                  background: isSelected ? '#0d9488' : '#ffffff',
                  color: isSelected ? '#ffffff' : '#475569',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Search & New Takeaway Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <input
            type="text"
            placeholder="Search Order # or Customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: '7px 14px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '0.82rem',
              width: '240px',
              outline: 'none'
            }}
          />
          <button
            onClick={onNewOrder}
            style={{
              padding: '7px 18px',
              borderRadius: '8px',
              border: 'none',
              background: '#0d9488',
              color: '#fff',
              fontSize: '0.82rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 4px rgba(13, 148, 136, 0.2)'
            }}
          >
            <FaShoppingBag size={12} /> + New Takeaway
          </button>
        </div>
      </div>

      {/* Orders Grid / List */}
      <div style={{ flex: 1, padding: '20px 24px 60px 24px', overflowY: 'auto' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '240px', color: '#64748b', fontWeight: 700 }}>
            Loading Takeaway orders...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div style={{
            padding: '60px 20px',
            textAlign: 'center',
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px dashed #cbd5e1',
            color: '#64748b'
          }}>
            <FaShoppingBag size={36} color="#94a3b8" style={{ marginBottom: '12px' }} />
            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#334155' }}>No Takeaway Orders Found</div>
            <div style={{ fontSize: '0.84rem', marginTop: '4px' }}>Click "+ New Takeaway" to create a fresh takeaway order.</div>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '16px',
            alignContent: 'start'
          }}>
            {filteredOrders.map(order => {
              const badge = getStatusBadge(order);
              const isPaid = String(order.payment_status || '').toLowerCase() === 'paid';
              const itemsList = Array.isArray(order.items) ? order.items : [];
              const orderId = order.id || order.order_id;
              const displayOrderNo = order.billNo || order.orderNo || `TK-${orderId}`;
              const orderTime = order.created_time || order.time || (order.createdAt ? new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now');

              return (
                <div
                  key={`tk-card-${orderId}`}
                  style={{
                    background: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    transition: 'box-shadow 0.2s',
                  }}
                >
                  {/* Top Bar: Order ID & Badges */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.3px' }}>
                        {displayOrderNo}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                        <FaClock size={11} /> {orderTime}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end' }}>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        background: badge.bg,
                        color: badge.text,
                        border: `1px solid ${badge.border}`
                      }}>
                        {badge.label}
                      </span>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        background: isPaid ? '#dcfce7' : '#fee2e2',
                        color: isPaid ? '#15803d' : '#b91c1c',
                        border: `1px solid ${isPaid ? '#bbf7d0' : '#fecaca'}`
                      }}>
                        {isPaid ? `Paid (${order.payment || order.payment_mode || 'Cash'})` : 'Unpaid'}
                      </span>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div style={{ fontSize: '0.82rem', color: '#334155', background: '#f8fafc', padding: '8px 10px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                    <div style={{ fontWeight: 800, color: '#0f172a' }}>
                      {order.customer_name || order.customerName || 'Walk-in Customer'}
                    </div>
                    {(order.customer_phone || order.phone || order.mobileNo) && (order.customer_phone !== '—') && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '0.75rem', marginTop: '2px' }}>
                        <FaPhoneAlt size={10} /> {order.customer_phone || order.phone || order.mobileNo}
                      </div>
                    )}
                  </div>

                  {/* Items Preview */}
                  <div style={{ fontSize: '0.78rem', color: '#475569', minHeight: '44px' }}>
                    <div style={{ fontWeight: 700, color: '#64748b', marginBottom: '4px' }}>
                      Items ({itemsList.reduce((sum, it) => sum + Number(it.qty || 1), 0)}):
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {itemsList.slice(0, 3).map((item, idx) => (
                        <span key={idx} style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontSize: '0.73rem' }}>
                          {item.name || item.itemName} x{item.qty || 1}
                        </span>
                      ))}
                      {itemsList.length > 3 && (
                        <span style={{ background: '#e2e8f0', padding: '2px 6px', borderRadius: '4px', fontSize: '0.73rem', fontWeight: 700 }}>
                          +{itemsList.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Total & Action Buttons */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '10px', marginTop: 'auto' }}>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700 }}>Grand Total</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0f172a' }}>
                        ₹{Number(order.total_amount || order.amount || 0).toLocaleString('en-IN')}
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      {/* Print Bill */}
                      <button
                        type="button"
                        onClick={() => onPrintBill(order)}
                        title="Print Customer Bill"
                        style={{
                          padding: '6px 10px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          background: '#ffffff',
                          color: '#334155',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <FaPrint size={11} /> Bill
                      </button>

                      {/* Pay button if Unpaid */}
                      {!isPaid && (
                        <button
                          type="button"
                          onClick={() => onQuickPay(order)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            border: 'none',
                            background: '#16a34a',
                            color: '#ffffff',
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            cursor: 'pointer'
                          }}
                        >
                          Pay
                        </button>
                      )}

                      {/* Status Transition buttons */}
                      {!badge.label.includes('Completed') && !badge.label.includes('Cancelled') && (
                        badge.label.includes('Ready') ? (
                          <button
                            type="button"
                            onClick={() => onUpdateStatus(order, 'Completed')}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '6px',
                              border: 'none',
                              background: '#0d9488',
                              color: '#ffffff',
                              fontSize: '0.75rem',
                              fontWeight: 800,
                              cursor: 'pointer'
                            }}
                          >
                            Handover
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onUpdateStatus(order, 'Ready for Pickup')}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '6px',
                              border: 'none',
                              background: '#f59e0b',
                              color: '#ffffff',
                              fontSize: '0.75rem',
                              fontWeight: 800,
                              cursor: 'pointer'
                            }}
                          >
                            Mark Ready
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TakeawayOrdersTab;
