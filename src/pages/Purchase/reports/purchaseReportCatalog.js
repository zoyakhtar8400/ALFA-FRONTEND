import {
  FaBoxes, FaShoppingCart, FaTruck, FaFileInvoiceDollar,
  FaExchangeAlt, FaExclamationTriangle, FaWarehouse, FaUndo,
  FaCalculator, FaChartPie, FaPercentage, FaHistory, FaClock,
  FaClipboardList, FaTag, FaBalanceScale, FaUtensils, FaChartLine
} from 'react-icons/fa';

export const PURCHASE_REPORT_CATALOG = [
  {
    id: 'procurement-registers',
    title: 'Procurement & Registers',
    desc: 'Purchase, Indent, Quotation, PO, GRN & Return Registers',
    icon: FaShoppingCart,
    color: '#2563EB', // Blue
    gradient: 'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)',
    bgLight: 'rgba(37, 99, 235, 0.05)',
    reports: [
      {
        id: 'purchase-register',
        name: 'Purchase Register',
        desc: 'Master purchase register listing all vendor invoice receipts, taxable values, and payment statuses.',
        kpis: [{ label: 'Total Invoices', value: '142 Bills' }, { label: 'Gross Value', value: '₹14,85,200' }, { label: 'Avg Invoice', value: '₹10,459' }],
        columns: ['Inv #', 'Inv Date', 'Vendor Name', 'GSTIN', 'Taxable Val', 'GST Amount', 'Total Net Bill', 'Status'],
        data: [
          { c1: 'PUR-2026-001', c2: '2026-07-20', c3: 'Metro Cash & Carry India', c4: '07AAAAA0000A1Z5', c5: '₹45,000.00', c6: '₹8,100.00', c7: '₹53,100.00', c8: 'Verified' },
          { c1: 'PUR-2026-002', c2: '2026-07-21', c3: 'Diversey Hygiene Pvt Ltd', c4: '27BBBCA1111B1Z2', c5: '₹18,500.00', c6: '₹3,330.00', c7: '₹21,830.00', c8: 'Verified' },
          { c1: 'PUR-2026-003', c2: '2026-07-22', c3: 'Amul Dairy Federation', c4: '24CCCDD2222C1Z8', c5: '₹12,400.00', c6: '₹620.00', c7: '₹13,020.00', c8: 'Pending Review' },
          { c1: 'PUR-2026-004', c2: '2026-07-23', c3: 'Nestle India Commercial', c4: '06EEEFF3333D1Z4', c5: '₹28,900.00', c6: '₹3,468.00', c7: '₹32,368.00', c8: 'Verified' }
        ]
      },
      {
        id: 'indent-register',
        name: 'Indent Register',
        desc: 'Requisition register tracking department store indents from creation to approval and PO release.',
        kpis: [{ label: 'Total Indent Qty', value: '15.000' }, { label: 'Approved Qty', value: '15.000' }, { label: 'Department', value: 'MAIN KITCHEN' }],
        columns: ['Indent No.', 'Indent Date', 'Indenter', 'Department', 'Item', 'Unit', 'Ind. Qty.', 'Apr. Qty.', 'Ord Qty.', 'Remark'],
        data: [
          { c1: '1', c2: '25/Jul/26', c3: 'DEMO', c4: 'MAIN KITCHEN', c5: 'AATA', c6: 'K.G.', c7: '10.000', c8: '10.000', c9: '-', c10: '' },
          { c1: '2', c2: '25/Jul/26', c3: 'DEMO', c4: 'MAIN KITCHEN', c5: 'SUGAR KG', c6: 'K.G.', c7: '5.000', c8: '5.000', c9: '-', c10: '' }
        ]
      },
      {
        id: 'quotation-register',
        name: 'Quotation Register',
        desc: 'Vendor quotation comparison register evaluating rate quotes, payment terms, and vendor selections.',
        kpis: [{ label: 'Total Quoted Qty', value: '80.000 K.G.' }, { label: 'Total Amount', value: '₹2,500.00' }, { label: 'Site Name', value: 'HO' }],
        columns: ['Quot. No.', 'Quot. Dt.', 'V.Quot. No.', 'V.Quot. Dt.', 'Item', 'Unit', 'Qty.', 'Rate', 'Amount', 'Remark'],
        data: [
          { c1: '1', c2: '25/Jul/26', c3: '12', c4: '25/Jul/2026', c5: 'AATA', c6: 'K.G.', c7: '50.000', c8: '32.00', c9: '1600.00', c10: '' },
          { c1: '', c2: '', c3: '', c4: '', c5: 'SUGAR KG', c6: 'K.G.', c7: '30.000', c8: '30.00', c9: '900.00', c10: '' }
        ]
      },
      {
        id: 'purchase-order-register',
        name: 'Purchase Order Register',
        desc: 'Complete purchase order log detailing committed vendor orders, delivery schedules, and fulfillment rates.',
        kpis: [{ label: 'Total Ord Qty', value: '20.000 K.G.' }, { label: 'Rec. Qty', value: '20.000 K.G.' }, { label: 'Supplier', value: 'A P SUPPLY' }],
        columns: ['Ord No.', 'Date', 'SO Date', 'Supplier', 'Item', 'Unit', 'Ord Qty.', 'Rec. Qty.', 'Pending Qty.', 'Closed'],
        data: [
          { c1: 'PORD/1', c2: '25/Jul/2026', c3: '25/Jul/2026', c4: 'A P SUPPLY', c5: 'AATA', c6: 'K.G.', c7: '20.000', c8: '20.000', c9: '-', c10: 'N' }
        ]
      },
      {
        id: 'grn-register',
        name: 'GRN Register',
        desc: 'Goods Receipt Note register recording store inward entries, gate pass verification, and supplier invoice details.',
        kpis: [{ label: 'Total Inward Amount', value: '₹640.00' }, { label: 'Accepted Qty', value: '20.000 K.G.' }, { label: 'Supplier', value: 'A P SUPPLY' }],
        columns: ['Entry No.', 'Date', 'Challan No.', 'Challan Date', 'Bill No.', 'Bill Date', 'Item', 'Doc Qty', 'Accepted Qty', 'Rate', 'Amount', 'SKU Qty'],
        data: [
          { c1: '1', c2: '25/Jul/2026', c3: '1', c4: '25/Jul/26', c5: '1', c6: '25/Jul/2026 12:00', c7: 'AATA', c8: '20.000', c9: '20.000 K.G.', c10: '32.00', c11: '640.00', c12: '20.000 K.G.' }
        ]
      },
      {
        id: 'purchase-register-detail',
        name: 'Purchase Register Detail',
        desc: 'Line-item level granular purchase register breaking down every single product purchased with unit rate, department allocation, and tax breakdown.',
        kpis: [{ label: 'Total Recd Qty', value: '50.000 K.G.' }, { label: 'Net Amount', value: '₹2,200.00' }, { label: 'Supplier', value: 'A P SUPPLY' }],
        columns: ['Vr.Date', 'Vr. No.', 'Party Name', 'Party Bill No.', 'PBill Date', 'Item Name', 'Recd. Qty.', 'Pur Rate', 'Amt.', 'L Rate', 'L Value', 'Department', 'Gross Amt.', 'Disc. Amt.', 'Taxable Amt.', 'SGST Amt.', 'CGST Amt.', 'IGST Amt.', 'CESS Amt.', 'R/o', 'Net Amt'],
        data: [
          { c1: '25/Jul/26', c2: 'PBILL/25', c3: 'A P SUPPLY', c4: '25', c5: '25/Jul/26', c6: 'AATA', c7: '10.000 K.G.', c8: '32.00', c9: '320.00', c10: '32.00', c11: '320.00', c12: 'PURCHASE STORE', c13: '1560.00', c14: '0.00', c15: '1560.00', c16: '0.00', c17: '0.00', c18: '0.00', c19: '0.00', c20: '0.00', c21: '1560.00' },
          { c1: '', c2: '', c3: '', c4: '', c5: '', c6: 'SUGAR KG', c7: '20.000 K.G.', c8: '32.00', c9: '640.00', c10: '32.00', c11: '640.00', c12: 'PURCHASE STORE', c13: '', c14: '', c15: '', c16: '', c17: '', c18: '', c19: '', c20: '', c21: '' },
          { c1: '25/Jul/26', c2: 'PBILL/1', c3: 'A P SUPPLY', c4: '1', c5: '25/Jul/26', c6: 'AATA', c7: '20.000 K.G.', c8: '32.00', c9: '640.00', c10: '32.00', c11: '640.00', c12: 'PURCHASE STORE', c13: '640.00', c14: '0.00', c15: '640.00', c16: '0.00', c17: '0.00', c18: '0.00', c19: '0.00', c20: '0.00', c21: '640.00' }
        ]
      },
      {
        id: 'purchase-return-register',
        name: 'Purchase Return Register',
        desc: 'Debit note and purchase return log recording goods returned to suppliers with credit note adjustments.',
        kpis: [{ label: 'Total Returned Qty', value: '10.000 K.G.' }, { label: 'Return Net Value', value: '₹320.00' }, { label: 'Supplier', value: 'A P SUPPLY' }],
        columns: ['Vr.Date', 'Vr. No.', 'Party Name', 'Party Bill No.', 'PBill Date', 'Item Name', 'Recd. Qty.', 'Pur Rate', 'Amt.', 'L Rate', 'L Value', 'Department', 'Gross Amt.', 'Disc. Amt.', 'Taxable Amt.', 'SGST Amt.', 'CGST Amt.', 'IGST Amt.', 'CESS Amt.', 'R/o', 'Net Amt'],
        data: [
          { c1: '25/Jul/26', c2: 'PBRT/1', c3: 'A P SUPPLY', c4: '1', c5: '25/Jul/26', c6: 'AATA', c7: '10.000 K.G.', c8: '32.00', c9: '320.00', c10: '32.00', c11: '320.00', c12: 'PURCHASE STORE', c13: '320.00', c14: '0.00', c15: '320.00', c16: '0.00', c17: '0.00', c18: '0.00', c19: '0.00', c20: '0.00', c21: '320.00' }
        ]
      }
    ]
  },
  {
    id: 'stock-report',
    title: 'Stock & Inventory',
    desc: 'Stock summary, ledgers, valuation, discrepancies & history',
    icon: FaBoxes,
    color: '#0D9488', // Teal
    gradient: 'linear-gradient(135deg, #0D9488 0%, #14B8A6 100%)',
    bgLight: 'rgba(13, 148, 136, 0.05)',
    reports: [
      {
        id: 'stock-summary',
        name: 'Stock Summary',
        desc: 'High-level store stock summary showing total quantity on hand, departmentwise stock breakdown, and reorder status alerts.',
        kpis: [{ label: 'Gross Total Qty', value: '702.528' }, { label: 'Reorder Alerts', value: '1 Item Below Min' }, { label: 'Site Name', value: 'HO' }],
        columns: ['Item', 'Stock Unit', 'Opening Qty.', 'Receive Qty.', 'Issue Qty.', 'Balance Qty.'],
        data: [
          { c1: 'SOFTDRINK 200.ML', c2: 'Bottle', c3: '6.000', c4: '', c5: '', c6: '6.00' },
          { c1: 'BREEZER', c2: 'Bottle', c3: '16.000', c4: '', c5: '', c6: '16.00' },
          { c1: 'BUDWEISER BOTTLE', c2: 'Bottle', c3: '24.000', c4: '', c5: '', c6: '24.00' },
          { c1: 'BUDWEISER CAN', c2: 'CAN', c3: '141.000', c4: '', c5: '', c6: '141.00' },
          { c1: '100 PIPERS', c2: 'Bottle', c3: '6.120', c4: '', c5: '', c6: '6.12' },
          { c1: 'JOHNNIE WALKER BLUE LABEL', c2: 'Bottle', c3: '0.000', c4: '', c5: '', c6: '0.00' }
        ]
      },
      {
        id: 'stock-ledger',
        name: 'Stock Ledger',
        desc: 'Item movement ledger detailing opening balances, inward receipts, outward issues, and running balance by department and product type.',
        kpis: [{ label: 'Stock Qty In', value: 'SKU' }, { label: 'Display Mode', value: 'RPT' }, { label: 'Site Name', value: 'HO' }],
        columns: ['Date', 'V.No.', 'Particulars', 'Receive Qty.', 'Issue Qty.', 'Balance Qty.', 'Rate', 'Value'],
        data: [
          { c1: '25/Jul/2026', c2: 'OBJ', c3: 'Opening (SOFTDRINK 200.ML)', c4: '6.000', c5: '', c6: '6.000', c7: '0.00', c8: '0.00' },
          { c1: '25/Jul/2026', c2: 'OBJ', c3: 'Opening (BREEZER)', c4: '16.000', c5: '', c6: '16.000', c7: '90.00', c8: '1440.00' },
          { c1: '25/Jul/2026', c2: 'OBJ', c3: 'Opening (BUDWEISER BOTTLE)', c4: '24.000', c5: '', c6: '24.000', c7: '167.00', c8: '4008.00' },
          { c1: '25/Jul/2026', c2: 'OBJ', c3: 'Opening (BUDWEISER CAN)', c4: '141.000', c5: '', c6: '141.000', c7: '220.00', c8: '31020.00' }
        ]
      },
      {
        id: 'stock-valuation',
        name: 'Stock Valuation',
        desc: 'Inventory valuation report based on FIFO / LIFO / Weighted Average Cost method for financial accounting.',
        kpis: [{ label: 'Valuation Method', value: 'Weighted Avg' }, { label: 'Net Inventory Value', value: '₹18,45,200' }],
        columns: ['Item Code', 'Item Name', 'Unit of Measure', 'Current Qty', 'Weighted Avg Rate', 'FIFO Cost', 'Total Valuation'],
        data: [
          { c1: 'ITM-F01', c2: 'Basmati Rice Premium 25kg', c3: 'Bags', c4: '20', c5: '₹2,380.00', c6: '₹2,400.00', c7: '₹47,600.00' },
          { c1: 'ITM-F02', c2: 'Refined Oil Tin 15L', c3: 'Tins', c4: '15', c5: '₹1,840.00', c6: '₹1,850.00', c7: '₹27,600.00' },
          { c1: 'ITM-H03', c2: 'Taski R2 Cleaner 5L', c3: 'Cans', c4: '12', c5: '₹1,250.00', c6: '₹1,250.00', c7: '₹15,000.00' }
        ]
      },
      {
        id: 'stock-discrepancy-report',
        name: 'Stock Discrepancy Report',
        desc: 'Physical stock verification audit report highlighting variances between system balance and actual physical counts.',
        kpis: [{ label: 'Discrepancy Count', value: '4 Items' }, { label: 'Net Variance Value', value: '-₹4,250' }],
        columns: ['Item Code', 'Item Description', 'System Qty', 'Physical Qty', 'Variance Qty', 'Unit Cost', 'Variance Value', 'Audit Status'],
        data: [
          { c1: 'ITM-F08', c2: 'Butter 500g Packs', c3: '45 Pcs', c4: '40 Pcs', c5: '-5 Pcs', c6: '₹270.00', c7: '-₹1,350.00', c8: 'Shortage Discovered' },
          { c1: 'ITM-H12', c2: 'Hand Wash Refill 5L', c3: '10 Cans', c4: '8 Cans', c5: '-2 Cans', c6: '₹850.00', c7: '-₹1,700.00', c8: 'Spillage Reported' },
          { c1: 'ITM-G04', c2: 'Guest Bath Soap 50g', c3: '400 Pcs', c4: '420 Pcs', c5: '+20 Pcs', c6: '₹18.00', c7: '+₹360.00', c8: 'Surplus Discovered' }
        ]
      },
      {
        id: 'stock-adjustment-report',
        name: 'Stock Adjustment Report',
        desc: 'Log of stock adjustment journal entries approved to write off breakage, spoilage, or audit reconciliation.',
        kpis: [{ label: 'Adjustments Count', value: '8 Vouchers' }, { label: 'Written Off Value', value: '₹8,900' }],
        columns: ['Adj Voucher #', 'Date', 'Item Name', 'Adjusted Qty', 'Adj Type', 'Reason / Remarks', 'Approved By', 'Value Impact'],
        data: [
          { c1: 'ADJ-101', c2: '2026-07-18', c3: 'Fresh Milk Poly Pack 1L', c4: '-10 Litre', c5: 'Spoilage', c6: 'Refrigeration Failure', c7: 'Store Manager', c8: '-₹540.00' },
          { c1: 'ADJ-102', c2: '2026-07-20', c3: 'Glass Tumblers 300ml', c4: '-12 Pcs', c5: 'Breakage', c6: 'Accidental Drop in Pantry', c7: 'F&B Manager', c8: '-₹1,440.00' }
        ]
      },
      {
        id: 'stock-summary-for-excise',
        name: 'Stock Summary For Excise',
        desc: 'Specialized stock register for liquor, tobacco, or excise-controllable inventory complying with government norms.',
        kpis: [{ label: 'Excise Compliant SKUs', value: '48 Items' }, { label: 'Permit Verification', value: 'Verified' }],
        columns: ['Excise Code', 'Brand / Item Description', 'Pack Size', 'Opening Stock', 'Permit Receipts', 'Sales / Issues', 'Closing Stock'],
        data: [
          { c1: 'EXC-L01', c2: 'Glenfiddich 12 Yrs Single Malt', c3: '750 ml', c4: '14 Btl', c5: '6 Btl', c6: '8 Btl', c7: '12 Btl' },
          { c1: 'EXC-L02', c2: 'Absolut Vodka Blue 750ml', c3: '750 ml', c4: '20 Btl', c5: '12 Btl', c6: '15 Btl', c7: '17 Btl' }
        ]
      },
      {
        id: 'item-history',
        name: 'Item History',
        desc: 'Full lifecycle movement audit trail for a selected SKU from purchase inward to issue, transfer, and consumption.',
        kpis: [{ label: 'Search Item', value: 'ITM-F01' }, { label: 'Total Movement Events', value: '48 Events' }],
        columns: ['Date & Time', 'Event Type', 'Ref Doc #', 'Vendor / Department', 'Inward (+)', 'Outward (-)', 'Balance Stock', 'User Action'],
        data: [
          { c1: '2026-07-15 10:30', c2: 'GRN Inward', c3: 'GRN-880', c4: 'Metro Cash & Carry', c5: '+20', c6: '0', c7: '35', c8: 'Store Keeper' },
          { c1: '2026-07-18 14:15', c2: 'Store Issue', c3: 'ISS-790', c4: 'Main Kitchen', c5: '-5', c6: '0', c7: '30', c8: 'Chef Mohan' }
        ]
      },
      {
        id: 'opening-stock-register',
        name: 'Opening Stock Register',
        desc: 'Financial year opening stock ledger recording baseline inventory quantities and valuation brought forward.',
        kpis: [{ label: 'Financial Year', value: '2026 - 2027' }, { label: 'B/F Opening Value', value: '₹14,20,000' }],
        columns: ['Item Code', 'Item Name', 'Category', 'Opening Qty', 'Unit Measure', 'Opening Rate', 'Opening Value'],
        data: [
          { c1: 'ITM-F01', c2: 'Basmati Rice Premium 25kg', c3: 'Food & Beverage', c4: '15', c5: 'Bags', c6: '₹2,350.00', c7: '₹35,250.00' },
          { c1: 'ITM-H01', c2: 'Bath Towel White 600GSM', c3: 'Linen', c4: '120', c5: 'Pcs', c6: '₹450.00', c7: '₹54,000.00' }
        ]
      },
      {
        id: 'current-stock-register',
        name: 'Current Stock Register',
        desc: 'Real-time live stock balance register displaying current warehouse availability, departmentwise breakdown, and conversion quantities.',
        kpis: [{ label: 'Total Stocked Items', value: '67 Items' }, { label: 'Total SKUs', value: '702.528' }, { label: 'Department', value: 'DISPENSE BAR' }],
        columns: ['S.No.', 'Item', 'Group', 'Stock (SKU) Qty.', 'Conv. Qty.'],
        data: [
          { c1: '1', c2: 'SOFTDRINK 200.ML', c3: 'BEVERAGES', c4: '6.000 Bottle', c5: '6.000 Bottle' },
          { c1: '2', c2: 'BREEZER', c3: 'BEER', c4: '16.000 Bottle', c5: '16.000 Bottle' },
          { c1: '3', c2: 'BUDWEISER BOTTLE', c3: 'BEER', c4: '24.000 Bottle', c5: '24.000 Bottle' },
          { c1: '4', c2: 'BUDWEISER CAN', c3: 'BEER', c4: '141.000 CAN', c5: '141.000 CAN' },
          { c1: '5', c2: 'BUDWEISER MILD CAN', c3: 'BEER', c4: '63.000 CAN', c5: '63.000 CAN' },
          { c1: '6', c2: 'CORONA BEER', c3: 'BEER', c4: '41.000 CAN', c5: '41.000 CAN' },
          { c1: '7', c2: 'ELEPHANT BOTTLE', c3: 'BEER', c4: '27.000 CAN', c5: '27.000 CAN' },
          { c1: '8', c2: 'ELEPHANT CAN', c3: 'BEER', c4: '66.000 CAN', c5: '66.000 CAN' },
          { c1: '9', c2: 'K F ULTRA MAX CAN', c3: 'BEER', c4: '23.000 CAN', c5: '23.000 CAN' },
          { c1: '10', c2: 'KINGFISHER STRONG BOTTLE', c3: 'BEER', c4: '2.000 Bottle', c5: '2.000 Bottle' },
          { c1: '11', c2: 'TUBORG BOTTLE', c3: 'BEER', c4: '9.000 Bottle', c5: '9.000 Bottle' },
          { c1: '12', c2: 'TUBORG STRONG CAN', c3: 'BEER', c4: '175.000 CAN', c5: '175.000 CAN' },
          { c1: '13', c2: 'BACARDI WHITE RUM', c3: 'LIQOUR', c4: '6.720 Bottle', c5: '5040.000 M.L.' },
          { c1: '14', c2: 'JAMESON IRISH', c3: 'LIQOUR', c4: '8.880 Bottle', c5: '6660.000 M.L.' },
          { c1: '15', c2: 'MAGIC MOMENT', c3: 'LIQOUR', c4: '8.560 Bottle', c5: '6420.000 M.L.' },
          { c1: '16', c2: '100 PIPERS', c3: 'LIQOUR', c4: '6.120 Bottle', c5: '4590.000 M.L.' },
          { c1: '17', c2: 'ABSOLUT VODKA', c3: 'LIQOUR', c4: '10.520 Bottle', c5: '7890.000 M.L.' }
        ]
      },
      {
        id: 'stock-valuation-customize',
        name: 'Stock Valuation Customize',
        desc: 'Customizable inventory valuation report allowing custom rate rules (Latest PO rate, Last GRN rate, Std Cost).',
        kpis: [{ label: 'Custom Rule', value: 'Latest GRN Price' }, { label: 'Custom Valuation', value: '₹18,92,000' }],
        columns: ['Item Code', 'Item Name', 'Stock Qty', 'Std Cost Rate', 'Latest GRN Rate', 'Valuation at Std', 'Valuation at GRN'],
        data: [
          { c1: 'ITM-F01', c2: 'Basmati Rice Premium 25kg', c3: '20 Bags', c4: '₹2,300.00', c5: '₹2,400.00', c6: '₹46,000.00', c7: '₹48,000.00' },
          { c1: 'ITM-H03', c2: 'Taski R2 Cleaner 5L', c3: '12 Cans', c4: '₹1,200.00', c5: '₹1,250.00', c6: '₹14,400.00', c7: '₹15,000.00' }
        ]
      }
    ]
  },
  {
    id: 'issues-consumption',
    title: 'Issues & Consumption',
    desc: 'Department issues, stock transfers, consumption & kitchen updates',
    icon: FaExchangeAlt,
    color: '#D97706', // Amber / Orange
    gradient: 'linear-gradient(135deg, #D97706 0%, #F59E0B 100%)',
    bgLight: 'rgba(217, 119, 6, 0.05)',
    reports: [
      {
        id: 'department-issue-register',
        name: 'Department Issue Register',
        desc: 'Internal store issue voucher log tracking inventory issued to Kitchen, Housekeeping, Maintenance, and FO.',
        kpis: [{ label: 'Total Issued Value', value: '₹1,04,042.00' }, { label: 'Total Qty', value: '652.000' }, { label: 'Destination', value: 'DISPENSE BAR' }],
        columns: ['Vr. No.', 'Vr. Dt.', 'Item', 'Unit', 'Qty.', 'Rate', 'Amount', 'Remark'],
        data: [
          { c1: '17', c2: '6/Jul/26', c3: 'TUBORG BOTTLE', c4: 'bottle', c5: '24.000', c6: '170.00', c7: '4080.00', c8: '' },
          { c1: '', c2: '', c3: 'TUBORG STRONG CAN.', c4: 'CAN', c5: '192.000', c6: '124.00', c7: '23808.00', c8: '' },
          { c1: '', c2: '', c3: 'BUDWEISER BOTTLE', c4: 'Bottle', c5: '24.000', c6: '210.00', c7: '5040.00', c8: '' },
          { c1: '', c2: '', c3: 'BUDWEISER CAN', c4: 'CAN', c5: '192.000', c6: '142.50', c7: '27360.00', c8: '' },
          { c1: '', c2: '', c3: 'BUDWEISER MILD CAN', c4: 'CAN', c5: '48.000', c6: '134.00', c7: '6432.00', c8: '' },
          { c1: '', c2: '', c3: 'ELEPHANT CAN', c4: 'CAN', c5: '120.000', c6: '143.50', c7: '17220.00', c8: '' },
          { c1: '', c2: '', c3: 'CORONA BEER', c4: 'Bottle', c5: '48.000', c6: '148.00', c7: '7104.00', c8: '' },
          { c1: '', c2: '', c3: 'THE SINGLETON', c4: 'bottle', c5: '1.000', c6: '4403.00', c7: '4403.00', c8: '' },
          { c1: '', c2: '', c3: 'CHIVAS REGAL', c4: 'bottle', c5: '3.000', c6: '2865.00', c7: '8595.00', c8: '' }
        ]
      },
      {
        id: 'stock-transfer-register',
        name: 'Stock Transfer Register',
        desc: 'Inter-outlet and inter-store stock movement log between Central Store, Kitchen Store, and Bar Store.',
        kpis: [{ label: 'Grand Total Qty', value: '91.000' }, { label: 'Grand Total Value', value: '₹22,722.00' }, { label: 'Site Name', value: 'HO' }],
        columns: ['Vr. No.', 'Vr. Dt.', 'Item', 'Unit', 'Qty.', 'Rate', 'Amount', 'Remark'],
        data: [
          { c1: '49', c2: '2/Jul/26', c3: 'ELEPHANT CAN', c4: 'CAN', c5: '12.000', c6: '143.50', c7: '1722.00', c8: '' },
          { c1: '', c2: '', c3: 'TUBORG STRONG CAN.', c4: 'CAN', c5: '12.000', c6: '124.00', c7: '1488.00', c8: '' },
          { c1: '50', c2: '5/Jul/26', c3: 'TUBORG STRONG CAN.', c4: 'CAN', c5: '12.000', c6: '124.00', c7: '1488.00', c8: '' },
          { c1: '', c2: '', c3: 'BUDWEISER CAN', c4: 'CAN', c5: '12.000', c6: '142.50', c7: '1710.00', c8: '' },
          { c1: '51', c2: '7/Jul/26', c3: 'ELEPHANT CAN', c4: 'CAN', c5: '12.000', c6: '143.50', c7: '1722.00', c8: '' },
          { c1: '50', c2: '5/Jul/26', c3: 'J.W RED LABLE', c4: 'Bottle', c5: '1.000', c6: '1671.00', c7: '1671.00', c8: '' },
          { c1: '', c2: '', c3: 'BLACK & WHITE', c4: 'Bottle', c5: '1.000', c6: '1552.00', c7: '1552.00', c8: '' },
          { c1: '48', c2: '1/Jul/26', c3: 'CORONA BEER', c4: 'Bottle', c5: '1.000', c6: '148.00', c7: '148.00', c8: 'receive' }
        ]
      },
      {
        id: 'consume-register',
        name: 'Consume Register',
        desc: 'Itemized store consumption register recording operational usage, wastage, and kitchen prep consumption.',
        kpis: [{ label: 'Total Consumed Value', value: '₹2,065.00' }, { label: 'Total Qty', value: '13.040' }, { label: 'Department', value: 'DISPENSE BAR' }],
        columns: ['Vr. No.', 'Vr. Dt.', 'Item', 'Unit', 'Qty.', 'Rate', 'Amount', 'Remark'],
        data: [
          { c1: '1', c2: '06/Apr/2026', c3: 'BUDWEISER CAN', c4: 'CAN', c5: '6.000', c6: '220.00', c7: '1320.00', c8: 'Normal Consume' },
          { c1: '2', c2: '31/May/2026', c3: 'BLACK & WHITE', c4: 'Bottle', c5: '1.000', c6: '0.00', c7: '0.00', c8: 'Promo Sample' },
          { c1: '3', c2: '11/Jun/2026', c3: 'KF ULTRA MAX BOTTLE', c4: 'Bottle', c5: '1.000', c6: '159.00', c7: '159.00', c8: 'Normal Consume' },
          { c1: '4', c2: '28/Jun/2026', c3: 'KF ULTRA LASER 330 ML', c4: 'Bottle', c5: '1.000', c6: '90.00', c7: '90.00', c8: 'Normal Consume' },
          { c1: '5', c2: '11/Jul/2026', c3: 'GLENLIVET', c4: 'Bottle', c5: '0.040', c6: '0.00', c7: '0.00', c8: 'Complimentary' }
        ]
      },
      {
        id: 'kitchen-closing-stock-register',
        name: 'Kitchen Closing Stock Register',
        desc: 'Daily closing stock count in Main Kitchen and Outlets to calculate actual daily kitchen food consumption.',
        kpis: [{ label: 'Kitchen Outlet', value: 'Main Kitchen' }, { label: 'Closing Value', value: '₹64,200' }],
        columns: ['Count Date', 'Item Name', 'Unit', 'Opening Qty', 'Recd from Store', 'Closing Stock Count', 'Daily Consumption Qty'],
        data: [
          { c1: '2026-07-23', c2: 'Fresh Cow Milk 1L', c3: 'Litre', c4: '10', c5: '40', c6: '12', c7: '38 Litres' },
          { c1: '2026-07-23', c2: 'Refined Oil 5L', c3: 'Can', c4: '4', c5: '8', c6: '3', c7: '9 Cans' }
        ]
      },
      {
        id: 'itemwise-datewise-issue',
        name: 'Itemwise Datewise Issue',
        desc: 'Comprehensive matrix report tracking daily issue trends of key raw materials across dates and departments.',
        kpis: [{ label: 'Tracked Period', value: 'Last 30 Days' }, { label: 'Top Issued Item', value: 'Fresh Milk 1L' }],
        columns: ['Date', 'Item Name', 'Category', 'Kitchen Issue', 'HK Issue', 'FO Issue', 'Total Issued Qty', 'Day Spend'],
        data: [
          { c1: '2026-07-23', c2: 'Fresh Milk 1L', c3: 'Dairy', c4: '40 Litre', c5: '2 Litre', c6: '1 Litre', c7: '43 Litres', c8: '₹2,322.00' },
          { c1: '2026-07-23', c2: 'Tea Bags Twinings', c3: 'Beverages', c4: '100 Pcs', c5: '200 Pcs', c6: '50 Pcs', c7: '350 Pcs', c8: '₹1,750.00' }
        ]
      },
      {
        id: 'stock-transfer-comparison-report',
        name: 'Stock Transfer Comparison Report',
        desc: 'Inter-outlet request vs actual dispatch comparison register measuring transfer request fulfillment efficiency.',
        kpis: [{ label: 'Fulfillment Rate', value: '96.5%' }, { label: 'Avg Dispatch Time', value: '45 Mins' }],
        columns: ['Transfer Req #', 'Requested Store', 'Requested Qty', 'Dispatched Qty', 'Fulfilled %', 'Variance Reason'],
        data: [
          { c1: 'STR-401', c2: 'Coffee Shop Pantry', c3: '10 Cans Milk', c4: '10 Cans Milk', c5: '100%', c6: 'Fulfilled Complete' },
          { c1: 'STR-402', c2: 'Poolside Bar', c3: '5 Cases Soda', c4: '4 Cases Soda', c5: '80%', c6: 'Store Shortage' }
        ]
      },
      {
        id: 'kitchen-stock-closing-update-report',
        name: 'Kitchen Stock Closing Update Report',
        desc: 'Audit report of kitchen physical stock entries updated into the ERP system at end-of-day shift closure.',
        kpis: [{ label: 'Submissions', value: '100% Shift Close' }, { label: 'Audited Shift', value: 'Dinner Shift' }],
        columns: ['Shift Date', 'Shift Name', 'Kitchen Section', 'Submitted By', 'Total SKUs Counted', 'Verification Status'],
        data: [
          { c1: '2026-07-23', c2: 'Night Shift Close', c3: 'Main Hot Kitchen', c4: 'Chef Mohan', c5: '42 SKUs', c6: 'Verified & Closed' },
          { c1: '2026-07-23', c2: 'Night Shift Close', c3: 'Pastry & Bakery', c4: 'Chef Pastry', c5: '28 SKUs', c6: 'Verified & Closed' }
        ]
      },
      {
        id: 'department-wise-issue-valuation',
        name: 'Department Wise Issue Valuation',
        desc: 'Financial cost allocation report summarizing total monetary stock issued to each department during the month.',
        kpis: [{ label: 'Total Department Spend', value: '₹6,14,500' }, { label: 'Top Department', value: 'Kitchen (₹3.8L)' }],
        columns: ['Department Name', 'No. of Issue Vouchers', 'Items Issued Count', 'Direct Expenses Value', '% Share of Total Issue'],
        data: [
          { c1: 'Restaurant & Kitchen', c2: '142 Vouchers', c3: '850 Units', c4: '₹3,81,000.00', c6: '62.0%' },
          { c1: 'Housekeeping & Laundry', c2: '65 Vouchers', c3: '320 Units', c4: '₹1,22,500.00', c6: '19.9%' },
          { c1: 'Front Office & Guest Rel', c2: '45 Vouchers', c3: '1,200 Units', c4: '₹65,000.00', c6: '10.6%' },
          { c1: 'Maintenance & Engg', c2: '32 Vouchers', c3: '140 Units', c4: '₹46,000.00', c6: '7.5%' }
        ]
      }
    ]
  },
  {
    id: 'tax-analytics',
    title: 'Tax & Analytics',
    desc: 'GST tax summaries, ABC analysis, vendor rates & cost statements',
    icon: FaFileInvoiceDollar,
    color: '#059669', // Emerald
    gradient: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
    bgLight: 'rgba(5, 150, 105, 0.05)',
    reports: [
      {
        id: 'purchase-tax-summary',
        name: 'Purchase Tax Summary',
        desc: 'Tax breakdown report aggregating CGST, SGST, IGST, and Cess across all purchase transactions.',
        kpis: [{ label: 'Total Input Tax', value: '₹1,94,850' }, { label: 'CGST / SGST', value: '₹1,42,100' }, { label: 'IGST (Interstate)', value: '₹52,750' }],
        columns: ['Tax Slab', 'Taxable Purchase Amount', 'CGST Amount', 'SGST Amount', 'IGST Amount', 'Total Input Tax Credit'],
        data: [
          { c1: 'GST 5% Slab', c2: '₹8,40,000.00', c3: '₹21,000.00', c4: '₹21,000.00', c5: '₹0.00', c6: '₹42,000.00' },
          { c1: 'GST 12% Slab', c2: '₹3,20,000.00', c3: '₹19,200.00', c4: '₹19,200.00', c5: '₹0.00', c6: '₹38,400.00' },
          { c1: 'GST 18% Slab', c2: '₹5,50,000.00', c3: '₹36,750.00', c4: '₹36,750.00', c5: '₹25,950.00', c6: '₹99,450.00' },
          { c1: 'GST 28% Slab', c2: '₹50,000.00', c3: '₹0.00', c4: '₹0.00', c5: '₹14,000.00', c6: '₹14,000.00' }
        ]
      },
      {
        id: 'purchase-register-summary-tax-detail',
        name: 'Purchase Register Summary Tax Detail',
        desc: 'Detailed monthly tax reconciliation register for filing GSTR-3B & matching GSTR-2B ITC with supplier GSTIN numbers.',
        kpis: [{ label: 'Total Invoices', value: '20 Invoices' }, { label: 'Top Vendor', value: 'ANITAJAISWAL' }, { label: 'Site Name', value: 'HO' }],
        columns: ['Inv No.', 'Inv Date', 'V.Type', 'Party Bill No.', 'Party Date', 'Party', 'Gross Amt.', 'Disc.', 'R/O', 'Net Amt.'],
        data: [
          { c1: '1', c2: '07/Apr/2026', c3: 'PBDCR', c4: '93', c5: '07/Apr/2026', c6: 'RADHIKA ENTERPRISES\n06JWPK1506C1ZL', c7: '6800.00', c8: '', c9: '', c10: '6800.00' },
          { c1: '2', c2: '07/Apr/2026', c3: 'PBDCR', c4: '56', c5: '07/Apr/2026', c6: 'A P SUPPLY\n09OWTPS0715M1Z0', c7: '6615.00', c8: '', c9: '', c10: '6615.00' },
          { c1: '3', c2: '10/Apr/2026', c3: 'PBDCR', c4: 'B-127 F129', c5: '10/Apr/2026', c6: 'ANITAJAISWAL', c7: '92064.00', c8: '', c9: '', c10: '92064.00' },
          { c1: '4', c2: '10/Apr/2026', c3: 'PBDCR', c4: '013', c5: '10/Apr/2026', c6: 'ENGINEERING SOLUTION\n09BNSPK3062P1ZX', c7: '8926.20', c8: '', c9: '-0.20', c10: '8926.00' }
        ]
      },
      {
        id: 'groupwise-taxwise-purchase-report',
        name: 'Groupwise Taxwise Purchase Report',
        desc: 'Inventory category-wise purchase matrix analyzed by GST tax brackets (Food, Housekeeping, Linen, Amenities).',
        kpis: [{ label: 'Top Tax Group', value: 'Housekeeping (18%)' }, { label: 'Exempt Goods Value', value: '₹48,200' }],
        columns: ['Item Group Category', 'Tax Bracket', 'Taxable Value', 'Total Tax Amount', 'Gross Purchased Value'],
        data: [
          { c1: 'Food & Beverage', c2: '5% Reduced Tax', c3: '₹6,40,000.00', c4: '₹32,000.00', c5: '₹6,72,000.00' },
          { c1: 'Housekeeping Supplies', c2: '18% Standard Tax', c3: '₹2,10,000.00', c4: '₹37,800.00', c5: '₹2,47,800.00' },
          { c1: 'Guest Amenities & Linen', c2: '12% Tax', c3: '₹1,50,000.00', c4: '₹18,000.00', c5: '₹1,68,000.00' },
          { c1: 'Fresh Vegetables & Dairy', c2: '0% Exempted', c3: '₹48,200.00', c4: '₹0.00', c5: '₹48,200.00' }
        ]
      },
      {
        id: 'partywise-itemwise-avg-rate',
        name: 'Partywise / Itemwise Avg. Rate',
        desc: 'Comparative purchase price register evaluating weighted average cost per vendor for key raw materials.',
        kpis: [{ label: 'Active Suppliers', value: '28 Vendors' }, { label: 'Top Spend Vendor', value: 'ANITAJAISWAL (₹3.13L)' }, { label: 'Site Name', value: 'HO' }],
        columns: ['Item Name', 'Quantity', 'Unit', 'Net Cost', 'Avg Rate', 'Min Rate', 'Max Rate', 'Last Pr. Rate'],
        data: [
          { c1: 'TEA BAG', c2: '30.000', c3: 'PACKET', c4: '6600.00', c5: '220.00', c6: '220.00', c7: '220.00', c8: '220.00' },
          { c1: 'MILK POWDER', c2: '30.000', c3: 'PACKET', c4: '11370.00', c5: '379.00', c6: '379.00', c7: '379.00', c8: '379.00' },
          { c1: 'SUGAR', c2: '15.000', c3: 'PACKET', c4: '1850.00', c5: '123.33', c6: '120.00', c7: '125.00', c8: '120.00' },
          { c1: 'AATA', c2: '70.000', c3: 'K.G.', c4: '2240.00', c5: '32.00', c6: '32.00', c7: '32.00', c8: '32.00' },
          { c1: 'SUGAR KG', c2: '25.000', c3: 'K.G.', c4: '750.00', c5: '30.00', c6: '30.00', c7: '30.00', c8: '30.00' }
        ]
      },
      {
        id: 'challan-recieve-register',
        name: 'Challan Recieve Register',
        desc: 'Delivery challan register tracking inward shipments received before official vendor tax invoice generation.',
        kpis: [{ label: 'Total Net Amount', value: '₹470.00' }, { label: 'Type', value: 'Summarized' }, { label: 'Site Name', value: 'HO' }],
        columns: ['Inv No.', 'Inv Date', 'Party Bill No.', 'Party Date', 'Party', 'Net Amt'],
        data: [
          { c1: '1', c2: '25/Jul/2026', c3: '2', c4: '25/Jul/2026', c5: 'A P SUPPLY', c6: '470.00' }
        ]
      },
      {
        id: 'abc-analysis',
        name: 'ABC Analysis',
        desc: 'Pareto inventory analysis grouping items by cumulative monetary purchase value (Category A, B & C).',
        kpis: [{ label: 'Category A (80% Spend)', value: '12 Items' }, { label: 'Category B (15% Spend)', value: '45 Items' }, { label: 'Category C (5% Spend)', value: '180 Items' }],
        columns: ['Item Code', 'Item Description', 'Category', 'Annual Spend', '% of Total Spend', 'Cum % Spend', 'ABC Classification'],
        data: [
          { c1: 'ITM-F01', c2: 'Basmati Rice Premium 25kg', c3: 'Food & Beverage', c4: '₹4,50,000.00', c5: '32.4%', c6: '32.4%', c7: 'Class A (High Value)' },
          { c1: 'ITM-F02', c2: 'Refined Oil Tin 15L', c3: 'Food & Beverage', c4: '₹3,20,000.00', c5: '23.0%', c6: '55.4%', c7: 'Class A (High Value)' },
          { c1: 'ITM-H03', c2: 'Taski Cleaning Chemicals', c3: 'Housekeeping', c4: '₹1,10,000.00', c5: '7.9%', c6: '88.2%', c7: 'Class B (Medium Value)' }
        ]
      },
      {
        id: 'fb-cost-statement-report',
        name: 'FB Cost Statement Report',
        desc: 'Food & Beverage cross-tabular department cost matrix statement matching outlet consumption against totals.',
        kpis: [{ label: 'Total F&D Cost', value: '₹52,07,940.58' }, { label: 'Main Kitchen Cost', value: '₹16,41,343.77' }, { label: 'Dispense Bar Cost', value: '₹33,90,229.81' }],
        columns: ['Category / Group', 'DISPENSE BAR', 'GARDENIA ROOFTOP', 'MAIN KITCHEN', 'Total'],
        data: [
          { c1: 'DESSERTS', c2: '', c3: '', c4: '4215.00', c5: '4215.00' },
          { c1: 'FOOD', c2: '', c3: '', c4: '1631635.77', c5: '1631635.77' },
          { c1: 'LIQOUR', c2: '1977631.49', c3: '', c4: '', c5: '1977631.49' },
          { c1: 'MAIN COURSE (VEG)', c2: '', c3: '', c4: '5493.00', c5: '5493.00' },
          { c1: 'BEER', c2: '1051866.00', c3: '112406.00', c4: '', c5: '1164272.00' },
          { c1: 'LIQOUR (BAR)', c2: '360732.32', c3: '63961.00', c4: '', c5: '424693.32' }
        ]
      },
      {
        id: 'non-moving-item-report',
        name: 'Non Moving Item Report',
        desc: 'Dead stock and slow-moving inventory report identifying items with zero issues for over 30/60/90 days.',
        kpis: [{ label: 'Non-Moving Value', value: '₹1,24,000' }, { label: '>90 Days Dead Stock', value: '14 SKUs' }],
        columns: ['Item Code', 'Item Name', 'Category', 'Current Qty', 'Stock Valuation', 'Last Issued Date', 'Days Idle', 'Risk Level'],
        data: [
          { c1: 'ITM-E12', c2: 'Halogen Bulb 500W', c3: 'Engineering', c4: '15 Pcs', c5: '₹4,500.00', c6: '2026-01-10', c7: '195 Days', c8: 'High (Obsolete)' },
          { c1: 'ITM-B04', c2: 'Banquet Satin Chair Cover Gold', c3: 'Banquet', c4: '80 Pcs', c5: '₹24,000.00', c6: '2026-03-15', c7: '130 Days', c8: 'Medium Idle' }
        ]
      },
      {
        id: 'item-wise-expiry',
        name: 'Item Wise Expiry',
        desc: 'Perishable goods expiry tracking report alerting upcoming product expiry dates for food, beverages & chemicals.',
        kpis: [{ label: 'Expired Items', value: '0 Items' }, { label: 'Expiring in 7 Days', value: '3 Items' }],
        columns: ['Item Code', 'Item Description', 'Batch / Lot #', 'Current Qty', 'Mfg Date', 'Expiry Date', 'Days to Expiry', 'Alert Status'],
        data: [
          { c1: 'ITM-D01', c2: 'Amul Butter 500g', c3: 'B-9921', c4: '18 Pcs', c5: '2026-06-01', c6: '2026-07-28', c7: '4 Days', c8: 'EXPIRING SOON' },
          { c1: 'ITM-D04', c2: 'Cheddar Cheese Block 1kg', c3: 'B-8812', c4: '6 Pcs', c5: '2026-05-15', c6: '2026-08-10', c7: '17 Days', c8: 'Safe' }
        ]
      },
      {
        id: 'daily-stock-variance',
        name: 'Daily Stock Variance',
        desc: 'Daily inventory discrepancy log comparing recorded system closing stock against physical night counts.',
        kpis: [{ label: 'Verified Outlets', value: '4 Outlets' }, { label: 'Net Daily Variance', value: '-₹840' }],
        columns: ['Date', 'Outlet / Store', 'Item Description', 'Book Stock', 'Physical Count', 'Variance', 'Cost Impact', 'Investigated By'],
        data: [
          { c1: '2026-07-23', c2: 'Main Kitchen', c3: 'Paneer Fresh 1kg', c4: '10 kg', c5: '9.2 kg', c6: '-0.8 kg', c7: '-₹280.00', c8: 'Chef Mohan' },
          { c1: '2026-07-23', c2: 'Bar Store', c3: 'Red Bull Can 250ml', c4: '48 Cans', c5: '44 Cans', c6: '-4 Cans', c7: '-₹560.00', c8: 'Bar Captain' }
        ]
      }
    ]
  }
];

