import React from 'react';

/**
 * Reusable StatusBadge component to display active, inactive, yes, no or other statuses consistently.
 */
const StatusBadge = ({ value, activeValue }) => {
  const valStr = String(value || '');
  const valLower = valStr.toLowerCase();
  
  const isActive = activeValue 
    ? valLower === String(activeValue).toLowerCase()
    : valLower === 'active' || valLower === 'yes';

  return (
    <span className={`status-badge ${isActive ? 'available' : 'occupied'}`}>
      {valStr}
    </span>
  );
};

export default StatusBadge;
