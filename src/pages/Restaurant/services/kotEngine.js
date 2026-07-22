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
  categories = INITIAL_PRODUCTION_CATEGORIES,
  mappings = INITIAL_PRINTER_MAPPINGS,
  printers = INITIAL_PRINTERS,
) {
  const activeRows = rows.filter(r => r.itemName || r.name);
  const groupMap = {}; // key: printerId → group

  for (const row of activeRows) {
    const catId = resolveProductionCategory(row, foodItems);
    const category = categories.find(c => c.id === catId);
    const mapping = mappings.find(m => m.productionCategoryId === catId);
    const printer = mapping ? printers.find(p => p.id === mapping.printerId) : null;

    // Fallback: if no mapping found, route to default printer
    const effectivePrinter =
      printer ||
      printers.find(p => p.isDefault) ||
      printers[0];

    const key = effectivePrinter.id;

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
