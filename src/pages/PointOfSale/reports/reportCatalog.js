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
        kpis: [ { label: 'Total Invoiced', value: '₹10,157.50' }, { label: 'Total Pax Served', value: '16' } ],
        columns: ['Invoice #', 'Date', 'Outlet', 'Covers (Pax)', 'Subtotal', 'Tax', 'Discount', 'Net Amount'],
        data: [
          { c1: 'INV-1001', c2: '14 Jul 2026', c3: 'Main Restaurant', c4: '4', c5: '₹1,200', c6: '₹60', c7: '₹0', c8: '₹1,260' },
          { c1: 'INV-1002', c2: '14 Jul 2026', c3: 'Banquet Hall', c4: '10', c5: '₹8,500', c6: '₹425', c7: '₹500', c8: '₹8,425' },
          { c1: 'INV-1003', c2: '14 Jul 2026', c3: 'Room Service', c4: '2', c5: '₹450', c6: '₹22.50', c7: '₹0', c8: '₹472.50' }
        ]
      },
      { 
        id: 'itemwise-sale', 
        name: 'Itemwise Sale', 
        desc: 'Itemized sales quantities and margins analysis.',
        kpis: [ { label: 'Top Item', value: 'Garlic Naan' }, { label: 'Total Sales', value: '₹11,800' } ],
        columns: ['Item Name', 'Item Group', 'Qty Sold', 'Unit Price', 'Total Sales Amount'],
        data: [
          { c1: 'Butter Chicken', c2: 'Food', c3: '12 Plates', c4: '₹450', c5: '₹5,400' },
          { c1: 'Garlic Naan', c2: 'Food', c3: '36 Pcs', c4: '₹100', c5: '₹3,600' },
          { c1: 'Jeera Rice', c2: 'Food', c3: '14 Bowls', c4: '₹200', c5: '₹2,800' }
        ]
      },
      { 
        id: 'itemwise-outletwise-sale', 
        name: 'Itemwise Outletwise Sale', 
        desc: 'Breakdown of item sales per individual outlet.',
        kpis: [ { label: 'Busiest Outlet', value: 'Main Restaurant' } ],
        columns: ['Outlet', 'Item Name', 'Qty Sold', 'Revenue'],
        data: [
          { c1: 'Main Restaurant', c2: 'Butter Chicken', c3: '8', c4: '₹3,600' },
          { c1: 'Room Service', c2: 'Butter Chicken', c3: '4', c4: '₹1,800' },
          { c1: 'Banquet Hall', c2: 'Garlic Naan', c3: '20', c4: '₹2,000' }
        ]
      },
      { 
        id: 'itemwise-categorywise-sale', 
        name: 'Itemwise Categorywise Sale', 
        desc: 'Breakdown of item sales per item categories (Veg, Non-Veg, Beverage).',
        kpis: [ { label: 'Top Category', value: 'Non-Veg' } ],
        columns: ['Category', 'Qty Sold', 'Total Revenue', 'Share %'],
        data: [
          { c1: 'Veg', c2: '58 Pcs', c3: '₹4,800', c4: '40.67%' },
          { c1: 'Non-Veg', c2: '24 Pcs', c3: '₹6,400', c4: '54.24%' },
          { c1: 'Beverage', c2: '15 Pcs', c3: '₹600', c4: '5.09%' }
        ]
      },
      { 
        id: 'tablewise-sale', 
        name: 'Tablewise Sale', 
        desc: 'Review revenue generation performance across restaurant tables.',
        kpis: [ { label: 'Highest Revenue Table', value: 'T2' } ],
        columns: ['Table No', 'Orders Count', 'Average Pax', 'Revenue Generated'],
        data: [
          { c1: 'T1', c2: '4 Orders', c3: '3', c4: '₹4,500' },
          { c1: 'T2', c2: '6 Orders', c3: '2', c4: '₹6,800' },
          { c1: 'T3', c2: '2 Orders', c3: '4', c4: '₹2,490' }
        ]
      },
      { 
        id: 'cover-analysis', 
        name: 'Cover Analysis Report', 
        desc: 'Pax cover count per hour and table occupancy efficiency rates.',
        kpis: [ { label: 'Avg Covers / Day', value: '107 Covers' } ],
        columns: ['Date', 'Meal Period', 'Covers Count', 'Occupancy Rate'],
        data: [
          { c1: '14 Jul 2026', c2: 'Lunch', c3: '42 Covers', c4: '78%' },
          { c1: '14 Jul 2026', c2: 'Dinner', c3: '65 Covers', c4: '92%' }
        ]
      },
      { 
        id: 'kitchen-time-gap', 
        name: 'Kitchen Time Gap Report', 
        desc: 'Time interval between KOT print and final kitchen preparation delivery.',
        kpis: [ { label: 'Average Preparation Time', value: '25 Mins' } ],
        columns: ['KOT #', 'KOT Time', 'Serve Time', 'Time Taken (Mins)', 'Variance'],
        data: [
          { c1: 'KOT-204', c2: '12:15 PM', c3: '12:35 PM', c4: '20 mins', c5: '-5 mins' },
          { c1: 'KOT-119', c2: '11:55 AM', c3: '12:25 PM', c4: '30 mins', c5: '+5 mins' }
        ]
      },
      { 
        id: 'stewardwise-sale', 
        name: 'Stewardwise Sale', 
        desc: 'Performance tracking of waiters and captains.',
        kpis: [ { label: 'Top Steward', value: 'Anita S.' } ],
        columns: ['Steward Name', 'Orders Serviced', 'Total Amount'],
        data: [
          { c1: 'Ravi K.', c2: '8 Orders', c3: '₹4,530' },
          { c1: 'Anita S.', c2: '12 Orders', c3: '₹7,820' },
          { c1: 'Suresh P.', c2: '6 Orders', c3: '₹3,400' }
        ]
      },
      { 
        id: 'flash-report', 
        name: 'Flash Report', 
        desc: 'Summarized operational metrics comparison checklist.',
        kpis: [ { label: 'Gross Margin', value: '68%' } ],
        columns: ['Metric', 'Today', 'Target', 'Variance'],
        data: [
          { c1: 'Gross Revenue', c2: '₹12,450', c3: '₹15,000', c4: '-17%' },
          { c1: 'Covers Count', c2: '107 Covers', c3: '100 Covers', c4: '+7%' }
        ]
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
        name: 'Tax Datawise Summary', 
        desc: 'Taxation totals breakdown (CGST, SGST, Cess) grouped per day.',
        kpis: [ { label: 'Average Tax Rate', value: '5%' } ],
        columns: ['Date', 'Taxable Amount', 'CGST Total', 'SGST Total', 'Gross Tax Collected'],
        data: [
          { c1: '14 Jul 2026', c2: '₹10,500', c3: '₹262.50', c4: '₹262.50', c5: '₹525' }
        ]
      },
      { 
        id: 'taxwise-summary', 
        name: 'Taxwise Summary', 
        desc: 'Summary collections sorted by Tax Rates (e.g. 5%, 12%, 18%).',
        kpis: [ { label: 'Highest Slab Revenue', value: '5%' } ],
        columns: ['Tax Slab', 'Taxable Sales', 'Tax Collected'],
        data: [
          { c1: '5% Slab', c2: '₹10,500', c3: '₹525' },
          { c1: '12% Slab', c2: '₹0', c3: '₹0' },
          { c1: '18% Slab', c2: '₹0', c3: '₹0' }
        ]
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
        kpis: [ { label: 'Total KOTs Issued', value: '24 KOTs' } ],
        columns: ['KOT #', 'Table', 'Steward', 'Time Stamp', 'Status'],
        data: [
          { c1: 'KOT-204', c2: 'T2', c3: 'Ravi K.', c4: '12:15 PM', c5: 'Served' },
          { c1: 'KOT-119', c2: 'T3', c3: 'Anita S.', c4: '11:55 AM', c5: 'Cooking' }
        ]
      },
      { 
        id: 'nc-kot', 
        name: 'NC KOT', 
        desc: 'NC (Non-Chargeable / Complimentary) KOT registers and details.',
        kpis: [ { label: 'NC KOTs Share', value: '4%' } ],
        columns: ['KOT #', 'NC Category', 'Authorizer', 'Items Count', 'Value (Est)'],
        data: [
          { c1: 'KOT-NC-41', c2: 'Management Complimentary', c3: 'MD Approval', c4: '3 Items', c5: '₹850' },
          { c1: 'KOT-NC-42', c2: 'Staff Welfare Meal', c3: 'Duty Hours', c4: '1 Item', c5: '₹120' }
        ]
      },
      { 
        id: 'pending-kot-report', 
        name: 'Pending KOT Report', 
        desc: 'Currently active or delayed KOT orders not yet served.',
        kpis: [ { label: 'Longest Pending KOT', value: '18 mins' } ],
        columns: ['KOT #', 'Table', 'Elapsed Time', 'Pending Items', 'Status'],
        data: [
          { c1: 'KOT-209', c2: 'T6', c3: '18 mins', c4: 'Paneer Butter Masala', c5: 'Sent to Kitchen' }
        ]
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
        name: 'Cashier Settlement Report Summarized', 
        desc: 'Cashier end-of-shift receipts collection and cash drawer verification.',
        kpis: [ { label: 'Discrepancy Variance', value: '₹0.00' } ],
        columns: ['Shift Code', 'Cashier Name', 'Cash Collected', 'Card Swipe', 'UPI Trans', 'Total Settled'],
        data: [
          { c1: 'Shift-A', c2: 'Zoya', c3: '₹4,500', c4: '₹2,400', c5: '₹3,250', c6: '₹10,150' }
        ]
      },
      { 
        id: 'userwise-collection-report', 
        name: 'Userwise Collection Report', 
        desc: 'Receipt collections categorized by active POS User profile.',
        kpis: [ { label: 'Average Discount / User', value: '₹125.00' } ],
        columns: ['User Name', 'Payments Count', 'Net Collections', 'Discounts Given'],
        data: [
          { c1: 'Admin', c2: '14 receipts', c3: '₹12,400', c4: '₹200' },
          { c1: 'Cashier-1', c2: '8 receipts', c3: '₹6,400', c4: '₹50' }
        ]
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
        kpis: [ { label: 'Active VIPs', value: '18 Customers' } ],
        columns: ['Customer Name', 'Mobile', 'Type', 'Visits Count', 'Last Visit'],
        data: [
          { c1: 'John Doe', c2: '+91 99887 76655', c3: 'VIP Guest', c4: '14 visits', c5: '12 Jul 2026' },
          { c1: 'Sarah Connor', c2: '+91 99999 88888', c3: 'Regular', c4: '6 visits', c5: '14 Jul 2026' }
        ]
      },
      { 
        id: 'customer-outlet-visit-report', 
        name: 'Customer Outlet Visit Report', 
        desc: 'Track frequency of guest visits across specific outlets (Cafe, Restaurant, Bar).',
        kpis: [ { label: 'Most Visited Outlet', value: 'Main Restaurant' } ],
        columns: ['Customer Name', 'Mobile', 'Main Restaurant', 'Bar Outlet', 'Cafe Outlet'],
        data: [
          { c1: 'John Doe', c2: '+91 99887 76655', c3: '10 times', c4: '4 times', c5: '0 times' },
          { c1: 'Sarah Connor', c2: '+91 99999 88888', c3: '3 times', c4: '0 times', c5: '3 times' }
        ]
      }
    ]
  }
];
