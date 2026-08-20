// ============================================================
// ALFA HMS — KOT Engine (PostgreSQL-Driven Station Routing)
// Groups bill items by Production Category → Printer Master
// and generates separate KOT payloads per station
// ============================================================

import { printStationKOT } from '../utils/printInvoice';

/**
 * Look up what production category / kitchen department an order row belongs to.
 * Checks row properties first (populated from mpos_item), then checks database food items list.
 */
export function resolveProductionCategory(row, foodItems = []) {
  if (row.kitchen_dept !== undefined && row.kitchen_dept !== null && row.kitchen_dept !== '') {
    return row.kitchen_dept;
  }
  if (row.productionCategory !== undefined && row.productionCategory !== null && row.productionCategory !== '') {
    return row.productionCategory;
  }
  if (row.kitchen_dept_id !== undefined && row.kitchen_dept_id !== null) {
    return row.kitchen_dept_id;
  }

  const match = (foodItems || []).find(f =>
    (row.itemId && (String(f.id || f.item_id) === String(row.itemId))) ||
    (row.id && (String(f.id || f.item_id) === String(row.id))) ||
    (row.itemName && String(f.name || f.title || f.item_name).toLowerCase().trim() === String(row.itemName).toLowerCase().trim()) ||
    (row.name && String(f.name || f.title || f.item_name).toLowerCase().trim() === String(row.name).toLowerCase().trim())
  );

  return match?.kitchen_dept || match?.kitchen_dept_id || match?.productionCategory || null;
}

/**
 * Core database-driven routing function.
 * Takes the active bill rows and groups them by assigned Printer Master from PostgreSQL.
 *
 * @param {Array} rows          - Active billing rows (from POSBillingPage / KOT state)
 * @param {Array} foodItems     - Full food item list from PostgreSQL (/menu-items)
 * @param {Array} categories    - Production categories from PostgreSQL (/production-categories)
 * @param {Array} printers      - Printers list from PostgreSQL (/printers)
 * @returns {Array} groups      - [{ printer, productionCategory, items, hasError, errorMessage }]
 */
export function groupItemsByPrinter(
  rows = [],
  foodItems = [],
  categories = [],
  printers = []
) {
  const activeRows = (rows || []).filter(r => (r.itemName || r.name) && Number(r.qty || r.quantity || 0) > 0);
  const groupMap = {}; // key: printerKey → group

  const activeCategories = Array.isArray(categories) ? categories : [];
  const activePrinters = Array.isArray(printers) ? printers : [];

  for (const row of activeRows) {
    const rawCatRef = resolveProductionCategory(row, foodItems);
    
    // 1. Match by kitchen_dept ID or name
    let category = null;
    if (rawCatRef !== null && rawCatRef !== undefined && rawCatRef !== '') {
      category = activeCategories.find(c =>
        String(c.id) === String(rawCatRef) ||
        String(c.kitchen_dept_name || c.name || '').toLowerCase().trim() === String(rawCatRef).toLowerCase().trim()
      );
    }

    // 2. If not found, try matching by item category name (e.g. Beverages, Tandoor, Starters, Chinese)
    if (!category) {
      const foodCat = String(row.category || '').toLowerCase().trim();
      if (foodCat) {
        category = activeCategories.find(c =>
          String(c.kitchen_dept_name || c.name || '').toLowerCase().trim() === foodCat ||
          foodCat.includes(String(c.kitchen_dept_name || c.name || '').toLowerCase().trim())
        );
      }
    }

    // 3. If still no category and activeCategories exist, map to primary default kitchen category
    if (!category && activeCategories.length > 0) {
      category = activeCategories.find(c => /main|kitchen|pantry|general/i.test(c.name || c.kitchen_dept_name || '')) || activeCategories[0];
    }

    // Find printer assigned to this category in PostgreSQL
    let printer = null;
    const pId = category ? (category.printer_id || category.printerId) : null;
    if (pId) {
      printer = activePrinters.find(p => String(p.id) === String(pId));
    }

    // If category has no printer or category not configured
    const categoryName = category?.name || category?.kitchen_dept_name || (rawCatRef ? `Dept ${rawCatRef}` : 'Main Kitchen');
    let groupKey = '';
    let hasError = false;
    let errorMessage = null;

    if (printer) {
      groupKey = `printer_${printer.id}`;
    } else if (pId && !printer) {
      groupKey = `missing_printer_${pId}`;
      hasError = true;
      errorMessage = `Printer ID ${pId} configured for "${categoryName}" is offline or missing in Printer Master.`;
    } else if (category && !pId) {
      groupKey = `unassigned_cat_${category.id}`;
      hasError = true;
      errorMessage = `No printer assigned in Production Category Master for "${categoryName}".`;
    } else {
      groupKey = `unassigned_general`;
      hasError = true;
      errorMessage = `Item "${row.name || row.itemName}" is not mapped to any Production Kitchen Station.`;
    }

    if (!groupMap[groupKey]) {
      groupMap[groupKey] = {
        key: groupKey,
        printer: printer || { id: groupKey, printer_name: 'Unassigned Printer', printer_ip: 'N/A', printer_type: 1 },
        printerName: printer ? printer.printer_name : 'Unassigned Printer',
        productionCategory: category || { id: null, name: categoryName, department_name: categoryName },
        stationName: categoryName,
        items: [],
        hasError,
        errorMessage,
      };
    }

    groupMap[groupKey].items.push(row);
  }

  return Object.values(groupMap);
}

