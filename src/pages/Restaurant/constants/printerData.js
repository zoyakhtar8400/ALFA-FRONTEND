// ============================================================
// ALFA HMS — Printer & Production Category Data
// Central source of truth for KOT routing engine
// ============================================================

export const INITIAL_PRINTERS = [
  { id: 'p1', name: 'Kitchen Printer',    type: 'Network', ip: '192.168.1.100', port: 9100, status: 'Active',   isDefault: true  },
  { id: 'p2', name: 'Tandoor Printer',    type: 'Network', ip: '192.168.1.101', port: 9100, status: 'Active',   isDefault: false },
  { id: 'p3', name: 'Bar Printer',        type: 'Network', ip: '192.168.1.102', port: 9100, status: 'Active',   isDefault: false },
  { id: 'p4', name: 'Fast Food Printer',  type: 'USB',     ip: '',              port: null,  status: 'Active',   isDefault: false },
  { id: 'p5', name: 'Chinese Printer',    type: 'Network', ip: '192.168.1.103', port: 9100, status: 'Active',   isDefault: false },
  { id: 'p6', name: 'Dessert Printer',    type: 'USB',     ip: '',              port: null,  status: 'Active',   isDefault: false },
  { id: 'p7', name: 'Beverage Printer',   type: 'Network', ip: '192.168.1.104', port: 9100, status: 'Inactive', isDefault: false },
];

export const INITIAL_PRODUCTION_CATEGORIES = [
  { id: 'pc1', name: 'Main Course',    color: '#ef4444', printerId: 'p1', status: 'Active' },
  { id: 'pc2', name: 'Tandoor',        color: '#f97316', printerId: 'p2', status: 'Active' },
  { id: 'pc3', name: 'Bar / Beverage', color: '#8b5cf6', printerId: 'p3', status: 'Active' },
  { id: 'pc4', name: 'Fast Food',      color: '#eab308', printerId: 'p4', status: 'Active' },
  { id: 'pc5', name: 'Chinese',        color: '#06b6d4', printerId: 'p5', status: 'Active' },
  { id: 'pc6', name: 'Dessert',        color: '#ec4899', printerId: 'p6', status: 'Active' },
  { id: 'pc7', name: 'South Indian',   color: '#10b981', printerId: 'p1', status: 'Active' },
  { id: 'pc8', name: 'Bakery',         color: '#a78bfa', printerId: 'p4', status: 'Active' },
];

// Printer Mapping — drives the KOT Engine
// Each production category maps to exactly one printer
export const INITIAL_PRINTER_MAPPINGS = INITIAL_PRODUCTION_CATEGORIES.map(pc => ({
  productionCategoryId: pc.id,
  printerId: pc.printerId,
}));

// Helper: get printer name for a production category
export function getPrinterForCategory(categoryId, mappings = INITIAL_PRINTER_MAPPINGS, printers = INITIAL_PRINTERS) {
  const mapping = mappings.find(m => m.productionCategoryId === categoryId);
  if (!mapping) return null;
  return printers.find(p => p.id === mapping.printerId) || null;
}

// Helper: get production category by id
export function getProductionCategory(categoryId, categories = INITIAL_PRODUCTION_CATEGORIES) {
  return categories.find(pc => pc.id === categoryId) || null;
}

