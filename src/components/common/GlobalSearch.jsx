import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaArrowRight, FaKeyboard } from 'react-icons/fa';

// List of all indexable navigation targets across the system
const SEARCH_ITEMS = [
  { name: 'Dashboard', path: '/', category: 'General' },
  { name: 'House Keeping', path: '/housekeeping', category: 'Operations' },
  { name: 'Room Services', path: '/room-services', category: 'Operations' },
  { name: 'Banquet', path: '/banquet', category: 'Operations' },
  { name: 'Purchase', path: '/purchase', category: 'Operations' },
  { name: 'Setting / Settings', path: '/setting', category: 'General' },
  { name: 'Front Desk Overview', path: '/front-desk', category: 'Front Desk' },
  { name: 'Front Desk Reports', path: '/front-desk/report', category: 'Reports' },
  
  // Front Desk Masters
  { name: 'Tax Structure Master', path: '/front-desk/master/tax-structure', category: 'Front Desk Masters' },
  { name: 'Floor Master', path: '/front-desk/master/floor-master', category: 'Front Desk Masters' },
  { name: 'Room Feature Master', path: '/front-desk/master/room-feature', category: 'Front Desk Masters' },
  { name: 'Room Category Master', path: '/front-desk/master/room-category', category: 'Front Desk Masters' },
  { name: 'Room Master', path: '/front-desk/master/room-master', category: 'Front Desk Masters' },
  { name: 'Meal Master', path: '/front-desk/master/meal-master', category: 'Front Desk Masters' },
  { name: 'Room Rate Master', path: '/front-desk/master/room-rate-master', category: 'Front Desk Masters' },
  { name: 'Service Charge Master', path: '/front-desk/master/service-charge-master', category: 'Front Desk Masters' },
  { name: 'Company Master', path: '/front-desk/master/company-master', category: 'Front Desk Masters' },
  { name: 'Market Segment Master', path: '/front-desk/master/market-segment', category: 'Front Desk Masters' },
  { name: 'Business Master', path: '/front-desk/master/business-master', category: 'Front Desk Masters' },
  { name: 'Vehicle Master', path: '/front-desk/master/vehicle-master', category: 'Front Desk Masters' },
  { name: 'Expense Master', path: '/front-desk/master/expense-master', category: 'Front Desk Masters' },
  { name: 'City Master', path: '/front-desk/master/city-master', category: 'Front Desk Masters' },
  { name: 'State Master', path: '/front-desk/master/state-master', category: 'Front Desk Masters' },

  // Front Desk Operations
  { name: 'Booking Entry', path: '/front-desk/operation/booking', category: 'Front Desk Operations' },
  { name: 'Walkin Checkin Entry', path: '/front-desk/operation/walkin-checkin-entry', category: 'Front Desk Operations' },
  { name: 'Payment Recieve Entry', path: '/front-desk/operation/payment-recieve-entry', category: 'Front Desk Operations' },
  { name: 'Service Charge Entry', path: '/front-desk/operation/service-charge-entry', category: 'Front Desk Operations' },
  { name: 'Room Change Entry', path: '/front-desk/operation/room-change-entry', category: 'Front Desk Operations' },
  { name: 'Room Checkout Entry', path: '/front-desk/operation/room-checkout-entry', category: 'Front Desk Operations' },
  { name: 'Checkout Entry', path: '/front-desk/operation/checkout-entry', category: 'Front Desk Operations' },
  { name: 'Refund Entry', path: '/front-desk/operation/refund-entry', category: 'Front Desk Operations' },
  { name: 'Add Guest in Room Entry', path: '/front-desk/operation/add-guest-in-room-entry', category: 'Front Desk Operations' },
  { name: 'Night Audit Entry', path: '/front-desk/operation/night-audit-entry', category: 'Front Desk Operations' },
  { name: 'Guest Profile', path: '/front-desk/operation/guest-profile', category: 'Front Desk Operations' },
  { name: 'Multi Room Checkout', path: '/front-desk/operation/multi-room-checkout', category: 'Front Desk Operations' },
  { name: 'Room Enquiry Entry', path: '/front-desk/operation/room-enquiry-entry', category: 'Front Desk Operations' },
  { name: 'Expense Entry', path: '/front-desk/operation/expense-entry', category: 'Front Desk Operations' },
  { name: 'Amend Stay Entry', path: '/front-desk/operation/amend-stay-entry', category: 'Front Desk Operations' },

  // MIS
  { name: 'Reservation Dashboard', path: '/front-desk/mis/reservation-dashboard', category: 'Front Desk MIS' },
  { name: 'Front Office Dashboard', path: '/front-desk/mis/front-office-dashboard', category: 'Front Desk MIS' },

  // Restaurant & POS
  { name: 'Restaurant Overview', path: '/restaurant', category: 'Restaurant POS' },
  { name: 'Display Table (POS Layout)', path: '/restaurant/display-table', category: 'Restaurant POS' },
  { name: 'View KOT', path: '/restaurant/view-kot', category: 'Restaurant POS' },
  { name: 'Order Details', path: '/restaurant/order-details', category: 'Restaurant POS' },
  { name: 'POS Reports Hub', path: '/pos/report', category: 'Reports' },

  // POS Masters
  { name: 'Steward Master', path: '/pos/masters/steward-master', category: 'POS Masters' },
  { name: 'Delivery Master', path: '/pos/master/delivery', category: 'POS Masters' },
  { name: 'Outlet Master', path: '/pos/master/outlet', category: 'POS Masters' },
  { name: 'Table Master', path: '/pos/master/table', category: 'POS Masters' },
  { name: 'Table Structure Design', path: '/pos/master/structure-design', category: 'POS Masters' },
  { name: 'Item Tax Category Master', path: '/pos/master/tax-category', category: 'POS Masters' },
  { name: 'NC Type Master', path: '/pos/master/nc-type', category: 'POS Masters' },
  { name: 'Item Rate Update', path: '/pos/master/rate-update', category: 'POS Masters' },
  { name: 'Item Rate Category Master', path: '/pos/master/rate-category', category: 'POS Masters' },
  
  // Menu Master
  { name: 'Main Group Entry', path: '/pos/master/item-menu/main-group', category: 'Item Menu Master' },
  { name: 'Item Group Entry', path: '/pos/master/item-menu/item-group', category: 'Item Menu Master' },
  { name: 'Menu Item Entry', path: '/pos/master/item-menu/menu-item', category: 'Item Menu Master' },
  { name: 'Item Entry CSV upload', path: '/pos/master/item-menu/csv-upload', category: 'Item Menu Master' },
  { name: 'HSN Update', path: '/pos/master/item-menu/hsn-update', category: 'Item Menu Master' },
];

