import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  FaSearch,
  FaUndo,
  FaExchangeAlt,
  FaCalendarAlt
} from 'react-icons/fa';

import TableCard from '../components/TableCard';
import TableOperationsModal from '../components/TableOperationsModal';
import DeleteConfirmationModal from '../../../components/common/DeleteConfirmationModal';
import BookTableModal from '../components/BookTableModal';
import CommonModal from '../../../components/common/CommonModal';

import { useTableOperations } from '../hooks/useTableOperations';
import { SERVICES } from '../constants/mockData';

const DisplayTablePage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Use modular table operations hook
  const {
    tables,
    setTables,
    orderItemsMap,
    setOrderItemsMap,
    showQuickSwitch,
    setShowQuickSwitch,
    modalTab,
    setModalTab,
    transferOp,
    setTransferOp,
    fromTableId,
    setFromTableId,
    toTableId,
    setToTableId,
    selectedTransferItems,
    setSelectedTransferItems,
    selectedTransferKots,
    setSelectedTransferKots,
    equalSplitCount,
    setEqualSplitCount,
    splitPercentSource,
    setSplitPercentSource,
    discountPercent,
    setDiscountPercent,
    paymentMethod,
    setPaymentMethod,
    splitCash,
    setSplitCash,
    splitCard,
    setSplitCard,
    splitUPI,
    setSplitUPI,
    newItemName,
    setNewItemName,
    newItemQty,
    setNewItemQty,
    newItemRemarks,
    setNewItemRemarks,
    selectedGuests,
    setSelectedGuests,
    selectedWaiter,
    setSelectedWaiter,
    selectedCaptain,
    setSelectedCaptain,
    activeSourceItems,
    showSettleSuccess,
    toast,
    updateTableField,
    updateTableStatus,
    toggleHoldOrder,
    cancelCompleteOrder,
    handleAddItemToOps,
    handleUpdateItemQty,
    handleToggleItemComplimentary,
    handleDeleteItem,
    handleCreateKOT,
    handleCancelKOT,
    executePaymentSettlement,
    getBillingSummary,
    handleModalOkClick
  } = useTableOperations(location, navigate);

  const [filter, setFilter] = useState('All');
  const [service, setService] = useState('Restaurant');
  const [search, setSearch] = useState('');
  const [activeRestaurant, setActiveRestaurant] = useState('Main Dining Room');

  // Delete confirmation modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [tableToDelete, setTableToDelete] = useState(null);

  // Book Table modal state and handlers
  const [bookModalOpen, setBookModalOpen] = useState(false);

  // Booking flow states
  const [showSelectTableDialog, setShowSelectTableDialog] = useState(false);
  const [isBookingMode, setIsBookingMode] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsBookingMode(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Add Table modal state
  const [addTableModalOpen, setAddTableModalOpen] = useState(false);
  const [newTableNo, setNewTableNo] = useState('');
  const [newTableSeats, setNewTableSeats] = useState(4);
  const [newTableFloor, setNewTableFloor] = useState('Ground');
  const [newTableSection, setNewTableSection] = useState('Main Area');
  const [newTableError, setNewTableError] = useState('');

  const handleBookTable = (bookingData) => {
    const { tableId, customerName, guestsCount, waiter, captain } = bookingData;

    setTables(prev => prev.map(t => {
      if (t.id === tableId) {
        return {
          ...t,
          status: 'Reserved',
          customer: customerName,
          seats: guestsCount,
          waiter,
          captain,
          openedAt: t.openedAt || Date.now()
        };
      }
      return t;
    }));

    toast(`Table reserved successfully for ${customerName}!`);
    setService('Reserved');
  };

  // Card triggers & routing
  const handleTableCardClick = (table) => {
    if (isBookingMode) {
      if (table.status !== 'Blank') {
        toast("Please select a Blank table for booking!");
        return;
      }
      setIsBookingMode(false);
      navigate('/restaurant/pos-billing', {
        state: {
          tableId: table.id,
          tableNumber: `T${table.no}`,
          isNewBooking: true
        }
      });
    } else {
      const rows = orderItemsMap[table.id] || [];
      navigate('/restaurant/pos-billing', { state: { table, orderRows: rows } });
    }
  };

  const handleView = (table) => {
    navigate('/restaurant/view-kot', { state: { table } });
  };

  const handleDownload = (table) => {
    const rows = orderItemsMap[table.id] || [];
    navigate('/restaurant/pos-billing', { state: { table, orderRows: rows, autoSettle: true } });
  };

  const handleDeleteClick = (table) => {
    setTableToDelete(table);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (tableToDelete) {
      setTables(prev => prev.map(t => {
        if (t.id === tableToDelete.id) {
          return { ...t, status: 'Blank', amount: 0, waiter: null, captain: null, customer: 'Walk-in', openedAt: null, isHold: false, kots: [], kotCount: 0 };
        }
        return t;
      }));
      setOrderItemsMap(prev => ({
        ...prev,
        [tableToDelete.id]: []
      }));
      toast(`Table T${tableToDelete.no} reset to Blank.`);
    }
    setDeleteModalOpen(false);
    setTableToDelete(null);
  };

  const handleAddNewTable = () => {
    setNewTableNo('');
    setNewTableSeats(4);
    setNewTableFloor('Ground');
    setNewTableSection('Main Area');
    setNewTableError('');
    setAddTableModalOpen(true);
  };

  const handleSaveNewTable = (e) => {
    e.preventDefault();
    if (!newTableNo.trim()) {
      setNewTableError("Table number is required!");
      return;
    }

    const tableNum = parseInt(newTableNo);
    if (isNaN(tableNum) || tableNum <= 0) {
      setNewTableError("Please enter a valid positive table number!");
      return;
    }

    // Check if table number already exists
    const exists = tables.some(t => parseInt(t.no) === tableNum);
    if (exists) {
      setNewTableError(`Table T${String(tableNum).padStart(2, '0')} already exists!`);
      return;
    }

    const newTable = {
      id: tables.length + 1,
      no: String(tableNum).padStart(2, '0'),
      seats: parseInt(newTableSeats) || 4,
      status: 'Blank',
      amount: 0,
      waiter: null,
      customer: 'Walk-in',
      floor: newTableFloor,
      section: newTableSection,
      kots: [],
      kotCount: 0
    };

    setTables(prev => [...prev, newTable]);
    setOrderItemsMap(prev => ({
      ...prev,
      [newTable.id]: []
    }));

    toast(`Table T${newTable.no} added successfully!`);
    setAddTableModalOpen(false);
  };

  // Sections and filters
  const SECTIONS = ['All', 'Ground', 'First', 'Balcony', 'Garden'];
  const STATUS_FILTERS = ['All', 'Blank', 'Running', 'Reserved', 'Paid', 'Cleaning'];

  const filteredData = tables.filter(t => {
    const matchesSearch = t.no.includes(search) || (t.waiter && t.waiter.toLowerCase().includes(search.toLowerCase()));
    const matchesSection = filter === 'All' || t.floor === filter || t.section === filter;

    // Status category filters
    let matchesStatus = true;
    if (service === 'All') {
      matchesStatus = true;
    } else {
      if (service === 'Blank') matchesStatus = t.status === 'Blank';
      else if (service === 'Running') matchesStatus = (t.status !== 'Blank' && t.status !== 'Paid' && t.status !== 'Cleaning' && t.status !== 'Reserved');
      else if (service === 'Reserved') matchesStatus = t.status === 'Reserved';
      else if (service === 'Paid') matchesStatus = t.status === 'Paid';
      else if (service === 'Cleaning') matchesStatus = t.status === 'Cleaning';
    }

    return matchesSearch && matchesSection && matchesStatus;
  });

  return (
    <div style={{ fontFamily: 'var(--font-family, system-ui)', background: '#fff', minHeight: '100%', display: 'flex', flexDirection: 'column' }}>

      {/* Booking Mode Instruction Banner */}
      {isBookingMode && (
        <div style={{
          background: '#ea580c', color: '#fff', padding: '14px 24px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 'bold', fontSize: '0.9rem',
          boxShadow: '0 4px 12px rgba(234, 88, 12, 0.2)', borderBottom: '2px solid #c2410c', zIndex: 99
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#fff', animation: 'pulse 1.5s infinite', display: 'inline-block' }} />
            Select a Blank Table to Start Booking
          </span>
          <button 
            onClick={() => setIsBookingMode(false)}
            style={{ background: '#fff', color: '#ea580c', border: 'none', padding: '6px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 800, fontSize: '0.75rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
          >
            Cancel (ESC)
          </button>
        </div>
      )}

      {/* 1. Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', padding: '20px 24px', borderBottom: '1px solid #e2e8f0', background: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Display Table</h1>
          <select
            value={activeRestaurant}
            onChange={(e) => setActiveRestaurant(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '0.85rem', fontWeight: 700, color: '#475569', outline: 'none' }}
          >
            <option value="Main Dining Room">Main Dining Room</option>
            <option value="Rooftop Grill">Rooftop Grill</option>
            <option value="Poolside Cafe">Poolside Cafe</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Table Operations Center */}
          <button
            onClick={() => {
              const activeT = tables.find(t => t.status !== 'Blank') || tables[0];
              setFromTableId(String(activeT.id));
              setToTableId('');
              setModalTab('status');
              setShowQuickSwitch(true);
            }}
            style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', color: '#0e7490', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 120ms' }}
            onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
            onMouseLeave={e => e.currentTarget.style.background = '#fff'}
          >
            <FaExchangeAlt size={12} /> Table Operations
          </button>

          {/* Book Table Button */}
          <button
            onClick={() => setShowSelectTableDialog(true)}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
              color: '#fff',
              fontSize: '0.82rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 4px 10px rgba(249, 115, 22, 0.3)',
              transition: 'all 150ms ease-in-out',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 6px 14px rgba(249, 115, 22, 0.45)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = '0 4px 10px rgba(249, 115, 22, 0.3)';
            }}
          >
            <FaCalendarAlt size={12} /> Book Table
          </button>

          {/* Add Table Button */}
          <button
            onClick={handleAddNewTable}
            style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #10b981', background: '#10b981', color: '#fff', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', transition: 'all 120ms' }}
            onMouseEnter={e => e.currentTarget.style.background = '#059669'}
            onMouseLeave={e => e.currentTarget.style.background = '#10b981'}
          >
            + Add Table
          </button>

          {/* Service switcher tabs */}
          <div style={{ display: 'flex', background: '#f1f5f9', padding: '3px', borderRadius: '10px', border: '1px solid #e2e8f0', gap: '2px' }}>
            {SERVICES.map(({ id, label }) => {
              const isSelected = service === id;
              return (
                <button
                  key={id}
                  onClick={() => setService(id)}
                  style={{ padding: '8px 18px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, border: 'none', cursor: 'pointer', transition: 'all 150ms ease-in-out', background: isSelected ? '#0f172a' : 'transparent', color: isSelected ? '#fff' : '#64748b' }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Quick Filters, Status Filters and Search */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', padding: '16px 24px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          {/* Status Filter Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status:-</span>
            <select
              value={service}
              onChange={(e) => setService(e.target.value)}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: '#fff',
                fontSize: '0.8rem',
                fontWeight: 700,
                color: '#1e293b',
                outline: 'none',
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                transition: 'border-color 150ms'
              }}
            >
              {STATUS_FILTERS.map(st => (
                <option key={st} value={st}>
                  {st === 'All' ? 'All Statuses' : st}
                </option>
              ))}
            </select>
          </div>

          <div style={{ height: '20px', width: '1px', background: '#cbd5e1' }} />

          {/* Section tabs */}
          <div style={{ display: 'flex', gap: '4px' }}>
            {SECTIONS.map(sec => {
              const isSel = filter === sec;
              return (
                <button
                  key={sec}
                  onClick={() => setFilter(sec)}
                  style={{ padding: '6px 14px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700, border: isSel ? '1px solid #0f172a' : '1px solid #cbd5e1', background: isSel ? '#0f172a' : '#fff', color: isSel ? '#fff' : '#475569', cursor: 'pointer', transition: 'all 120ms' }}
                >
                  {sec}
                </button>
              );
            })}
          </div>

          {/* Move Kot / Items button */}
          <button
            onClick={() => {
              const activeT = tables.find(t => t.status !== 'Blank') || tables[0];
              setFromTableId(String(activeT.id));
              setToTableId('');
              setModalTab('MoveKOT');
              setShowQuickSwitch(true);
            }}
            style={{ background: '#2dd4bf', color: '#0f766e', border: 'none', borderRadius: '6px', padding: '8px 18px', fontSize: '0.82rem', fontWeight: 800, cursor: 'pointer' }}
          >
            Move Kot/Items
          </button>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {/* Search box */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <FaSearch style={{ position: 'absolute', left: '10px', color: '#94a3b8', fontSize: '0.85rem' }} />
            <input
              type="text"
              placeholder="Search table/waiter..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '220px', padding: '8px 12px 8px 30px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.8rem', outline: 'none', transition: 'border-color 150ms' }}
            />
          </div>

          <button
            onClick={() => {
              setSearch('');
              setFilter('All');
              setService('Restaurant');
            }}
            style={{ padding: '8px 12px', border: '1px solid #cbd5e1', background: '#fff', borderRadius: '8px', cursor: 'pointer', color: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <FaUndo size={11} /> Reset
          </button>
        </div>
      </div>

      {/* 3. Main Tables grid */}
      <div className="pos-table-grid" style={{ flex: 1, padding: '24px' }}>
        {filteredData.map(table => {
          const isBlank = table.status === 'Blank';
          const isHighlighted = isBookingMode && isBlank;
          const isFaded = isBookingMode && !isBlank;
          return (
            <div key={table.id} style={{
              position: 'relative',
              borderRadius: '8px',
              border: isHighlighted ? '3px solid #ea580c' : 'none',
              boxShadow: isHighlighted ? '0 0 15px rgba(234, 88, 12, 0.8)' : 'none',
              transform: isHighlighted ? 'scale(1.02)' : 'none',
              opacity: isFaded ? 0.4 : 1,
              pointerEvents: isFaded ? 'none' : 'auto',
              transition: 'all 0.2s ease-in-out'
            }}>
              <TableCard
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
                  const items = orderItemsMap[table.id] || [];
                  if (items.length === 0) return toast("No items to generate KOT.");
                  const newKotId = `KOT-${Math.floor(100 + Math.random() * 900)}`;
                  const newKot = {
                    id: newKotId,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    items: items.map(it => ({ name: it.name, qty: it.qty }))
                  };
                  setTables(prev => prev.map(t => {
                    if (t.id === table.id) {
                      const nextKots = [...(t.kots || []), newKot];
                      return { ...t, kots: nextKots, kotCount: nextKots.length, status: 'KOT Generated' };
                    }
                    return t;
                  }));
                  toast(`KOT generated: ${newKotId}`);
                }}
                onDownload={(e) => {
                  e.stopPropagation();
                  handleDownload(table);
                }}
                onOpenOps={(e) => {
                  e.stopPropagation();
                  setFromTableId(String(table.id));
                  setToTableId('');
                  setSelectedGuests(table.seats || 4);
                  setSelectedWaiter(table.waiter || '');
                  setSelectedCaptain(table.captain || '');
                  setModalTab('status');
                  setDiscountPercent(0);
                  setPaymentMethod('Cash');
                  setSplitCash('');
                  setSplitCard('');
                  setSplitUPI('');
                  setSelectedTransferItems({});
                  setSelectedTransferKots({});
                  setShowQuickSwitch(true);
                }}
              />
            </div>
          );
        })}

        {filteredData.length === 0 && (
          <div style={{ gridColumn: '1 / -1', padding: '80px 20px', textAlign: 'center', color: '#64748b', border: '1px dashed #cbd5e1', borderRadius: '12px', fontSize: '0.85rem' }}>
            No tables match the selected filter.
          </div>
        )}
      </div>

      {/* 4. Operations modal wrapper */}
      <TableOperationsModal
        isOpen={showQuickSwitch}
        onClose={() => setShowQuickSwitch(false)}
        tables={tables}
        modalTab={modalTab}
        setModalTab={setModalTab}
        fromTableId={fromTableId}
        setFromTableId={setFromTableId}
        toTableId={toTableId}
        setToTableId={setToTableId}
        transferOp={transferOp}
        setTransferOp={setTransferOp}
        selectedTransferItems={selectedTransferItems}
        setSelectedTransferItems={setSelectedTransferItems}
        selectedTransferKots={selectedTransferKots}
        setSelectedTransferKots={setSelectedTransferKots}
        equalSplitCount={equalSplitCount}
        setEqualSplitCount={setEqualSplitCount}
        splitPercentSource={splitPercentSource}
        setSplitPercentSource={setSplitPercentSource}
        discountPercent={discountPercent}
        setDiscountPercent={setDiscountPercent}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        splitCash={splitCash}
        setSplitCash={setSplitCash}
        splitCard={splitCard}
        setSplitCard={setSplitCard}
        splitUPI={splitUPI}
        setSplitUPI={setSplitUPI}
        newItemName={newItemName}
        setNewItemName={setNewItemName}
        newItemQty={newItemQty}
        setNewItemQty={setNewItemQty}
        newItemRemarks={newItemRemarks}
        setNewItemRemarks={setNewItemRemarks}
        selectedGuests={selectedGuests}
        setSelectedGuests={setSelectedGuests}
        selectedWaiter={selectedWaiter}
        setSelectedWaiter={setSelectedWaiter}
        selectedCaptain={selectedCaptain}
        setSelectedCaptain={setSelectedCaptain}
        activeSourceItems={activeSourceItems}
        showSettleSuccess={showSettleSuccess}
        updateTableField={updateTableField}
        updateTableStatus={updateTableStatus}
        toggleHoldOrder={toggleHoldOrder}
        cancelCompleteOrder={cancelCompleteOrder}
        handleAddItemToOps={handleAddItemToOps}
        handleUpdateItemQty={handleUpdateItemQty}
        handleToggleItemComplimentary={handleToggleItemComplimentary}
        handleDeleteItem={handleDeleteItem}
        handleCreateKOT={handleCreateKOT}
        handleCancelKOT={handleCancelKOT}
        executePaymentSettlement={executePaymentSettlement}
        getBillingSummary={getBillingSummary}
        handleModalOkClick={handleModalOkClick}
      />

      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setTableToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Reset Table"
        message={`Are you sure you want to clear all data and reset Table T${tableToDelete?.no} to Blank?`}
      />

      <BookTableModal
        isOpen={bookModalOpen}
        onClose={() => setBookModalOpen(false)}
        tables={tables}
        onBook={handleBookTable}
      />

      {/* Select Table First Dialog */}
      {showSelectTableDialog && (
        <>
          <div onClick={() => setShowSelectTableDialog(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.3)', backdropFilter: 'blur(2px)', zIndex: 9999 }} />
          <div style={{
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
            background: '#fff', padding: '28px 24px', borderRadius: '12px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.15)',
            width: '380px', zIndex: 10000, textAlign: 'center', fontFamily: 'system-ui', border: '1px solid #e2e8f0'
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#ea580c', margin: '0 0 8px 0' }}>Select a Table First</h3>
            <p style={{ fontSize: '0.88rem', color: '#475569', margin: '0 0 24px 0', lineHeight: '1.5' }}>
              Please select an available table to continue booking.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button 
                onClick={() => {
                  setShowSelectTableDialog(false);
                  setIsBookingMode(true);
                }}
                style={{ padding: '10px 22px', borderRadius: '8px', border: 'none', background: '#ea580c', color: '#fff', fontWeight: '800', fontSize: '0.82rem', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(234, 88, 12, 0.2)' }}
              >
                Select Table
              </button>
              <button 
                onClick={() => setShowSelectTableDialog(false)}
                style={{ padding: '10px 22px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', color: '#64748b', fontWeight: '800', fontSize: '0.82rem', cursor: 'pointer' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}

      <CommonModal
        isOpen={addTableModalOpen}
        onClose={() => setAddTableModalOpen(false)}
        title="Add New Dining Table"
        maxWidth="480px"
      >
        <form onSubmit={handleSaveNewTable} style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '8px 4px' }}>
          {newTableError && (
            <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', color: '#b91c1c', padding: '8px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '700' }}>
              {newTableError}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '11px', fontWeight: '800', color: '#334155', textTransform: 'uppercase' }}>Table Number</label>
            <input
              type="text"
              placeholder="e.g. 13"
              value={newTableNo}
              onChange={e => {
                setNewTableNo(e.target.value);
                setNewTableError('');
              }}
              style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: '700', outline: 'none' }}
              required
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '11px', fontWeight: '800', color: '#334155', textTransform: 'uppercase' }}>Seat Capacity (Pax)</label>
            <input
              type="number"
              min="1"
              max="20"
              value={newTableSeats}
              onChange={e => setNewTableSeats(parseInt(e.target.value) || 4)}
              style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: '700', outline: 'none' }}
              required
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '11px', fontWeight: '800', color: '#334155', textTransform: 'uppercase' }}>Floor Location</label>
            <select
              value={newTableFloor}
              onChange={e => setNewTableFloor(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: '700', outline: 'none' }}
            >
              <option value="Ground">Ground Floor</option>
              <option value="First">First Floor</option>
              <option value="Second">Second Floor</option>
              <option value="Rooftop">Rooftop Area</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '11px', fontWeight: '800', color: '#334155', textTransform: 'uppercase' }}>Dining Section</label>
            <select
              value={newTableSection}
              onChange={e => setNewTableSection(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: '700', outline: 'none' }}
            >
              <option value="Main Area">Main Dining Area</option>
              <option value="Balcony">Balcony View</option>
              <option value="Garden">Garden Cafe</option>
              <option value="Poolside">Poolside Deck</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '10px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={() => setAddTableModalOpen(false)}
              style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', color: '#475569', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{ padding: '8px 18px', borderRadius: '6px', border: 'none', background: '#10b981', color: '#fff', fontSize: '12px', fontWeight: '800', cursor: 'pointer' }}
            >
              Save Table
            </button>
          </div>
        </form>
      </CommonModal>

      {/* Global CSS Layout styles */}
      <style>{`
        .pos-table-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
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
