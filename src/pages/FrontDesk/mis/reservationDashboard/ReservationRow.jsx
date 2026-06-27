import React from 'react';
import ReservationCell from './ReservationCell';
import ReservationBookingBar from './ReservationBookingBar';

const ReservationRow = ({ room, dates = [], getBookingForCell, isCellCovered, onCellClick, onBookingClick }) => {
  const tds = [];

  for (let i = 0; i < dates.length; i++) {
    const d = dates[i];
    const booking = getBookingForCell?.(room.no, d.dateStr);
    if (booking) {
      const nights = Math.max(1, Math.round((new Date(booking.end) - new Date(booking.start)) / 86400000));
      const span = Math.min(nights, dates.length - i);
      tds.push(
        <ReservationBookingBar key={booking.id} booking={booking} visibleSpan={span} onClick={() => onBookingClick?.(booking)} />
      );
      i += span - 1;
    } else if (!isCellCovered?.(room.no, d.dateStr)) {
      tds.push(
        <ReservationCell key={d.dateStr} roomNo={room.no} dateStr={d.dateStr} onClick={() => onCellClick?.(room.no, d.dateStr)} />
      );
    }
  }

  return (
    <tr>
      <td style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--dark)', position: 'sticky', left: 0, background: 'var(--surface)', zIndex: 5, width: '80px', minWidth: '80px' }}>
        {room.no}
      </td>
      <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', width: '130px', minWidth: '130px' }}>
        {room.type}
      </td>
      {tds}
    </tr>
  );
};

export default ReservationRow;
