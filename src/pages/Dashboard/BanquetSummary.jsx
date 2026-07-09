import React from 'react';
import { BANQUET_DETAILS } from './dashboardData';
import { LuCalendarDays, LuShieldAlert, LuBadgeAlert } from 'react-icons/lu';

const BanquetSummary = ({ showToast }) => {
  const banquetStats = [
    { label: "Upcoming Events", value: "4 Events", icon: LuCalendarDays, color: '#9333ea', bg: '#faf5ff' },
    { label: "Today's Events", value: "1 Event", icon: LuCalendarDays, color: '#16a34a', bg: '#f0fdf4' },
    { label: "Advance Received", value: "₹1,500", icon: LuShieldAlert, color: '#0d9488', bg: '#f0fdfa' },
    { label: "Pending Payments", value: "₹3,000", icon: LuBadgeAlert, color: '#ef4444', bg: '#fee2e2' }
  ];

  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      border: '1px solid #e2e8f0',
      padding: '24px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    }}>
      {/* Title */}
      <div>
        <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#244E5F', margin: 0 }}>
          Banquets & Event Halls Bookings
        </h3>
        <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0', fontWeight: '500' }}>
          Realtime schedule of social events, conventions and hall bookings
        </p>
      </div>

      {/* KPI Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: '16px'
      }}>
        {banquetStats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '16px',
              borderRadius: '12px',
              backgroundColor: stat.bg,
              border: '1px solid #f1f5f9'
            }}>
              <div style={{
                padding: '8px',
                borderRadius: '8px',
                backgroundColor: '#ffffff',
                color: stat.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
              }}>
                <Icon size={18} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>{stat.label}</span>
                <span style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', marginTop: '2px' }}>{stat.value}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Banquet Booking Table */}
      <div>
        <h4 style={{ fontSize: '13px', fontWeight: '800', color: '#475569', margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Hall Reservations
        </h4>
        <div style={{ overflowX: 'auto', border: '1px solid #f1f5f9', borderRadius: '8px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '1000px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                <th style={{ padding: '10px 12px', fontSize: '11px', color: '#475569', fontWeight: '700' }}>Venue Name</th>
                <th style={{ padding: '10px 12px', fontSize: '11px', color: '#475569', fontWeight: '700' }}>Booking No & Date</th>
                <th style={{ padding: '10px 12px', fontSize: '11px', color: '#475569', fontWeight: '700' }}>Booked By</th>
                <th style={{ padding: '10px 12px', fontSize: '11px', color: '#475569', fontWeight: '700' }}>Function Details</th>
                <th style={{ padding: '10px 12px', fontSize: '11px', color: '#475569', fontWeight: '700' }}>Schedule Time</th>
                <th style={{ padding: '10px 12px', fontSize: '11px', color: '#475569', fontWeight: '700' }}>Pax</th>
                <th style={{ padding: '10px 12px', fontSize: '11px', color: '#475569', fontWeight: '700' }}>Gross Amt</th>
              </tr>
            </thead>
            <tbody>
              {BANQUET_DETAILS.map((b, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #f8fafc', transition: 'background-color 100ms' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'} onClick={() => showToast && showToast(`Banquet Booking: ${b.bookNo}`)}>
                  <td style={{ padding: '10px 12px', fontSize: '13px', fontWeight: '700', color: '#244E5F' }}>{b.venueName}</td>
                  <td style={{ padding: '10px 12px', fontSize: '12px', color: '#334155' }}>
                    <div style={{ fontWeight: '600', color: '#418A8B' }}>{b.bookNo}</div>
                    <div style={{ fontSize: '10px', color: '#94a3b8' }}>Booked: {b.date}</div>
                  </td>
                  <td style={{ padding: '10px 12px', fontSize: '12px', color: '#334155' }}>
                    <div style={{ fontWeight: '700' }}>{b.bookedBy}</div>
                    <div style={{ fontSize: '10px', color: '#64748b' }}>{b.mobile}</div>
                  </td>
                  <td style={{ padding: '10px 12px', fontSize: '12px', color: '#334155' }}>
                    <div style={{ fontWeight: '600' }}>{b.functionType}</div>
                    <div style={{ fontSize: '10px', color: '#94a3b8' }}>Company: {b.company}</div>
                  </td>
                  <td style={{ padding: '10px 12px', fontSize: '11px', color: '#475569' }}>
                    <div>From: {b.fromDate} {b.fromTime}</div>
                    <div>To: {b.toDate} {b.toTime}</div>
                  </td>
                  <td style={{ padding: '10px 12px', fontSize: '12px', color: '#334155', fontWeight: '600' }}>{b.pax} Guests</td>
                  <td style={{ padding: '10px 12px', fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>{b.grossAmt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BanquetSummary;
