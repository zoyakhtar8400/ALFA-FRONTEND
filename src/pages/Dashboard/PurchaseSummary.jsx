import React from 'react';
import { PURCHASE_DETAILS } from './dashboardData';
import { LuShoppingCart, LuClock, LuPackageCheck, LuPackage2 } from 'react-icons/lu';

const PurchaseSummary = ({ showToast }) => {
  const purchaseStats = [
    { label: "Today's Purchase", value: "₹832", icon: LuShoppingCart, color: '#16a34a', bg: '#f0fdf4' },
    { label: "Pending PO", value: "3 POs", icon: LuClock, color: '#f59e0b', bg: '#fffbeb' },
    { label: "Received Items", value: "18 Items", icon: LuPackageCheck, color: '#0284c7', bg: '#f0f9ff' },
    { label: "Low Stock Alert", value: "4 Items", icon: LuPackage2, color: '#ef4444', bg: '#fee2e2' }
  ];

  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      border: '1px solid #e2e8f0',
      padding: '24px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    }}>
      {/* Header */}
      <div>
        <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#244E5F', margin: 0 }}>
          Hotel Purchase & Inventory Summary
        </h3>
        <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0', fontWeight: '500' }}>
          Overview of vendor stock replenishments, invoices and orders
        </p>
      </div>

      {/* KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: '16px'
      }}>
        {purchaseStats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '16px',
              borderRadius: '12px',
              backgroundColor: stat.bg,
              border: '1px solid #f1f5f9'
            }}>
              <div style={{
                padding: '8px',
                borderRadius: '8px',
                backgroundColor: '#ffffff',
                color: stat.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
              }}>
                <Icon size={18} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>{stat.label}</span>
                <span style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', marginTop: '2px' }}>{stat.value}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Purchase Details Table */}
      <div>
        <h4 style={{ fontSize: '13px', fontWeight: '800', color: '#475569', margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Vendor Stock Purchases
        </h4>
        <div style={{ overflowX: 'auto', border: '1px solid #f1f5f9', borderRadius: '8px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '850px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                <th style={{ padding: '10px 12px', fontSize: '11px', color: '#475569', fontWeight: '700' }}>Party Name</th>
                <th style={{ padding: '10px 12px', fontSize: '11px', color: '#475569', fontWeight: '700' }}>City / Bill Details</th>
                <th style={{ padding: '10px 12px', fontSize: '11px', color: '#475569', fontWeight: '700' }}>Gross Amt</th>
                <th style={{ padding: '10px 12px', fontSize: '11px', color: '#475569', fontWeight: '700' }}>Discount</th>
                <th style={{ padding: '10px 12px', fontSize: '11px', color: '#475569', fontWeight: '700' }}>Taxes (SGST/CGST)</th>
                <th style={{ padding: '10px 12px', fontSize: '11px', color: '#475569', fontWeight: '700' }}>Net Amt</th>
              </tr>
            </thead>
            <tbody>
              {PURCHASE_DETAILS.map((p, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #f8fafc', transition: 'background-color 100ms' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'} onClick={() => showToast && showToast(`Invoice details: ${p.vNo}`)}>
                  <td style={{ padding: '10px 12px', fontSize: '13px', fontWeight: '700', color: '#244E5F' }}>{p.partyName}</td>
                  <td style={{ padding: '10px 12px', fontSize: '12px', color: '#334155' }}>
                    <div>City: {p.city}</div>
                    <div style={{ fontSize: '10px', color: '#94a3b8' }}>V.No: {p.vNo} • Bill: {p.partyBillNo}</div>
                  </td>
                  <td style={{ padding: '10px 12px', fontSize: '12px', color: '#334155' }}>{p.grossAmt}</td>
                  <td style={{ padding: '10px 12px', fontSize: '12px', color: '#64748b' }}>{p.discount}</td>
                  <td style={{ padding: '10px 12px', fontSize: '12px', color: '#334155' }}>SGST: {p.sgst} • CGST: {p.cgst}</td>
                  <td style={{ padding: '10px 12px', fontSize: '13px', fontWeight: '700', color: '#166534' }}>{p.netAmt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PurchaseSummary;
