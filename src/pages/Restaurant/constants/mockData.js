import { FaUtensils, FaShoppingBag, FaMotorcycle } from 'react-icons/fa';


export const INITIAL_TABLES = [
  { id: 1, no: '01', seats: 4, status: 'Blank', amount: 0, waiter: null, customer: 'Walk-in', floor: 'Ground', section: 'Main Area', kots: [], kotCount: 0 },
  { 
    id: 2, 
    no: '02', 
    seats: 2, 
    status: 'Running', 
    amount: 1070, 
    waiter: 'Ravi K.', 
    customer: 'John Doe', 
    floor: 'Ground', 
    section: 'Main Area', 
    openedAt: Date.now() - 25 * 60 * 1000, 
    kots: [ 
      { 
        id: 'KOT-204', 
        time: '12:15 PM', 
        status: 'Sent to Kitchen',
        items: [ 
          { lineId: 'kot-2-1', itemId: 101, itemName: 'Butter Chicken', name: 'Butter Chicken (Full)', variantId: 'full', variantName: 'Full', variant: 'Full', qty: 1, unitPrice: 450, rate: 450, price: 450, total: 450 }, 
          { lineId: 'kot-2-2', itemId: 104, itemName: 'Garlic Naan', name: 'Garlic Naan', variantId: '', variantName: '', variant: '', qty: 3, unitPrice: 100, rate: 100, price: 100, total: 300 },
          { lineId: 'kot-2-3', itemId: 105, itemName: 'Jeera Rice', name: 'Jeera Rice', variantId: '', variantName: '', variant: '', qty: 1, unitPrice: 200, rate: 200, price: 200, total: 200 },
          { lineId: 'kot-2-4', itemId: 106, itemName: 'Soft Drink', name: 'Soft Drink (500ml)', variantId: '500ml', variantName: '500ml', variant: '500ml', qty: 2, unitPrice: 60, rate: 60, price: 60, total: 120 }
        ] 
      } 
    ], 
    kotCount: 1 
  },
  { 
    id: 3, 
    no: '03', 
    seats: 6, 
    status: 'Running', 
    amount: 2490, 
    waiter: 'Anita S.', 
    customer: 'Walk-in', 
    floor: 'First', 
    section: 'Balcony', 
    openedAt: Date.now() - 45 * 60 * 1000, 
    kots: [ 
      { 
        id: 'KOT-119', 
        time: '11:55 AM', 
        status: 'Cooking',
        items: [ 
          { lineId: 'kot-3-1', itemId: 102, itemName: 'Paneer Tikka', name: 'Paneer Tikka (Full)', variantId: 'full', variantName: 'Full', variant: 'Full', qty: 2, unitPrice: 300, rate: 300, price: 300, total: 600 }, 
          { lineId: 'kot-3-2', itemId: 107, itemName: 'Dal Makhani', name: 'Dal Makhani (Full)', variantId: 'full', variantName: 'Full', variant: 'Full', qty: 1, unitPrice: 350, rate: 350, price: 350, total: 350 },
          { lineId: 'kot-3-3', itemId: 108, itemName: 'Tandoori Roti', name: 'Tandoori Roti', variantId: '', variantName: '', variant: '', qty: 6, unitPrice: 30, rate: 30, price: 30, total: 180 },
          { lineId: 'kot-3-4', itemId: 109, itemName: 'Mocktails', name: 'Mocktails', variantId: '', variantName: '', variant: '', qty: 4, unitPrice: 150, rate: 150, price: 150, total: 600 },
          { lineId: 'kot-3-5', itemId: 110, itemName: 'Veg Biryani', name: 'Veg Biryani', variantId: '', variantName: '', variant: '', qty: 2, unitPrice: 380, rate: 380, price: 380, total: 760 }
        ] 
      } 
    ], 
    kotCount: 1 
  },
  { 
    id: 4, 
    no: '04', 
    seats: 4, 
    status: 'Paid', 
    amount: 1460, 
    waiter: 'Ravi K.', 
    customer: 'Sarah Connor', 
    floor: 'Ground', 
    section: 'Main Area', 
    kots: [ 
      { 
        id: 'KOT-404', 
        time: '12:25 PM', 
        status: 'Served',
        items: [ 
          { lineId: 'kot-4-1', itemId: 111, itemName: 'Chicken Biryani', name: 'Chicken Biryani', variantId: '', variantName: '', variant: '', qty: 2, unitPrice: 400, rate: 400, price: 400, total: 800 }, 
          { lineId: 'kot-4-2', itemId: 112, itemName: 'Chicken Tikka Roll', name: 'Chicken Tikka Roll', variantId: '', variantName: '', variant: '', qty: 2, unitPrice: 250, rate: 250, price: 250, total: 500 }, 
          { lineId: 'kot-4-3', itemId: 113, itemName: 'Masala Papad', name: 'Masala Papad', variantId: '', variantName: '', variant: '', qty: 4, unitPrice: 40, rate: 40, price: 40, total: 160 } 
        ] 
      } 
    ], 
    kotCount: 1 
  },
  { id: 5, no: '05', seats: 4, status: 'Reserved', amount: 0, waiter: 'Anita S.', customer: 'Vikas P.', floor: 'Ground', section: 'Garden', kots: [], kotCount: 0 },
  { 
    id: 6, 
    no: '06', 
    seats: 4, 
    status: 'Running', 
    amount: 1700, 
    waiter: 'Suresh P.', 
    customer: 'Rohan G.', 
    floor: 'First', 
    section: 'Balcony', 
    openedAt: Date.now() - 15 * 60 * 1000, 
    kots: [ 
      { 
        id: 'KOT-385', 
        time: '12:20 PM', 
        status: 'Sent to Kitchen',
        items: [ 
          { lineId: 'kot-6-1', itemId: 103, itemName: 'Veg Noodles', name: 'Veg Noodles (Full)', variantId: 'full', variantName: 'Full', variant: 'Full', qty: 2, unitPrice: 240, rate: 240, price: 240, total: 480 }, 
          { lineId: 'kot-6-2', itemId: 114, itemName: 'Chilli Paneer Dry', name: 'Chilli Paneer Dry', variantId: '', variantName: '', variant: '', qty: 2, unitPrice: 320, rate: 320, price: 320, total: 640 },
          { lineId: 'kot-6-3', itemId: 115, itemName: 'Fried Rice', name: 'Fried Rice', variantId: '', variantName: '', variant: '', qty: 1, unitPrice: 220, rate: 220, price: 220, total: 220 },
          { lineId: 'kot-6-4', itemId: 116, itemName: 'Spring Rolls', name: 'Spring Rolls', variantId: '', variantName: '', variant: '', qty: 2, unitPrice: 180, rate: 180, price: 180, total: 360 }
        ] 
      } 
    ], 
    kotCount: 1 
  },
  { 
    id: 7, 
    no: '07', 
    seats: 8, 
    status: 'Paid', 
    amount: 3800, 
    waiter: 'Anita S.', 
    customer: 'Anjali T.', 
    floor: 'First', 
    section: 'Balcony', 
    kots: [ 
      { 
        id: 'KOT-702', 
        time: '11:45 AM', 
        status: 'Served',
        items: [ 
          { lineId: 'kot-7-1', itemId: 117, itemName: 'Family Platter (Veg)', name: 'Family Platter (Veg)', variantId: '', variantName: '', variant: '', qty: 1, unitPrice: 1800, rate: 1800, price: 1800, total: 1800 }, 
          { lineId: 'kot-7-2', itemId: 118, itemName: 'Butter Naan', name: 'Butter Naan', variantId: '', variantName: '', variant: '', qty: 8, unitPrice: 80, rate: 80, price: 80, total: 640 }, 
          { lineId: 'kot-7-3', itemId: 119, itemName: 'Dal Tadka Large', name: 'Dal Tadka Large', variantId: '', variantName: '', variant: '', qty: 2, unitPrice: 300, rate: 300, price: 300, total: 600 }, 
          { lineId: 'kot-7-4', itemId: 120, itemName: 'Paneer Butter Masala', name: 'Paneer Butter Masala', variantId: '', variantName: '', variant: '', qty: 2, unitPrice: 380, rate: 380, price: 380, total: 760 } 
        ] 
      } 
    ], 
    kotCount: 1 
  },
  { id: 8, no: '08', seats: 2, status: 'Cleaning', amount: 0, waiter: null, customer: 'Walk-in', floor: 'Ground', section: 'Main Area', kots: [], kotCount: 0 },
  { 
    id: 9, 
    no: '09', 
    seats: 2, 
    status: 'Running', 
    amount: 740, 
    waiter: 'Suresh P.', 
    customer: 'Alice S.', 
    floor: 'Ground', 
    section: 'Main Area', 
    openedAt: Date.now() - 8 * 60 * 1000, 
    kots: [ 
      { 
        id: 'KOT-844', 
        time: '12:45 PM', 
        status: 'Sent to Kitchen',
        items: [ 
          { lineId: 'kot-9-1', itemId: 121, itemName: 'Club Sandwich', name: 'Club Sandwich', variantId: '', variantName: '', variant: '', qty: 2, unitPrice: 180, rate: 180, price: 180, total: 360 }, 
          { lineId: 'kot-9-2', itemId: 122, itemName: 'French Fries', name: 'French Fries', variantId: '', variantName: '', variant: '', qty: 1, unitPrice: 140, rate: 140, price: 140, total: 140 },
          { lineId: 'kot-9-3', itemId: 123, itemName: 'Cold Coffee', name: 'Cold Coffee', variantId: '', variantName: '', variant: '', qty: 2, unitPrice: 120, rate: 120, price: 120, total: 240 }
        ] 
      } 
    ], 
    kotCount: 1 
  },
  { id: 10, no: '10', seats: 4, status: 'Blank', amount: 0, waiter: null, customer: 'Walk-in', floor: 'First', section: 'Main Area', kots: [], kotCount: 0 },
  { 
    id: 11, 
    no: '11', 
    seats: 6, 
    status: 'Running', 
    amount: 3200, 
    waiter: 'Ravi K.', 
    customer: 'Walk-in', 
    floor: 'First', 
    section: 'Balcony', 
    openedAt: Date.now() - 30 * 60 * 1000, 
    kots: [ 
      { 
        id: 'KOT-492', 
        time: '12:05 PM', 
        status: 'Cooking',
        items: [ 
          { lineId: 'kot-11-1', itemId: 101, itemName: 'Butter Chicken', name: 'Butter Chicken (Full)', variantId: 'full', variantName: 'Full', variant: 'Full', qty: 4, unitPrice: 450, rate: 450, price: 450, total: 1800 }, 
          { lineId: 'kot-11-2', itemId: 118, itemName: 'Butter Naan', name: 'Butter Naan', variantId: '', variantName: '', variant: '', qty: 10, unitPrice: 80, rate: 80, price: 80, total: 800 }, // Wait, in mockData.js it was Garlic Naan at 100, let's keep it Garlic Naan
          { lineId: 'kot-11-3', itemId: 105, itemName: 'Jeera Rice', name: 'Jeera Rice', variantId: '', variantName: '', variant: '', qty: 2, unitPrice: 200, rate: 200, price: 200, total: 400 } 
        ] 
      } 
    ], 
    kotCount: 1 
  },
  { 
    id: 12, 
    no: '12', 
    seats: 4, 
    status: 'Paid', 
    amount: 2100, 
    waiter: 'Suresh P.', 
    customer: 'David M.', 
    floor: 'Ground', 
    section: 'Main Area', 
    kots: [ 
      { 
        id: 'KOT-718', 
        time: '12:35 PM', 
        status: 'Served',
        items: [ 
          { lineId: 'kot-12-1', itemId: 121, itemName: 'Club Sandwich', name: 'Club Sandwich', variantId: '', variantName: '', variant: '', qty: 2, unitPrice: 180, rate: 180, price: 180, total: 360 }, 
          { lineId: 'kot-12-2', itemId: 122, itemName: 'French Fries', name: 'French Fries', variantId: '', variantName: '', variant: '', qty: 1, unitPrice: 140, rate: 140, price: 140, total: 140 }, 
          { lineId: 'kot-12-3', itemId: 106, itemName: 'Soft Drink', name: 'Soft Drink (500ml)', variantId: '500ml', variantName: '500ml', variant: '500ml', qty: 4, unitPrice: 60, rate: 60, price: 60, total: 240 } 
        ] 
      } 
    ], 
    kotCount: 1 
  },
];

