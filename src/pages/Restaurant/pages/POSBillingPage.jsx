import React, { useState, useMemo, useEffect, useCallback, memo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  FaSearch, FaTimes, FaPlus, FaCheck,
  FaUser, FaTag, FaCommentAlt, FaPrint, FaWindowClose, FaUtensils,
  FaMotorcycle, FaShoppingBag, FaChevronDown, FaChevronUp
} from 'react-icons/fa';
import { useRestaurant } from '../../../context/RestaurantContext';
import { INITIAL_TABLES } from '../constants/mockData';

// Modular POS component splits
import POSHeader from '../components/pos/POSHeader';
import CustomerDrawer from '../components/pos/CustomerDrawer';
import TableSelector from '../components/pos/TableSelector';
import PaxModal from '../components/pos/PaxModal';
import RemarksModal from '../components/pos/RemarksModal';
import GSTModal from '../components/pos/GSTModal';
import CustomerSettingsModal from '../components/pos/CustomerSettingsModal';
import POSPaymentBar from '../components/pos/POSPaymentBar';
import POSSummaryBar from '../components/pos/POSSummaryBar';
import POSActionButtons from '../components/pos/POSActionButtons';
import POSFooterStatus from '../components/pos/POSFooterStatus';
import ClearConfirmModal from '../components/pos/ClearConfirmModal';

const ALL_FOOD_ITEMS = [
  {
    id: 101,
    name: 'CHICKEN TANDOORI',
    category: 'FOOD',
    variants: [
      { id: 'half', name: 'Half', price: 280 },
      { id: 'full', name: 'Full', price: 520 }
    ]
  },
  {
    id: 102,
    name: 'PANEER TIKKA',
    category: 'FOOD',
    variants: [
      { id: 'half', name: 'Half', price: 180 },
      { id: 'full', name: 'Full', price: 320 }
    ]
  },
  {
    id: 107,
    name: 'DAL MAKHANI',
    category: 'FOOD',
    variants: [
      { id: 'half', name: 'Half', price: 160 },
      { id: 'full', name: 'Full', price: 280 }
    ]
  },
  { id: 118, name: 'BUTTER NAAN', price: 40, category: 'FOOD', variants: [] },
  {
    id: 106,
    name: 'COLD DRINK',
    category: 'FOOD',
    variants: [
      { id: '250ml', name: '250 ML', price: 40 },
      { id: '500ml', name: '500 ML', price: 70 },
      { id: '1l', name: '1 Litre', price: 120 }
    ]
  },
  { id: 104, name: 'GARLIC NAAN', price: 100, category: 'FOOD', variants: [] },
  { id: 105, name: 'JEERA RICE', price: 200, category: 'FOOD', variants: [] },
  { id: 108, name: 'TANDOORI ROTI', price: 30, category: 'FOOD', variants: [] },
  { id: 109, name: 'MOCKTAILS', price: 150, category: 'FOOD', variants: [] },
  { id: 110, name: 'VEG BIRYANI', price: 380, category: 'FOOD', variants: [] },
  { id: 111, name: 'CHICKEN BIRYANI', price: 400, category: 'FOOD', variants: [] },
  { id: 112, name: 'CHICKEN TIKKA ROLL', price: 250, category: 'FOOD', variants: [] },
  { id: 113, name: 'MASALA PAPAD', price: 40, category: 'FOOD', variants: [] },
  { id: 114, name: 'CHILLI PANEER DRY', price: 320, category: 'FOOD', variants: [] },
  { id: 115, name: 'FRIED RICE', price: 220, category: 'FOOD', variants: [] },
  { id: 116, name: 'SPRING ROLLS', price: 180, category: 'FOOD', variants: [] },
  { id: 117, name: 'FAMILY PLATTER (VEG)', price: 1800, category: 'FOOD', variants: [] },
  { id: 121, name: 'CLUB SANDWICH', price: 180, category: 'FOOD', variants: [] },
  { id: 122, name: 'FRENCH FRIES', price: 140, category: 'FOOD', variants: [] },
  { id: 123, name: 'COLD COFFEE', price: 120, category: 'FOOD', variants: [] },
  {
    id: 103, name: 'VEG NOODLES', price: 240, category: 'FOOD', variants: [
      { id: 'half', name: 'Half', price: 140 },
      { id: 'full', name: 'Full', price: 240 }
    ]
  },

  // BANQUET items
  { id: 201, name: 'BANQUET BUFFET STANDARD', price: 600, category: 'BANQUET', variants: [] },
  { id: 202, name: 'BANQUET BUFFET PREMIUM', price: 950, category: 'BANQUET', variants: [] },
  { id: 203, name: 'BANQUET HALL CHARGE', price: 15000, category: 'BANQUET', variants: [] },
  { id: 204, name: 'DECORATION STANDARD', price: 4500, category: 'BANQUET', variants: [] }
];

