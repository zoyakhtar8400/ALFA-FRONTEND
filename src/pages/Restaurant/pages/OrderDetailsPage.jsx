import React, { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  FaPlus, 
  FaFileInvoiceDollar, 
  FaArrowRight 
} from 'react-icons/fa';
import PageHeader from '../../../components/common/PageHeader';

const INITIAL_TABLES = [
  { id: 1, number: 'Table 1', capacity: '4 Seater', status: 'Blank', price: 0 },
  { id: 2, number: 'Table 2', capacity: '2 Seater', status: 'Running', price: 1070 },
  { id: 3, number: 'Table 3', capacity: '6 Seater', status: 'Running', price: 2490 },
  { id: 4, number: 'Table 4', capacity: '4 Seater', status: 'Paid', price: 1460 },
  { id: 5, number: 'Table 5', capacity: '2 Seater', status: 'Blank', price: 0 },
  { id: 6, number: 'Table 6', capacity: '4 Seater', status: 'Running', price: 1700 },
  { id: 7, number: 'Table 7', capacity: '8 Seater', status: 'Paid', price: 3800 },
  { id: 8, number: 'Table 8', capacity: '4 Seater', status: 'Blank', price: 0 },
  { id: 9, number: 'Table 9', capacity: '2 Seater', status: 'Running', price: 740 }
];

const MOCK_ORDER_DETAILS = {
  1: [],
  2: [
    { name: 'Butter Chicken', qty: 1, rate: 450, total: 450 },
    { name: 'Garlic Naan', qty: 3, rate: 100, total: 300 },
    { name: 'Jeera Rice', qty: 1, rate: 200, total: 200 },
    { name: 'Soft Drink', qty: 2, rate: 60, total: 120 }
  ],
  3: [
    { name: 'Paneer Tikka', qty: 2, rate: 300, total: 600 },
    { name: 'Dal Makhani', qty: 1, rate: 350, total: 350 },
    { name: 'Tandoori Roti', qty: 6, rate: 30, total: 180 },
    { name: 'Mocktails', qty: 4, rate: 150, total: 600 },
    { name: 'Veg Biryani', qty: 2, rate: 380, total: 760 }
  ],
  4: [
    { name: 'Chicken Biryani', qty: 2, rate: 400, total: 800 },
    { name: 'Chicken Tikka Roll', qty: 2, rate: 250, total: 500 },
    { name: 'Masala Papad', qty: 4, rate: 40, total: 160 }
  ],
  5: [],
  6: [
    { name: 'Veg Noodles', qty: 2, rate: 240, total: 480 },
    { name: 'Chilli Paneer Dry', qty: 2, rate: 320, total: 640 },
    { name: 'Fried Rice', qty: 1, rate: 220, total: 220 },
    { name: 'Spring Rolls', qty: 2, rate: 180, total: 360 }
  ],
  7: [
    { name: 'Family Platter (Veg)', qty: 1, rate: 1800, total: 1800 },
    { name: 'Butter Naan', qty: 8, rate: 80, total: 640 },
    { name: 'Dal Tadka Large', qty: 2, rate: 300, total: 600 },
    { name: 'Paneer Butter Masala', qty: 2, rate: 380, total: 760 }
  ],
  8: [],
  9: [
    { name: 'Club Sandwich', qty: 2, rate: 180, total: 360 },
    { name: 'French Fries', qty: 1, rate: 140, total: 140 },
    { name: 'Cold Coffee', qty: 2, rate: 120, total: 240 }
  ]
};

