import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaArrowLeft, FaSearch, FaUndo, FaPrint, FaEye, FaEdit, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
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

const BookingListPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { tables, tableHistory = [] } = useRestaurant();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortField, setSortField] = useState('no');
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(1);

  // Build flat booking rows from tables + their KOTs + archived history
  const allBookings = useMemo(() => {
    const rows = [];

    const processTable = (t, isArchived = false) => {
      if (!t.kots || t.kots.length === 0) {
        rows.push({
          bookingNo: `BK-T${t.no}-000`,
          tableNo: t.no,
          customer: t.customer || 'Walk-in',
          phone: t.mobile || '—',
          date: t.openedAt ? new Date(t.openedAt).toLocaleDateString('en-IN') : '—',
          time: t.openedAt ? new Date(t.openedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—',
          status: isArchived ? 'Paid' : t.status,
          amount: t.amount || 0,
          waiter: t.waiter || '—',
          tableId: t.id,
        });
      } else {
        t.kots.forEach((kot, ki) => {
          rows.push({
            bookingNo: kot.id || `BK-T${t.no}-${ki + 1}`,
            tableNo: t.no,
            customer: t.customer || 'Walk-in',
            phone: t.mobile || '—',
            date: t.openedAt ? new Date(t.openedAt).toLocaleDateString('en-IN') : '—',
            time: kot.time || (t.openedAt ? new Date(t.openedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'),
            status: isArchived ? 'Paid' : (kot.status || t.status),
            amount: kot.amount || t.amount || 0,
            waiter: t.waiter || '—',
            tableId: t.id,
          });
        });
      }
    };

    tables.forEach(t => processTable(t, false));
    tableHistory.forEach(t => processTable(t, true));
    return rows;
  }, [tables, tableHistory]);

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

  const handlePrint = (booking) => {
    window.print();
  };

  const handleView = (booking) => {
    const table = tables.find(t => t.id === booking.tableId);
    if (table) navigate('/restaurant/view-kot', { state: { table } });
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
        <div>
          <h1 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 900, color: '#0f172a' }}>Booking List</h1>
          <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>{filtered.length} record{filtered.length !== 1 ? 's' : ''} found</p>
        </div>
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
                        <button title="Print" onClick={() => handlePrint(b)}
                          style={{ padding: '5px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', color: '#475569', display: 'flex', alignItems: 'center' }}
                          onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
                          onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                        ><FaPrint size={12} /></button>
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
    </div>
  );
};

export default BookingListPage;
