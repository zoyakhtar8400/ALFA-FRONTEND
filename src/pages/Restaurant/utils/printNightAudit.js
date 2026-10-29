import posApi from '../../../api/posApi';
import companyProfileService from '../../../services/companyProfileService';
import { getOutletPrintSettings } from '../../../utils/outletSettings';
import { getPrinterMasterSetup } from '../../../utils/printerMasterSettings';

/**
 * Generates an authentic thermal POS day-end summary / Z-Report string
 */
export const generateNightAuditHTML = ({
  companyName = 'ALFA RESTAURANT',
  currentDate = '',
  formattedDate = '',
  selectedOutlet = 'Main Restaurant Outlet',
  closingCutoff = '02:00:00',
  printDateTimeStr = '',
  activeAuditor = 'admin',
  hasBlockers = false,
  financials = {},
  blockerBreakdown = { activeTables: [], pendingKOTs: [], unpaidBills: [] },
  overrideReason = ''
}) => {
  const tender = financials.tenderBreakdown || {};
  const cashVariance = Number(financials.cashVariance || 0);

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>NIGHT AUDIT REPORT - ${currentDate}</title>
      <style>
        @page {
          size: auto;
          margin: 4mm 6mm;
        }
        * {
          box-sizing: border-box;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        body {
          font-family: 'Courier New', Courier, monospace;
          margin: 0;
          padding: 8px 12px;
          color: #000000;
          background: #ffffff;
          font-size: 13px;
          line-height: 1.35;
          max-width: 380px;
          margin: 0 auto;
        }
        .center {
          text-align: center;
        }
        .title {
          font-size: 16px;
          font-weight: 900;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          margin-bottom: 2px;
        }
        .sub {
          font-size: 13px;
          font-weight: bold;
          margin-bottom: 4px;
        }
        .dashed {
          border-top: 1px dashed #000000;
          margin: 6px 0;
        }
        .double-dashed {
          border-top: 2px solid #000000;
          margin: 6px 0;
        }
        .row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12.5px;
          padding: 1.5px 0;
        }
        .bold {
          font-weight: bold;
        }
        .section-head {
          font-weight: 900;
          text-transform: uppercase;
          font-size: 12px;
          margin: 4px 0 2px 0;
          letter-spacing: 0.3px;
        }
        .amt {
          text-align: right;
          font-family: 'Courier New', Courier, monospace;
          white-space: nowrap;
        }
        .sign-area {
          margin-top: 28px;
          padding-top: 6px;
        }
      </style>
    </head>
    <body>
      <div class="center title">${companyName}</div>
      <div class="center sub">*** NIGHT AUDIT / DAY CLOSE ***</div>
      
      <div class="dashed"></div>
      <div class="row"><span>DATE:</span><span class="amt bold">${formattedDate || currentDate}</span></div>
      <div class="row"><span>OUTLET:</span><span class="amt">${selectedOutlet}</span></div>
      <div class="row"><span>CUTOFF:</span><span class="amt">${closingCutoff}</span></div>
      <div class="row"><span>PRINT TIME:</span><span class="amt">${printDateTimeStr}</span></div>
      <div class="row"><span>AUDITOR:</span><span class="amt">${activeAuditor.toUpperCase()}</span></div>
      <div class="row"><span>STATUS:</span><span class="amt bold">${hasBlockers ? 'OVERRIDE' : 'CLOSED'}</span></div>

      <div class="dashed"></div>
      <div class="section-head">SALES SUMMARY (${Number(financials.billCount || 0)} BILLS)</div>
      <div class="dashed"></div>
      <div class="row"><span>GROSS SALES:</span><span class="amt">₹ ${Number(financials.grossSales || 0).toFixed(2)}</span></div>
      <div class="row"><span>TOTAL DISCOUNT:</span><span class="amt">-₹ ${Number(financials.discounts || 0).toFixed(2)}</span></div>
      <div class="row"><span>TAXABLE VALUE:</span><span class="amt">₹ ${Number(financials.taxableSales || 0).toFixed(2)}</span></div>
      <div class="row"><span>TAX (CGST/SGST):</span><span class="amt">₹ ${Number(financials.taxCollected || 0).toFixed(2)}</span></div>
      <div class="row bold"><span>NET SALES:</span><span class="amt">₹ ${Number(financials.netGrandTotal || 0).toFixed(2)}</span></div>
      ${Number(financials.refunds || 0) > 0 ? `<div class="row"><span>REFUNDS/VOID:</span><span class="amt">-₹ ${Number(financials.refunds || 0).toFixed(2)}</span></div>` : ''}

      <div class="dashed"></div>
      <div class="section-head">SETTLEMENT / TENDER</div>
      <div class="dashed"></div>
      <div class="row"><span>CASH:</span><span class="amt">₹ ${Number(tender.cash || 0).toFixed(2)}</span></div>
      <div class="row"><span>CARD (EDC):</span><span class="amt">₹ ${Number(tender.card || 0).toFixed(2)}</span></div>
      <div class="row"><span>UPI / DIGITAL:</span><span class="amt">₹ ${Number(tender.upi || 0).toFixed(2)}</span></div>
      ${Number(tender.room || 0) > 0 ? `<div class="row"><span>ROOM FOLIO:</span><span class="amt">₹ ${Number(tender.room || 0).toFixed(2)}</span></div>` : ''}
      ${Number(tender.complimentary || 0) > 0 ? `<div class="row"><span>COMPLIMENTARY:</span><span class="amt">₹ ${Number(tender.complimentary || 0).toFixed(2)}</span></div>` : ''}
      ${Number(tender.other || 0) > 0 ? `<div class="row"><span>OTHER:</span><span class="amt">₹ ${Number(tender.other || 0).toFixed(2)}</span></div>` : ''}
      <div class="double-dashed"></div>
      <div class="row bold" style="font-size: 14px;"><span>TOTAL COLLECTED:</span><span class="amt">₹ ${Number(financials.totalCollected || 0).toFixed(2)}</span></div>
      <div class="double-dashed"></div>

      <div class="section-head">CASH DRAWER RECONCILIATION</div>
      <div class="dashed"></div>
      <div class="row"><span>EXPECTED CASH:</span><span class="amt">₹ ${Number(financials.expectedCash || 0).toFixed(2)}</span></div>
      <div class="row"><span>COUNTED CASH:</span><span class="amt">₹ ${Number(financials.actualCashCounted || 0).toFixed(2)}</span></div>
      <div class="row bold"><span>CASH VARIANCE:</span><span class="amt">${cashVariance >= 0 ? `+₹ ${cashVariance.toFixed(2)}` : `-₹ ${Math.abs(cashVariance).toFixed(2)}`}</span></div>

      ${hasBlockers ? `
        <div class="dashed"></div>
        <div class="section-head">EXCEPTIONS / OVERRIDE</div>
        <div class="dashed"></div>
        <div class="row"><span>ACTIVE TABLES:</span><span class="amt">${blockerBreakdown.activeTables?.length || 0}</span></div>
        <div class="row"><span>OPEN KOTS:</span><span class="amt">${blockerBreakdown.pendingKOTs?.length || 0}</span></div>
        <div class="row"><span>UNPAID BILLS:</span><span class="amt">${blockerBreakdown.unpaidBills?.length || 0}</span></div>
        ${overrideReason ? `<div class="row" style="margin-top: 4px;"><span style="font-size: 11px;">REASON: ${overrideReason}</span></div>` : ''}
      ` : ''}

      <div class="sign-area">
        <div class="dashed"></div>
        <br><br>
        <div class="row"><span class="center" style="width: 100%;">AUDITOR / MANAGER SIGNATURE</span></div>
      </div>

      <div class="dashed" style="margin-top: 18px;"></div>
      <div class="center" style="font-size: 11px; margin-top: 4px;">*** END OF DAY AUDIT REPORT ***</div>

      <script>
        window.onload = function() { window.print(); }
      </script>
    </body>
    </html>
  `;
};

/**
 * Dispatches Night Audit thermal slip to hardware printer API (posApi.sendPrintRequest)
 * and opens the browser print preview.
 */
export const printNightAudit = async ({
  currentDate,
  formattedDate,
  selectedOutlet,
  closingCutoff = '02:00:00',
  financials = {},
  hasBlockers = false,
  blockerBreakdown = { activeTables: [], pendingKOTs: [], unpaidBills: [] },
  overrideReason = '',
  toast = () => {}
}) => {
  let companyProfile = {};
  try {
    const res = await companyProfileService.getProfile();
    companyProfile = res?.data || res?.companyProfile || (res && res.id ? res : {});
  } catch (err) {
    console.warn('Failed to load company profile for print:', err);
  }

  if (!companyProfile.company_name && !companyProfile.logo) {
    try {
      const cached = JSON.parse(localStorage.getItem('alfa_company_profile') || '{}');
      companyProfile = { ...cached, ...companyProfile };
    } catch (e) {}
  }

  const targetStoreId = localStorage.getItem('activeOutletId') || 'STORE_1';
  let outletSettings = {};
  try {
    outletSettings = await getOutletPrintSettings(targetStoreId);
  } catch (e) {}

  const printerSetup = getPrinterMasterSetup(targetStoreId);
  const targetPrinter = printerSetup.billPrintingPath || 'RP3200 plus(U) 12';

  const companyName = companyProfile.company_name || companyProfile.name || outletSettings.companyTitle || 'ALFA RESTAURANT';
  const activeAuditor = localStorage.getItem('username') || 'admin';
  const now = new Date();
  const printDateTimeStr = `${now.toLocaleDateString('en-GB')} ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}`;

  const printHtml = generateNightAuditHTML({
    companyName,
    currentDate,
    formattedDate,
    selectedOutlet,
    closingCutoff,
    printDateTimeStr,
    activeAuditor,
    hasBlockers,
    financials,
    blockerBreakdown,
    overrideReason
  });

  // 1. Dispatch directly to POS hardware printer API via posApi.sendPrintRequest
  try {
    await posApi.sendPrintRequest({
      id: `NA_${currentDate}`,
      type: 'print',
      job_type: 'REPORT',
      print_purpose: 'NIGHT_AUDIT_REPORT',
      printer_type: 'REPORT',
      printerName: targetPrinter,
      deviceName: targetPrinter,
      printer: targetPrinter,
      html: printHtml,
      store_id: targetStoreId,
      converttoPdf: false
    });
    toast(`✅ Night Audit report dispatched to printer "${targetPrinter}"`);
  } catch (printApiErr) {
    console.warn('posApi.sendPrintRequest dispatch notice:', printApiErr?.message || printApiErr);
  }

  // 2. Open print preview window
  const printWindow = window.open('', '_blank', 'width=450,height=650');
  if (printWindow) {
    printWindow.document.write(printHtml);
    printWindow.document.close();
  }
};

export default printNightAudit;
