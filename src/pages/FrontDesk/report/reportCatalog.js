import { 
  FaExchangeAlt, FaMoneyBillWave, FaCalendarAlt, FaChartBar, FaFileInvoice, FaHistory 
} from 'react-icons/fa';

export const REPORT_CATALOG = [
  {
    id: 'arrival-departure',
    title: 'Arrival & Departure',
    subtitle: 'Guest traffic and check registers',
    icon: FaExchangeAlt,
    color: '#0D9488', // Teal
    gradient: 'linear-gradient(135deg, #0D9488 0%, #14B8A6 100%)',
    bgLight: 'rgba(13, 148, 136, 0.04)',
    reports: [
      { 
        id: 'check-in-guest-detail', 
        name: 'Check In Guest Detail', 
        desc: 'Detailed register of active checked-in guests containing ID verifications and stay information.',
        kpis: [ { label: 'Active Checked In', value: '48 Guests' }, { label: 'VIP Stays', value: '6 Guests' } ],
        columns: ['Room', 'Guest Name', 'Mobile', 'Arrival Date', 'Departure Date', 'OTA / Agent', 'ID Type'],
        data: [
          { c1: '104', c2: 'PRAMOD MISHRA', c3: '+91 77788 91234', c4: '29 Jun 2026', c5: '30 Jun 2026', c6: 'SELF', c7: 'Passport' },
          { c1: '201', c2: 'Sarah Wilson', c3: '+91 91234 56789', c4: '26 Jun 2026', c5: '29 Jun 2026', c6: 'Direct', c7: 'Passport' },
          { c1: '301', c2: 'Robert Taylor', c3: '+91 99999 88888', c4: '26 Jun 2026', c5: '05 Jul 2026', c6: 'Agent', c7: 'Driving License' },
          { c1: '202', c2: 'David Miller', c3: '+1 570-555-0156', c4: '27 Jun 2026', c5: '30 Jun 2026', c6: 'Website', c7: 'Passport' },
        ]
      },
      { 
        id: 'check-in-register', 
        name: 'Check In Register', 
        desc: 'General chronological register of all PMS check-ins over a selected time span.',
        kpis: [ { label: 'Total Check-Ins', value: '142 Rooms' }, { label: 'Group Bookings', value: '14 Stays' } ],
        columns: ['GRC #', 'Room #', 'Guest Name', 'Pax', 'Pkg Plan', 'Arrival Time', 'Company'],
        data: [
          { c1: 'GRC-119', c2: '104', c3: 'PRAMOD MISHRA', c4: '2 Adults', c5: 'CP STANDARD', c6: '07:05 AM', c7: 'Self' },
          { c1: 'GRC-120', c2: '201', c3: 'Sarah Wilson', c4: '1 Adult', c5: 'MAP DELUXE', c6: '11:30 AM', c7: 'Direct' },
          { c1: 'GRC-122', c2: '301', c3: 'Robert Taylor', c4: '2 Adults', c5: 'AP SUITE', c6: '02:00 PM', c7: 'Agent' },
        ]
      },
      { 
        id: 'room-check-out-report', 
        name: 'Room Check Out Report', 
        desc: 'Departures summary list with final bill amounts and cashier collection flags.',
        kpis: [ { label: 'Completed Stays', value: '98 Rooms' }, { label: 'Late Checkouts', value: '4 Rooms' } ],
        columns: ['Room', 'Guest Name', 'Departure Time', 'Total Invoiced', 'Receipt Amount', 'Cashier'],
        data: [
          { c1: '102', c2: 'Emma Johnson', c3: '11:00 AM', c4: '₹8,500', c5: '₹8,500', c6: 'Admin' },
          { c1: '105', c2: 'Michael Brown', c3: '12:15 PM', c4: '₹4,200', c5: '₹4,200', c6: 'FrontOffice-2' },
        ]
      },
      { 
        id: 'state-city-wise-check-in', 
        name: 'State City Wise Check In Register', 
        desc: 'Demographic guest analysis sorted by state and city origins for hospitality tax records.',
        kpis: [ { label: 'Local States', value: '82%' }, { label: 'International', value: '18%' } ],
        columns: ['Guest Name', 'State', 'City', 'Country', 'Stay Duration', 'Room #'],
        data: [
          { c1: 'PRAMOD MISHRA', c2: 'Gujarat', c3: 'Ahmedabad', c4: 'India', c5: '2 Nights', c6: '104' },
          { c1: 'Sarah Wilson', c2: 'California', c3: 'San Francisco', c4: 'USA', c5: '3 Nights', c6: '201' },
          { c1: 'Amit Sharma', c2: 'Maharashtra', c3: 'Mumbai', c4: 'India', c5: '5 Nights', c6: '102' },
        ]
      },
      { 
        id: 'check-out-register', 
        name: 'Check Out Register', 
        desc: 'Audit record of all checked-out transactions and settlement status.',
        kpis: [ { label: 'Settled Stays', value: '94 Bills' }, { label: 'Unsettled Ledger', value: '4 Bills' } ],
        columns: ['Bill #', 'GRC #', 'Guest Name', 'Room #', 'Departure Date', 'Settled via'],
        data: [
          { c1: 'BL-9801', c2: '119', c3: 'PRAMOD MISHRA', c4: '104', c5: '30 Jun 2026', c6: 'Cash' },
          { c1: 'BL-9802', c2: '114', c3: 'James Wilson', c4: '302', c5: '30 Jun 2026', c6: 'Visa Card' },
        ]
      },
      { 
        id: 'business-source-report', 
        name: 'Business Source Report', 
        desc: 'In-house stays metrics broken down by segment and booking source.',
        kpis: [ { label: 'OTA Bookings', value: '52%' }, { label: 'Direct Checkin', value: '38%' } ],
        columns: ['Source', 'Bookings Count', 'Nights Sold', 'Room Revenue', 'ADR Value', 'Percentage'],
        data: [
          { c1: 'Booking.com', c2: '42 Stays', c3: '84 Nights', c4: '₹2,94,000', c5: '₹3,500', c6: '29.58%' },
          { c1: 'Expedia', c2: '28 Stays', c3: '56 Nights', c4: '₹1,96,000', c5: '₹3,500', c6: '19.72%' },
          { c1: 'Direct Desk', c2: '54 Stays', c3: '108 Nights', c4: '₹3,78,000', c5: '₹3,500', c6: '38.02%' },
        ]
      },
      { 
        id: 'guest-health-checkup', 
        name: 'Guest Health Check Up Report', 
        desc: 'Logs of guest medical check-ups, temperature scans, and compliance certifications.',
        kpis: [ { label: 'Scanned Stays', value: '184 Guests' }, { label: 'Clearance Status', value: '100% Clear' } ],
        columns: ['Guest Name', 'Room #', 'Temp (°F)', 'Symptom Flag', 'Check By', 'Timestamp'],
        data: [
          { c1: 'PRAMOD MISHRA', c2: '104', c3: '98.2°F', c4: 'No', c5: 'Reception-A', c6: '29 Jun 08:30 AM' },
          { c1: 'Sarah Wilson', c2: '201', c3: '97.9°F', c4: 'No', c5: 'Reception-A', c6: '26 Jun 12:45 PM' },
        ]
      }
    ]
  },
  {
    id: 'revenue-collection',
    title: 'Revenue & Collection',
    subtitle: 'Daily cashflow and tax ledgers',
    icon: FaMoneyBillWave,
    color: '#7C3AED', // Violet
    gradient: 'linear-gradient(135deg, #7C3AED 0%, #A78BFA 100%)',
    bgLight: 'rgba(124, 58, 237, 0.04)',
    reports: [
      { 
        id: 'collection-register', 
        name: 'Collection Register', 
        desc: 'Comprehensive cashier log of hotel payments received grouped by payment modes.',
        kpis: [ { label: 'Cash Collected', value: '₹48,200' }, { label: 'UPI/Card Logs', value: '₹94,300' } ],
        columns: ['Receipt #', 'Date', 'Guest Name', 'Payment Mode', 'Amount', 'Settled For', 'Cashier'],
        data: [
          { c1: 'RCP-5501', c2: '29 Jun 2026', c3: 'PRAMOD MISHRA', c4: 'UPI GPay', c5: '₹4,200', c6: 'Folio Checkin', c7: 'Admin' },
          { c1: 'RCP-5502', c2: '30 Jun 2026', c3: 'Sarah Wilson', c4: 'Credit Card', c5: '₹12,000', c6: 'Settlement', c7: 'FrontOffice-1' },
          { c1: 'RCP-5503', c2: '30 Jun 2026', c3: 'Vikram Malhotra', c4: 'Cash', c5: '₹3,500', c6: 'Advance Deposit', c7: 'Admin' },
        ]
      },
      { 
        id: 'settlement-report', 
        name: 'Settlement Report', 
        desc: 'Reconciles guest folios, settlement balances, and pending collection entries.',
        kpis: [ { label: 'Total Settled', value: '₹1,37,800' }, { label: 'Pending Ledger', value: '₹4,700' } ],
        columns: ['Folio #', 'Room #', 'Guest Name', 'Total Bill', 'Paid Amount', 'Due Balance', 'Status'],
        data: [
          { c1: 'FL-220', c2: '104', c3: 'PRAMOD MISHRA', c4: '₹4,200', c5: '₹3,000', c6: '₹1,200', c7: 'Partially Paid' },
          { c1: 'FL-215', c2: '305', c3: 'Vikram Malhotra', c4: '₹15,500', c5: '₹12,000', c6: '₹3,500', c7: 'Partially Paid' },
          { c1: 'FL-218', c2: '201', c3: 'Sarah Wilson', c4: '₹8,500', c5: '₹8,500', c6: '₹0', c7: 'Fully Paid' },
        ]
      },
      { 
        id: 'bill-to-company-report', 
        name: 'Bill to Company Report', 
        desc: 'Audit trail of corporate stays where bills are forwarded directly to registered companies.',
        kpis: [ { label: 'Company Credit', value: '₹85,400' }, { label: 'Active Corporate', value: '8 Accounts' } ],
        columns: ['Company Name', 'Guest Name', 'Room #', 'Duration', 'Invoiced amount', 'Corporate PO #'],
        data: [
          { c1: 'Tech Corp India', c2: 'Amit Sharma', c3: '102', c4: '4 Nights', c5: '₹14,000', c6: 'PO-TC-8802' },
          { c1: 'XYZ Solutions Ltd', c2: 'Rahul Singh', c3: '203', c4: '3 Nights', c5: '₹10,500', c6: 'PO-XYZ-1120' },
        ]
      },
      { 
        id: 'tax-register', 
        name: 'Tax Register', 
        desc: 'Calculates taxable values and applicable GST margins for external tax filing.',
        kpis: [ { label: 'CGST 9%', value: '₹12,825' }, { label: 'SGST 9%', value: '₹12,825' } ],
        columns: ['Invoice #', 'Date', 'Taxable Room Rent', 'CGST Amount', 'SGST Amount', 'Tax Percentage', 'Total Bill'],
        data: [
          { c1: 'INV-4412', c2: '29 Jun 2026', c3: '₹3,500', c4: '₹315', c5: '₹315', c6: '18% GST', c7: '₹4,130' },
          { c1: 'INV-4413', c2: '30 Jun 2026', c3: '₹7,210', c4: '₹649', c5: '₹649', c6: '18% GST', c7: '₹8,508' },
        ]
      },
      { 
        id: 'user-wise-collection', 
        name: 'User Wise Collection Report', 
        desc: 'Tracks cash, cards, and online collections categorized by logging PMS user ID.',
        kpis: [ { label: 'Admin (Cashier)', value: '₹84,500' }, { label: 'FrontDesk-1', value: '₹58,000' } ],
        columns: ['User Name', 'Role', 'Cash Collection', 'Card Collection', 'UPI Collection', 'Total Collected'],
        data: [
          { c1: 'Admin Manager', c2: 'Super Admin', c3: '₹45,000', c4: '₹24,500', c5: '₹15,000', c6: '₹84,500' },
          { c1: 'Neha Sen', c2: 'Receptionist', c3: '₹12,000', c4: '₹36,000', c5: '₹10,000', c6: '₹58,000' },
        ]
      },
      { 
        id: 'day-collection-report', 
        name: 'Day Collection Report', 
        desc: 'End-of-day summary of cashier checkouts and active drawer cash totals.',
        kpis: [ { label: 'Today Collections', value: '₹1,42,500' }, { label: 'Petty Cash Out', value: '₹2,500' } ],
        columns: ['Log ID', 'Cashier', 'Opening Cash', 'Receipts Total', 'Payouts', 'Closing Balance', 'Status'],
        data: [
          { c1: 'LOG-770', c2: 'Admin Manager', c3: '₹5,000', c4: '₹84,500', c5: '₹1,200', c6: '₹88,300', c7: 'Closed' },
          { c1: 'LOG-771', c2: 'Neha Sen', c3: '₹5,000', c4: '₹58,000', c5: '₹1,300', c6: '₹61,700', c7: 'Closed' },
        ]
      },
      { 
        id: 'cumulative-collection', 
        name: 'Cumulative Collection Report', 
        desc: 'Overview of monthly accumulative collections and performance averages.',
        kpis: [ { label: 'M-T-D Revenue', value: '₹4.82 Lakh' }, { label: 'ADR Average', value: '₹3,650' } ],
        columns: ['Month Cycle', 'Total Rooms Sold', 'ADR', 'Room Revenue', 'F&B Revenue', 'Grand Collection'],
        data: [
          { c1: 'June 2026', c2: '284 Nights', c3: '₹3,500', c4: '₹9,94,000', c5: '₹2,42,000', c6: '₹12,36,000' },
          { c1: 'May 2026', c2: '272 Nights', c3: '₹3,450', c4: '₹9,38,400', c5: '₹2,10,000', c6: '₹11,48,400' },
        ]
      },
      { 
        id: 'date-wise-room-revenue', 
        name: 'Date Wise Room Revenue Report', 
        desc: 'Calculates day-by-day room tariff totals and ADR indicators.',
        kpis: [ { label: 'Highest Revenue Day', value: '29 Jun' }, { label: 'Occupancy Rate', value: '85.00%' } ],
        columns: ['Stay Date', 'Total Rooms Available', 'Rooms Occupied', 'Occupancy %', 'Room Sales', 'ADR Value'],
        data: [
          { c1: '29 Jun 2026', c2: '120 Rooms', c3: '102 Rooms', c4: '85.00%', c5: '₹3,57,000', c6: '₹3,500' },
          { c1: '28 Jun 2026', c2: '120 Rooms', c3: '96 Rooms', c4: '80.00%', c5: '₹3,36,000', c6: '₹3,500' },
        ]
      },
      { 
        id: 'service-charge-report', 
        name: 'Service Charge Report', 
        desc: 'Billed service fees for travel desks, dining, and extra room services.',
        kpis: [ { label: 'Total Service Charges', value: '₹8,420' }, { label: 'F&B Charges', value: '₹5,110' } ],
        columns: ['Bill #', 'Guest Name', 'Amenities Category', 'Taxable Val', 'Service Charge (5%)', 'Total Charge'],
        data: [
          { c1: 'BL-9801', c2: 'PRAMOD MISHRA', c3: 'Room Dinning', c4: '₹800', c5: '₹40', c6: '₹840' },
          { c1: 'BL-9804', c2: 'Sarah Wilson', c3: 'Travel Desk', c4: '₹1,500', c5: '₹75', c6: '₹1,575' },
        ]
      },
      { 
        id: 'expense-report', 
        name: 'Expense Report', 
        desc: 'Audits daily operating expenditures and payouts paid via petty cash.',
        kpis: [ { label: 'Total Operating Expense', value: '₹12,450' }, { label: 'Office Supplies', value: '₹4,200' } ],
        columns: ['Voucher #', 'Date', 'Expense Category', 'Paid To', 'Approved By', 'Amount', 'Payment Mode'],
        data: [
          { c1: 'EXP-104', c2: '29 Jun 2026', c3: 'Office Stationary', c4: 'Shree Printers', c5: 'Manager', c6: '₹1,200', c7: 'Petty Cash' },
          { c1: 'EXP-105', c2: '30 Jun 2026', c3: 'Housekeeping Laundry', c4: 'Clean laundry Services', c5: 'Admin', c6: '₹4,800', c7: 'UPI Gpay' },
        ]
      }
    ]
  },
  {
    id: 'reservation',
    title: 'Reservation Stays',
    subtitle: 'Booking cycles and deposit tracks',
    icon: FaCalendarAlt,
    color: '#2563EB', // Blue
    gradient: 'linear-gradient(135deg, #2563EB 0%, #60A5FA 100%)',
    bgLight: 'rgba(37, 99, 235, 0.04)',
    reports: [
      { 
        id: 'advance-refund-report', 
        name: 'Advance / Refund Report', 
        desc: 'Audits prepayment deposits and refund receipts for reservations.',
        kpis: [ { label: 'Total Advance Held', value: '₹34,500' }, { label: 'Refunds Released', value: '₹4,200' } ],
        columns: ['Booking #', 'Guest Name', 'Stay Dates', 'Advance Paid', 'Refund Amount', 'Date Filed', 'Payment Status'],
        data: [
          { c1: '#551', c2: 'Amit Sharma', c3: '27 Jun - 30 Jun', c4: '₹3,500', c5: '₹0', c6: '25 Jun 2026', c7: 'Advance Held' },
          { c1: '#554', c2: 'Priya Patel', c3: '28 Jun - 02 Jul', c4: '₹10,000', c5: '₹2,000', c6: '26 Jun 2026', c7: 'Partially Refunded' },
        ]
      }
    ]
  },
  {
    id: 'occupancy-analysis',
    title: 'Occupancy Analysis',
    subtitle: 'Stays metrics and ADR audits',
    icon: FaChartBar,
    color: '#D97706', // Amber
    gradient: 'linear-gradient(135deg, #D97706 0%, #FBBF24 100%)',
    bgLight: 'rgba(217, 119, 6, 0.04)',
    reports: [
      { 
        id: 'occupancy-report-monthly', 
        name: 'Occupancy Report Monthly', 
        desc: 'Monthly summary analytics showing total occupancy, RevPAR, and room nights sold.',
        kpis: [ { label: 'Nights Sold', value: '2,820 Nights' }, { label: 'RevPAR Average', value: '₹2,880' } ],
        columns: ['Month Cycle', 'Total Stays Capacity', 'Sold Room Nights', 'Occupancy Rate', 'RevPAR Value', 'Total Room Revenue'],
        data: [
          { c1: 'June 2026', c2: '3,600 Room-Nights', c3: '2,820 Nights', c4: '78.33%', c5: '₹2,880', c6: '₹10,36,800' },
          { c1: 'May 2026', c2: '3,720 Room-Nights', c3: '2,710 Nights', c4: '72.84%', c5: '₹2,640', c6: '₹9,82,000' },
        ]
      },
      { 
        id: 'occupancy-report', 
        name: 'Occupancy Report', 
        desc: 'Calculates active guest list counts and room occupancy grids.',
        kpis: [ { label: 'In House Guests', value: '48 Guests' }, { label: 'Active Occupancy', value: '82.50%' } ],
        columns: ['Room #', 'Category', 'Floor', 'Guest Name', 'Arrival Date', 'Departure Date', 'Status'],
        data: [
          { c1: '101', c2: 'Standard Room', c3: 'Ground', c4: 'John Smith', c5: '28 Jun 2026', c6: '01 Jul 2026', c7: 'Occupied' },
          { c1: '104', c2: 'Deluxe Room', c3: 'Ground', c4: 'PRAMOD MISHRA', c5: '29 Jun 2026', c6: '30 Jun 2026', c7: 'Occupied' },
          { c1: '201', c2: 'Executive Suite', c3: '1st Floor', c4: 'Sarah Wilson', c5: '26 Jun 2026', c6: '29 Jun 2026', c7: 'Occupied' },
        ]
      },
      { 
        id: 'night-audit-report', 
        name: 'Night Audit Report', 
        desc: 'EOD PMS validation check reporting cashier closures and system syncs.',
        kpis: [ { label: 'Sync Status', value: 'Verified' }, { label: 'Revenue Posted', value: '₹1,42,500' } ],
        columns: ['Task Audit Item', 'Run Timestamp', 'Status Code', 'Errors Logged', 'Operator', 'Action Verified'],
        data: [
          { c1: 'Room Rent Posting', c2: '12:05 AM 30 Jun', c3: 'OK', c4: '0 Errors', c5: 'System Scheduler', c6: 'Auto Posted' },
          { c1: 'Cashier Settlement Sync', c2: '12:10 AM 30 Jun', c3: 'OK', c4: '0 Errors', c5: 'Night Auditor Manager', c6: 'Manual Audit Closed' },
        ]
      },
      { 
        id: 'day-room-wise-occupancy', 
        name: 'Day Room Wise Occupancy Report', 
        desc: 'Occupancy checklist of all rooms for room assignments.',
        kpis: [ { label: 'Occupied Rooms', value: '96 Rooms' }, { label: 'Vacant Rooms', value: '24 Rooms' } ],
        columns: ['Room #', 'Room Type', 'Floor Location', 'Occupancy State', 'Clean State', 'Next Expected Arrival'],
        data: [
          { c1: '101', c2: 'Standard Room', c3: 'Ground', c4: 'Occupied', c5: 'Clean', c6: 'Tomorrow 12:00 PM' },
          { c1: '102', c2: 'Deluxe Room', c3: 'Ground', c4: 'Vacant', c5: 'Clean', c6: 'Today 02:00 PM' },
          { c1: '103', c2: 'Executive Suite', c3: 'Ground', c4: 'Vacant', c5: 'Dirty', c6: 'Today 04:30 PM' },
        ]
      },
      { 
        id: 'day-room-category-occupancy', 
        name: 'Day Room Category Wise Occupancy', 
        desc: 'Category-wise occupancy percentage breakdown and room nights sold.',
        kpis: [ { label: 'Suite Occupancy', value: '88%' }, { label: 'Deluxe Occupancy', value: '82%' } ],
        columns: ['Category Code', 'Total Rooms Staged', 'Rooms Occupied', 'Occupancy Percentage', 'Revenue Invoiced', 'ADR Score'],
        data: [
          { c1: 'Standard Room', c2: '40 Rooms', c3: '32 Rooms', c4: '80.00%', c5: '₹96,000', c6: '₹3,000' },
          { c1: 'Deluxe Room', c2: '50 Rooms', c3: '41 Rooms', c4: '82.00%', c5: '₹1,64,000', c6: '₹4,000' },
          { c1: 'Executive Suite', c2: '30 Rooms', c3: '23 Rooms', c4: '76.67%', c5: '₹1,38,000', c6: '₹6,000' },
        ]
      },
      { 
        id: 'company-wise-guest-analysis', 
        name: 'Company Wise Guest Analysis Report', 
        desc: 'Stays analysis of corporate client guests sorted by company ID.',
        kpis: [ { label: 'Corporate Share', value: '38%' }, { label: 'Nights Booked', value: '482 Room-Nights' } ],
        columns: ['Corporate Client Name', 'Total Guests Checked In', 'Average Stays Length', 'Nights Billed', 'Revenue Contribution'],
        data: [
          { c1: 'Tech Corp India Pvt Ltd', c2: '14 Guests', c3: '4.5 Nights', c4: '63 Nights', c5: '₹2,52,000' },
          { c1: 'XYZ Solutions Ltd', c2: '8 Guests', c3: '3.0 Nights', c4: '24 Nights', c5: '₹96,000' },
        ]
      },
      { 
        id: 'room-status-report', 
        name: 'Room Status Report', 
        desc: 'Comprehensive check list of all physical rooms and housekeeping flags.',
        kpis: [ { label: 'Ready to Check In', value: '74 Rooms' }, { label: 'Out of Order', value: '4 Rooms' } ],
        columns: ['Room #', 'Room Type', 'Housekeeping State', 'Occupancy State', 'Attendant Assigned', 'Last Inspected'],
        data: [
          { c1: '101', c2: 'Standard Room', c3: 'Clean', c4: 'Occupied', c5: 'Karan Singh', c6: '29 Jun 11:30 AM' },
          { c1: '102', c2: 'Standard Room', c3: 'Clean', c4: 'Vacant', c5: 'Karan Singh', c6: '29 Jun 12:00 PM' },
          { c1: '103', c2: 'Standard Room', c3: 'Dirty', c4: 'Vacant', c5: 'Neha Sharma', c6: 'Pending Clean' },
        ]
      },
      { 
        id: 'guest-analysis-report', 
        name: 'Guest Analysis Report', 
        desc: 'Demographic audit logs of guest age brackets, locations, and visit frequency.',
        kpis: [ { label: 'Repeat Guests', value: '24.5%' }, { label: 'Domestic Guests', value: '82%' } ],
        columns: ['Guest Demographic Bracket', 'Registered Stays', 'Nights Booked', 'Revenue Share %', 'Average Bill Spend'],
        data: [
          { c1: 'Age 25-34 Bracket', c2: '84 Stays', c3: '168 Nights', c4: '38.5%', c5: '₹8,420' },
          { c1: 'Age 35-50 Bracket', c2: '62 Stays', c3: '124 Nights', c4: '32.1%', c5: '₹12,450' },
        ]
      }
    ]
  },
  {
    id: 'gstr',
    title: 'GSTR Filing',
    subtitle: 'Tax compliant returns exports',
    icon: FaFileInvoice,
    color: '#DC2626', // Red
    gradient: 'linear-gradient(135deg, #DC2626 0%, #F87171 100%)',
    bgLight: 'rgba(220, 38, 38, 0.04)',
    reports: [
      { 
        id: 'gstr-1', 
        name: 'GSTR-1', 
        desc: 'B2C and B2B outward invoice lists generated for CGST/SGST return filings.',
        kpis: [ { label: 'Filed Invoices', value: '142 Invoices' }, { label: 'GST Collected', value: '₹25,650' } ],
        columns: ['Invoice #', 'Guest GSTIN', 'Place of Supply', 'Taxable Value', 'Integrated GST', 'Central GST', 'State GST'],
        data: [
          { c1: 'INV-4412', c2: '27AAAAA1111A1Z1', c3: 'Maharashtra', c4: '₹3,500', c5: '₹0', c6: '₹315', c7: '₹315' },
          { c1: 'INV-4415', c2: 'URD (Unregistered)', c3: 'Gujarat', c4: '₹7,210', c5: '₹1,298', c6: '₹0', c7: '₹0' },
        ]
      },
      { 
        id: 'gst-3b', 
        name: 'GST 3B', 
        desc: 'Reconciles monthly output tax liability, ITC eligibility, and actual tax paid values.',
        kpis: [ { label: 'Eligible ITC Credit', value: '₹4,820' }, { label: 'Net Liability Paid', value: '₹20,830' } ],
        columns: ['Tax Period', 'Total Outward Supplies', 'Output Tax CGST', 'Output Tax SGST', 'Output IGST', 'Tax Paid Cash'],
        data: [
          { c1: 'June 2026', c2: '₹9,94,000', c3: '₹12,825', c4: '₹12,825', c5: '₹8,420', c6: '₹20,830' },
          { c1: 'May 2026', c2: '₹9,38,400', c3: '₹11,480', c4: '₹11,480', c5: '₹7,200', c6: '₹18,650' },
        ]
      },
      { 
        id: 'gst-b2b', 
        name: 'GST B2B', 
        desc: 'Filter ledger containing corporate invoice GSTIN declarations for claiming ITC credits.',
        kpis: [ { label: 'B2B Invoices', value: '18 Bills' }, { label: 'Corporate GSTINs', value: '8 Accounts' } ],
        columns: ['GSTIN Name', 'PO / Invoice #', 'Taxable Val', 'GST rate', 'Central Tax', 'State Tax', 'Total Invoiced'],
        data: [
          { c1: 'Tech Corp India (27AAACT8802R1Z2)', c2: 'INV-4412', c3: '₹14,000', c4: '18% GST', c5: '₹1,260', c6: '₹1,260', c7: '₹16,520' },
          { c1: 'XYZ Solutions (27BBBCY1120K1Z5)', c2: 'INV-4420', c3: '₹10,500', c4: '18% GST', c5: '₹945', c6: '₹945', c7: '₹12,390' },
        ]
      }
    ]
  },
  {
    id: 'log-report',
    title: 'Log Reports',
    subtitle: 'Activity feeds and profile changes',
    icon: FaHistory,
    color: '#DB2777', // Pink
    gradient: 'linear-gradient(135deg, #DB2777 0%, #F472B6 100%)',
    bgLight: 'rgba(219, 39, 119, 0.04)',
    reports: [
      { 
        id: 'change-guest-profile', 
        name: 'Change Guest Profile Log', 
        desc: 'Audit trail of receptionist edits made to stored guest metadata profiles.',
        kpis: [ { label: 'Edits Tracked', value: '24 logs' }, { label: 'Updated Profiles', value: '18 Guests' } ],
        columns: ['Log ID', 'Profile ID', 'Guest Name', 'Field Modified', 'Old Value', 'New Value', 'Operator'],
        data: [
          { c1: 'LOG-304', c2: 'G-8802', c3: 'John Smith', c4: 'Mobile Number', c5: '+91 99999 00000', c6: '+91 98765 43210', c7: 'Admin Manager' },
          { c1: 'LOG-305', c2: 'G-8815', c3: 'Sarah Wilson', c4: 'ID Document', c5: 'Driving License', c6: 'Passport No: A8801', c7: 'Reception-2' },
        ]
      },
      { 
        id: 'room-change-entry-report', 
        name: 'Room Change Entry Report', 
        desc: 'Tracks cashier/attendant activity logs for room change requests.',
        kpis: [ { label: 'Upgrades Approved', value: '4 Rooms' }, { label: 'Cash Differences', value: '₹2,500' } ],
        columns: ['Move Date', 'Guest Name', 'Old Room #', 'New Room #', 'Rate Charge Difference', 'Reason / Remarks', 'Operator'],
        data: [
          { c1: '29 Jun 10:30 AM', c2: 'Amit Sharma', c3: '101 (Standard)', c4: '202 (Deluxe)', c5: '₹1,000 / Night', c6: 'AC not cooling in Room 101', c7: 'Admin Manager' },
          { c1: '30 Jun 11:15 AM', c2: 'Sarah Wilson', c3: '104 (Standard)', c4: '201 (Suite)', c5: '₹2,000 / Night', c6: 'VIP Upgrade requested', c7: 'Receptionist-A' },
        ]
      }
    ]
  }
];
