/**
 * Common print utility for the ALFA HMS application.
 * Injects the current timestamp into the print footer and triggers window.print().
 *
 * @param {string} [footerSelector='.print-footer'] - CSS selector for the footer element.
 * @param {string} [printedBy='Admin'] - Name/role to display in the footer.
 */
export const handlePrint = (footerSelector = '.print-footer', printedBy = 'Admin') => {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

  const printInfo = document.querySelector(footerSelector);
  if (printInfo) {
    printInfo.textContent = `Printed By: ${printedBy}  |  Date: ${dateStr}  |  Time: ${timeStr}`;
  }

  window.print();
};
