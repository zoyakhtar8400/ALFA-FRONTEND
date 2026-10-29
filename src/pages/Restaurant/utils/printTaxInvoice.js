import companyProfileService from '../../../services/companyProfileService';
import { posApi } from '../../../api/posApi';
import apiClient from '../../../services/apiClient';
import { getOutletPrintSettings } from '../../../utils/outletSettings';
import { getPrinterMasterSetup, checkUserPrinterAccess } from '../../../utils/printerMasterSettings';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { addRupeeFont } from '../../../utils/addRupeeFont';
import { triggerSystemPrint } from './printKitchenKOT';

export const generateInvoiceHTML = (invoiceData, companyProfile, outletSettings = {}, isBrowser = false, copyIndex = 0, totalCopies = 1) => {

  const now = new Date();
  const dateTimeStr = invoiceData.date_time || invoiceData.time || (now.toLocaleDateString('en-IN') + ' ' + now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }));
  const tableNo = invoiceData.table_name || invoiceData.tableName || invoiceData.table_number || invoiceData.tableNo || invoiceData.table_id || '1';

  // Format clean human-readable bill numbers: e.g. "Bill 1", "Bill 2"
  const formatBillTitle = (data) => {
    if (data.bill_num_only || data.billNumberOnly) {
      return `Bill ${data.bill_num_only || data.billNumberOnly}`;
    }
    const raw = data.bill_number || data.billNo || data.custom_bill_number || data.invoice_number || data.order_id || data.id || '';
    const rawStr = String(raw).trim();
    if (/^Bill\s+\d+$/i.test(rawStr)) {
      return rawStr;
    }
    // Extract short clean integer
    const match = rawStr.match(/(\d+)/g);
    if (match && match.length > 0) {
      const lastDigits = match[match.length - 1];
      if (lastDigits.length >= 8) {
        const storedSeq = localStorage.getItem('alfa_pos_bill_sequence');
        return storedSeq ? `Bill ${storedSeq}` : `Bill 1`;
      }
      return `Bill ${parseInt(lastDigits, 10)}`;
    }
    const storedSeq = localStorage.getItem('alfa_pos_bill_sequence');
    return storedSeq ? `Bill ${storedSeq}` : `Bill 1`;
  };

  const invNo = formatBillTitle(invoiceData);

  const extraDetails = typeof invoiceData.extra_details === 'string' ? (function () { try { return JSON.parse(invoiceData.extra_details); } catch (e) { return {}; } })() : (invoiceData.extra_details || {});

  const customerName = invoiceData.customer_name || invoiceData.customerName || 'Walk-in Guest';
  const customerPhone = invoiceData.phone || invoiceData.customer_phone || invoiceData.customerPhone || invoiceData.customer_mobile || extraDetails?.customer_phone || extraDetails?.phone || invoiceData.mobileNo || invoiceData.mobile_no || '';
  const customerLocality = invoiceData.customer_locality || invoiceData.customerLocality || extraDetails?.customer_locality || extraDetails?.locality || '';
  const customerAddress = (invoiceData.customer_address || invoiceData.customerAddress || extraDetails?.customer_address || extraDetails?.address || '') + (customerLocality ? `, ${customerLocality}` : '');
  const waiterName = invoiceData.waiter_name || invoiceData.waiter || 'Staff';
  const items = Array.isArray(invoiceData.items) ? invoiceData.items : [];

  let calculatedSubtotal = 0;
  items.forEach(item => {
    const qty = Number(item.qty || item.quantity || 1);
    const rate = Number(item.unitPrice || item.price || item.rate || 0);
    calculatedSubtotal += (qty * rate);
  });

  const providedSubtotal = Number(invoiceData.subtotal || 0);
  const subtotal = providedSubtotal > 0 ? providedSubtotal : calculatedSubtotal;

  const discount = Number(invoiceData.discount || invoiceData.discount_amount || invoiceData.discountAmount || 0);
  const cgst = Number(invoiceData.taxes?.cgst || invoiceData.cgst || 0);
  const sgst = Number(invoiceData.taxes?.sgst || invoiceData.sgst || 0);

  let grandTotal = Number(invoiceData.grand_total || invoiceData.total_amount || invoiceData.amount || invoiceData.total || invoiceData.net_amount || 0);
  if (grandTotal === 0 && subtotal > 0) {
    grandTotal = subtotal - discount + cgst + sgst;
    if (Array.isArray(invoiceData.taxes_breakdown)) {
      invoiceData.taxes_breakdown.forEach(t => grandTotal += Number(t.amount || 0));
    }
  }

  // Ensure the printed invoice always shows a rounded integer amount
  grandTotal = Math.round(grandTotal);

  // Retrieve cached profile if companyProfile is empty
  let effectiveProfile = companyProfile || {};
  if (!effectiveProfile.company_name && !effectiveProfile.logo) {
    try {
      const cached = JSON.parse(localStorage.getItem('alfa_company_profile') || '{}');
      effectiveProfile = { ...cached, ...effectiveProfile };
    } catch (e) { }
  }

  const printLogo = invoiceData.logo || effectiveProfile.logo || effectiveProfile.logo_url || '';

  // Prioritize Company Profile Name as requested by user
  const printCompanyName = effectiveProfile.company_name || effectiveProfile.name || invoiceData.company_name || invoiceData.companyName || outletSettings.companyTitle || invoiceData.restaurant_name || 'VARDAN RESTAURANT';
  const displayOutletName = outletSettings.outletName || invoiceData.outlet_name || '';
  const printAddress = effectiveProfile.address || invoiceData.address || companyProfile.address || [effectiveProfile.city, effectiveProfile.state, effectiveProfile.country].filter(Boolean).join(', ') || 'VARDAAN TOWER 2 , SHAHEED NAGAR GATE NO.1 OPPOSITE DR. AMBEDKAR UNIVERSITY , LUCKNOW, LUCKNOW, UTTAR PRADESH';
  const printPhone = effectiveProfile.phone || invoiceData.phone || outletSettings.phone || effectiveProfile.mobile || '9794950982 , 9794950983';
  const printGstin = effectiveProfile.gstin || invoiceData.gstin || outletSettings.gstin || '09LCMPS7008F1Z0';
  const printFssai = effectiveProfile.fssai || invoiceData.fssai || '';

  // Configured Bill Headers 1, 2, 3
  const headerLines = [
    outletSettings.billHeader1 || invoiceData.billHeader1,
    outletSettings.billHeader2 || invoiceData.billHeader2,
    outletSettings.billHeader3 || invoiceData.billHeader3
  ].map(h => (h || '').trim()).filter(Boolean);

  // Configured Bill Slogans 1, 2, 3
  const sloganLines = [
    outletSettings.billSlogan1 || invoiceData.billSlogan1,
    outletSettings.billSlogan2 || invoiceData.billSlogan2,
    outletSettings.billSlogan3 || invoiceData.billSlogan3
  ].map(s => (s || '').trim()).filter(Boolean);

  const copyLabel = totalCopies > 1
    ? (copyIndex === 0 ? 'ORIGINAL / CUSTOMER COPY' : (copyIndex === 1 ? 'DUPLICATE / ACCOUNTS COPY' : `COPY ${copyIndex + 1}`))
    : '';

  const discountRemark = invoiceData.discount_reason || invoiceData.discount_remarks || invoiceData.discount_remark || invoiceData.discountReason || invoiceData.discountRemark || invoiceData.discount_note || invoiceData.discountNote || (Array.isArray(invoiceData.discountLines) && invoiceData.discountLines.find(d => d.reason)?.reason) || (Array.isArray(invoiceData.discount_lines) && invoiceData.discount_lines.find(d => d.reason)?.reason) || '';

  // Calculate taxes and round-off
  let totalTax = 0;
  let cgstAmt = cgst;
  let sgstAmt = sgst;

  if (Array.isArray(invoiceData.taxes_breakdown) && invoiceData.taxes_breakdown.length > 0) {
    invoiceData.taxes_breakdown.forEach(t => {
      const name = String(t.name || '').toUpperCase();
      const val = Number(t.amount || 0);
      totalTax += val;
      if (name.includes('CGST')) cgstAmt = val;
      else if (name.includes('SGST')) sgstAmt = val;
    });
  } else if (cgst > 0 || sgst > 0) {
    totalTax = cgst + sgst;
  } else {
    // Standard 5% GST split if not given
    totalTax = Number(((subtotal - discount) * 0.05).toFixed(2));
    cgstAmt = Number((totalTax / 2).toFixed(2));
    sgstAmt = Number((totalTax / 2).toFixed(2));
  }

  const exactTotal = (subtotal - discount) + totalTax;
  const grandTotalRounded = Math.round(exactTotal);
  const roundOff = Number((grandTotalRounded - exactTotal).toFixed(2));

  // Date formatted as DD-MM-YYYY
  const formatDDMMYYYY = (d) => {
    try {
      const dateObj = (d instanceof Date && !isNaN(d)) ? d : new Date(d);
      if (!isNaN(dateObj)) {
        const day = String(dateObj.getDate()).padStart(2, '0');
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const year = dateObj.getFullYear();
        return `${day}-${month}-${year}`;
      }
    } catch (e) {}
    const nowD = new Date();
    return `${String(nowD.getDate()).padStart(2, '0')}-${String(nowD.getMonth() + 1).padStart(2, '0')}-${nowD.getFullYear()}`;
  };

  const formatTimeStr = (d) => {
    try {
      const dateObj = (d instanceof Date && !isNaN(d)) ? d : new Date(d);
      if (!isNaN(dateObj)) {
        return dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase();
      }
    } catch (e) {}
    return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase();
  };

  const rawDate = invoiceData.date || invoiceData.bill_date || invoiceData.created_at || invoiceData.date_time || now;
  const dateFormatted = formatDDMMYYYY(rawDate);
  const timeFormatted = formatTimeStr(rawDate);

  const cleanTableNo = String(tableNo || 'T1').trim();
  const displayTable = cleanTableNo.toLowerCase().startsWith('table')
    ? cleanTableNo
    : `Table ${cleanTableNo}`;

  const cleanBillNumber = invNo.replace(/^Bill\s+/i, '');

  const activeUser = invoiceData.created_by || invoiceData.waiter_name || invoiceData.user_name || invoiceData.cashier || localStorage.getItem('username') || 'SAMAR';

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${invNo} - ${displayTable}</title>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&display=swap" rel="stylesheet">
        <style>
          @page {
            margin: 0mm;
            size: 80mm auto;
          }
          * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          body {
            font-family: 'Outfit', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
            margin: 0;
            padding: 0;
            width: 80mm;
            max-width: 80mm;
            color: #000000;
            background: #ffffff;
            font-size: 13px;
            line-height: 1.25;
          }
          .invoice-container {
            width: 80mm !important;
            max-width: 80mm !important;
            margin: 0 auto !important;
            padding: 8px 12px !important;
            box-sizing: border-box !important;
          }
          .restaurant-name {
            font-size: 18px;
            font-weight: 900;
            text-align: center;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            margin-bottom: 3px;
            color: #000000;
          }
          .outlet-name {
            font-size: 13px;
            font-weight: 800;
            text-align: center;
            margin-bottom: 2px;
            text-transform: uppercase;
          }
          .address-section {
            font-size: 11px;
            font-weight: 800;
            text-align: center;
            line-height: 1.35;
            color: #000000;
            text-transform: uppercase;
            margin-bottom: 2px;
          }
          .phone-line {
            font-size: 11.5px;
            font-weight: 800;
            text-align: center;
            color: #000000;
            margin-bottom: 2px;
          }
          .tax-line {
            font-size: 11.5px;
            font-weight: 800;
            text-align: center;
            color: #000000;
            margin-bottom: 2px;
          }
          .bill-header-line {
            font-size: 11px;
            font-weight: 700;
            text-align: center;
            color: #000000;
            margin-bottom: 2px;
          }
          .invoice-badge-title {
            font-size: 16px;
            font-weight: 900;
            text-align: center;
            letter-spacing: 0.8px;
            margin: 6px 0 6px 0;
            text-transform: uppercase;
            color: #000000;
          }
          .meta-grid {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            font-size: 13px;
            font-weight: 600;
            line-height: 1.4;
            margin-bottom: 4px;
          }
          .meta-col-left {
            text-align: left;
            flex: 1;
          }
          .meta-col-right {
            text-align: right;
            flex: 1;
          }
          .customer-box {
            font-size: 12px;
            font-weight: 700;
            line-height: 1.3;
            margin: 3px 0 5px 0;
            padding-top: 3px;
            border-top: 1px dotted #888;
          }
          table.items-table {
            width: 100%;
            border-collapse: collapse;
            margin: 4px 0;
          }
          table.items-table th {
            background: #000000;
            color: #ffffff;
            font-size: 12px;
            font-weight: 900;
            padding: 4px 4px;
            text-transform: uppercase;
            letter-spacing: 0.4px;
          }
          table.items-table td {
            font-size: 12.5px;
            padding: 3px 2px;
            color: #000000;
            vertical-align: top;
          }
          .item-name {
            font-weight: 800;
            word-break: break-word;
          }
          .qty-col {
            font-weight: 800;
            text-align: center;
          }
          .rate-col {
            text-align: right;
            font-weight: 800;
            white-space: nowrap;
          }
          .amt-col {
            text-align: right;
            font-weight: 900;
            white-space: nowrap;
          }
          .summary-section {
            border-top: 1px solid #000000;
            padding-top: 4px;
            margin-top: 4px;
          }
          .summary-row {
            display: flex;
            justify-content: space-between;
            font-size: 13px;
            font-weight: 800;
            line-height: 1.4;
            padding: 1px 0;
            color: #000000;
          }
          .grand-total-block {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-top: 2.5px solid #000000;
            border-bottom: 2.5px solid #000000;
            padding: 4px 0;
            margin-top: 4px;
            margin-bottom: 6px;
            font-size: 16px;
            font-weight: 900;
            letter-spacing: 0.5px;
          }
          .footer-section {
            text-align: center;
            margin-top: 8px;
            padding-top: 4px;
          }
          .footer-slogan {
            font-size: 12px;
            font-weight: 900;
            letter-spacing: 0.5px;
            text-transform: uppercase;
            margin-bottom: 4px;
          }
          .footer-meta {
            font-size: 10.5px;
            font-weight: 700;
            color: #111111;
            line-height: 1.35;
          }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          ${printLogo ? `<div style="text-align: center; margin-bottom: 4px;"><img src="${printLogo}" alt="Logo" style="max-height: 48px; max-width: 130px; object-fit: contain;"></div>` : ''}

          <!-- 1. Restaurant Name -->
          <div class="restaurant-name">${printCompanyName.toUpperCase()}</div>
          ${displayOutletName && displayOutletName.toUpperCase() !== printCompanyName.toUpperCase() ? `<div class="outlet-name">${displayOutletName}</div>` : ''}

          <!-- 2. Address Section -->
          <div class="address-section">${printAddress.toUpperCase()}</div>

          <!-- 3. Phone Number -->
          ${printPhone ? `<div class="phone-line">Ph: ${printPhone}</div>` : ''}

          <!-- 4. GSTIN -->
          ${printGstin ? `<div class="tax-line">GSTIN: ${printGstin.toUpperCase()}</div>` : ''}

          <!-- 5. FSSAI No -->
          ${printFssai ? `<div class="tax-line">FSSAI: ${printFssai}</div>` : ''}

          <!-- 6. Bill Headers -->
          ${headerLines.length > 0 ? headerLines.map(h => `<div class="bill-header-line">${h}</div>`).join('') : ''}

          <!-- 7. Title Badge: TAX INVOICE / BILL -->
          <div class="invoice-badge-title">TAX INVOICE / BILL</div>
          ${copyLabel ? `<div style="text-align:center; font-size:10px; font-weight:800; margin-top:-4px; margin-bottom:6px;">(${copyLabel})</div>` : ''}

          <!-- 8. Bill Headers / Metadata Section -->
          <div class="meta-grid">
            <div class="meta-col-left">
              <div>Bill No: ${cleanBillNumber}</div>
              <div>Table: ${displayTable}</div>
            </div>
            <div class="meta-col-right">
              <div>Date: ${dateFormatted}</div>
              <div>Time: ${timeFormatted}</div>
            </div>
          </div>

          <!-- Customer details if available -->
          ${(customerName && customerName !== 'Walk-in Guest') || customerPhone || customerAddress ? `
            <div class="customer-box">
              ${customerName && customerName !== 'Walk-in Guest' ? `<div><strong>Customer:</strong> ${customerName.toUpperCase()}</div>` : ''}
              ${customerPhone ? `<div><strong>Phone:</strong> ${customerPhone}</div>` : ''}
              ${customerAddress ? `<div><strong>Address:</strong> ${customerAddress}</div>` : ''}
            </div>
          ` : ''}

          <!-- Items Table with Inverted Black Header -->
          <table class="items-table">
            <thead>
              <tr>
                <th style="text-align: left; width: 44%;">ITEM</th>
                <th style="text-align: center; width: 14%;">QTY</th>
                <th style="text-align: right; width: 21%;">RATE</th>
                <th style="text-align: right; width: 21%;">AMT</th>
              </tr>
            </thead>
            <tbody>
              ${items.length === 0 ? `
                <tr><td colspan="4" style="text-align:center; padding: 8px; font-weight:bold;">No Items</td></tr>
              ` : items.map(item => {
      const baseName = item.name || item.itemName || item.title || item.item_name || '';
      const variantStr = item.variantName || item.variant || item.alternative_title || '';
      const servingStr = item.variantServing ? ` - ${item.variantServing}` : '';
      const name = (variantStr && !baseName.toLowerCase().includes(variantStr.toLowerCase()))
        ? `${baseName} (${variantStr}${servingStr})`
        : baseName;
      const qty = item.qty || item.quantity || 1;
      const rate = Number(item.unitPrice || item.price || item.rate || 0);
      const amt = Number(item.amount || item.total || (qty * rate));
      return `
                  <tr>
                    <td class="item-name">
                      ${name}
                      ${item.remarks || item.remark ? `<div style="font-size: 10px; font-weight: normal; font-style: italic;">* ${item.remarks || item.remark}</div>` : ''}
                    </td>
                    <td class="qty-col">${qty}</td>
                    <td class="rate-col">${rate.toFixed(2)}</td>
                    <td class="amt-col">${amt.toFixed(2)}</td>
                  </tr>
                `;
    }).join('')}
            </tbody>
          </table>

          <!-- Subtotal & Calculations -->
          <div class="summary-section">
            <div class="summary-row">
              <span>Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>

            <!-- Discount Section (if any) -->
            ${discount > 0 ? `
              <div class="summary-row" style="color: #000000;">
                <span>Discount${subtotal > 0 ? ` (${((discount / subtotal) * 100).toFixed(0)}%)` : ''}${discountRemark ? ` - ${discountRemark}` : ''}:</span>
                <span>-${discount.toFixed(2)}</span>
              </div>
            ` : ''}

            <!-- Tax Section (CGST & SGST or Custom Taxes Breakdown) -->
            ${Array.isArray(invoiceData.taxes_breakdown) && invoiceData.taxes_breakdown.length > 0 ? (
      invoiceData.taxes_breakdown.map(t => `
                <div class="summary-row">
                  <span>${t.name || 'TAX'}:</span>
                  <span>${Number(t.amount || 0).toFixed(2)}</span>
                </div>
              `).join('')
    ) : `
              <div class="summary-row">
                <span>CGST:</span>
                <span>${cgstAmt.toFixed(2)}</span>
              </div>
              <div class="summary-row">
                <span>SGST:</span>
                <span>${sgstAmt.toFixed(2)}</span>
              </div>
            `}

            ${roundOff !== 0 ? `
              <div class="summary-row">
                <span>Round Off:</span>
                <span>${roundOff > 0 ? `+${roundOff.toFixed(2)}` : roundOff.toFixed(2)}</span>
              </div>
            ` : ''}

            <!-- Grand Total -->
            <div class="grand-total-block">
              <span>GRAND TOTAL:</span>
              <span>₹ ${grandTotalRounded.toFixed(2)}</span>
            </div>
          </div>

          <!-- Footer Section -->
          <div class="footer-section">
            <div class="footer-slogan">
              ${sloganLines.length > 0 ? sloganLines.join(' • ') : 'THANK YOU! VISIT AGAIN'}
            </div>
            <div class="footer-meta">
              User: ${activeUser.toUpperCase()} &nbsp;|&nbsp; Print Date & Time: ${dateFormatted} ${timeFormatted}
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
};

