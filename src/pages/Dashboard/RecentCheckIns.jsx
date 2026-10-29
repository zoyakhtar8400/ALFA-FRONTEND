import React, { memo } from 'react';
import { LuLogIn, LuArrowRight } from 'react-icons/lu';
import { RECENT_CHECKINS } from './dashboardData';
import { useNavigate } from 'react-router-dom';

const RecentCheckIns = memo(({ showToast }) => {
  const navigate = useNavigate();
  const rows = RECENT_CHECKINS.slice(0, 5);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
          <LuLogIn size={14} color="#16a34a" />
          <span style={{ fontSize: '12px', fontWeight: '700', color: '#475569' }}>Recent Check-Ins</span>
        </div>
        <button onClick={() => { try { navigate('/front-desk/check-in'); } catch { showToast?.('View all check-ins'); } }}
          style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', fontSize: '11px', fontWeight: '700', color: 'var(--primary)', cursor: 'pointer' }}>
          View All <LuArrowRight size={12} />
        </button>
      </div>

      {rows.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '24px', color: '#94a3b8', fontSize: '13px' }}>
          <LuLogIn size={28} style={{ marginBottom: '8px', opacity: 0.4 }} />
          <div>No records available</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {rows.map((c, i) => (
            <div key={i}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: i < rows.length - 1 ? '1px solid #f8fafc' : 'none', cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              onClick={() => showToast?.(`Room ${c.room} — ${c.name}`)}
            >
              <img src={c.avatar} alt={c.name} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} onError={e => { e.target.style.display = 'none'; }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</div>
                <div style={{ fontSize: '10px', color: '#475569' }}>{c.grc} · {c.arrTime}</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-primary)' }}>Rm {c.room}</div>
                <div style={{ fontSize: '10px', color: '#475569' }}>{c.amt}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

export default RecentCheckIns;
