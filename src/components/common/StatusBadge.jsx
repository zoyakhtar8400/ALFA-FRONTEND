/**
 * Reusable StatusBadge component to display active, inactive, yes, no,
 * checkin, checkout, dirty, clean, or cancelled statuses consistently.
 */
const StatusBadge = ({ value, status, activeValue }) => {
  const raw = value ?? status;
  const valStr = String(raw || '');
  const valLower = valStr.replace(/[\s_]+/g, '-').toLowerCase();

  const getStatusClass = () => {
    if (activeValue) {
      return valLower === String(activeValue).toLowerCase() ? 'available' : 'occupied';
    }
    
    switch (valLower) {
      case 'active':
      case 'yes':
      case 'available':
      case 'clean':
        return 'available';
      case 'inactive':
      case 'no':
      case 'occupied':
      case 'dirty':
        return 'occupied';
      case 'reserved':
      case 'pending':
      case 'tentative':
        return 'reserved';
      case 'checked-in':
      case 'check-in':
        return 'checked-in';
      case 'checked-out':
      case 'check-out':
      case 'cancelled':
      case 'canceled':
        return 'checked-out';
      case 'out-of-order':
      case 'maintenance':
        return 'out-of-order';
      default:
        return 'checked-out';
    }
  };

  return (
    <span className={`status-badge ${getStatusClass()}`}>
      {valStr}
    </span>
  );
};

export default StatusBadge;
