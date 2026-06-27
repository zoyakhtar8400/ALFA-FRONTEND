import React from 'react';
import ReservationRow from './ReservationRow';

const CATEGORY_LABELS = {
  Standard:     'STANDARD ROOM',
  Luxury:       'DELUXE ROOM',
  Suite:        'EXECUTIVE SUITE',
  Presidential: 'PRESIDENTIAL SUITE',
};
const CATEGORY_ORDER = ['Standard', 'Luxury', 'Suite', 'Presidential'];

const groupByCategory = (rooms) => {
  const g = {};
  rooms.forEach(r => { if (!g[r.category]) g[r.category] = []; g[r.category].push(r); });
  return g;
};

const ReservationTapeChart = ({ rooms = [], dates = [], getBookingForCell, isCellCovered, onCellClick, onBookingClick }) => {
  const grouped = groupByCategory(rooms);

  return (
    <div className="custom-table-container" style={{ borderRadius: '14px' }}>
      <div style={{ overflowX: 'auto', width: '100%' }}>
        <table className="custom-table" style={{ minWidth: `${220 + dates.length * 110}px` }}>
          <thead>
            <tr>
              <th style={{ width: '80px', minWidth: '80px', position: 'sticky', left: 0, zIndex: 10, background: 'linear-gradient(180deg, #F8FAFC 0%, #F1F5F9 100%)' }}>Room</th>
              <th style={{ width: '130px', minWidth: '130px' }}>Type</th>
              {dates.map((d, i) => (
                <th key={d.dateStr} style={{
                  textAlign: 'center', width: '110px', minWidth: '110px',
                  background: i === 0 ? 'rgba(65,138,139,0.08)' : 'linear-gradient(180deg, #F8FAFC 0%, #F1F5F9 100%)',
                  color: i === 0 ? 'var(--primary)' : 'var(--dark)',
                  borderBottom: i === 0 ? '2px solid var(--primary)' : undefined,
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1px' }}>
                    <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{d.dayName}</span>
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, lineHeight: 1 }}>{d.dayNum}</span>
                    <span style={{ fontSize: '0.7rem', fontWeight: 600 }}>{d.monthShort}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CATEGORY_ORDER.map(cat => {
              const catRooms = grouped[cat];
              if (!catRooms?.length) return null;
              return (
                <React.Fragment key={cat}>
                  <tr>
                    <td colSpan={dates.length + 2} style={{
                      padding: '8px 24px', fontSize: '0.72rem', fontWeight: 700,
                      textTransform: 'uppercase', letterSpacing: '1px',
                      color: 'var(--primary)', background: 'var(--primary-light)',
                      borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)',
                    }}>
                      {CATEGORY_LABELS[cat] || cat}
                    </td>
                  </tr>
                  {catRooms.map(room => (
                    <ReservationRow
                      key={room.no}
                      room={room}
                      dates={dates}
                      getBookingForCell={getBookingForCell}
                      isCellCovered={isCellCovered}
                      onCellClick={onCellClick}
                      onBookingClick={onBookingClick}
                    />
                  ))}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReservationTapeChart;
