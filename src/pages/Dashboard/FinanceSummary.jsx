import React, { memo } from 'react';
import { LuTrendingUp, LuBanknote, LuSmartphone, LuCreditCard, LuClock, LuShieldAlert, LuRotateCcw, LuPercent } from 'react-icons/lu';

const FINANCE = [
  { label: "Today's Revenue",    value: '₹42,350', sub: 'Net revenue today',          icon: LuTrendingUp,  color: '#16a34a', bg: '#f0fdf4' },
  { label: 'Monthly Revenue',    value: '₹9,20,000', sub: 'June 2026 MTD',            icon: LuTrendingUp,  color: '#0369a1', bg: '#eff6ff' },
  { label: 'Cash Collection',    value: '₹18,200', sub: 'Physical cash today',        icon: LuBanknote,    color: '#15803d', bg: '#f0fdf4' },
  { label: 'UPI / Online',       value: '₹15,400', sub: 'GPay, PhonePe, UPI',        icon: LuSmartphone,  color: '#0d9488', bg: '#f0fdfa' },
  { label: 'Card Payments',      value: '₹8,750',  sub: 'Credit & debit cards',      icon: LuCreditCard,  color: '#4f46e5', bg: '#eef2ff' },
  { label: 'Restaurant Revenue', value: '₹15,350', sub: 'All outlets today',          icon: LuPercent,     color: '#d97706', bg: '#fffbeb' },
  { label: 'Outstanding',        value: '₹12,450', sub: '6 pending bills',            icon: LuShieldAlert,   color: '#b91c1c', bg: '#fef2f2' },
  { label: 'Refunds Issued',     value: '₹1,200',  sub: 'Booking refunds today',     icon: LuRotateCcw,   color: '#e11d48', bg: '#fff1f2' },
];

const FinanceSummary = memo(({ showToast }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
    {FINANCE.map((f, i) => {
      const Icon = f.icon;
      return (
        <div key={i} onClick={() => showToast?.(`${f.label}: ${f.value}`)}
          style={{
            background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px',
            padding: '14px', display: 'flex', gap: '12px', alignItems: 'flex-start',
            cursor: 'pointer', transition: 'all 180ms',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = f.color; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
        >
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: f.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon size={17} color={f.color} />
          </div>
          <div>
            <div style={{ fontSize: '10px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{f.label}</div>
            <div style={{ fontSize: '17px', fontWeight: '800', color: '#0f172a', margin: '3px 0 2px' }}>{f.value}</div>
            <div style={{ fontSize: '10px', color: '#475569' }}>{f.sub}</div>
          </div>
        </div>
      );
    })}
  </div>
));

export default FinanceSummary;
