import { inflate } from 'pako';
import { GENDER_LABELS, formatAddress } from './types.js';

/**
 * Converts decimal big-integer string into big-endian byte array
 */
export function bigIntegerStringToBytes(digits) {
  let value = BigInt(digits);
  if (value === 0n) return new Uint8Array([0]);
  const out = [];
  const BYTE = 256n;
  while (value > 0n) {
    out.push(Number(value % BYTE));
    value /= BYTE;
  }
  return new Uint8Array(out.reverse());
}

/**
 * Decompresses Gzip payload via pako.inflate
 */
export function maybeInflate(bytes) {
  try {
    return inflate(bytes);
  } catch (err) {
    return bytes;
  }
}

/**
 * Parses UIDAI Secure QR Code byte stream (V1/V2)
 */
export function parseSecureQr(digits) {
  const rawBytes = bigIntegerStringToBytes(digits);
  const decompressed = maybeInflate(rawBytes);

  const textDecoder = new TextDecoder('utf-8');
  let offset = 0;

  // Header byte check (UIDAI Secure QR version delimiter)
  if (decompressed[0] === 255 || decompressed[0] === 0xFF) {
    offset = 1;
  }

  // Field extraction based on 0xFF (255) delimiters
  const fields = [];
  let currentStart = offset;

  for (let i = offset; i < decompressed.length; i++) {
    if (decompressed[i] === 255) {
      const slice = decompressed.subarray(currentStart, i);
      fields.push(textDecoder.decode(slice));
      currentStart = i + 1;
      // After text fields, text fields count is reached (usually 16 or 17 fields)
      if (fields.length >= 17) {
        offset = currentStart;
        break;
      }
    }
  }

  // Extract structured fields
  const emailMobileFlag = fields[0] || '0';
  const referenceId = fields[1] || '';
  const name = fields[2] || '';
  const dob = fields[3] || '';
  const genderCode = fields[4] || '';
  const careOf = fields[5] || '';
  const house = fields[6] || '';
  const street = fields[7] || '';
  const landmark = fields[8] || '';
  const locality = fields[9] || '';
  const vtc = fields[10] || '';
  const district = fields[11] || '';
  const state = fields[12] || '';
  const pincode = fields[13] || '';

  const gender = GENDER_LABELS[genderCode] || genderCode || 'Other';

  // Calculate age from DOB (Format: DD-MM-YYYY or YYYY)
  let age = '';
  if (dob) {
    const parts = dob.split('-');
    let birthYear = null;
    if (parts.length === 3) birthYear = parseInt(parts[2], 10);
    else if (parts.length === 1 && dob.length === 4) birthYear = parseInt(dob, 10);
    
    if (birthYear && !isNaN(birthYear)) {
      const currentYear = new Date().getFullYear();
      age = String(currentYear - birthYear);
    }
  }

  const addressObj = { careOf, house, street, landmark, locality, vtc, district, state, pincode };
  const fullAddress = formatAddress(addressObj);

  // Extract last 4 digits of Aadhaar from Reference ID (Format: UID/xxxx/xxxx/xxxx/xxxx/xxxx/xxxx/xxxx/yyyy)
  let last4 = '';
  if (referenceId) {
    const digitsOnly = referenceId.replace(/\D/g, '');
    if (digitsOnly.length >= 4) {
      last4 = digitsOnly.slice(-4);
    }
  }

  // Isolate binary tail for photo stream (JPEG / JP2)
  const remainingBytes = decompressed.subarray(offset);

  return {
    rawPayload: digits,
    type: 'SECURE_QR',
    referenceId,
    name,
    dob,
    age,
    gender,
    address: addressObj,
    fullAddress,
    last4: last4 ? `XXXX XXXX ${last4}` : '',
    photoBytes: remainingBytes.length > 0 ? remainingBytes : null
  };
}
