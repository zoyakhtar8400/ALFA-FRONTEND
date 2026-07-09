import { FaUtensils, FaShoppingBag, FaMotorcycle } from 'react-icons/fa';

export const INITIAL_TABLES = [
  { id: 1, no: '01', seats: 4, status: 'Blank', amount: 0, waiter: null, customer: 'Walk-in', floor: 'Ground', section: 'Main Area', kots: [], kotCount: 0 },
  { id: 2, no: '02', seats: 2, status: 'Running', amount: 1070, waiter: 'Ravi K.', customer: 'John Doe', floor: 'Ground', section: 'Main Area', openedAt: Date.now() - 25 * 60 * 1000, kots: [ { id: 'KOT-204', time: '12:15 PM', items: [ { name: 'Butter Chicken', qty: 1 }, { name: 'Garlic Naan', qty: 3 } ] } ], kotCount: 1 },
  { id: 3, no: '03', seats: 6, status: 'Running', amount: 2490, waiter: 'Anita S.', customer: 'Walk-in', floor: 'First', section: 'Balcony', openedAt: Date.now() - 45 * 60 * 1000, kots: [ { id: 'KOT-119', time: '11:55 AM', items: [ { name: 'Paneer Tikka', qty: 2 }, { name: 'Dal Makhani', qty: 1 } ] } ], kotCount: 1 },
  { id: 4, no: '04', seats: 4, status: 'Paid', amount: 1460, waiter: 'Ravi K.', customer: 'Sarah Connor', floor: 'Ground', section: 'Main Area', kots: [ { id: 'KOT-404', time: '12:25 PM', items: [ { name: 'Chicken Biryani', qty: 2 }, { name: 'Chicken Tikka Roll', qty: 2 }, { name: 'Masala Papad', qty: 4 } ] } ], kotCount: 1 },
  { id: 5, no: '05', seats: 4, status: 'Reserved', amount: 0, waiter: 'Anita S.', customer: 'Vikas P.', floor: 'Ground', section: 'Garden', kots: [], kotCount: 0 },
  { id: 6, no: '06', seats: 4, status: 'Running', amount: 1700, waiter: 'Suresh P.', customer: 'Rohan G.', floor: 'First', section: 'Balcony', openedAt: Date.now() - 15 * 60 * 1000, kots: [ { id: 'KOT-385', time: '12:20 PM', items: [ { name: 'Veg Noodles', qty: 2 }, { name: 'Spring Rolls', qty: 2 } ] } ], kotCount: 1 },
  { id: 7, no: '07', seats: 8, status: 'Paid', amount: 3800, waiter: 'Anita S.', customer: 'Anjali T.', floor: 'First', section: 'Balcony', kots: [ { id: 'KOT-702', time: '11:45 AM', items: [ { name: 'Family Platter (Veg)', qty: 1 }, { name: 'Butter Naan', qty: 8 }, { name: 'Dal Tadka Large', qty: 2 }, { name: 'Paneer Butter Masala', qty: 2 } ] } ], kotCount: 1 },
  { id: 8, no: '08', seats: 2, status: 'Cleaning', amount: 0, waiter: null, customer: 'Walk-in', floor: 'Ground', section: 'Main Area', kots: [], kotCount: 0 },
  { id: 9, no: '09', seats: 2, status: 'Running', amount: 740, waiter: 'Suresh P.', customer: 'Alice S.', floor: 'Ground', section: 'Main Area', openedAt: Date.now() - 8 * 60 * 1000, kots: [ { id: 'KOT-844', time: '12:45 PM', items: [ { name: 'Club Sandwich', qty: 2 }, { name: 'Cold Coffee', qty: 2 } ] } ], kotCount: 1 },
  { id: 10, no: '10', seats: 4, status: 'Blank', amount: 0, waiter: null, customer: 'Walk-in', floor: 'First', section: 'Main Area', kots: [], kotCount: 0 },
  { id: 11, no: '11', seats: 6, status: 'Running', amount: 3200, waiter: 'Ravi K.', customer: 'Walk-in', floor: 'First', section: 'Balcony', openedAt: Date.now() - 30 * 60 * 1000, kots: [ { id: 'KOT-492', time: '12:05 PM', items: [ { name: 'Butter Chicken', qty: 4 }, { name: 'Garlic Naan', qty: 10 } ] } ], kotCount: 1 },
  { id: 12, no: '12', seats: 4, status: 'Paid', amount: 2100, waiter: 'Suresh P.', customer: 'David M.', floor: 'Ground', section: 'Main Area', kots: [ { id: 'KOT-718', time: '12:35 PM', items: [ { name: 'Club Sandwich', qty: 2 }, { name: 'French Fries', qty: 1 } ] } ], kotCount: 1 },
];