export const printTaxInvoice = async (data, preOpenedWindow = null) => {
  console.log('%c🧾 [Tax Invoice] printTaxInvoice called with data:', 'color: #8b5cf6; font-weight: bold;', data);
  const invoiceData = data?.invoice || data?.data || data || {};
  const targetStoreId = invoiceData.store_id || invoiceData.storeId || localStorage.getItem('activeOutletId') || 'STORE_1';

  let companyProfile = {};
  try {
    const res = await companyProfileService.getProfile();
    companyProfile = res?.data || res?.companyProfile || (res && res.id ? res : {});
  } catch (err) {
    console.warn('Failed to load company profile for print:', err);
  }

  const outletSettings = await getOutletPrintSettings(targetStoreId);
  const printerSetup = getPrinterMasterSetup(targetStoreId);
  const targetPrinter = data.printerName || invoiceData.printerName || printerSetup.billPrintingPath || 'RP3200 plus(U) 12';

  // Check User Printer Access permissions
  const isReprint = Boolean(data.isReprint || invoiceData.isReprint || invoiceData.reprint || data.reprint);
  const access = checkUserPrinterAccess(isReprint ? 'reprint' : 'printBill', targetPrinter);
  if (!access.allowed) {
    const errMsg = access.message || 'You do not have permission to print bills.';
    if (window.showToast) window.showToast(errMsg, 'warning');
    if (preOpenedWindow) {
      try { preOpenedWindow.close(); } catch (e) { }
    }
    return false;
  }

  const totalBills = 1; // Send request exactly once

  const tableNo = invoiceData.table_name || invoiceData.tableName || invoiceData.table_number || invoiceData.tableNo || invoiceData.table_id || '1';

  // Clean sequential bill number: e.g. "Bill 1", "Bill 2"
  const rawBillNo = invoiceData.bill_num_only || invoiceData.billNumberOnly || invoiceData.bill_number || invoiceData.billNo || invoiceData.custom_bill_number || invoiceData.invoice_number || invoiceData.order_id || invoiceData.id || '';
  let billSeq = 1;
  const rawStr = String(rawBillNo).trim();
  if (/^Bill\s+\d+$/i.test(rawStr)) {
    const numMatch = rawStr.match(/\d+/);
    billSeq = numMatch ? parseInt(numMatch[0], 10) : 1;
  } else {
    const match = rawStr.match(/(\d+)/g);
    if (match && match.length > 0) {
      const lastDigits = match[match.length - 1];
      if (lastDigits.length >= 8) {
        billSeq = parseInt(localStorage.getItem('alfa_pos_bill_sequence') || '1', 10);
      } else {
        billSeq = parseInt(lastDigits, 10) || 1;
      }
    } else {
      billSeq = parseInt(localStorage.getItem('alfa_pos_bill_sequence') || '1', 10);
    }
  }
  const invNo = `Bill ${billSeq}`;

  try {
    const desktopHtml = generateInvoiceHTML(invoiceData, companyProfile, outletSettings, true, 0, 1);
    console.log(`%c📄 [Tax Invoice] Dispatching print to "${targetPrinter}" for ${invNo}...`, 'color: #8b5cf6;', { invNo, targetStoreId, targetPrinter });

    // Send to backend print engine exactly once with configured printer
    await posApi.sendPrintRequest({
      id: invNo || 'Bill 1',
      type: 'print',
      job_type: 'BILL',
      print_purpose: 'BILL',
      printer_type: 'BILL',
      printerName: targetPrinter,
      deviceName: targetPrinter,
      printer: targetPrinter,
      html: desktopHtml,
      store_id: targetStoreId,
      converttoPdf: false
    });

    if (window.showToast) {
      window.showToast(`✅ Bill print dispatched to ${targetPrinter}`);
    }
    return true;
  } catch (err) {
    console.error('❌ [Tax Invoice] Error in printTaxInvoice:', err);
    if (window.showToast) window.showToast('❌ ' + (err.response?.data?.error || err.message || 'Print API unavailable'));
    if (preOpenedWindow) {
      try { preOpenedWindow.close(); } catch (e) { }
    }
    return false;
  }
};

