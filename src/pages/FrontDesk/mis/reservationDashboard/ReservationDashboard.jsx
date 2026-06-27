import React, { useState, useMemo } from 'react';
import { FaBed, FaPlus, FaFileExport, FaSearch, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import PageHeader from '../../../../components/common/PageHeader';
import PrintButton from '../../../../components/common/PrintButton';
import { PrintHeader, PrintFooter } from '../../../../components/common/PrintComponent';
import ReservationSummaryCards from './ReservationSummaryCards';
import ReservationCalendarView from './ReservationCalendarView';
import QuickReservationModal from './QuickReservationModal';
import ReservationDetailsModal from './ReservationDetailsModal';

const ROOMS = [
    { no: '101', type: 'Standard Room', floor: 'Ground', category: 'Standard' },
    { no: '102', type: 'Standard Room', floor: 'Ground', category: 'Standard' },
    { no: '103', type: 'Standard Room', floor: 'Ground', category: 'Standard' },
    { no: '104', type: 'Standard Room', floor: 'Ground', category: 'Standard' },
    { no: '201', type: 'Deluxe Room', floor: '1st Floor', category: 'Luxury' },
    { no: '202', type: 'Deluxe Room', floor: '1st Floor', category: 'Luxury' },
    { no: '203', type: 'Deluxe Room', floor: '1st Floor', category: 'Luxury' },
    { no: '204', type: 'Deluxe Room', floor: '1st Floor', category: 'Luxury' },
    { no: '301', type: 'Executive Suite', floor: '2nd Floor', category: 'Suite' },
    { no: '302', type: 'Executive Suite', floor: '2nd Floor', category: 'Suite' },
    { no: '401', type: 'Presidential Suite', floor: '3rd Floor', category: 'Presidential' },
];

const ROOM_TYPES = [
    { key: 'Standard Room', name: 'Standard Room' },
    { key: 'Deluxe Room', name: 'Deluxe Room' },
    { key: 'Executive Suite', name: 'Executive Suite' },
    { key: 'Presidential Suite', name: 'Presidential Suite' },
];
const FLOORS = ['Ground', '1st Floor', '2nd Floor', '3rd Floor'];
const SEGMENTS = ['Corporate', 'Leisure', 'FIT', 'Group'];
const BUSINESS_SOURCES = ['Direct', 'OTA', 'Agent'];
const BOOKING_SOURCES = ['Website', 'Walk-in', 'Booking.com', 'Expedia', 'Agoda', 'MakeMyTrip'];

const INITIAL_BOOKINGS = [
    { id: 1001, roomNo: '101', guestName: 'John Smith',    phone: '+91 98765 43210', start: '2026-06-26', end: '2026-06-29', status: 'Checked-In',  segment: 'Leisure',   source: 'Direct', bookingSource: 'Website',    isVip: false },
    { id: 1002, roomNo: '102', guestName: 'Emma Johnson',  phone: '+1 555-0199',     start: '2026-06-27', end: '2026-07-01', status: 'Confirmed',   segment: 'FIT',       source: 'OTA',    bookingSource: 'Booking.com', isVip: false },
    { id: 1003, roomNo: '104', guestName: 'Michael Brown', phone: '+1 202-555-0143', start: '2026-06-28', end: '2026-07-02', status: 'Reserved',    segment: 'Corporate', source: 'Agent',  bookingSource: 'Expedia',    isVip: false },
    { id: 1004, roomNo: '201', guestName: 'Sarah Wilson',  phone: '+91 91234 56789', start: '2026-06-26', end: '2026-06-28', status: 'Checked-In',  segment: 'Leisure',   source: 'Direct', bookingSource: 'Walk-in',    isVip: false },
    { id: 1005, roomNo: '202', guestName: 'David Miller',  phone: '+1 570-555-0156', start: '2026-06-27', end: '2026-06-30', status: 'Reserved',    segment: 'Corporate', source: 'Direct', bookingSource: 'Website',    isVip: true  },
    { id: 1006, roomNo: '203', guestName: 'Lisa Anderson', phone: '+1 312-555-0188', start: '2026-06-29', end: '2026-07-03', status: 'Confirmed',   segment: 'FIT',       source: 'OTA',    bookingSource: 'Agoda',      isVip: false },
    { id: 1007, roomNo: '301', guestName: 'Robert Taylor', phone: '+91 99999 88888', start: '2026-06-26', end: '2026-07-05', status: 'Checked-In',  segment: 'Corporate', source: 'Agent',  bookingSource: 'Expedia',    isVip: false },
    { id: 1008, roomNo: '302', guestName: 'James Wilson',  phone: '+1 312-555-0199', start: '2026-06-26', end: '2026-06-28', status: 'Checked-Out', segment: 'Leisure',   source: 'Agent',  bookingSource: 'MakeMyTrip', isVip: false },
    { id: 1009, roomNo: '401', guestName: 'William Davis', phone: '+1 202-555-9999', start: '2026-06-27', end: '2026-07-05', status: 'Confirmed',   segment: 'Corporate', source: 'Direct', bookingSource: 'Walk-in',    isVip: true  },
];

const ROOM_STATUS = [
    { label: 'Clean',        count: 68, dotColor: 'var(--success)', textColor: 'var(--success)' },
    { label: 'Dirty',        count: 24, dotColor: 'var(--warning)', textColor: 'var(--warning)' },
    { label: 'Out of Order', count: 6,  dotColor: 'var(--danger)',  textColor: 'var(--danger)'  },
    { label: 'Housekeeping', count: 22, dotColor: 'var(--info)',    textColor: 'var(--info)'    },
];

const STATUS_COLORS = {
    'Checked-In':  { bg: '#d1fae5', color: '#10B981' },
    'Confirmed':   { bg: '#dbeafe', color: '#3B82F6' },
    'Reserved':    { bg: '#fef3c7', color: '#F59E0B' },
    'Checked-Out': { bg: '#f1f5f9', color: '#64748b' },
    'Cancelled':   { bg: '#fee2e2', color: '#EF4444' },
};

const BookingRow = ({ b }) => {
    const col = STATUS_COLORS[b.status] || STATUS_COLORS['Confirmed'];
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {b.isVip ? '👑 ' : ''}{b.guestName}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Room {b.roomNo} | {b.start}
                </span>
            </div>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '3px 10px', borderRadius: '20px', background: col.bg, color: col.color, whiteSpace: 'nowrap' }}>
                {b.status}
            </span>
        </div>
    );
};