/**
 * Generate a structured KOT payload for a single station printer group.
 */
export function generateKOTPayload({ tableNo, tableId, kotNo, group, customerName, waiter, captain, remarks, isReprint = false }) {
  const stationName = group.productionCategory?.name || group.stationName || 'Kitchen Station';
  const printerName = group.printer?.printer_name || group.printerName || 'KOT Printer';
  const printerIp = group.printer?.printer_ip || '';

  return {
    kotNo: kotNo || 'KOT-1',
    tableNo: String(tableNo || '1'),
    tableId: tableId || 1,
    customerName: customerName || 'Walk-in',
    waiter: waiter || 'Staff',
    captain: captain || '',
    remarks: remarks || '',
    stationName,
    printerName,
    printerIp,
    printer: group.printer,
    productionCategory: group.productionCategory,
    isReprint: !!isReprint,
    hasError: !!group.hasError,
    errorMessage: group.errorMessage || null,
    items: group.items.map(r => ({
      itemId: r.itemId || r.id,
      name: r.name || r.itemName,
      itemName: r.name || r.itemName,
      qty: Number(r.qty || r.quantity || 1),
      quantity: Number(r.qty || r.quantity || 1),
      variant: r.variantName || r.variant || '',
      remark: r.remark || r.remarks || '',
      remarks: r.remark || r.remarks || '',
      unitPrice: Number(r.unitPrice || r.price || 0),
      price: Number(r.unitPrice || r.price || 0),
    })),
    timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
    generatedAt: Date.now(),
  };
}

/**
 * Executes physical or browser printing of a single Station KOT ticket.
 */
export function printKOTPayload(payload) {
  if (payload.hasError) {
    console.warn(`[KOT Engine] Cannot print station payload: ${payload.errorMessage}`);
    if (window.showToast) {
      window.showToast(`⚠️ Print Error: ${payload.errorMessage}`);
    }
    return false;
  }

  printStationKOT({
    id: payload.kotNo,
    tableId: payload.tableNo,
    time: payload.timestamp,
    items: payload.items,
    waiter: payload.waiter,
    stationName: payload.stationName,
    printerName: payload.printerName,
    isReprint: payload.isReprint
  });
  return true;
}

/**
 * Execute station-wise printing for all segregated printer payloads of a KOT.
 */
export function printAllStationKOTs(payloads = []) {
  if (!Array.isArray(payloads) || payloads.length === 0) return;
  payloads.forEach((payload, idx) => {
    setTimeout(() => {
      printKOTPayload(payload);
    }, idx * 600);
  });
}
