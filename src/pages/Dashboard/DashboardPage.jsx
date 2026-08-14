import React, { useState, useEffect, memo, useCallback } from 'react';
import DashboardHeader from './DashboardHeader';
import SummaryCards from './SummaryCards';
import QuickActions from './QuickActions';
import OccupancyChart from './OccupancyChart';
import RevenueChart from './RevenueChart';
import HousekeepingChart from './HousekeepingChart';
import FinanceSummary from './FinanceSummary';
import RecentBookings from './RecentBookings';
import RecentCheckIns from './RecentCheckIns';
import RecentCheckOuts from './RecentCheckOuts';
import HousekeepingWidget from './HousekeepingWidget';
import RecentOrders from './RecentOrders';
import DashboardSkeleton from './DashboardSkeleton';
import { useDashboard } from './useDashboard';
import { TIMEFRAME_DATA } from './dashboardData';
import { LuChevronDown, LuChevronUp } from 'react-icons/lu';
import { useFrontDesk } from '../../context/FrontDeskContext';
import { useRestaurant } from '../../context/RestaurantContext';
import { dashboardService } from '../../services/dashboardService';

/* ─── Operational Actionable Sub-Widgets ─── */
const TodayArrivalsWidget = ({ arrivals, rooms, checkInGuest, showToast }) => {
  const availableRooms = rooms.filter(r => r.status === 'Clean');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {arrivals.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '16px', color: '#94a3b8', fontSize: '12px' }}>No arrivals expected today.</div>
      ) : (
        arrivals.map(a => (
          <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '12px', fontWeight: '800', color: '#0f172a' }}>{a.guest}</span>
              <span style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>Time: {a.time} · {a.pax} Pax</span>
            </div>
            <button
              onClick={() => {
                const targetRoom = availableRooms.find(r => r.no === a.room)?.no || availableRooms[0]?.no || a.room;
                checkInGuest(a.id, targetRoom, showToast);
              }}
              style={{ padding: '6px 12px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}
            >
              Check-In
            </button>
          </div>
        ))
      )}
    </div>
  );
};

const TodayDeparturesWidget = ({ departures, checkOutGuest, showToast }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {departures.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '16px', color: '#94a3b8', fontSize: '12px' }}>No departures pending today.</div>
      ) : (
        departures.map(d => (
          <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '12px', fontWeight: '800', color: '#0f172a' }}>{d.guest}</span>
              <span style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>Room {d.room} · Status: {d.status}</span>
            </div>
            <button
              onClick={() => checkOutGuest(d.id, d.room, showToast)}
              style={{ padding: '6px 12px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}
            >
              Checkout
            </button>
          </div>
        ))
      )}
    </div>
  );
};

const DirtyRoomsWidget = ({ rooms, cycleRoomStatus, showToast }) => {
  const dirtyRooms = rooms.filter(r => r.status === 'Dirty');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {dirtyRooms.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '16px', color: '#16a34a', fontSize: '12px', fontWeight: '700' }}>All rooms clean! 🎉</div>
      ) : (
        dirtyRooms.map(r => (
          <div key={r.no} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: '#fff1f2', borderRadius: '8px', border: '1px solid #ffe4e6' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '12px', fontWeight: '800', color: '#9f1239' }}>Room {r.no}</span>
              <span style={{ fontSize: '10px', color: '#be123c', marginTop: '2px' }}>{r.type} classification</span>
            </div>
            <button
              onClick={() => cycleRoomStatus(r.no)}
              style={{ padding: '6px 12px', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}
            >
              Mark Clean
            </button>
          </div>
        ))
      )}
    </div>
  );
};

const RunningTablesWidget = ({ tables, setTables, setOrderItemsMap, logAction, showToast }) => {
  const runningTables = tables.filter(t => t.status === 'Running' || t.status === 'KOT Generated');
  const settleTableBill = (table) => {
    setTables(prev => prev.map(t => {
      if (t.id === table.id) {
        return { ...t, status: 'Blank', amount: 0, waiter: null, captain: null, customer: 'Walk-in', openedAt: null, kots: [], kotCount: 0 };
      }
      return t;
    }));
    setOrderItemsMap(prev => ({
      ...prev,
      [table.id]: []
    }));
    if (showToast) {
      showToast(`Table T${table.no} settled and reset successfully!`, "success");
    }
    logAction('Settled Bill from Dashboard', `Table T${table.no} (₹${table.amount})`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {runningTables.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '16px', color: '#94a3b8', fontSize: '12px' }}>No active dining orders.</div>
      ) : (
        runningTables.map(t => (
          <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: '#fef3c7', borderRadius: '8px', border: '1px solid #fde68a' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '12px', fontWeight: '800', color: '#92400e' }}>Table T{t.no}</span>
              <span style={{ fontSize: '10px', color: '#b45309', marginTop: '2px' }}>Customer: {t.customer} · Amount: ₹{t.amount}</span>
            </div>
            <button
              onClick={() => settleTableBill(t)}
              style={{ padding: '6px 12px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}
            >
              Settle bill
            </button>
          </div>
        ))
      )}
    </div>
  );
};

