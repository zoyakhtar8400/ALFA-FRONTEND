import React, { useRef, useEffect } from 'react';

const ServiceTabs = ({ serviceType, setServiceType }) => {
  const containerRef = useRef(null);
  const tabs = ['Dine In', 'Delivery', 'Pickup'];

  const handleKeyDown = (e) => {
    const idx = tabs.indexOf(serviceType);
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const nextIdx = (idx + 1) % tabs.length;
      setServiceType(tabs[nextIdx]);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prevIdx = (idx - 1 + tabs.length) % tabs.length;
      setServiceType(tabs[prevIdx]);
    }
  };

  return (
    <div
      ref={containerRef}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      style={{
        display: 'flex',
        background: '#f1f5f9',
        padding: '3px',
        borderRadius: '8px',
        border: '1px solid #cbd5e1',
        outline: 'none',
        cursor: 'pointer'
      }}
      aria-label="POS Service Type Selector (Use Arrow Keys)"
    >
      {tabs.map((type) => {
        const isSelected = serviceType === type;
        return (
          <button
            key={type}
            type="button"
            onClick={() => setServiceType(type)}
            tabIndex={-1}
            style={{
              flex: 1,
              padding: '8px 12px',
              fontSize: '0.8rem',
              fontWeight: 700,
              border: 'none',
              borderRadius: '6px',
              background: isSelected ? '#0e7490' : 'transparent',
              color: isSelected ? '#ffffff' : '#64748b',
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
          >
            {type}
          </button>
        );
      })}
    </div>
  );
};

export default React.memo(ServiceTabs);
