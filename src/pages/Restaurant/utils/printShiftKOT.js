import { posApi } from '../../../api/posApi';
import { getOutletPrintSettings } from '../../../utils/outletSettings';
import companyProfileService from '../../../services/companyProfileService';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { addRupeeFont } from '../../../utils/addRupeeFont';

/**
 * Generates the clean thermal HTML payload for Table Move / Shift slip.
 */
export const generateShiftKOTHTML = ({
  fromTableLabel = 'T1',
  toTableLabel = 'T2',
  items = [],
  time,
  date,
  kotNo,
  waiter = 'Staff',
  transferType = 'Full Table Move',
  outletName = '',
  companyTitle = '',
  user_name = '',
  isBrowser = false,
  companyProfile = {},
  logo = ''
}) => {
  const now = new Date();
  const dateTimeStr = (date && time)
    ? `${date} ${time}`
    : (now.toLocaleDateString('en-IN') + ' ' + now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }));

  let activeUser = user_name;
  if (!activeUser) {
    try {
      const u = JSON.parse(localStorage.getItem('alfa_user') || localStorage.getItem('user') || '{}');
      activeUser = u.name || u.username || u.user_name || 'Admin';
    } catch (e) {
      activeUser = 'Admin';
    }
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

  const cleanItems = Array.isArray(items) ? items : [];
  const totalQty = cleanItems.reduce((sum, it) => sum + Number(it.qty || it.quantity || 1), 0);

  const displayTitle = cp.company_name || cp.name || cp.restaurant_name || companyTitle || 'ALFA RESTAURANT';
  const displayOutlet = outletName ? outletName.toUpperCase() : '';

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Table Transfer Slip - ${fromTableLabel} to ${toTableLabel}</title>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800;900&display=swap" rel="stylesheet">
        <style>
          @page {
            margin: 0mm;
            size: 76mm auto;
          }
          * {
            box-sizing: border-box;
          }
          body {
            font-family: 'Courier New', Courier, monospace, 'Outfit', sans-serif;
            margin: 0;
            padding: 0;
            width: 100%;
            color: #000000;
            background: #ffffff;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .ticket-container {
            width: 76mm;
            max-width: 320px;
            margin: 0 auto;
            padding: 4mm 3mm;
            box-sizing: border-box;
          }
          .header-center {
            text-align: center;
          }
          .company-name {
            font-size: 15px;
            font-weight: 900;
            letter-spacing: 0.5px;
            text-transform: uppercase;
            margin-bottom: 2px;
          }
          .outlet-name {
            font-size: 11px;
            font-weight: 700;
            color: #333333;
            margin-bottom: 4px;
          }
          .badge-box {
            display: inline-block;
            border: 1.5px solid #000000;
            padding: 3px 8px;
            font-size: 12px;
            font-weight: 900;
            letter-spacing: 0.8px;
            text-transform: uppercase;
            margin: 4px auto 6px;
            border-radius: 3px;
          }
          .divider {
            border-top: 1.5px dashed #000000;
            margin: 6px 0;
          }
          .route-container {
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: #f8f9fa;
            border: 1.5px solid #000000;
            border-radius: 4px;
            padding: 6px 8px;
            margin: 6px 0;
          }
          .route-box {
            text-align: center;
            flex: 1;
          }
          .route-title {
            font-size: 9px;
            font-weight: 700;
            text-transform: uppercase;
            color: #555555;
            margin-bottom: 2px;
          }
          .route-table {
            font-size: 16px;
            font-weight: 900;
            color: #000000;
          }
          .route-arrow {
            font-size: 18px;
            font-weight: 900;
            padding: 0 6px;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            font-size: 11.5px;
            line-height: 1.35;
            margin: 2px 0;
          }
          .info-label {
            font-weight: 600;
            color: #333333;
          }
          .info-value {
            font-weight: 800;
            text-align: right;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 4px;
          }
          th {
            border-bottom: 1.5px dashed #000000;
            padding: 4px 0;
            font-size: 11.5px;
            font-weight: 900;
            text-align: left;
            text-transform: uppercase;
          }
          td {
            padding: 4px 0;
            font-size: 12px;
            vertical-align: top;
            border-bottom: 1px dotted #cccccc;
          }
          .item-name {
            font-weight: 800;
          }
          .item-note {
            font-size: 10.5px;
            font-style: italic;
            color: #444444;
          }
          .qty-col {
            text-align: right;
            font-weight: 900;
            font-size: 13px;
          }
          .summary-box {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            font-weight: 800;
            margin-top: 6px;
          }
          .footer {
            text-align: center;
            font-size: 10.5px;
            margin-top: 8px;
            color: #222222;
          }
        </style>
      </head>
      <body>
        <div class="ticket-container">
          <!-- Header -->
          <div class="header-center">
            ${printLogo ? `<div style="text-align: center; margin-bottom: 3px;"><img src="${printLogo}" alt="Logo" style="max-height: 40px; max-width: 110px; object-fit: contain;"></div>` : ''}
            <div class="company-name">${displayTitle}</div>
            ${displayOutlet ? `<div class="outlet-name">${displayOutlet}</div>` : ''}
            <div class="badge-box">TABLE TRANSFER SLIP</div>
          </div>

          <!-- Transfer Route Highlight -->
          <div class="route-container">
            <div class="route-box">
              <div class="route-title">From Table</div>
              <div class="route-table">${fromTableLabel}</div>
            </div>
            <div class="route-arrow">➔</div>
            <div class="route-box">
              <div class="route-title">To Table</div>
              <div class="route-table">${toTableLabel}</div>
            </div>
          </div>

          <!-- Meta Information -->
          <div class="info-row">
            <span class="info-label">Date & Time:</span>
            <span class="info-value">${dateTimeStr}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Transfer Type:</span>
            <span class="info-value">${transferType}</span>
          </div>
          ${kotNo ? `
            <div class="info-row">
              <span class="info-label">KOT Ref:</span>
              <span class="info-value">${kotNo}</span>
            </div>
          ` : ''}
          ${waiter ? `
            <div class="info-row">
              <span class="info-label">Steward:</span>
              <span class="info-value">${waiter}</span>
            </div>
          ` : ''}
          <div class="info-row">
            <span class="info-label">Transferred By:</span>
            <span class="info-value">${activeUser}</span>
          </div>

          <div class="divider"></div>

          <!-- Items Table -->
          <table>
            <thead>
              <tr>
                <th style="width: 10%;">#</th>
                <th style="width: 70%;">Item Description</th>
                <th style="width: 20%; text-align: right;">Qty</th>
              </tr>
            </thead>
            <tbody>
              ${cleanItems.length === 0 ? `
                <tr>
                  <td colspan="3" style="text-align: center; padding: 10px 0; font-style: italic; color: #666;">
                    Complete table order transferred
                  </td>
                </tr>
              ` : cleanItems.map((item, idx) => `
                <tr>
                  <td style="color: #666; font-size: 11px;">${idx + 1}</td>
                  <td>
                    <div class="item-name">${item.name || item.itemName || 'Item'}</div>
                    ${item.variant ? `<div class="item-note">(${item.variant})</div>` : ''}
                    ${(item.remarks || item.remark) ? `<div class="item-note">* ${item.remarks || item.remark}</div>` : ''}
                  </td>
                  <td class="qty-col">${item.qty || item.quantity || 1}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="divider"></div>

          <!-- Summary -->
          <div class="summary-box">
            <span>Total Items:</span>
            <span>${cleanItems.length} items (${totalQty} qty)</span>
          </div>

          <div class="divider"></div>

          <!-- Footer -->
          <div class="footer">
            <div style="font-weight: 800;">*** TABLE TRANSFER COMPLETE ***</div>
            <div style="font-size: 9.5px; margin-top: 3px; color: #555;">Kitchen & Service Transfer Record</div>
          </div>
        </div>
      </body>
    </html>
  `;
};

/**
 * Generates an offline client-side PDF using jsPDF for Table Transfer.
 */
export const generateClientSideShiftPDF = (shiftData, companyProfile = {}, outletSettings = {}) => {
  const items = Array.isArray(shiftData.items) ? shiftData.items : [];
  const fromTable = shiftData.fromTableLabel || shiftData.fromTable || 'T1';
  const toTable = shiftData.toTableLabel || shiftData.toTable || 'T2';
  const cleanFrom = String(fromTable).replace(/[^a-zA-Z0-9]/g, '');
  const cleanTo = String(toTable).replace(/[^a-zA-Z0-9]/g, '');
  const docId = `SHIFT-T${cleanFrom}-TO-T${cleanTo}`;

  const now = new Date();
  const dateTimeStr = (shiftData.date && shiftData.time)
    ? `${shiftData.date} ${shiftData.time}`
    : (now.toLocaleDateString('en-IN') + ' ' + now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }));

  const companyTitle = outletSettings.companyTitle || companyProfile.company_name || 'ALFA RESTAURANT';
  const outletName = outletSettings.outletName || shiftData.outletName || '';

  const estimatedHeight = Math.max(130, 85 + (items.length * 8));
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [80, estimatedHeight]
  });
  addRupeeFont(doc);

  let y = 7;
  doc.setFont('ArialRupee', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(0, 0, 0);
  doc.text(companyTitle.toUpperCase(), 40, y, { align: 'center' });
  y += 4;

  if (outletName) {
    doc.setFontSize(8.5);
    doc.text(outletName.toUpperCase(), 40, y, { align: 'center' });
    y += 3.5;
  }

  doc.setFontSize(9);
  doc.text('TABLE TRANSFER SLIP', 40, y, { align: 'center' });
  y += 4;

  doc.setFont('ArialRupee', 'bold');
  doc.setFontSize(9.5);
  doc.text(`FROM: ${fromTable}  --->  TO: ${toTable}`, 40, y, { align: 'center' });
  y += 4;

  doc.setFont('ArialRupee', 'normal');
  doc.setFontSize(7.5);
  doc.text(`Time: ${dateTimeStr}`, 4, y);
  doc.text(`Type: ${shiftData.transferType || 'Table Move'}`, 76, y, { align: 'right' });
  y += 3.5;

  if (shiftData.kotNo) {
    doc.text(`KOT: ${shiftData.kotNo}`, 4, y);
    if (shiftData.waiter) doc.text(`Steward: ${shiftData.waiter}`, 76, y, { align: 'right' });
    y += 3.5;
  } else if (shiftData.waiter) {
    doc.text(`Steward: ${shiftData.waiter}`, 4, y);
    y += 3.5;
  }

  autoTable(doc, {
    startY: y,
    margin: { left: 4, right: 4 },
    head: [['#', 'ITEM', 'QTY']],
    body: items.length === 0
      ? [['-', 'Complete Order Transferred', '-']]
      : items.map((item, idx) => [
          String(idx + 1),
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
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 54, halign: 'left' },
      2: { cellWidth: 10, halign: 'right' }
    }
  });

  let finalY = (doc.lastAutoTable?.finalY || y) + 2;
  doc.setLineDashPattern([0.8, 0.8], 0);
  doc.line(4, finalY, 76, finalY);
  finalY += 3.5;

  doc.setFont('ArialRupee', 'bold');
  doc.setFontSize(7.5);
  doc.text('*** TABLE TRANSFER COMPLETED ***', 40, finalY, { align: 'center' });

  doc.save(`${docId}.pdf`);
  return true;
};

