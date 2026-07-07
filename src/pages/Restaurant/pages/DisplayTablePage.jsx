import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaUser, FaTimes, FaExchangeAlt, FaUtensils, FaShoppingBag, FaMotorcycle, FaClock, FaEye, FaTrash, FaSave, FaDownload, FaPrint, FaSync } from 'react-icons/fa';
import DeleteConfirmationModal from '../../../components/common/DeleteConfirmationModal';

const INITIAL_TABLES = [
  { id: 1, no: '01', seats: 4, status: 'Blank', amount: 0, waiter: null, customer: 'Walk-in', floor: 'Ground', section: 'Main Area' },
  { id: 2, no: '02', seats: 2, status: 'Running', amount: 1070, waiter: 'Ravi K.', customer: 'John Doe', floor: 'Ground', section: 'Main Area', openedAt: Date.now() - 25 * 60 * 1000 },
  { id: 3, no: '03', seats: 6, status: 'Running', amount: 2490, waiter: 'Anita S.', customer: 'Walk-in', floor: 'First', section: 'Balcony', openedAt: Date.now() - 45 * 60 * 1000 },
  { id: 4, no: '04', seats: 4, status: 'Paid', amount: 1460, waiter: 'Ravi K.', customer: 'Sarah Connor', floor: 'Ground', section: 'Main Area' },
  { id: 5, no: '05', seats: 4, status: 'Reserved', amount: 0, waiter: 'Anita S.', customer: 'Vikas P.', floor: 'Ground', section: 'Garden' },
  { id: 6, no: '06', seats: 4, status: 'Running', amount: 1700, waiter: 'Suresh P.', customer: 'Rohan G.', floor: 'First', section: 'Balcony', openedAt: Date.now() - 15 * 60 * 1000 },
  { id: 7, no: '07', seats: 8, status: 'Paid', amount: 3800, waiter: 'Anita S.', customer: 'Anjali T.', floor: 'First', section: 'Balcony' },
  { id: 8, no: '08', seats: 2, status: 'Cleaning', amount: 0, waiter: null, customer: 'Walk-in', floor: 'Ground', section: 'Main Area' },
  { id: 9, no: '09', seats: 2, status: 'Running', amount: 740, waiter: 'Suresh P.', customer: 'Alice S.', floor: 'Ground', section: 'Main Area', openedAt: Date.now() - 8 * 60 * 1000 },
  { id: 10, no: '10', seats: 4, status: 'Blank', amount: 0, waiter: null, customer: 'Walk-in', floor: 'First', section: 'Main Area' },
  { id: 11, no: '11', seats: 6, status: 'Running', amount: 3200, waiter: 'Ravi K.', customer: 'Walk-in', floor: 'First', section: 'Balcony', openedAt: Date.now() - 30 * 60 * 1000 },
  { id: 12, no: '12', seats: 4, status: 'Paid', amount: 2100, waiter: 'Suresh P.', customer: 'David M.', floor: 'Ground', section: 'Main Area' },
];

const INITIAL_MOCK_ORDER_DETAILS = {
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
  ],
  10: [],
  11: [
    { name: 'Butter Chicken', qty: 4, rate: 450, total: 1800 },
    { name: 'Garlic Naan', qty: 10, rate: 100, total: 1000 },
    { name: 'Jeera Rice', qty: 2, rate: 200, total: 400 }
  ],
  12: [
    { name: 'Club Sandwich', qty: 2, rate: 180, total: 360 },
    { name: 'French Fries', qty: 1, rate: 140, total: 140 },
    { name: 'Soft Drink', qty: 4, rate: 60, total: 240 }
  ]
};

const SERVICES = [
  { id: 'Restaurant', label: 'Dine In', icon: FaUtensils },
  { id: 'Takeaway', label: 'Take Away', icon: FaShoppingBag },
  { id: 'Delivery', label: 'Delivery', icon: FaMotorcycle },
];

