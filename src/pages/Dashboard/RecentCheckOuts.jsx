import React, { memo } from 'react';
import { LuLogOut, LuArrowRight } from 'react-icons/lu';
import { RECENT_CHECKOUTS } from './dashboardData';
import { useNavigate } from 'react-router-dom';

const PAY_COLOR = { Cash: '#16a34a', UPI: '#0d9488', Card: '#4f46e5', 'Visa Card': '#4f46e5' };

const RecentCheckOuts = memo(({ showToast }) => {
  const navigate = useNavigate();
  const rows = RECENT_CHECKOUTS.slice(0, 5);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
          <LuLogOut size={14} color="#dc2626" />
          <span style={{ fontSize: '12px', fontWeight: '700', color: '#475569' }}>Recent Check-Outs</span>
        </div>
        <button onClick={() => { try { navigate('/front-desk/check-out'); } catch { showToast?.('View all check-outs'); } }}
          style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', fontSize: '11px', fontWeight: '700', color: '#418A8B', cursor: 'pointer' }}>
          View All <LuArrowRight size={12} />
        </button>
      </div>

      {rows.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '24px', color: '#94a3b8', fontSize: '13px' }}>
          <LuLogOut size={28} style={{ marginBottom: '8px', opacity: 0.4 }} />
          <div>No records available</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {rows.map((c, i) => {
            const pc = PAY_COLOR[c.payMode] || '#64748b';
            return (
              <div key={i}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: i < rows.length - 1 ? '1px solid #f8fafc' : 'none', cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                onClick={() => showToast?.(`${c.billNo} — ${c.name}`)}
              >
                <img src={c.avatar} alt={c.name} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} onError={e => { e.target.style.display = 'none'; }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</div>
                  <div style={{ fontSize: '10px', color: '#475569' }}>{c.billNo} · Rm {c.room}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: '800', color: '#1e293b' }}>{c.billAmt}</div>
                  <div style={{ fontSize: '10px', fontWeight: '700', color: pc }}>{c.payMode}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});

export default RecentCheckOuts;
