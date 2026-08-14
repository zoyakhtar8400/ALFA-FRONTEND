import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaArrowLeft, FaSearch, FaUndo, FaEye, FaEdit, FaSort, FaSortUp, FaSortDown, FaPlus, FaTimes } from 'react-icons/fa';
import { reservationService } from '../../../services/reservationService';
import { useRestaurant } from '../../../context/RestaurantContext';

const STATUS_COLORS = {
  Running:        { bg: '#fef3c7', color: '#b45309' },
  'KOT Generated':{ bg: '#fef3c7', color: '#b45309' },
  Paid:           { bg: '#dcfce7', color: '#16a34a' },
  'Bill Generated':{ bg: '#dcfce7', color: '#16a34a' },
  Reserved:       { bg: '#ffedd5', color: '#ea580c' },
  Cancelled:      { bg: '#fee2e2', color: '#dc2626' },
  Blank:          { bg: '#f1f5f9', color: '#64748b' },
  Cleaning:       { bg: '#f1f5f9', color: '#64748b' },
};

const PAGE_SIZE = 10;

// Safe Date and Time formatters preventing 'Invalid Date'
function formatBookingDate(r) {
  const val = r.booking_date || r.bookingDate || r.check_in || r.checkIn || r.created_at || r.createdAt;
  if (!val) return new Date().toLocaleDateString('en-IN');

  const str = String(val).trim();
  // Pure time string like "12:05:36", return today's date
  if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(str)) {
    return new Date().toLocaleDateString('en-IN');
  }

  // Attempt standard date parsing
  const d = new Date(val);
  if (!isNaN(d.getTime())) {
    return d.toLocaleDateString('en-IN');
  }
  return new Date().toLocaleDateString('en-IN');
}

function formatBookingTime(r) {
  const val = r.check_in || r.checkIn || r.booking_time || r.bookingTime || r.created_at || r.createdAt;
  if (!val) return '—';

  const str = String(val).trim();
  // Pure time string: "12:05:36" or "12:05"
  if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(str)) {
    const parts = str.split(':');
    let hours = parseInt(parts[0], 10);
    const minutes = parts[1];
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
  }

  const d = new Date(val);
  if (!isNaN(d.getTime())) {
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  }
  return str || '—';
}

const BookingListPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { tables } = useRestaurant();

  // Use a ref so loadBookings has access to latest tables without being recreated on every poll
  const tablesRef = React.useRef(tables);
  useEffect(() => { tablesRef.current = tables; }, [tables]);

  const [allBookings, setAllBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortField, setSortField] = useState('id');
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(1);

  // Add Booking modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ tableId: '', customerName: '', phone: '', persons: 2, occasion: '', checkIn: '' });
  const [addError, setAddError] = useState('');
  const [saving, setSaving] = useState(false);

  // Load bookings: active tables from context + reservations from backend
  const loadBookings = useCallback(async () => {
    try {
      setLoadingBookings(true);

      // Build active table rows from the already-fetched tables context (always available)
      const currentTables = tablesRef.current || [];
      const tableRows = currentTables
        .filter(t => {
          const s = (t.status || '').toUpperCase();
          const c = (t.color || '').toLowerCase();
          return s !== 'AVAILABLE' && s !== 'BLANK' && c !== 'white' && c !== '';
        })
        .map(t => ({
          id: `tbl-${t.id}`,
          bookingNo: `T-${String(t.no).padStart(2, '0')}`,
          tableId: t.id,
          tableNo: String(t.no || t.id),
          tableName: t.table_name || `Table ${t.no}`,
          customer: t.customer || 'Walk-in',
          phone: '—',
          persons: t.seats || 2,
          occasion: '',
          date: t.openedAt ? new Date(t.openedAt).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN'),
          time: t.openedAt ? new Date(t.openedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—',
          status: (() => {
            const s = (t.status || '').toUpperCase();
            if (s === 'KOT_CUT' || s === 'ORDERED') return 'KOT Generated';
            if (s === 'PAYMENT_COMPLETED') return 'Paid';
            return t.status || 'Running';
          })(),
          waiter: t.waiter || '—',
          amount: t.amount || 0,
          isTableRow: true,
        }));

      // Try to also fetch reservations from backend
      let reservationRows = [];
      try {
        const res = await reservationService.getReservations();
        const raw = res?.reservations || res?.data || (Array.isArray(res) ? res : []);
        if (Array.isArray(raw) && raw.length > 0) {
          reservationRows = raw.map(r => ({
            id: r.id,
            bookingNo: r.reservation_id || r.reservationId || `RES-${r.id}`,
            tableId: r.table_id || r.tableId,
            tableNo: String(r.table_name || r.tableName || r.table_id || '').replace(/[^0-9]/g, '') || String(r.table_id || r.tableId || ''),
            tableName: r.table_name || r.tableName || `Table ${r.table_id || r.tableId}`,
            customer: r.name || r.customerName || 'Walk-in',
            phone: r.phone || '—',
            persons: r.persons || 1,
            occasion: r.occasion || '',
            checkIn: r.check_in || r.checkIn || null,
            checkOut: r.check_out || r.checkOut || null,
            date: formatBookingDate(r),
            time: formatBookingTime(r),
            status: r.status || 'Reserved',
            waiter: '—',
            amount: 0,
          }));
        }
      } catch (resErr) {
        // Reservation API not yet available — that's fine, we show table rows
        console.warn('Reservation API unavailable (may need backend restart):', resErr.message);
      }

      // Merge: reservations first, then table rows (dedup by tableId)
      const usedTableIds = new Set(reservationRows.map(r => String(r.tableId)));
      const filteredTableRows = tableRows.filter(r => !usedTableIds.has(String(r.tableId)));
      setAllBookings([...reservationRows, ...filteredTableRows]);
    } finally {
      setLoadingBookings(false);
    }
  }, []); // stable — uses tablesRef for table data

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);


  // Cancel a reservation
  const handleCancel = async (booking) => {
    if (!booking.id || booking.bookingNo?.startsWith('TBL-')) return;
    try {
      await reservationService.patchReservation(booking.id, { status: 'Cancelled' });
      setAllBookings(prev => prev.map(b => b.id === booking.id ? { ...b, status: 'Cancelled' } : b));
    } catch (err) {
      console.error('Error cancelling reservation:', err);
    }
  };

  // Save new booking
  const handleAddSave = async () => {
    if (!addForm.tableId) return setAddError('Please select a table.');
    if (!addForm.customerName) return setAddError('Customer name is required.');
    setSaving(true);
    setAddError('');
    try {
      const selectedTable = tables.find(t => String(t.id) === String(addForm.tableId));
      await reservationService.createReservation({
        tableId: Number(addForm.tableId),
        tableName: selectedTable?.table_name || `Table ${addForm.tableId}`,
        tableNo: selectedTable?.no || addForm.tableId,
        customerName: addForm.customerName,
        phone: addForm.phone,
        persons: Number(addForm.persons || 2),
        occasion: addForm.occasion,
        checkIn: addForm.checkIn || null,
        status: 'Reserved'
      });
      setShowAddModal(false);
      setAddForm({ tableId: '', customerName: '', phone: '', persons: 2, occasion: '', checkIn: '' });
      await loadBookings();
    } catch (err) {
      setAddError(err.message || 'Failed to create reservation');
    } finally {
      setSaving(false);
    }
  };

  const statuses = useMemo(() => ['All', ...new Set(allBookings.map(b => b.status))], [allBookings]);

  const filtered = useMemo(() => {
    let data = allBookings;
    if (statusFilter !== 'All') data = data.filter(b => b.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(b =>
        b.bookingNo.toLowerCase().includes(q) ||
        b.customer.toLowerCase().includes(q) ||
        b.phone.includes(q) ||
        b.tableNo.includes(q)
      );
    }
    data = [...data].sort((a, b) => {
      let av = a[sortField] ?? '';
      let bv = b[sortField] ?? '';
      if (sortField === 'amount') { av = Number(av); bv = Number(bv); }
      else { av = String(av).toLowerCase(); bv = String(bv).toLowerCase(); }
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return data;
  }, [allBookings, search, statusFilter, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageData = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSort = useCallback((field) => {
    setSortField(prev => {
      if (prev === field) { setSortDir(d => d === 'asc' ? 'desc' : 'asc'); return field; }
      setSortDir('asc');
      return field;
    });
    setPage(1);
  }, []);

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <FaSort size={10} style={{ opacity: 0.4 }} />;
    return sortDir === 'asc' ? <FaSortUp size={10} /> : <FaSortDown size={10} />;
  };

  const handleBack = () => {
    if (location.state?.fromPOS) {
      navigate('/restaurant/pos-billing', { state: location.state });
    } else {
      navigate(-1);
    }
  };

  const handleView = () => {
    navigate('/restaurant/view-kot');
  };

  const handleEdit = (booking) => {
    const table = tables.find(t => t.id === booking.tableId);
    if (table) navigate('/restaurant/pos-billing', { state: { table } });
  };

  const thStyle = (field) => ({
    padding: '10px 12px', textAlign: 'left', fontSize: '0.72rem', fontWeight: 800,
    textTransform: 'uppercase', letterSpacing: '0.5px', color: '#fff',
    cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap',
    background: sortField === field ? '#0c6280' : 'transparent',
  });

  return (
    <div style={{ minHeight: '100%', background: '#f8fafc', display: 'flex', flexDirection: 'column', fontFamily: 'system-ui' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 24px', background: '#fff', borderBottom: '1px solid #e2e8f0', flexWrap: 'wrap' }}>
        <button
          onClick={handleBack}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', color: '#475569', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}
          onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
          onMouseLeave={e => e.currentTarget.style.background = '#fff'}
        >
          <FaArrowLeft size={12} /> Back
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 900, color: '#0f172a' }}>Booking List</h1>
          <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>
            {loadingBookings ? 'Loading from database...' : `${filtered.length} record${filtered.length !== 1 ? 's' : ''} found`}
          </p>
        </div>
        <button
          onClick={() => { setShowAddModal(true); setAddError(''); }}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 18px', borderRadius: '8px', border: 'none', background: '#0e7490', color: '#fff', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}
          onMouseEnter={e => e.currentTarget.style.background = '#0c6280'}
          onMouseLeave={e => e.currentTarget.style.background = '#0e7490'}
        >
          <FaPlus size={11} /> New Booking
        </button>
        <button
          onClick={loadBookings}
          title="Refresh from database"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', color: '#475569', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}
          onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
          onMouseLeave={e => e.currentTarget.style.background = '#fff'}
        >
          <FaUndo size={11} />
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 24px', background: '#fff', borderBottom: '1px solid #f1f5f9', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <FaSearch style={{ position: 'absolute', left: '10px', color: '#94a3b8', fontSize: '0.8rem' }} />
          <input
            type="text"
            placeholder="Search booking, customer, phone, table..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            style={{ width: '280px', padding: '8px 12px 8px 30px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.8rem', outline: 'none' }}
          />
        </div>

        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.8rem', fontWeight: 700, outline: 'none', cursor: 'pointer' }}
        >
          {statuses.map(s => <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s}</option>)}
        </select>

        <button
          onClick={() => { setSearch(''); setStatusFilter('All'); setPage(1); }}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', border: '1px solid #cbd5e1', background: '#fff', borderRadius: '8px', cursor: 'pointer', color: '#475569', fontSize: '0.8rem' }}
        >
          <FaUndo size={11} /> Reset
        </button>
      </div>

      {/* Table */}
      <div style={{ flex: 1, padding: '20px 24px', overflowX: 'auto' }}>
        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
            <thead>
              <tr style={{ background: '#0e7490' }}>
                {[
                  { label: 'Booking No', field: 'bookingNo' },
                  { label: 'Customer', field: 'customer' },
                  { label: 'Phone', field: 'phone' },
                  { label: 'Table', field: 'tableNo' },
                  { label: 'Date', field: 'date' },
                  { label: 'Time', field: 'time' },
                  { label: 'Waiter', field: 'waiter' },
                  { label: 'Status', field: 'status' },
                  { label: 'Amount', field: 'amount' },
                  { label: 'Actions', field: null },
                ].map(col => (
                  <th
                    key={col.label}
                    style={thStyle(col.field)}
                    onClick={() => col.field && handleSort(col.field)}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      {col.label}
                      {col.field && <SortIcon field={col.field} />}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageData.length === 0 && (
                <tr>
                  <td colSpan={10} style={{ padding: '48px', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                    No bookings found.
                  </td>
                </tr>
              )}
              {pageData.map((b, i) => {
                const sc = STATUS_COLORS[b.status] || { bg: '#f1f5f9', color: '#64748b' };
                return (
                  <tr key={`${b.bookingNo}-${i}`} style={{ borderBottom: '1px solid #f1f5f9', background: i % 2 === 0 ? '#fff' : '#fafafa' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f0f9ff'}
                    onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? '#fff' : '#fafafa'}
                  >
                    <td style={{ padding: '10px 12px', fontSize: '0.78rem', fontWeight: 700, color: '#0e7490' }}>{b.bookingNo}</td>
                    <td style={{ padding: '10px 12px', fontSize: '0.8rem', fontWeight: 600, color: '#0f172a' }}>{b.customer}</td>
                    <td style={{ padding: '10px 12px', fontSize: '0.78rem', color: '#475569' }}>{b.phone}</td>
                    <td style={{ padding: '10px 12px', fontSize: '0.78rem', fontWeight: 700, color: '#334155' }}>T{parseInt(b.tableNo)}</td>
                    <td style={{ padding: '10px 12px', fontSize: '0.78rem', color: '#475569' }}>{b.date}</td>
                    <td style={{ padding: '10px 12px', fontSize: '0.78rem', color: '#475569' }}>{b.time}</td>
                    <td style={{ padding: '10px 12px', fontSize: '0.78rem', color: '#475569' }}>{b.waiter}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '3px 10px', borderRadius: '999px', background: sc.bg, color: sc.color }}>
                        {b.status}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px', fontSize: '0.8rem', fontWeight: 800, color: '#0f172a', textAlign: 'right' }}>
                      ₹{b.amount.toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button title="View" onClick={() => handleView(b)}
                          style={{ padding: '5px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', color: '#0e7490', display: 'flex', alignItems: 'center' }}
                          onMouseEnter={e => e.currentTarget.style.background = '#e0f2fe'}
                          onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                        ><FaEye size={12} /></button>
                        <button title="Edit" onClick={() => handleEdit(b)}
                          style={{ padding: '5px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', color: '#475569', display: 'flex', alignItems: 'center' }}
                          onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
                          onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                        ><FaEdit size={12} /></button>
                        {b.status === 'Reserved' && b.id && !String(b.bookingNo).startsWith('TBL-') && (
                          <button title="Cancel Booking" onClick={() => handleCancel(b)}
                            style={{ padding: '5px 8px', borderRadius: '6px', border: '1px solid #fca5a5', background: '#fff', cursor: 'pointer', color: '#dc2626', display: 'flex', alignItems: 'center' }}
                            onMouseEnter={e => e.currentTarget.style.background = '#fee2e2'}
                            onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                          ><FaTimes size={11} /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
            Showing {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
          </span>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              onClick={() => setPage(1)} disabled={page === 1}
              style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', background: page === 1 ? '#f1f5f9' : '#fff', cursor: page === 1 ? 'default' : 'pointer', fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}
            >«</button>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', background: page === 1 ? '#f1f5f9' : '#fff', cursor: page === 1 ? 'default' : 'pointer', fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}
            >‹</button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
              return (
                <button key={p} onClick={() => setPage(p)}
                  style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', background: page === p ? '#0e7490' : '#fff', color: page === p ? '#fff' : '#475569', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700 }}
                >{p}</button>
              );
            })}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', background: page === totalPages ? '#f1f5f9' : '#fff', cursor: page === totalPages ? 'default' : 'pointer', fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}
            >›</button>
            <button
              onClick={() => setPage(totalPages)} disabled={page === totalPages}
              style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', background: page === totalPages ? '#f1f5f9' : '#fff', cursor: page === totalPages ? 'default' : 'pointer', fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}
            >»</button>
          </div>
        </div>
      </div>

      {/* Add Booking Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '28px', width: '420px', maxWidth: '95vw', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>New Booking</h2>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '1.2rem' }}><FaTimes /></button>
            </div>

            {addError && <div style={{ padding: '10px 14px', borderRadius: '8px', background: '#fee2e2', color: '#dc2626', fontSize: '0.8rem', marginBottom: '14px' }}>{addError}</div>}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>Table *</label>
                <select value={addForm.tableId} onChange={e => setAddForm(f => ({ ...f, tableId: e.target.value }))}
                  style={{ width: '100%', marginTop: '4px', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}>
                  <option value="">Select Table...</option>
                  {tables.filter(t => t.status === 'AVAILABLE' || t.status === 'Blank' || t.status === 'white').map(t => (
                    <option key={t.id} value={t.id}>T{parseInt(t.no, 10)} — {t.seats} seats</option>
                  ))}
                  {tables.filter(t => !['AVAILABLE', 'Blank', 'white'].includes(t.status)).map(t => (
                    <option key={t.id} value={t.id}>T{parseInt(t.no, 10)} ({t.status})</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>Customer Name *</label>
                <input type="text" value={addForm.customerName} onChange={e => setAddForm(f => ({ ...f, customerName: e.target.value }))} placeholder="Customer name"
                  style={{ width: '100%', marginTop: '4px', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>Phone</label>
                  <input type="text" value={addForm.phone} onChange={e => setAddForm(f => ({ ...f, phone: e.target.value }))} placeholder="Phone"
                    style={{ width: '100%', marginTop: '4px', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', boxSizing: 'border-box' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>Persons</label>
                  <input type="number" min={1} value={addForm.persons} onChange={e => setAddForm(f => ({ ...f, persons: e.target.value }))}
                    style={{ width: '100%', marginTop: '4px', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>Check-In Time</label>
                <input type="datetime-local" value={addForm.checkIn} onChange={e => setAddForm(f => ({ ...f, checkIn: e.target.value }))}
                  style={{ width: '100%', marginTop: '4px', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>Occasion</label>
                <input type="text" value={addForm.occasion} onChange={e => setAddForm(f => ({ ...f, occasion: e.target.value }))} placeholder="Birthday, Anniversary..."
                  style={{ width: '100%', marginTop: '4px', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', boxSizing: 'border-box' }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowAddModal(false)} style={{ padding: '9px 20px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', color: '#475569', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleAddSave} disabled={saving} style={{ padding: '9px 24px', borderRadius: '8px', border: 'none', background: '#0e7490', color: '#fff', fontSize: '0.82rem', fontWeight: 700, cursor: saving ? 'wait' : 'pointer', opacity: saving ? 0.7 : 1 }}>
                {saving ? 'Saving...' : 'Save Booking'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingListPage;