const ReservationDashboard = ({ showToast = () => {} }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [bookings, setBookings] = useState(INITIAL_BOOKINGS);
    const [quickBookModal, setQuickBookModal] = useState({ open: false, roomNo: '', dateStr: '' });
    const [bookingDetailModal, setBookingDetailModal] = useState({ open: false, booking: null });
    const [bottomOpen, setBottomOpen] = useState(true);

    const notify = (msg) => showToast(msg);
    const focusDateStr = '2026-06-26';

    const stats = {
        totalRooms: 120, availableRooms: 34, occupiedRooms: 71,
        reservedRooms: 15, todaysArrivals: 18, todaysDepartures: 12,
        occupancyPercent: 82, availablePercent: '35.00', occupiedPercent: '59.17', reservedPercent: '12.50',
    };

    const passesFilters = (b) => {
        if (searchQuery.trim() && !b.guestName.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        if (statusFilter !== 'All' && b.status !== statusFilter) return false;
        return true;
    };

    const handleCellClick = (roomNo, dateStr) => {
        setQuickBookModal({ open: true, roomNo: roomNo || ROOMS[0].no, dateStr });
    };

    const handleSaveQuickBook = (data) => {
        const ci = new Date(data.dateStr);
        const co = new Date(ci); co.setDate(ci.getDate() + data.nights);
        const endStr = co.toISOString().split('T')[0];
        const conflict = bookings.some(b => {
            if (b.roomNo !== data.roomNo || b.status === 'Cancelled') return false;
            return ci < new Date(b.end) && co > new Date(b.start);
        });
        if (conflict) { notify(`Conflict: Room ${data.roomNo} is booked during these dates.`); return; }
        setBookings(prev => [...prev, {
            id: Date.now(), roomNo: data.roomNo, guestName: data.guestName,
            phone: data.phone, start: data.dateStr, end: endStr,
            status: 'Confirmed', segment: 'FIT', source: 'Direct',
            bookingSource: 'Website', isVip: false,
        }]);
        notify(`Reservation saved for Room ${data.roomNo}!`);
        setQuickBookModal({ open: false, roomNo: '', dateStr: '' });
    };

    const handleStatusChange = (id, status) => {
        setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
        notify(`Status updated to ${status}.`);
        setBookingDetailModal({ open: false, booking: null });
    };

    const handleCancelBooking = (id) => {
        setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'Cancelled' } : b));
        notify('Reservation cancelled.');
        setBookingDetailModal({ open: false, booking: null });
    };

    const handleRoomChange = (id, newRoomNo) => {
        const target = bookings.find(b => b.id === id);
        if (!target) return;
        const conflict = bookings.some(b => {
            if (b.id === id || b.roomNo !== newRoomNo || b.status === 'Cancelled' || b.status === 'Checked-Out') return false;
            return new Date(target.start) < new Date(b.end) && new Date(target.end) > new Date(b.start);
        });
        if (conflict) { notify(`Conflict: Room ${newRoomNo} is occupied.`); return; }
        setBookings(prev => prev.map(b => b.id === id ? { ...b, roomNo: newRoomNo } : b));
        notify(`Moved to Room ${newRoomNo}.`);
        setBookingDetailModal(prev => prev.booking?.id === id ? { ...prev, booking: { ...prev.booking, roomNo: newRoomNo } } : prev);
    };

    const handleExtendStay = (id, nights) => {
        const t = bookings.find(b => b.id === id); if (!t) return;
        const newEnd = new Date(t.end); newEnd.setDate(newEnd.getDate() + nights);
        const newEndStr = newEnd.toISOString().split('T')[0];
        setBookings(prev => prev.map(b => b.id === id ? { ...b, end: newEndStr } : b));
        notify(`Stay extended to ${newEndStr}.`);
        setBookingDetailModal(prev => prev.booking?.id === id ? { ...prev, booking: { ...prev.booking, end: newEndStr } } : prev);
    };

    const handleSplitStay = (id, after) => {
        const t = bookings.find(b => b.id === id); if (!t) return;
        const split = new Date(t.start); split.setDate(split.getDate() + after);
        const splitStr = split.toISOString().split('T')[0];
        setBookings(prev => prev.map(b => b.id === id ? { ...b, end: splitStr } : b).concat({
            ...t, id: Date.now(), start: splitStr, guestName: `${t.guestName} (Split)`, status: 'Confirmed',
        }));
        notify(`Stay split at ${splitStr}.`);
        setBookingDetailModal({ open: false, booking: null });
    };

    const todaysArrivals   = useMemo(() => bookings.filter(b => b.start === focusDateStr && b.status !== 'Cancelled').slice(0, 5), [bookings, focusDateStr]);
    const todaysDepartures  = useMemo(() => bookings.filter(b => b.end   === focusDateStr && b.status !== 'Cancelled').slice(0, 5), [bookings, focusDateStr]);
    const expectedCheckins  = useMemo(() => bookings.filter(b => b.status === 'Confirmed'  && b.start === focusDateStr).slice(0, 5), [bookings, focusDateStr]);

    return (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Page Header */}
            <PageHeader
                title="Reservation Dashboard"
                breadcrumbs={['Dashboard', 'Front Desk', 'MIS', 'Reservation Dashboard']}
            />

            {/* Top Toolbar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', background: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--border)', padding: '14px 20px', boxShadow: 'var(--shadow-sm)' }} className="no-print">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    {/* Search */}
                    <div style={{ position: 'relative' }}>
                        <FaSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)', fontSize: '11px' }} />
                        <input
                            type="text" placeholder="Search guest, room..."
                            value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                            className="table-search-input" style={{ paddingLeft: '32px', width: '200px' }}
                        />
                    </div>
                    {/* Status Filter */}
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="entries-select">
                        <option value="All">All Status</option>
                        <option value="Checked-In">Checked In</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Reserved">Reserved</option>
                        <option value="Checked-Out">Checked Out</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button onClick={() => notify('Opening room availability...')} className="btn-secondary" style={{ borderRadius: '20px', padding: '8px 16px', fontSize: '0.82rem' }}>
                        <FaBed size={11} /> Room Availability
                    </button>
                    <button onClick={() => setQuickBookModal({ open: true, roomNo: ROOMS[0].no, dateStr: focusDateStr })} className="btn-primary" style={{ borderRadius: '20px', padding: '8px 16px', fontSize: '0.82rem' }}>
                        <FaPlus size={11} /> New Reservation
                    </button>
                    <PrintButton label="Print" />
                    <button onClick={() => notify('Exporting...')} className="btn-secondary" style={{ borderRadius: '20px', padding: '8px 14px', fontSize: '0.82rem' }}>
                        <FaFileExport size={11} /> Export
                    </button>
                </div>
            </div>

            {/* Print Header - only visible on print */}
            <PrintHeader title="Reservation Dashboard" />

            {/* Summary Cards */}
            <ReservationSummaryCards metrics={stats} />

            {/* Google Calendar-style main layout */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                {/* Calendar View */}
                <ReservationCalendarView
                    bookings={bookings}
                    rooms={ROOMS}
                    onCellClick={handleCellClick}
                    onBookingClick={(b) => setBookingDetailModal({ open: true, booking: b })}
                    passesFilters={passesFilters}
                />

                {/* Bottom Summary Panels */}
                {/* Toggle bar */}
                <div
                    onClick={() => setBottomOpen(o => !o)}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 18px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: bottomOpen ? '12px 12px 0 0' : '12px', cursor: 'pointer', userSelect: 'none', transition: 'border-radius 0.25s' }}
                    className="no-print"
                >
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                        Today's Summary
                    </span>
                    <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', transition: 'transform 0.25s' }}>
                        {bottomOpen ? <FaChevronUp size={13} /> : <FaChevronDown size={13} />}
                    </span>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '16px',
                    overflow: 'hidden',
                    maxHeight: bottomOpen ? '600px' : '0',
                    opacity: bottomOpen ? 1 : 0,
                    transition: 'max-height 0.35s cubic-bezier(0.4,0,0.2,1), opacity 0.25s ease',
                }}>

                    {/* Today's Arrivals */}
                    <div className="dashboard-panel" style={{ padding: '18px', gap: '0', borderTop: '3px solid #10B981' }}>
                        <div className="panel-header" style={{ paddingBottom: '12px', marginBottom: '4px' }}>
                            <span className="panel-title" style={{ fontSize: '0.88rem' }}>Today's Arrivals ({stats.todaysArrivals})</span>
                            <span className="panel-action" style={{ fontSize: '0.72rem', padding: '3px 10px' }}>View All</span>
                        </div>
                        {todaysArrivals.length === 0
                            ? <p style={{ fontSize: '0.82rem', color: 'var(--text-light)', textAlign: 'center', padding: '12px 0' }}>No arrivals today</p>
                            : todaysArrivals.map(b => <BookingRow key={b.id} b={b} />)}
                    </div>

                    {/* Today's Departures */}
                    <div className="dashboard-panel" style={{ padding: '18px', gap: '0', borderTop: '3px solid #EF4444' }}>
                        <div className="panel-header" style={{ paddingBottom: '12px', marginBottom: '4px' }}>
                            <span className="panel-title" style={{ fontSize: '0.88rem' }}>Today's Departures ({stats.todaysDepartures})</span>
                            <span className="panel-action" style={{ fontSize: '0.72rem', padding: '3px 10px' }}>View All</span>
                        </div>
                        {todaysDepartures.length === 0
                            ? <p style={{ fontSize: '0.82rem', color: 'var(--text-light)', textAlign: 'center', padding: '12px 0' }}>No departures today</p>
                            : todaysDepartures.map(b => <BookingRow key={b.id} b={b} />)}
                    </div>

                    {/* Expected Check-ins */}
                    <div className="dashboard-panel" style={{ padding: '18px', gap: '0', borderTop: '3px solid #3B82F6' }}>
                        <div className="panel-header" style={{ paddingBottom: '12px', marginBottom: '4px' }}>
                            <span className="panel-title" style={{ fontSize: '0.88rem' }}>Expected Check-ins ({expectedCheckins.length})</span>
                            <span className="panel-action" style={{ fontSize: '0.72rem', padding: '3px 10px' }}>View All</span>
                        </div>
                        {expectedCheckins.length === 0
                            ? <p style={{ fontSize: '0.82rem', color: 'var(--text-light)', textAlign: 'center', padding: '12px 0' }}>No check-ins expected</p>
                            : expectedCheckins.map(b => <BookingRow key={b.id} b={b} />)}
                    </div>

                    {/* Room Status Overview */}
                    <div className="dashboard-panel" style={{ padding: '18px', gap: '0', borderTop: '3px solid var(--primary)' }}>
                        <div className="panel-header" style={{ paddingBottom: '12px', marginBottom: '4px' }}>
                            <span className="panel-title" style={{ fontSize: '0.88rem' }}>Room Status Overview</span>
                            <span className="panel-action" style={{ fontSize: '0.72rem', padding: '3px 10px' }}>View All</span>
                        </div>
                        {ROOM_STATUS.map((item, i) => (
                            <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 0', borderBottom: i < ROOM_STATUS.length - 1 ? '1px solid var(--border)' : 'none' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: item.dotColor, flexShrink: 0 }} />
                                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{item.label}</span>
                                </div>
                                <span style={{ fontSize: '1rem', fontWeight: 800, color: item.textColor }}>{item.count}</span>
                            </div>
                        ))}
                    </div>

                </div>
            </div>

            {/* Print Footer - only visible on print */}
            <PrintFooter title="Reservation Dashboard" />

            {/* Modals */}
            <QuickReservationModal
                isOpen={quickBookModal.open}
                roomNo={quickBookModal.roomNo}
                dateStr={quickBookModal.dateStr}
                onClose={() => setQuickBookModal({ open: false, roomNo: '', dateStr: '' })}
                onSave={handleSaveQuickBook}
            />
            <ReservationDetailsModal
                isOpen={bookingDetailModal.open}
                booking={bookingDetailModal.booking}
                onClose={() => setBookingDetailModal({ open: false, booking: null })}
                onStatusChange={handleStatusChange}
                onCancel={handleCancelBooking}
                onRoomChange={handleRoomChange}
                onExtendStay={handleExtendStay}
                onSplitStay={handleSplitStay}
                rooms={ROOMS}
            />
        </div>
    );
};

export default ReservationDashboard;
