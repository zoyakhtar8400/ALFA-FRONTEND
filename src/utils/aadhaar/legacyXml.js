import { GENDER_LABELS, formatAddress } from './types.js';

/**
 * Parses pre-2018 Unsigned Legacy XML Aadhaar Barcode
 */
export function parseLegacyXml(text) {
  const getAttr = (attr) => {
    const match = text.match(new RegExp(`${attr}="([^"]*)"`, 'i'));
    return match ? match[1].trim() : '';
  };

  const name = getAttr('name');
  const genderCode = getAttr('gender');
  const dob = getAttr('dob') || getAttr('yob');
  const careOf = getAttr('co');
  const house = getAttr('house');
  const street = getAttr('street');
  const landmark = getAttr('lm');
  const locality = getAttr('loc');
  const vtc = getAttr('vtc');
  const district = getAttr('dist');
  const state = getAttr('state');
  const pincode = getAttr('pc');
  const uid = getAttr('uid');

  const gender = GENDER_LABELS[genderCode] || genderCode || 'Other';

  let age = '';
  if (dob) {
    const parts = dob.split('/');
    let birthYear = null;
    if (parts.length === 3) birthYear = parseInt(parts[2], 10);
    else if (dob.length === 4) birthYear = parseInt(dob, 10);
    
    if (birthYear && !isNaN(birthYear)) {
      const currentYear = new Date().getFullYear();
      age = String(currentYear - birthYear);
    }
  }

  const addressObj = { careOf, house, street, landmark, locality, vtc, district, state, pincode };
  const fullAddress = formatAddress(addressObj);
  const last4 = uid ? uid.slice(-4) : '';

  return {
    rawPayload: text,
    type: 'LEGACY_XML',
    name,
    dob,
    age,
    gender,
    address: addressObj,
    fullAddress,
    last4: last4 ? `XXXX XXXX ${last4}` : '',
    photoBytes: null
  };
}
