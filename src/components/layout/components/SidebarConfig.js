export const masters = [
  { name: 'Tax Structure', path: '/front-desk/master/tax-structure' },
  { name: 'Floor Master', path: '/front-desk/master/floor-master' },
  { name: 'Room Feature', path: '/front-desk/master/room-feature' },
  { name: 'Room Category', path: '/front-desk/master/room-category' },
  { name: 'Room Master', path: '/front-desk/master/room-master' },
  { name: 'Meal Master', path: '/front-desk/master/meal-master' },
  { name: 'Room Rate Master', path: '/front-desk/master/room-rate-master' },
  { name: 'Service Charge Master', path: '/front-desk/master/service-charge-master' },
  { name: 'Company Master', path: '/front-desk/master/company-master' },
  { name: 'Market Segment', path: '/front-desk/master/market-segment' },
  { name: 'Business Master', path: '/front-desk/master/business-master' },
  { name: 'Vehicle Master', path: '/front-desk/master/vehicle-master' },
  { name: 'Expense Master', path: '/front-desk/master/expense-master' },
  { name: 'City Master', path: '/front-desk/master/city-master' },
  { name: 'State Master', path: '/front-desk/master/state-master' },
];

export const operations = [
  { name: 'Booking', path: '/front-desk/operation/booking' },
  { name: 'Walkin Checkin Entry', path: '/front-desk/operation/walkin-checkin-entry' },
  { name: 'Payment Recieve Entry', path: '/front-desk/operation/payment-recieve-entry' },
  { name: 'Service Charge Entry', path: '/front-desk/operation/service-charge-entry' },
  { name: 'Room Change Entry', path: '/front-desk/operation/room-change-entry' },
  { name: 'Room Checkout Entry', path: '/front-desk/operation/room-checkout-entry' },
  { name: 'Checkout Entry', path: '/front-desk/operation/checkout-entry' },
  { name: 'Refund Entry', path: '/front-desk/operation/refund-entry' },
  { name: 'Add Guest in Room Entry', path: '/front-desk/operation/add-guest-in-room-entry' },
  { name: 'Night Audit Entry', path: '/front-desk/operation/night-audit-entry' },
  { name: 'Guest Profile', path: '/front-desk/operation/guest-profile' },
  { name: 'Multi Room Checkout', path: '/front-desk/operation/multi-room-checkout' },
  { name: 'Room Enquiry Entry', path: '/front-desk/operation/room-enquiry-entry' },
  { name: 'Expense Entry', path: '/front-desk/operation/expense-entry' },
  { name: 'Amend Stay Entry', path: '/front-desk/operation/amend-stay-entry' },
];

export const misItems = [
  { name: 'Reservation Dashboard', path: '/front-desk/mis/reservation-dashboard' },
  { name: 'Front Office Dashboard', path: '/front-desk/mis/front-office-dashboard' },
];

export const restaurantItems = [
  { name: 'Display Table', path: '/restaurant/display-table' },
  { name: 'View KOT', path: '/restaurant/view-kot' },
  { name: 'Order Details', path: '/restaurant/order-details' }
];

export const restaurantMasters = [
  { name: 'Steward Master', path: '/pos/masters/steward-master' },
  { name: 'Delivery Master', path: '/pos/master/delivery' },
  { name: 'Outlet Master', path: '/pos/master/outlet' },
  { name: 'Table Master', path: '/pos/master/table' },
  { name: 'Table Structure Design', path: '/pos/master/structure-design' },
  { name: 'Item Tax Category', path: '/pos/master/tax-category' },
  { name: 'Printer Master', path: '/restaurant/master/printer-master' },
  { name: 'Production Category', path: '/restaurant/master/production-category' },
  { 
    name: 'Item Menu', 
    path: '/pos/master/item-menu',
    subitems: [
      { name: 'Main Group Entry', path: '/pos/master/item-menu/main-group' },
      { name: 'Item Group Entry', path: '/pos/master/item-menu/item-group' },
      { name: 'Menu Item Entry', path: '/pos/master/item-menu/menu-item' },
      { name: 'Item Entry CSV upload', path: '/pos/master/item-menu/csv-upload' },
      { name: 'HSN Update', path: '/pos/master/item-menu/hsn-update' }
    ]
  },
  { name: 'NC Type Master', path: '/pos/master/nc-type' },
  { name: 'Item Rate Update', path: '/pos/master/rate-update' },
  { name: 'Item Rate Category', path: '/pos/master/rate-category' }
];
