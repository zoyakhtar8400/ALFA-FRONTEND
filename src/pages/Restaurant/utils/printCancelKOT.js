import { posApi } from '../../../api/posApi';

export const printCancelKOT = async ({ tableLabel, items = [], time, date, reason, printerName }, preOpenedWindow = null) => {
  const dateTimeStr = (date && time) ? `${date} ${time}` : new Date().toLocaleString('en-IN', { hour12: false });

  const generateHTML = (isBrowser = false) => `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Cancelled KOT</title>
        <style>
          @page { margin: 0mm; size: auto; }
          body { font-family: 'Courier New', Courier, monospace; margin: 0; padding: 0; width: 100%; color: #000000; font-size: 13px; background: #ffffff; }
          .invoice-container { max-width: 320px !important; margin: 0 auto !important; padding: 4mm !important; box-sizing: border-box; }
          .text-center { text-align: center; }
          .bold { font-weight: bold; }
          .divider { border-top: 1.5px dashed #000000; margin: 6px 0; }
          table { width: 100%; border-collapse: collapse; margin-top: 8px; }
          th { border-bottom: 2px dashed #000000; text-align: left; padding: 4px 0; font-size: 13px; color: #000000; }
          td { padding: 6px 0; vertical-align: top; font-size: 13px; color: #000000; }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <div class="text-center" style="font-size: 16px; font-weight: bold;">
            CANCELLED KOT
          </div>
          <div class="text-center" style="margin-top: 4px;">${dateTimeStr}</div>
          <div class="text-center" style="margin-top: 2px; font-size: 15px; font-weight: bold;">Table No: ${tableLabel}</div>
          <div class="text-center" style="margin-top: 2px; font-style: italic;">Reason: ${reason || 'Not specified'}</div>
          
          <div class="divider" style="margin-top: 8px;"></div>
          <table>
            <thead>
              <tr>
                <th style="width: 15%;">KOT</th>
                <th style="width: 40%;">Item</th>
                <th style="width: 30%;">Note</th>
                <th style="width: 15%; text-align: right;">Qty.</th>
              </tr>
            </thead>
            <tbody>
              ${items.map(item => `
                <tr>
                  <td>${item.kotNo || '--'}</td>
                  <td><strong>${item.name || item.itemName}</strong></td>
                  <td>${item.remarks || item.remark || '--'}</td>
                  <td style="text-align: right; color: #dc2626; font-weight: bold;">-${item.qty || item.quantity || 1}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="divider"></div>
        </div>
      </body>
    </html>
  `;

  try {
    const desktopHtml = generateHTML(false);
    const response = await posApi.sendPrintRequest({
      id: 'print-cancel',
      type: 'print',
      html: desktopHtml,
      printerName: printerName || '',
      converttoPdf: false
    });

    if (response?.data?.success || response?.success) {
      if (preOpenedWindow) preOpenedWindow.close();
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
