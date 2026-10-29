import React, { useRef, useEffect } from 'react';

const ServiceTabs = ({ serviceType, setServiceType }) => {
  const containerRef = useRef(null);
  const tabs = ['Dine In', 'Delivery', 'Takeaway'];

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
        background: '#ffffff',
        borderBottom: '2px solid #e2e8f0',
        outline: 'none',
        cursor: 'pointer',
        width: '100%'
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
              padding: '9px 12px',
              fontSize: '0.8rem',
              fontWeight: 800,
              border: 'none',
              borderBottom: isSelected ? '3px solid #c92534' : '3px solid transparent',
              background: isSelected ? '#fff1f2' : 'transparent',
              color: isSelected ? '#c92534' : '#64748b',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              marginBottom: '-2px',
              textTransform: 'uppercase'
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