export const INITIAL_MOCK_ORDER_DETAILS = {
  1: [],
  2: [
    { lineId: 'line-2-1', itemId: 101, itemName: 'Butter Chicken', name: 'Butter Chicken', variantId: 'full', variantName: 'Full', variant: 'Full', qty: 1, unitPrice: 450, rate: 450, price: 450, total: 450 },
    { lineId: 'line-2-2', itemId: 104, itemName: 'Garlic Naan', name: 'Garlic Naan', variantId: '', variantName: '', variant: '', qty: 3, unitPrice: 100, rate: 100, price: 100, total: 300 },
    { lineId: 'line-2-3', itemId: 105, itemName: 'Jeera Rice', name: 'Jeera Rice', variantId: '', variantName: '', variant: '', qty: 1, unitPrice: 200, rate: 200, price: 200, total: 200 },
    { lineId: 'line-2-4', itemId: 106, itemName: 'Soft Drink', name: 'Soft Drink', variantId: '500ml', variantName: '500ml', variant: '500ml', qty: 2, unitPrice: 60, rate: 60, price: 60, total: 120 }
  ],
  3: [
    { lineId: 'line-3-1', itemId: 102, itemName: 'Paneer Tikka', name: 'Paneer Tikka', variantId: 'full', variantName: 'Full', variant: 'Full', qty: 2, unitPrice: 300, rate: 300, price: 300, total: 600 },
    { lineId: 'line-3-2', itemId: 107, itemName: 'Dal Makhani', name: 'Dal Makhani', variantId: 'full', variantName: 'Full', variant: 'Full', qty: 1, unitPrice: 350, rate: 350, price: 350, total: 350 },
    { lineId: 'line-3-3', itemId: 108, itemName: 'Tandoori Roti', name: 'Tandoori Roti', variantId: '', variantName: '', variant: '', qty: 6, unitPrice: 30, rate: 30, price: 30, total: 180 },
    { lineId: 'line-3-4', itemId: 109, itemName: 'Mocktails', name: 'Mocktails', variantId: '', variantName: '', variant: '', qty: 4, unitPrice: 150, rate: 150, price: 150, total: 600 },
    { lineId: 'line-3-5', itemId: 110, itemName: 'Veg Biryani', name: 'Veg Biryani', variantId: '', variantName: '', variant: '', qty: 2, unitPrice: 380, rate: 380, price: 380, total: 760 }
  ],
  4: [
    { lineId: 'line-4-1', itemId: 111, itemName: 'Chicken Biryani', name: 'Chicken Biryani', variantId: '', variantName: '', variant: '', qty: 2, unitPrice: 400, rate: 400, price: 400, total: 800 },
    { lineId: 'line-4-2', itemId: 112, itemName: 'Chicken Tikka Roll', name: 'Chicken Tikka Roll', variantId: '', variantName: '', variant: '', qty: 2, unitPrice: 250, rate: 250, price: 250, total: 500 },
    { lineId: 'line-4-3', itemId: 113, itemName: 'Masala Papad', name: 'Masala Papad', variantId: '', variantName: '', variant: '', qty: 4, unitPrice: 40, rate: 40, price: 40, total: 160 }
  ],
  5: [],
  6: [
    { lineId: 'line-6-1', itemId: 103, itemName: 'Veg Noodles', name: 'Veg Noodles', variantId: 'full', variantName: 'Full', variant: 'Full', qty: 2, unitPrice: 240, rate: 240, price: 240, total: 480 },
    { lineId: 'line-6-2', itemId: 114, itemName: 'Chilli Paneer Dry', name: 'Chilli Paneer Dry', variantId: '', variantName: '', variant: '', qty: 2, unitPrice: 320, rate: 320, price: 320, total: 640 },
    { lineId: 'line-6-3', itemId: 115, itemName: 'Fried Rice', name: 'Fried Rice', variantId: '', variantName: '', variant: '', qty: 1, unitPrice: 220, rate: 220, price: 220, total: 220 },
    { lineId: 'line-6-4', itemId: 116, itemName: 'Spring Rolls', name: 'Spring Rolls', variantId: '', variantName: '', variant: '', qty: 2, unitPrice: 180, rate: 180, price: 180, total: 360 }
  ],
  7: [
    { lineId: 'line-7-1', itemId: 117, itemName: 'Family Platter (Veg)', name: 'Family Platter (Veg)', variantId: '', variantName: '', variant: '', qty: 1, unitPrice: 1800, rate: 1800, price: 1800, total: 1800 },
    { lineId: 'line-7-2', itemId: 118, itemName: 'Butter Naan', name: 'Butter Naan', variantId: '', variantName: '', variant: '', qty: 8, unitPrice: 80, rate: 80, price: 80, total: 640 },
    { lineId: 'line-7-3', itemId: 119, itemName: 'Dal Tadka Large', name: 'Dal Tadka Large', variantId: '', variantName: '', variant: '', qty: 2, unitPrice: 300, rate: 300, price: 300, total: 600 },
    { lineId: 'line-7-4', itemId: 120, itemName: 'Paneer Butter Masala', name: 'Paneer Butter Masala', variantId: '', variantName: '', variant: '', qty: 2, unitPrice: 380, rate: 380, price: 380, total: 760 }
  ],
  8: [],
  9: [
    { lineId: 'line-9-1', itemId: 121, itemName: 'Club Sandwich', name: 'Club Sandwich', variantId: '', variantName: '', variant: '', qty: 2, unitPrice: 180, rate: 180, price: 180, total: 360 },
    { lineId: 'line-9-2', itemId: 122, itemName: 'French Fries', name: 'French Fries', variantId: '', variantName: '', variant: '', qty: 1, unitPrice: 140, rate: 140, price: 140, total: 140 },
    { lineId: 'line-9-3', itemId: 123, itemName: 'Cold Coffee', name: 'Cold Coffee', variantId: '', variantName: '', variant: '', qty: 2, unitPrice: 120, rate: 120, price: 120, total: 240 }
  ],
  10: [],
  11: [
    { lineId: 'line-11-1', itemId: 101, itemName: 'Butter Chicken', name: 'Butter Chicken', variantId: 'full', variantName: 'Full', variant: 'Full', qty: 4, unitPrice: 450, rate: 450, price: 450, total: 1800 },
    { lineId: 'line-11-2', itemId: 104, itemName: 'Garlic Naan', name: 'Garlic Naan', variantId: '', variantName: '', variant: '', qty: 10, unitPrice: 100, rate: 100, price: 100, total: 1000 },
    { lineId: 'line-11-3', itemId: 105, itemName: 'Jeera Rice', name: 'Jeera Rice', variantId: '', variantName: '', variant: '', qty: 2, unitPrice: 200, rate: 200, price: 200, total: 400 }
  ],
  12: [
    { lineId: 'line-12-1', itemId: 121, itemName: 'Club Sandwich', name: 'Club Sandwich', variantId: '', variantName: '', variant: '', qty: 2, unitPrice: 180, rate: 180, price: 180, total: 360 },
    { lineId: 'line-12-2', itemId: 122, itemName: 'French Fries', name: 'French Fries', variantId: '', variantName: '', variant: '', qty: 1, unitPrice: 140, rate: 140, price: 140, total: 140 },
    { lineId: 'line-12-3', itemId: 106, itemName: 'Soft Drink', name: 'Soft Drink', variantId: '500ml', variantName: '500ml', variant: '500ml', qty: 4, unitPrice: 60, rate: 60, price: 60, total: 240 }
  ]
};

