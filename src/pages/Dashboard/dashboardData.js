export const OCCUPANCY_ANALYSIS = [
  { desc: 'Total Rooms',       today: '30',    mtd: '900' },
  { desc: 'Rooms Sold',        today: '2',     mtd: '18' },
  { desc: 'Occupancy %',       today: '6.67',  mtd: '6.67' },
  { desc: 'Day Use',           today: '0',     mtd: '0' },
  { desc: 'Management Block',  today: '0',     mtd: '0' },
  { desc: 'FOM Bills Cancelled', today: '0',   mtd: '0' },
];

export const RECENT_BOOKINGS = [
  { no: 'BK-10029', date: '17-06-2026', name: 'Alice Smith',    avatar: 'https://i.pravatar.cc/40?img=1',  company: 'Microsoft',   arrDate: '18-06-2026', deptDate: '21-06-2026', category: 'Premium Deluxe King', plan: 'EP', pax: '2', status: 'Confirmed' },
  { no: 'BK-10030', date: '17-06-2026', name: 'David Miller',   avatar: 'https://i.pravatar.cc/40?img=3',  company: 'Google LLC',  arrDate: '19-06-2026', deptDate: '23-06-2026', category: 'Executive Suite',     plan: 'CP', pax: '1', status: 'Pending' },
  { no: 'BK-10031', date: '17-06-2026', name: 'Priya Sharma',   avatar: 'https://i.pravatar.cc/40?img=5',  company: 'Infosys',     arrDate: '20-06-2026', deptDate: '22-06-2026', category: 'Standard Twin',       plan: 'MAP', pax: '2', status: 'Confirmed' },
  { no: 'BK-10032', date: '17-06-2026', name: 'James Wilson',   avatar: 'https://i.pravatar.cc/40?img=7',  company: 'Self',        arrDate: '18-06-2026', deptDate: '19-06-2026', category: 'Deluxe King',         plan: 'EP', pax: '1', status: 'Pending' },
  { no: 'BK-10033', date: '17-06-2026', name: 'Sara Ahmed',     avatar: 'https://i.pravatar.cc/40?img=9',  company: 'TCS',         arrDate: '21-06-2026', deptDate: '25-06-2026', category: 'Junior Suite',        plan: 'CP', pax: '3', status: 'Confirmed' },
];

export const RECENT_CHECKINS = [
  { room: '104', name: 'John Doe',       avatar: 'https://i.pravatar.cc/40?img=11', pax: '2', grc: 'GRC-8902', company: 'Google Inc.', plan: 'CP',  arrDate: '17-06-2026', arrTime: '11:45 AM', amt: '₹4,500' },
  { room: '201', name: 'Meera Nair',     avatar: 'https://i.pravatar.cc/40?img=13', pax: '1', grc: 'GRC-8903', company: 'Self',        plan: 'EP',  arrDate: '17-06-2026', arrTime: '01:10 PM', amt: '₹3,200' },
  { room: '305', name: 'Carlos Ruiz',    avatar: 'https://i.pravatar.cc/40?img=15', pax: '2', grc: 'GRC-8904', company: 'IBM',         plan: 'MAP', arrDate: '17-06-2026', arrTime: '02:30 PM', amt: '₹5,800' },
  { room: '102', name: 'Aisha Patel',    avatar: 'https://i.pravatar.cc/40?img=17', pax: '1', grc: 'GRC-8905', company: 'Wipro',       plan: 'CP',  arrDate: '17-06-2026', arrTime: '03:00 PM', amt: '₹2,900' },
  { room: '410', name: 'Tom Bradley',    avatar: 'https://i.pravatar.cc/40?img=19', pax: '3', grc: 'GRC-8906', company: 'Deloitte',    plan: 'AP',  arrDate: '17-06-2026', arrTime: '04:15 PM', amt: '₹7,200' },
];