export const INITIAL_MOCK_ORDER_DETAILS = {
  1: [],
  2: [
    { name: 'Butter Chicken', qty: 1, rate: 450, total: 450 },
    { name: 'Garlic Naan', qty: 3, rate: 100, total: 300 },
    { name: 'Jeera Rice', qty: 1, rate: 200, total: 200 },
    { name: 'Soft Drink', qty: 2, rate: 60, total: 120 }
  ],
  3: [
    { name: 'Paneer Tikka', qty: 2, rate: 300, total: 600 },
    { name: 'Dal Makhani', qty: 1, rate: 350, total: 350 },
    { name: 'Tandoori Roti', qty: 6, rate: 30, total: 180 },
    { name: 'Mocktails', qty: 4, rate: 150, total: 600 },
    { name: 'Veg Biryani', qty: 2, rate: 380, total: 760 }
  ],
  4: [
    { name: 'Chicken Biryani', qty: 2, rate: 400, total: 800 },
    { name: 'Chicken Tikka Roll', qty: 2, rate: 250, total: 500 },
    { name: 'Masala Papad', qty: 4, rate: 40, total: 160 }
  ],
  5: [],
  6: [
    { name: 'Veg Noodles', qty: 2, rate: 240, total: 480 },
    { name: 'Chilli Paneer Dry', qty: 2, rate: 320, total: 640 },
    { name: 'Fried Rice', qty: 1, rate: 220, total: 220 },
    { name: 'Spring Rolls', qty: 2, rate: 180, total: 360 }
  ],
  7: [
    { name: 'Family Platter (Veg)', qty: 1, rate: 1800, total: 1800 },
    { name: 'Butter Naan', qty: 8, rate: 80, total: 640 },
    { name: 'Dal Tadka Large', qty: 2, rate: 300, total: 600 },
    { name: 'Paneer Butter Masala', qty: 2, rate: 380, total: 760 }
  ],
  8: [],
  9: [
    { name: 'Club Sandwich', qty: 2, rate: 180, total: 360 },
    { name: 'French Fries', qty: 1, rate: 140, total: 140 },
    { name: 'Cold Coffee', qty: 2, rate: 120, total: 240 }
  ],
  10: [],
  11: [
    { name: 'Butter Chicken', qty: 4, rate: 450, total: 1800 },
    { name: 'Garlic Naan', qty: 10, rate: 100, total: 1000 },
    { name: 'Jeera Rice', qty: 2, rate: 200, total: 400 }
  ],
  12: [
    { name: 'Club Sandwich', qty: 2, rate: 180, total: 360 },
    { name: 'French Fries', qty: 1, rate: 140, total: 140 },
    { name: 'Soft Drink', qty: 4, rate: 60, total: 240 }
  ]
};

export const MOCK_MENU_ITEMS = [
  { name: 'Butter Chicken', rate: 450 },
  { name: 'Paneer Tikka', rate: 300 },
  { name: 'Veg Noodles', rate: 240 },
  { name: 'Garlic Naan', rate: 100 },
  { name: 'Jeera Rice', rate: 200 },
  { name: 'Soft Drink', rate: 60 },
  { name: 'Dal Makhani', rate: 350 },
  { name: 'Tandoori Roti', rate: 30 },
  { name: 'Mocktails', rate: 150 },
  { name: 'Veg Biryani', rate: 380 },
  { name: 'Chicken Biryani', rate: 400 },
  { name: 'Chicken Tikka Roll', rate: 250 },
  { name: 'Masala Papad', rate: 40 },
  { name: 'Chilli Paneer Dry', rate: 320 },
  { name: 'Fried Rice', rate: 220 },
  { name: 'Spring Rolls', rate: 180 },
  { name: 'Family Platter (Veg)', rate: 1800 },
  { name: 'Butter Naan', rate: 80 },
  { name: 'Dal Tadka Large', rate: 300 },
  { name: 'Paneer Butter Masala', rate: 380 },
  { name: 'Club Sandwich', rate: 180 },
  { name: 'French Fries', rate: 140 },
  { name: 'Cold Coffee', rate: 120 }
];

export const MOCK_WAITERS = ['Ravi K.', 'Anita S.', 'Suresh P.', 'Rahul M.', 'Pooja R.'];
export const MOCK_CAPTAINS = ['Captain Vikram', 'Captain Priya', 'Captain Amit'];

export const SERVICES = [
  { id: 'Restaurant', label: 'Dine In', icon: FaUtensils },
  { id: 'Takeaway', label: 'Take Away', icon: FaShoppingBag },
  { id: 'Delivery', label: 'Delivery', icon: FaMotorcycle },
];