const INITIAL_ROWS = [
  { lineId: 'initial-row-1', itemId: '', itemName: '', name: '', variantId: '', variantName: '', variant: '', remark: '', qty: 1, unitPrice: 0, price: 0, rate: 0, total: 0 }
];

const POSBillingPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Check if opened from "Book Table" button in new booking flow
  const isNewBooking = location.state?.isNewBooking || location.state?.newBooking || false;
  const preselectedTableId = location.state?.tableId || null;
  const preselectedTableNumber = location.state?.tableNumber || null;

  // Retrieve routed parameters
  const routedTable = location.state?.table || { id: 1, no: '01', status: 'Blank', waiter: null, customer: 'Walk-in' };

  // Tables List for Assignment
  const { tables: tablesList, setTables: setTablesList } = useRestaurant();

  // Component states
  const [category, setCategory] = useState('FOOD');
  const [searchItem, setSearchItem] = useState('');
  const [shortCode, setShortCode] = useState('');
  const [serviceType, setServiceType] = useState('Dine In');

  // Customer Information inputs
  const [customerName, setCustomerName] = useState(isNewBooking ? '' : (routedTable.customer || ''));
  const [mobileNumber, setMobileNumber] = useState(isNewBooking ? '' : (routedTable.mobile || ''));
  const [paxCount, setPaxCount] = useState(isNewBooking ? 1 : (routedTable.seats || 1));
  const [paxAdults, setPaxAdults] = useState(isNewBooking ? 1 : (routedTable.seats || 1));
  const [paxChildren, setPaxChildren] = useState(0);
  const [waiter, setWaiter] = useState(isNewBooking ? '' : (routedTable.waiter || ''));
  const [captain, setCaptain] = useState(isNewBooking ? '' : (routedTable.captain || ''));
  const [remarks, setRemarks] = useState('');
  const [showCustomerDetails, setShowCustomerDetails] = useState(true);

  // Enterprise payment details states
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [isPaid, setIsPaid] = useState(false);
  const [gstin, setGstin] = useState('');
  const [customerSettings, setCustomerSettings] = useState({
    enableLoyalty: false,
    customerType: 'Regular',
    creditAllowed: false,
    creditLimit: 0
  });

  // Modal open visibility triggers
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [isCustomerDrawerOpen, setIsCustomerDrawerOpen] = useState(false);
  const [isPaxModalOpen, setIsPaxModalOpen] = useState(false);
  const [isRemarksModalOpen, setIsRemarksModalOpen] = useState(false);
  const [isGstModalOpen, setIsGstModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);

  // KOT states
  const [kotCreated, setKotCreated] = useState(false);
  const [generatedKotNo, setGeneratedKotNo] = useState('');
  const [showKotAlert, setShowKotAlert] = useState(false);
  const [assignedTableId, setAssignedTableId] = useState(preselectedTableId || routedTable?.id || '');

  // Table rows for right-side billing
  const [rows, setRows] = useState(INITIAL_ROWS);
  const [isSettling, setIsSettling] = useState(false);
  const [variantIndex, setVariantIndex] = useState(0);

  // Global Shortcuts Hook for F5-F10
  useEffect(() => {
    const handleShortcuts = (e) => {
      switch (e.key) {
        case 'F5':
          e.preventDefault();
          handleConfirmBooking();
          break;
        case 'F6':
          e.preventDefault();
          handleSaveAndPrint();
          break;
        case 'F7':
          e.preventDefault();
          handleDirectComplete();
          break;
        case 'F8':
          e.preventDefault();
          handleAddKOT();
          break;
        case 'F9':
          e.preventDefault();
          handleSaveAndPrint();
          break;
        case 'F10':
          e.preventDefault();
          handleConfirmBooking();
          break;
        default:
          break;
      }
    };
    window.addEventListener('keydown', handleShortcuts);
    return () => window.removeEventListener('keydown', handleShortcuts);
  }, [rows, assignedTableId, customerName, mobileNumber, waiter, captain, remarks, paymentMode, isPaid, gstin]);

  // Variant selection modal states
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [variantModalItem, setVariantModalItem] = useState(null);

  // Load existing items if editing
  useEffect(() => {
    if (!isNewBooking) {
      if (location.state?.orderRows) {
        setRows(location.state.orderRows);
      } else if (routedTable.id === 2) {
        setRows([
          { lineId: 'row-2-1', itemId: 121, itemName: 'CLUB SANDWICH', name: 'CLUB SANDWICH', variantId: '', variantName: '', variant: '', remark: 'Medium Spicy', qty: 1, unitPrice: 180, price: 180, rate: 180, total: 180 },
          { lineId: 'row-2-2', itemId: 123, itemName: 'COLD COFFEE', name: 'COLD COFFEE', variantId: '', variantName: '', variant: '', remark: 'With Ice Cream', qty: 2, unitPrice: 120, price: 120, rate: 120, total: 240 },
          { lineId: 'row-2-3', itemId: 104, itemName: 'GARLIC NAAN', name: 'GARLIC NAAN', variantId: '', variantName: '', variant: '', remark: '', qty: 1, unitPrice: 100, price: 100, rate: 100, total: 100 }
        ]);
      } else if (routedTable.id === 3) {
        setRows([
          { lineId: 'row-3-1', itemId: 109, itemName: 'MOCKTAILS', name: 'MOCKTAILS', variantId: '', variantName: '', variant: '', remark: '', qty: 3, unitPrice: 150, price: 150, rate: 150, total: 450 },
          { lineId: 'row-3-2', itemId: 116, itemName: 'SPRING ROLLS', name: 'SPRING ROLLS', variantId: '', variantName: '', variant: '', remark: 'Crispy', qty: 2, unitPrice: 180, price: 180, rate: 180, total: 360 }
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
    if (!foodItem.variants || foodItem.variants.length === 0) {
      // Smart Variant Logic: 0 variants -> Add directly
      addOrUpdateItemRow(foodItem, null);
    } else if (foodItem.variants.length === 1) {
      // Smart Variant Logic: 1 variant -> Add directly with default variant
      addOrUpdateItemRow(foodItem, foodItem.variants[0]);
    } else {
      // Smart Variant Logic: >1 variants -> Open variant modal
      setVariantModalItem(foodItem);
      setShowVariantModal(true);
    }
  };

  // Helper to add or update row
  const addOrUpdateItemRow = (foodItem, variant) => {
    const variantId = variant ? variant.id : '';
    const variantName = variant ? variant.name : '';
    const price = variant ? variant.price : (foodItem.price || 0);
    const lineId = crypto.randomUUID ? crypto.randomUUID() : (Date.now().toString(36) + Math.random().toString(36).substr(2, 5));

    setRows(prev => {
      const emptyIndex = prev.findIndex(r => !r.itemName && !r.name);
      const existingIndex = prev.findIndex(r =>
        (r.itemId === foodItem.id || r.itemName === foodItem.name || r.name === foodItem.name) &&
        (r.variantId === variantId)
      );

      if (existingIndex !== -1) {
        return prev.map((r, i) => {
          if (i === existingIndex) {
            const nextQty = r.qty + 1;
            return { ...r, qty: nextQty, total: nextQty * r.unitPrice };
          }
          return r;
        });
      } else if (emptyIndex !== -1) {
        return prev.map((r, i) => {
          if (i === emptyIndex) {
            return {
              ...r,
              lineId,
              itemId: foodItem.id,
              itemName: foodItem.name,
              name: foodItem.name, // compatibility
              variantId,
              variantName,
              variant: variantName, // compatibility
              qty: 1,
              unitPrice: price,
              price: price, // compatibility
              rate: price, // compatibility
              total: price,
              remark: ''
            };
          }
          return r;
        });
      } else {
        return [
          ...prev,
          {
            lineId,
            itemId: foodItem.id,
            itemName: foodItem.name,
            name: foodItem.name, // compatibility
            variantId,
            variantName,
            variant: variantName, // compatibility
            qty: 1,
            unitPrice: price,
            price: price, // compatibility
            rate: price, // compatibility
            total: price,
            remark: ''
          }
        ];
      }
    });
  };

  const updateRowField = (index, field, value) => {
    setRows(prev => prev.map((row, i) => {
      if (i === index) {
        const updated = { ...row, [field]: value };
        if (field === 'name' || field === 'itemName') {
          const match = ALL_FOOD_ITEMS.find(f => f.name === value);
          if (match) {
            updated.itemId = match.id;
            updated.itemName = match.name;
            updated.name = match.name; // compatibility

            if (!match.variants || match.variants.length === 0) {
              updated.variantId = '';
              updated.variantName = '';
              updated.variant = '';
              updated.unitPrice = match.price || 0;
              updated.price = match.price || 0;
              updated.rate = match.price || 0;
            } else {
              const firstVar = match.variants[0];
              updated.variantId = firstVar.id;
              updated.variantName = firstVar.name;
              updated.variant = firstVar.name;
              updated.unitPrice = firstVar.price;
              updated.price = firstVar.price;
              updated.rate = firstVar.price;
            }
          } else {
            updated.itemId = '';
            updated.itemName = '';
            updated.name = '';
            updated.variantId = '';
            updated.variantName = '';
            updated.variant = '';
            updated.unitPrice = 0;
            updated.price = 0;
            updated.rate = 0;
          }
        }

        const qty = updated.qty || 1;
        const priceVal = updated.unitPrice || updated.price || 0;
        updated.total = qty * priceVal;
        return updated;
      }
      return row;
    }));
  };

  const handleVariantChange = (index, variantId) => {
    setRows(prev => prev.map((row, i) => {
      if (i === index) {
        const item = ALL_FOOD_ITEMS.find(f => f.id === row.itemId || f.name === row.itemName || f.name === row.name);
        const variantObj = item?.variants?.find(v => v.id === variantId);
        if (variantObj) {
          const price = variantObj.price;
          return {
            ...row,
            variantId: variantObj.id,
            variantName: variantObj.name,
            variant: variantObj.name, // compatibility
            unitPrice: price,
            price: price, // compatibility
            rate: price, // compatibility
            total: row.qty * price
          };
        }
      }
      return row;
    }));
  };

  const handleAddEmptyRow = () => {
    const lineId = crypto.randomUUID ? crypto.randomUUID() : (Date.now().toString(36) + Math.random().toString(36).substr(2, 5));
    setRows(prev => [...prev, { lineId, itemId: '', itemName: '', name: '', variantId: '', variantName: '', variant: '', remark: '', qty: 1, unitPrice: 0, price: 0, rate: 0, total: 0 }]);
  };

  const handleRemoveRow = (index) => {
    if (rows.length === 1) {
      setRows(INITIAL_ROWS);
    } else {
      setRows(prev => prev.filter((_, i) => i !== index));
    }
  };

  const totalBill = useMemo(() => {
    return rows.reduce((sum, row) => sum + (row.qty * (row.unitPrice || row.price || 0)), 0);
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
        <POSHeader
          serviceType={serviceType}
          setServiceType={setServiceType}
          assignedTableNo={assignedTableId ? tablesList.find(t => t.id === assignedTableId)?.no : routedTable?.no}
          customerName={customerName}
          paxCount={paxCount}
          hasRemarks={!!remarks}
          onTableClick={useCallback(() => setIsTableModalOpen(true), [])}
          onCustomerClick={useCallback(() => setIsCustomerDrawerOpen(true), [])}
          onPaxClick={useCallback(() => setIsPaxModalOpen(true), [])}
          onRemarksClick={useCallback(() => setIsRemarksModalOpen(true), [])}
        />

        {/* Interactive billing item rows ledger */}
        <div style={{ padding: '8px', flex: 1, overflowY: 'auto' }}>
          <table className="custom-table-element" style={{ width: '100%', borderCollapse: 'collapse' }}>
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
                const matchItem = ALL_FOOD_ITEMS.find(f => f.id === row.itemId || f.name === row.itemName || f.name === row.name);
                return (
                  <tr key={row.lineId || index} style={{ borderBottom: '1px solid #e2e8f0', background: '#fff' }}>
                    <td style={{ padding: '6px 4px', textAlign: 'center' }}>
                      <button type="button" onClick={() => handleRemoveRow(index)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                        <FaTimes size={13} />
                      </button>
                    </td>
                    <td style={{ padding: '6px' }}>
                      <select value={row.itemName || row.name || ''} onChange={e => updateRowField(index, 'itemName', e.target.value)}
                        style={{ width: '100%', padding: '6px 4px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.75rem', fontWeight: 600 }}>
                        <option value="">SELECT ITEM...</option>
                        {ALL_FOOD_ITEMS.map(item => (
                          <option key={item.id} value={item.name}>{item.name}</option>
                        ))}
                      </select>

                      {matchItem?.variants && matchItem.variants.length > 0 && (
                        <div style={{ display: 'flex', gap: '10px', marginTop: '4px', fontSize: '0.7rem', flexWrap: 'wrap' }}>
                          {matchItem.variants.map(variant => (
                            <label key={variant.id} style={{ display: 'flex', alignItems: 'center', gap: '2px', cursor: 'pointer', fontWeight: '700' }}>
                              <input
                                type="radio"
                                name={`variant-${index}-${row.lineId || index}`}
                                checked={row.variantId === variant.id}
                                onChange={() => handleVariantChange(index, variant.id)}
                              /> {variant.name}
                            </label>
                          ))}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '6px' }}>
                      <input type="text" value={row.remark || ''} onChange={e => updateRowField(index, 'remark', e.target.value)} placeholder="REMARKS"
                        style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.74rem' }} />
                    </td>
                    <td style={{ padding: '6px', textAlign: 'center' }}>
                      <input type="number" min="1" value={row.qty} onChange={e => updateRowField(index, 'qty', parseInt(e.target.value) || 1)}
                        style={{ width: '42px', padding: '6px 2px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.74rem', textAlign: 'center' }} />
                    </td>
                    <td style={{ padding: '6px', textAlign: 'center' }}>
                      <input type="number" min="0" value={row.unitPrice || row.price || 0} onChange={e => updateRowField(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                        style={{ width: '52px', padding: '6px 2px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.74rem', textAlign: 'center' }} />
                    </td>
                    <td style={{ padding: '6px 8px', textAlign: 'right', fontSize: '0.78rem', fontWeight: 700 }}>
                      {(row.qty * (row.unitPrice || row.price || 0)).toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button type="button" onClick={handleAddEmptyRow}
              style={{ padding: '6px 12px', borderRadius: '6px', border: '1px dashed #0e7490', background: 'transparent', color: '#0e7490', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <FaPlus size={10} /> Add Item Row
            </button>
            <button type="button" onClick={useCallback(() => setIsClearModalOpen(true), [])}
              style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'transparent', color: '#ef4444', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
            >
              Clear Cart
            </button>
            <button type="button" onClick={useCallback(() => setIsGstModalOpen(true), [])}
              style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'transparent', color: '#0e7490', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
            >
              GSTIN
            </button>
            <button type="button" onClick={useCallback(() => setIsSettingsModalOpen(true), [])}
              style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'transparent', color: '#64748b', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
            >
              Account settings
            </button>
          </div>
        </div>

        {/* Payment and Total section */}
        <POSPaymentBar
          activeMode={paymentMode}
          onSelectMode={setPaymentMode}
          isPaid={isPaid}
          onChangeIsPaid={setIsPaid}
        />

        <POSSummaryBar
          totalBill={totalBill}
          onSplitClick={useCallback(() => toast('Bill split modal triggered'), [])}
        />

        <POSActionButtons
          onSave={handleConfirmBooking}
          onSaveAndPrint={handleSaveAndPrint}
          onSaveAndEBill={handleDirectComplete}
          onKOT={handleAddKOT}
          onKOTAndPrint={handleSaveAndPrint}
          onHold={handleConfirmBooking}
        />

        <POSFooterStatus
          billNo={generatedKotNo ? `BILL-${generatedKotNo.split('-')[1] || '000123'}` : 'BILL-000123'}
          cashierName={captain || 'Admin'}
          outletName="Main Restaurant"
        />
      </div>

      {/* Dynamic Overlay Dialogs & Sidebar Drawers */}
      <TableSelector
        isOpen={isTableModalOpen}
        onClose={useCallback(() => setIsTableModalOpen(false), [])}
        tablesList={tablesList}
        currentTableId={assignedTableId}
        onSelectTable={useCallback((table) => {
          setAssignedTableId(table.id);
          toast(`Assigned to Table ${table.no}`);
        }, [tablesList])}
      />

      <CustomerDrawer
        isOpen={isCustomerDrawerOpen}
        onClose={useCallback(() => setIsCustomerDrawerOpen(false), [])}
        currentCustomer={{ phone: mobileNumber, name: customerName }}
        onSaveCustomer={useCallback((cust) => {
          setCustomerName(cust.name);
          setMobileNumber(cust.phone);
          toast(`Linked customer: ${cust.name}`);
        }, [])}
      />

      <PaxModal
        isOpen={isPaxModalOpen}
        onClose={useCallback(() => setIsPaxModalOpen(false), [])}
        adults={paxAdults}
        children={paxChildren}
        onSavePax={useCallback((a, c) => {
          setPaxAdults(a);
          setPaxChildren(c);
          setPaxCount(a + c);
          toast(`Covers set: ${a} Adults, ${c} Children`);
        }, [])}
      />

      <RemarksModal
        isOpen={isRemarksModalOpen}
        onClose={useCallback(() => setIsRemarksModalOpen(false), [])}
        remarks={remarks}
        onSaveRemarks={useCallback((text) => {
          setRemarks(text);
          toast('Kitchen instructions saved.');
        }, [])}
      />

      <GSTModal
        isOpen={isGstModalOpen}
        onClose={useCallback(() => setIsGstModalOpen(false), [])}
        gstin={gstin}
        onSaveGSTIN={useCallback((val) => {
          setGstin(val);
          toast(`GSTIN set to: ${val}`);
        }, [])}
      />

      <CustomerSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={useCallback(() => setIsSettingsModalOpen(false), [])}
        settings={customerSettings}
        onSaveSettings={useCallback((settingsObj) => {
          setCustomerSettings(settingsObj);
          toast('Customer accounts configuration saved.');
        }, [])}
      />

      <ClearConfirmModal
        isOpen={isClearModalOpen}
        onClose={useCallback(() => setIsClearModalOpen(false), [])}
        onConfirm={useCallback(() => {
          setRows(INITIAL_ROWS);
          toast('Draft cart cleared.');
        }, [])}
      />

      {/* Success settlements animation */}
      {isSettling && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            background: '#fff', borderRadius: '16px', padding: '40px', textAlign: 'center',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', width: '360px', fontFamily: 'system-ui'
          }}>
            <div style={{
              width: '72px', height: '72px', borderRadius: '50%', background: '#dcfce7', color: '#16a34a',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto', fontSize: '2rem'
            }}>
              ✓
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#111827', margin: '0 0 8px 0' }}>
              Payment Completed
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: 0, fontWeight: 500 }}>
              Transaction Settled Successfully
            </p>
            <span style={{ fontSize: '0.72rem', color: '#9ca3af', display: 'block', marginTop: '16px' }}>
              Resetting checkout registers...
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default POSBillingPage;