const OrderDetailsPage = () => {
  const location = useLocation();
  const [tables, setTables] = useState(INITIAL_TABLES);
  const [selectedTableId, setSelectedTableId] = useState(2);

  // Form inputs
  const [newItemName, setNewItemName] = useState('');
  const [newItemQty, setNewItemQty] = useState(1);
  const [newItemRate, setNewItemRate] = useState(100);

  // Set selected table if navigated from seating cards
  useEffect(() => {
    if (location.state?.tableId) {
      setSelectedTableId(location.state.tableId);
    }
  }, [location.state]);

  const activeTable = useMemo(() => {
    return tables.find(t => t.id === selectedTableId) || tables[0];
  }, [tables, selectedTableId]);

  const activeOrderDetails = useMemo(() => {
    return MOCK_ORDER_DETAILS[selectedTableId] || [];
  }, [selectedTableId]);

  const orderCalculations = useMemo(() => {
    const subtotal = activeOrderDetails.reduce((sum, item) => sum + item.total, 0);
    const gst = Math.round(subtotal * 0.05);
    const serviceCharge = subtotal > 0 ? 50 : 0;
    const total = subtotal + gst + serviceCharge;
    return { subtotal, gst, serviceCharge, total };
  }, [activeOrderDetails]);

  const handleToggleState = (tableId, newStatus) => {
    setTables(prev => prev.map(t => {
      if (t.id === tableId) {
        let newPrice = t.price;
        if (newStatus === 'Blank') newPrice = 0;
        else if (newStatus === 'Running' && t.price === 0) newPrice = 850;
        else if (newStatus === 'Paid' && t.price === 0) newPrice = 1100;
        return { ...t, status: newStatus, price: newPrice };
      }
      return t;
    }));

    if (window.showToast) {
      window.showToast(`Table ${tableId} status updated to ${newStatus}.`, 'success');
    }
  };

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    if (!MOCK_ORDER_DETAILS[selectedTableId]) {
      MOCK_ORDER_DETAILS[selectedTableId] = [];
    }

    const newItem = {
      name: newItemName.trim(),
      qty: parseInt(newItemQty),
      rate: parseFloat(newItemRate),
      total: parseInt(newItemQty) * parseFloat(newItemRate)
    };

    MOCK_ORDER_DETAILS[selectedTableId].push(newItem);

    const orderSum = MOCK_ORDER_DETAILS[selectedTableId].reduce((sum, item) => sum + item.total, 0);
    setTables(prev => prev.map(t => {
      if (t.id === selectedTableId) {
        return { 
          ...t, 
          status: t.status === 'Blank' ? 'Running' : t.status, 
          price: orderSum 
        };
      }
      return t;
    }));

    setNewItemName('');
    setNewItemQty(1);
    setNewItemRate(100);

    if (window.showToast) {
      window.showToast(`Added ${newItem.name} to active order.`, 'success');
    }
  };

  return (
    <div style={{ padding: '24px', fontFamily: 'system-ui' }}>
      <PageHeader title="Order Details" description="Original table order items list view" />

      <div style={{ display: 'flex', gap: '24px', marginTop: '20px' }}>
        
        {/* Table Selector List */}
        <div style={{ width: '280px', border: '1px solid #cbd5e1', borderRadius: '8px', background: '#fff', padding: '12px' }}>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '0.9rem', color: '#475569' }}>Active Tables</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {tables.map(t => {
              const isSelected = selectedTableId === t.id;
              return (
                <div 
                  key={t.id}
                  onClick={() => setSelectedTableId(t.id)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    background: isSelected ? '#f1f5f9' : 'transparent',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{t.number}</div>
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{t.capacity}</span>
                  </div>
                  <span style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: t.status === 'Running' ? '#dcfce7' : t.status === 'Paid' ? '#cbd5e1' : '#f1f5f9',
                    color: t.status === 'Running' ? '#15803d' : '#475569'
                  }}>{t.status}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Table details */}
        <div style={{ flex: 1, border: '1px solid #cbd5e1', borderRadius: '8px', background: '#fff', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '16px' }}>
            <div>
              <h3 style={{ margin: 0 }}>{activeTable.number} Details</h3>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Status: {activeTable.status} · Capacity: {activeTable.capacity}</span>
            </div>
            
            <div style={{ display: 'flex', gap: '6px' }}>
              {['Blank', 'Running', 'Paid'].map(s => (
                <button
                  key={s}
                  onClick={() => handleToggleState(activeTable.id, s)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    background: activeTable.status === s ? '#0f172a' : '#fff',
                    color: activeTable.status === s ? '#fff' : '#475569',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Items listing */}
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '0.85rem', color: '#475569' }}>Ordered Items</h4>
            {activeOrderDetails.length > 0 ? (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #cbd5e1' }}>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Item Name</th>
                    <th style={{ padding: '8px', textAlign: 'center' }}>Qty</th>
                    <th style={{ padding: '8px', textAlign: 'right' }}>Price</th>
                    <th style={{ padding: '8px', textAlign: 'right' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {activeOrderDetails.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '8px' }}>{item.name}</td>
                      <td style={{ padding: '8px', textAlign: 'center' }}>{item.qty}</td>
                      <td style={{ padding: '8px', textAlign: 'right' }}>₹{item.rate}</td>
                      <td style={{ padding: '8px', textAlign: 'right', fontWeight: 700 }}>₹{item.total}</td>
                    </tr>
                  ))}
                  <tr style={{ borderTop: '1px dashed #cbd5e1', fontWeight: 700 }}>
                    <td colSpan={3} style={{ padding: '8px', textAlign: 'right' }}>Subtotal:</td>
                    <td style={{ padding: '8px', textAlign: 'right' }}>₹{orderCalculations.subtotal}</td>
                  </tr>
                  <tr style={{ fontWeight: 700 }}>
                    <td colSpan={3} style={{ padding: '8px', textAlign: 'right' }}>GST (5%):</td>
                    <td style={{ padding: '8px', textAlign: 'right' }}>₹{orderCalculations.gst}</td>
                  </tr>
                  <tr style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>
                    <td colSpan={3} style={{ padding: '8px', textAlign: 'right' }}>Grand Total:</td>
                    <td style={{ padding: '8px', textAlign: 'right' }}>₹{orderCalculations.total}</td>
                  </tr>
                </tbody>
              </table>
            ) : (
              <div style={{ padding: '20px', textAlign: 'center', border: '1px dashed #e2e8f0', borderRadius: '6px', fontSize: '0.8rem', color: '#64748b' }}>
                No active items on this table.
              </div>
            )}
          </div>

          {/* Form to add item */}
          <form onSubmit={handleAddItem} style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '0.85rem', color: '#475569' }}>Add Mock KOT Item</h4>
            <div style={{ display: 'flex', gap: '12px' }}>
              <input
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="Item Name"
                style={{ flex: 1, padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.8rem' }}
              />
              <input
                type="number"
                min="1"
                value={newItemQty}
                onChange={(e) => setNewItemQty(parseInt(e.target.value) || 1)}
                placeholder="Qty"
                style={{ width: '60px', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.8rem', textAlign: 'center' }}
              />
              <input
                type="number"
                min="0"
                value={newItemRate}
                onChange={(e) => setNewItemRate(parseFloat(e.target.value) || 0)}
                placeholder="Price"
                style={{ width: '80px', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.8rem', textAlign: 'center' }}
              />
              <button 
                type="submit"
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  background: '#0f172a',
                  color: '#fff',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <FaPlus size={10} /> Add Item
              </button>
            </div>
          </form>

        </div>

      </div>
    </div>
  );
};

export default OrderDetailsPage;
