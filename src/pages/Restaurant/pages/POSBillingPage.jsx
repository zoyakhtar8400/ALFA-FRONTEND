import React, { useState, useMemo, useEffect, memo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  FaSearch, FaTimes, FaPlus, FaCheck,
  FaUser, FaTag, FaCommentAlt, FaPrint, FaWindowClose, FaUtensils,
  FaMotorcycle, FaShoppingBag, FaChevronDown, FaChevronUp
} from 'react-icons/fa';
import { useRestaurant } from '../../../context/RestaurantContext';
import { INITIAL_TABLES } from '../constants/mockData';

const ALL_FOOD_ITEMS = [
  { name: 'CHICKEN TANDOORI', price: 520, category: 'FOOD', hasVariants: true, variants: { Half: 280, Full: 520 } },
  { name: 'PANEER TIKKA', price: 320, category: 'FOOD', hasVariants: true, variants: { Half: 180, Full: 320 } },
  { name: 'DAL MAKHANI', price: 280, category: 'FOOD', hasVariants: true, variants: { Half: 160, Full: 280 } },
  { name: 'BUTTER NAAN', price: 40, category: 'FOOD' },
  { name: 'COLD DRINK', price: 40, category: 'FOOD' },
  { name: 'ALOO GOBHI(DRY)', price: 180, category: 'FOOD' },
  { name: 'BANANA SHAKE', price: 120, category: 'FOOD' },
  { name: 'BLUE LAGOON', price: 150, category: 'FOOD' },
  { name: 'BREAKFAST(BUFFET)', price: 350, category: 'FOOD' },
  { name: 'BUTTER SCOTCH SHAKE', price: 140, category: 'FOOD' },
  { name: 'COLD COFFEE', price: 110, category: 'FOOD' },
  { name: 'CORN CHAT', price: 90, category: 'FOOD' },
  { name: 'DOHRA SEEK KABAB', price: 280, category: 'FOOD' },
  { name: 'EGG BIRYANI', price: 220, category: 'FOOD' },
  { name: 'FRESH LIME WATER', price: 60, category: 'FOOD' },
  { name: 'FRESH PANEER', price: 250, category: 'FOOD' },
  { name: 'KIT KAT SHAKE', price: 150, category: 'FOOD' },
  { name: 'MACARONI', price: 130, category: 'FOOD' },
  { name: 'MASALA COKE', price: 70, category: 'FOOD' },
  { name: 'MIX PAKORA', price: 120, category: 'FOOD' },

  // BANQUET items
  { name: 'BANQUET BUFFET STANDARD', price: 600, category: 'BANQUET' },
  { name: 'BANQUET BUFFET PREMIUM', price: 950, category: 'BANQUET' },
  { name: 'BANQUET HALL CHARGE', price: 15000, category: 'BANQUET' },
  { name: 'DECORATION STANDARD', price: 4500, category: 'BANQUET' },
];

const INITIAL_ROWS = [
  { name: '', variant: '', remark: '', qty: 1, price: 0 }
];

const POSBillingPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Check if opened from "Book Table" button in new booking flow
  const isNewBooking = location.state?.newBooking || false;

  // Retrieve routed parameters
  const routedTable = location.state?.table || { id: 1, no: '01', status: 'Blank', waiter: null, customer: 'Walk-in' };

  // Tables List for Assignment
  const { tables: tablesList, setTables: setTablesList } = useRestaurant();

  // Component states
  const [category, setCategory] = useState('FOOD');
  const [searchItem, setSearchItem] = useState('');
  const [shortCode, setShortCode] = useState('');
  const [serviceType, setServiceType] = useState('Dine in');

  // Customer Information inputs
  const [customerName, setCustomerName] = useState(isNewBooking ? 'Rahul Sharma' : (routedTable.customer || ''));
  const [mobileNumber, setMobileNumber] = useState(isNewBooking ? '9876543210' : (routedTable.mobile || ''));
  const [paxCount, setPaxCount] = useState(isNewBooking ? 4 : (routedTable.seats || 1));
  const [waiter, setWaiter] = useState(isNewBooking ? 'Rakesh' : (routedTable.waiter || ''));
  const [captain, setCaptain] = useState(isNewBooking ? 'Amit' : (routedTable.captain || ''));
  const [remarks, setRemarks] = useState('');
  const [showCustomerDetails, setShowCustomerDetails] = useState(true);

  // KOT states
  const [kotCreated, setKotCreated] = useState(false);
  const [generatedKotNo, setGeneratedKotNo] = useState('');
  const [showKotAlert, setShowKotAlert] = useState(false);
  const [assignedTableId, setAssignedTableId] = useState('');

  // Table rows for right-side billing
  const [rows, setRows] = useState(INITIAL_ROWS);
  const [isSettling, setIsSettling] = useState(false);

  // Load existing items if editing
  useEffect(() => {
    if (!isNewBooking) {
      if (location.state?.orderRows) {
        setRows(location.state.orderRows);
      } else if (routedTable.id === 2) {
        setRows([
          { name: 'ALOO GOBHI(DRY)', variant: '', remark: 'Medium Spicy', qty: 1, price: 180 },
          { name: 'BANANA SHAKE', variant: '', remark: 'With Ice Cream', qty: 2, price: 120 },
          { name: 'CORN CHAT', variant: '', remark: '', qty: 1, price: 90 }
        ]);
      } else if (routedTable.id === 3) {
        setRows([
          { name: 'BLUE LAGOON', variant: '', remark: '', qty: 3, price: 150 },
          { name: 'MIX PAKORA', variant: '', remark: 'Crispy', qty: 2, price: 120 }
        ]);
      }
    }
  }, [location.state, routedTable, isNewBooking]);

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
      alertBox.style.backgroundColor = '#0e7490';
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

  // Filter items
  const filteredGridItems = useMemo(() => {
    return ALL_FOOD_ITEMS.filter(item => {
      const matchesCategory = item.category === category;
      const matchesSearch = item.name.toLowerCase().includes(searchItem.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [category, searchItem]);

  // Click handler to select an item from food grid
  const handleGridItemClick = (foodItem) => {
    const emptyIndex = rows.findIndex(r => r.name === '');
    const defaultVariant = foodItem.hasVariants ? 'Full' : '';
    const defaultPrice = foodItem.hasVariants ? foodItem.variants.Full : foodItem.price;

    if (emptyIndex !== -1) {
      setRows(prev => prev.map((r, i) => {
        if (i === emptyIndex) {
          return { ...r, name: foodItem.name, variant: defaultVariant, price: defaultPrice, qty: 1 };
        }
        return r;
      }));
    } else {
      const existingIndex = rows.findIndex(r => r.name === foodItem.name && r.variant === defaultVariant);
      if (existingIndex !== -1) {
        setRows(prev => prev.map((r, i) => {
          if (i === existingIndex) {
            return { ...r, qty: r.qty + 1 };
          }
          return r;
        }));
      } else {
        setRows(prev => [...prev, { name: foodItem.name, variant: defaultVariant, remark: '', qty: 1, price: defaultPrice }]);
      }
    }
  };

  const updateRowField = (index, field, value) => {
    setRows(prev => prev.map((row, i) => {
      if (i === index) {
        const updated = { ...row, [field]: value };
        if (field === 'name') {
          const match = ALL_FOOD_ITEMS.find(f => f.name === value);
          if (match) {
            updated.variant = match.hasVariants ? 'Full' : '';
            updated.price = match.hasVariants ? match.variants.Full : match.price;
          } else {
            updated.price = 0;
            updated.variant = '';
          }
        }
        return updated;
      }
      return row;
    }));
  };

  const handleVariantChange = (index, variant) => {
    setRows(prev => prev.map((row, i) => {
      if (i === index) {
        const item = ALL_FOOD_ITEMS.find(f => f.name === row.name);
        const newPrice = item?.variants?.[variant] || row.price;
        return { ...row, variant, price: newPrice };
      }
      return row;
    }));
  };

  const handleAddEmptyRow = () => {
    setRows(prev => [...prev, { name: '', variant: '', remark: '', qty: 1, price: 0 }]);
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

  const handleAddKOT = () => {
    const activeRows = rows.filter(r => r.name !== '');
    if (activeRows.length === 0) {
      toast("Please add at least one item before generating KOT.");
      return;
    }
    const newKot = 'KOT-1001';
    setGeneratedKotNo(newKot);
    setKotCreated(true);
    setShowKotAlert(true);
    toast(`Generated KOT: ${newKot}`);
  };

  const handleConfirmBooking = () => {
    if (!assignedTableId) {
      alert("Please select a table to assign!");
      return;
    }
    const targetTable = tablesList.find(t => t.id === assignedTableId);
    const activeRows = rows.filter(r => r.name !== '');
    const finalAmt = activeRows.reduce((sum, r) => sum + (r.qty * r.price), 0);

    const updatedTable = {
      ...targetTable,
      status: 'Running',
      customer: customerName || 'Rahul Sharma',
      mobile: mobileNumber || '9876543210',
      waiter: waiter || 'Rakesh',
      captain: captain || 'Amit',
      remarks: remarks || '',
      amount: finalAmt,
      openedAt: Date.now() - 5 * 60 * 1000, // 5 minutes ago to match duration
      kots: [{ id: generatedKotNo, amount: finalAmt, items: activeRows }],
      kotCount: 1
    };

    toast(`Table T${targetTable.no} assigned successfully!`);
    navigate('/restaurant/display-table', {
      state: {
        updatedTable,
        updatedRows: activeRows
      }
    });
  };

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

  const handleDirectComplete = () => {
    setIsSettling(true);
    setTimeout(() => {
      setIsSettling(false);
      toast(`${serviceType} order settled successfully!`);
      navigate('/restaurant/display-table');
    }, 2000);
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

  const availableTables = useMemo(() => {
    return tablesList.filter(t => t.status === 'Blank' || t.status === 'Cleaning');
  }, [tablesList]);

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
      display: 'flex', background: '#f8fafc', overflow: 'hidden'
    }}>
      
      {/* LEFT SECTION (Categories, Grid & Searches) */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', background: '#fff', borderRight: '1px solid #cbd5e1' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid #cbd5e1', background: '#fff' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0e7490', margin: 0, letterSpacing: '0.5px' }}>
            RESTAURANT POS
          </h2>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '8px', overflow: 'hidden' }}>
              <input type="text" placeholder="SEARCH ITEM" value={searchItem} onChange={e => setSearchItem(e.target.value)}
                style={{ border: 'none', padding: '8px 12px', fontSize: '0.8rem', outline: 'none', width: '160px' }} />
              <button style={{ border: 'none', background: '#0e7490', color: '#fff', padding: '8px 12px', cursor: 'pointer' }}><FaSearch size={12} /></button>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          <div style={{ width: '180px', background: '#fff', borderRight: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', paddingTop: '20px' }}>
            {['FOOD', 'BANQUET'].map(cat => {
              const isSelected = category === cat;
              return (
                <button key={cat} onClick={() => setCategory(cat)}
                  style={{
                    width: '100%', padding: '16px 20px', textAlign: 'left', fontSize: '0.85rem', fontWeight: 700, border: 'none',
                    background: isSelected ? '#f1f5f9' : 'transparent', color: isSelected ? '#0e7490' : '#475569', cursor: 'pointer',
                    borderLeft: isSelected ? '4px solid #0e7490' : '4px solid transparent'
                  }}
                >{cat}</button>
              );
            })}
          </div>

          <div style={{ flex: 1, padding: '24px', overflowY: 'auto', background: '#fff' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
              {filteredGridItems.map(item => (
                <button key={item.name} onClick={() => handleGridItemClick(item)}
                  style={{
                    padding: '20px 12px', borderRadius: '8px', border: '1.5px solid #0e7490', background: '#fff', color: '#0e7490',
                    fontSize: '0.78rem', fontWeight: 700, textAlign: 'center', cursor: 'pointer', minHeight: '80px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 120ms ease-in-out', textTransform: 'uppercase'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#0e7490'; e.currentTarget.style.color = '#fff'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#0e7490'; }}
                >{item.name}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SECTION (Billing ledger details panel) */}
      <div style={{ width: '540px', height: '100%', background: '#f8fafc', display: 'flex', flexDirection: 'column', borderLeft: '1px solid #cbd5e1' }}>
        
        {/* Service switcher tabs bar */}
        <div style={{ display: 'flex', background: '#e2e8f0', padding: '4px', borderBottom: '1px solid #cbd5e1' }}>
          {['Dine in', 'Delivery', 'Pickup'].map(type => {
            const isSelected = serviceType === type;
            return (
              <button key={type} onClick={() => setServiceType(type)}
                style={{
                  flex: 1, padding: '12px', fontSize: '0.8rem', fontWeight: 700, border: 'none', cursor: 'pointer', borderRadius: '6px',
                  background: isSelected ? '#0e7490' : 'transparent', color: isSelected ? '#fff' : '#64748b'
                }}
              >{type}</button>
            );
          })}
        </div>

        {/* Table / Order Info Banner */}
        {!isNewBooking && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 16px', background: '#fff', borderBottom: '1px solid #cbd5e1' }}>
            <span style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <FaUtensils size={12} color="#0e7490" /> Table {routedTable.no}
            </span>
            <span style={{ fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '4px', background: '#e0f2fe', color: '#0369a1' }}>
              {serviceType}
            </span>
          </div>
        )}

        {/* Customer Information Toggleable Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', background: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
          <span style={{ fontSize: '11px', fontWeight: '800', color: '#475569', textTransform: 'uppercase' }}>Customer Details</span>
          <button onClick={() => setShowCustomerDetails(!showCustomerDetails)}
            style={{ background: 'none', border: 'none', color: '#0e7490', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px' }}>
            {showCustomerDetails ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
          </button>
        </div>

        {showCustomerDetails ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', padding: '16px', background: '#fff', borderBottom: '1px solid #cbd5e1' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <label style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Customer Name</label>
              <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Walk-in" style={{ padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.8rem', outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <label style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Mobile Number</label>
              <input type="text" value={mobileNumber} onChange={e => setMobileNumber(e.target.value)} placeholder="Enter mobile" style={{ padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.8rem', outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <label style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>PAX (Guest Count)</label>
              <input type="number" min="1" value={paxCount} onChange={e => setPaxCount(parseInt(e.target.value) || 1)} style={{ padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.8rem', outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <label style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Waiter</label>
              <input type="text" value={waiter} onChange={e => setWaiter(e.target.value)} placeholder="Select waiter" style={{ padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.8rem', outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <label style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Captain</label>
              <input type="text" value={captain} onChange={e => setCaptain(e.target.value)} placeholder="Select captain" style={{ padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.8rem', outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <label style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Remarks</label>
              <input type="text" value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Add remarks" style={{ padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.8rem', outline: 'none' }} />
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: '#fff', borderBottom: '1px solid #cbd5e1' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Mobile Number:</span>
            <input type="text" placeholder="Enter Mobile Number" value={mobileNumber} onChange={e => setMobileNumber(e.target.value)}
              style={{ flex: 1, padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.82rem', outline: 'none' }} />
          </div>
        )}

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
              {rows.map((row, index) => {
                const matchItem = ALL_FOOD_ITEMS.find(f => f.name === row.name);
                return (
                  <tr key={index} style={{ borderBottom: '1px solid #e2e8f0', background: '#fff' }}>
                    <td style={{ padding: '6px 4px', textAlign: 'center' }}>
                      <button onClick={() => handleRemoveRow(index)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                        <FaTimes size={13} />
                      </button>
                    </td>
                    <td style={{ padding: '6px' }}>
                      <select value={row.name} onChange={e => updateRowField(index, 'name', e.target.value)}
                        style={{ width: '100%', padding: '6px 4px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.75rem', fontWeight: 600 }}>
                        <option value="">SELECT ITEM...</option>
                        {ALL_FOOD_ITEMS.map(item => (
                          <option key={item.name} value={item.name}>{item.name}</option>
                        ))}
                      </select>
                      
                      {matchItem?.hasVariants && (
                        <div style={{ display: 'flex', gap: '10px', marginTop: '4px', fontSize: '0.7rem' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '2px', cursor: 'pointer', fontWeight: '700' }}>
                            <input type="radio" name={`variant-${index}`} checked={row.variant === 'Half'} onChange={() => handleVariantChange(index, 'Half')} /> Half
                          </label>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '2px', cursor: 'pointer', fontWeight: '700' }}>
                            <input type="radio" name={`variant-${index}`} checked={row.variant === 'Full'} onChange={() => handleVariantChange(index, 'Full')} /> Full
                          </label>
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '6px' }}>
                      <input type="text" value={row.remark} onChange={e => updateRowField(index, 'remark', e.target.value)} placeholder="REMARKS"
                        style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.74rem' }} />
                    </td>
                    <td style={{ padding: '6px', textAlign: 'center' }}>
                      <input type="number" min="1" value={row.qty} onChange={e => updateRowField(index, 'qty', parseInt(e.target.value) || 1)}
                        style={{ width: '42px', padding: '6px 2px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.74rem', textAlign: 'center' }} />
                    </td>
                    <td style={{ padding: '6px', textAlign: 'center' }}>
                      <input type="number" min="0" value={row.price} onChange={e => updateRowField(index, 'price', parseFloat(e.target.value) || 0)}
                        style={{ width: '52px', padding: '6px 2px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.74rem', textAlign: 'center' }} />
                    </td>
                    <td style={{ padding: '6px 8px', textAlign: 'right', fontSize: '0.78rem', fontWeight: 700 }}>
                      {(row.qty * row.price).toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <button onClick={handleAddEmptyRow}
            style={{ marginTop: '10px', padding: '6px 12px', borderRadius: '6px', border: '1px dashed #0e7490', background: 'transparent', color: '#0e7490', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <FaPlus size={10} /> Add Item Row
          </button>
        </div>

        {/* Footer Billing Total & Action CTAs */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', background: '#0e7490', color: '#fff', fontSize: '1rem', fontWeight: 800 }}>
            <span>Total Amount</span>
            <span>₹{totalBill.toFixed(2)}</span>
          </div>

          <div style={{ padding: '16px 24px', background: '#e2e8f0', borderTop: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {isNewBooking ? (
              <>
                {!kotCreated ? (
                  <button onClick={handleAddKOT}
                    style={{ width: '100%', padding: '14px', borderRadius: '8px', border: 'none', background: '#e67e22', color: '#fff', fontSize: '0.85rem', fontWeight: '800', cursor: 'pointer' }}
                  >
                    Add KOT
                  </button>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: '#fff', padding: '12px', borderRadius: '8px', border: '1.5px solid #0e7490' }}>
                    {serviceType === 'Dine in' ? (
                      <>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
                          <label style={{ fontSize: '11px', fontWeight: '800', color: '#244E5F', textTransform: 'uppercase' }}>Assign Table</label>
                          <select value={assignedTableId} onChange={e => setAssignedTableId(parseInt(e.target.value))}
                            style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: '700' }}>
                            <option value="">-- SELECT AVAILABLE TABLE --</option>
                            {availableTables.map(t => (
                              <option key={t.id} value={t.id}>T{t.no} ({t.seats} Pax - {t.status})</option>
                            ))}
                          </select>
                        </div>
                        <button onClick={handleConfirmBooking}
                          style={{ width: '100%', padding: '12px', borderRadius: '8px', border: 'none', background: '#16a34a', color: '#fff', fontSize: '0.85rem', fontWeight: '800', cursor: 'pointer' }}
                        >
                          Confirm Booking
                        </button>
                      </>
                    ) : (
                      <>
                        {serviceType === 'Delivery' && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
                            <label style={{ fontSize: '11px', fontWeight: '800', color: '#244E5F', textTransform: 'uppercase' }}>Assign Driver</label>
                            <select value={remarks} onChange={e => setRemarks(e.target.value)}
                              style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: '700' }}>
                              <option value="">-- SELECT DELIVERY DRIVER --</option>
                              <option value="Driver: Rahul S.">Rahul S.</option>
                              <option value="Driver: Vikas P.">Vikas P.</option>
                              <option value="Driver: Ravi K.">Ravi K.</option>
                            </select>
                          </div>
                        )}
                        <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                          <button onClick={handleDirectComplete}
                            style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', background: '#16a34a', color: '#fff', fontSize: '0.82rem', fontWeight: '800', cursor: 'pointer' }}
                          >
                            Settle & Checkout
                          </button>
                          <button onClick={handleDirectComplete}
                            style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', color: '#0e7490', fontSize: '0.82rem', fontWeight: '800', cursor: 'pointer' }}
                          >
                            Save Order
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                <button onClick={handleSaveAndPrint}
                  style={{ flex: 1.2, padding: '12px', borderRadius: '8px', border: 'none', background: '#0e7490', color: '#fff', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  Save & KOT Print
                </button>
                <button onClick={handleCheckoutSettle}
                  style={{ flex: 1.2, padding: '12px', borderRadius: '8px', border: 'none', background: '#16a34a', color: '#fff', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  Settle & Checkout
                </button>
                <button onClick={handleCancel}
                  style={{ flex: 0.8, padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', color: '#dc2626', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  Cancel Table
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* KOT Generated Receipt Alert Popup */}
      {showKotAlert && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)',
          zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            background: '#fff', borderRadius: '12px', padding: '24px', width: '380px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', fontFamily: 'system-ui'
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#244E5F', margin: '0 0 12px 0', borderBottom: '2px dashed #cbd5e1', paddingBottom: '8px', textAlign: 'center' }}>
              KOT GENERATED
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem', color: '#334155' }}>
              <div><strong>KOT Number:</strong> <span style={{ color: '#e67e22', fontWeight: '800' }}>{generatedKotNo}</span></div>
              <div><strong>Customer Name:</strong> {customerName || 'Rahul Sharma'}</div>
              <div><strong>Mobile Number:</strong> {mobileNumber || '9876543210'}</div>
              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '8px', marginTop: '4px' }}>
                <strong>Ordered Items:</strong>
                <ul style={{ margin: '4px 0 0 0', paddingLeft: '20px', fontWeight: '600' }}>
                  {rows.filter(r => r.name !== '').map((r, i) => (
                    <li key={i}>{r.name} {r.variant ? `(${r.variant})` : ''} &times; {r.qty}</li>
                  ))}
                </ul>
              </div>
              <div style={{ borderTop: '2px dashed #cbd5e1', paddingTop: '8px', marginTop: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: '800', color: '#0f172a' }}>
                <span>Total Amount:</span>
                <span>₹{totalBill.toFixed(2)}</span>
              </div>
            </div>
            <button
              onClick={() => setShowKotAlert(false)}
              style={{
                width: '100%', marginTop: '20px', padding: '10px', borderRadius: '6px', border: 'none',
                background: '#e67e22', color: '#fff', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer'
              }}
            >
              Close & Assign Table
            </button>
          </div>
        </div>
      )}

      {/* Checkout Success Overlay */}
      {isSettling && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            background: '#fff', borderRadius: '16px', padding: '40px', textAlign: 'center',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', width: '360px'
          }}>
            <div style={{
              width: '72px', height: '72px', borderRadius: '50%', background: '#dcfce7', color: '#16a34a',
              display: 'flex', alignItems: 'center', justifycontent: 'center', margin: '0 auto 20px auto', fontSize: '2rem'
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
