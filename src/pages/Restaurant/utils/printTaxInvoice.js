import companyProfileService from '../../../services/companyProfileService';
import { posApi } from '../../../api/posApi';

export const generateInvoiceHTML = (invoiceData, companyProfile, isBrowser = false) => {

  const now = new Date();
  const dateTimeStr = invoiceData.date_time || invoiceData.time || (now.toLocaleDateString('en-IN') + ' ' + now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }));
  const tableNo = invoiceData.table_name || invoiceData.tableName || invoiceData.table_number || invoiceData.tableNo || invoiceData.table_id || '1';
  const invNo = invoiceData.invoice_number || invoiceData.bill_number || invoiceData.kotId || `INV-${tableNo}`;
  const customerName = invoiceData.customer_name || invoiceData.customerName || 'Walk-in Guest';
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

  const printLogo = invoiceData.logo || companyProfile.logo;
  const printCompanyName = invoiceData.company_name || invoiceData.companyName || companyProfile.company_name || companyProfile.name || invoiceData.restaurant_name || 'ALFA Restaurant';
  const printAddress = invoiceData.address || companyProfile.address || companyProfile.city || 'Main Dining Area';
  const printPhone = invoiceData.phone || companyProfile.phone || companyProfile.mobile || '+91 98765 43210';
  const printGstin = invoiceData.gstin || companyProfile.gstin || '27AAAAA0000A1Z5';
  const printFssai = invoiceData.fssai || companyProfile.fssai || '10020021000123';

  return `
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
          th { background: #ffffff; color: #000000; font-size: 11px; font-weight: bold; padding: 5px 0; border-bottom: 1px dashed #000000; text-transform: uppercase; }
          td { padding: 5px 0; border-bottom: 1px dashed #000000; font-size: 11px; color: #000000; vertical-align: top; }
          .summary-box { border-top: 1.5px dashed #000000; padding-top: 6px; margin-top: 8px; font-family: monospace; }
          .summary-row { display: flex; justify-content: space-between; padding: 2px 0; font-size: 11px; color: #000000; font-weight: bold; }
          .grand-total-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; font-weight: 900; color: #000000; border-top: 1.5px dashed #000000; border-bottom: 1.5px dashed #000000; margin-top: 4px; }
          .footer-note { text-align: center; margin-top: 12px; font-size: 10px; font-weight: bold; color: #000000; border-top: 1.5px dashed #000000; padding-top: 8px; }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          ${printLogo ? `<div style="text-align: center; margin-bottom: 6px;"><img src="${printLogo}" alt="Company Logo" style="max-height: 65px; max-width: 160px; object-fit: contain;"></div>` : ''}
          ${printCompanyName ? `<div class="header-title">${printCompanyName}</div>` : ''}
          ${invoiceData.outlet_name ? `<div class="header-title" style="font-size: 13px; font-weight: bold; margin-top:-2px;">${invoiceData.outlet_name}</div>` : ''}
          <div class="header-sub">${printAddress}</div>
          <div class="header-sub">GSTIN: ${printGstin} ${invoiceData.hsn ? `| HSN: ${invoiceData.hsn}` : ''} | FSSAI: ${printFssai}</div>
          <div class="header-sub">Ph: ${printPhone}</div>

          <div class="invoice-title-badge">TAX INVOICE</div>

          <div class="meta-info">
            <div>BILL NO: ${invNo}</div>
            ${invoiceData.extra_details?.order_type === 'Takeaway' || invoiceData.order_type === 'Takeaway' || invoiceData.billType === 'Takeaway' || invoiceData.serviceType === 'Takeaway'
      ? `<div>TAKEAWAY ORDER NO: ${invoiceData.extra_details?.takeaway_no || invoiceData.takeaway_no || tableNo}</div>`
      : invoiceData.extra_details?.order_type === 'Delivery' || invoiceData.order_type === 'Delivery' || invoiceData.billType === 'Delivery' || invoiceData.serviceType === 'Delivery'
        ? `<div>DELIVERY NO: ${invoiceData.extra_details?.delivery_no || invoiceData.delivery_no || tableNo}</div>`
        : `<div>TABLE: ${tableNo} &nbsp;|&nbsp; SERVER: ${waiterName.toUpperCase()}</div>`
    }
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
            ${(() => {
      if (discount > 0) {
        let displayPercent = '';
        if (subtotal > 0) {
          const perc = (discount / subtotal) * 100;
          displayPercent = ` (${perc % 1 === 0 ? perc.toFixed(0) : perc.toFixed(1)}%)`;
        }
        return `<div class="summary-row"><span>DISCOUNT${displayPercent}:</span><span>- ₹${discount.toFixed(2)}</span></div>`;
      }
      return '';
    })()}
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

export const printTaxInvoice = async (data, preOpenedWindow = null) => {
  const invoiceData = data?.invoice || data?.data || data || {};
  
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

  const invNo = invoiceData.invoice_number || invoiceData.bill_number || invoiceData.kotId || `INV-${invoiceData.table_name || invoiceData.table_number || invoiceData.tableNo || '1'}`;

  try {
    const desktopHtml = generateHTML(false);
    const response = await posApi.sendPrintRequest({
      id: invNo,
      type: 'invoice',
      html: desktopHtml,
      printerName: invoiceData.printerName || ''
    });

    if (response?.data?.success || response?.success) {
      if (preOpenedWindow) preOpenedWindow.close();
      if (window.showToast) window.showToast('✅ Invoice print request sent successfully');
      return;
    } else {
      if (window.showToast) window.showToast('❌ ' + (response?.error || 'Print job failed'));
      if (preOpenedWindow) preOpenedWindow.close();
      return;
    }
  } catch (err) {
    console.warn('Print API unavailable:', err);
    if (window.showToast) window.showToast('❌ Print API unavailable');
    if (preOpenedWindow) preOpenedWindow.close();
    return;
  }
};
