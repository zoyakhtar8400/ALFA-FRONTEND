import companyProfileService from '../../../services/companyProfileService';
import { posApi } from '../../../api/posApi';
import apiClient from '../../../services/apiClient';

export const generateInvoiceHTML = (invoiceData, companyProfile, isBrowser = false) => {

  const now = new Date();
  const dateTimeStr = invoiceData.date_time || invoiceData.time || (now.toLocaleDateString('en-IN') + ' ' + now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }));
  const tableNo = invoiceData.table_name || invoiceData.tableName || invoiceData.table_number || invoiceData.tableNo || invoiceData.table_id || '1';

  const rawBillNo = invoiceData.invoice_number || invoiceData.bill_number || invoiceData.custom_bill_number || invoiceData.kotId || invoiceData.order_id || invoiceData.id || tableNo;
  const cleanServerNo = String(rawBillNo || '').replace(/[^0-9]/g, '');
  const prefix = String(rawBillNo).startsWith('INV-') ? 'INV-' : 'BILL-';
  const invNo = cleanServerNo ? `${prefix}${cleanServerNo.padStart(2, '0')}` : `${prefix}01`;

  const extraDetails = typeof invoiceData.extra_details === 'string' ? (function(){ try { return JSON.parse(invoiceData.extra_details); } catch(e) { return {}; } })() : (invoiceData.extra_details || {});
  
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

  const printLogo = invoiceData.logo || companyProfile.logo;
  const printCompanyName = invoiceData.company_name || invoiceData.companyName || companyProfile.company_name || companyProfile.name || invoiceData.restaurant_name || 'ALFA Restaurant';
  const printAddress = invoiceData.address || companyProfile.address || companyProfile.city || 'Main Dining Area';
  const printPhone = invoiceData.phone || companyProfile.phone || companyProfile.mobile || '+91 98765 43210';
  const printGstin = invoiceData.gstin || companyProfile.gstin || '27AAAAA0000A1Z5';
  const printFssai = invoiceData.fssai || companyProfile.fssai || '10020021000123';

  const discountRemark = invoiceData.discount_reason || invoiceData.discount_remarks || invoiceData.discount_remark || invoiceData.discountReason || invoiceData.discountRemark || invoiceData.discount_note || invoiceData.discountNote || (Array.isArray(invoiceData.discountLines) && invoiceData.discountLines.find(d => d.reason)?.reason) || (Array.isArray(invoiceData.discount_lines) && invoiceData.discount_lines.find(d => d.reason)?.reason) || '';

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Tax Invoice - Table ${tableNo}</title>
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
            width: 76mm;
            max-width: 76mm;
            color: #000000;
            font-size: 12px;
            background: #ffffff;
          }
          .invoice-container {
            width: 76mm !important;
            max-width: 76mm !important;
            margin: 0 auto !important;
            padding: 2mm 2mm !important;
            box-sizing: border-box !important;
          }
          .header-title { font-size: 15px; font-weight: 900; color: #000000; text-align: center; text-transform: uppercase; margin-bottom: 2px; letter-spacing: 0.5px; }
          .header-sub { font-size: 10px; color: #000000; text-align: center; margin-bottom: 1px; font-weight: 600; }
          .invoice-title-badge { border-top: 1px dashed #000000; border-bottom: 1px dashed #000000; color: #000000; font-size: 12px; font-weight: bold; text-align: center; padding: 4px 0; margin: 5px 0; text-transform: uppercase; letter-spacing: 1px; }
          .info-row { display: flex; justify-content: space-between; font-size: 11px; line-height: 1.3; font-family: monospace; color: #000000; }
          .info-label { font-weight: bold; }
          .divider { border: none; border-top: 1px dashed #000000; margin: 4px 0; }
          table { width: 100%; border-collapse: collapse; margin: 4px 0; font-family: monospace; }
          th { background: #ffffff; color: #000000; font-size: 11px; font-weight: bold; padding: 3px 0; border-bottom: 1px dashed #000000; text-transform: uppercase; }
          td { padding: 3px 0; border-bottom: 1px dashed #000000; font-size: 11px; color: #000000; vertical-align: top; }
          .summary-box { border-top: 1px dashed #000000; padding-top: 4px; margin-top: 5px; font-family: monospace; }
          .summary-row { display: flex; justify-content: space-between; padding: 1px 0; font-size: 11px; color: #000000; font-weight: bold; }
          .grand-total-row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 13px; font-weight: 900; color: #000000; border-top: 1px dashed #000000; border-bottom: 1px dashed #000000; margin-top: 3px; }
          .footer-note { text-align: center; margin-top: 8px; font-size: 10px; font-weight: bold; color: #000000; border-top: 1px dashed #000000; padding-top: 5px; }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          ${printLogo ? `<div style="text-align: center; margin-bottom: 4px;"><img src="${printLogo}" alt="Company Logo" style="max-height: 45px; max-width: 120px; object-fit: contain;"></div>` : ''}
          ${printCompanyName ? `<div class="header-title">${printCompanyName}</div>` : ''}
          ${invoiceData.outlet_name ? `<div class="header-title" style="font-size: 13px; font-weight: bold; margin-top:-2px;">${invoiceData.outlet_name}</div>` : ''}
          <div class="header-sub">${printAddress}</div>
          <div style="display: flex; justify-content: space-between; font-size: 9.5px; font-weight: 600; margin-bottom: 1px;">
            <span>GSTIN: ${printGstin}</span>
            ${invoiceData.hsn ? `<span>HSN: ${invoiceData.hsn}</span>` : ''}
            <span>FSSAI: ${printFssai}</span>
          </div>
          <div class="header-sub">Ph: ${printPhone}</div>

          <div class="invoice-title-badge">TAX INVOICE</div>

          <div class="info-row">
            <span class="info-label">Bill No:</span>
            <span>${invNo}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Date:</span>
            <span>${dateTimeStr.split(' ')[0]}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Time:</span>
            <span>${dateTimeStr.split(' ').slice(1).join(' ')}</span>
          </div>
          
          ${invoiceData.extra_details?.order_type === 'Takeaway' || invoiceData.order_type === 'Takeaway' || invoiceData.billType === 'Takeaway' || invoiceData.serviceType === 'Takeaway'
      ? `<div class="info-row"><span class="info-label">Takeaway No:</span><span>${invoiceData.extra_details?.takeaway_no || invoiceData.takeaway_no || tableNo}</span></div>`
      : invoiceData.extra_details?.order_type === 'Delivery' || invoiceData.order_type === 'Delivery' || invoiceData.billType === 'Delivery' || invoiceData.serviceType === 'Delivery'
        ? `<div class="info-row"><span class="info-label">Delivery No:</span><span>${invoiceData.extra_details?.delivery_no || invoiceData.delivery_no || tableNo}</span></div>`
        : `<div class="info-row"><span class="info-label">Table:</span><span>${tableNo}</span></div>
           <div class="info-row"><span class="info-label">Pax:</span><span>${invoiceData.pax || invoiceData.guests || invoiceData.paxCount || 1}</span></div>
           <div class="info-row"><span class="info-label">Staff Name:</span><span>${waiterName.toUpperCase()}</span></div>`
    }
          <div class="divider"></div>
          
          <div class="info-row">
            <span class="info-label">Customer:</span>
            <span>${customerName.toUpperCase()}</span>
          </div>
          ${customerPhone ? `
          <div class="info-row">
            <span class="info-label">Phone:</span>
            <span>${customerPhone}</span>
          </div>` : ''}
          ${customerAddress ? `
          <div class="info-row">
            <span class="info-label">Address:</span>
            <span>${customerAddress}</span>
          </div>` : ''}

          <div class="divider"></div>

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
      const name = ((item.name || item.itemName || '') + (item.variantName || item.variant ? ` (${item.variantName || item.variant})` : ''));
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
            ${(() => {
      if (discount > 0) {
        let displayPercent = '';
        if (subtotal > 0) {
          const perc = (discount / subtotal) * 100;
          displayPercent = ` (${perc % 1 === 0 ? perc.toFixed(0) : perc.toFixed(1)}%)`;
        }
        const reasonText = discountRemark ? ` (${discountRemark})` : '';
        return `
          <div class="summary-row"><span>DISCOUNT${displayPercent}${reasonText}:</span><span>- ₹${discount.toFixed(2)}</span></div>
        `;
      }
      return '';
    })()}
            ${(() => {
      const breakdown = invoiceData.taxes_breakdown;
      if (Array.isArray(breakdown) && breakdown.length > 0) {
        return breakdown.map(t => `<div class="summary-row"><span>${(t.name || 'Tax').toUpperCase()} (${t.rate}%):</span><span>₹${Number(t.amount || 0).toFixed(2)}</span></div>`).join('');
      }
      // fallback to single GST
      const totalTax = cgst + sgst || (grandTotal - subtotal + discount);
      return `
                <div class="summary-row"><span>GST (5%):</span><span>₹${totalTax.toFixed(2)}</span></div>
              `;
    })()}
            <div class="grand-total-row"><span>NET AMOUNT:</span><span>₹${grandTotal.toFixed(2)}</span></div>
          </div>



          <div class="footer-note">
            <div>*** THANK YOU FOR DINING WITH US ***</div>
            <div>HAVE A WONDERFUL DAY!</div>
          </div>
        </div>
      </body>
    </html>
  `;
};

export const printTaxInvoice = async (data, preOpenedWindow = null) => {
  console.log('%c🧾 [Tax Invoice] printTaxInvoice called with data:', 'color: #8b5cf6; font-weight: bold;', data);
  const invoiceData = data?.invoice || data?.data || data || {};
  const targetStoreId = invoiceData.store_id || invoiceData.storeId || 'STORE_1';

  let companyProfile = {};
  try {
    const res = await companyProfileService.getProfile();
    companyProfile = res?.data || res?.companyProfile || (res && res.id ? res : {});
  } catch (err) {
    console.warn('Failed to load company profile for print:', err);
  }

  const generateHTML = (isBrowser = false) => {
    return generateInvoiceHTML(invoiceData, companyProfile, isBrowser);
  };

  const tableNo = invoiceData.table_name || invoiceData.tableName || invoiceData.table_number || invoiceData.tableNo || invoiceData.table_id || '1';
  const rawBillNo = invoiceData.invoice_number || invoiceData.bill_number || invoiceData.custom_bill_number || invoiceData.kotId || invoiceData.order_id || invoiceData.id || tableNo;
  const cleanServerNo = String(rawBillNo || '').replace(/[^0-9]/g, '');
  const prefix = String(rawBillNo).startsWith('INV-') ? 'INV-' : 'BILL-';
  const invNo = cleanServerNo ? `${prefix}${cleanServerNo.padStart(2, '0')}` : `${prefix}01`;

  try {
    const desktopHtml = generateHTML(false);
    console.log('%c📄 [Tax Invoice] Generated Bill HTML. Sending print request...', 'color: #8b5cf6;', { invNo, targetStoreId });
    const response = await posApi.sendPrintRequest({
      id: invNo || 'print-bill',
      type: 'print',
      job_type: 'BILL',
      print_purpose: 'BILL',
      printer_type: 'BILL',
      html: desktopHtml,
      store_id: targetStoreId,
      converttoPdf: false
    });

    console.log('%c🧾 [Tax Invoice] Print request response:', 'color: #8b5cf6; font-weight: bold;', response);

    if (response?.data?.success || response?.success) {
      if (preOpenedWindow) preOpenedWindow.close();
      if (window.showToast) window.showToast('✅ Invoice print request sent successfully');
      return true;
    } else {
      const errMsg = response?.data?.error || response?.error || response?.data?.message || response?.message || 'Print job failed';
      if (window.showToast) window.showToast('❌ ' + errMsg);
      if (preOpenedWindow) preOpenedWindow.close();
      return false;
    }
  } catch (err) {
    console.error('❌ [Tax Invoice] Error in printTaxInvoice:', err);
    if (window.showToast) window.showToast('❌ ' + (err.response?.data?.error || err.message || 'Print API unavailable'));
    if (preOpenedWindow) preOpenedWindow.close();
    return false;
  }
};

export const saveInvoiceAsPDF = async (data) => {
  try {
    const invoiceData = data?.invoice || data?.data || data || {};
    let companyProfile = {};
    try {
      const res = await companyProfileService.getProfile();
      companyProfile = res?.data || res?.companyProfile || (res && res.id ? res : {});
    } catch (err) {
      console.warn('Failed to load company profile for print:', err);
    }
    const htmlContent = generateInvoiceHTML(invoiceData, companyProfile, true);

    // Server-side PDF generation from /api/v1/print API
    const res = await posApi.saveAsPdf({
      id: invoiceData.invoice_number || invoiceData.id || `INV-${Date.now()}`,
      html: htmlContent,
      type: 'invoice'
    });
    if (res && res.data) {
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Invoice-${invoiceData.invoice_number || invoiceData.kotId || Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      if (window.showToast) window.showToast('✅ Invoice PDF saved successfully');
      return true;
    }
    return false;
  } catch (err) {
    console.warn('Save Invoice as PDF error:', err);
    if (window.showToast) window.showToast('❌ Failed to save Invoice as PDF');
    return false;
  }
};
