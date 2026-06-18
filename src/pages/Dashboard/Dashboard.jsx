import React, { useState } from 'react';
import { 
  FaCalendarCheck, 
  FaUserCheck, 
  FaSignOutAlt, 
  FaPlaneDeparture,
  FaBed,
  FaUtensils,
  FaGlassCheers,
  FaShoppingCart,
  FaBroom,
  FaClipboardList,
  FaHotel,
  FaFileAlt,
  FaChartLine,
  FaChartPie
} from 'react-icons/fa';
import StatsCard from '../../components/cards/StatsCard';

const Dashboard = ({ showToast }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeframe, setTimeframe] = useState('weekly'); // 'daily', 'weekly', 'monthly', 'yearly'
  
  // Interactive Housekeeping State (Room Status)
  const [rooms, setRooms] = useState([
    { no: '101', type: 'Standard', status: 'Clean' },
    { no: '102', type: 'Standard', status: 'Dirty' },
    { no: '103', type: 'Deluxe', status: 'Clean' },
    { no: '104', type: 'Deluxe', status: 'Maintenance' },
    { no: '201', type: 'Suite', status: 'Clean' },
    { no: '202', type: 'Suite', status: 'Dirty' },
    { no: '203', type: 'Executive', status: 'Clean' },
    { no: '204', type: 'Executive', status: 'Clean' }
  ]);

  const cycleRoomStatus = (roomNo) => {
    setRooms(rooms.map(room => {
      if (room.no === roomNo) {
        let newStatus = 'Clean';
        if (room.status === 'Clean') newStatus = 'Dirty';
        else if (room.status === 'Dirty') newStatus = 'Maintenance';
        else newStatus = 'Clean';
        
        showToast(`Room ${roomNo} status updated to: ${newStatus}`);
        return { ...room, status: newStatus };
      }
      return room;
    }));
  };

  const tabs = [
    { id: 'overview', name: 'Main Overview', icon: FaHotel },
    { id: 'reservations', name: 'Reservations & Stays', icon: FaCalendarCheck },
    { id: 'outlets', name: 'Outlets & Dining', icon: FaUtensils },
    { id: 'banquets', name: 'Banquets & Purchase', icon: FaGlassCheers }
  ];

  // Stats Card KPI data (Populated from prompt details)
  const kpis = [
    { id: 'booking', title: 'Today Booking', value: '0', icon: FaCalendarCheck, color: 'var(--primary)' },
    { id: 'checkin', title: 'Today CHECKIN', value: '0', icon: FaUserCheck, color: 'var(--secondary)' },
    { id: 'checkout', title: 'Today Checkout', value: '0', icon: FaSignOutAlt, color: 'var(--dark)' },
    { id: 'departure', title: 'Expected Departure', value: '1', icon: FaPlaneDeparture, color: '#f59e0b' }
  ];

  // Occupancy Analysis data
  const occupancyAnalysis = [
    { desc: 'Day Use', today: '0', mtd: '0' },
    { desc: 'Management Block', today: '0', mtd: '0' },
    { desc: 'No. of FOM Bill Canceled', today: '0', mtd: '0' },
    { desc: 'Occupancy %', today: '6.67', mtd: '6.67' },
    { desc: 'Total Rooms', today: '30', mtd: '900' },
    { desc: 'Total Rooms Sold', today: '0', mtd: '18' }
  ];

  // Booking Detail Mock rows (Includes headers requested)
  const bookings = [
    { no: 'BK-10029', date: '17-06-2026', name: 'Alice Smith', company: 'Microsoft', mobile: '+1 (555) 102-9902', city: 'Seattle', arrDate: '18-06-2026', deptDate: '21-06-2026', category: 'Premium Deluxe King', plan: 'EP', pax: '2', rooms: '1', status: 'Confirmed' }
  ];

  // CheckIn Detail Mock rows
  const checkins = [
    { room: '104', name: 'John Doe', pax: '2', grc: 'GRC-8902', company: 'Google Inc.', plan: 'CP', arrDate: '17-06-2026', arrTime: '11:45 AM', amt: 'Rs. 450.00' }
  ];

  // CheckOut Detail Mock rows
  const checkouts = [
    { room: '102', name: 'Robert Johnson', pax: '1', billNo: 'BL-9801', company: 'Self Paid', billAmt: 'Rs. 180.00', payMode: 'Visa Card' }
  ];

  // Graph Mock Data Switcher based on Timeframe Filter
  const getGraphData = () => {
    switch (timeframe) {
      case 'daily':
        return {
          labels: ['08 AM', '12 PM', '04 PM', '08 PM', '12 AM'],
          revenue: [600, 1200, 800, 1800, 400],
          occupancy: [30, 45, 55, 78, 65],
          donut: [
            { label: 'Deluxe', value: 45, color: 'var(--primary)' },
            { label: 'Suite', value: 35, color: 'var(--secondary)' },
            { label: 'Standard', value: 20, color: 'var(--dark)' }
          ],
          totalOccupied: 21
        };
      case 'monthly':
        return {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          revenue: [45000, 52000, 49000, 68000, 75000, 92000],
          occupancy: [60, 65, 62, 70, 78, 85],
          donut: [
            { label: 'Deluxe', value: 50, color: 'var(--primary)' },
            { label: 'Suite', value: 30, color: 'var(--secondary)' },
            { label: 'Standard', value: 20, color: 'var(--dark)' }
          ],
          totalOccupied: 24
        };
      case 'yearly':
        return {
          labels: ['2023', '2024', '2025', '2026'],
          revenue: [450000, 580000, 620000, 780000],
          occupancy: [55, 68, 72, 785],
          donut: [
            { label: 'Deluxe', value: 55, color: 'var(--primary)' },
            { label: 'Suite', value: 25, color: 'var(--secondary)' },
            { label: 'Standard', value: 20, color: 'var(--dark)' }
          ],
          totalOccupied: 23
        };
      case 'weekly':
      default:
        return {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          revenue: [2800, 3400, 3100, 4200, 5600, 6200, 3840],
          occupancy: [65, 70, 68, 75, 88, 92, 78.5],
          donut: [
            { label: 'Deluxe', value: 40, color: 'var(--primary)' },
            { label: 'Suite', value: 40, color: 'var(--secondary)' },
            { label: 'Standard', value: 20, color: 'var(--dark)' }
          ],
          totalOccupied: 22
        };
    }
  };

  const graphData = getGraphData();

  return (
    <div>
      {/* Tab Navigation header */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '28px', borderBottom: '1px solid var(--border)', paddingBottom: '12px', flexWrap: 'wrap' }}>
        {tabs.map((tab) => {
          const TabIcon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                showToast(`Switched Dashboard View to: ${tab.name}`);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                borderRadius: '30px',
                border: '1px solid transparent',
                fontSize: '0.9rem',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'var(--transition)',
                backgroundColor: activeTab === tab.id ? 'var(--primary)' : 'transparent',
                color: activeTab === tab.id ? '#ffffff' : 'var(--text-secondary)',
                borderColor: activeTab === tab.id ? 'var(--primary)' : 'var(--border)'
              }}
            >
              <TabIcon size={14} />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </div>

      {/* KPI Stats Section */}
      <section className="stats-grid">
        {kpis.map((kpi) => (
          <div key={kpi.id} onClick={() => showToast(`Selected KPI metric: ${kpi.title}`)}>
            <StatsCard
              title={kpi.title}
              value={kpi.value}
              icon={kpi.icon}
            />
          </div>
        ))}
      </section>

      {/* Timeframe Selector (Only for Overview analytics display) */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', backgroundColor: '#ffffff', padding: '16px 24px', borderRadius: '18px', border: '1px solid var(--border)', flexWrap: 'wrap', gap: '16px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaChartLine color="var(--primary)" />
            <span style={{ fontWeight: '700', color: 'var(--dark)' }}>Visual Revenue & Occupancy Analysis</span>
          </div>
          <div style={{ display: 'flex', gap: '6px', border: '1px solid var(--border)', borderRadius: '30px', padding: '4px', backgroundColor: 'var(--background)' }}>
            {['daily', 'weekly', 'monthly', 'yearly'].map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTimeframe(t);
                  showToast(`Graph timeframe updated to: ${t.toUpperCase()}`);
                }}
                style={{
                  border: 'none',
                  padding: '6px 16px',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'var(--transition)',
                  backgroundColor: timeframe === t ? 'var(--primary)' : 'transparent',
                  color: timeframe === t ? '#ffffff' : 'var(--text-secondary)'
                }}
              >
                {t.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT Switcher */}
      
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>
          
          {/* Dual Graph Analytics Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.15fr', gap: '36px' }}>
            {/* 1. Line Graph & Bar Graph Dashboard */}
            <section className="dashboard-panel">
              <div className="panel-header">
                <h3 className="panel-title">Revenue Trend ({timeframe.toUpperCase()})</h3>
                <span className="status-badge available" style={{ fontSize: '0.7rem' }}>Dynamic Line Graph</span>
              </div>
              
              <div style={{ padding: '10px 0' }}>
                <svg viewBox="0 0 500 200" style={{ width: '100%', overflow: 'visible' }}>
                  {/* Guidelines */}
                  <line x1="40" y1="20" x2="480" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="40" y1="70" x2="480" y2="70" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="40" y1="120" x2="480" y2="120" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="40" y1="170" x2="480" y2="170" stroke="var(--border)" strokeWidth="1.5" />
                  
                  {/* Generate Path Coordinates dynamically */}
                  {(() => {
                    const maxVal = Math.max(...graphData.revenue);
                    const coords = graphData.revenue.map((val, idx) => {
                      const spacing = 440 / (graphData.revenue.length - 1);
                      const x = 40 + idx * spacing;
                      const y = 170 - (val / maxVal) * 130;
                      return { x, y, val };
                    });
                    
                    const linePath = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x} ${c.y}`).join(' ');
                    const areaPath = `${linePath} L ${coords[coords.length-1].x} 170 L ${coords[0].x} 170 Z`;
                    
                    return (
                      <g>
                        <defs>
                          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        {/* Area */}
                        <path d={areaPath} fill="url(#areaGradient)" />
                        {/* Line */}
                        <path d={linePath} fill="none" stroke="var(--primary)" strokeWidth="3" />
                        
                        {/* Points */}
                        {coords.map((c, i) => (
                          <g key={i} className="chart-bar-group" onClick={() => showToast(`Revenue: Rs. ${c.val.toLocaleString()}`)} style={{ cursor: 'pointer' }}>
                            <circle cx={c.x} cy={c.y} r="6" fill="var(--surface)" stroke="var(--primary)" strokeWidth="3" className="chart-rect" />
                            <text x={c.x} y={c.y - 12} textAnchor="middle" className="chart-value-label" style={{ opacity: 1, fontSize: '9px', fontWeight: '800', fill: 'var(--dark)' }}>
                              Rs.{c.val >= 1000 ? (c.val / 1000).toFixed(1) + 'k' : c.val}
                            </text>
                            <text x={c.x} y="190" textAnchor="middle" className="chart-label">{graphData.labels[i]}</text>
                          </g>
                        ))}
                      </g>
                    );
                  })()}
                </svg>
              </div>
            </section>

            {/* 2. Circular Donut Graph */}
            <section className="dashboard-panel">
              <div className="panel-header">
                <h3 className="panel-title">Occupancy Breakdown</h3>
                <span className="status-badge pending" style={{ fontSize: '0.7rem' }}>Circular Graph</span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', padding: '10px 0' }}>
                <svg viewBox="0 0 160 160" style={{ width: '150px', height: '150px' }}>
                  {/* Donut slice generators */}
                  {(() => {
                    let total = graphData.donut.reduce((acc, curr) => acc + curr.value, 0);
                    let accumulatedPercent = 0;
                    
                    return graphData.donut.map((slice, idx) => {
                      const percent = slice.value / total;
                      const r = 50;
                      const C = 2 * Math.PI * r; // 314.159
                      const strokeDasharray = `${percent * C} ${C}`;
                      const strokeDashoffset = -accumulatedPercent * C;
                      accumulatedPercent += percent;
                      
                      return (
                        <circle
                          key={idx}
                          cx="80"
                          cy="80"
                          r={r}
                          fill="transparent"
                          stroke={slice.color}
                          strokeWidth="20"
                          strokeDasharray={strokeDasharray}
                          strokeDashoffset={strokeDashoffset}
                          transform="rotate(-90 80 80)"
                          onClick={() => showToast(`${slice.label} Category: ${slice.value}% Share`)}
                          style={{ cursor: 'pointer', transition: 'var(--transition)' }}
                        />
                      );
                    });
                  })()}
                  
                  {/* Center details */}
                  <circle cx="80" cy="80" r="38" fill="var(--surface)" />
                  <text x="80" y="76" textAnchor="middle" style={{ fontSize: '10px', fontWeight: '700', fill: 'var(--text-secondary)' }}>OCCUPIED</text>
                  <text x="80" y="94" textAnchor="middle" style={{ fontSize: '16px', fontWeight: '800', fill: 'var(--dark)' }}>
                    {graphData.totalOccupied} Rms
                  </text>
                </svg>

                {/* Donut Legend */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', width: '100%', flexWrap: 'wrap' }}>
                  {graphData.donut.map((slice, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                      <div style={{ width: '12px', height: '12px', borderRadius: '4px', backgroundColor: slice.color }} />
                      <span>{slice.label} ({slice.value}%)</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>

          <div className="dashboard-grid">
            {/* Left panel: Occupancy Analysis */}
            <section className="dashboard-panel">
              <div className="panel-header">
                <h3 className="panel-title">Occupancy Performance Analysis</h3>
                <span className="status-badge available" style={{ fontSize: '0.7rem' }}>Live Stats</span>
              </div>

              <div className="custom-table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Occupancy Metric Description</th>
                      <th>Today</th>
                      <th>MTD (Month To Date)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {occupancyAnalysis.map((row, idx) => (
                      <tr key={idx} onClick={() => showToast(`Selected Occupancy Item: ${row.desc}`)}>
                        <td style={{ fontWeight: '700', color: 'var(--dark)' }}>{row.desc}</td>
                        <td style={{ fontWeight: '700', color: 'var(--primary)' }}>{row.today}</td>
                        <td style={{ fontWeight: '600' }}>{row.mtd}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Right panel: Housekeeping status grid */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              <section className="dashboard-panel">
                <div className="panel-header">
                  <div>
                    <h3 className="panel-title">Interactive Housekeeping Grid</h3>
                    <p className="text-secondary" style={{ fontSize: '0.75rem', marginTop: '4px' }}>Click on any room to toggle/cycle cleaning statuses.</p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                  {rooms.map((room) => (
                    <div
                      key={room.no}
                      onClick={() => cycleRoomStatus(room.no)}
                      style={{
                        padding: '12px',
                        borderRadius: '12px',
                        border: '1px solid var(--border)',
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'var(--transition)',
                        backgroundColor: room.status === 'Clean' ? 'var(--success-light)' :
                                        room.status === 'Dirty' ? 'var(--danger-light)' : 'var(--warning-light)',
                        borderColor: room.status === 'Clean' ? 'var(--success)' :
                                     room.status === 'Dirty' ? 'var(--danger)' : 'var(--warning)'
                      }}
                    >
                      <div style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--dark)' }}>{room.no}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: '600', marginTop: '4px' }}>{room.type}</div>
                      <div style={{
                        display: 'inline-block',
                        marginTop: '6px',
                        fontSize: '0.65rem',
                        fontWeight: '700',
                        padding: '2px 6px',
                        borderRadius: '10px',
                        color: room.status === 'Clean' ? 'var(--success)' :
                               room.status === 'Dirty' ? 'var(--danger)' : 'var(--warning)',
                        backgroundColor: '#ffffff'
                      }}>
                        {room.status}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'reservations' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>
          {/* Booking Detail Table */}
          <section className="dashboard-panel">
            <div className="panel-header">
              <h3 className="panel-title">Today's Booking Entries</h3>
              <span className="panel-action" onClick={() => showToast("Add Booking details clicked")}>New Booking</span>
            </div>
            
            <div className="custom-table-container">
              <table className="custom-table" style={{ minWidth: '900px' }}>
                <thead>
                  <tr>
                    <th>Booking No</th>
                    <th>Date</th>
                    <th>Name</th>
                    <th>Company</th>
                    <th>Mobile No</th>
                    <th>City</th>
                    <th>Arr. Date</th>
                    <th>Dept. Date</th>
                    <th>Category</th>
                    <th>Plan</th>
                    <th>Pax</th>
                    <th>Rooms</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b.no} onClick={() => showToast(`Selected Booking Reference: ${b.no}`)}>
                      <td style={{ fontWeight: '700', color: 'var(--primary)' }}>{b.no}</td>
                      <td>{b.date}</td>
                      <td style={{ fontWeight: '700' }}>{b.name}</td>
                      <td>{b.company}</td>
                      <td>{b.mobile}</td>
                      <td>{b.city}</td>
                      <td>{b.arrDate}</td>
                      <td>{b.deptDate}</td>
                      <td>{b.category}</td>
                      <td style={{ fontWeight: '600' }}>{b.plan}</td>
                      <td>{b.pax}</td>
                      <td style={{ fontWeight: '600' }}>{b.rooms}</td>
                      <td><span className="status-badge pending">{b.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* CheckIn Detail Table */}
          <section className="dashboard-panel">
            <div className="panel-header">
              <h3 className="panel-title">Today's Guest Check-Ins</h3>
            </div>
            
            <div className="custom-table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Room No.</th>
                    <th>Guest Name</th>
                    <th>Pax</th>
                    <th>GRC No</th>
                    <th>Company Name</th>
                    <th>Plan</th>
                    <th>Arr. Date</th>
                    <th>Arr. Time</th>
                    <th>Amt</th>
                  </tr>
                </thead>
                <tbody>
                  {checkins.map((c, idx) => (
                    <tr key={idx} onClick={() => showToast(`Selected Stay Details: Room ${c.room}`)}>
                      <td style={{ fontWeight: '700', color: 'var(--primary)' }}>{c.room}</td>
                      <td style={{ fontWeight: '700' }}>{c.name}</td>
                      <td>{c.pax}</td>
                      <td style={{ fontWeight: '600' }}>{c.grc}</td>
                      <td>{c.company}</td>
                      <td style={{ fontWeight: '600' }}>{c.plan}</td>
                      <td>{c.arrDate}</td>
                      <td>{c.arrTime}</td>
                      <td style={{ fontWeight: '700', color: 'var(--dark)' }}>{c.amt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* CheckOut Detail Table */}
          <section className="dashboard-panel">
            <div className="panel-header">
              <h3 className="panel-title">Today's Guest Checkouts</h3>
            </div>
            
            <div className="custom-table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Room No.</th>
                    <th>Guest Name</th>
                    <th>Pax</th>
                    <th>Bill No</th>
                    <th>Company Name</th>
                    <th>Bill Amt</th>
                    <th>Payment Mode</th>
                  </tr>
                </thead>
                <tbody>
                  {checkouts.map((co, idx) => (
                    <tr key={idx} onClick={() => showToast(`View invoice details: ${co.billNo}`)}>
                      <td style={{ fontWeight: '700', color: 'var(--primary)' }}>{co.room}</td>
                      <td style={{ fontWeight: '700' }}>{co.name}</td>
                      <td>{co.pax}</td>
                      <td style={{ fontWeight: '600' }}>{co.billNo}</td>
                      <td>{co.company}</td>
                      <td style={{ fontWeight: '700', color: 'var(--dark)' }}>{co.billAmt}</td>
                      <td style={{ fontWeight: '600' }}>{co.payMode}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {activeTab === 'outlets' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>
          {/* Outlet Detail */}
          <section className="dashboard-panel">
            <div className="panel-header" style={{ borderBottom: 'none', paddingBottom: '0' }}>
              <div>
                <h3 className="panel-title">POS Restaurant & Outlets Summary</h3>
                <p className="text-secondary" style={{ fontSize: '0.85rem', marginTop: '4px' }}>Overview of revenue registers for outlets.</p>
              </div>
              <div style={{ padding: '8px 16px', borderRadius: '10px', backgroundColor: 'var(--danger-light)', color: 'var(--danger)', fontWeight: '700', fontSize: '0.85rem' }}>
                Total NetAmount: Rs. 0.00
              </div>
            </div>

            <div className="custom-table-container" style={{ marginTop: '16px' }}>
              <table className="custom-table" style={{ minWidth: '850px' }}>
                <thead>
                  <tr>
                    <th>Outlet Name</th>
                    <th>Gross Amt</th>
                    <th>Taxable Amt</th>
                    <th>Non Taxable Amt</th>
                    <th>Discount</th>
                    <th>SGST</th>
                    <th>CGST</th>
                    <th>Round Off</th>
                    <th>Net Amt</th>
                  </tr>
                </thead>
                <tbody>
                  <tr onClick={() => showToast("Lobby Restaurant select (Dummy)")}>
                    <td style={{ fontWeight: '700', color: 'var(--primary)' }}>Lobby Coffee Lounge</td>
                    <td>Rs. 0.00</td>
                    <td>Rs. 0.00</td>
                    <td>Rs. 0.00</td>
                    <td>Rs. 0.00</td>
                    <td>Rs. 0.00</td>
                    <td>Rs. 0.00</td>
                    <td>Rs. 0.00</td>
                    <td style={{ fontWeight: '700' }}>Rs. 0.00</td>
                  </tr>
                  <tr onClick={() => showToast("Poolside Bar select (Dummy)")}>
                    <td style={{ fontWeight: '700', color: 'var(--primary)' }}>Poolside Grill & Bar</td>
                    <td>Rs. 0.00</td>
                    <td>Rs. 0.00</td>
                    <td>Rs. 0.00</td>
                    <td>Rs. 0.00</td>
                    <td>Rs. 0.00</td>
                    <td>Rs. 0.00</td>
                    <td>Rs. 0.00</td>
                    <td style={{ fontWeight: '700' }}>Rs. 0.00</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Outlet Order */}
          <section className="dashboard-panel">
            <div className="panel-header" style={{ borderBottom: 'none', paddingBottom: '0' }}>
              <div>
                <h3 className="panel-title">Active Outlet Orders List</h3>
                <p className="text-secondary" style={{ fontSize: '0.85rem', marginTop: '4px' }}>Pending KOT tickets and ongoing restaurant orders.</p>
              </div>
              <div style={{ padding: '8px 16px', borderRadius: '10px', backgroundColor: 'var(--danger-light)', color: 'var(--danger)', fontWeight: '700', fontSize: '0.85rem' }}>
                Total Amount: Rs. 0.00
              </div>
            </div>

            <div className="custom-table-container" style={{ marginTop: '16px' }}>
              <table className="custom-table" style={{ minWidth: '900px' }}>
                <thead>
                  <tr>
                    <th>Outlet Name</th>
                    <th>Table / Room</th>
                    <th>KOT</th>
                    <th>ItemName</th>
                    <th>Qty</th>
                    <th>Time</th>
                    <th>Status</th>
                    <th>Steward</th>
                    <th>Bill No</th>
                    <th>Amt</th>
                    <th>Void KOT</th>
                  </tr>
                </thead>
                <tbody>
                  <tr onClick={() => showToast("Selected KOT details: KOT-9021")}>
                    <td style={{ fontWeight: '700', color: 'var(--primary)' }}>Lobby Coffee Lounge</td>
                    <td>Table 05</td>
                    <td>#KOT-9021</td>
                    <td>Capuccino Latte</td>
                    <td>2</td>
                    <td>12:30 PM</td>
                    <td><span className="status-badge pending">Served</span></td>
                    <td>Steward. Mike</td>
                    <td>-</td>
                    <td style={{ fontWeight: '700' }}>Rs. 12.00</td>
                    <td>
                      <button style={{ border: 'none', background: 'none', color: 'var(--danger)', fontWeight: '700', cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); showToast("Void KOT triggered (Dummy)"); }}>
                        Void
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {activeTab === 'banquets' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>
          {/* Banquet Detail */}
          <section className="dashboard-panel">
            <div className="panel-header">
              <h3 className="panel-title">Banquet Halls bookings details</h3>
            </div>
            
            <div className="custom-table-container">
              <table className="custom-table" style={{ minWidth: '1000px' }}>
                <thead>
                  <tr>
                    <th>Venue Name</th>
                    <th>Date</th>
                    <th>Book No</th>
                    <th>Booked By</th>
                    <th>Mobile No</th>
                    <th>Function Type</th>
                    <th>Address</th>
                    <th>City</th>
                    <th>Company</th>
                    <th>From Date</th>
                    <th>From Time</th>
                    <th>To Date</th>
                    <th>To Time</th>
                    <th>Pax</th>
                    <th>Gross Amt</th>
                  </tr>
                </thead>
                <tbody>
                  <tr onClick={() => showToast("Selected Banquet Booking details: BQ-081")}>
                    <td style={{ fontWeight: '700', color: 'var(--primary)' }}>Grand Ballroom A</td>
                    <td>17-06-2026</td>
                    <td>#BQ-0812</td>
                    <td style={{ fontWeight: '600' }}>Zoya Khan</td>
                    <td>+1 (555) 902-1822</td>
                    <td>Corporate Gala</td>
                    <td>42 Park Row</td>
                    <td>New York</td>
                    <td>Alfa Group Ltd</td>
                    <td>17-06-2026</td>
                    <td>04:00 PM</td>
                    <td>17-06-2026</td>
                    <td>10:00 PM</td>
                    <td>150</td>
                    <td style={{ fontWeight: '700', color: 'var(--dark)' }}>Rs. 4,500.00</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Purchase Detail */}
          <section className="dashboard-panel">
            <div className="panel-header">
              <h3 className="panel-title">Hotel Vendor Purchase & Stock Entries</h3>
            </div>
            
            <div className="custom-table-container">
              <table className="custom-table" style={{ minWidth: '1000px' }}>
                <thead>
                  <tr>
                    <th>Party Name</th>
                    <th>City</th>
                    <th>V.No.</th>
                    <th>Party Bill No</th>
                    <th>Gross Amt</th>
                    <th>Discount</th>
                    <th>SGST</th>
                    <th>CGST</th>
                    <th>IGST</th>
                    <th>CESS</th>
                    <th>Round Off</th>
                    <th>Net Amt</th>
                  </tr>
                </thead>
                <tbody>
                  <tr onClick={() => showToast("Selected Purchase Invoice: P-8092")}>
                    <td style={{ fontWeight: '700', color: 'var(--primary)' }}>Metro Linens Corp</td>
                    <td>New York</td>
                    <td>#V-8092</td>
                    <td>PL-89201</td>
                    <td>Rs. 800.00</td>
                    <td>Rs. 40.00</td>
                    <td>Rs. 36.00</td>
                    <td>Rs. 36.00</td>
                    <td>Rs. 0.00</td>
                    <td>Rs. 0.00</td>
                    <td>Rs. 0.00</td>
                    <td style={{ fontWeight: '700', color: 'var(--dark)' }}>Rs. 832.00</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
