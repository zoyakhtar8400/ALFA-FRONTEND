import React from 'react';

const formatIndianCurrency = (num) => {
  const parsed = parseFloat(num);
  if (isNaN(parsed)) return '₹ 0.00';
  const parts = parsed.toFixed(2).split('.');
  let lastThree = parts[0].substring(parts[0].length - 3);
  const otherParts = parts[0].substring(0, parts[0].length - 3);
  if (otherParts !== '') {
    lastThree = ',' + lastThree;
  }
  const formattedInt = otherParts.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
  return `₹ ${formattedInt}.${parts[1]}`;
};

export const mapSalesRegisterData = (bills) => {
  return bills.map((b, idx) => {
    const gross = Number(b.order_total || 0) + Number(b.discount || 0) - Number(b.order_level_total_taxes || 0);
    const disc = Number(b.discount || 0);
    const tax = Number(b.order_level_total_taxes || 0);
    const net = Number(b.order_total || 0);

    // Tax breakdown
    const cgst = tax / 2;
    const sgst = tax / 2;
    const taxable = gross - disc; // Assuming deduction is 0
    const deduction = 0;
    const nonTaxable = 0;
    const roundOff = net - (taxable + tax);

    let dateDisplay = '';
    let timeDisplay = '';
    const timeSource = b.created_time || b.createdAt;
    
    if (typeof timeSource === 'string' && /^\d{2}:\d{2}(:\d{2})?$/.test(timeSource)) {
      // timeSource is just a time string like "13:02:00"
      let [h, m] = timeSource.split(':');
      let period = 'AM';
      let hour = parseInt(h, 10);
      if (hour >= 12) {
        period = 'PM';
        if (hour > 12) hour -= 12;
      }
      if (hour === 0) hour = 12;
      timeDisplay = `${hour.toString().padStart(2, '0')}:${m} ${period}`;
    } else if (timeSource) {
      // Postgres returns created_time which could be ISO string or timestamp
      let parsedTime = timeSource;
      if (typeof parsedTime === 'string' && /^\d+$/.test(parsedTime)) {
        parsedTime = Number(parsedTime);
      }
      const d = new Date(typeof parsedTime === 'number' && parsedTime < 1e12 ? parsedTime * 1000 : parsedTime);
      if (!isNaN(d.getTime())) {
        dateDisplay = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-');
        timeDisplay = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
      } else if (b.bill_date && typeof b.bill_date === 'string' && b.bill_date.includes(':')) {
        timeDisplay = b.bill_date;
      }
    } else if (b.bill_date) {
      timeDisplay = b.bill_date;
    }

    if (!timeDisplay && b.bill_time) {
       timeDisplay = String(b.bill_time);
    }

    if (!dateDisplay && b.my_order_date) {
      const p = String(b.my_order_date).split('-');
      if (p.length === 3) {
        const m = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][parseInt(p[1], 10) - 1] || 'Aug';
        dateDisplay = `${p[2]}-${m}-${p[0]}`;
      }
    }

    const outletName = String(b.store_name || 'MAIN RESTAURANT');

    return {
      c1: String(idx + 1), // S.No
      c2: outletName, // Outlet
      c3: dateDisplay || '', // Date
      c4: timeDisplay || '', // Time
      c5: String(b.custom_bill_number || b.bill_number || ''), // Bill No
      c6: String(b.table_name || ''), // Table/Room
      c7: String(b.customer_name || b.cust_name || ''), // Customer
      c8: String(b.payment_mode || b.payment || ''), // Payment Mode
      c9: formatIndianCurrency(gross), // Gross
      c10: formatIndianCurrency(disc), // Discount
      c11: formatIndianCurrency(nonTaxable), // Non Taxable
      c12: formatIndianCurrency(taxable), // Taxable
      c13: formatIndianCurrency(cgst + sgst), // GST 5%
      c14: '0.00', // IGST
      c15: roundOff.toFixed(2), // Round Off
      c16: formatIndianCurrency(net), // Net
      c17: String(b.createdBy || b.user_id || 'Admin'), // User

      // Raw data for footer calculations
      outlet: outletName,
      rawGross: gross,
      rawDiscount: disc,
      rawTax: tax,
      rawNet: net,
      rawPayment: String(b.payment_mode || b.payment || 'Cash').toUpperCase()
    };
  });
};