export const GlobalSearch = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const itemsListRef = useRef(null);

  // Filter items based on fuzzy matching
  const filteredItems = SEARCH_ITEMS.filter(item =>
    item.name.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  );

  // Reset selected index when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Handle focus when modal opens
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      // Timeout to ensure modal has mounted in the DOM
      const timer = setTimeout(() => {
        if (inputRef.current) inputRef.current.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle keydown navigation inside command palette
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % Math.max(1, filteredItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        navigate(filteredItems[selectedIndex].path);
        onClose();
      }
    }
  };

  // Scroll active item into view
  useEffect(() => {
    if (itemsListRef.current) {
      const activeEl = itemsListRef.current.children[selectedIndex];
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(10px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'start',
        justifyContent: 'center',
        paddingTop: '100px',
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      <div
        ref={containerRef}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '640px',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '16px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '480px',
          fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
        }}
      >
        {/* Search Input Box */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px',
            borderBottom: '1px solid #f1f5f9'
          }}
        >
          <FaSearch style={{ color: '#64748b', fontSize: '18px' }} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type page name or category to search (e.g. 'Room Category')...."
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: '1rem',
              color: '#0f172a',
              background: 'transparent',
              width: '100%'
            }}
          />
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 8px',
              backgroundColor: '#f1f5f9',
              borderRadius: '6px',
              color: '#64748b',
              fontSize: '0.75rem',
              fontWeight: 600
            }}
          >
            ESC
          </div>
        </div>

        {/* Results List */}
        <div
          ref={itemsListRef}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}
        >
          {filteredItems.length > 0 ? (
            filteredItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.path + item.name}
                  onClick={() => {
                    navigate(item.path);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    backgroundColor: isSelected ? 'rgba(65, 138, 139, 0.1)' : 'transparent',
                    borderLeft: isSelected ? '4px solid #418a8b' : '4px solid transparent',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span
                      style={{
                        fontSize: '0.88rem',
                        fontWeight: 600,
                        color: isSelected ? '#418a8b' : '#1e293b'
                      }}
                    >
                      {item.name}
                    </span>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        color: isSelected ? '#418a8b' : '#64748b'
                      }}
                    >
                      {item.category}
                    </span>
                  </div>
                  {isSelected && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        color: '#418a8b',
                        fontSize: '0.8rem',
                        fontWeight: 700
                      }}
                    >
                      <span>Go</span>
                      <FaArrowRight size={10} />
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px 20px',
                color: '#64748b',
                gap: '8px'
              }}
            >
              <FaKeyboard size={24} style={{ color: '#cbd5e1' }} />
              <span style={{ fontSize: '0.85rem' }}>No matching pages found.</span>
            </div>
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: '#f8fafc',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.75rem',
            color: '#64748b'
          }}
        >
          <div>
            Use <kbd style={{ padding: '2px 5px', backgroundColor: '#e2e8f0', borderRadius: '4px', margin: '0 2px' }}>↑</kbd> <kbd style={{ padding: '2px 5px', backgroundColor: '#e2e8f0', borderRadius: '4px', margin: '0 2px' }}>↓</kbd> to navigate, <kbd style={{ padding: '2px 5px', backgroundColor: '#e2e8f0', borderRadius: '4px', margin: '0 2px' }}>Enter</kbd> to select.
          </div>
          <div>
            Press <kbd style={{ padding: '2px 5px', backgroundColor: '#e2e8f0', borderRadius: '4px', margin: '0 2px' }}>Esc</kbd> to close.
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalSearch;
