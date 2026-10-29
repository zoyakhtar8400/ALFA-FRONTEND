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
  FaUser,
  FaTruck
} from 'react-icons/fa';

export const DeliveryOrdersTab = ({
  orders = [],
  deliveryBoys = [],
  loading = false,
  statusFilter = 'All',
  onFilterChange,
  onPrintKot,
  onPrintBill,
  onQuickPay,
  onUpdateStatus,
  onAssignDeliveryBoy,
  onNewOrder
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrderForBoy, setSelectedOrderForBoy] = useState(null);
  const [assignBoyId, setAssignBoyId] = useState('');

  const filterTabs = ['All', 'Preparing', 'Ready for Dispatch', 'Out for Delivery', 'Delivered', 'Cancelled'];

  const filteredOrders = orders.filter(order => {
    const rawState = (order.order_state || order.order_status || order.status || 'Preparing').toLowerCase();
    const isPaid = String(order.payment_status || '').toLowerCase() === 'paid';

    if (statusFilter === 'Preparing') {
      if (rawState.includes('dispatch') || rawState.includes('out') || rawState.includes('deliver') || rawState.includes('cancel')) return false;
    } else if (statusFilter === 'Ready for Dispatch') {
      if (!rawState.includes('dispatch') && !rawState.includes('ready')) return false;
    } else if (statusFilter === 'Out for Delivery') {
      if (!rawState.includes('out')) return false;
    } else if (statusFilter === 'Delivered') {
      if (!rawState.includes('deliver') && !(rawState.includes('complete') && isPaid)) return false;
    } else if (statusFilter === 'Cancelled') {
      if (!rawState.includes('cancel')) return false;
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchNo = String(order.billNo || order.orderNo || order.order_id || '').toLowerCase().includes(q);
      const matchCust = String(order.customer_name || order.customerName || '').toLowerCase().includes(q);
      const matchPhone = String(order.customer_phone || order.phone || order.mobileNo || '').includes(q);
      const matchAddress = String(order.customer_address || order.address || '').toLowerCase().includes(q);
      return matchNo || matchCust || matchPhone || matchAddress;
    }
    return true;
  });

  const getStatusBadge = (order) => {
    const state = String(order.order_state || order.order_status || order.status || 'Preparing');
    const upper = state.toUpperCase();
    if (upper.includes('DISPATCH') || upper.includes('READY')) {
      return { bg: '#fef3c7', text: '#b45309', label: 'Ready for Dispatch', border: '#fde68a' };
    }
    if (upper.includes('OUT')) {
      return { bg: '#e0e7ff', text: '#4338ca', label: 'Out for Delivery', border: '#c7d2fe' };
    }
    if (upper.includes('DELIVER') || upper.includes('COMPLET')) {
      return { bg: '#dcfce7', text: '#15803d', label: 'Delivered', border: '#bbf7d0' };
    }
    if (upper.includes('CANCEL')) {
      return { bg: '#fee2e2', text: '#b91c1c', label: 'Cancelled', border: '#fecaca' };
    }
    return { bg: '#e0f2fe', text: '#0369a1', label: 'Preparing', border: '#bae6fd' };
  };

  const handleSaveDeliveryBoy = () => {
    if (!selectedOrderForBoy || !assignBoyId) return;
    const boyObj = deliveryBoys.find(b => String(b.id) === String(assignBoyId));
    onAssignDeliveryBoy(selectedOrderForBoy, {
      deliveryboy_id: assignBoyId,
      delivery_boy_name: boyObj?.name || boyObj?.delivery_boy_name || '',
      delivery_boy_phone: boyObj?.phone || ''
    });
    setSelectedOrderForBoy(null);
    setAssignBoyId('');
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
        {/* Filter Tabs */}
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

        {/* Search & New Delivery Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <input
            type="text"
            placeholder="Search Order, Phone or Address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: '7px 14px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '0.82rem',
              width: '260px',
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
            <FaTruck size={12} /> + New Delivery
          </button>
        </div>
      </div>

      {/* Orders Grid */}
      <div style={{ flex: 1, padding: '20px 24px 60px 24px', overflowY: 'auto' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '240px', color: '#64748b', fontWeight: 700 }}>
            Loading Delivery orders...
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
            <FaMotorcycle size={36} color="#94a3b8" style={{ marginBottom: '12px' }} />
            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#334155' }}>No Delivery Orders Found</div>
            <div style={{ fontSize: '0.84rem', marginTop: '4px' }}>Click "+ New Delivery" to start an order with address and customer details.</div>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '16px',
            alignContent: 'start'
          }}>
            {filteredOrders.map(order => {
              const badge = getStatusBadge(order);
              const isPaid = String(order.payment_status || '').toLowerCase() === 'paid';
              const itemsList = Array.isArray(order.items) ? order.items : [];
              const orderId = order.id || order.order_id;
              const displayOrderNo = order.billNo || order.orderNo || `DL-${orderId}`;
              const orderTime = order.created_time || order.time || (order.createdAt ? new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now');
              const assignedBoy = order.delivery_boy_name || order.deliveryBoyName;

              return (
                <div
                  key={`dl-card-${orderId}`}
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

                  {/* Customer & Address Details */}
                  <div style={{ fontSize: '0.82rem', color: '#334155', background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 800, color: '#0f172a' }}>
                        {order.customer_name || order.customerName || 'Customer'}
                      </span>
                      {(order.customer_phone || order.phone || order.mobileNo) && (order.customer_phone !== '—') && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#0284c7', fontSize: '0.76rem', fontWeight: 700 }}>
                          <FaPhoneAlt size={10} /> {order.customer_phone || order.phone || order.mobileNo}
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', color: '#475569', fontSize: '0.76rem', marginTop: '4px' }}>
                      <FaMapMarkerAlt size={12} color="#64748b" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span style={{ lineHeight: 1.3 }}>
                        {order.customer_address || order.address || 'Address not specified'}
                        {order.customer_locality ? `, ${order.customer_locality}` : ''}
                      </span>
                    </div>
                  </div>

                  {/* Delivery Boy Assignment Status */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', background: '#f0fdf4', borderRadius: '6px', border: '1px solid #dcfce7' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 700, color: '#166534' }}>
                      <FaMotorcycle size={12} />
                      {assignedBoy ? (
                        <span>Assigned to: <strong>{assignedBoy}</strong></span>
                      ) : (
                        <span style={{ color: '#ea580c' }}>No delivery partner assigned</span>
                      )}
                    </div>
                    {deliveryBoys && deliveryBoys.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedOrderForBoy(order);
                          setAssignBoyId(order.deliveryboy_id || '');
                        }}
                        style={{
                          padding: '3px 8px',
                          borderRadius: '4px',
                          border: '1px solid #cbd5e1',
                          background: '#fff',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        {assignedBoy ? 'Change' : 'Assign'}
                      </button>
                    )}
                  </div>

                  {/* Items Preview */}
                  <div style={{ fontSize: '0.78rem', color: '#475569', minHeight: '38px' }}>
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
                      {badge.label === 'Preparing' && (
                        <button
                          type="button"
                          onClick={() => onUpdateStatus(order, 'Ready for Dispatch')}
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
                          Dispatch Ready
                        </button>
                      )}

                      {badge.label === 'Ready for Dispatch' && (
                        <button
                          type="button"
                          onClick={() => onUpdateStatus(order, 'Out for Delivery')}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            border: 'none',
                            background: '#4f46e5',
                            color: '#ffffff',
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            cursor: 'pointer'
                          }}
                        >
                          Out for Delivery
                        </button>
                      )}

                      {badge.label === 'Out for Delivery' && (
                        <button
                          type="button"
                          onClick={() => onUpdateStatus(order, 'Delivered')}
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
                          Mark Delivered
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Assign Delivery Boy Modal */}
      {selectedOrderForBoy && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(2px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            padding: '20px',
            width: '360px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: '0 0 12px 0', color: '#0f172a' }}>
              Assign Delivery Partner
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 16px 0' }}>
              Select a delivery person for order <strong>{selectedOrderForBoy.billNo || selectedOrderForBoy.orderNo}</strong>:
            </p>
            <select
              value={assignBoyId}
              onChange={(e) => setAssignBoyId(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '0.85rem',
                marginBottom: '18px',
                outline: 'none'
              }}
            >
              <option value="">— Select Delivery Partner —</option>
              {deliveryBoys.map(b => (
                <option key={b.id} value={b.id}>
                  {b.name || b.delivery_boy_name || `Partner #${b.id}`} {b.phone ? `(${b.phone})` : ''}
                </option>
              ))}
            </select>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setSelectedOrderForBoy(null)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveDeliveryBoy}
                disabled={!assignBoyId}
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  border: 'none',
                  background: assignBoyId ? '#0d9488' : '#cbd5e1',
                  color: '#ffffff',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  cursor: assignBoyId ? 'pointer' : 'not-allowed'
                }}
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryOrdersTab;
