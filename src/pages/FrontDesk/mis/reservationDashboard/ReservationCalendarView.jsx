import React, { useState } from 'react';
import { FaChevronLeft, FaChevronRight, FaPlus, FaBars, FaChevronUp, FaChevronDown } from 'react-icons/fa';

const STATUS_PALETTE = {
  'Checked-In': { bg: '#10B981', text: '#fff' },
  'Confirmed': { bg: '#3B82F6', text: '#fff' },
  'Reserved': { bg: '#F59E0B', text: '#fff' },
  'Checked-Out': { bg: '#94a3b8', text: '#fff' },
  'Cancelled': { bg: '#EF4444', text: '#fff' },
};

const ROOM_TYPE_COLORS = {
  'Standard Room': { dot: '#3B82F6' },
  'Deluxe Room': { dot: '#8B5CF6' },
  'Executive Suite': { dot: '#10B981' },
  'Presidential Suite': { dot: '#F59E0B' },
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function buildCalendarWeeks(year, month) {
  const totalDays = getDaysInMonth(year, month);
  const firstDay = new Date(year, month, 1).getDay();
  const weeks = [];
  let day = 1 - firstDay;
  while (day <= totalDays) {
    const week = [];
    for (let d = 0; d < 7; d++, day++) {
      week.push(day >= 1 && day <= totalDays ? day : null);
    }
    weeks.push(week);
  }
  return weeks;
}

function toDateStr(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function getBookingsForDate(bookings, dateStr) {
  return bookings.filter(b => b.status !== 'Cancelled' && dateStr >= b.start && dateStr < b.end);
}

const MiniCalendar = ({ year, month, onPrev, onNext, onDayClick, todayStr }) => {
  const weeks = buildCalendarWeeks(year, month);
  return (
    <div style={{ padding: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          {MONTHS[month]} {year}
        </span>
        <div style={{ display: 'flex', gap: '2px' }}>
          <button onClick={onPrev} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '3px 6px', borderRadius: '50%' }}>
            <FaChevronLeft size={9} />
          </button>
          <button onClick={onNext} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '3px 6px', borderRadius: '50%' }}>
            <FaChevronRight size={9} />
          </button>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center' }}>
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <span key={i} style={{ fontSize: '0.62rem', fontWeight: 700, color: 'var(--text-light)', padding: '2px 0' }}>{d}</span>
        ))}
        {weeks.map((week, wi) =>
          week.map((day, di) => {
            const ds = day ? toDateStr(year, month, day) : null;
            const isToday = ds === todayStr;
            return (
              <span
                key={`${wi}-${di}`}
                onClick={() => day && onDayClick(ds)}
                style={{
                  fontSize: '0.7rem', fontWeight: isToday ? 700 : 400,
                  width: '22px', height: '22px', borderRadius: '50%',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  margin: '1px auto', cursor: day ? 'pointer' : 'default',
                  color: isToday ? '#fff' : day ? 'var(--text-primary)' : 'transparent',
                  background: isToday ? 'var(--primary)' : 'transparent',
                  transition: 'background 0.12s',
                }}
                onMouseEnter={e => { if (day && !isToday) e.currentTarget.style.background = 'var(--primary-light)'; }}
                onMouseLeave={e => { if (!isToday) e.currentTarget.style.background = 'transparent'; }}
              >
                {day || ''}
              </span>
            );
          })
        )}
      </div>
    </div>
  );
};