// Reusable Performance-Optimized TableCard Component
// Reusable Performance-Optimized TableCard Component
const TableCard = React.memo(({ table, onClick, onView, onDelete, onSave, onDownload, onOpenOps }) => {
  let cardBg = '#ffffff';
  let textColor = '#0f172a';
  let borderStyle = '1px solid #cbd5e1';

  if (table.status === 'Running') {
    cardBg = '#5fcb83'; // Vibrant green from screenshot
    textColor = '#0f172a';
    borderStyle = '1px solid #cbd5e1';
  } else if (table.status === 'Paid') {
    cardBg = '#475569';
    textColor = '#ffffff';
    borderStyle = '1px solid #cbd5e1';
  } else if (table.status === 'Reserved') {
    cardBg = '#ffedd5';
    textColor = '#7c2d12';
    borderStyle = '1px solid #cbd5e1';
  } else if (table.status === 'Cleaning') {
    cardBg = '#e0f2fe';
    textColor = '#0c4a6e';
    borderStyle = '1px solid #cbd5e1';
  } else if (table.status === 'Blank') {
    borderStyle = '1px dashed #cbd5e1';
  } else if (table.status === 'KOT Generated') {
    cardBg = '#fef9c3';
    textColor = '#713f12';
    borderStyle = '1px solid #fef08a';
  } else if (table.status === 'Food Served') {
    cardBg = '#dcfce7';
    textColor = '#14532d';
    borderStyle = '1px solid #bbf7d0';
  } else if (table.status === 'Bill Generated') {
    cardBg = '#fce7f3';
    textColor = '#9d174d';
    borderStyle = '1px solid #fbcfe8';
  } else if (table.status === 'Payment Pending') {
    cardBg = '#fee2e2';
    textColor = '#7f1d1d';
    borderStyle = '1px solid #fecaca';
  }

  // Dynamic running duration timer (hh:mm:ss format)
  const [elapsed, setElapsed] = useState('');

  useEffect(() => {
    let intervalId;
    const isTimerActive = table.openedAt && 
      (table.status !== 'Blank' && table.status !== 'Paid' && table.status !== 'Cleaning' && table.status !== 'Reserved');

    if (isTimerActive) {
      const updateTimer = () => {
        const diffMs = Date.now() - table.openedAt;
        const totalSecs = Math.floor(diffMs / 1000);
        const hours = Math.floor(totalSecs / 3600);
        const mins = Math.floor((totalSecs % 3600) / 60);
        const secs = totalSecs % 60;
        
        const pad = (val) => String(val).padStart(2, '0');
        setElapsed(`${pad(hours)}:${pad(mins)}:${pad(secs)}`);
      };
      
      updateTimer();
      intervalId = setInterval(updateTimer, 1000);
    } else {
      setElapsed('');
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [table.status, table.openedAt]);

  return (
    <div
      onClick={onClick}
      style={{
        background: cardBg,
        color: textColor,
        border: borderStyle,
        borderRadius: '8px',
        padding: '16px',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '120px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        transition: 'transform 150ms ease-in-out, box-shadow 150ms ease-in-out',
        position: 'relative',
        textAlign: 'center'
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.05)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
      }}
    >
      {/* Timer Badge (Circular badge at the top-right corner) */}
      {elapsed && (
        <div style={{
          position: 'absolute',
          top: '-12px',
          right: '-12px',
          background: '#0d9488',
          color: '#ffffff',
          borderRadius: '50%',
          width: '46px',
          height: '46px',
          fontSize: '0.62rem',
          fontWeight: 700,
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          lineHeight: '1',
          zIndex: 5
        }}>
          {elapsed}
        </div>
      )}

      {/* Table No Label */}
      <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>
        T{parseInt(table.no)}
      </div>

      {/* Status & Staff Info list inside card */}
      <div style={{ fontSize: '0.7rem', opacity: 0.8, marginTop: '2px', lineHeight: '1.2' }}>
        {table.status !== 'Blank' && (
          <>
            <div>{table.isHold ? 'HOLD' : table.status} | Pax: {table.seats || 4}</div>
            {table.waiter && <div>Wtr: {table.waiter}</div>}
            {table.captain && <div>Cap: {table.captain}</div>}
            {table.kotCount > 0 && <div>KOTs: {table.kotCount}</div>}
          </>
        )}
      </div>

      {/* Order Amount */}
      {table.status !== 'Blank' && table.amount > 0 && (
        <div style={{ fontSize: '0.9rem', fontWeight: 800, marginTop: '4px' }}>
          ₹{table.amount.toLocaleString('en-IN')}
        </div>
      )}

      {/* Floating Bottom action row with original design, plus operations trigger */}
      {table.status !== 'Blank' && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            bottom: '-16px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '14px',
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '6px',
            padding: '6px 12px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            whiteSpace: 'nowrap'
          }}
        >
          <button
            onClick={onSave}
            title="Save / Print KOT"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#475569'
            }}
          >
            <FaPrint size={18} />
          </button>
          <button
            onClick={onView}
            title="POS Billing view"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#475569'
            }}
          >
            <FaEye size={18} />
          </button>
          <button
            onClick={onDelete}
            title="Clear Table / Reset"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#dc2626'
            }}
          >
            <FaTrash size={18} />
          </button>
          <button
            onClick={onDownload}
            title="Download Receipt"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#475569'
            }}
          >
            <FaDownload size={18} />
          </button>
          <button
            onClick={onOpenOps}
            title="Enterprise Table Operations"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0d9488'
            }}
          >
            <FaExchangeAlt size={18} />
          </button>
        </div>
      )}
    </div>
  );
});

