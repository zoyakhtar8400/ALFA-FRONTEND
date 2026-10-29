import React, { memo } from 'react';
import { LuClipboardList, LuArrowRight } from 'react-icons/lu';
import { PENDING_HOUSEKEEPING } from './dashboardData';
import { useNavigate } from 'react-router-dom';

const PRIORITY_STYLE = {
  High:   { bg: '#fee2e2', color: '#b91c1c' },
  Medium: { bg: '#fffbeb', color: '#b45309' },
  Low:    { bg: '#f0fdf4', color: '#15803d' },
};

const STATUS_COLOR = { Dirty: '#ef4444', Maintenance: '#f59e0b' };

const HousekeepingWidget = memo(({ showToast }) => {
  const navigate = useNavigate();
  const rows = PENDING_HOUSEKEEPING.slice(0, 5);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
          <LuClipboardList size={14} color="#7c3aed" />
          <span style={{ fontSize: '12px', fontWeight: '700', color: '#475569' }}>Pending Housekeeping</span>
        </div>
        <button onClick={() => { try { navigate('/housekeeping'); } catch { showToast?.('View housekeeping'); } }}
          style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', fontSize: '11px', fontWeight: '700', color: 'var(--primary)', cursor: 'pointer' }}>
          View All <LuArrowRight size={12} />
        </button>
      </div>

      {rows.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '24px', color: '#94a3b8', fontSize: '13px' }}>
          <LuClipboardList size={28} style={{ marginBottom: '8px', opacity: 0.4 }} />
          <div>No records available</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {rows.map((h, i) => {
            const ps = PRIORITY_STYLE[h.priority] || PRIORITY_STYLE.Low;
            const sc = STATUS_COLOR[h.status] || '#94a3b8';
            return (
              <div key={i}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: i < rows.length - 1 ? '1px solid #f8fafc' : 'none', cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                onClick={() => showToast?.(`Room ${h.room} — ${h.status}`)}
              >
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${sc}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: '13px', fontWeight: '800', color: sc }}>{h.room}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#0f172a' }}>{h.type} · Floor {h.floor}</div>
                  <div style={{ fontSize: '10px', color: '#475569' }}>{h.assignedTo}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <span style={{ fontSize: '10px', fontWeight: '700', padding: '2px 7px', borderRadius: '10px', background: ps.bg, color: ps.color }}>{h.priority}</span>
                  <div style={{ fontSize: '10px', color: sc, fontWeight: '600', marginTop: '2px' }}>{h.status}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});

export default HousekeepingWidget;
