import { posApi } from '../api/posApi';

/**
 * Common print utility for the ALFA HMS application.
 * Injects the current timestamp into the print footer and attempts to print
 * via the local WebSocket print service (posApi.sendPrintRequest).
 * Falls back to window.print() if the service is unavailable.
 *
 * @param {string} [footerSelector='.print-footer'] - CSS selector for the footer element.
 * @param {string} [printedBy='Admin'] - Name/role to display in the footer.
 */
export const handlePrint = async (footerSelector = '.print-footer', printedBy = 'Admin') => {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

  const printInfo = document.querySelector(footerSelector);
  if (printInfo) {
    printInfo.textContent = `Printed By: ${printedBy}  |  Date: ${dateStr}  |  Time: ${timeStr}`;
  }

  try {
    // 1. Capture only <link> stylesheets (production), skip massive Vite <style> tags
    const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
      .map(el => el.outerHTML)
      .join('\n');

    // 2. Clone the body and strip out heavy non-printable elements to drastically reduce payload size
    const bodyClone = document.body.cloneNode(true);
    const elementsToRemove = bodyClone.querySelectorAll('script, .sidebar, .navbar, .no-print, button, .modal, .toast, svg:not(.print-logo), .print-col-hide');
    elementsToRemove.forEach(el => el.remove());
    
    // We forcefully apply print-hiding CSS directly to the screen media 
    // so the headless browser renders it correctly without relying on @media print
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Document</title>
          <!-- Load Tailwind CSS via CDN for headless rendering -->
          <script src="https://cdn.tailwindcss.com"></script>
          ${styles}
          <style>
            body { 
              background: #ffffff !important; 
              color: #000000 !important; 
              margin: 0 !important;
            }
            @page {
              margin: 0mm;
            }
            .app-container, .main-layout, .content-area, .reports-workspace { 
              display: block !important; 
              position: static !important; 
              width: 100% !important; 
              height: auto !important; 
              overflow: visible !important; 
              margin: 0 !important; 
              padding: 0 !important; 
            }
            .print-col-hide {
              display: none !important;
            }
          </style>
        </head>
        <body class="print-mode">
          ${bodyClone.innerHTML}
        </body>
      </html>
    `;

    // 3. Resolve active store ID for the print job
    let storeId = localStorage.getItem('activeOutletId') || localStorage.getItem('store_id');
    if (!storeId) {
      try {
        const user = JSON.parse(localStorage.getItem('alfa_user') || localStorage.getItem('user') || '{}');
        storeId = user.store_id || 'STORE_1';
      } catch(e) {
        storeId = 'STORE_1';
      }
    }

    if (window.showToast) window.showToast('Sending to printer...', 'info');

    // 4. Dispatch the payload to the local printer WebSocket
    const response = await posApi.sendPrintRequest({
      id: `print-report-${Date.now()}`,
      type: 'print',
      job_type: 'BILL',
      print_purpose: 'BILL',
      printer_type: 'BILL',
      html: htmlContent,
      store_id: storeId,
      converttoPdf: false
    });

    if (response?.data?.success || response?.success) {
      if (window.showToast) window.showToast('✅ Print job sent successfully');
    } else {
      console.warn('WebSocket print did not return success, falling back to window.print()');
      window.print();
    }
  } catch (err) {
    console.warn('WebSocket print failed, falling back to browser print:', err);
    window.print();
  }
};