export const generateClientSideInvoicePDF = (invoiceData, companyProfile = {}, outletSettings = {}) => {
  const items = Array.isArray(invoiceData.items) ? invoiceData.items : [];
  const tableNo = invoiceData.table_name || invoiceData.tableName || invoiceData.table_number || invoiceData.tableNo || invoiceData.table_id || '1';
  const rawBillNo = invoiceData.invoice_number || invoiceData.bill_number || invoiceData.custom_bill_number || invoiceData.kotId || invoiceData.order_id || invoiceData.id || tableNo;
  const cleanServerNo = String(rawBillNo || '').replace(/[^0-9]/g, '');
  const prefix = String(rawBillNo).startsWith('INV-') ? 'INV-' : 'BILL-';
  const invNo = cleanServerNo ? `${prefix}${cleanServerNo.padStart(2, '0')}` : `${prefix}01`;

  const now = new Date();
  const dateTimeStr = invoiceData.date_time || invoiceData.time || (now.toLocaleDateString('en-IN') + ' ' + now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }));
  const dateStr = dateTimeStr.split(' ')[0] || '';
  const timeStr = dateTimeStr.split(' ').slice(1).join(' ') || '';

  const customerName = invoiceData.customer_name || invoiceData.customerName || 'Walk-in Guest';
  const customerPhone = invoiceData.phone || invoiceData.customer_phone || invoiceData.customerPhone || invoiceData.mobileNo || '';
  const waiterName = invoiceData.waiter_name || invoiceData.waiter || 'Staff';
  const paxCount = invoiceData.pax || invoiceData.guests || invoiceData.paxCount || 1;

  let calculatedSubtotal = 0;
  items.forEach(item => {
    const qty = Number(item.qty || item.quantity || 1);
    const rate = Number(item.unitPrice || item.price || item.rate || 0);
    calculatedSubtotal += (qty * rate);
  });
  const providedSubtotal = Number(invoiceData.subtotal || 0);
  const subtotal = providedSubtotal > 0 ? providedSubtotal : calculatedSubtotal;
  const discount = Number(invoiceData.discount || invoiceData.discount_amount || invoiceData.discountAmount || 0);
  const cgst = Number(invoiceData.taxes?.cgst || invoiceData.cgst || 0);
  const sgst = Number(invoiceData.taxes?.sgst || invoiceData.sgst || 0);
  let grandTotal = Number(invoiceData.grand_total || invoiceData.total_amount || invoiceData.amount || invoiceData.total || invoiceData.net_amount || 0);
  if (grandTotal === 0 && subtotal > 0) {
    grandTotal = subtotal - discount + cgst + sgst;
  }
  grandTotal = Math.round(grandTotal);

  // Retrieve cached profile if companyProfile is empty
  let effectiveProfile = companyProfile || {};
  if (!effectiveProfile.company_name && !effectiveProfile.logo) {
    try {
      const cached = JSON.parse(localStorage.getItem('alfa_company_profile') || '{}');
      effectiveProfile = { ...cached, ...effectiveProfile };
    } catch (e) { }
  }

  const printCompanyName = effectiveProfile.company_name || effectiveProfile.name || invoiceData.company_name || invoiceData.companyName || outletSettings.companyTitle || invoiceData.restaurant_name || 'VARDAN RESTAURANT';
  const displayOutlet = outletSettings.outletName || invoiceData.outlet_name || '';

  const printAddress = effectiveProfile.address || invoiceData.address || companyProfile.address || [effectiveProfile.city, effectiveProfile.state, effectiveProfile.country].filter(Boolean).join(', ') || 'VARDAAN TOWER 2 , SHAHEED NAGAR GATE NO.1 OPPOSITE DR. AMBEDKAR UNIVERSITY , LUCKNOW, LUCKNOW, UTTAR PRADESH';
  const printPhone = effectiveProfile.phone || invoiceData.phone || outletSettings.phone || effectiveProfile.mobile || '9794950982 , 9794950983';
  const printGstin = effectiveProfile.gstin || invoiceData.gstin || outletSettings.gstin || '09LCMPS7008F1Z0';
  const printFssai = effectiveProfile.fssai || invoiceData.fssai || outletSettings.fssai || '';

  const headerLines = [
    outletSettings.billHeader1 || invoiceData.billHeader1,
    outletSettings.billHeader2 || invoiceData.billHeader2,
    outletSettings.billHeader3 || invoiceData.billHeader3
  ].map(h => (h || '').trim()).filter(Boolean);

  const sloganLines = [
    outletSettings.billSlogan1 || invoiceData.billSlogan1,
    outletSettings.billSlogan2 || invoiceData.billSlogan2,
    outletSettings.billSlogan3 || invoiceData.billSlogan3
  ].map(s => (s || '').trim()).filter(Boolean);
  const displaySlogans = sloganLines.length > 0 ? sloganLines : [
    'THANK YOU! VISIT AGAIN'
  ];

  const estimatedHeight = Math.max(160, 110 + (items.length * 7) + (headerLines.length * 4) + (displaySlogans.length * 3.5));

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [80, estimatedHeight]
  });
  addRupeeFont(doc);

  let y = 7;
  // 1. Restaurant Name
  doc.setFont('ArialRupee', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text(printCompanyName.toUpperCase(), 40, y, { align: 'center' });
  y += 4.5;

  if (displayOutlet && displayOutlet.toUpperCase() !== printCompanyName.toUpperCase()) {
    doc.setFontSize(8.5);
    doc.text(displayOutlet.toUpperCase(), 40, y, { align: 'center' });
    y += 3.5;
  }

  // 2. Address Section
  doc.setFont('ArialRupee', 'bold');
  doc.setFontSize(7.0);
  const addressLines = doc.splitTextToSize(printAddress.toUpperCase(), 72);
  addressLines.forEach(line => {
    doc.text(line, 40, y, { align: 'center' });
    y += 3.0;
  });

  // 3. Phone Number
  if (printPhone) {
    doc.setFontSize(7.5);
    doc.text(`Ph: ${printPhone}`, 40, y, { align: 'center' });
    y += 3.2;
  }

  // 4. GSTIN
  if (printGstin) {
    doc.setFontSize(7.5);
    doc.text(`GSTIN: ${printGstin.toUpperCase()}`, 40, y, { align: 'center' });
    y += 3.2;
  }

  // 5. FSSAI No
  if (printFssai) {
    doc.setFontSize(7.5);
    doc.text(`FSSAI: ${printFssai}`, 40, y, { align: 'center' });
    y += 3.2;
  }

  // 6. Bill Headers
  headerLines.forEach(h => {
    doc.setFontSize(7.5);
    doc.text(h, 40, y, { align: 'center' });
    y += 3.2;
  });

  // 7. TAX INVOICE / BILL Title
  y += 1;
  doc.setFont('ArialRupee', 'bold');
  doc.setFontSize(10);
  doc.text('TAX INVOICE / BILL', 40, y, { align: 'center' });
  y += 4;

  // 8. Bill Headers / Details
  doc.setFont('ArialRupee', 'bold');
  doc.setFontSize(7.5);
  doc.text(`Bill No: ${cleanServerNo ? cleanServerNo : invNo.replace(/^Bill\s+/i, '')}`, 4, y);
  doc.text(`Date: ${dateStr}`, 76, y, { align: 'right' });
  y += 3.3;

  const displayTable = String(tableNo).trim();
  doc.text(`Table: ${displayTable.toLowerCase().startsWith('table') ? displayTable : `Table ${displayTable}`}`, 4, y);
  doc.text(`Time: ${timeStr}`, 76, y, { align: 'right' });
  y += 3.3;

  if (customerName && customerName !== 'Walk-in Guest') {
    doc.text(`Customer: ${customerName}`, 4, y);
    if (customerPhone) {
      doc.text(`Phone: ${customerPhone}`, 76, y, { align: 'right' });
    }
    y += 3.3;
  } else if (customerPhone) {
    doc.text(`Phone: ${customerPhone}`, 4, y);
    y += 3.3;
  }

  y += 0.5;
  autoTable(doc, {
    startY: y,
    margin: { left: 4, right: 4 },
    head: [['ITEM', 'QTY', 'RATE', 'AMT']],
    body: items.map(item => [
      (item.name || item.itemName || '') + (item.variantName ? ` (${item.variantName})` : ''),
      String(item.qty || item.quantity || 1),
      Number(item.unitPrice || item.price || 0).toFixed(2),
      Number(item.amount || item.total || ((item.qty || 1) * (item.price || 0))).toFixed(2)
    ]),
    theme: 'plain',
    styles: {
      font: 'ArialRupee',
      fontSize: 7.2,
      fontStyle: 'bold',
      cellPadding: 1,
      textColor: [0, 0, 0]
    },
    headStyles: {
      fillColor: [0, 0, 0],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7.2,
      lineWidth: 0
    },
    columnStyles: {
      0: { cellWidth: 38, halign: 'left' },
      1: { cellWidth: 9, halign: 'center' },
      2: { cellWidth: 12, halign: 'right' },
      3: { cellWidth: 13, halign: 'right' }
    }
  });

  let finalY = (doc.lastAutoTable?.finalY || y) + 2;
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.3);
  doc.line(4, finalY, 76, finalY);
  finalY += 3.5;

  doc.setFont('ArialRupee', 'bold');
  doc.setFontSize(7.5);
  doc.text('Subtotal:', 4, finalY);
  doc.text(`${subtotal.toFixed(2)}`, 76, finalY, { align: 'right' });
  finalY += 3.3;

  if (discount > 0) {
    doc.text('Discount:', 4, finalY);
    doc.text(`-${discount.toFixed(2)}`, 76, finalY, { align: 'right' });
    finalY += 3.3;
  } else {
    doc.text('Discount:', 4, finalY);
    doc.text('0.00', 76, finalY, { align: 'right' });
    finalY += 3.3;
  }

  // CGST and SGST split
  const totalTax = cgst + sgst || Number(((subtotal - discount) * 0.05).toFixed(2));
  const cgstVal = cgst > 0 ? cgst : Number((totalTax / 2).toFixed(2));
  const sgstVal = sgst > 0 ? sgst : Number((totalTax / 2).toFixed(2));

  doc.text('CGST:', 4, finalY);
  doc.text(`${cgstVal.toFixed(2)}`, 76, finalY, { align: 'right' });
  finalY += 3.3;

  doc.text('SGST:', 4, finalY);
  doc.text(`${sgstVal.toFixed(2)}`, 76, finalY, { align: 'right' });
  finalY += 3.3;

  const exactCalc = (subtotal - discount) + (cgstVal + sgstVal);
  const roundedGrandTotal = Math.round(exactCalc);
  const roundOffVal = Number((roundedGrandTotal - exactCalc).toFixed(2));

  if (roundOffVal !== 0) {
    doc.text('Round Off:', 4, finalY);
    doc.text(`${roundOffVal > 0 ? `+${roundOffVal.toFixed(2)}` : roundOffVal.toFixed(2)}`, 76, finalY, { align: 'right' });
    finalY += 3.3;
  }

  finalY += 0.5;
  doc.setLineWidth(0.6);
  doc.line(4, finalY, 76, finalY);
  finalY += 3.8;

  doc.setFont('ArialRupee', 'bold');
  doc.setFontSize(9.5);
  doc.text('GRAND TOTAL:', 4, finalY);
  doc.text(`₹ ${roundedGrandTotal.toFixed(2)}`, 76, finalY, { align: 'right' });
  finalY += 2;
  doc.line(4, finalY, 76, finalY);
  finalY += 4.5;

  doc.setFont('ArialRupee', 'bold');
  doc.setFontSize(7.5);
  const footerSlogan = sloganLines.length > 0 ? sloganLines.join(' • ') : 'THANK YOU! VISIT AGAIN';
  doc.text(footerSlogan, 40, finalY, { align: 'center' });
  finalY += 3.3;

  doc.setFont('ArialRupee', 'normal');
  doc.setFontSize(6.5);
  const activeUser = invoiceData.created_by || invoiceData.waiter_name || invoiceData.user_name || invoiceData.cashier || 'admin';
  doc.text(`User: ${activeUser}  |  Print Date & Time: ${dateStr} ${timeStr}`, 40, finalY, { align: 'center' });

  doc.save(`Invoice-${cleanServerNo || invNo || Date.now()}.pdf`);
  return true;
};

