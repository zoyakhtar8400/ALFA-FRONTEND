import React, { memo, useState } from 'react';
import { LuTrendingUp } from 'react-icons/lu';

const OccupancyChart = memo(({ data, showToast }) => {
  const [hovered, setHovered] = useState(null);
  const values = data?.occupancy || [65, 70, 68, 75, 88, 92, 78];
  const labels = data?.occupancyLabels || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const avg = (values.reduce((s, v) => s + v, 0) / values.length).toFixed(1);

  const W = 520, H = 220, pL = 38, pR = 16, pT = 28, pB = 30;
  const cW = W - pL - pR, cH = H - pT - pB;

  const pts = values.map((v, i) => ({
    x: pL + (i / (values.length - 1)) * cW,
    y: pT + cH - (v / 100) * cH,
    v, label: labels[i],
  }));

  const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const area = `${line} L${pts.at(-1).x},${pT + cH} L${pts[0].x},${pT + cH} Z`;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <span style={{ fontSize: '11px', fontWeight: '700', color: '#334155', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Occupancy %</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: '700', color: '#16a34a', background: '#f0fdf4', padding: '3px 8px', borderRadius: '20px' }}>
          <LuTrendingUp size={12} /> Avg {avg}%
        </span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
        <defs>
          <linearGradient id="occFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#418A8B" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#418A8B" stopOpacity="0" />
          </linearGradient>
        </defs>

        {[0, 25, 50, 75, 100].map(g => {
          const gy = pT + cH - (g / 100) * cH;
          return (
            <g key={g}>
              <line x1={pL} y1={gy} x2={W - pR} y2={gy} stroke="#f1f5f9" strokeWidth="1" />
              <text x={pL - 6} y={gy + 4} textAnchor="end" style={{ fontSize: '9px', fill: '#64748b', fontWeight: '600' }}>{g}%</text>
            </g>
          );
        })}

        <path d={area} fill="url(#occFill)" />
        <path d={line} fill="none" stroke="#418A8B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {pts.map((p, i) => (
          <g key={i} style={{ cursor: 'pointer' }}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => showToast?.(`${p.label}: ${p.v}%`)}
          >
            {hovered === i && (
              <>
                <line x1={p.x} y1={pT} x2={p.x} y2={pT + cH} stroke="#418A8B" strokeWidth="1" strokeDasharray="3,3" opacity="0.4" />
                <rect x={p.x - 22} y={p.y - 26} width="44" height="18" rx="4" fill="#244E5F" />
                <text x={p.x} y={p.y - 13} textAnchor="middle" style={{ fontSize: '10px', fontWeight: '800', fill: '#fff' }}>{p.v}%</text>
              </>
            )}
            <circle cx={p.x} cy={p.y} r={hovered === i ? 6 : 4} fill="#fff" stroke="#418A8B" strokeWidth="2.5" style={{ transition: 'r 100ms' }} />
            <text x={p.x} y={H - 6} textAnchor="middle" style={{ fontSize: '10px', fontWeight: '700', fill: '#334155' }}>{p.label}</text>
          </g>
        ))}
      </svg>
    </div>
  );
});

export default OccupancyChart;
