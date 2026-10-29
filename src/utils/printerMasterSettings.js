/**
 * Printer Master & User Printer Access Configuration Manager
 * Manages printer routing dependent on Item Categories and enforces User Printer Access permissions.
 */

// Retrieve active Printer Setup for the given store/outlet
export function getPrinterMasterSetup(storeId = null) {
  try {
    const activeOutlet = storeId || localStorage.getItem('activeOutletId') || 'ROOM SERVICE';
    let configStr = localStorage.getItem(`alfa_printer_setup_${activeOutlet}`);
    if (!configStr) {
      configStr = localStorage.getItem('alfa_printer_setup_active');
    }
    if (configStr) {
      const parsed = JSON.parse(configStr);
      return {
        outlet: parsed.outlet || activeOutlet,
        systemName: parsed.systemName || 'DESKTOP-LCTG5JN',
        billPrintingPath: parsed.billPrintingPath || 'RP3200 plus(U) 12',
        billPrintingType: parsed.billPrintingType || 'BILL PLAIN (4/6) INCH',
        kotPrintingType: parsed.kotPrintingType || 'KOT STANDARD (3 INCH)',
        kotTokenPrintingPath: parsed.kotTokenPrintingPath || '',
        centralKotPrintingPath: parsed.centralKotPrintingPath || '',
        orderPrintingType: parsed.orderPrintingType || '',
        orderBookingPrintingPath: parsed.orderBookingPrintingPath || '',
        itemLabelPrintingPath: parsed.itemLabelPrintingPath || '',
        categoryPaths: Array.isArray(parsed.categoryPaths) ? parsed.categoryPaths : []
      };
    }
  } catch (e) {
    console.warn('Error reading printer master setup:', e);
  }

  return {
    outlet: 'ROOM SERVICE',
    systemName: 'DESKTOP-LCTG5JN',
    billPrintingPath: 'RP3200 plus(U) 12',
    billPrintingType: 'BILL PLAIN (4/6) INCH',
    kotPrintingType: 'KOT STANDARD (3 INCH)',
    kotTokenPrintingPath: '',
    centralKotPrintingPath: '',
    orderPrintingType: '',
    orderBookingPrintingPath: '',
    itemLabelPrintingPath: '',
    categoryPaths: []
  };
}

/**
 * Resolves the designated printer for a specific item category based on
 * the "Item Categorywise Printing Path" configured in Printer Master.
 */
export function getPrinterForItemCategory(categoryName, storeId = null) {
  const setup = getPrinterMasterSetup(storeId);
  if (!categoryName) {
    return setup.centralKotPrintingPath || setup.billPrintingPath || 'RP3200 plus(U) 12';
  }

  const cleanTarget = String(categoryName).trim().toUpperCase();

  // Search in configured Item Category paths
  if (Array.isArray(setup.categoryPaths) && setup.categoryPaths.length > 0) {
    const matched = setup.categoryPaths.find(row => {
      const rowCat = String(row.category || '').trim().toUpperCase();
      return rowCat === cleanTarget || cleanTarget.includes(rowCat) || rowCat.includes(cleanTarget);
    });

    if (matched && matched.printer) {
      return matched.printer;
    }
  }

  return setup.centralKotPrintingPath || setup.billPrintingPath || 'RP3200 plus(U) 12';
}

/**
 * Checks if the currently logged-in user has permission for a print action.
 * @param {'printBill' | 'printKot' | 'reprint'} action - Type of print action
 * @param {string} [targetPrinter] - Optional target printer name to check assigned access
 * @returns {{ allowed: boolean, message?: string }}
 */
export function checkUserPrinterAccess(action = 'printBill', targetPrinter = null) {
  try {
    let currentUser = null;
    try {
      currentUser = JSON.parse(localStorage.getItem('alfa_user') || localStorage.getItem('user') || '{}');
    } catch (e) {}

    const username = currentUser?.username || currentUser?.name || 'SA';
    const userRole = (currentUser?.role || currentUser?.user_role || '').toLowerCase();

    // Superadmin / Admin default bypass
    if (userRole === 'admin' || userRole === 'administrator' || username === 'SA' || username === 'admin') {
      return { allowed: true, username };
    }

    const accessRulesStr = localStorage.getItem('alfa_user_printer_access');
    if (!accessRulesStr) {
      // Default: allow if no custom rules configured
      return { allowed: true, username };
    }

    const rules = JSON.parse(accessRulesStr);
    if (!Array.isArray(rules) || rules.length === 0) {
      return { allowed: true, username };
    }

    const matchedRule = rules.find(r =>
      String(r.username || '').toLowerCase() === username.toLowerCase() ||
      (currentUser?.id && String(r.userId) === String(currentUser.id)) ||
      (r.role && String(r.role).toLowerCase() === userRole)
    );

    if (!matchedRule) {
      return { allowed: true, username };
    }

    if (action === 'printBill' && matchedRule.canPrintBill === false) {
      return {
        allowed: false,
        username,
        message: `Access Denied: User "${username}" is not authorized to print Bills.`
      };
    }

    if (action === 'printKot' && matchedRule.canPrintKot === false) {
      return {
        allowed: false,
        username,
        message: `Access Denied: User "${username}" is not authorized to print Kitchen Order Tickets (KOT).`
      };
    }

    if (action === 'reprint' && matchedRule.canReprint === false) {
      return {
        allowed: false,
        username,
        message: `Access Denied: User "${username}" is not authorized to reprint documents.`
      };
    }

    // Check printer hardware assignment
    if (targetPrinter && matchedRule.assignedPrinter && matchedRule.assignedPrinter !== 'ALL') {
      if (matchedRule.assignedPrinter.toLowerCase() !== targetPrinter.toLowerCase()) {
        return {
          allowed: false,
          username,
          message: `Access Denied: User "${username}" is restricted to printer "${matchedRule.assignedPrinter}".`
        };
      }
    }

    return { allowed: true, username };
  } catch (err) {
    console.warn('Error verifying user printer access:', err);
    return { allowed: true };
  }
}
