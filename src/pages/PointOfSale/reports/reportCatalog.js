import { FaChartBar, FaFileInvoice, FaUtensils, FaHistory, FaExchangeAlt } from 'react-icons/fa';

export const REPORT_CATALOG = [
  {
    id: 'sales-report',
    title: 'Sales Report',
    subtitle: 'Revenue register and sales analysis',
    icon: FaChartBar,
    color: '#0D9488', // Teal
    gradient: 'linear-gradient(135deg, #0D9488 0%, #14B8A6 100%)',
    bgLight: 'rgba(13, 148, 136, 0.04)',
    reports: [
      {
        id: 'sales-register',
        name: 'Sales Register',
        desc: 'Chronological ledger of POS orders, covers count, and totals.',
        kpis: [],
        columns: ['S.No', 'Date', 'Time', 'Bill No', 'Table', 'Customer', 'Pay Type', 'Gross Amt', 'Disc.', 'Non Tax', 'Taxable', 'GST 5%', 'IGST', 'Round Off', 'Net Amt', 'User'],
        data: []
      },
      {
        id: 'itemwise-sale',
        name: 'Itemwise Sale',
        desc: 'Itemized sales quantities and margins analysis.',
        kpis: [],
        columns: ['Item Name', 'Unit', 'NC Qty', 'Qty', 'Value'],
        data: []
      },
      {
        id: 'itemwise-outletwise-sale',
        name: 'Itemwise Outletwise Sale',
        desc: 'Breakdown of item sales per individual outlet.',
        kpis: [],
        columns: ['Item Name', 'Unit', 'NC Qty', 'Qty', 'Value'],
        data: []
      },
      {
        id: 'itemwise-categorywise-sale',
        name: 'Itemwise Categorywise Sale',
        desc: 'Breakdown of item sales per item categories (Veg, Non-Veg, Beverage).',
        kpis: [],
        columns: ['Item Name', 'Unit', 'Qty', 'Value'],
        data: []
      },
      {
        id: 'tablewise-sale',
        name: 'Tablewise Itemwise Sale',
        desc: 'Review revenue generation performance across restaurant tables and bills.',
        kpis: [],
        columns: ['S.No.', 'Tbl No./Rm No.', 'Bill No.', 'Time', 'Bill Amt.', 'Name', 'Qty.', 'Value'],
        data: []
      },
      {
        id: 'cover-analysis',
        name: 'Cover Analysis Report',
        desc: 'Pax cover count, average order values, and table service turnaround times.',
        kpis: [],
        columns: ['S.No.', 'Bill Date', 'Bill No.', 'Time', 'No. of Pax', 'Bill Amount', 'Avg. Amt.', 'User Name', 'Duration'],
        data: []
      },
      {
        id: 'kitchen-time-gap',
        name: 'Kitchen Time Gap Report',
        desc: 'Time interval between KOT print and final kitchen preparation delivery.',
        kpis: [],
        columns: ['Ord./Bill Date', 'Ord./Bill No.', 'Ord./Bill Time (A)', 'Item Name', 'Qty', 'Ord. Complete Date', 'Ord. Complete Time (B)', 'Diff. (B-A)', 'Bill No.', 'Bill Date', 'Bill Time (C)', 'Diff. (C-A)'],
        data: []
      },
      {
        id: 'stewardwise-sale',
        name: 'Stewardwise Item Sale',
        desc: 'Detailed item sales analysis per steward / waiter.',
        kpis: [],
        columns: ['S.No.', 'Item', 'Outlet', 'Unit', 'Qty', 'Amount', 'Incentive', 'Tot Inc.'],
        data: []
      },
      {
        id: 'flash-report',
        name: 'Flash Report',
        desc: 'Summarized operational metrics comparison checklist.',
        kpis: [],
        columns: ['Metric', 'Today', 'Target', 'Variance'],
        data: []
      }
    ]
  },
  {
    id: 'tax-report',
    title: 'Tax Report',
    subtitle: 'Taxation ledgers and summaries',
    icon: FaFileInvoice,
    color: '#3B82F6', // Blue
    gradient: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)',
    bgLight: 'rgba(59, 130, 246, 0.04)',
    reports: [
      {
        id: 'tax-datawise-summary',
        name: 'Tax Register (Detailed)',
        desc: 'Detailed ledger of transaction tax collections (CGST, SGST, IGST, VAT).',
        kpis: [],
        columns: [
          'BILL DATE', 'BILL No.', 'GROSS AMT.', 'TAXABLE AMT.', 'NON-TAXABLE AMT.', 'DISCOUNT',
          'CGST 2.5%', 'SGST 2.5%', 'CGST 6.0%', 'SGST 6.0%', 'CGST 9.0%', 'SGST 9.0%',
          'CGST 14.0%', 'SGST 14.0%', 'IGST', 'CESS', 'VAT', 'Add. Amt.', 'SERVICE CHARGE', 'ROUND OFF', 'NET AMOUNT'
        ],
        data: []
      },
      {
        id: 'taxwise-summary',
        name: 'Tax Summary Datewise',
        desc: 'Daily summaries of transaction tax collections (CGST, SGST, IGST, VAT).',
        kpis: [],
        columns: [
          'DATE', 'BILL No.', 'GROSS AMT.', 'TAXABLE AMT.', 'NON TAXABLE AMT.', 'DISCOUNT',
          'SGST', 'CGST', 'IGST', 'CESS', 'VAT', 'SERVICE CHARGE', 'S.C(SGST)', 'S.C(SGST)', 'ROUND OFF', 'NET AMOUNT'
        ],
        data: []
      }
    ]
  },
  {
    id: 'kot-report',
    title: 'KOT Report',
    subtitle: 'Kitchen logs and pending orders',
    icon: FaUtensils,
    color: '#8B5CF6', // Purple
    gradient: 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)',
    bgLight: 'rgba(139, 92, 246, 0.04)',
    reports: [
      {
        id: 'kot-register',
        name: 'KOT Register',
        desc: 'General log of kitchen order tickets issued.',
        kpis: [],
        columns: [
          'Date', 'KOT No.', 'Bill No.', 'Time', 'Steward', 'Table No.', 'Item', 'Qty.', 'Rate', 'Amount', 'Void', 'Reason', 'NC KOT', 'Remarks', 'User'
        ],
        data: []
      },
      {
        id: 'nc-kot',
        name: 'NC KOT(Bill Report)(Detailed)',
        desc: 'NC (Non-Chargeable / Complimentary) KOT details per outlet and date.',
        kpis: [],
        columns: ['S.No.', 'KOT/Bill No.', 'Table/Room', 'Date', 'Item', 'Remarks', 'Cust. Remarks', 'Qty.', 'Rate', 'Amount'],
        data: []
      },
      {
        id: 'pending-kot-report',
        name: 'Pending KOT Report',
        desc: 'Currently active or delayed KOT orders not yet served.',
        kpis: [],
        columns: ['Date', 'KOT No.', 'Time', 'Steward', 'Table No.', 'Item', 'Qty.', 'Rate', 'Amount', 'User'],
        data: []
      }
    ]
  },
  {
    id: 'cashier-settlement',
    title: 'Cashier Settlement',
    subtitle: 'Shift receipts and collection history',
    icon: FaHistory,
    color: '#EF4444', // Red
    gradient: 'linear-gradient(135deg, #EF4444 0%, #F87171 100%)',
    bgLight: 'rgba(239, 68, 68, 0.04)',
    reports: [
      {
        id: 'cashier-settlement-summarized',
        name: 'Cashier Settlement Report(Detailed)',
        desc: 'Cashier end-of-shift receipts collection detail register.',
        kpis: [],
        columns: ['S.No.', 'Bill Date', 'Bill No.', 'Bill Amount', 'Date', 'Pay Type', 'GRCNo', 'Party Name', 'Paid Amount', 'user Name'],
        data: []
      },
      {
        id: 'userwise-collection-report',
        name: 'User Wise Collection Report(Summary)',
        desc: 'Receipt collections categorized by active POS User profile.',
        kpis: [],
        columns: ['USER NAME', 'BILL AMT.', 'Cash In Hand', 'ROOM SETTLEMENT', 'NET CASH'],
        data: []
      }
    ]
  },
  {
    id: 'customer-report',
    title: 'Customer Report',
    subtitle: 'Customer visits and demographic details',
    icon: FaExchangeAlt,
    color: '#EC4899', // Pink
    gradient: 'linear-gradient(135deg, #EC4899 0%, #F472B6 100%)',
    bgLight: 'rgba(236, 72, 153, 0.04)',
    reports: [
      {
        id: 'customer-info-report',
        name: 'Customer Info Report',
        desc: 'Guest loyalty registers, mobile contacts, and VIP tags database.',
        kpis: [],
        columns: ['Customer Name', 'Mobile', 'Type', 'Visits Count', 'Last Visit'],
        data: []
      },
      {
        id: 'customer-outlet-visit-report',
        name: 'Customer Outlet Visit Report',
        desc: 'Track frequency of guest visits across specific outlets (Cafe, Restaurant, Bar).',
        kpis: [],
        columns: ['Customer Name', 'Mobile', 'Main Restaurant', 'Bar Outlet', 'Cafe Outlet'],
        data: []
      }
    ]
  }
];