/**
 * Saves Table Transfer Slip as PDF directly using offline jsPDF.
 */
export const saveShiftKOTAsPDF = async (data) => {
  try {
    const targetStoreId = data.store_id || data.storeId || localStorage.getItem('activeOutletId') || 'STORE_1';
    let companyProfile = {};
    try {
      const res = await companyProfileService.getProfile();
      companyProfile = res?.data || res?.companyProfile || (res && res.id ? res : {});
    } catch (err) {
      console.warn('Failed to load company profile for shift PDF:', err);
    }
    const outletSettings = await getOutletPrintSettings(targetStoreId);

    generateClientSideShiftPDF(data, companyProfile, outletSettings);
    if (window.showToast) window.showToast('✅ Transfer slip PDF saved successfully');
    return true;
  } catch (err) {
    console.warn('Client-side shift PDF generation error:', err);
    if (window.showToast) window.showToast('❌ Failed to save transfer slip PDF');
    return false;
  }
};

/**
 * Main printShiftKOT: Sends print request to backend print engine.
 * Directly prompts Windows "Save Print Output As" dialog to generate PDF,
 * exactly like KOT and Invoice.
 */
export const printShiftKOT = async (params = {}, preOpenedWindow = null) => {
  const fromTableLabel = params.fromTableLabel || params.fromTable || 'T1';
  const toTableLabel = params.toTableLabel || params.toTable || 'T2';
  const cleanFrom = String(fromTableLabel).replace(/[^a-zA-Z0-9]/g, '');
  const cleanTo = String(toTableLabel).replace(/[^a-zA-Z0-9]/g, '');
  const docId = `SHIFT-T${cleanFrom}-TO-T${cleanTo}`;

  const targetStoreId = params.store_id || params.storeId || localStorage.getItem('activeOutletId') || 'STORE_1';

  let companyProfile = {};
  try {
    const res = await companyProfileService.getProfile();
    companyProfile = res?.data || res?.companyProfile || (res && res.id ? res : {});
  } catch (err) {
    console.warn('Failed to fetch company profile for shift print:', err);
  }

  let outletSettings = {};
  try {
    outletSettings = await getOutletPrintSettings(targetStoreId);
  } catch (err) {
    console.warn('Failed to fetch outlet settings for shift print:', err);
  }

  const htmlData = {
    ...params,
    fromTableLabel,
    toTableLabel,
    companyProfile,
    logo: params.logo || companyProfile.logo,
    companyTitle: companyProfile.company_name || companyProfile.name || outletSettings.companyTitle || 'ALFA RESTAURANT',
    outletName: outletSettings.outletName || params.outletName || '',
    isBrowser: false
  };

  const desktopHtml = generateShiftKOTHTML(htmlData);

  try {
    console.log(`%c🔄 [Shift Table] Dispatching print/PDF for ${docId}...`, 'color: #0284c7;', { docId, targetStoreId });

    const response = await posApi.sendPrintRequest({
      id: docId,
      type: 'print',
      job_type: 'SHIFT_KOT',
      print_purpose: 'KOT',
      html: desktopHtml,
      store_id: targetStoreId,
      printerName: params.printerName || '',
      converttoPdf: false
    });

    if (response?.data?.success || response?.success) {
      if (window.showToast) window.showToast('✅ Table transfer slip print/PDF dispatched');
      if (preOpenedWindow) {
        try { preOpenedWindow.close(); } catch (e) {}
      }
      return true;
    } else {
      console.warn('Backend shift print job failed:', response?.error || response?.message);
      if (window.showToast) window.showToast('ℹ️ ' + (response?.error || 'Save dialog closed'));
      if (preOpenedWindow) {
        try { preOpenedWindow.close(); } catch (e) {}
      }
      return false;
    }
  } catch (err) {
    console.warn('Backend print API unavailable, falling back to client jsPDF:', err);
    saveShiftKOTAsPDF({ ...params, fromTableLabel, toTableLabel, store_id: targetStoreId });
    if (preOpenedWindow) {
      try { preOpenedWindow.close(); } catch (e) {}
    }
    return true;
  }
};
