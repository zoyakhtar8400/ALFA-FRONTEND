import React, { memo } from 'react';
import { 
  LuLayoutDashboard, LuCalendarCheck, LuUtensils, LuHotel, LuRefreshCw,
  LuCalendarPlus, LuUserPlus, LuLogIn, LuLogOut
} from 'react-icons/lu';

const TABS = [
  { id: 'overview',     label: 'Overview',         icon: LuLayoutDashboard },
  { id: 'reservations', label: 'Reservations',      icon: LuCalendarCheck },
  { id: 'outlets',      label: 'Outlets & Dining',  icon: LuUtensils },
  { id: 'banquets',     label: 'Banquets',          icon: LuHotel },
];

const TIMEFRAMES = ['Daily', 'Weekly', 'Monthly', 'Yearly'];

const DashboardHeader = memo(({ activeTab, setActiveTab, timeframe, setTimeframe, onRefresh, showToast }) => {
  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const headerActions = [
    { title: "New Booking", icon: LuCalendarPlus, color: '#ffffff', bg: 'linear-gradient(135deg, #418A8B 0%, #244E5F 100%)', shadow: 'rgba(65, 138, 139, 0.3)' },
    { title: "Walk-In Guest", icon: LuUserPlus, color: '#ffffff', bg: 'linear-gradient(135deg, #4A9993 0%, #2c605c 100%)', shadow: 'rgba(74, 153, 147, 0.3)' },
    { title: "Check-In", icon: LuLogIn, color: '#ffffff', bg: 'linear-gradient(135deg, #22c55e 0%, #15803d 100%)', shadow: 'rgba(34, 197, 94, 0.3)' },
    { title: "Check-Out", icon: LuLogOut, color: '#ffffff', bg: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)', shadow: 'rgba(239, 68, 68, 0.3)' }
  ];

  return (
    <div style={{ marginBottom: '24px', width: '100%', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '16px', width: '100%', boxSizing: 'border-box' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#244E5F', margin: 0, letterSpacing: '-0.5px' }}>
            Hotel Dashboard
          </h1>
          <p style={{ fontSize: '14px', color: '#475569', margin: '4px 0 0', fontWeight: '500' }}>{today}</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap', maxWidth: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', maxWidth: '100%' }}>
            {activeTab === 'overview' && (
              <div style={{ display: 'flex', gap: '2px', background: '#f1f5f9', borderRadius: '8px', padding: '3px', flexWrap: 'wrap' }}>
                {TIMEFRAMES.map(t => (
                  <button key={t} onClick={() => setTimeframe(t.toLowerCase())}
                    style={{
                      border: 'none', padding: '6px 12px', borderRadius: '6px',
                      fontSize: '13px', fontWeight: '700', cursor: 'pointer', transition: 'all 150ms',
                      background: timeframe === t.toLowerCase() ? '#fff' : 'transparent',
                      color: timeframe === t.toLowerCase() ? '#244E5F' : '#475569',
                      boxShadow: timeframe === t.toLowerCase() ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                    }}
                  >{t}</button>
                ))}
              </div>
            )}
            <button onClick={onRefresh}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 16px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#fff', fontSize: '13px', fontWeight: '600', color: '#334155', cursor: 'pointer', transition: 'all 150ms' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#418A8B'; e.currentTarget.style.color = '#418A8B'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#64748b'; }}
            >
              <LuRefreshCw size={14} /> Refresh
            </button>
          </div>

          {activeTab === 'overview' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', maxWidth: '100%' }}>
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', marginRight: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Quick Action:
              </span>
              {headerActions.map((act, i) => {
                const ActIcon = act.icon;
                return (
                  <button key={i} onClick={() => showToast?.(`${act.title} initiated`)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      padding: '7px 14px', border: 'none', borderRadius: '20px',
                      background: act.bg, color: act.color, fontSize: '12px', fontWeight: '700',
                      cursor: 'pointer', transition: 'all 150ms',
                      boxShadow: `0 3px 6px ${act.shadow}`,
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = `0 6px 12px ${act.shadow}`;
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.boxShadow = `0 3px 6px ${act.shadow}`;
                    }}
                  >
                    <ActIcon size={12} color="#ffffff" /> {act.title}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          flexWrap: 'nowrap', 
          overflowX: 'auto', 
          gap: '4px', 
          borderBottom: '2px solid #f1f5f9', 
          width: '100%', 
          boxSizing: 'border-box',
          scrollbarWidth: 'none',
        }}
        className="no-scrollbar"
      >
        {TABS.map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '8px 14px', border: 'none', background: 'none', cursor: 'pointer',
                fontSize: '13px', fontWeight: active ? '700' : '600',
                color: active ? '#418A8B' : '#475569',
                borderBottom: `2px solid ${active ? '#418A8B' : 'transparent'}`,
                marginBottom: '-2px', transition: 'all 150ms',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.color = '#418A8B'; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.color = '#475569'; }}
            >
              <Icon size={14} />{tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
});

export default DashboardHeader;
