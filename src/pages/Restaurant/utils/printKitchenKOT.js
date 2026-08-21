import { posApi } from '../../../api/posApi';

/**
 * Generates the raw HTML payload for the KOT.
 */
export const generateKitchenKOTHTML = ({ id, tableId, time, items = [], waiter = 'Staff', stationName, printerName, remarks = '', isReprint = false, order_type, takeaway_no, delivery_no, isBrowser = false, store_id, storeId, guests, type }) => {
  const now = new Date();
  const dateTimeStr = time || (now.toLocaleDateString('en-IN') + ' ' + now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }));
  const displayStation = (stationName && stationName.toLowerCase() !== 'unassigned printer') ? `${stationName.toUpperCase()}` : 'MAIN KITCHEN';
  const printerSub = (printerName && printerName.toLowerCase() !== 'unassigned printer') ? `Printer: ${printerName}` : '';

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>KOT Ticket - ${id || 'KOT'}</title>
        <style>
          @page {
            margin: 0mm;
            size: 80mm auto;
          }
          * {
            box-sizing: border-box;
          }
          body {
            font-family: 'Courier New', Courier, monospace;
            margin: 0;
            padding: 0;
            width: 80mm;
            max-width: 80mm;
            color: #000000;
            font-size: 13px;
            background: #ffffff;
          }
          .invoice-container {
            width: 80mm;
            max-width: 80mm;
            margin: 0;
            padding: 4mm 4mm;
          }
          .text-center { text-align: center; }
          .bold { font-weight: bold; }
          .divider {
            border: none;
            border-top: 1px dashed #000000;
            margin: 6px 0;
          }
          .title {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 4px;
          }
          .subtitle {
            font-size: 13px;
            margin-bottom: 6px;
          }
          
          /* Order Info Flex Layout */
          .info-row {
            display: flex;
            justify-content: space-between;
            font-size: 13px;
            line-height: 1.6;
          }
          .info-label {
            font-weight: bold;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 4px;
          }
          th {
            border-top: 1px dashed #000000;
            border-bottom: 1px solid #000000;
            padding: 4px 0;
            font-size: 13px;
            color: #000000;
            font-weight: bold;
          }
          .th-left { text-align: left; }
          .th-right { text-align: right; }
          
          td {
            padding: 6px 0;
            vertical-align: top;
            font-size: 13px;
            color: #000000;
          }
          .qty {
            font-weight: bold;
            text-align: right;
            white-space: nowrap;
          }
          .item-name {
            word-break: break-word;
          }
          .item-remark {
            font-size: 11px;
            font-style: italic;
            display: block;
            margin-top: 2px;
          }
          .footer {
            border-top: 1px dashed #000000;
            padding-top: 6px;
            margin-top: 6px;
            text-align: center;
            font-size: 11px;
          }
        </style>
      </head>
      <body>
        <div class="invoice-container">

          <!-- Header -->
          <div class="text-center">
            <div class="title">KOT RECEIPT</div>
            <div class="subtitle">Outlet: ${storeId || store_id || 'Restaurant'}</div>
          </div>

          <div class="divider"></div>

          <!-- Order Info -->
          <div class="info-row">
            <span class="info-label">Table:</span>
            <span>${order_type === 'Takeaway' ? 'Takeaway ' + (takeaway_no || tableId) : order_type === 'Delivery' ? 'Delivery ' + (delivery_no || tableId) : 'Table ' + (tableId || '1')}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Steward:</span>
            <span>${waiter}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Guests:</span>
            <span>${guests || '1'} pax</span>
          </div>
          <div class="info-row">
            <span class="info-label">Type:</span>
            <span>${type || order_type || 'Chargeable'}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Time:</span>
            <span>${dateTimeStr}</span>
          </div>
          <div class="info-row" style="display: ${id ? 'flex' : 'none'};">
            <span class="info-label">KOT#:</span>
            <span>${id || 'KOT-101'} ${isReprint ? '(REPRINT)' : ''}</span>
          </div>

          <!-- Items Table -->
          <table>
            <thead>
              <tr>
                <th class="th-left">Item</th>
                <th class="th-right" style="width:40px;">Qty</th>
              </tr>
            </thead>
            <tbody>
              ${items.map(item => {
    const displayName = (item.itemName || item.name || '') + (item.variantName || item.variant ? ` (${item.variantName || item.variant})` : '');
    return `
                <tr>
                  <td>
                    <div class="item-name">${displayName}</div>
                    ${item.remarks || item.remark ? `<div class="item-remark">* ${item.remarks || item.remark}</div>` : ''}
                  </td>
                  <td class="qty">${item.qty || item.quantity || 1}</td>
                </tr>
              `;
  }).join('')}
            </tbody>
          </table>

          <!-- Footer -->
          <div class="footer">
            <div>AlfaPos Cloud System</div>
          </div>

        </div>
        ${isBrowser ? `
        <script>
          setTimeout(function() {
            window.print();
          }, 500);
        </script>
        ` : ''}
      </body>
    </html>
  `;
};

/**
 * Prints a dedicated Kitchen Order Ticket (KOT) for kitchen staff.
 */
export const printKitchenKOT = async (data, preOpenedWindow = null) => {
  try {
    const htmlContent = generateKitchenKOTHTML({ ...data, isBrowser: false });
    
    const payload = {
      ...data,
      id: "print-test",
      type: "print",
      html: htmlContent,
      printer: data.printerName,
      printerIp: data.printerIp,
      converttoPdf: false
    };

    const response = await posApi.sendPrintRequest(payload);
    
    if (response && response.success) {
      if (window.showToast) window.showToast('✅ Print request sent successfully');
      if (preOpenedWindow) preOpenedWindow.close();
      return true;
    } else {
      if (window.showToast) window.showToast('❌ ' + (response?.error || 'Print job failed'));
      if (preOpenedWindow) preOpenedWindow.close();
      return false;
    }
  } catch (err) {
    console.warn('Print API unavailable:', err);
    if (window.showToast) window.showToast('❌ Print API unavailable');
    if (preOpenedWindow) preOpenedWindow.close();
    return false;
  }
};

export const printStationKOT = printKitchenKOT;

