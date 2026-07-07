import React, { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  FaSearch, FaTimes, FaPlus, FaCheck,
  FaUser, FaTag, FaCommentAlt, FaPrint, FaWindowClose, FaUtensils,
  FaMotorcycle, FaShoppingBag
} from 'react-icons/fa';

const ALL_FOOD_ITEMS = [
  { name: 'ALOO GOBHI(DRY)', price: 180, category: 'FOOD' },
  { name: 'BANANA SHAKE', price: 120, category: 'FOOD' },
  { name: 'BLUE LAGOON', price: 150, category: 'FOOD' },
  { name: 'BREAKFAST(BUFFET)', price: 350, category: 'FOOD' },
  { name: 'BUTTER SCOTCH SHAKE', price: 140, category: 'FOOD' },
  { name: 'CHICKEN FRY FULL', price: 380, category: 'FOOD' },
  { name: 'CHICKEN FRY HALF', price: 200, category: 'FOOD' },
  { name: 'CHICKEN SOTE(FULL)', price: 420, category: 'FOOD' },
  { name: 'CHICKEN TIKKA CHEESE SANDWICH', price: 160, category: 'FOOD' },
  { name: 'COLD COFFEE', price: 110, category: 'FOOD' },
  { name: 'CORN CHAT', price: 90, category: 'FOOD' },
  { name: 'DOHRA SEEK KABAB', price: 280, category: 'FOOD' },
  { name: 'EGG BIRYANI', price: 220, category: 'FOOD' },
  { name: 'FRESH LIME WATER', price: 60, category: 'FOOD' },
  { name: 'FRESH PANEER', price: 250, category: 'FOOD' },
  { name: 'KIT KAT SHAKE', price: 150, category: 'FOOD' },
  { name: 'MACARONI', price: 130, category: 'FOOD' },
  { name: 'MASALA COKE', price: 70, category: 'FOOD' },
  { name: 'MILK (1 PKD.)', price: 30, category: 'FOOD' },
  { name: 'MILK SHAKE', price: 100, category: 'FOOD' },
  { name: 'MIX PAKORA', price: 120, category: 'FOOD' },

  // BANQUET items
  { name: 'BANQUET BUFFET STANDARD', price: 600, category: 'BANQUET' },
  { name: 'BANQUET BUFFET PREMIUM', price: 950, category: 'BANQUET' },
  { name: 'BANQUET HALL CHARGE', price: 15000, category: 'BANQUET' },
  { name: 'DECORATION STANDARD', price: 4500, category: 'BANQUET' },
];

const INITIAL_ROWS = [
  { name: '', remark: '', qty: 1, price: 0 }
];

const POSBillingPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Retrieve routed parameters
  const routedTable = location.state?.table || { id: 1, no: '01', status: 'Blank', waiter: null, customer: 'Walk-in' };

  // Component states
  const [category, setCategory] = useState('FOOD');
  const [searchItem, setSearchItem] = useState('');
  const [shortCode, setShortCode] = useState('');
  const [serviceType, setServiceType] = useState(() => {
    const orderType = location.state?.orderType;
    if (orderType === 'Takeaway') return 'Pickup';
    if (orderType === 'Delivery') return 'Delivery';
    return 'Dine in';
  });
  
  // Table rows for right-side billing
  const [rows, setRows] = useState(INITIAL_ROWS);
  const [isSettling, setIsSettling] = useState(false);

  // Load existing items if any
  useEffect(() => {
    if (location.state?.order) {
      const order = location.state.order;
      if (order.items) {
        const parsedItems = order.items.split(',').map(itemStr => {
          const trimStr = itemStr.trim();
          const match = trimStr.match(/^(\d+)x\s+(.+)$/);
          if (match) {
            const qty = parseInt(match[1]) || 1;
            const name = match[2].toUpperCase();
            const foodMatch = ALL_FOOD_ITEMS.find(f => f.name.includes(name));
            return {
              name: foodMatch ? foodMatch.name : name,
              remark: '',
              qty,
              price: foodMatch ? foodMatch.price : 150
            };
          }
          return { name: trimStr.toUpperCase(), remark: '', qty: 1, price: 150 };
        });
        setRows(parsedItems);
      }
    } else if (routedTable.id === 2) {
      setRows([
        { name: 'ALOO GOBHI(DRY)', remark: 'Medium Spicy', qty: 1, price: 180 },
        { name: 'BANANA SHAKE', remark: 'With Ice Cream', qty: 2, price: 120 },
        { name: 'CORN CHAT', remark: '', qty: 1, price: 90 }
      ]);
    } else if (routedTable.id === 3) {
      setRows([
        { name: 'BLUE LAGOON', remark: '', qty: 3, price: 150 },
        { name: 'MIX PAKORA', remark: 'Crispy', qty: 2, price: 120 }
      ]);
    }
  }, [location.state, routedTable]);

  // Toast notifier
  const toast = (msg) => {
    if (window.showToast) {
      window.showToast(msg);
    } else {
      const alertBox = document.createElement('div');
      alertBox.innerText = msg;
      alertBox.style.position = 'fixed';
      alertBox.style.bottom = '20px';
      alertBox.style.right = '20px';
      alertBox.style.backgroundColor = '#dc2626';
      alertBox.style.color = '#fff';
      alertBox.style.padding = '12px 24px';
      alertBox.style.borderRadius = '8px';
      alertBox.style.zIndex = '9999';
      alertBox.style.fontSize = '0.85rem';
      alertBox.style.fontWeight = '700';
      document.body.appendChild(alertBox);
      setTimeout(() => alertBox.remove(), 2500);
    }
  };

  // Filter items based on category search
  const filteredGridItems = useMemo(() => {
    return ALL_FOOD_ITEMS.filter(item => {
      const matchesCategory = item.category === category;
      const matchesSearch = item.name.toLowerCase().includes(searchItem.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [category, searchItem]);

  // Click handler to select an item from food grid
  const handleGridItemClick = (foodItem) => {
    // Check if an empty item row already exists
    const emptyIndex = rows.findIndex(r => r.name === '');
    if (emptyIndex !== -1) {
      setRows(prev => prev.map((r, i) => {
        if (i === emptyIndex) {
          return { ...r, name: foodItem.name, price: foodItem.price, qty: 1 };
        }
        return r;
      }));
    } else {
      // Check if it already exists in the rows, then increment qty
      const existingIndex = rows.findIndex(r => r.name === foodItem.name);
      if (existingIndex !== -1) {
        setRows(prev => prev.map((r, i) => {
          if (i === existingIndex) {
            return { ...r, qty: r.qty + 1 };
          }
          return r;
        }));
      } else {
        // Append a new item row
        setRows(prev => [...prev, { name: foodItem.name, remark: '', qty: 1, price: foodItem.price }]);
      }
    }
  };

  // Handler for row parameters updates
  const updateRowField = (index, field, value) => {
    setRows(prev => prev.map((row, i) => {
      if (i === index) {
        const updated = { ...row, [field]: value };
        // Auto-update pricing if name changed
        if (field === 'name') {
          const match = ALL_FOOD_ITEMS.find(f => f.name === value);
          updated.price = match ? match.price : 0;
        }
        return updated;
      }
      return row;
    }));
  };

  const handleAddEmptyRow = () => {
    setRows(prev => [...prev, { name: '', remark: '', qty: 1, price: 0 }]);
  };

  const handleRemoveRow = (index) => {
    if (rows.length === 1) {
      setRows(INITIAL_ROWS);
    } else {
      setRows(prev => prev.filter((_, i) => i !== index));
    }
  };

  const totalBill = useMemo(() => {
    return rows.reduce((sum, row) => sum + (row.qty * row.price), 0);
  }, [rows]);

  const handleSaveAndPrint = () => {
    const activeRows = rows.filter(r => r.name !== '');
    const finalAmt = activeRows.reduce((sum, r) => sum + (r.qty * r.price), 0);
    
    const updatedTable = {
      ...routedTable,
      amount: finalAmt,
      status: finalAmt > 0 ? 'Running' : 'Blank'
    };

    toast(`Saved and printed KOT for Table ${routedTable.no}.`);
    navigate('/restaurant/display-table', {
      state: {
        updatedTable,
        updatedRows: activeRows
      }
    });
  };

  const handleCheckoutSettle = () => {
    if (totalBill === 0) {
      toast("Cannot settle an empty bill.");
      return;
    }
    setIsSettling(true);
    setTimeout(() => {
      setIsSettling(false);
      navigate('/restaurant/display-table', {
        state: {
          settledTableId: routedTable.id
        }
      });
    }, 2500);
  };

  const handleCancel = () => {
    const confirmCancel = window.confirm("Are you sure you want to cancel this table? This action cannot be undone.");
    if (confirmCancel) {
      navigate('/restaurant/display-table', {
        state: {
          settledTableId: routedTable.id
        }
      });
    }
  };

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: 'flex',
      background: '#f8fafc',
      fontFamily: 'var(--font-family, system-ui)',
      overflow: 'hidden'
    }}>
      
      {/* LEFT SECTION (Categories, Grid & Searches) */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: '#fff',
        borderRight: '1px solid #cbd5e1'
      }}>
        {/* Top Header bar with title and search fields */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 24px',
          borderBottom: '1px solid #cbd5e1',
          background: '#fff'
        }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0e7490', margin: 0, letterSpacing: '0.5px' }}>
            RESTAURANT
          </h2>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            {/* Search items bar */}
            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '8px', overflow: 'hidden' }}>
              <input
                type="text"
                placeholder="SEARCH ITEM"
                value={searchItem}
                onChange={(e) => setSearchItem(e.target.value)}
                style={{ border: 'none', padding: '8px 12px', fontSize: '0.8rem', outline: 'none', width: '160px' }}
              />
              <button style={{ border: 'none', background: '#0e7490', color: '#fff', padding: '8px 12px', cursor: 'pointer' }}>
                <FaSearch size={12} />
              </button>
            </div>

            {/* Short code search bar */}
            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '8px', overflow: 'hidden' }}>
              <input
                type="text"
                placeholder="SHORT CODE"
                value={shortCode}
                onChange={(e) => setShortCode(e.target.value)}
                style={{ border: 'none', padding: '8px 12px', fontSize: '0.8rem', outline: 'none', width: '120px' }}
              />
              <button style={{ border: 'none', background: '#0e7490', color: '#fff', padding: '8px 12px', cursor: 'pointer' }}>
                <FaSearch size={12} />
              </button>
            </div>
          </div>
        </div>

        {/* Content area: Categories Sidebar + Card Grid */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          
          {/* Left Categories Sidebar */}
          <div style={{
            width: '180px',
            background: '#fff',
            borderRight: '1px solid #cbd5e1',
            display: 'flex',
            flexDirection: 'column',
            paddingTop: '20px'
          }}>
            {['BANQUET', 'FOOD'].map(cat => {
              const isSelected = category === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  style={{
                    width: '100%',
                    padding: '16px 20px',
                    textAlign: 'left',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    border: 'none',
                    background: isSelected ? '#f1f5f9' : 'transparent',
                    color: isSelected ? '#0e7490' : '#475569',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderLeft: isSelected ? '4px solid #0e7490' : '4px solid transparent'
                  }}
                >
                  <span>{cat}</span>
                  <span>&gt;</span>
                </button>
              );
            })}
          </div>

          {/* Items grid */}
          <div style={{
            flex: 1,
            padding: '24px',
            overflowY: 'auto',
            background: '#fff'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
              gap: '12px'
            }}>
              {filteredGridItems.map(item => (
                <button
                  key={item.name}
                  onClick={() => handleGridItemClick(item)}
                  style={{
                    padding: '20px 12px',
                    borderRadius: '8px',
                    border: '1.5px solid #0e7490',
                    background: '#fff',
                    color: '#0e7490',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    textAlign: 'center',
                    cursor: 'pointer',
                    minHeight: '80px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                    transition: 'all 120ms ease-in-out',
                    textTransform: 'uppercase'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = '#0e7490';
                    e.currentTarget.style.color = '#fff';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = '#fff';
                    e.currentTarget.style.color = '#0e7490';
                  }}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SECTION (Billing ledger details panel) */}
      <div style={{
        width: '540px',
        height: '100%',
        background: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
        borderLeft: '1px solid #cbd5e1'
      }}>
        {/* Service switcher tabs bar */}
        <div style={{ display: 'flex', background: '#e2e8f0', padding: '4px', borderBottom: '1px solid #cbd5e1' }}>
          {['Dine in', 'Delivery', 'Pickup'].map(type => {
            const isSelected = serviceType === type;
            return (
              <button
                key={type}
                onClick={() => setServiceType(type)}
                style={{
                  flex: 1,
                  padding: '12px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  borderRadius: '6px',
                  background: isSelected ? '#0e7490' : 'transparent',
                  color: isSelected ? '#fff' : '#64748b',
                  transition: 'all 150ms ease-in-out'
                }}
              >
                {type}
              </button>
            );
          })}
        </div>

        {/* Active Seating Details icons bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '12px 16px',
          background: '#fff',
          borderBottom: '1px solid #cbd5e1',
          gap: '8px'
        }}>
          {serviceType === 'Delivery' ? (
            <>
              {/* Customer indicator */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, border: '1px solid #f1f5f9', borderRadius: '6px', padding: '6px' }}>
                <FaUser size={14} color="#0e7490" />
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#334155', marginTop: '4px' }}>
                  {location.state?.order?.customer || routedTable.customer || 'Walk-in'}
                </span>
              </div>

              {/* Remarks indicator */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, border: '1px solid #f1f5f9', borderRadius: '6px', padding: '6px' }}>
                <FaCommentAlt size={14} color="#64748b" />
                <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#475569', marginTop: '4px' }}>Remark</span>
              </div>

              {/* Delivery indicator */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, border: '1px solid #f1f5f9', borderRadius: '6px', padding: '6px' }}>
                <FaMotorcycle size={14} color="#64748b" />
                <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#475569', marginTop: '4px' }}>
                  {location.state?.order?.driver || 'Rahul S.'}
                </span>
              </div>
            </>
          ) : serviceType === 'Pickup' || serviceType === 'Takeaway' ? (
            <>
              {/* Customer indicator */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, border: '1px solid #f1f5f9', borderRadius: '6px', padding: '6px' }}>
                <FaUser size={14} color="#0e7490" />
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#334155', marginTop: '4px' }}>
                  {location.state?.order?.customer || routedTable.customer || 'Walk-in'}
                </span>
              </div>

              {/* Remarks indicator */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, border: '1px solid #f1f5f9', borderRadius: '6px', padding: '6px' }}>
                <FaCommentAlt size={14} color="#64748b" />
                <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#475569', marginTop: '4px' }}>Remark</span>
              </div>

              {/* Takeaway indicator */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, border: '1px solid #f1f5f9', borderRadius: '6px', padding: '6px' }}>
                <FaShoppingBag size={14} color="#64748b" />
                <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#475569', marginTop: '4px' }}>Takeaway</span>
              </div>
            </>
          ) : (
            <>
              {/* Table indicator */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, border: '1px solid #f1f5f9', borderRadius: '6px', padding: '6px' }}>
                <FaUtensils size={14} color="#0e7490" />
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#334155', marginTop: '4px' }}>T{routedTable.no}</span>
              </div>

              {/* Customer indicator */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, border: '1px solid #f1f5f9', borderRadius: '6px', padding: '6px' }}>
                <FaUser size={14} color="#64748b" />
                <span style={{ fontSize: '0.68rem', fontWeight: 600, color: '#475569', marginTop: '4px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '70px' }}>
                  {routedTable.customer || 'Walk-in'}
                </span>
              </div>

              {/* Remarks indicator */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, border: '1px solid #f1f5f9', borderRadius: '6px', padding: '6px' }}>
                <FaCommentAlt size={14} color="#64748b" />
                <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#475569', marginTop: '4px' }}>Remark</span>
              </div>

              {/* Waiter indicator */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, border: '1px solid #f1f5f9', borderRadius: '6px', padding: '6px' }}>
                <FaUser size={14} color="#64748b" />
                <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#475569', marginTop: '4px' }}>{routedTable.waiter || 'DEMO'}</span>
              </div>

              {/* Guest count */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, border: '1px solid #f1f5f9', borderRadius: '6px', padding: '6px' }}>
                <FaUser size={14} color="#64748b" />
                <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#475569', marginTop: '4px' }}>{routedTable.seats || 1}</span>
              </div>

              {/* NC indicator */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, border: '1px solid #f1f5f9', borderRadius: '6px', padding: '6px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#cbd5e1' }}>NC</span>
                <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#475569', marginTop: '4px' }}>NC</span>
              </div>
            </>
          )}
        </div>

        {/* Interactive billing item rows ledger */}
        <div style={{ padding: '8px', flex: 1, overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#0e7490', color: '#fff', fontSize: '0.74rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '8px 4px', textAlign: 'center', width: '30px' }}></th>
                <th style={{ padding: '8px 6px', textAlign: 'left' }}>Items</th>
                <th style={{ padding: '8px 6px', textAlign: 'left', width: '110px' }}>Remark</th>
                <th style={{ padding: '8px 4px', textAlign: 'center', width: '50px' }}>Qty</th>
                <th style={{ padding: '8px 4px', textAlign: 'center', width: '60px' }}>Price</th>
                <th style={{ padding: '8px 6px', textAlign: 'right', width: '70px' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #e2e8f0', background: '#fff' }}>
                  
                  {/* Delete action button */}
                  <td style={{ padding: '6px 4px', textAlign: 'center' }}>
                    <button
                      onClick={() => handleRemoveRow(index)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#ef4444',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 0
                      }}
                    >
                      <FaTimes size={13} />
                    </button>
                  </td>

                  {/* Food select dropdown picker */}
                  <td style={{ padding: '6px' }}>
                    <select
                      value={row.name}
                      onChange={(e) => updateRowField(index, 'name', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '6px 4px',
                        borderRadius: '4px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: '#1e293b',
                        background: '#fff',
                        outline: 'none'
                      }}
                    >
                      <option value="">SELECT ITEMS...</option>
                      {ALL_FOOD_ITEMS.map(item => (
                        <option key={item.name} value={item.name}>{item.name}</option>
                      ))}
                    </select>
                  </td>

                  {/* Remark text input */}
                  <td style={{ padding: '6px' }}>
                    <input
                      type="text"
                      value={row.remark}
                      onChange={(e) => updateRowField(index, 'remark', e.target.value)}
                      placeholder="REMARKS"
                      style={{
                        width: '100%',
                        padding: '6px 8px',
                        borderRadius: '4px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.74rem',
                        outline: 'none',
                        color: '#334155'
                      }}
                    />
                  </td>

                  {/* Quantity input */}
                  <td style={{ padding: '6px', textAlign: 'center' }}>
                    <input
                      type="number"
                      min="1"
                      value={row.qty}
                      onChange={(e) => updateRowField(index, 'qty', parseInt(e.target.value) || 1)}
                      style={{
                        width: '42px',
                        padding: '6px 2px',
                        borderRadius: '4px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.74rem',
                        textAlign: 'center',
                        outline: 'none'
                      }}
                    />
                  </td>

                  {/* Price input */}
                  <td style={{ padding: '6px', textAlign: 'center' }}>
                    <input
                      type="number"
                      min="0"
                      value={row.price}
                      onChange={(e) => updateRowField(index, 'price', parseFloat(e.target.value) || 0)}
                      style={{
                        width: '52px',
                        padding: '6px 2px',
                        borderRadius: '4px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.74rem',
                        textAlign: 'center',
                        outline: 'none'
                      }}
                    />
                  </td>

                  {/* Calculated Amount */}
                  <td style={{ padding: '6px 8px', textAlign: 'right', fontSize: '0.78rem', fontWeight: 700, color: '#1e293b' }}>
                    {(row.qty * row.price).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Plus add empty item row button */}
          <button
            onClick={handleAddEmptyRow}
            style={{
              marginTop: '10px',
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px dashed #0e7490',
              background: 'transparent',
              color: '#0e7490',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <FaPlus size={10} /> Add Item Row
          </button>
        </div>

        {/* Footer Billing Total & Action CTAs */}
        <div>
          {/* Subtotal Total bar */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 24px',
            background: '#0e7490',
            color: '#fff',
            fontSize: '1rem',
            fontWeight: 800
          }}>
            <span>Total</span>
            <span>{totalBill.toFixed(2)}</span>
          </div>

          {/* Action triggers */}
          <div style={{
            display: 'flex',
            padding: '16px 24px',
            gap: '10px',
            background: '#e2e8f0',
            borderTop: '1px solid #cbd5e1'
          }}>
            <button
              onClick={handleSaveAndPrint}
              style={{
                flex: 1.2,
                padding: '12px',
                borderRadius: '8px',
                border: 'none',
                background: '#0e7490', // Teal Blue
                color: '#fff',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 120ms ease-in-out'
              }}
            >
              Save & KOT Print
            </button>

            <button
              onClick={handleCheckoutSettle}
              style={{
                flex: 1.2,
                padding: '12px',
                borderRadius: '8px',
                border: 'none',
                background: '#16a34a', // Green
                color: '#fff',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 120ms ease-in-out'
              }}
            >
              Settle & Checkout
            </button>

            <button
              onClick={handleCancel}
              style={{
                flex: 0.8,
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: '#fff',
                color: '#dc2626', // Red
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 120ms ease-in-out'
              }}
            >
              Cancel Table
            </button>
          </div>
        </div>
      </div>

      {/* Checkout Success Overlay */}
      {isSettling && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(4px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '16px',
            padding: '40px',
            textAlign: 'center',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            width: '360px',
            animation: 'fadeIn 200ms ease-out'
          }}>
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: '#dcfce7',
              color: '#16a34a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px auto',
              fontSize: '2rem'
            }}>
              <FaCheck />
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#111827', margin: '0 0 8px 0' }}>
              Payment Completed
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: 0, fontWeight: 500 }}>
              Payment Completed Successfully
            </p>
            <span style={{ fontSize: '0.72rem', color: '#9ca3af', display: 'block', marginTop: '16px' }}>
              Table resetting to Available...
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default POSBillingPage;