export const saveInvoiceAsPDF = async (data) => {
  try {
    const invoiceData = data?.invoice || data?.data || data || {};
    const targetStoreId = invoiceData.store_id || invoiceData.storeId || localStorage.getItem('activeOutletId') || 'STORE_1';
    let companyProfile = {};
    try {
      const res = await companyProfileService.getProfile();
      companyProfile = res?.data || res?.companyProfile || (res && res.id ? res : {});
    } catch (err) {
      console.warn('Failed to load company profile for print:', err);
    }
    const outletSettings = await getOutletPrintSettings(targetStoreId);

    // 1. Direct client-side jsPDF generation — 100% offline & local, no localhost 8080 or backend required
    generateClientSideInvoicePDF(invoiceData, companyProfile, outletSettings);
    if (window.showToast) window.showToast('✅ Invoice PDF saved successfully');
    return true;
  } catch (err) {
    console.warn('Client-side PDF generation error, trying fallback:', err);
    try {
      const invoiceData = data?.invoice || data?.data || data || {};
      const targetStoreId = invoiceData.store_id || invoiceData.storeId || localStorage.getItem('activeOutletId') || 'STORE_1';
      const outletSettings = await getOutletPrintSettings(targetStoreId);
      const htmlContent = generateInvoiceHTML(invoiceData, {}, outletSettings, true);
      const printWin = window.open('', '_blank', 'width=450,height=600');
      if (printWin) {
        printWin.document.write(htmlContent);
        printWin.document.close();
        printWin.focus();
        setTimeout(() => {
          try { printWin.print(); } catch (e) { }
        }, 300);
        return true;
      }
    } catch (e2) {
      console.error('All PDF save methods failed:', e2);
      if (window.showToast) window.showToast('❌ Failed to save Invoice as PDF');
      return false;
    }
  }
};
