/**
 * Prints a dedicated Kitchen Order Ticket (KOT) for kitchen staff.
 */
export const printKitchenKOT = ({ id, tableId, time, items = [], waiter = 'Staff', stationName, printerName, remarks = '', isReprint = false, order_type, takeaway_no, delivery_no }, preOpenedWindow = null) => {
  const printWindow = preOpenedWindow || window.open('', '_blank', 'width=800,height=600');
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
          ${order_type === 'Takeaway' ? `<div><strong>Takeaway No:</strong> ${takeaway_no || tableId}</div>` : order_type === 'Delivery' ? `<div><strong>Delivery No:</strong> ${delivery_no || tableId}</div>` : `<div><strong>Table:</strong> Table ${tableId || '1'}</div>`}
          <div><strong>Time:</strong> ${dateTimeStr}</div>
          <div><strong>Server:</strong> ${waiter}</div>
          ${remarks ? `<div><strong>Remarks:</strong> ${remarks}</div>` : ''}
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