/* ─── Reusable Card wrapper ─── */
const Card = memo(({ title, accent = '#418A8B', defaultOpen = true, noPad = false, children }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', minWidth: 0, width: '100%', boxSizing: 'border-box' }}>
      <button onClick={() => setOpen(o => !o)} style={{
        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 18px', background: 'none', border: 'none', cursor: 'pointer',
        borderBottom: open ? '1px solid #f1f5f9' : 'none',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
          <div style={{ width: '3.5px', height: '20px', borderRadius: '2px', background: accent, flexShrink: 0 }} />
          <span style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</span>
        </div>
        <span style={{ color: '#64748b', display: 'flex', flexShrink: 0 }}>{open ? <LuChevronUp size={16} /> : <LuChevronDown size={16} />}</span>
      </button>
      {open && <div style={noPad ? {} : { padding: '16px 18px' }}>{children}</div>}
    </div>
  );
});

/* ─── Room Grid (inline, small) ─── */
const STATUS_S = {
  Clean: { color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', dot: '#22c55e' },
  Dirty: { color: '#dc2626', bg: '#fef2f2', border: '#fecaca', dot: '#ef4444' },
  Maintenance: { color: '#d97706', bg: '#fffbeb', border: '#fde68a', dot: '#f59e0b' },
};

const RoomGrid = memo(({ rooms, cycleRoomStatus }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))', gap: '10px' }}>
    {rooms.map(room => {
      const s = STATUS_S[room.status] || STATUS_S.Clean;
      return (
        <div key={room.no} onClick={() => cycleRoomStatus(room.no)} title={`${room.no} — ${room.status}`}
          style={{ padding: '12px 6px', borderRadius: '10px', textAlign: 'center', border: `1px solid ${s.border}`, background: s.bg, cursor: 'pointer', transition: 'transform 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.07)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'none'}
        >
          <div style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>{room.no}</div>
          <div style={{ fontSize: '10px', color: '#475569', margin: '3px 0' }}>{room.type}</div>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: s.dot, margin: '0 auto' }} />
        </div>
      );
    })}
  </div>
));

/* ─── Restaurant Dining Tables Grid (Display Table) ─── */
const DINING_TABLES = [
  { no: '01', seats: 4, status: 'Blank' },
  { no: '02', seats: 2, status: 'Running' },
  { no: '03', seats: 6, status: 'Running' },
  { no: '04', seats: 4, status: 'Paid' },
  { no: '05', seats: 4, status: 'Reserved' },
  { no: '06', seats: 4, status: 'Running' },
  { no: '07', seats: 8, status: 'Paid' },
  { no: '08', seats: 2, status: 'Cleaning' },
  { no: '09', seats: 2, status: 'Running' },
  { no: '10', seats: 4, status: 'Blank' },
  { no: '11', seats: 6, status: 'Running' },
  { no: '12', seats: 4, status: 'Paid' },
];

