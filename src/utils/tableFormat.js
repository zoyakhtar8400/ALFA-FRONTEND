/**
 * Utility to format and normalize table numbers and labels with the correct prefix.
 * Dynamically resolves table prefix according to the active or specified outlet name (e.g., MR1 for Main Restaurant, B1 for Bar).
 * Prevents bugs like "T-T5", "TT5", "TNaN", "Table TNaN", "Table TT5".
 */

const NOISE_WORDS = new Set(['OUTLET', 'STORE', 'BRANCH', 'COUNTER', 'POS', 'RESTAURANT_OUTLET']);

/**
 * Derives a clean, uppercase prefix from an outlet name or outlet object.
 * Rules:
 *  - Explicit shortName or prefix takes priority (e.g. 'MR', 'BAR')
 *  - Strips noise words ('Outlet', 'Store', 'Branch', 'Counter', 'POS')
 *  - Multi-word (e.g. "Main Restaurant", "Alfa Restro", "Coffee Shop"): Takes initials (e.g. 'MR', 'AR', 'CS')
 *  - Single-word (e.g. "Bar", "Cafe", "Restaurant"): Takes first letter (e.g. 'B', 'C', 'R')
 *  - Fallback: 'T' if no outlet is found
 *
 * @param {string|object} [outletOrName]
 * @returns {string}
 */
export const getOutletPrefix = (outletOrName) => {
  // If explicitly passed as object
  if (outletOrName && typeof outletOrName === 'object') {
    if (outletOrName.prefix && outletOrName.prefix !== 'T') {
      return String(outletOrName.prefix).trim().toUpperCase();
    }
    if (outletOrName.shortName && outletOrName.shortName !== 'T') {
      return String(outletOrName.shortName).replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    }
    if (outletOrName.short_name && outletOrName.short_name !== 'T') {
      return String(outletOrName.short_name).replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    }
    outletOrName = outletOrName.name || outletOrName.store_name || outletOrName.outlet_name || outletOrName.title || '';
  }

  let rawName = (typeof outletOrName === 'string' && outletOrName.trim()) 
    ? outletOrName.trim() 
    : '';

  // In browser, if not provided, try local storage
  if (!rawName && typeof window !== 'undefined' && window.localStorage) {
    const savedPrefix = localStorage.getItem('active_outlet_prefix');
    if (savedPrefix && savedPrefix !== 'T') {
      return savedPrefix.trim().toUpperCase();
    }
    rawName = localStorage.getItem('active_outlet_name') ||
              localStorage.getItem('activeOutletName') ||
              localStorage.getItem('selectedOutletName') ||
              '';
  }

  if (!rawName) return 'T';

  // Clean name: replace & with 'and', remove other special symbols
  const clean = rawName.replace(/&/g, ' and ').replace(/[^a-zA-Z0-9\s]/g, ' ').trim();
  const tokens = clean.split(/\s+/).filter(Boolean);
  let meaningfulTokens = tokens.filter(t => !NOISE_WORDS.has(t.toUpperCase()));
  if (meaningfulTokens.length === 0) {
    meaningfulTokens = tokens;
  }

  if (meaningfulTokens.length >= 2) {
    // Multi-word: initials (e.g. "Main Restaurant" -> "MR", "Alfa Restro" -> "AR")
    return meaningfulTokens.map(w => w[0].toUpperCase()).join('').slice(0, 4);
  } else if (meaningfulTokens.length === 1) {
    const word = meaningfulTokens[0];
    const match = word.match(/^([a-zA-Z]+)(\d+)$/);
    if (match) {
      return `${match[1][0].toUpperCase()}${match[2]}`;
    }
    // Single word: take first letter (e.g. "Bar" -> "B", "Cafe" -> "C", "Restaurant" -> "R")
    return word[0].toUpperCase();
  }

  return 'T';
};

/**
 * Returns a clean, normalized table code (e.g., 'MR1', 'B1', 'TK-1', 'DL-1')
 * @param {string|number} val - Table number or name (e.g., 5, '5', 'T5', 'Table 5', 'MR5')
 * @param {string} [customPrefix] - Optional prefix override (if 'T', automatically derives from outlet)
 * @param {string|object} [outletOrName] - Optional outlet name or object
 * @returns {string}
 */
export const formatTableNo = (val, customPrefix, outletOrName) => {
  if (val === null || val === undefined || val === '') return 'T--';

  let s = String(val).trim();

  // Handle special types: Takeaway (TK-*) / Delivery (DL-*)
  if (/^TK[-_\s]?\d+/i.test(s)) {
    const num = s.replace(/\D/g, '') || '1';
    return `TK-${num}`;
  }
  if (/^DL[-_\s]?\d+/i.test(s)) {
    const num = s.replace(/\D/g, '') || '1';
    return `DL-${num}`;
  }

  // Remove duplicate "Table ", "Table" prefixes
  s = s.replace(/^Table\s*/i, '');

  // Determine prefix:
  // 1. If customPrefix was set in the table form (M, T, B, VIP, etc.), strictly use it!
  let p = '';
  if (customPrefix !== undefined && customPrefix !== null && String(customPrefix).trim() !== '') {
    p = String(customPrefix).trim();
  }

  // 2. If no customPrefix was passed, check if the value itself already has a prefix (e.g. M1, T1, B2)
  if (!p) {
    const match = s.match(/^([A-Za-z]+)[-_\s]*(\d+)$/);
    if (match) {
      p = match[1];
      s = match[2];
    } else {
      // Fallback: derive from outlet name or default to 'T'
      p = getOutletPrefix(outletOrName) || 'T';
    }
  } else {
    // If customPrefix is explicitly provided:
    // If s already starts with this exact prefix (e.g., M1 with prefix M), extract digits
    const pRegex = new RegExp(`^${p}[-_\\s]*(\\d+)$`, 'i');
    const pMatch = s.match(pRegex);
    if (pMatch) {
      return `${p}${pMatch[1]}`;
    }

    // If s starts with other letters (e.g., legacy prefix like T5 when prefix changed to M), strip them
    s = s.replace(/^[A-Za-z]+[-_\s]*/, '');
  }

  // Extract digits
  const digits = s.replace(/\D/g, '') || s;
  return `${p}${digits}`;
};

/**
 * Returns a human-friendly label (e.g., 'Table MR5', 'Takeaway TK-1', 'Delivery DL-1')
 * @param {string|number} val
 * @param {string} [customPrefix]
 * @param {string|object} [outletOrName]
 * @returns {string}
 */
export const formatTableLabel = (val, customPrefix, outletOrName) => {
  if (!val) return 'Table';
  const cleanNo = formatTableNo(val, customPrefix, outletOrName);
  if (cleanNo.startsWith('TK-')) return `Takeaway ${cleanNo}`;
  if (cleanNo.startsWith('DL-')) return `Delivery ${cleanNo}`;
  return `Table ${cleanNo}`;
};

export default {
  getOutletPrefix,
  formatTableNo,
  formatTableLabel
};
