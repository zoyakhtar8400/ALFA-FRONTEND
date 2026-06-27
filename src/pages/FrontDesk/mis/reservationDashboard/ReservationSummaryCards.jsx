import React from 'react';
import { FaBed, FaUserCheck, FaSignOutAlt, FaCalendarCheck, FaPercentage, FaCheckCircle } from 'react-icons/fa';

const Card = ({ label, value, sub, subColor, icon, borderColor }) => (
  <div className="stats-card" style={{ borderLeft: `4px solid ${borderColor || 'var(--border)'}`, cursor: 'default' }}>
    <div className="stats-info">
      <span className="stats-label">{label}</span>
      <span className="stats-value" style={{ fontSize: '1.9rem' }}>{value}</span>
      {sub && <span style={{ fontSize: '0.78rem', fontWeight: 700, color: subColor || 'var(--text-secondary)' }}>{sub}</span>}
    </div>
    <div className="stats-icon-wrapper">{icon}</div>
  </div>
);

const ReservationSummaryCards = ({ metrics }) => {
  const m = metrics || {};
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '4px' }}>
      <Card label="Total Rooms"      value={m.totalRooms ?? 120}          sub="All Rooms"                                     icon={<FaBed />}           borderColor="var(--border)" />
      <Card label="Available"        value={m.availableRooms ?? 42}        sub={`${m.availablePercent ?? '35.00'}%`}           subColor="var(--success)"  icon={<FaCheckCircle />}   borderColor="var(--success)" />
      <Card label="Occupied"         value={m.occupiedRooms ?? 71}         sub={`${m.occupiedPercent ?? '59.17'}%`}            subColor="var(--danger)"   icon={<FaUserCheck />}     borderColor="var(--danger)" />
      <Card label="Reserved"         value={m.reservedRooms ?? 15}         sub={`${m.reservedPercent ?? '12.50'}%`}            subColor="var(--warning)"  icon={<FaCalendarCheck />} borderColor="var(--warning)" />
      <Card label="Today's Arrival"  value={m.todaysArrivals ?? 18}        sub="Expected"                                     icon={<FaUserCheck />}     borderColor="var(--info)" />
      <Card label="Today's Departure" value={m.todaysDepartures ?? 12}     sub="Expected"                                     icon={<FaSignOutAlt />}    borderColor="var(--info)" />
      <Card label="Occupancy"        value={`${m.occupancyPercent ?? 82}%`} sub="As of Today"                                 icon={<FaPercentage />}    borderColor="var(--primary)" />
    </div>
  );
};

export default ReservationSummaryCards;
