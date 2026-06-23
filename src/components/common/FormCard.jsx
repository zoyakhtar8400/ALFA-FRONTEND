import React from 'react';

/**
 * Reusable FormCard component for grouping form sections into clean, consistent, rounded containers.
 */
const FormCard = ({ title, children, className = "" }) => {
  return (
    <div className={`bg-white p-4 md:p-5 mb-4 animate-in duration-200 ${className}`}>
      {title && (
        <h3 className="text-xs font-bold text-[#244e5f] mb-3 pb-2 uppercase tracking-wider">
          {title}
        </h3>
      )}
      <div className="form-card-content">
        {children}
      </div>
    </div>
  );
};

export default FormCard;
