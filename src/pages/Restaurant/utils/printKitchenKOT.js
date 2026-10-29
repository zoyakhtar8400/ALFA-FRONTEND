import { posApi } from '../../../api/posApi';
import { formatTableLabel } from '../../../utils/tableFormat';
import { getOutletPrintSettings } from '../../../utils/outletSettings';
import { getPrinterMasterSetup, getPrinterForItemCategory, checkUserPrinterAccess } from '../../../utils/printerMasterSettings';
import companyProfileService from '../../../services/companyProfileService';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { addRupeeFont } from '../../../utils/addRupeeFont';

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
  isRunningKOT = false,
  copyIndex = 0,
  totalCopies = 1,
  outletSettings = {},
  companyProfile = {},
  logo = ''
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
  // Retrieve Company Profile and Logo dynamically (from args, companyProfile or localStorage cache)
  let cp = companyProfile || {};
  if (!cp.company_name && !cp.logo) {
    try {
      const cached = JSON.parse(localStorage.getItem('alfa_company_profile') || '{}');
      cp = { ...cached, ...cp };
    } catch (e) {}
  }
  const printLogo = logo || cp.logo || cp.logo_url || '';

  // Prioritize company profile company_name
  let restaurantName = cp.company_name || cp.name || cp.restaurant_name || (outletSettings && (outletSettings.companyTitle || outletSettings.outletName)) || '';
  if (!restaurantName) {
    try {
      const activeName = localStorage.getItem('active_outlet_name') || localStorage.getItem('activeOutletName') || localStorage.getItem('selectedOutletName');
      if (activeName && !activeName.toUpperCase().startsWith('STORE_')) {
        restaurantName = activeName;
      }
    } catch (e) {}
  }
  if (!restaurantName) {
    restaurantName = resolvedOutlet || 'ALFA RESTAURANT';
  }
  restaurantName = String(restaurantName).trim().toUpperCase();

  // Date and Time formatting matching reference (Date: DD-MM-YYYY, Time: hh:mm am/pm)
  let dateFormatted = '';
  let timeFormatted = '';
  if (time && String(time).includes(' ') && (String(time).includes(':') || String(time).includes('-') || String(time).includes('/'))) {
    const parts = String(time).split(' ');
    dateFormatted = parts[0];
    timeFormatted = parts.slice(1).join(' ');
  } else {
    const d = now.getDate().toString().padStart(2, '0');
    const m = (now.getMonth() + 1).toString().padStart(2, '0');
    const y = now.getFullYear();
    dateFormatted = `${d}-${m}-${y}`;
    timeFormatted = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  }

  // Clean KOT number (e.g. "KOT No: 2" or "NC KOT: 32")
  const rawKotNo = id || '1';
  const cleanKotDigits = String(rawKotNo).replace(/[^0-9]/g, '');
  const kotDisplayNum = cleanKotDigits ? parseInt(cleanKotDigits, 10) : rawKotNo;

  // Table label formatting (e.g. "Table T1", "Table T2")
  let displayTable = '';
  if (order_type === 'Takeaway') {
    displayTable = `Takeaway ${takeaway_no || tableId || ''}`.trim();
  } else if (order_type === 'Delivery') {
    displayTable = `Delivery ${delivery_no || tableId || ''}`.trim();
  } else {
    const rawT = String(tableId || '1').trim();
    if (rawT.toLowerCase().startsWith('table')) {
      displayTable = rawT;
    } else if (rawT.startsWith('T') || rawT.startsWith('t')) {
      displayTable = `Table ${rawT}`;
    } else {
      displayTable = `Table T${rawT}`;
    }
  }

  // Steward / Staff name
  const stewardName = waiter || 'System Administrator';

  // Subtitle header: "NC ORDER" for NC KOT, "NEW ORDER" for standard KOT
  const orderTitle = resolvedIsNC ? 'NC ORDER' : (isReprint ? 'KOT REPRINT' : 'NEW ORDER');

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${orderTitle} - ${id || 'KOT'}</title>
        <style>
          @page {
            margin: 0mm;
            size: 76mm auto;
          }
          * {
            box-sizing: border-box;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            margin: 0;
            padding: 0;
            width: 76mm;
            max-width: 76mm;
            color: #000000;
            font-size: 13px;
            background: #ffffff;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .kot-container {
            width: 76mm;
            max-width: 76mm;
            margin: 0 auto;
            padding: 3mm 3.5mm 5mm 3.5mm;
            box-sizing: border-box;
          }
          .text-center { text-align: center; }
          .bold { font-weight: bold; }
          
          /* Header */
          .restaurant-name {
            font-size: 14px;
            font-weight: 900;
            letter-spacing: 0.5px;
            text-transform: uppercase;
            line-height: 1.2;
            margin-bottom: 2px;
          }
          .order-type-title {
            font-size: 13.5px;
            font-weight: 900;
            letter-spacing: 0.4px;
            text-transform: uppercase;
            line-height: 1.2;
            margin-bottom: 6px;
          }

          /* Info Grid - 2 columns */
          .info-grid {
            display: table;
            width: 100%;
            margin-bottom: 6px;
            font-size: 11.5px;
            line-height: 1.35;
            font-weight: 700;
          }
          .info-row {
            display: table-row;
          }
          .info-col-left {
            display: table-cell;
            text-align: left;
            vertical-align: top;
            width: 55%;
            padding-right: 4px;
            word-break: break-word;
          }
          .info-col-right {
            display: table-cell;
            text-align: right;
            vertical-align: top;
            width: 45%;
            white-space: nowrap;
          }

          /* Items Table */
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 2px;
            margin-bottom: 6px;
          }
          .items-table thead th {
            background-color: #3e3835 !important;
            color: #ffffff !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            font-size: 11.5px;
            font-weight: 900;
            letter-spacing: 0.5px;
            padding: 3px 6px;
            line-height: 1.2;
          }
          .items-table thead th.th-item {
            text-align: left;
          }
          .items-table thead th.th-qty {
            text-align: right;
            width: 45px;
          }
          .items-table tbody td {
            padding: 4px 4px 4px 2px;
            vertical-align: top;
            font-size: 12px;
            line-height: 1.25;
            color: #000000;
          }
          .item-title {
            font-weight: 800;
            color: #000000;
            word-break: break-word;
          }
          .item-remark-line {
            font-size: 10.5px;
            font-style: italic;
            font-weight: 700;
            color: #1a1a1a;
            margin-top: 1px;
            word-break: break-word;
          }
          .qty-col {
            font-size: 12.5px;
            font-weight: 900;
            text-align: right;
            white-space: nowrap;
            vertical-align: top;
            padding-right: 4px;
          }

          /* NC Box matching reference image 3 */
          .nc-box {
            border: 1px solid #000000;
            border-top: 1px solid #000000;
            border-bottom: 1px solid #000000;
            padding: 3px 2px;
            margin: 6px 0;
            text-align: center;
            font-size: 10.5px;
            font-weight: 900;
            letter-spacing: 0.2px;
          }

          /* Dividers */
          .solid-divider {
            border: none;
            border-top: 1.2px solid #000000;
            margin: 5px 0 6px 0;
          }

          /* Footer */
          .footer-section {
            text-align: center;
            margin-top: 4px;
          }
          .kitchen-copy-title {
            font-size: 12px;
            font-weight: 900;
            margin-bottom: 3px;
          }
          .audit-line {
            font-size: 9.5px;
            font-weight: 700;
            color: #000000;
            line-height: 1.25;
          }
        </style>
      </head>
      <body>
        <div class="kot-container">

          <!-- Header -->
          <div class="text-center">
            ${printLogo ? `<div style="text-align: center; margin-bottom: 3px;"><img src="${printLogo}" alt="Logo" style="max-height: 40px; max-width: 110px; object-fit: contain;"></div>` : ''}
            <div class="restaurant-name">${restaurantName}</div>
            <div class="order-type-title">${orderTitle}</div>
          </div>

          <!-- Order Info Grid -->
          <div class="info-grid">
            <div class="info-row">
              <div class="info-col-left">Date: ${dateFormatted}</div>
              <div class="info-col-right">Time: ${timeFormatted}</div>
            </div>
            <div class="info-row">
              <div class="info-col-left">Table: ${displayTable}</div>
              <div class="info-col-right">${resolvedIsNC ? 'NC KOT:' : 'KOT No:'} ${kotDisplayNum}</div>
            </div>
            <div class="info-row">
              <div class="info-col-left">
                Steward: ${stewardName}
              </div>
              <div class="info-col-right">Pax: ${resolvedPax}</div>
            </div>
          </div>

          <!-- Items Table -->
          <table class="items-table">
            <thead>
              <tr>
                <th class="th-item">ITEM</th>
                <th class="th-qty">QTY</th>
              </tr>
            </thead>
            <tbody>
              ${items.map(item => {
                const baseName = item.itemName || item.name || item.title || item.item_name || '';
                const variantStr = item.variantName || item.variant || item.alternative_title || '';
                const servingStr = item.variantServing ? ` - ${item.variantServing}` : '';
                const displayName = (variantStr && !baseName.toLowerCase().includes(variantStr.toLowerCase()))
                  ? `${baseName} (${variantStr}${servingStr})`
                  : baseName;
                const itemRemark = item.remarks || item.remark || '';
                return `
                  <tr>
                    <td>
                      <div class="item-title">${displayName}</div>
                      ${itemRemark ? `<div class="item-remark-line">Remark: ${itemRemark}</div>` : ''}
                    </td>
                    <td class="qty-col">${item.qty || item.quantity || 1}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>

          ${resolvedGlobalRemark ? `
            <div style="font-size: 11px; font-weight: 800; font-style: italic; margin: 4px 0 6px 0;">
              Remark: ${resolvedGlobalRemark}
            </div>
          ` : ''}

          <!-- If NC / Complimentary Order, display NC box matching Reference Photo 3 -->
          ${resolvedIsNC ? `
            <div class="nc-box">
              NC / COMPLIMENTARY &mdash; CHARGEABLE: &#8377;0
            </div>
          ` : ''}

          <!-- Bottom Divider & Footer -->
          <hr class="solid-divider" />

          <div class="footer-section">
            <div class="kitchen-copy-title">Kitchen Copy</div>
            <div class="audit-line">
              User: ${activeUser} &nbsp;|&nbsp; Print Date &amp; Time: ${dateFormatted}<br />
              ${timeFormatted}
            </div>
          </div>

        </div>
      </body>
    </html>
  `;
};

export const triggerSystemPrint = async (htmlContent) => {
  // Frontend print trigger disabled — delegated solely to backend Electron print manager
  return posApi.sendPrintRequest({
    type: "print",
    job_type: "KOT",
    html: htmlContent
  });
};

/**
 * Prints a dedicated Kitchen Order Ticket (KOT) for kitchen staff via the backend print engine.
 */
export const printKitchenKOT = async (data) => {
  try {
    const targetStoreId = data.store_id || data.storeId || data.printer?.store_id || localStorage.getItem('activeOutletId') || "STORE_1";
    const printerSetup = getPrinterMasterSetup(targetStoreId);

    // Resolve Category-specific printer based on Item Categorywise Printing Path
    let resolvedCategory = data.category || data.itemCategory || data.stationName || '';
    if (!resolvedCategory && Array.isArray(data.items) && data.items.length > 0) {
      const firstItem = data.items[0];
      resolvedCategory = firstItem.category || firstItem.categoryName || firstItem.category_name || firstItem.item_category || firstItem.group || firstItem.group_name || firstItem.main_group || '';
    }

    const categoryPrinter = getPrinterForItemCategory(resolvedCategory, targetStoreId);
    const targetPrinter = data.printerName || data.printer_name || categoryPrinter || printerSetup.centralKotPrintingPath || printerSetup.billPrintingPath || 'RP3200 plus(U) 12';

    // Verify User Printer Access permissions
    const isReprint = Boolean(data.isReprint || data.reprint);
    const access = checkUserPrinterAccess(isReprint ? 'reprint' : 'printKot', targetPrinter);
    if (!access.allowed) {
      const errMsg = access.message || 'You do not have permission to print Kitchen Order Tickets (KOT).';
      if (window.showToast) window.showToast(errMsg, 'warning');
      return false;
    }

    const totalCopies = 1; // Send request strictly once per KOT action
    const outletSettings = await getOutletPrintSettings(targetStoreId);

    let companyProfile = {};
    try {
      const cpRes = await companyProfileService.getProfile();
      companyProfile = cpRes?.data || cpRes?.companyProfile || (cpRes && cpRes.id ? cpRes : {});
      if (companyProfile && (companyProfile.company_name || companyProfile.logo)) {
        localStorage.setItem('alfa_company_profile', JSON.stringify(companyProfile));
      }
    } catch (e) {
      try {
        companyProfile = JSON.parse(localStorage.getItem('alfa_company_profile') || '{}');
      } catch (e2) {}
    }

    const htmlContent = generateKitchenKOTHTML({
      ...data,
      companyProfile,
      logo: data.logo || companyProfile.logo,
      printerName: targetPrinter,
      isBrowser: false,
      copyIndex: 0,
      totalCopies: 1,
      outletSettings
    });

    console.log(`%c🍳 [KOT Print] Routing order (${data.id || data.kotNo || 'KOT'}) to "${targetPrinter}" [Category: ${resolvedCategory || 'General'}]...`, 'color: #0284c7;');

    // Dispatch to backend API exactly once
    const res = await posApi.sendPrintRequest({
      ...data,
      id: data.id || data.kotNo || "print-kot",
      job_type: "KOT",
      print_purpose: "KOT",
      type: "KOT",
      printerName: targetPrinter,
      deviceName: targetPrinter,
      printer: targetPrinter,
      html: htmlContent,
      printer_id: data.printerId || data.printer_id || data.printer?.id,
      store_id: targetStoreId,
      converttoPdf: false
    });

    if (res && res.error) {
      console.warn('Backend print warning:', res.error);
    }

    if (window.showToast) {
      window.showToast(`✅ KOT dispatched to ${targetPrinter}`);
    }
    return true;
  } catch (err) {
    console.warn('Print error in printKitchenKOT:', err);
    if (window.showToast) window.showToast('❌ Failed to process KOT print');
    return false;
  }
};

export const generateClientSideKOTPDF = (kotData, outletSettings = {}) => {
  const items = Array.isArray(kotData.items) ? kotData.items : [];
  const kotNo = kotData.kotNo || kotData.id || 'KOT-1';
  const tableNo = kotData.tableNo || kotData.tableId || '1';
  const now = new Date();
  const dateTimeStr = kotData.time || (now.toLocaleDateString('en-IN') + ' ' + now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }));
  const waiter = kotData.waiter || 'Staff';
  const station = kotData.stationName || 'MAIN KITCHEN';
  const remarks = kotData.remarks || kotData.remark || '';

  const estimatedHeight = Math.max(130, 80 + (items.length * 8));

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [80, estimatedHeight]
  });
  addRupeeFont(doc);

  let y = 7;
  doc.setFont('ArialRupee', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text((outletSettings.outletName || 'KITCHEN ORDER TICKET').toUpperCase(), 40, y, { align: 'center' });
  y += 4;

  doc.setFontSize(9);
  doc.text(`KOT: ${kotNo}`, 4, y);
  doc.text(`Table: ${tableNo}`, 76, y, { align: 'right' });
  y += 3.5;

  doc.setFont('ArialRupee', 'normal');
  doc.setFontSize(7);
  doc.text(`Station: ${station}`, 4, y);
  doc.text(`Staff: ${waiter}`, 76, y, { align: 'right' });
  y += 3;

  doc.text(`Time: ${dateTimeStr}`, 4, y);
  y += 3;

  autoTable(doc, {
    startY: y,
    margin: { left: 4, right: 4 },
    head: [['ITEM', 'QTY']],
    body: items.map(item => [
      (item.name || item.itemName || '') + (item.variant ? ` (${item.variant})` : '') + (item.remarks || item.remark ? `\n* ${item.remarks || item.remark}` : ''),
      String(item.qty || item.quantity || 1)
    ]),
    theme: 'plain',
    styles: {
      font: 'ArialRupee',
      fontSize: 7.5,
      cellPadding: 1,
      textColor: [0, 0, 0]
    },
    headStyles: {
      fontStyle: 'bold',
      lineWidth: { top: 0.2, bottom: 0.2 },
      lineColor: [0, 0, 0]
    },
    columnStyles: {
      0: { cellWidth: 58, halign: 'left' },
      1: { cellWidth: 14, halign: 'center' }
    }
  });

  let finalY = (doc.lastAutoTable?.finalY || y) + 2;
  if (remarks) {
    doc.setLineDashPattern([0.8, 0.8], 0);
    doc.line(4, finalY, 76, finalY);
    finalY += 3;
    doc.setFont('ArialRupee', 'normal');
    doc.setFontSize(7);
    doc.text(`* Remarks: ${remarks}`, 4, finalY);
  }

  doc.save(`${kotNo}.pdf`);
  return true;
};

export const saveKitchenKOTAsPDF = async (data) => {
  try {
    const targetStoreId = data.store_id || data.storeId || localStorage.getItem('activeOutletId') || 'STORE_1';
    const outletSettings = await getOutletPrintSettings(targetStoreId);

    // 1. Direct client-side jsPDF generation — 100% offline & local, no localhost 8080 or backend required
    generateClientSideKOTPDF(data, outletSettings);
    if (window.showToast) window.showToast('✅ KOT PDF saved successfully');
    return true;
  } catch (err) {
    console.warn('Client-side KOT PDF generation error, trying fallback:', err);
    try {
      const htmlContent = generateKitchenKOTHTML({ ...data, isBrowser: true });
      const printWin = window.open('', '_blank', 'width=450,height=600');
      if (printWin) {
        printWin.document.write(htmlContent);
        printWin.document.close();
        printWin.focus();
        setTimeout(() => {
          try { printWin.print(); } catch (e) {}
        }, 300);
        return true;
      }
    } catch (e2) {
      console.error('All KOT PDF save methods failed:', e2);
      if (window.showToast) window.showToast('❌ Failed to save KOT as PDF');
      return false;
    }
  }
};

export const printStationKOT = printKitchenKOT;