const ReservationCalendarView = ({ bookings = [], onBookingClick, onCellClick, rooms = [], passesFilters }) => {
  const today = new Date('2026-06-26');
  const todayStr = toDateStr(today.getFullYear(), today.getMonth(), today.getDate());

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [miniYear, setMiniYear] = useState(today.getFullYear());
  const [miniMonth, setMiniMonth] = useState(today.getMonth());
  const [activeRoomTypes, setActiveRoomTypes] = useState(new Set(Object.keys(ROOM_TYPE_COLORS)));
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [bottomOpen, setBottomOpen] = useState(true);

  const weeks = buildCalendarWeeks(viewYear, viewMonth);

  const filteredBookings = bookings.filter(b => {
    if (!passesFilters(b)) return false;
    const room = rooms.find(r => r.no === b.roomNo);
    return room && activeRoomTypes.has(room.type);
  });

  const toggleRoomType = (type) => {
    setActiveRoomTypes(prev => {
      const next = new Set(prev);
      next.has(type) ? next.delete(type) : next.add(type);
      return next;
    });
  };

  const shiftMonth = (n) => {
    let m = viewMonth + n, y = viewYear;
    if (m > 11) { m = 0; y++; }
    if (m < 0) { m = 11; y--; }
    setViewMonth(m); setViewYear(y);
  };

  const shiftMini = (n) => {
    let m = miniMonth + n, y = miniYear;
    if (m > 11) { m = 0; y++; }
    if (m < 0) { m = 11; y--; }
    setMiniMonth(m); setMiniYear(y);
  };

  const goToday = () => { setViewMonth(today.getMonth()); setViewYear(today.getFullYear()); };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', background: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--shadow-md)', minHeight: '600px' }}>

      {/* Main Content (Left Sidebar + Main Calendar Grid) */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>

        {/* ── LEFT SIDEBAR ── */}
        <div style={{
          width: sidebarOpen ? '220px' : '0',
          minWidth: sidebarOpen ? '220px' : '0',
          flexShrink: 0,
          borderRight: sidebarOpen ? '1px solid var(--border)' : 'none',
          overflow: 'hidden',
          transition: 'width 0.25s cubic-bezier(0.4,0,0.2,1), min-width 0.25s cubic-bezier(0.4,0,0.2,1)',
          background: '#fff',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <div style={{ width: '220px', display: 'flex', flexDirection: 'column', flex: 1 }}>
            <MiniCalendar
              year={miniYear} month={miniMonth}
              onPrev={() => shiftMini(-1)} onNext={() => shiftMini(1)}
              onDayClick={ds => { const d = new Date(ds); setViewMonth(d.getMonth()); setViewYear(d.getFullYear()); }}
              todayStr={todayStr}
            />

            <div style={{ borderTop: '1px solid var(--border)', margin: '4px 14px' }} />

            <div style={{ padding: '10px 14px', flex: 1, overflowY: 'auto' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>
                Room Types
              </div>
              {Object.entries(ROOM_TYPE_COLORS).map(([type, col]) => {
                const active = activeRoomTypes.has(type);
                return (
                  <div
                    key={type}
                    onClick={() => toggleRoomType(type)}
                    style={{ display: 'flex', alignItems: 'center', gap: '9px', padding: '5px 7px', borderRadius: '7px', cursor: 'pointer', marginBottom: '1px', transition: 'background 0.12s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-light)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <span style={{ width: '13px', height: '13px', borderRadius: '3px', flexShrink: 0, background: active ? col.dot : '#cbd5e1', transition: 'background 0.15s' }} />
                    <span style={{ fontSize: '0.78rem', fontWeight: 600, color: active ? 'var(--text-primary)' : 'var(--text-light)', transition: 'color 0.15s', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {type}
                    </span>
                  </div>
                );
              })}

              <div style={{ borderTop: '1px solid var(--border)', margin: '10px 0 8px' }} />
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>
                Status Legend
              </div>
              {Object.entries(STATUS_PALETTE).map(([status, col]) => (
                <div key={status} style={{ display: 'flex', alignItems: 'center', gap: '9px', padding: '4px 7px' }}>
                  <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: col.bg, flexShrink: 0 }} />
                  <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── MAIN CALENDAR ── */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>

          {/* Calendar Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', borderBottom: '1px solid var(--border)', background: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {/* Left sidebar toggle */}
              <button
                onClick={() => setSidebarOpen(o => !o)}
                title={sidebarOpen ? 'Collapse left sidebar' : 'Expand left sidebar'}
                style={{
                  background: sidebarOpen ? 'var(--primary-light)' : 'none',
                  border: 'none', cursor: 'pointer',
                  color: 'var(--primary)', padding: '7px', borderRadius: '8px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.15s', flexShrink: 0,
                }}
              >
                <FaBars size={15} />
              </button>

              <button
                onClick={goToday}
                style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '20px', padding: '6px 16px', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', color: 'var(--text-primary)', transition: 'border-color 0.15s', whiteSpace: 'nowrap' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                Today
              </button>

              <div style={{ display: 'flex', gap: '2px' }}>
                <button onClick={() => shiftMonth(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '6px 8px', borderRadius: '50%', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--background)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                ><FaChevronLeft size={12} /></button>
                <button onClick={() => shiftMonth(1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '6px 8px', borderRadius: '50%', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--background)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                ><FaChevronRight size={12} /></button>
              </div>

              <h2 style={{ fontSize: '1.2rem', fontWeight: 400, color: 'var(--text-primary)', letterSpacing: '-0.3px', margin: 0 }}>
                {MONTHS[viewMonth]} {viewYear}
              </h2>
            </div>

            {/* Bottom panel toggle button */}
            <button
              onClick={() => setBottomOpen(o => !o)}
              title={bottomOpen ? 'Collapse bottom panel' : 'Expand bottom panel'}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: bottomOpen ? 'var(--primary-light)' : 'none',
                border: '1px solid var(--border)', cursor: 'pointer',
                color: 'var(--primary)', padding: '7px', borderRadius: '8px',
                transition: 'all 0.15s', flexShrink: 0
              }}
            >
              {bottomOpen ? <FaChevronDown size={13} /> : <FaChevronUp size={13} />}
            </button>
          </div>

          {/* Day Headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid var(--border)', background: '#fff' }}>
            {DAYS.map(d => (
              <div key={d} style={{ textAlign: 'center', padding: '7px 0', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {d}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {weeks.map((week, wi) => (
              <div key={wi} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: wi < weeks.length - 1 ? '1px solid var(--border)' : 'none', minHeight: '110px' }}>
                {week.map((day, di) => {
                  const dateStr = day ? toDateStr(viewYear, viewMonth, day) : null;
                  const isToday = dateStr === todayStr;
                  const dayBookings = dateStr ? getBookingsForDate(filteredBookings, dateStr) : [];
                  const maxVisible = 3;
                  const overflow = dayBookings.length - maxVisible;

                  return (
                    <div
                      key={di}
                      onClick={() => dateStr && onCellClick(rooms[0]?.no || '', dateStr)}
                      style={{
                        borderRight: di < 6 ? '1px solid var(--border)' : 'none',
                        padding: '6px 4px 4px',
                        background: day ? '#fff' : '#fafbfc',
                        cursor: day ? 'pointer' : 'default',
                        transition: 'background 0.12s',
                        minHeight: '110px',
                      }}
                      onMouseEnter={e => { if (day) e.currentTarget.style.background = 'rgba(65,138,139,0.035)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = day ? '#fff' : '#fafbfc'; }}
                    >
                      {/* Day number circle */}
                      <div style={{ textAlign: 'center', marginBottom: '3px' }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          width: '26px', height: '26px', borderRadius: '50%',
                          fontSize: '0.8rem', fontWeight: isToday ? 700 : 400,
                          color: isToday ? '#fff' : day ? 'var(--text-primary)' : 'var(--text-light)',
                          background: isToday ? 'var(--primary)' : 'transparent',
                        }}>
                          {day || ''}
                        </span>
                      </div>

                      {/* Booking chips */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        {dayBookings.slice(0, maxVisible).map(b => {
                          const room = rooms.find(r => r.no === b.roomNo);
                          const rtColor = ROOM_TYPE_COLORS[room?.type] || { dot: '#3B82F6' };
                          const stCol = STATUS_PALETTE[b.status] || STATUS_PALETTE['Confirmed'];
                          return (
                            <div
                              key={b.id}
                              onClick={e => { e.stopPropagation(); onBookingClick(b); }}
                              style={{
                                background: stCol.bg, color: stCol.text,
                                borderRadius: '4px', padding: '2px 6px',
                                fontSize: '0.68rem', fontWeight: 600,
                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px',
                                borderLeft: `3px solid ${rtColor.dot}`,
                                transition: 'filter 0.12s',
                              }}
                              onMouseEnter={e => e.currentTarget.style.filter = 'brightness(0.9)'}
                              onMouseLeave={e => e.currentTarget.style.filter = ''}
                            >
                              {b.isVip && <span style={{ fontSize: '0.6rem' }}>👑</span>}
                              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                R{b.roomNo} · {b.guestName.split(' ')[0]}
                              </span>
                            </div>
                          );
                        })}
                        {overflow > 0 && (
                          <div style={{ fontSize: '0.66rem', fontWeight: 700, color: 'var(--primary)', paddingLeft: '6px', cursor: 'pointer' }}>
                            +{overflow} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── BOTTOM COLLAPSIBLE PANEL ── */}
      <div style={{ borderTop: '1px solid var(--border)', background: '#fff' }}>
        <div
          onClick={() => setBottomOpen(o => !o)}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '8px 16px', background: 'var(--background)', cursor: 'pointer',
            userSelect: 'none', borderBottom: bottomOpen ? '1px solid var(--border)' : 'none'
          }}
        >
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Calendar Quick Filter & Legend
          </span>
          <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}>
            {bottomOpen ? <FaChevronDown size={12} /> : <FaChevronUp size={12} />}
          </span>
        </div>

        <div style={{
          maxHeight: bottomOpen ? '180px' : '0',
          opacity: bottomOpen ? 1 : 0,
          overflow: 'hidden',
          transition: 'max-height 0.3s cubic-bezier(0.4,0,0.2,1), opacity 0.2s ease',
          padding: bottomOpen ? '12px 16px' : '0 16px',
          display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center'
        }}>
          {/* Quick Room Type Badges */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase' }}>Filter Room Types</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {Object.entries(ROOM_TYPE_COLORS).map(([type, col]) => {
                const active = activeRoomTypes.has(type);
                return (
                  <button
                    key={type}
                    onClick={() => toggleRoomType(type)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      padding: '4px 10px', borderRadius: '14px', border: '1px solid var(--border)',
                      background: active ? col.dot : '#f1f5f9', color: active ? '#fff' : 'var(--text-secondary)',
                      fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s'
                    }}
                  >
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: active ? '#fff' : '#94a3b8' }} />
                    {type}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ width: '1px', height: '40px', background: 'var(--border)' }} />

          {/* Quick Status Legend */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase' }}>Status Colors</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              {Object.entries(STATUS_PALETTE).map(([status, col]) => (
                <div key={status} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: col.bg }} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>{status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export { ROOM_TYPE_COLORS, STATUS_PALETTE };
export default ReservationCalendarView;
