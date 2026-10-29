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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px', width: '100%', boxSizing: 'border-box' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.75px', fontFamily: 'var(--font-family)' }}>
            Operations Dashboard
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{today}</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px', flexWrap: 'wrap', maxWidth: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', maxWidth: '100%' }}>
            {activeTab === 'overview' && (
              <div style={{ display: 'flex', gap: '4px', background: '#eef2f5', border: '1px solid var(--border)', borderRadius: '10px', padding: '4px', flexWrap: 'wrap' }}>
                {TIMEFRAMES.map(t => (
                  <button key={t} onClick={() => setTimeframe(t.toLowerCase())}
                    style={{
                      border: 'none', padding: '6px 14px', borderRadius: '7px',
                      fontSize: '12.5px', fontWeight: '700', cursor: 'pointer', transition: 'all 200ms ease',
                      background: timeframe === t.toLowerCase() ? '#fff' : 'transparent',
                      color: timeframe === t.toLowerCase() ? 'var(--primary)' : 'var(--text-secondary)',
                      boxShadow: timeframe === t.toLowerCase() ? '0 2px 6px rgba(17, 41, 54, 0.08)' : 'none',
                    }}
                  >{t}</button>
                ))}
              </div>
            )}
            <button onClick={onRefresh}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', border: '1px solid var(--border)', borderRadius: '8px', background: '#fff', fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', cursor: 'pointer', transition: 'all 150ms' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
            >
              <LuRefreshCw size={14} /> Refresh
            </button>
          </div>
        </div>
      </div>

      <div 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          flexWrap: 'nowrap', 
          overflowX: 'auto', 
          gap: '6px', 
          background: '#edf2f5',
          border: '1px solid var(--border)',
          padding: '6px',
          borderRadius: '12px',
          width: '100%', 
          boxSizing: 'border-box',
          scrollbarWidth: 'none',
          marginBottom: '24px'
        }}
        className="no-scrollbar"
      >
        {TABS.map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 18px',
                border: active ? '1px solid rgba(27, 122, 109, 0.25)' : '1px solid transparent',
                background: active ? '#ffffff' : 'transparent',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '13.5px',
                fontWeight: active ? '700' : '600',
                color: active ? 'var(--primary)' : 'var(--text-secondary)',
                boxShadow: active ? '0 2px 6px rgba(17, 41, 54, 0.06)' : 'none',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.color = 'var(--primary)'; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.color = 'var(--text-secondary)'; }}
            >
              <Icon size={15} style={{ color: active ? 'var(--primary)' : 'var(--text-light)' }} />{tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
});

export default DashboardHeader;