export const MOCK_MENU_ITEMS = [
  {
    id: 101,
    name: 'Butter Chicken',
    rate: 450,
    price: 450,
    variants: [
      { id: 'half', name: 'Half', price: 250 },
      { id: 'full', name: 'Full', price: 450 }
    ]
  },
  {
    id: 102,
    name: 'Paneer Tikka',
    rate: 300,
    price: 300,
    variants: [
      { id: 'half', name: 'Half', price: 180 },
      { id: 'full', name: 'Full', price: 300 }
    ]
  },
  {
    id: 103,
    name: 'Veg Noodles',
    rate: 240,
    price: 240,
    variants: [
      { id: 'half', name: 'Half', price: 140 },
      { id: 'full', name: 'Full', price: 240 }
    ]
  },
  {
    id: 104,
    name: 'Garlic Naan',
    rate: 100,
    price: 100,
    variants: []
  },
  {
    id: 105,
    name: 'Jeera Rice',
    rate: 200,
    price: 200,
    variants: []
  },
  {
    id: 106,
    name: 'Soft Drink',
    rate: 60,
    price: 60,
    variants: [
      { id: '250ml', name: '250 ml', price: 30 },
      { id: '500ml', name: '500 ml', price: 60 }
    ]
  },
  {
    id: 107,
    name: 'Dal Makhani',
    rate: 350,
    price: 350,
    variants: [
      { id: 'half', name: 'Half', price: 200 },
      { id: 'full', name: 'Full', price: 350 }
    ]
  },
  {
    id: 108,
    name: 'Tandoori Roti',
    rate: 30,
    price: 30,
    variants: []
  },
  {
    id: 109,
    name: 'Mocktails',
    rate: 150,
    price: 150,
    variants: []
  },
  {
    id: 110,
    name: 'Veg Biryani',
    rate: 380,
    price: 380,
    variants: []
  },
  {
    id: 111,
    name: 'Chicken Biryani',
    rate: 400,
    price: 400,
    variants: []
  },
  {
    id: 112,
    name: 'Chicken Tikka Roll',
    rate: 250,
    price: 250,
    variants: []
  },
  {
    id: 113,
    name: 'Masala Papad',
    rate: 40,
    price: 40,
    variants: []
  },
  {
    id: 114,
    name: 'Chilli Paneer Dry',
    rate: 320,
    price: 320,
    variants: []
  },
  {
    id: 115,
    name: 'Fried Rice',
    rate: 220,
    price: 220,
    variants: []
  },
  {
    id: 116,
    name: 'Spring Rolls',
    rate: 180,
    price: 180,
    variants: []
  },
  {
    id: 117,
    name: 'Family Platter (Veg)',
    rate: 1800,
    price: 1800,
    variants: []
  },
  {
    id: 118,
    name: 'Butter Naan',
    rate: 80,
    price: 80,
    variants: []
  },
  {
    id: 119,
    name: 'Dal Tadka Large',
    rate: 300,
    price: 300,
    variants: []
  },
  {
    id: 120,
    name: 'Paneer Butter Masala',
    rate: 380,
    price: 380,
    variants: []
  },
  {
    id: 121,
    name: 'Club Sandwich',
    rate: 180,
    price: 180,
    variants: []
  },
  {
    id: 122,
    name: 'French Fries',
    rate: 140,
    price: 140,
    variants: []
  },
  {
    id: 123,
    name: 'Cold Coffee',
    rate: 120,
    price: 120,
    variants: []
  }
];

export const MOCK_WAITERS = ['Ravi K.', 'Anita S.', 'Suresh P.', 'Rahul M.', 'Pooja R.'];
export const MOCK_CAPTAINS = ['Captain Vikram', 'Captain Priya', 'Captain Amit'];

export const SERVICES = [
  { id: 'Restaurant', label: 'Dine In', icon: FaUtensils },
  { id: 'Takeaway', label: 'Take Away', icon: FaShoppingBag },
  { id: 'Delivery', label: 'Delivery', icon: FaMotorcycle },
];
