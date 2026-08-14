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

const FinanceSummary = memo(({ stats, tables = [], showToast }) => {
  const liveRestaurantRevenue = (tables || []).reduce((acc, t) => acc + Number(t.amount || 0), 0);
  const activeBillsCount = (tables || []).filter(t => Number(t.amount || 0) > 0).length;

  const todayRev = stats?.todaySales !== undefined ? stats.todaySales : liveRestaurantRevenue;
  const monthRev = stats?.monthlySales !== undefined ? stats.monthlySales : liveRestaurantRevenue;
  const cashColl = stats?.cashCollection !== undefined ? stats.cashCollection : 0;
  const upiColl = stats?.upiCollection !== undefined ? stats.upiCollection : 0;
  const cardColl = stats?.cardCollection !== undefined ? stats.cardCollection : 0;
  const restRev = (stats?.liveDiningSales || 0) + liveRestaurantRevenue;
  const dueColl = stats?.dueCollection !== undefined ? stats.dueCollection : 0;
  const totalBills = (stats?.totalOrdersCount || 0) + activeBillsCount;

  const financeCards = [
    { label: "Today's Revenue",    value: `₹${Number(todayRev).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, sub: 'Real-time revenue today', icon: LuTrendingUp,  color: '#16a34a', bg: '#f0fdf4' },
    { label: 'Monthly Revenue',    value: `₹${Number(monthRev).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, sub: 'Current month total',     icon: LuTrendingUp,  color: '#0369a1', bg: '#eff6ff' },
    { label: 'Cash Collection',    value: `₹${Number(cashColl).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, sub: 'Physical cash received',  icon: LuBanknote,    color: '#15803d', bg: '#f0fdf4' },
    { label: 'UPI / Online',       value: `₹${Number(upiColl).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,  sub: 'PhonePe, GPay, UPI',       icon: LuSmartphone,  color: '#0d9488', bg: '#f0fdfa' },
    { label: 'Card Payments',      value: `₹${Number(cardColl).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, sub: 'Credit / Debit cards',    icon: LuCreditCard,  color: '#4f46e5', bg: '#eef2ff' },
    { label: 'Restaurant Revenue', value: `₹${Number(restRev).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,  sub: `${activeBillsCount} active table orders`, icon: LuPercent, color: '#d97706', bg: '#fffbeb' },
    { label: 'Total Orders',       value: `${totalBills}`,                                                                                          sub: `${totalBills} total bills recorded`, icon: LuClock, color: '#0284c7', bg: '#e0f2fe' },
    { label: 'Pending Dues',       value: `₹${Number(dueColl).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,   sub: 'Credit / ledger dues',     icon: LuShieldAlert, color: '#b91c1c', bg: '#fef2f2' },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
      {financeCards.map((f, i) => {
        const Icon = f.icon;
        return (
          <div key={i} onClick={() => showToast?.(`${f.label}: ${f.value}`)}
            style={{
              background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px',
              padding: '14px', display: 'flex', gap: '12px', alignItems: 'flex-start',
              cursor: 'pointer', transition: 'all 180ms ease',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = f.color; e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.06)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.03)'; }}
          >
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: f.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={17} color={f.color} />
            </div>
            <div>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{f.label}</div>
              <div style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: '3px 0 2px' }}>{f.value}</div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>{f.sub}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
});

export default FinanceSummary;
