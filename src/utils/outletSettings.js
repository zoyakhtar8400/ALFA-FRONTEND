import posApi from '../api/posApi';

/**
 * Resolves configured outlet settings (Bill Header 1/2/3, Bill Slogans 1/2/3, No of Bills, No of KOT)
 * for a specific store/outlet ID or the active outlet.
 */
export async function getOutletPrintSettings(targetStoreId) {
  let matchedOutlet = null;

  try {
    const rawOutlets = localStorage.getItem('alfa_outlets');
    let outletsList = rawOutlets ? JSON.parse(rawOutlets) : [];

    if (!Array.isArray(outletsList) || outletsList.length === 0) {
      const res = await posApi.getOutlets();
      outletsList = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
      if (outletsList.length > 0) {
        localStorage.setItem('alfa_outlets', JSON.stringify(outletsList));
      }
    }

    const currentKey = String(targetStoreId || localStorage.getItem('activeOutletId') || 'STORE_1').trim().toUpperCase();

    matchedOutlet = outletsList.find(o =>
      String(o.store_id || '').toUpperCase() === currentKey ||
      String(o.id) === currentKey ||
      `STORE_${o.id}`.toUpperCase() === currentKey ||
      String(o.name || o.store_name || '').toUpperCase() === currentKey
    ) || outletsList[0];
  } catch (e) {
    console.warn('Failed to resolve outlet print settings:', e);
  }

  let settings = {};
  if (matchedOutlet?.settings) {
    if (typeof matchedOutlet.settings === 'object') {
      settings = matchedOutlet.settings;
    } else if (typeof matchedOutlet.settings === 'string') {
      try {
        settings = JSON.parse(matchedOutlet.settings);
      } catch (e) {
        settings = {};
      }
    }
  }

  const rawNoOfBills = settings.noOfBills !== undefined ? settings.noOfBills : (matchedOutlet?.noOfBills || '1');
  const rawNoOfKOT = settings.noOfKOT !== undefined ? settings.noOfKOT : (matchedOutlet?.noOfKOT || '1');

  const parsedBills = parseInt(rawNoOfBills, 10);
  const parsedKOT = parseInt(rawNoOfKOT, 10);

  return {
    outletName: matchedOutlet?.store_name || matchedOutlet?.name || settings.outletTitle || '',
    companyTitle: settings.companyTitle || '',
    billHeader1: (settings.billHeader1 || matchedOutlet?.user_line_1 || '').trim(),
    billHeader2: (settings.billHeader2 || matchedOutlet?.user_line_2 || '').trim(),
    billHeader3: (settings.billHeader3 || matchedOutlet?.user_sub_locality || '').trim(),
    billSlogan1: (settings.billSlogan1 || matchedOutlet?.footer_note || '').trim(),
    billSlogan2: (settings.billSlogan2 || '').trim(),
    billSlogan3: (settings.billSlogan3 || '').trim(),
    noOfBills: !isNaN(parsedBills) && parsedBills > 0 ? parsedBills : 1,
    noOfKOT: !isNaN(parsedKOT) && parsedKOT > 0 ? parsedKOT : 1,
    phone: matchedOutlet?.store_phone || matchedOutlet?.user_phone || matchedOutlet?.phone || '',
    gstin: settings.gstin || matchedOutlet?.gstin || ''
  };
}