const DisplayTablePage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [tables, setTables] = useState(INITIAL_TABLES);
  const [filter, setFilter] = useState('All');
  const [service, setService] = useState('Restaurant');
  const [search, setSearch] = useState('');
  const [activeRestaurant, setActiveRestaurant] = useState('Main Dining Room');

  // Dynamic KOT and orders data state
  const [orderItemsMap, setOrderItemsMap] = useState(INITIAL_MOCK_ORDER_DETAILS);

  // Quick switch modal states
  const [showQuickSwitch, setShowQuickSwitch] = useState(false);
  const [modalTab, setModalTab] = useState('Move'); // Move, MoveItems, Merge, Split
  const [transferOp, setTransferOp] = useState('Move');
  const [fromTableId, setFromTableId] = useState('');
  const [toTableId, setToTableId] = useState('');

  // Selected items transfer states
  const [selectedItemsToMove, setSelectedItemsToMove] = useState({}); // { item_name: qty_to_move }
  const [splitGuestsSource, setSplitGuestsSource] = useState(3);
  const [splitGuestsTarget, setSplitGuestsTarget] = useState(3);

  // Delete confirmation modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [tableToDelete, setTableToDelete] = useState(null);

  // Sync returned route state values
  useEffect(() => {
    if (location.state?.settledTableId) {
      const settledId = location.state.settledTableId;
      setTables(prev => prev.map(t => {
        if (t.id === settledId) {
          return { ...t, status: 'Blank', amount: 0, waiter: null, customer: 'Walk-in', openedAt: null };
        }
        return t;
      }));
      setOrderItemsMap(prev => ({
        ...prev,
        [settledId]: []
      }));
      // Clear route state to prevent redundant loops
      window.history.replaceState({}, document.title);
    } else if (location.state?.updatedTable && location.state?.updatedRows) {
      const ut = location.state.updatedTable;
      const ur = location.state.updatedRows;

      setTables(prev => prev.map(t => {
        if (t.id === ut.id) {
          return {
            ...t,
            ...ut,
            openedAt: t.openedAt || Date.now() // start running timer if not set
          };
        }
        return t;
      }));
      setOrderItemsMap(prev => ({
        ...prev,
        [ut.id]: ur
      }));
      // Clear route state to prevent redundant loops
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const toast = (msg) => {
    if (window.showToast) {
      window.showToast(msg);
    } else {
      console.log('Toast:', msg);
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

  const handleServiceChange = (id) => {
    if (id === 'Takeaway') {
      navigate('/restaurant/pos-billing', {
        state: {
          orderType: 'Takeaway',
          order: { id: `TKB-${Date.now().toString().slice(-4)}`, customer: 'Walk-in', items: '', amount: 0 }
        }
      });
    } else if (id === 'Delivery') {
      navigate('/restaurant/pos-billing', {
        state: {
          orderType: 'Delivery',
          order: { id: `DEL-${Date.now().toString().slice(-4)}`, customer: 'Walk-in', items: '', amount: 0 }
        }
      });
    } else {
      setService(id);
      setFilter('All');
      setSearch('');
    }
  };

  // Status pills switcher counts calculation
  const pillFilters = useMemo(() => {
    return [
      { value: 'All', label: 'All Tables', count: tables.length },
      { value: 'Blank', label: 'Blank', count: tables.filter(t => t.status === 'Blank').length },
      { value: 'Running', label: 'Running', count: tables.filter(t => t.status === 'Running').length },
      { value: 'Paid', label: 'Paid', count: tables.filter(t => t.status === 'Paid').length },
      { value: 'Reserved', label: 'Reserved', count: tables.filter(t => t.status === 'Reserved').length },
      { value: 'Cleaning', label: 'Cleaning', count: tables.filter(t => t.status === 'Cleaning').length },
    ];
  }, [tables]);

  // Filtered dataset calculations
  const filteredData = useMemo(() => {
    const q = search.toLowerCase().trim();
    let list = filter === 'All' ? tables : tables.filter(t => t.status === filter);
    if (q) {
      list = list.filter(t =>
        `Table ${t.no}`.toLowerCase().includes(q) ||
        (t.waiter && t.waiter.toLowerCase().includes(q))
      );
    }
    return list;
  }, [tables, filter, search]);

  const handleTableCardClick = (table) => {
    navigate('/restaurant/pos-billing', { state: { table } });
  };

  const handleView = (table) => {
    navigate('/restaurant/pos-billing', { state: { table } });
  };

  const handleDeleteClick = (table) => {
    setTableToDelete(table);
    setDeleteModalOpen(true);
  };

  const confirmDeleteTable = () => {
    if (!tableToDelete) return;
    const table = tableToDelete;
    setTables(prev => prev.map(t => {
      if (t.id === table.id) {
        return { ...t, status: 'Blank', amount: 0, waiter: null, customer: 'Walk-in', openedAt: null };
      }
      return t;
    }));
    setOrderItemsMap(prev => ({
      ...prev,
      [table.id]: []
    }));
    toast(`Table ${table.no} cleared successfully.`);
    setDeleteModalOpen(false);
    setTableToDelete(null);
  };

  const handleSave = (table) => {
    toast(`Table ${table.no} details saved successfully!`);
  };

  const handleDownload = (table) => {
    const items = orderItemsMap[table.id] || [];
    const amount = table.amount || 0;

    if (items.length === 0 && amount === 0) {
      toast(`Table ${table.no} has no active bill/order to download.`);
      return;
    }

    let subtotal = amount;
    let gst = Math.round(subtotal * 0.05);
    let serviceCharge = amount > 0 ? 50 : 0;
    let grandTotal = subtotal + gst + serviceCharge;

    if (items.length > 0) {
      subtotal = items.reduce((sum, item) => sum + item.total, 0);
      gst = Math.round(subtotal * 0.05);
      serviceCharge = subtotal > 0 ? 50 : 0;
      grandTotal = subtotal + gst + serviceCharge;
    }

    let receiptText = `========================================\n`;
    receiptText += `             ALFA RESTAURANT             \n`;
    receiptText += `========================================\n`;
    receiptText += `Table No: ${table.no}\n`;
    receiptText += `Date: ${new Date().toLocaleDateString()}\n`;
    receiptText += `Time: ${new Date().toLocaleTimeString()}\n`;
    receiptText += `Status: ${table.status}\n`;
    receiptText += `----------------------------------------\n`;

    if (items.length > 0) {
      receiptText += `Item Name            Qty   Rate   Total\n`;
      receiptText += `----------------------------------------\n`;
      items.forEach(item => {
        const namePart = item.name.padEnd(20, ' ').substring(0, 20);
        const qtyPart = String(item.qty).padStart(4, ' ');
        const ratePart = String(item.rate).padStart(6, ' ');
        const totalPart = String(item.total).padStart(7, ' ');
        receiptText += `${namePart} ${qtyPart} ${ratePart} ${totalPart}\n`;
      });
    } else {
      receiptText += `Summary: Quick Billing Order\n`;
    }

    receiptText += `----------------------------------------\n`;
    receiptText += `Subtotal:                  ₹ ${subtotal.toLocaleString('en-IN')}\n`;
    receiptText += `CGST & SGST (5%):          ₹ ${gst.toLocaleString('en-IN')}\n`;
    receiptText += `Service Charge:            ₹ ${serviceCharge.toLocaleString('en-IN')}\n`;
    receiptText += `----------------------------------------\n`;
    receiptText += `Grand Total:               ₹ ${grandTotal.toLocaleString('en-IN')}\n`;
    receiptText += `========================================\n`;
    receiptText += `        Thank You! Visit Again.        \n`;
    receiptText += `========================================\n`;

    const blob = new Blob([receiptText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Table_${table.no}_Bill.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast(`Bill downloaded for Table ${table.no}.`);
  };

  // Get active items list of the selected source table
  const activeSourceItems = useMemo(() => {
    if (!fromTableId) return [];
    return orderItemsMap[parseInt(fromTableId)] || [];
  }, [fromTableId, orderItemsMap]);

  // Handle selected item quantity checkbox toggle
  const toggleItemCheckbox = (itemName, maxQty) => {
    setSelectedItemsToMove(prev => {
      const copy = { ...prev };
      if (copy[itemName]) {
        delete copy[itemName];
      } else {
        copy[itemName] = maxQty;
      }
      return copy;
    });
  };

  const setItemMoveQty = (itemName, qty) => {
    setSelectedItemsToMove(prev => ({
      ...prev,
      [itemName]: qty
    }));
  };

  // Execute advanced transfer operations
  const executeOperations = () => {
    if (!fromTableId || !toTableId) {
      toast('Please select source and target tables.');
      return;
    }
    const sourceId = parseInt(fromTableId);
    const targetId = parseInt(toTableId);

    if (sourceId === targetId) {
      toast('Cannot select the same table.');
      return;
    }

    const sourceTable = tables.find(t => t.id === sourceId);
    const targetTable = tables.find(t => t.id === targetId);

    if (modalTab === 'Move') {
      // 1. Move complete order
      const sourceItems = orderItemsMap[sourceId] || [];

      setOrderItemsMap(prev => ({
        ...prev,
        [sourceId]: [],
        [targetId]: [...(prev[targetId] || []), ...sourceItems]
      }));

      setTables(prev => prev.map(t => {
        if (t.id === sourceId) {
          return { ...t, status: 'Blank', amount: 0, waiter: null, customer: 'Walk-in', openedAt: null };
        }
        if (t.id === targetId) {
          return {
            ...t,
            status: 'Running',
            amount: t.amount + sourceTable.amount,
            waiter: t.waiter || sourceTable.waiter,
            customer: t.customer !== 'Walk-in' ? t.customer : sourceTable.customer,
            openedAt: t.openedAt || sourceTable.openedAt || Date.now()
          };
        }
        return t;
      }));
      toast(`Moved Table ${sourceTable.no} complete order to Table ${targetTable.no}.`);
    }
    else if (modalTab === 'MoveItems') {
      // 2. Move selected items
      const selectedKeys = Object.keys(selectedItemsToMove);
      if (selectedKeys.length === 0) {
        toast('Please select at least one item to move.');
        return;
      }

      const sourceItems = orderItemsMap[sourceId] || [];
      const itemsToMove = [];
      const updatedSourceItems = [];

      sourceItems.forEach(item => {
        const moveQty = selectedItemsToMove[item.name];
        if (moveQty && moveQty > 0) {
          const qtyLeft = item.qty - moveQty;
          itemsToMove.push({ ...item, qty: moveQty });
          if (qtyLeft > 0) {
            updatedSourceItems.push({ ...item, qty: qtyLeft });
          }
        } else {
          updatedSourceItems.push(item);
        }
      });

      // Update target items list
      const targetItems = [...(orderItemsMap[targetId] || [])];
      itemsToMove.forEach(moveItem => {
        const existIdx = targetItems.findIndex(t => t.name === moveItem.name);
        if (existIdx !== -1) {
          targetItems[existIdx].qty += moveItem.qty;
        } else {
          targetItems.push(moveItem);
        }
      });

      setOrderItemsMap(prev => ({
        ...prev,
        [sourceId]: updatedSourceItems,
        [targetId]: targetItems
      }));

      // Calculate totals
      const sourceSum = updatedSourceItems.reduce((sum, r) => sum + (r.qty * r.rate), 0);
      const targetSum = targetItems.reduce((sum, r) => sum + (r.qty * r.rate), 0);

      setTables(prev => prev.map(t => {
        if (t.id === sourceId) {
          return {
            ...t,
            amount: sourceSum,
            status: sourceSum > 0 ? t.status : 'Blank',
            openedAt: sourceSum > 0 ? t.openedAt : null
          };
        }
        if (t.id === targetId) {
          return {
            ...t,
            status: 'Running',
            amount: targetSum,
            openedAt: t.openedAt || Date.now()
          };
        }
        return t;
      }));
      toast(`Transferred selected items to Table ${targetTable.no}.`);
    }
    else if (modalTab === 'Merge') {
      // 3. Merge complete orders
      const sourceItems = orderItemsMap[sourceId] || [];
      const targetItems = [...(orderItemsMap[targetId] || [])];

      sourceItems.forEach(srcItem => {
        const existIdx = targetItems.findIndex(t => t.name === srcItem.name);
        if (existIdx !== -1) {
          targetItems[existIdx].qty += srcItem.qty;
        } else {
          targetItems.push(srcItem);
        }
      });

      setOrderItemsMap(prev => ({
        ...prev,
        [sourceId]: [],
        [targetId]: targetItems
      }));

      const targetSum = targetItems.reduce((sum, r) => sum + (r.qty * r.rate), 0);

      setTables(prev => prev.map(t => {
        if (t.id === sourceId) {
          return { ...t, status: 'Blank', amount: 0, waiter: null, customer: 'Walk-in', openedAt: null };
        }
        if (t.id === targetId) {
          return {
            ...t,
            status: 'Running',
            amount: targetSum,
            openedAt: t.openedAt || sourceTable.openedAt || Date.now()
          };
        }
        return t;
      }));
      toast(`Merged Table ${sourceTable.no} into Table ${targetTable.no}.`);
    }
    else if (modalTab === 'Split') {
      // 4. Split Table
      const selectedKeys = Object.keys(selectedItemsToMove);
      if (selectedKeys.length === 0) {
        toast('Please select items to move to split table.');
        return;
      }

      const sourceItems = orderItemsMap[sourceId] || [];
      const splitItems = [];
      const updatedSourceItems = [];

      sourceItems.forEach(item => {
        const moveQty = selectedItemsToMove[item.name];
        if (moveQty && moveQty > 0) {
          const qtyLeft = item.qty - moveQty;
          splitItems.push({ ...item, qty: moveQty });
          if (qtyLeft > 0) {
            updatedSourceItems.push({ ...item, qty: qtyLeft });
          }
        } else {
          updatedSourceItems.push(item);
        }
      });

      setOrderItemsMap(prev => ({
        ...prev,
        [sourceId]: updatedSourceItems,
        [targetId]: splitItems
      }));

      const sourceSum = updatedSourceItems.reduce((sum, r) => sum + (r.qty * r.rate), 0);
      const targetSum = splitItems.reduce((sum, r) => sum + (r.qty * r.rate), 0);

      setTables(prev => prev.map(t => {
        if (t.id === sourceId) {
          return {
            ...t,
            seats: splitGuestsSource,
            amount: sourceSum,
            status: sourceSum > 0 ? t.status : 'Blank',
            openedAt: sourceSum > 0 ? t.openedAt : null
          };
        }
        if (t.id === targetId) {
          return {
            ...t,
            seats: splitGuestsTarget,
            status: 'Running',
            amount: targetSum,
            openedAt: Date.now()
          };
        }
        return t;
      }));
      toast(`Split Table ${sourceTable.no} with Table ${targetTable.no} successfully.`);
    }

    // Reset switch modal parameters
    setShowQuickSwitch(false);
    setSelectedItemsToMove({});
    setFromTableId('');
    setToTableId('');
  };

  const renderRestaurantView = () => {
    return (
      <div className="pos-table-grid">
        {filteredData.map(table => (
          <TableCard
            key={table.id}
            table={table}
            onClick={() => handleTableCardClick(table)}
            onView={(e) => {
              e.stopPropagation();
              handleView(table);
            }}
            onDelete={(e) => {
              e.stopPropagation();
              handleDeleteClick(table);
            }}
            onSave={(e) => {
              e.stopPropagation();
              handleSave(table);
            }}
            onDownload={(e) => {
              e.stopPropagation();
              handleDownload(table);
            }}
          />
        ))}

        {filteredData.length === 0 && (
          <div style={{ gridColumn: '1 / -1', padding: '80px 20px', textAlign: 'center', color: '#64748b', border: '1px dashed #cbd5e1', borderRadius: '12px', fontSize: '0.85rem' }}>
            No tables match the selected filter.
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ fontFamily: 'var(--font-family, system-ui)', background: '#fff', minHeight: '100%', display: 'flex', flexDirection: 'column' }}>

      {/* 1. Header Section */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        padding: '20px 24px',
        borderBottom: '1px solid #e2e8f0',
        background: '#fff'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Display Table
          </h1>
          <select
            value={activeRestaurant}
            onChange={(e) => setActiveRestaurant(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              background: '#fff',
              fontSize: '0.82rem',
              fontWeight: 700,
              color: '#475569',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value="Main Dining Room">Main Dining Room</option>
            <option value="Rooftop Deck">Rooftop Deck</option>
            <option value="Poolside Bar">Poolside Bar</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>

          {/* Direct POS Table Operations Center */}
          <button
            onClick={() => {
              setSelectedTableForOps(tables.find(t => t.status !== 'Blank') || tables[0]);
              setOpsTab('management');
              setShowOpsModal(true);
            }}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              background: '#fff',
              color: '#0e7490',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 120ms'
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
            onMouseLeave={e => e.currentTarget.style.background = '#fff'}
          >
            <FaExchangeAlt size={12} /> Table Operations
          </button>

          {/* Service switcher tabs */}
          <div style={{ display: 'flex', background: '#f1f5f9', padding: '3px', borderRadius: '10px', border: '1px solid #e2e8f0', gap: '2px' }}>
            {SERVICES.map(({ id, label }) => {
              const isSelected = service === id;
              return (
                <button
                  key={id}
                  onClick={() => handleServiceChange(id)}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 150ms ease-in-out',
                    background: isSelected ? '#0f172a' : 'transparent',
                    color: isSelected ? '#fff' : '#64748b',
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Search bar */}
          <div style={{ width: '220px' }}>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search table..."
              style={{
                width: '100%',
                padding: '8px 14px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.82rem',
                outline: 'none',
                background: '#fff',
                transition: 'border-color 150ms ease-in-out'
              }}
              onFocus={(e) => e.target.style.borderColor = '#94a3b8'}
              onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
            />
          </div>

          {/* Refresh Button */}
          <button
            onClick={() => {
              setTables(INITIAL_TABLES);
              setOrderItemsMap(INITIAL_MOCK_ORDER_DETAILS);
              toast('Table statuses and orders refreshed successfully.');
            }}
            title="Refresh Table Data"
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: 'none',
              background: '#0d9488', // Dark teal-green
              color: '#fff',
              fontSize: '0.95rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 120ms'
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#0f766e'}
            onMouseLeave={e => e.currentTarget.style.background = '#0d9488'}
          >
            <FaSync size={13} />
          </button>
        </div>
      </div>

      {/* 2. Status Filter Chips Bar */}
      {/* 2. Sub-Header Status Filter and Operations Bar */}
      <div style={{
        padding: '12px 24px',
        background: '#fff',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        {/* Restaurant selector button */}
        <button
          style={{
            background: '#0d9488', // Dark teal-green
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            padding: '8px 18px',
            fontSize: '0.82rem',
            fontWeight: 800,
            cursor: 'pointer',
            textTransform: 'uppercase'
          }}
        >
          RESTAURANT
        </button>

        {/* Move Kot / Items button */}
        <button
          onClick={() => {
            setSelectedTableForOps(tables.find(t => t.status !== 'Blank') || tables[0]);
            setOpsTab('management');
            setShowOpsModal(true);
          }}
          style={{
            background: '#2dd4bf', // Light teal button
            color: '#0f766e',
            border: 'none',
            borderRadius: '6px',
            padding: '8px 18px',
            fontSize: '0.82rem',
            fontWeight: 800,
            cursor: 'pointer'
          }}
        >
          Move Kot/Items
        </button>

        {/* Colored Radio Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: 'auto', flexWrap: 'wrap' }}>
          {/* All Tables */}
          <div
            onClick={() => setFilter('All')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              fontSize: '0.82rem',
              fontWeight: 700,
              userSelect: 'none',
              background: filter === 'All' ? '#0d9488' : '#f0fdfa',
              border: filter === 'All' ? '1px solid #0d9488' : '1px solid #ccfbf1',
              color: filter === 'All' ? '#ffffff' : '#0d9488',
              borderRadius: '6px',
              padding: '6px 12px',
              boxShadow: filter === 'All' ? '0 2px 6px rgba(13,148,136,0.2)' : 'none',
              transition: 'all 150ms ease-in-out'
            }}
            onMouseEnter={e => {
              if (filter !== 'All') {
                e.currentTarget.style.background = '#e6fffa';
              }
            }}
            onMouseLeave={e => {
              if (filter !== 'All') {
                e.currentTarget.style.background = '#f0fdfa';
              }
            }}
          >
            <div style={{
              width: '14px',
              height: '14px',
              borderRadius: '50%',
              border: `2px solid ${filter === 'All' ? '#ffffff' : '#0d9488'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#fff',
              transition: 'all 150ms'
            }}>
              {filter === 'All' && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#0d9488' }} />}
            </div>
            <span>All Tables</span>
          </div>

          {/* Blank Table */}
          <div
            onClick={() => setFilter('Blank')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              fontSize: '0.82rem',
              fontWeight: 700,
              userSelect: 'none',
              background: filter === 'Blank' ? '#ffffff' : '#f8fafc',
              border: filter === 'Blank' ? '2px solid #0f172a' : '1px solid #cbd5e1',
              color: filter === 'Blank' ? '#0f172a' : '#64748b',
              borderRadius: '6px',
              padding: filter === 'Blank' ? '5px 11px' : '6px 12px', // compensate for 2px border
              boxShadow: filter === 'Blank' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 150ms ease-in-out'
            }}
            onMouseEnter={e => {
              if (filter !== 'Blank') {
                e.currentTarget.style.background = '#f1f5f9';
              }
            }}
            onMouseLeave={e => {
              if (filter !== 'Blank') {
                e.currentTarget.style.background = '#f8fafc';
              }
            }}
          >
            <div style={{
              width: '14px',
              height: '14px',
              borderRadius: '50%',
              border: `2px solid ${filter === 'Blank' ? '#0f172a' : '#cbd5e1'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#fff',
              transition: 'all 150ms'
            }}>
              {filter === 'Blank' && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#0f172a' }} />}
            </div>
            <span>Blank Table</span>
          </div>

          {/* Running Table */}
          <div
            onClick={() => setFilter('Running')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              fontSize: '0.82rem',
              fontWeight: 700,
              userSelect: 'none',
              background: filter === 'Running' ? '#5fcb83' : '#e8f7ed', // Solid green or very soft green
              border: filter === 'Running' ? '1px solid #5fcb83' : '1px solid #bbf7d0',
              color: filter === 'Running' ? '#ffffff' : '#15803d',
              borderRadius: '6px',
              padding: '6px 12px',
              boxShadow: filter === 'Running' ? '0 2px 6px rgba(95,203,131,0.25)' : 'none',
              transition: 'all 150ms ease-in-out'
            }}
            onMouseEnter={e => {
              if (filter !== 'Running') {
                e.currentTarget.style.background = '#d1fae5';
              }
            }}
            onMouseLeave={e => {
              if (filter !== 'Running') {
                e.currentTarget.style.background = '#e8f7ed';
              }
            }}
          >
            <div style={{
              width: '14px',
              height: '14px',
              borderRadius: '50%',
              border: `2px solid ${filter === 'Running' ? '#ffffff' : '#5fcb83'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#fff',
              transition: 'all 150ms'
            }}>
              {filter === 'Running' && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#5fcb83' }} />}
            </div>
            <span>Running Table</span>
          </div>

          {/* Paid Table */}
          <div
            onClick={() => setFilter('Paid')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              fontSize: '0.82rem',
              fontWeight: 700,
              userSelect: 'none',
              background: filter === 'Paid' ? '#475569' : '#f1f5f9', // Solid dark grey or soft grey
              border: filter === 'Paid' ? '1px solid #475569' : '1px solid #cbd5e1',
              color: filter === 'Paid' ? '#ffffff' : '#475569',
              borderRadius: '6px',
              padding: '6px 12px',
              boxShadow: filter === 'Paid' ? '0 2px 6px rgba(71,85,105,0.25)' : 'none',
              transition: 'all 150ms ease-in-out'
            }}
            onMouseEnter={e => {
              if (filter !== 'Paid') {
                e.currentTarget.style.background = '#e2e8f0';
              }
            }}
            onMouseLeave={e => {
              if (filter !== 'Paid') {
                e.currentTarget.style.background = '#f1f5f9';
              }
            }}
          >
            <div style={{
              width: '14px',
              height: '14px',
              borderRadius: '50%',
              border: `2px solid ${filter === 'Paid' ? '#ffffff' : '#475569'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#fff',
              transition: 'all 150ms'
            }}>
              {filter === 'Paid' && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#475569' }} />}
            </div>
            <span>Paid Table</span>
          </div>
        </div>

        <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, marginLeft: '12px' }}>
          ({filteredData.length} found)
        </div>
      </div>

      {/* 3. Responsive Table Seating Grid / Main View Content */}
      <div style={{ flex: 1, background: '#fff' }}>
        {renderRestaurantView()}
      </div>

      {/* Table Operations Modal Overlay */}
      {showQuickSwitch && (
        <>
          {/* Overlay backdrop */}
          <div
            onClick={() => setShowQuickSwitch(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(15, 23, 42, 0.15)',
              backdropFilter: 'blur(1.5px)',
              zIndex: 999
            }}
          />

          {/* Modal Container */}
          <div
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: '#fff',
              borderRadius: '12px',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
              width: '460px',
              maxWidth: '95%',
              padding: '24px',
              zIndex: 1000,
              fontFamily: 'system-ui'
            }}
          >
            <h3 style={{ margin: '0 0 14px 0', fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
              Table Operations Center
            </h3>

            {/* Inner Operations tabs */}
            <div style={{ display: 'flex', gap: '4px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px', marginBottom: '14px', overflowX: 'auto', whiteSpace: 'nowrap' }}>
              {[
                { id: 'Move', label: 'Move / Swap' },
                { id: 'MoveItems', label: 'Move Items' },
                { id: 'Merge', label: 'Merge Tables' },
                { id: 'Split', label: 'Split Table' }
              ].map(tab => {
                const isSel = modalTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setModalTab(tab.id);
                      setSelectedItemsToMove({});
                    }}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      border: 'none',
                      cursor: 'pointer',
                      background: isSel ? '#0e7490' : 'transparent',
                      color: isSel ? '#fff' : '#64748b'
                    }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

              {/* Source table selector */}
              <div>
                <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>Source Table</span>
                <select
                  value={fromTableId}
                  onChange={(e) => {
                    setFromTableId(e.target.value);
                    setSelectedItemsToMove({});
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.8rem',
                    outline: 'none',
                    background: '#fff'
                  }}
                >
                  <option value="">Select source table...</option>
                  {tables.filter(t => t.status === 'Running' || t.status === 'Paid').map(t => (
                    <option key={t.id} value={t.id}>Table {t.no} (₹{t.amount})</option>
                  ))}
                </select>
              </div>

              {/* Dynamic item list mapping for MoveItems and Split */}
              {(modalTab === 'MoveItems' || modalTab === 'Split') && fromTableId && activeSourceItems.length > 0 && (
                <div>
                  <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px' }}>Select Items to Transfer</span>
                  <div style={{ maxHeight: '160px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '8px', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {activeSourceItems.map(item => {
                      const isChecked = !!selectedItemsToMove[item.name];
                      const currentVal = selectedItemsToMove[item.name] || 1;

                      return (
                        <div key={item.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600 }}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleItemCheckbox(item.name, item.qty)}
                            />
                            {item.name}
                          </label>
                          {isChecked && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <span style={{ color: '#64748b', fontSize: '0.7rem' }}>Qty:</span>
                              <select
                                value={currentVal}
                                onChange={(e) => setItemMoveQty(item.name, parseInt(e.target.value) || 1)}
                                style={{ padding: '2px 4px', border: '1px solid #cbd5e1', borderRadius: '4px', background: '#fff' }}
                              >
                                {[...Array(item.qty).keys()].map(x => (
                                  <option key={x + 1} value={x + 1}>{x + 1}</option>
                                ))}
                              </select>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Dynamic guest split inputs */}
              {modalTab === 'Split' && fromTableId && (
                <div style={{ display: 'flex', gap: '10px' }}>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Source Table Guests</span>
                    <input
                      type="number"
                      min="1"
                      value={splitGuestsSource}
                      onChange={(e) => setSplitGuestsSource(parseInt(e.target.value) || 1)}
                      style={{ width: '100%', padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.8rem' }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Split Table Guests</span>
                    <input
                      type="number"
                      min="1"
                      value={splitGuestsTarget}
                      onChange={(e) => setSplitGuestsTarget(parseInt(e.target.value) || 1)}
                      style={{ width: '100%', padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.8rem' }}
                    />
                  </div>
                </div>
              )}

              {/* Operation type toggle inside Move / Swap tab */}
              {modalTab === 'Move' && (
                <div>
                  <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>Action</span>
                  <select
                    value={transferOp}
                    onChange={(e) => setTransferOp(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      color: '#475569',
                      background: '#fff',
                      outline: 'none'
                    }}
                  >
                    <option value="Move">Move Complete Order</option>
                    <option value="Swap">Swap Orders & Statuses</option>
                  </select>
                </div>
              )}

              {/* Target table selector */}
              <div>
                <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                  {modalTab === 'Merge' ? 'Merge Into Table (Target)' : 'Target Table'}
                </span>
                <select
                  value={toTableId}
                  onChange={(e) => setToTableId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.8rem',
                    outline: 'none',
                    background: '#fff'
                  }}
                >
                  <option value="">Select target table...</option>
                  {tables
                    .filter(t => t.id !== parseInt(fromTableId))
                    .map(t => (
                      <option key={t.id} value={t.id}>Table {t.no} ({t.status})</option>
                    ))}
                </select>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  onClick={() => setShowQuickSwitch(false)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    background: '#fff',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={executeOperations}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '6px',
                    border: 'none',
                    background: '#0e7490',
                    color: '#fff',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  Confirm Transfer
                </button>
              </div>

            </div>
          </div>
        </>
      )}

      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setTableToDelete(null);
        }}
        onConfirm={confirmDeleteTable}
        itemName={tableToDelete ? `Table ${tableToDelete.no}` : ''}
        message={tableToDelete ? `Are you sure you want to clear/reset Table ${tableToDelete.no}? This will clear its active order items.` : ''}
      />

      {/* Styled responsive helper classes */}
      <style>{`
        .pos-table-grid {
          display: grid;
          gap: 28px 20px;
          padding: 24px;
        }
        @media (min-width: 1024px) {
          .pos-table-grid {
            grid-template-columns: repeat(5, 1fr);
          }
        }
        @media (min-width: 768px) and (max-width: 1023px) {
          .pos-table-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }
        @media (min-width: 550px) and (max-width: 767px) {
          .pos-table-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        @media (max-width: 549px) {
          .pos-table-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
};

export default DisplayTablePage;
