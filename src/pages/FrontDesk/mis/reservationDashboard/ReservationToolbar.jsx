import React from 'react';
import { FaChevronLeft, FaChevronRight, FaSearch, FaBed, FaPlus, FaPrint, FaFileExport, FaCalendarAlt } from 'react-icons/fa';

const ReservationToolbar = ({
  searchQuery, setSearchQuery,
  roomTypeFilter, setRoomTypeFilter,
  statusFilter, setStatusFilter,
  onToday, onPrevDay, onNextDay,
  onNewBooking, onAvailability, onPrint, onExport,
  roomTypes = [],
  dateRangeLabel = '',
}) => {
  return (
    <div className="table-header-controls no-print" style={{ borderRadius: '16px', marginBottom: '0' }}>
      {/* Left side */}
      <div className="table-left-controls" style={{ flexWrap: 'wrap', gap: '10px' }}>
        {/* Date range + nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid var(--border)', borderRadius: '20px', padding: '4px 10px', background: 'var(--background)', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          <FaCalendarAlt size={11} style={{ color: 'var(--primary)' }} />
          <span>{dateRangeLabel}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button onClick={onPrevDay} className="btn-secondary" style={{ padding: '7px 12px', borderRadius: '20px', minWidth: 0 }}>
            <FaChevronLeft size={11} />
          </button>
          <button onClick={onToday} className="btn-secondary" style={{ padding: '7px 14px', borderRadius: '20px', fontWeight: 700, fontSize: '0.82rem' }}>
            Today
          </button>
          <button onClick={onNextDay} className="btn-secondary" style={{ padding: '7px 12px', borderRadius: '20px', minWidth: 0 }}>
            <FaChevronRight size={11} />
          </button>
        </div>
        {/* Search */}
        <div style={{ position: 'relative' }}>
          <FaSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)', fontSize: '11px' }} />
          <input
            type="text"
            placeholder="Search guest name, booking no..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="table-search-input"
            style={{ paddingLeft: '32px', width: '220px' }}
          />
        </div>
        {/* Room Type */}
        <select value={roomTypeFilter} onChange={e => setRoomTypeFilter(e.target.value)} className="entries-select">
          <option value="All">All Room Types</option>
          {roomTypes.map(rt => <option key={rt.key} value={rt.key}>{rt.name}</option>)}
        </select>
        {/* Status */}
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="entries-select">
          <option value="All">All Status</option>
          <option value="Checked-In">Checked In</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Reserved">Reserved</option>
          <option value="Checked-Out">Checked Out</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {/* Right side */}
      <div className="table-right-controls">
        <button onClick={onAvailability} className="btn-secondary">
          <FaBed size={12} /> Room Availability
        </button>
        <button onClick={onNewBooking} className="btn-primary">
          <FaPlus size={11} /> New Reservation
        </button>
        <button onClick={onPrint} className="btn-secondary">
          <FaPrint size={11} /> Print
        </button>
        <button onClick={onExport} className="btn-secondary">
          <FaFileExport size={11} /> Export
        </button>
      </div>
    </div>
  );
};

export default ReservationToolbar;