// ============================================================
// ALL FOOD ITEMS — each item now has a productionCategory field
// ============================================================
export const ALL_FOOD_ITEMS = [
  // Main Course
  { id: 101, name: 'CHICKEN TANDOORI',       category: 'FOOD', isVeg: false, productionCategory: 'pc2', variants: [{ id: 'half', name: 'Half', price: 280 }, { id: 'full', name: 'Full', price: 520 }] },
  { id: 102, name: 'PANEER TIKKA',           category: 'FOOD', isVeg: true,  productionCategory: 'pc2', variants: [{ id: 'half', name: 'Half', price: 180 }, { id: 'full', name: 'Full', price: 320 }] },
  { id: 107, name: 'DAL MAKHANI',            category: 'FOOD', isVeg: true,  productionCategory: 'pc1', variants: [{ id: 'half', name: 'Half', price: 160 }, { id: 'full', name: 'Full', price: 280 }] },
  { id: 110, name: 'VEG BIRYANI',            category: 'FOOD', isVeg: true,  productionCategory: 'pc1', price: 380,   variants: [] },
  { id: 111, name: 'CHICKEN BIRYANI',        category: 'FOOD', isVeg: false, productionCategory: 'pc1', price: 400,   variants: [] },
  { id: 114, name: 'CHILLI PANEER DRY',      category: 'FOOD', isVeg: true,  productionCategory: 'pc5', price: 320,   variants: [] },
  { id: 115, name: 'FRIED RICE',             category: 'FOOD', isVeg: true,  productionCategory: 'pc5', price: 220,   variants: [] },
  { id: 116, name: 'SPRING ROLLS',           category: 'FOOD', isVeg: true,  productionCategory: 'pc5', price: 180,   variants: [] },
  { id: 117, name: 'FAMILY PLATTER (VEG)',   category: 'FOOD', isVeg: true,  productionCategory: 'pc1', price: 1800,  variants: [] },

  // Tandoor
  { id: 104, name: 'GARLIC NAAN',            category: 'FOOD', isVeg: true,  productionCategory: 'pc2', price: 100,   variants: [] },
  { id: 108, name: 'TANDOORI ROTI',          category: 'FOOD', isVeg: true,  productionCategory: 'pc2', price: 30,    variants: [] },
  { id: 118, name: 'BUTTER NAAN',            category: 'FOOD', isVeg: true,  productionCategory: 'pc2', price: 40,    variants: [] },

  // Fast Food / Snacks
  { id: 112, name: 'CHICKEN TIKKA ROLL',     category: 'FOOD', isVeg: false, productionCategory: 'pc4', price: 250,   variants: [] },
  { id: 113, name: 'MASALA PAPAD',           category: 'FOOD', isVeg: true,  productionCategory: 'pc4', price: 40,    variants: [] },
  { id: 121, name: 'CLUB SANDWICH',          category: 'FOOD', isVeg: true,  productionCategory: 'pc4', price: 180,   variants: [] },
  { id: 122, name: 'FRENCH FRIES',           category: 'FOOD', isVeg: true,  productionCategory: 'pc4', price: 140,   variants: [] },

  // Rice
  { id: 105, name: 'JEERA RICE',             category: 'FOOD', isVeg: true,  productionCategory: 'pc1', price: 200,   variants: [] },
  { id: 103, name: 'VEG NOODLES',            category: 'FOOD', isVeg: true,  productionCategory: 'pc5', price: 240,   variants: [{ id: 'half', name: 'Half', price: 140 }, { id: 'full', name: 'Full', price: 240 }] },

  // Bar / Beverage
  { id: 106, name: 'COLD DRINK',             category: 'FOOD', isVeg: true,  productionCategory: 'pc3', variants: [{ id: '250ml', name: '250 ML', price: 40 }, { id: '500ml', name: '500 ML', price: 70 }, { id: '1l', name: '1 Litre', price: 120 }] },
  { id: 109, name: 'MOCKTAILS',              category: 'FOOD', isVeg: true,  productionCategory: 'pc3', price: 150,   variants: [] },
  { id: 123, name: 'COLD COFFEE',            category: 'FOOD', isVeg: true,  productionCategory: 'pc3', price: 120,   variants: [] },

  // BANQUET
  { id: 201, name: 'BANQUET BUFFET STANDARD', category: 'BANQUET', isVeg: true,  productionCategory: 'pc1', price: 600,   variants: [] },
  { id: 202, name: 'BANQUET BUFFET PREMIUM',  category: 'BANQUET', isVeg: true,  productionCategory: 'pc1', price: 950,   variants: [] },
  { id: 203, name: 'BANQUET HALL CHARGE',     category: 'BANQUET', isVeg: true,  productionCategory: 'pc1', price: 15000, variants: [] },
  { id: 204, name: 'DECORATION STANDARD',     category: 'BANQUET', isVeg: true,  productionCategory: 'pc1', price: 4500,  variants: [] },
];
