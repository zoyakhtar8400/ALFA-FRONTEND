/**
 * Centralized Frontend Unit Conversion Utility for ALFA HMS
 */

export function normalizeUnit(unitStr) {
  if (!unitStr || typeof unitStr !== 'string') return 'pcs';
  const u = unitStr.trim().toLowerCase();
  
  if (['kg', 'kilos', 'kilogram', 'kilograms'].includes(u)) return 'kg';
  if (['g', 'gm', 'gram', 'grams'].includes(u)) return 'g';
  if (['l', 'ltr', 'liter', 'liters', 'litre', 'litres'].includes(u)) return 'l';
  if (['ml', 'milliliter', 'milliliters'].includes(u)) return 'ml';
  if (['dozen', 'doz'].includes(u)) return 'dozen';
  if (['box', 'boxes'].includes(u)) return 'box';
  if (['pcs', 'pc', 'piece', 'pieces', 'unit', 'units'].includes(u)) return 'pcs';

  return u;
}

export function convertQuantity(qty, fromUnit, toUnit) {
  const amount = Number(qty) || 0;
  const from = normalizeUnit(fromUnit);
  const to = normalizeUnit(toUnit);

  if (from === to) return amount;

  if (from === 'g' && to === 'kg') return amount / 1000;
  if (from === 'kg' && to === 'g') return amount * 1000;

  if (from === 'ml' && to === 'l') return amount / 1000;
  if (from === 'l' && to === 'ml') return amount * 1000;

  if (from === 'dozen' && to === 'pcs') return amount * 12;
  if (from === 'pcs' && to === 'dozen') return amount / 12;

  return amount;
}

export function formatStockWithUnit(qty, unit) {
  const amount = Number(qty) || 0;
  const norm = normalizeUnit(unit);
  if (norm === 'g' && amount >= 1000) {
    return `${(amount / 1000).toFixed(2)} Kg`;
  }
  if (norm === 'ml' && amount >= 1000) {
    return `${(amount / 1000).toFixed(2)} L`;
  }
  return `${amount} ${unit || 'Pcs'}`;
}
