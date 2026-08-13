// ============================================================
// ALFA HMS — KOT Engine
// Groups bill items by Production Category → Printer
// and generates separate KOT payloads per printer station
// ============================================================

import {
  INITIAL_PRINTERS,
  INITIAL_PRODUCTION_CATEGORIES,
  INITIAL_PRINTER_MAPPINGS,
  ALL_FOOD_ITEMS,
} from '../constants/printerData';

/**
 * Look up what production category an order row belongs to.
 * Tries itemId first, then falls back to name matching.
 */
function resolveProductionCategory(row, foodItems = ALL_FOOD_ITEMS) {
  const match =
    foodItems.find(f => f.id === row.itemId) ||
    foodItems.find(f => f.name === row.itemName || f.name === row.name);
  return match?.productionCategory || null;
}

/**
 * Core routing function.
 * Takes the active bill rows and returns an array of printer groups.
 *
 * @param {Array} rows          - Active billing rows (from POSBillingPage state)
 * @param {Array} foodItems     - Full food item list (defaults to ALL_FOOD_ITEMS)
 * @param {Array} categories    - Production categories (defaults to INITIAL_PRODUCTION_CATEGORIES)
 * @param {Array} mappings      - Printer mappings (defaults to INITIAL_PRINTER_MAPPINGS)
 * @param {Array} printers      - Printers list (defaults to INITIAL_PRINTERS)
 * @returns {Array} groups      - [{ printer, productionCategory, items, color }]
 */
export function groupItemsByPrinter(
  rows,
  foodItems = ALL_FOOD_ITEMS,
  categories = null,
  mappings = null,
  printers = null,
) {
  const activeRows = rows.filter(r => r.itemName || r.name);
  const groupMap = {}; // key: printerId → group

  const savedPrinters = typeof localStorage !== 'undefined' ? localStorage.getItem('alfa_pos_printers') : null;
  const savedCategories = typeof localStorage !== 'undefined' ? localStorage.getItem('alfa_production_categories') : null;

  const activePrinters = printers || (savedPrinters ? JSON.parse(savedPrinters) : INITIAL_PRINTERS);
  const activeCategories = categories || (savedCategories ? JSON.parse(savedCategories) : INITIAL_PRODUCTION_CATEGORIES);
  const activeMappings = mappings || activeCategories.map(pc => ({ productionCategoryId: pc.id, printerId: pc.printerId }));

  for (const row of activeRows) {
    const catId = resolveProductionCategory(row, foodItems);
    const category = activeCategories.find(c => String(c.id) === String(catId));
    const mapping = activeMappings.find(m => String(m.productionCategoryId) === String(catId));
    const printer = mapping ? activePrinters.find(p => String(p.id) === String(mapping.printerId)) : null;

    // Fallback: if no mapping found, route to default printer
    const effectivePrinter =
      printer ||
      activePrinters.find(p => p.isDefault) ||
      activePrinters[0] ||
      { id: 'default_p', name: 'Kitchen Printer', type: 'Network', ip: '192.168.1.100', port: 9100 };

    const key = effectivePrinter.id || 'default_p';

    if (!groupMap[key]) {
      groupMap[key] = {
        printer: effectivePrinter,
        productionCategory: category || { name: 'General', color: '#64748b' },
        items: [],
        color: category?.color || '#64748b',
        isFallback: !printer,
      };
    }

    groupMap[key].items.push(row);
  }

  return Object.values(groupMap);
}

/**
 * Generate a structured KOT payload for a single printer group.
 */
export function generateKOTPayload({ tableNo, tableId, kotNo, group, customerName, waiter, captain }) {
  return {
    kotNo,
    tableNo,
    tableId,
    customerName: customerName || 'Walk-in',
    waiter: waiter || '',
    captain: captain || '',
    printer: group.printer,
    productionCategory: group.productionCategory,
    items: group.items.map(r => ({
      name: r.name || r.itemName,
      qty: r.qty,
      variant: r.variantName || r.variant || '',
      remark: r.remark || '',
      unitPrice: r.unitPrice || r.price || 0,
    })),
    timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    generatedAt: Date.now(),
  };
}

/**
 * Simulate sending a KOT to a printer.
 * In production this would call a print API or a USB/network print command.
 * Returns a Promise so UI can show per-printer status.
 */
export function simulatePrint(kotPayload) {
  return new Promise((resolve) => {
    const delay = 600 + Math.random() * 400;
    setTimeout(() => {
      // Simulate 95% success rate
      const success = Math.random() > 0.05;
      resolve({
        success,
        printer: kotPayload.printer.name,
        kotNo: kotPayload.kotNo,
        itemCount: kotPayload.items.length,
        timestamp: new Date().toLocaleTimeString('en-IN'),
        error: success ? null : 'Printer offline or paper jam',
      });
    }, delay);
  });
}

/**
 * Run the full KOT flow: group → payload → print (all printers in parallel).
 * Returns { groups, results } when all print jobs complete.
 */
export async function executeKOT({ rows, tableNo, tableId, kotNo, customerName, waiter, captain, foodItems, categories, mappings, printers }) {
  const groups = groupItemsByPrinter(rows, foodItems, categories, mappings, printers);

  const payloads = groups.map(group =>
    generateKOTPayload({ tableNo, tableId, kotNo, group, customerName, waiter, captain })
  );

  const results = await Promise.all(payloads.map(p => simulatePrint(p)));

  return { groups, payloads, results };
}
