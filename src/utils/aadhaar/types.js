export const GENDER_LABELS = {
  M: 'Male',
  F: 'Female',
  T: 'Other',
  Male: 'Male',
  Female: 'Female',
  Other: 'Other'
};

/**
 * Parses and formats address object into readable address lines
 */
export function formatAddress(addr = {}) {
  const parts = [];
  if (addr.careOf) parts.push(`C/O ${addr.careOf}`);
  if (addr.house) parts.push(addr.house);
  if (addr.street) parts.push(addr.street);
  if (addr.landmark) parts.push(addr.landmark);
  if (addr.locality) parts.push(addr.locality);
  if (addr.vtc) parts.push(addr.vtc);
  if (addr.district) parts.push(addr.district);
  if (addr.state) parts.push(addr.state);
  if (addr.pincode) parts.push(addr.pincode);
  return parts.filter(Boolean).join(', ');
}
