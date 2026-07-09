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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <span style={{ fontSize: '11px', fontWeight: '700', color: '#334155', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Revenue Trend</span>
        <span style={{ fontSize: '12px', fontWeight: '800', color: '#244E5F' }}>₹{total >= 1000 ? `${(total / 1000).toFixed(1)}k` : total} total</span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
        <defs>
          <linearGradient id="revBarGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4A9993" />
            <stop offset="100%" stopColor="#418A8B" />
          </linearGradient>
        </defs>

        {[0, 0.25, 0.5, 0.75, 1].map((r, i) => {
          const gy = pT + cH - r * cH;
          const gv = Math.round(maxVal * r);
          return (
            <g key={i}>
              <line x1={pL} y1={gy} x2={W - pR} y2={gy} stroke="#f1f5f9" strokeWidth="1" />
              <text x={pL - 6} y={gy + 4} textAnchor="end" style={{ fontSize: '9px', fill: '#64748b', fontWeight: '600' }}>
                {gv >= 1000 ? `${(gv / 1000).toFixed(0)}k` : gv}
              </text>
            </g>
          );
        })}

        {values.map((val, i) => {
          const bH = Math.max(4, (val / maxVal) * cH);
          const x = pL + i * spacing + (spacing - bW) / 2;
          const y = pT + cH - bH;
          const isHov = hovered === i;
          return (
            <g key={i} style={{ cursor: 'pointer' }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => showToast?.(`${labels[i]}: ₹${val.toLocaleString('en-IN')}`)}
            >
              <rect x={x} y={y} width={bW} height={bH} rx="4" fill="url(#revBarGrad)"
                opacity={hovered !== null && !isHov ? 0.45 : 1}
                style={{ transition: 'opacity 150ms' }}
              />
              {isHov && (
                <>
                  <rect x={x - 12} y={y - 26} width={bW + 24} height="20" rx="4" fill="#244E5F" />
                  <text x={x + bW / 2} y={y - 12} textAnchor="middle" style={{ fontSize: '10px', fontWeight: '800', fill: '#fff' }}>
                    ₹{val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}
                  </text>
                </>
              )}
              <text x={x + bW / 2} y={H - 6} textAnchor="middle" style={{ fontSize: '10px', fontWeight: '700', fill: '#334155' }}>{labels[i]}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
});

export default RevenueChart;
