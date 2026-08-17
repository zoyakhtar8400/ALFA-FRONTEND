/**
 * Restaurant & Hotel POS Invoice & KOT Printing Utility
 * Clean Monochrome (Black, Grey, White) - Thermal & Laser Printer Standard
 */

/**
 * Prints a dedicated Kitchen Order Ticket (KOT) for kitchen staff.
 */
export const printKitchenKOT = ({ id, tableId, time, items = [], waiter = 'Staff', stationName, printerName, isReprint = false }) => {
  const printWindow = window.open('', '_blank', 'width=800,height=600');
  if (!printWindow) return;

  const now = new Date();
  const dateTimeStr = time || (now.toLocaleDateString('en-IN') + ' ' + now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }));
  const stationHeader = stationName ? `${stationName.toUpperCase()}` : 'MAIN KITCHEN';
  const printerSub = printerName ? `Printer: ${printerName}` : '';

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>KOT Ticket - ${id || 'KOT'}${stationName ? ` [${stationName}]` : ''}</title>
        <style>
          @page { margin: 0mm; size: auto; }
          body { font-family: 'Courier New', Courier, monospace; margin: 0; padding: 0; width: 100%; color: #000000; font-size: 13px; background: #ffffff; }
          .invoice-container {
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 2mm 4mm !important;
            box-sizing: border-box !important;
          }
          .text-center { text-align: center; }
          .bold { font-weight: bold; }
          .divider { border-top: 1.5px dashed #000000; margin: 6px 0; }
          .title { font-size: 17px; font-weight: bold; }
          .station-banner { font-size: 15px; font-weight: 900; background: #000; color: #fff; padding: 4px 6px; margin: 4px 0; letter-spacing: 0.5px; }
          table { width: 100%; border-collapse: collapse; margin-top: 8px; }
          th { border-bottom: 2px solid #000000; text-align: left; padding: 4px 0; font-size: 13px; color: #000000; }
          td { padding: 6px 0; vertical-align: top; font-size: 13px; color: #000000; }
          .qty { font-size: 16px; font-weight: 900; width: 45px; }
          .footer { border-top: 1.5px dashed #000000; padding-top: 8px; margin-top: 12px; text-align: center; font-size: 11px; }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <div class="text-center">
          <div class="title">KITCHEN ORDER TICKET</div>
          <div class="station-banner">${stationHeader}</div>
          ${printerSub ? `<div style="font-size: 11px; color: #333;">${printerSub}</div>` : ''}
        </div>
        <div class="divider"></div>
        <div>
          <div><strong>KOT No:</strong> ${id || 'KOT-101'} ${isReprint ? '<span style="background:#000;color:#fff;padding:1px 4px;font-size:10px;border-radius:2px;">REPRINT</span>' : ''}</div>
          <div><strong>Table:</strong> Table ${tableId || '1'}</div>
          <div><strong>Time:</strong> ${dateTimeStr}</div>
          <div><strong>Server:</strong> ${waiter}</div>
        </div>
        <div class="divider"></div>
        <table>
          <thead>
            <tr>
              <th style="width: 45px;">QTY</th>
              <th>ITEM DESCRIPTION</th>
            </tr>
          </thead>
          <tbody>
            ${items.map(item => {
    const displayName = (item.itemName || item.name || '') + (item.variantName || item.variant ? ` (${item.variantName || item.variant})` : '');
    return `
                <tr>
                  <td class="qty">x${item.qty || item.quantity || 1}</td>
                  <td>
                    <strong>${displayName}</strong>
                    ${item.remarks || item.remark ? `<br/><span style="font-size: 11px; font-style: italic;">* ${item.remarks || item.remark}</span>` : ''}
                  </td>
                </tr>
              `;
  }).join('')}
          </tbody>
        </table>
        <div class="footer">
          <div class="bold">* ${isReprint ? 'REPRINT - ' : ''}KITCHEN COPY *</div>
        </div>
        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 500);
          };
        </script>
        </div>
      </body>
    </html>
  `);
  printWindow.document.close();
};

export const printStationKOT = printKitchenKOT;

/**
 * Prints an Official Hotel & Restaurant Tax Invoice / Customer Bill.
 * Strictly Monochrome (Black / Grey / White Paper) — No Background Colors or Colored Borders.
 */
export const printTaxInvoice = (data, preOpenedWindow = null) => {
  const invoiceData = data?.invoice || data?.data || data || {};
  const printWindow = preOpenedWindow || window.open('', '_blank', 'width=800,height=600');
  if (!printWindow) return;

  const now = new Date();
  const dateTimeStr = invoiceData.date_time || invoiceData.time || (now.toLocaleDateString('en-IN') + ' ' + now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }));
  const tableNo = invoiceData.table_number || invoiceData.tableNo || invoiceData.table_id || '1';
  const invNo = invoiceData.invoice_number || invoiceData.bill_number || invoiceData.kotId || `INV-${tableNo}`;
  const customerName = invoiceData.customer_name || invoiceData.customerName || 'Walk-in Guest';
  const waiterName = invoiceData.waiter_name || invoiceData.waiter || 'Staff';
  const paymentMethod = invoiceData.payment_method || invoiceData.paymentMethod || 'Cash';
  const items = Array.isArray(invoiceData.items) ? invoiceData.items : [];
  // Use backend-calculated values directly — NO frontend recalculation
  const subtotal = Number(invoiceData.subtotal || 0);
  const discount = Number(invoiceData.discount || invoiceData.discount_amount || 0);
  const cgst = Number(invoiceData.taxes?.cgst || 0);
  const sgst = Number(invoiceData.taxes?.sgst || 0);
  const grandTotal = Number(invoiceData.grand_total || invoiceData.total_amount || invoiceData.amount || 0);
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Tax Invoice - Table ${tableNo}</title>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800;900&display=swap" rel="stylesheet">
        <style>
          @page { margin: 0mm; size: auto; }
          body {
            font-family: 'Outfit', 'Segoe UI', Tahoma, sans-serif;
            margin: 0;
            padding: 0;
            width: 100%;
            color: #000000;
            font-size: 12px;
            background: #ffffff;
          }
          .invoice-container {
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 2mm 4mm !important;
            box-sizing: border-box !important;
          }
          .header-title { font-size: 17px; font-weight: 900; color: #000000; text-align: center; text-transform: uppercase; margin-bottom: 3px; letter-spacing: 0.5px; }
          .header-sub { font-size: 10px; color: #333333; text-align: center; margin-bottom: 2px; font-weight: 600; }
          .invoice-title-badge { border-top: 1.5px dashed #000000; border-bottom: 1.5px dashed #000000; color: #000000; font-size: 11px; font-weight: 900; text-align: center; padding: 5px 0; margin: 8px 0; text-transform: uppercase; letter-spacing: 1.5px; }
          .meta-info { font-size: 11px; color: #000000; border-bottom: 1.5px dashed #000000; padding-bottom: 6px; margin-bottom: 8px; line-height: 1.4; font-family: monospace; font-weight: bold; }
          table { width: 100%; border-collapse: collapse; margin: 6px 0; font-family: monospace; }
          th { background: #ffffff; color: #000000; font-size: 11px; font-weight: bold; padding: 5px 0; border-bottom: 1.5px dashed #000000; text-transform: uppercase; }
          td { padding: 5px 0; border-bottom: 1px dotted #888888; font-size: 11px; color: #000000; vertical-align: top; }
          .summary-box { border-top: 1.5px dashed #000000; padding-top: 6px; margin-top: 8px; font-family: monospace; }
          .summary-row { display: flex; justify-content: space-between; padding: 2px 0; font-size: 11px; color: #000000; font-weight: bold; }
          .grand-total-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; font-weight: 900; color: #000000; border-top: 1.5px dashed #000000; border-bottom: 1.5px dashed #000000; margin-top: 4px; }
          .footer-note { text-align: center; margin-top: 12px; font-size: 10px; font-weight: bold; color: #000000; border-top: 1.5px dashed #000000; padding-top: 8px; }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <div class="header-title">${invoiceData.restaurant_name || 'ALFA HMS RESTAURANT'}</div>
          <div class="header-sub">Fine Dining & Luxury Hospitality</div>
          <div class="header-sub">${invoiceData.address || 'Main Dining Area'}</div>
          <div class="header-sub">GSTIN: ${invoiceData.gstin || '27AAAAA0000A1Z5'} | FSSAI: ${invoiceData.fssai || '10020021000123'}</div>
          <div class="header-sub">Ph: ${invoiceData.phone || '+91 98765 43210'}</div>

          <div class="invoice-title-badge">TAX INVOICE</div>

          <div class="meta-info">
            <div>BILL NO: ${invNo}</div>
            <div>TABLE: Table ${tableNo} &nbsp;|&nbsp; SERVER: ${waiterName.toUpperCase()}</div>
            <div>CUSTOMER: ${customerName.toUpperCase()}</div>
            <div>DATE: ${dateTimeStr} &nbsp;|&nbsp; STATUS: [${(invoiceData.payment_status || 'PAID').toUpperCase()}]</div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="text-align:left; width:50%;">ITEM</th>
                <th style="text-align:center; width:15%;">QTY</th>
                <th style="text-align:right; width:17%;">RATE</th>
                <th style="text-align:right; width:18%;">AMT</th>
              </tr>
            </thead>
            <tbody>
              ${items.length === 0 ? `
                <tr><td colspan="4" style="text-align:center; font-weight:bold;">No Items Registered</td></tr>
              ` : items.map(item => {
    const name = ((item.name || item.itemName || '') + (item.variantName || item.variant ? ` (${item.variantName || item.variant})` : '')).toUpperCase();
    const qty = item.qty || item.quantity || 1;
    const rate = item.unitPrice || item.price || item.rate || 0;
    const amt = item.amount || item.total || (qty * rate);
    return `
                  <tr>
                    <td style="text-align:left; font-weight:bold; word-break:break-all;">
                      ${name}
                      ${item.remarks || item.remark ? `<br/><span style="font-size: 9px; font-weight: normal; font-style: italic;">* ${item.remarks || item.remark}</span>` : ''}
                    </td>
                    <td style="text-align:center; font-weight:bold;">${qty}</td>
                    <td style="text-align:right;">₹${rate.toFixed(2)}</td>
                    <td style="text-align:right; font-weight:bold;">₹${amt.toFixed(2)}</td>
                  </tr>
                `;
  }).join('')}
            </tbody>
          </table>

          <div class="summary-box">
            <div class="summary-row"><span>SUBTOTAL:</span><span>₹${subtotal.toFixed(2)}</span></div>
            ${discount > 0 ? `<div class="summary-row"><span>DISCOUNT:</span><span>- ₹${discount.toFixed(2)}</span></div>` : ''}
            ${(() => {
              const breakdown = invoiceData.taxes_breakdown;
              if (Array.isArray(breakdown) && breakdown.length > 0) {
                return breakdown.map(t => `<div class="summary-row"><span>${(t.name || 'Tax').toUpperCase()} (${t.rate}%):</span><span>₹${Number(t.amount || 0).toFixed(2)}</span></div>`).join('');
              }
              // fallback to cgst/sgst
              return `
                <div class="summary-row"><span>CGST (${cgst > 0 ? ((cgst / (subtotal - discount)) * 100).toFixed(1) : 2.5}%):</span><span>₹${cgst.toFixed(2)}</span></div>
                <div class="summary-row"><span>SGST (${sgst > 0 ? ((sgst / (subtotal - discount)) * 100).toFixed(1) : 2.5}%):</span><span>₹${sgst.toFixed(2)}</span></div>
              `;
            })()}
            <div class="grand-total-row"><span>NET AMOUNT:</span><span>₹${grandTotal.toFixed(2)}</span></div>
          </div>

          <div class="footer-note">
            <div>*** THANK YOU FOR DINING WITH US ***</div>
            <div>HAVE A WONDERFUL DAY!</div>
          </div>
        </div>
        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 500);
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
};
