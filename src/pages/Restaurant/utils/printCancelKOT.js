import { posApi } from '../../../api/posApi';
import { getOutletPrintSettings } from '../../../utils/outletSettings';
import { getPrinterMasterSetup, checkUserPrinterAccess } from '../../../utils/printerMasterSettings';
import companyProfileService from '../../../services/companyProfileService';

export const generateCancelKOTHTML = ({
  tableLabel,
  items = [],
  time,
  date,
  reason = '',
  kotNo,
  kotId,
  store_id,
  storeId,
  user_name,
  userName,
  cashier,
  outletSettings = {},
  companyProfile = {},
  logo = ''
}) => {
  const now = new Date();

  // Date and Time formatting matching reference (Date: DD-MM-YYYY, Time: hh:mm am/pm)
  let dateFormatted = '';
  let timeFormatted = '';
  if (date && time) {
    dateFormatted = date;
    timeFormatted = time;
  } else if (time && String(time).includes(' ') && (String(time).includes(':') || String(time).includes('-') || String(time).includes('/'))) {
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

  // Retrieve Company Profile and Logo dynamically
  let cp = companyProfile || {};
  if (!cp.company_name && !cp.logo) {
    try {
      const cached = JSON.parse(localStorage.getItem('alfa_company_profile') || '{}');
      cp = { ...cached, ...cp };
    } catch (e) {}
  }
  const printLogo = logo || cp.logo || cp.logo_url || '';

  // Restaurant Name resolution prioritizing Company Profile
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
    restaurantName = 'ALFA RESTAURANT';
  }
  restaurantName = String(restaurantName).trim().toUpperCase();

  // Table label formatting (e.g. "Table T5")
  let displayTable = '';
  const rawT = String(tableLabel || '1').trim();
  if (rawT.toLowerCase().startsWith('table')) {
    displayTable = rawT;
  } else if (rawT.startsWith('T') || rawT.startsWith('t')) {
    displayTable = `Table ${rawT}`;
  } else {
    displayTable = `Table T${rawT}`;
  }

  // NC KOT Number resolution (e.g. "NC KOT: 3")
  const rawKot = kotNo || kotId || (items[0] && items[0].kotNo) || '1';
  const cleanKotDigits = String(rawKot).replace(/[^0-9]/g, '');
  const ncKotNum = cleanKotDigits ? parseInt(cleanKotDigits, 10) : rawKot;

  // Active User / Staff resolution
  let activeUser = user_name || userName || cashier;
  if (!activeUser) {
    try {
      const u = JSON.parse(localStorage.getItem('alfa_user') || localStorage.getItem('user') || '{}');
      activeUser = u.name || u.username || u.user_name || 'SAMAR';
    } catch (e) {
      activeUser = 'SAMAR';
    }
  }
  activeUser = String(activeUser).toUpperCase();

  const cancelRemark = String(reason || '').trim();

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>KOT CANCELLED - ${ncKotNum}</title>
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
          .cancel-container {
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
          .cancel-title {
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

          /* DO NOT PREPARE notice */
          .do-not-prepare {
            text-align: center;
            font-size: 12.5px;
            font-weight: 900;
            letter-spacing: 0.3px;
            margin: 4px 0 6px 0;
            text-transform: uppercase;
          }

          /* Items Table */
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 2px;
            margin-bottom: 4px;
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
          .cancelled-item-title {
            font-weight: 800;
            color: #000000;
            text-decoration: line-through;
            text-decoration-thickness: 1.5px;
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

          /* Dividers */
          .solid-divider {
            border: none;
            border-top: 1.2px solid #000000;
            margin: 5px 0;
          }

          /* Remark Section */
          .remark-section {
            font-size: 11.5px;
            font-weight: 900;
            text-transform: uppercase;
            margin: 5px 0;
            line-height: 1.3;
            word-break: break-word;
          }

          /* Footer */
          .footer-section {
            text-align: center;
            margin-top: 4px;
          }
          .cancelled-kot-title {
            font-size: 12px;
            font-weight: 900;
            letter-spacing: 0.3px;
            margin-bottom: 3px;
            text-transform: uppercase;
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
        <div class="cancel-container">

          <!-- Header -->
          <div class="text-center">
            ${printLogo ? `<div style="text-align: center; margin-bottom: 3px;"><img src="${printLogo}" alt="Logo" style="max-height: 40px; max-width: 110px; object-fit: contain;"></div>` : ''}
            <div class="restaurant-name">${restaurantName}</div>
            <div class="cancel-title">KOT CANCELLED</div>
          </div>

          <!-- Order Info Grid -->
          <div class="info-grid">
            <div class="info-row">
              <div class="info-col-left">Date: ${dateFormatted}</div>
              <div class="info-col-right">Time: ${timeFormatted}</div>
            </div>
            <div class="info-row">
              <div class="info-col-left">Table: ${displayTable}</div>
              <div class="info-col-right">NC KOT: ${ncKotNum}</div>
            </div>
          </div>

          <!-- Notice -->
          <div class="do-not-prepare">DO NOT PREPARE</div>

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
                return `
                  <tr>
                    <td>
                      <span class="cancelled-item-title">${displayName}</span>
                    </td>
                    <td class="qty-col">${item.qty || item.quantity || 1}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>

          <!-- Horizontal Divider below items -->
          <hr class="solid-divider" />

          <!-- Cancellation Remark -->
          <div class="remark-section">
            CANCEL REMARK: ${cancelRemark || 'Cancelled'}
          </div>

          <!-- Horizontal Divider below remark -->
          <hr class="solid-divider" />

          <!-- Footer -->
          <div class="footer-section">
            <div class="cancelled-kot-title">CANCELLED KOT</div>
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

export const printCancelKOT = async (data, preOpenedWindow = null) => {
  const targetStoreId = data?.store_id || data?.storeId || localStorage.getItem('activeOutletId') || "STORE_1";
  const printerSetup = getPrinterMasterSetup(targetStoreId);
  const targetPrinter = data?.printerName || printerSetup.centralKotPrintingPath || printerSetup.billPrintingPath || 'RP3200 plus(U) 12';

  // Verify printer access permissions
  const access = checkUserPrinterAccess('printKot', targetPrinter);
  if (!access.allowed) {
    const errMsg = access.message || 'You do not have permission to print Cancelled KOT.';
    if (window.showToast) window.showToast(errMsg, 'warning');
    if (preOpenedWindow) {
      try { preOpenedWindow.close(); } catch (e) {}
    }
    return false;
  }

  try {
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

    const desktopHtml = generateCancelKOTHTML({
      ...data,
      companyProfile,
      logo: data.logo || companyProfile.logo,
      outletSettings
    });

    console.log(`%c🚫 [Cancel KOT Print] Dispatching Cancelled KOT to "${targetPrinter}"...`, 'color: #dc2626; font-weight: bold;');

    const response = await posApi.sendPrintRequest({
      id: 'print-cancel',
      type: 'print',
      job_type: 'KOT',
      print_purpose: 'CANCEL_KOT',
      printerName: targetPrinter,
      deviceName: targetPrinter,
      printer: targetPrinter,
      html: desktopHtml,
      store_id: targetStoreId,
      converttoPdf: false
    });

    if (response?.data?.success || response?.success) {
      if (preOpenedWindow) preOpenedWindow.close();
      if (window.showToast) window.showToast('✅ Cancelled KOT printed');
      return true;
    } else {
      if (window.showToast) window.showToast('❌ ' + (response?.error || 'Print job failed'));
      if (preOpenedWindow) preOpenedWindow.close();
      return false;
    }
  } catch (error) {
    console.error('Print Cancel KOT error:', error);
    if (window.showToast) window.showToast('❌ Print API unavailable');
    if (preOpenedWindow) preOpenedWindow.close();
    return false;
  }
};

