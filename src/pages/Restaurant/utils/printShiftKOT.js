export const printShiftKOT = ({ fromTableLabel, toTableLabel, items = [], time, date, kotNo }) => {
  const printWindow = window.open('', '_blank', 'width=800,height=600');
  if (!printWindow) return;

  const dateTimeStr = (date && time) ? `${date} ${time}` : new Date().toLocaleString('en-IN', { hour12: false });
  const kotDisplay = kotNo ? `KOT - ${kotNo}` : 'Move KOT';

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Shifted KOT</title>
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
            Shifted From Table No ${fromTableLabel} To ${toTableLabel}
          </div>
          <div class="text-center" style="margin-top: 4px;">${dateTimeStr}</div>
          <div class="text-center" style="margin-top: 2px;">${kotDisplay}</div>
          <div class="text-center" style="margin-top: 2px; font-weight: bold; font-size: 15px;">Dine In</div>
          <div class="text-center" style="margin-top: 2px; font-size: 15px; font-weight: bold;">Table No: ${toTableLabel}</div>
          
          <div class="divider" style="margin-top: 8px;"></div>
          <table>
            <thead>
              <tr>
                <th style="width: 40%;">Item</th>
                <th style="width: 45%;">Special Note</th>
                <th style="width: 15%; text-align: right;">Qty.</th>
              </tr>
            </thead>
            <tbody>
              ${items.map(item => `
                <tr>
                  <td><strong>${item.name || item.itemName}</strong></td>
                  <td>${item.remarks || item.remark || '--'}</td>
                  <td style="text-align: right;">${item.qty || item.quantity || 1}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="divider"></div>
        </div>
        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 500);
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
};
