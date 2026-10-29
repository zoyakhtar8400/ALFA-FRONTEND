import React from 'react';
import { OUTLET_DETAILS, OUTLET_ORDERS } from './dashboardData';
import { LuUtensils, LuDollarSign, LuFileText, LuTrendingUp } from 'react-icons/lu';

const RestaurantSummary = ({ showToast }) => {
  const stats = [
    { label: 'Running Tables', value: '12', icon: LuUtensils, color: '#0284c7', bg: '#f0f9ff' },
    { label: "Today's Sales", value: '₹42,350', icon: LuDollarSign, color: '#16a34a', bg: '#f0fdf4' },
    { label: 'Open KOT', value: '15', icon: LuFileText, color: '#ea580c', bg: '#fff7ed' },
    { label: 'Average Order', value: '₹980', icon: LuTrendingUp, color: '#9333ea', bg: '#faf5ff' }
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
      gap: '24px'
    }}>
      {/* Title */}
      <div>
        <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
          Restaurant & Outlets Summary
        </h3>
        <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0', fontWeight: '500' }}>
          Overview of food registers, active orders, and sales
        </p>
      </div>

      {/* Mini KPI stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: '16px'
      }}>
        {stats.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div key={idx} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '16px',
              borderRadius: '12px',
              backgroundColor: s.bg,
              border: '1px solid #f1f5f9'
            }}>
              <div style={{
                padding: '8px',
                borderRadius: '8px',
                backgroundColor: '#ffffff',
                color: s.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
              }}>
                <Icon size={18} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>{s.label}</span>
                <span style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', marginTop: '2px' }}>{s.value}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tables grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Outlets Summary Table */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: '800', color: '#475569', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Outlets Revenue Registers</h4>
            <span style={{ fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '4px', backgroundColor: '#fee2e2', color: '#b91c1c' }}>Total Net: ₹0.00</span>
          </div>
          <div style={{ overflowX: 'auto', border: '1px solid #f1f5f9', borderRadius: '8px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                  <th style={{ padding: '10px 12px', fontSize: '11px', color: '#475569', fontWeight: '700' }}>Outlet Name</th>
                  <th style={{ padding: '10px 12px', fontSize: '11px', color: '#475569', fontWeight: '700' }}>Gross Amt</th>
                  <th style={{ padding: '10px 12px', fontSize: '11px', color: '#475569', fontWeight: '700' }}>Taxable Amt</th>
                  <th style={{ padding: '10px 12px', fontSize: '11px', color: '#475569', fontWeight: '700' }}>Discount</th>
                  <th style={{ padding: '10px 12px', fontSize: '11px', color: '#475569', fontWeight: '700' }}>SGST / CGST</th>
                  <th style={{ padding: '10px 12px', fontSize: '11px', color: '#475569', fontWeight: '700' }}>Net Amt</th>
                </tr>
              </thead>
              <tbody>
                {OUTLET_DETAILS.map((o, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f8fafc', transition: 'background-color 100ms' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'} onClick={() => showToast && showToast(`Selected Outlet: ${o.name}`)}>
                    <td style={{ padding: '10px 12px', fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>{o.name}</td>
                    <td style={{ padding: '10px 12px', fontSize: '12px', color: '#334155' }}>₹{o.gross.toFixed(2)}</td>
                    <td style={{ padding: '10px 12px', fontSize: '12px', color: '#334155' }}>₹{o.taxable.toFixed(2)}</td>
                    <td style={{ padding: '10px 12px', fontSize: '12px', color: '#64748b' }}>₹{o.discount.toFixed(2)}</td>
                    <td style={{ padding: '10px 12px', fontSize: '12px', color: '#334155' }}>₹{o.sgst.toFixed(2)} / ₹{o.cgst.toFixed(2)}</td>
                    <td style={{ padding: '10px 12px', fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>₹{o.net.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Outlet Orders Table */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: '800', color: '#475569', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Active Orders List (KOT)</h4>
            <span style={{ fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '4px', backgroundColor: '#fee2e2', color: '#b91c1c' }}>Total Amt: ₹0.00</span>
          </div>
          <div style={{ overflowX: 'auto', border: '1px solid #f1f5f9', borderRadius: '8px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '850px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                  <th style={{ padding: '10px 12px', fontSize: '11px', color: '#475569', fontWeight: '700' }}>Outlet</th>
                  <th style={{ padding: '10px 12px', fontSize: '11px', color: '#475569', fontWeight: '700' }}>Table / Room</th>
                  <th style={{ padding: '10px 12px', fontSize: '11px', color: '#475569', fontWeight: '700' }}>KOT</th>
                  <th style={{ padding: '10px 12px', fontSize: '11px', color: '#475569', fontWeight: '700' }}>Item Name</th>
                  <th style={{ padding: '10px 12px', fontSize: '11px', color: '#475569', fontWeight: '700' }}>Qty</th>
                  <th style={{ padding: '10px 12px', fontSize: '11px', color: '#475569', fontWeight: '700' }}>Time</th>
                  <th style={{ padding: '10px 12px', fontSize: '11px', color: '#475569', fontWeight: '700' }}>Status</th>
                  <th style={{ padding: '10px 12px', fontSize: '11px', color: '#475569', fontWeight: '700' }}>Steward</th>
                  <th style={{ padding: '10px 12px', fontSize: '11px', color: '#475569', fontWeight: '700' }}>Amt</th>
                  <th style={{ padding: '10px 12px', fontSize: '11px', color: '#475569', fontWeight: '700', textAlign: 'right' }}>Void</th>
                </tr>
              </thead>
              <tbody>
                {OUTLET_ORDERS.map((ord, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f8fafc', transition: 'background-color 100ms' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'} onClick={() => showToast && showToast(`Selected KOT: ${ord.kot}`)}>
                    <td style={{ padding: '10px 12px', fontSize: '13px', fontWeight: '600', color: '#334155' }}>{ord.outletName}</td>
                    <td style={{ padding: '10px 12px', fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>{ord.tableRoom}</td>
                    <td style={{ padding: '10px 12px', fontSize: '12px', fontWeight: '600', color: 'var(--primary)' }}>{ord.kot}</td>
                    <td style={{ padding: '10px 12px', fontSize: '12px', color: '#334155', fontWeight: '600' }}>{ord.itemName}</td>
                    <td style={{ padding: '10px 12px', fontSize: '12px', color: '#334155' }}>{ord.qty}</td>
                    <td style={{ padding: '10px 12px', fontSize: '12px', color: '#64748b' }}>{ord.time}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{ fontSize: '11px', fontWeight: '700', color: '#15803d', backgroundColor: '#dcfce7', padding: '2px 8px', borderRadius: '12px' }}>
                        {ord.status}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px', fontSize: '12px', color: '#64748b' }}>{ord.steward}</td>
                    <td style={{ padding: '10px 12px', fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>₹{ord.amt.toFixed(2)}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                      <button
                        style={{ border: 'none', background: 'none', color: '#ef4444', fontWeight: '700', fontSize: '12px', cursor: 'pointer' }}
                        onClick={(e) => { e.stopPropagation(); showToast && showToast(`Void KOT ${ord.kot} triggered`); }}
                      >
                        Void
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantSummary;