export const RECENT_CHECKOUTS = [
  { room: '102', name: 'Robert Johnson', avatar: 'https://i.pravatar.cc/40?img=21', pax: '1', billNo: 'BL-9801', company: 'Self Paid',  billAmt: '₹1,800', payMode: 'Visa Card' },
  { room: '203', name: 'Fatima Khan',    avatar: 'https://i.pravatar.cc/40?img=23', pax: '2', billNo: 'BL-9802', company: 'HCL',        billAmt: '₹6,400', payMode: 'UPI' },
  { room: '301', name: 'Raj Mehta',      avatar: 'https://i.pravatar.cc/40?img=25', pax: '1', billNo: 'BL-9803', company: 'Self',       billAmt: '₹3,100', payMode: 'Cash' },
  { room: '108', name: 'Emily Clarke',   avatar: 'https://i.pravatar.cc/40?img=27', pax: '2', billNo: 'BL-9804', company: 'Accenture',  billAmt: '₹9,200', payMode: 'Card' },
  { room: '405', name: 'Vikram Singh',   avatar: 'https://i.pravatar.cc/40?img=29', pax: '1', billNo: 'BL-9805', company: 'Self',       billAmt: '₹2,500', payMode: 'Cash' },
];

export const PENDING_HOUSEKEEPING = [
  { room: '102', type: 'Standard',  floor: '1st', status: 'Dirty',       assignedTo: 'Ravi Kumar',   priority: 'High' },
  { room: '202', type: 'Suite',     floor: '2nd', status: 'Dirty',       assignedTo: 'Sunita Devi',  priority: 'High' },
  { room: '104', type: 'Deluxe',   floor: '1st', status: 'Maintenance', assignedTo: 'Maintenance',  priority: 'Medium' },
  { room: '306', type: 'Executive', floor: '3rd', status: 'Dirty',       assignedTo: 'Unassigned',   priority: 'Low' },
  { room: '411', type: 'Deluxe',   floor: '4th', status: 'Dirty',       assignedTo: 'Priya Rao',    priority: 'Medium' },
];

export const RECENT_ORDERS = [
  { table: 'Table 05', kot: 'KOT-9021', item: 'Cappuccino Latte',   qty: 2, time: '12:30 PM', status: 'Served',   steward: 'Mike',   amt: '₹480' },
  { table: 'Table 02', kot: 'KOT-9022', item: 'Grilled Chicken',    qty: 1, time: '12:45 PM', status: 'Preparing', steward: 'Anita',  amt: '₹650' },
  { table: 'Table 08', kot: 'KOT-9023', item: 'Veg Biryani',        qty: 3, time: '01:00 PM', status: 'Served',   steward: 'Rajan',  amt: '₹1,050' },
  { table: 'Table 01', kot: 'KOT-9024', item: 'Masala Dosa',        qty: 2, time: '01:15 PM', status: 'Pending',  steward: 'Sunita', amt: '₹360' },
  { table: 'Table 06', kot: 'KOT-9025', item: 'Chocolate Brownie',  qty: 4, time: '01:30 PM', status: 'Served',   steward: 'Mike',   amt: '₹720' },
];

export const BANQUET_DETAILS = [
  { venueName: 'Grand Ballroom A', date: '17-06-2026', bookNo: '#BQ-0812', bookedBy: 'Zoya Khan', mobile: '+1 (555) 902-1822', functionType: 'Corporate Gala', fromTime: '04:00 PM', toTime: '10:00 PM', pax: 150, grossAmt: '₹4,500' },
];

export const PURCHASE_DETAILS = [
  { partyName: 'Metro Linens Corp', city: 'New York', vNo: '#V-8092', partyBillNo: 'PL-89201', grossAmt: '₹800', discount: '₹40', netAmt: '₹832' },
];

export const TIMEFRAME_DATA = {
  daily: {
    revenueLabels: ['8AM', '10AM', '12PM', '2PM', '4PM', '6PM', '8PM'],
    revenue:       [600, 900, 1400, 1100, 1800, 2200, 800],
    occupancy:     [30, 38, 52, 60, 72, 78, 65],
    occupancyLabels: ['8AM', '10AM', '12PM', '2PM', '4PM', '6PM', '8PM'],
  },
  weekly: {
    revenueLabels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    revenue:       [2800, 3400, 3100, 4200, 5600, 6200, 3840],
    occupancy:     [65, 70, 68, 75, 88, 92, 78],
    occupancyLabels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  },
  monthly: {
    revenueLabels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    revenue:       [45000, 52000, 49000, 68000, 75000, 92000],
    occupancy:     [60, 65, 62, 70, 78, 85],
    occupancyLabels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  },
  yearly: {
    revenueLabels: ['2023', '2024', '2025', '2026'],
    revenue:       [450000, 580000, 620000, 780000],
    occupancy:     [55, 68, 72, 78],
    occupancyLabels: ['2023', '2024', '2025', '2026'],
  },
};
