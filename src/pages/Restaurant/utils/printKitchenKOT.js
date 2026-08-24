import { posApi } from '../../../api/posApi';

/**
 * Generates the raw HTML payload for the KOT.
 */
export const generateKitchenKOTHTML = ({
  id,
  tableId,
  time,
  items = [],
  waiter = 'Staff',
  stationName,
  printerName,
  remarks = '',
  remark,
  order_remarks,
  orderRemarks,
  globalRemark,
  global_remarks,
  isReprint = false,
  order_type,
  takeaway_no,
  delivery_no,
  isBrowser = false,
  store_id,
  storeId,
  outletName,
  outlet_name,
  guests,
  pax,
  paxCount,
  type,
  isNC,
  ncType,
  nc_type,
  nc_type_name,
  user_name,
  userName,
  cashier,
  cashier_name,
  isRunningKOT = false
}) => {
  const now = new Date();
  const dateTimeStr = time || (now.toLocaleDateString('en-IN') + ' ' + now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }));
  const displayStation = (stationName && stationName.toLowerCase() !== 'unassigned printer') ? `${stationName.toUpperCase()}` : 'MAIN KITCHEN';
  const printerSub = (printerName && printerName.toLowerCase() !== 'unassigned printer') ? `Printer: ${printerName}` : '';

  // 1. NC Determination & Heading
  const resolvedIsNC = Boolean(
    isNC ||
    ncType ||
    nc_type ||
    nc_type_name ||
    order_type === 'NC' ||
    type === 'NC' ||
    (typeof type === 'string' && type.toUpperCase().includes('NC')) ||
    (typeof remarks === 'string' && remarks.toUpperCase().includes('NC')) ||
    (typeof id === 'string' && id.toUpperCase().includes('FREE'))
  );
  const kotHeading = resolvedIsNC ? 'NC TYPE KOT' : (isRunningKOT ? 'RUNNING KOT' : 'FIRST KOT');
  const resolvedNcType = ncType || nc_type || nc_type_name || (resolvedIsNC ? 'Non-Chargeable' : null);

  // 2. Global Remark
  const resolvedGlobalRemark = remarks || remark || order_remarks || orderRemarks || globalRemark || global_remarks || '';

  // 3. Logged in user name
  let activeUser = user_name || userName || cashier || cashier_name;
  if (!activeUser) {
    try {
      const u = JSON.parse(localStorage.getItem('alfa_user') || localStorage.getItem('user') || '{}');
      activeUser = u.name || u.username || u.user_name || 'Admin';
    } catch (e) {
      activeUser = 'Admin';
    }
  }

  // 4. PAX / Guests
  const resolvedPax = guests || pax || paxCount || '1';

  // 5. Store / Outlet Display (Resolve genuine display name, never raw "STORE_1" / "STORE_15")
  let resolvedOutlet = outletName || outlet_name || '';
  const rawStoreKey = storeId || store_id || '';
  
  if (!resolvedOutlet || resolvedOutlet.toUpperCase().startsWith('STORE_') || /^\d+$/.test(resolvedOutlet)) {
    try {
      const activeName = localStorage.getItem('active_outlet_name') || localStorage.getItem('activeOutletName') || localStorage.getItem('selectedOutletName');
      if (activeName && !activeName.toUpperCase().startsWith('STORE_')) {
        resolvedOutlet = activeName;
      }
    } catch (e) {}
  }
  
  if (!resolvedOutlet || resolvedOutlet.toUpperCase().startsWith('STORE_') || /^\d+$/.test(resolvedOutlet)) {
    try {
      const storedOutlets = JSON.parse(localStorage.getItem('alfa_outlets') || localStorage.getItem('all_outlets') || localStorage.getItem('outlets') || '[]');
      const match = storedOutlets.find(o => 
        String(o.store_id || '').toUpperCase() === String(rawStoreKey || resolvedOutlet).toUpperCase() ||
        String(o.id) === String(rawStoreKey || resolvedOutlet)
      );
      if (match && (match.name || match.store_name)) {
        resolvedOutlet = match.name || match.store_name;
      }
    } catch (e) {}
  }

  if (!resolvedOutlet || resolvedOutlet.toUpperCase().startsWith('STORE_') || /^\d+$/.test(resolvedOutlet)) {
    resolvedOutlet = 'MAIN RESTAURANT';
  }

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${kotHeading} - ${id || 'KOT'}</title>
        <style>
          @page {
            margin: 0mm;
            size: 76mm auto;
          }
          * {
            box-sizing: border-box;
          }
          body {
            font-family: 'Courier New', Courier, monospace;
            margin: 0;
            padding: 0;
            width: 76mm;
            max-width: 76mm;
            color: #000000;
            font-size: 12px;
            background: #ffffff;
          }
          .invoice-container {
            width: 76mm;
            max-width: 76mm;
            margin: 0;
            padding: 2mm 2mm;
          }
          .text-center { text-align: center; }
          .bold { font-weight: bold; }
          .divider {
            border: none;
            border-top: 1px dashed #000000;
            margin: 3px 0;
          }
          .title {
            font-size: 15px;
            font-weight: bold;
            margin-bottom: 2px;
          }
          .subtitle {
            font-size: 11px;
            margin-bottom: 2px;
          }
          
          /* Order Info Flex Layout */
          .info-row {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            line-height: 1.25;
          }
          .info-label {
            font-weight: bold;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 2px;
          }
          th {
            border-top: 1px dashed #000000;
            border-bottom: 1px solid #000000;
            padding: 2px 0;
            font-size: 12px;
            color: #000000;
            font-weight: bold;
          }
          .th-left { text-align: left; }
          .th-right { text-align: right; }
          
          td {
            padding: 2px 0;
            vertical-align: top;
            font-size: 12px;
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
            font-size: 10px;
            font-style: italic;
            display: block;
            margin-top: 1px;
          }
          .footer {
            border-top: 1px dashed #000000;
            padding-top: 3px;
            margin-top: 3px;
            text-align: center;
            font-size: 10px;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="invoice-container">

          <!-- Header -->
          <div class="text-center">
            <div class="title">KOT RECEIPT</div>
            <div class="subtitle" style="font-weight: bold; font-size: 12px; margin-bottom: 3px;">(${kotHeading})</div>
            <div class="subtitle">Outlet: ${resolvedOutlet}</div>
          </div>

          <div class="divider"></div>

          <!-- Order Info -->
          ${resolvedIsNC ? '' : `
          <div class="info-row">
            <span class="info-label">Table:</span>
            <span>${order_type === 'Takeaway' ? 'Takeaway ' + (takeaway_no || tableId) : order_type === 'Delivery' ? 'Delivery ' + (delivery_no || tableId) : 'Table ' + (tableId || '1')}</span>
          </div>
          `}
          <div class="info-row">
            <span class="info-label">Steward:</span>
            <span>${waiter}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Guests:</span>
            <span>${resolvedPax} pax</span>
          </div>
          <div class="info-row">
            <span class="info-label">Type:</span>
            <span>${resolvedIsNC ? 'NC' : (type || order_type || 'Dine In')}</span>
          </div>
          ${resolvedNcType ? `
          <div class="info-row">
            <span class="info-label">NC Type:</span>
            <span class="bold">${resolvedNcType}</span>
          </div>
          ` : ''}
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

          ${resolvedGlobalRemark ? `
          <div class="divider"></div>
          <div style="font-size: 12px; font-weight: bold; margin: 4px 0; word-break: break-word;">
            * Remark: ${resolvedGlobalRemark}
          </div>
          ` : ''}

          <!-- Footer -->
          <div class="footer">
            <div>User: ${activeUser}</div>
          </div>

        </div>
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
      id: data.id || data.kotNo || "print-kot",
      job_type: "KOT",
      print_purpose: "KOT",
      type: "KOT",
      html: htmlContent,
      printer_id: data.printerId || data.printer_id || data.printer?.id,
      printerId: data.printerId || data.printer_id || data.printer?.id,
      printer: data.printerName || data.printer?.printer_name || data.printer?.title,
      printerName: data.printerName || data.printer?.printer_name || data.printer?.title,
      printerIp: data.printerIp || data.printer?.printer_ip || data.printer?.device_address,
      printer_type: "KOT",
      store_id: data.store_id || data.storeId || data.printer?.store_id || "STORE_1",
      converttoPdf: false
    };

    const response = await posApi.sendPrintRequest(payload);
    
    if (response && (response.success || response.data?.success)) {
      if (window.showToast) window.showToast('✅ KOT print request sent successfully');
      if (preOpenedWindow) preOpenedWindow.close();
      return true;
    } else {
      const errMsg = response?.error || response?.data?.error || response?.message || 'Print job failed';
      if (window.showToast) window.showToast('❌ ' + errMsg);
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

export const saveKitchenKOTAsPDF = async (data) => {
  try {
    const htmlContent = generateKitchenKOTHTML({ ...data, isBrowser: true });

    // Server-side PDF generation from /api/v1/print API
    const res = await posApi.saveAsPdf({
      id: data.kotNo || `KOT-${Date.now()}`,
      html: htmlContent,
      type: 'kot'
    });
    if (res && res.data) {
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${data.kotNo || 'KOT'}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      if (window.showToast) window.showToast('✅ KOT PDF saved successfully');
      return true;
    }
    return false;
  } catch (err) {
    console.warn('Save KOT as PDF error:', err);
    if (window.showToast) window.showToast('❌ Failed to save KOT as PDF');
    return false;
  }
};

export const printStationKOT = printKitchenKOT;