export const SalesRegisterTable = ({ filteredData, reportColumns }) => {
  const getColAlign = (name) => {
    name = (name || '').toLowerCase();
    if (name.includes('amount') || name.includes('sale') || name.includes('tax') || name.includes('discount') || name.includes('net') || name.includes('subtotal') || name.includes('value') || name.includes('cgst') || name.includes('sgst') || name.includes('igst') || name.includes('vat') || name.includes('cess') || name.includes('round')) return 'right';
    return 'left';
  };

  const grouped = {};
  filteredData.forEach(row => {
    const d = row.c3; // Date is now c3
    if (!grouped[d]) grouped[d] = [];
    grouped[d].push(row);
  });

  const sortedDates = Object.keys(grouped).sort((a, b) => {
    const parseDate = (dStr) => {
      if (!dStr || dStr === 'N/A') return new Date(0);
      const parts = dStr.split('-');
      if (parts.length < 3) return new Date(0);
      const months = { 'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5, 'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11 };
      const mIndex = months[parts[1]] !== undefined ? months[parts[1]] : 0;
      return new Date(parseInt(parts[2]) || 2026, mIndex, parseInt(parts[0]) || 1);
    };
    return parseDate(a) - parseDate(b);
  });

  if (sortedDates.length === 0) {
    return (
      <tr>
        <td colSpan={reportColumns.length} style={{ padding: '32px', textAlign: 'center', color: '#64748b', fontWeight: 600 }}>
          No records matching the filter query. Click <strong>All Time</strong> or <strong>This Month</strong> to view existing sales.
        </td>
      </tr>
    );
  }

  // Footer Aggregations
  let grandGross = 0;
  let grandDiscount = 0;
  let grandTax = 0;
  let grandNet = 0;
  let payTypes = {};

  return (
    <>
      {sortedDates.flatMap((date) => {
        const bills = grouped[date];
        let dailyGross = 0;
        let dailyDiscount = 0;
        let dailyTax = 0;
        let dailyNet = 0;

        const rowsList = bills.map((row, idx) => {
          dailyGross += row.rawGross || 0;
          dailyDiscount += row.rawDiscount || 0;
          dailyTax += row.rawTax || 0;
          dailyNet += row.rawNet || 0;

          grandGross += row.rawGross || 0;
          grandDiscount += row.rawDiscount || 0;
          grandTax += row.rawTax || 0;
          grandNet += row.rawNet || 0;

          const payMode = row.rawPayment || 'CASH';
          payTypes[payMode] = (payTypes[payMode] || 0) + (row.rawNet || 0);

          return (
            <tr key={`${date}-row-${idx}`}>
              <td style={{ textAlign: 'center' }}>{row.c1}</td>
              <td style={{ textAlign: 'center' }}>{row.c3}</td>
              <td style={{ textAlign: 'center' }}>{row.c4}</td>
              <td style={{ textAlign: 'center' }}>{row.c5}</td>
              <td style={{ textAlign: 'center' }}>{row.c6}</td>
              <td style={{ textAlign: 'center' }}>{row.c7}</td>
              <td style={{ textAlign: 'center' }}>{row.c8}</td>
              <td style={{ textAlign: 'center' }}>{row.c9}</td>
              <td style={{ textAlign: 'center' }}>{row.c10}</td>
              <td style={{ textAlign: 'center' }}>{row.c11}</td>
              <td style={{ textAlign: 'center' }}>{row.c12}</td>
              <td style={{ textAlign: 'center' }}>{row.c13}</td>
              <td style={{ textAlign: 'center' }}>{row.c14}</td>
              <td style={{ textAlign: 'center' }}>{row.c15}</td>
              <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{row.c16}</td>
              <td style={{ textAlign: 'center' }}>{row.c17}</td>
            </tr>
          );
        });

        return [
          <tr key={`${date}-header`} style={{ background: '#f1f5f9', fontWeight: 'bold' }}>
            <td colSpan={reportColumns.length} style={{ textAlign: 'left', padding: '8px 12px', color: '#334155' }}>{date}</td>
          </tr>,
          ...rowsList,
          <tr key={`${date}-footer`} style={{ background: '#fafafa', fontWeight: 'bold' }}>
            <td colSpan={7} style={{ textAlign: 'center', color: '#475569' }}>Daily Total</td>
            <td style={{ textAlign: 'center' }}>{formatIndianCurrency(dailyGross)}</td>
            <td style={{ textAlign: 'center' }}>{formatIndianCurrency(dailyDiscount)}</td>
            <td colSpan={5}></td>
            <td style={{ textAlign: 'center', color: '#0f172a' }}>{formatIndianCurrency(dailyNet)}</td>
            <td></td>
          </tr>
        ];
      })}

      {/* GRAND TOTAL ROW */}
      <tr style={{ background: '#e2e8f0', fontWeight: '900', borderTop: '2px solid #94a3b8' }}>
        <td colSpan={7} style={{ textAlign: 'center', color: '#1e293b', padding: '12px' }}>Grand Total :</td>
        <td style={{ textAlign: 'center', color: '#0f172a' }}>{formatIndianCurrency(grandGross)}</td>
        <td style={{ textAlign: 'center', color: '#0f172a' }}>{formatIndianCurrency(grandDiscount)}</td>
        <td colSpan={5}></td>
        <td style={{ textAlign: 'center', color: '#0f172a' }}>{formatIndianCurrency(grandNet)}</td>
        <td></td>
      </tr>

      {/* PAY TYPES SUMMARY */}
      <tr className="no-print">
        <td colSpan={reportColumns.length} style={{ padding: '24px 12px', background: '#ffffff' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '400px', padding: '16px', border: '1px solid #cbd5e1', borderRadius: '8px' }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#1e293b', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>Pay Type Summary</h4>
            {Object.keys(payTypes).map(pt => (
              <div key={pt} style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, color: '#475569' }}>
                <span>{pt}</span>
                <span>{formatIndianCurrency(payTypes[pt])}</span>
              </div>
            ))}
          </div>
        </td>
      </tr>
    </>
  );
};
