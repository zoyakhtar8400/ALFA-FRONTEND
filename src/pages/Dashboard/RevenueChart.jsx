import React, { memo, useState } from 'react';

const RevenueChart = memo(({ data, showToast }) => {
  const [hovered, setHovered] = useState(null);
  const values = data?.revenue || [2800, 3400, 3100, 4200, 5600, 6200, 3840];
  const labels = data?.revenueLabels || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  const total = values.reduce((s, v) => s + v, 0);
  const maxVal = Math.max(...values) * 1.2 || 100;

  const W = 520, H = 220, pL = 42, pR = 12, pT = 28, pB = 30;
  const cW = W - pL - pR, cH = H - pT - pB;
  const spacing = cW / values.length;
  const bW = Math.max(16, spacing * 0.6);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <span style={{ fontSize: '12px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Revenue Trend</span>
        <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--primary)', background: 'var(--primary-light)', padding: '4px 10px', borderRadius: '12px', border: '1px solid rgba(27, 122, 109, 0.2)' }}>
          ₹{total >= 1000 ? `${(total / 1000).toFixed(1)}k` : total} total
        </span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
        <defs>
          <linearGradient id="revBarGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#29b49b" />
            <stop offset="100%" stopColor="#1b7a6d" />
          </linearGradient>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodOpacity="0.1" floodColor="#0f172a" />
          </filter>
        </defs>

        {[0, 0.25, 0.5, 0.75, 1].map((r, i) => {
          const gy = pT + cH - r * cH;
          const gv = Math.round(maxVal * r);
          return (
            <g key={i}>
              <line x1={pL} y1={gy} x2={W - pR} y2={gy} stroke="#f1f5f9" strokeWidth="1" />
              <text x={pL - 10} y={gy + 3} textAnchor="end" style={{ fontSize: '10px', fill: '#94a3b8', fontWeight: '600', fontFamily: 'var(--font-family)' }}>
                {gv >= 1000 ? `${(gv / 1000).toFixed(0)}k` : gv}
              </text>
            </g>
          );
        })}

        {values.map((val, i) => {
          const bH = Math.max(6, (val / maxVal) * cH);
          const x = pL + i * spacing + (spacing - bW) / 2;
          const y = pT + cH - bH;
          const isHov = hovered === i;
          return (
            <g key={i} style={{ cursor: 'pointer' }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => showToast?.(`${labels[i]}: ₹${val.toLocaleString('en-IN')}`)}
            >
              <rect x={x} y={y} width={bW} height={bH} rx="6" fill="url(#revBarGrad)"
                opacity={hovered !== null && !isHov ? 0.5 : 1}
                style={{ transition: 'all 0.2s ease-in-out' }}
              />
              {isHov && (
                <g filter="url(#shadow)">
                  <rect x={x - 20} y={y - 32} width={bW + 40} height="22" rx="6" fill="#0f172a" />
                  <text x={x + bW / 2} y={y - 18} textAnchor="middle" style={{ fontSize: '11px', fontWeight: '800', fill: '#fff', fontFamily: 'var(--font-family)' }}>
                    ₹{val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}
                  </text>
                </g>
              )}
              <text x={x + bW / 2} y={H - 6} textAnchor="middle" style={{ fontSize: '10px', fontWeight: '600', fill: '#64748b', fontFamily: 'var(--font-family)' }}>{labels[i]}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
});

export default RevenueChart;
