/**
 * Restaurant & Hotel POS Invoice & KOT Printing Utility
 * Clean Monochrome (Black, Grey, White) - Thermal & Laser Printer Standard
 */

/**
 * Prints a dedicated Kitchen Order Ticket (KOT) for kitchen staff.
 */
export const printKitchenKOT = ({ id, tableId, time, items = [], waiter = 'Staff' }) => {
  const printWindow = window.open('', '_blank', 'width=800,height=600');
  if (!printWindow) return;

  const now = new Date();
  const dateTimeStr = time || (now.toLocaleDateString('en-IN') + ' ' + now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }));

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>KOT Ticket - ${id || 'KOT'}</title>
        <style>
          @page { margin: 2mm; size: auto; }
          body { font-family: 'Courier New', Courier, monospace; width: 280px; margin: 0 auto; padding: 10px; color: #000000; font-size: 13px; background: #ffffff; }
          .text-center { text-align: center; }
          .bold { font-weight: bold; }
          .divider { border-top: 1.5px dashed #000000; margin: 6px 0; }
          .title { font-size: 18px; font-weight: bold; }
          table { width: 100%; border-collapse: collapse; margin-top: 8px; }
          th { border-bottom: 2px solid #000000; text-align: left; padding: 4px 0; font-size: 13px; color: #000000; }
          td { padding: 6px 0; vertical-align: top; font-size: 13px; color: #000000; }
          .qty { font-size: 16px; font-weight: 900; width: 45px; }
          .footer { border-top: 1.5px dashed #000000; padding-top: 8px; margin-top: 12px; text-align: center; font-size: 11px; }
        </style>
      </head>
      <body>
        <div class="text-center">
          <div class="title">KITCHEN ORDER TICKET</div>
          <div class="bold">ALFA HMS RESTAURANT</div>
        </div>
        <div class="divider"></div>
        <div>
          <div><strong>KOT No:</strong> ${id || 'KOT-101'}</div>
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
                  <td class="qty">x${item.qty}</td>
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
          <div class="bold">* KITCHEN COPY *</div>
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

/**
 * Prints an Official Hotel & Restaurant Tax Invoice / Customer Bill.
 * Strictly Monochrome (Black / Grey / White Paper) — No Background Colors or Colored Borders.
 */
export const printTaxInvoice = ({ tableNo, kotId, items = [], waiter = 'Rakesh', customerName = 'Guest', time = '', status = 'Paid' }) => {
  const printWindow = window.open('', '_blank', 'width=800,height=600');
  if (!printWindow) return;

  const now = new Date();
  const dateTimeStr = time || (now.toLocaleDateString('en-IN') + ' ' + now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }));

  const subtotal = items.reduce((sum, item) => sum + (item.qty * (item.unitPrice || item.price || item.rate || 0)), 0);
  const cgst = Math.round((subtotal * 0.025) * 100) / 100;
  const sgst = Math.round((subtotal * 0.025) * 100) / 100;
  const grandTotal = Math.round(subtotal + cgst + sgst);

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Tax Invoice - Table ${tableNo || '1'}</title>
        <style>
          @page { margin: 2mm; size: auto; }
          body {
            font-family: 'Courier New', Courier, monospace, 'Segoe UI', sans-serif;
            width: 280px;
            margin: 0 auto;
            padding: 8px;
            color: #000000;
            font-size: 12px;
            background: #ffffff;
          }
          .header-title {
            font-size: 16px;
            font-weight: bold;
            color: #000000;
            text-align: center;
            text-transform: uppercase;
            margin-bottom: 2px;
          }
          .header-sub {
            font-size: 10px;
            color: #333333;
            text-align: center;
            margin-bottom: 2px;
          }
          .invoice-title-badge {
            border-top: 1px dashed #000000;
            border-bottom: 1px dashed #000000;
            color: #000000;
            font-size: 12px;
            font-weight: bold;
            text-align: center;
            padding: 4px 0;
            margin: 6px 0;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .meta-info {
            font-size: 11px;
            color: #000000;
            border-bottom: 1px dashed #000000;
            padding-bottom: 6px;
            margin-bottom: 6px;
            line-height: 1.4;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 6px 0;
          }
          th {
            background: #ffffff;
            color: #000000;
            font-size: 11px;
            font-weight: bold;
            padding: 4px 0;
            border-bottom: 1px dashed #000000;
            text-transform: uppercase;
          }
          td {
            padding: 4px 0;
            border-bottom: 1px dotted #cccccc;
            font-size: 11px;
            color: #000000;
            vertical-align: top;
          }
          .summary-box {
            border-top: 1px dashed #000000;
            padding-top: 6px;
            margin-top: 6px;
          }
          .summary-row {
            display: flex;
            justify-content: space-between;
            padding: 2px 0;
            font-size: 11px;
            color: #000000;
          }
          .grand-total-row {
            display: flex;
            justify-content: space-between;
            padding: 6px 0;
            font-size: 13px;
            font-weight: bold;
            color: #000000;
            border-top: 1px dashed #000000;
            border-bottom: 1.5px solid #000000;
            margin-top: 4px;
          }
          .footer-note {
            text-align: center;
            margin-top: 10px;
            font-size: 10px;
            font-weight: bold;
            color: #000000;
            border-top: 1px dashed #000000;
            padding-top: 6px;
          }
        </style>
      </head>
      <body>
        <div>
          <div class="header-title">ALFA HMS HOTEL & RESTAURANT</div>
          <div class="header-sub">Fine Dining & Luxury Hospitality</div>
          <div class="header-sub">Main Road, Hospitality Zone | Ph: +91 98765 43210</div>
          <div class="header-sub">GSTIN: 22AAAAA0000A1Z5 | FSSAI: 10020021000123</div>

          <div class="invoice-title-badge">TAX INVOICE / RESTAURANT BILL</div>

          <div class="meta-info">
            <div><strong>Inv No:</strong> ${kotId || 'INV-' + (tableNo || '1') + '-' + Math.floor(1000 + Math.random() * 9000)}</div>
            <div><strong>Table:</strong> Table ${tableNo || '1'}</div>
            <div><strong>Customer:</strong> ${customerName} &nbsp;|&nbsp; <strong>Date:</strong> ${dateTimeStr}</div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="text-align:left;">ITEM</th>
                <th style="text-align:center;">QTY</th>
                <th style="text-align:right;">RATE</th>
                <th style="text-align:right;">AMT</th>
              </tr>
            </thead>
            <tbody>
              ${items.length === 0 ? `
                <tr><td colspan="4" style="text-align:center;">No Items Registered</td></tr>
              ` : items.map(item => {
                const name = (item.itemName || item.name || '') + (item.variantName || item.variant ? ` (${item.variantName || item.variant})` : '');
                const rate = item.unitPrice || item.price || item.rate || 0;
                const amt = item.total || (item.qty * rate);
                return `
                  <tr>
                    <td style="text-align:left;">${name}</td>
                    <td style="text-align:center; font-weight:bold;">${item.qty}</td>
                    <td style="text-align:right;">₹${rate}</td>
                    <td style="text-align:right; font-weight:bold;">₹${amt}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>

          <div class="summary-box">
            <div class="summary-row"><span>Subtotal:</span><span>₹${subtotal.toFixed(2)}</span></div>
            <div class="summary-row"><span>CGST (2.5%):</span><span>₹${cgst.toFixed(2)}</span></div>
            <div class="summary-row"><span>SGST (2.5%):</span><span>₹${sgst.toFixed(2)}</span></div>
            <div class="grand-total-row"><span>GRAND TOTAL:</span><span>₹${grandTotal.toFixed(2)}</span></div>
          </div>

          <div class="footer-note">
            THANK YOU FOR DINING WITH US!
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