const TABLE_STATUS_S = {
  Blank: { color: '#64748b', bg: '#f8fafc', border: '#e2e8f0', dot: '#94a3b8' },
  Running: { color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', dot: '#22c55e' },
  Reserved: { color: '#e8590c', bg: '#ffe8cc', border: '#ffd8a8', dot: '#f76707', glow: '0 0 8px rgba(253, 126, 20, 0.4)' },
  Paid: { color: '#0284c7', bg: '#e0f2fe', border: '#bae6fd', dot: '#0ea5e9' },
  Cleaning: { color: '#ca8a04', bg: '#fef9c3', border: '#fef08a', dot: '#eab308' },
};

const DisplayTableGrid = memo(({ tables = [], showToast }) => {
  const navigate = typeof window !== 'undefined' ? window.location : null;
  const displayTables = tables && tables.length > 0 ? tables : [];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(85px, 1fr))', gap: '10px' }}>
      {displayTables.map(table => {
        const s = TABLE_STATUS_S[table.status] || TABLE_STATUS_S.Blank;
        const hasBill = Number(table.amount || 0) > 0;
        return (
          <div
            key={table.id || table.no}
            onClick={() => {
              window.location.href = `#/restaurant/pos-billing?table=${table.id || table.no}`;
              showToast?.(`Opening POS Billing for Table T${table.no}`);
            }}
            title={`Table T${table.no} — ${table.status || 'Available'} · ${table.capacity || table.seats || 4} Pax · ${table.waiter ? `Waiter: ${table.waiter}` : 'No Waiter'}`}
            style={{
              padding: '10px 6px',
              borderRadius: '10px',
              textAlign: 'center',
              border: `1.5px solid ${s.border}`,
              background: s.bg,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              boxShadow: s.glow || '0 1px 3px rgba(0,0,0,0.03)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '3px'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px) scale(1.04)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.08)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = s.glow || '0 1px 3px rgba(0,0,0,0.03)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '0 4px' }}>
              <span style={{ fontSize: '13px', fontWeight: '900', color: '#0f172a' }}>T{table.no}</span>
              <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: s.dot }} />
            </div>

            <span style={{ fontSize: '9px', fontWeight: '700', color: s.color, background: s.bg, padding: '1px 5px', borderRadius: '4px' }}>
              {table.status || 'Available'}
            </span>

            {hasBill ? (
              <span style={{ fontSize: '11px', fontWeight: '900', color: '#15803d', marginTop: '2px' }}>
                ₹{Number(table.amount).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </span>
            ) : (
              <span style={{ fontSize: '9px', color: '#64748b' }}>
                {table.capacity || table.seats || 4} Pax
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
});

/* ─── Revenue Donut ─── */
const RevenuePie = memo(() => {
  const data = [
    { label: 'Rooms', value: 24500, color: '#418A8B' },
    { label: 'Restaurant', value: 15350, color: '#4A9993' },
    { label: 'Banquet', value: 9800, color: '#244E5F' },
    { label: 'Laundry', value: 2400, color: '#f59e0b' },
    { label: 'POS', value: 4800, color: '#10b981' },
  ];
  const total = data.reduce((s, d) => s + d.value, 0);
  const cx = 65, cy = 65, r = 52, inner = 30;
  let angle = -Math.PI / 2;

  const slices = data.map(d => {
    const sweep = (d.value / total) * 2 * Math.PI;
    const x1 = cx + r * Math.cos(angle), y1 = cy + r * Math.sin(angle);
    angle += sweep;
    const x2 = cx + r * Math.cos(angle), y2 = cy + r * Math.sin(angle);
    const xi1 = cx + inner * Math.cos(angle - sweep), yi1 = cy + inner * Math.sin(angle - sweep);
    const xi2 = cx + inner * Math.cos(angle), yi2 = cy + inner * Math.sin(angle);
    const large = sweep > Math.PI ? 1 : 0;
    return { ...d, path: `M${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2} L${xi2},${yi2} A${inner},${inner} 0 ${large},0 ${xi1},${yi1} Z` };
  });

  return (
    <div>
      <div style={{ fontSize: '13px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>Revenue Mix</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        <svg width="130" height="130" viewBox="0 0 130 130" style={{ flexShrink: 0 }}>
          {slices.map((s, i) => (
            <path key={i} d={s.path} fill={s.color} stroke="#fff" strokeWidth="2"
              style={{ cursor: 'pointer', transition: 'opacity 150ms' }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.75'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            />
          ))}
          <text x="65" y="61" textAnchor="middle" style={{ fontSize: '10px', fontWeight: '700', fill: '#475569' }}>Total</text>
          <text x="65" y="75" textAnchor="middle" style={{ fontSize: '15px', fontWeight: '800', fill: '#0f172a' }}>₹{(total / 1000).toFixed(0)}k</text>
        </svg>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', flex: 1 }}>
          {data.map((d, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '13px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: d.color, flexShrink: 0 }} />
              <span style={{ flex: 1, color: '#334155', fontWeight: '700' }}>{d.label}</span>
              <span style={{ fontWeight: '800', color: '#0f172a' }}>₹{(d.value / 1000).toFixed(1)}k</span>
              <span style={{ color: '#475569', width: '32px', textAlign: 'right' }}>{((d.value / total) * 100).toFixed(0)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

/* ─── Main Dashboard Page ─── */
const DashboardPage = ({ showToast }) => {
  const { activeTab, setActiveTab, timeframe, setTimeframe, rooms, cycleRoomStatus, isLoading } = useDashboard(showToast);
  const { arrivals, departures, checkInGuest, checkOutGuest, logAction } = useFrontDesk();
  const { tables, setTables, setOrderItemsMap } = useRestaurant();
  const [stats, setStats] = useState(null);

  const loadStats = useCallback(async () => {
    try {
      const data = await dashboardService.getStats();
      if (data) setStats(data);
    } catch (e) {
      console.warn('Dashboard stats load error:', e);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const handleRefresh = useCallback(() => {
    loadStats();
    showToast?.('Dashboard refreshed with live data');
  }, [loadStats, showToast]);

  if (isLoading) return (
    <div style={{ padding: '24px 28px', backgroundColor: '#F8FAFC', minHeight: '100vh' }}>
      <DashboardSkeleton />
    </div>
  );

  const graphData = TIMEFRAME_DATA[timeframe] || TIMEFRAME_DATA.weekly;

  return (
    <div className="dash-page">

      {/* 1. Header */}
      <DashboardHeader
        activeTab={activeTab} setActiveTab={setActiveTab}
        timeframe={timeframe} setTimeframe={setTimeframe}
        onRefresh={handleRefresh}
        showToast={showToast}
      />

      {/* 2. Summary Cards with 100% Real Live Database Metrics */}
      <SummaryCards rooms={rooms} tables={tables} stats={stats} showToast={showToast} />

      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* 3. Grid: Occupancy Trend + Dept Revenue + Rev Mix */}
          <div className="dash-grid-3">
            <Card title="Occupancy Trend" accent="#418A8B">
              <OccupancyChart data={graphData.occupancy} />
            </Card>
            <Card title="Department Revenue" accent="#2563eb">
              <RevenueChart data={graphData.revenue} />
            </Card>
            <Card title="Revenue Mix" accent="#10b981">
              <RevenuePie />
            </Card>
          </div>

          {/* 5. Room Status + Display Dining Tables + Room Grid */}
          <div className="dash-grid-rooms">
            <Card title="Room Status" accent="#22c55e">
              <HousekeepingChart rooms={rooms} showToast={showToast} />
            </Card>
            <Card title="Display Table" accent="#f59e0b">
              <DisplayTableGrid tables={tables} showToast={showToast} />
            </Card>
            <Card title="Room Grid" accent="#0284c7">
              <RoomGrid rooms={rooms} cycleRoomStatus={cycleRoomStatus} />
            </Card>
          </div>

          {/* 6. Today's Arrivals, Departures, and Dirty Rooms Queue — 3 columns */}
          <div className="dash-grid-3-equal">
            <Card title="Today's Arrivals" accent="#418A8B">
              <TodayArrivalsWidget checkInGuest={checkInGuest} arrivals={arrivals} rooms={rooms} showToast={showToast} />
            </Card>
            <Card title="Today's Departures" accent="#dc2626">
              <TodayDeparturesWidget checkOutGuest={checkOutGuest} departures={departures} showToast={showToast} />
            </Card>
            <Card title="Dirty Rooms (Housekeeping Queue)" accent="#7c3aed">
              <DirtyRoomsWidget rooms={rooms} cycleRoomStatus={cycleRoomStatus} showToast={showToast} />
            </Card>
          </div>

          {/* 7. POS Table settlements + Recent Orders */}
          <div className="dash-grid-2">
            <Card title="Running Table Orders" accent="#d97706">
              <RunningTablesWidget tables={tables} setTables={setTables} setOrderItemsMap={setOrderItemsMap} logAction={logAction} showToast={showToast} />
            </Card>
            <Card title="Recent Restaurant Orders" accent="#10b981">
              <RecentOrders stats={stats} tables={tables} showToast={showToast} />
            </Card>
          </div>

          {/* 8. Finance Summary — Expanded by default */}
          <Card title="Finance Summary" accent="#15803d" defaultOpen={true}>
            <FinanceSummary stats={stats} tables={tables} showToast={showToast} />
          </Card>

        </div>
      )}

      {activeTab === 'reservations' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="dash-grid-3-equal">
            <Card title="Recent Reservations" accent="#418A8B">
              <RecentBookings showToast={showToast} />
            </Card>
            <Card title="Recent Check-Ins" accent="#16a34a">
              <RecentCheckIns showToast={showToast} />
            </Card>
            <Card title="Recent Check-Outs" accent="#dc2626">
              <RecentCheckOuts showToast={showToast} />
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'outlets' && (
        <div className="dash-grid-2">
          <Card title="Recent Restaurant Orders" accent="#d97706">
            <RecentOrders stats={stats} tables={tables} showToast={showToast} />
          </Card>
          <Card title="Revenue Mix" accent="#10b981">
            <RevenuePie />
          </Card>
        </div>
      )}

      {activeTab === 'banquets' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Card title="Finance Summary" accent="#15803d">
            <FinanceSummary stats={stats} tables={tables} showToast={showToast} />
          </Card>
        </div>
      )}

    </div>
  );
};

export default DashboardPage;
