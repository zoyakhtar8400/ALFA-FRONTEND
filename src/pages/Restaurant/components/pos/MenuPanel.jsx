import React from 'react';
import { FaSearch } from 'react-icons/fa';

const MenuPanel = ({
  searchInputRef,
  searchItem,
  setSearchItem,
  filteredGridItems,
  handleGridItemClick,
  availableCategories,
  category,
  setCategory,
  onPreviousBookingsClick,
  toast,
  isBillingDesk = false,
  loadingMenu = false
}) => {
  return (
    <div className="pos-menu-section" style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', background: '#ffffff', borderRight: '1px solid #cbd5e1' }}>
      <style>{`
        @keyframes skeletonShimmer {
          0% { background-position: -200px 0; }
          100% { background-position: calc(200px + 100%) 0; }
        }
        .pos-menu-body {
          display: flex;
          flex: 1;
          overflow: hidden;
        }
        .category-sidebar-desktop {
          width: 190px;
          background: #f8fafc;
          border-right: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          padding: 16px 10px;
          gap: 8px;
          overflow-y: auto;
        }
        .category-sidebar-desktop::-webkit-scrollbar {
          width: 4px;
        }
        .category-sidebar-desktop::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 4px;
        }
        .category-pills-mobile {
          display: none;
        }
        .items-grid-container {
          flex: 1;
          padding: 20px;
          overflow-y: auto;
          background: #ffffff;
        }

        .category-btn {
          width: 100%;
          padding: 14px 16px;
          text-align: left;
          font-size: 0.82rem;
          font-weight: 800;
          border: none;
          border-radius: 10px;
          background: transparent;
          color: #475569;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-left: 3px solid transparent;
        }
        .category-btn:hover {
          background: #f1f5f9;
          color: #1e293b;
        }
        .category-btn.active-category {
          background: #ffffff;
          color: #2563eb;
          border-left-color: #2563eb;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.05), 0 1px 3px rgba(37, 99, 235, 0.02);
        }

        .grid-item-card {
          padding: 8px 10px;
          border-radius: 10px;
          border: 1px solid #e2e8f0;
          background: #ffffff;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          justify-content: space-between;
          min-height: 70px;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 1px 3px rgba(0,0,0,0.02);
          position: relative;
          text-align: left;
        }
        .grid-item-card.item-veg {
          border-left: 4px solid #10b981;
        }
        .grid-item-card.item-nonveg {
          border-left: 4px solid #ef4444;
        }
        .grid-item-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -4px rgba(0, 0, 0, 0.05);
        }
        .grid-item-card.item-veg:hover {
          border-color: #10b981;
          box-shadow: 0 8px 20px -6px rgba(16, 185, 129, 0.15);
        }
        .grid-item-card.item-nonveg:hover {
          border-color: #ef4444;
          box-shadow: 0 8px 20px -6px rgba(239, 68, 68, 0.15);
        }
        .grid-item-card:focus-visible {
          outline: 2px solid #2563eb;
          outline-offset: 2px;
        }

        @media (max-width: 767px) {
          .pos-menu-body {
            flex-direction: column !important;
          }
          .category-sidebar-desktop {
            display: none !important;
          }
          .category-pills-mobile {
            display: flex !important;
            overflow-x: auto !important;
            white-space: nowrap !important;
            padding: 8px 12px !important;
            gap: 8px !important;
            background: #ffffff !important;
            border-bottom: 1px solid #e2e8f0 !important;
            -webkit-overflow-scrolling: touch !important;
          }
          .category-pills-mobile::-webkit-scrollbar {
            display: none;
          }
          .items-grid-container {
            padding: 12px !important;
          }
        }
      `}</style>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderBottom: '1px solid #cbd5e1', background: '#ffffff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#1e293b', margin: 0, letterSpacing: '-0.3px' }}>
            {isBillingDesk ? 'Billing Desk' : 'POS Terminal'}
          </h2>
          <span style={{
            fontSize: '9px', fontWeight: '800', padding: '2px 8px', borderRadius: '6px',
            background: isBillingDesk ? '#ecfdf5' : '#eff6ff',
            color: isBillingDesk ? '#047857' : '#2563eb'
          }}>
            {isBillingDesk ? 'Settlement' : 'Sales Engine'}
          </span>
        </div>
        
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={onPreviousBookingsClick}
            style={{ 
              padding: '6px 12px', 
              borderRadius: '6px', 
              border: '1px solid #e2e8f0', 
              background: '#ffffff', 
              color: '#475569', 
              fontSize: '0.78rem', 
              fontWeight: '700', 
              cursor: 'pointer', 
              whiteSpace: 'nowrap', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px',
              transition: 'background 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
            onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}
          >
            📋 Bookings
          </button>
          
          <div style={{ display: 'flex', border: '1.5px solid #cbd5e1', borderRadius: '6px', overflow: 'hidden', background: '#ffffff', height: '32px', alignItems: 'center' }}>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search menu..."
              value={searchItem}
              onChange={e => setSearchItem(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (filteredGridItems.length > 0) {
                    handleGridItemClick(filteredGridItems[0]);
                    setSearchItem('');
                    if (toast) toast(`Added: ${filteredGridItems[0].name}`);
                  }
                } else if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  const firstGridBtn = document.querySelector('.grid-item-card[data-index="0"]');
                  if (firstGridBtn) firstGridBtn.focus();
                } else if (e.key === 'ArrowLeft') {
                  e.preventDefault();
                  const activeCat = document.querySelector('.category-sidebar-desktop button.active-category');
                  if (activeCat) activeCat.focus();
                  else {
                    const firstCat = document.querySelector('.category-sidebar-desktop button');
                    if (firstCat) firstCat.focus();
                  }
                }
              }}
              style={{ border: 'none', padding: '6px 10px', fontSize: '0.78rem', outline: 'none', width: '130px', fontWeight: 600 }}
            />
            <button style={{ border: 'none', background: '#f1f5f9', color: '#64748b', padding: '0 10px', height: '100%', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <FaSearch size={10} />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Scrollable Category Pills Bar for Mobile View */}
      <div className="category-pills-mobile">
        {availableCategories.map(cat => {
          const isSelected = category === cat;
          return (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              style={{
                padding: '6px 14px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800,
                border: isSelected ? '1.5px solid #2563eb' : '1px solid #cbd5e1',
                background: isSelected ? '#2563eb' : '#ffffff',
                color: isSelected ? '#ffffff' : '#475569',
                cursor: 'pointer', flexShrink: 0, transition: 'all 0.15s'
              }}
            >
              {cat}
            </button>
          );
        })}
      </div>

      <div className="pos-menu-body">
        {/* Desktop Vertical Category Sidebar */}
        <div className="category-sidebar-desktop">
          {availableCategories.map((cat, idx) => {
            const isSelected = category === cat;
            return (
              <button
                key={cat}
                className={`category-btn ${isSelected ? 'active-category' : ''}`}
                data-cat-index={idx}
                onClick={() => setCategory(cat)}
                tabIndex={0}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setCategory(cat);
                  } else if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    const nextCat = document.querySelector(`.category-sidebar-desktop button[data-cat-index="${idx + 1}"]`);
                    if (nextCat) nextCat.focus();
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    const prevCat = document.querySelector(`.category-sidebar-desktop button[data-cat-index="${idx - 1}"]`);
                    if (prevCat) prevCat.focus();
                  } else if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    if (searchInputRef.current) {
                      searchInputRef.current.focus();
                      searchInputRef.current.select();
                    }
                  }
                }}
              >
                <span>{cat}</span>
                <span style={{ 
                  width: '6px', height: '6px', borderRadius: '50%', 
                  background: isSelected ? '#2563eb' : 'transparent' 
                }} />
              </button>
            );
          })}
        </div>

        {/* Food Items Grid (100% width on Mobile) */}
        <div className="items-grid-container">
          {loadingMenu ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '12px' }}>
              {Array.from({ length: 12 }).map((_, idx) => (
                <div key={idx} style={{
                  padding: '16px 10px', borderRadius: '14px', border: '1px solid #e2e8f0',
                  background: 'linear-gradient(90deg, #f8fafc 25%, #cbd5e1 50%, #f8fafc 75%)',
                  backgroundSize: '200% 100%', animation: 'skeletonShimmer 1.5s infinite',
                  minHeight: '70px'
                }} />
              ))}
            </div>
          ) : filteredGridItems.length === 0 ? (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: '#64748b', fontSize: '0.85rem', fontWeight: 700 }}>
              No menu items available in this category
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(115px, 1fr))', gap: '12px' }}>
              {filteredGridItems.map((item, idx) => (
                <button
                  key={item.id ? `${item.id}-${item.name}-${idx}` : item.name || idx}
                  className={`grid-item-card ${item.isVeg ? 'item-veg' : 'item-nonveg'}`}
                  data-index={idx}
                  onClick={() => handleGridItemClick(item)}
                  onKeyDown={e => {
                    const maxIndex = filteredGridItems.length - 1;
                    let targetIndex = idx;
                    if (e.key === 'ArrowDown') {
                      e.preventDefault();
                      targetIndex = Math.min(maxIndex, idx + 4);
                    } else if (e.key === 'ArrowUp') {
                      e.preventDefault();
                      targetIndex = Math.max(0, idx - 4);
                    } else if (e.key === 'ArrowRight') {
                      e.preventDefault();
                      targetIndex = Math.min(maxIndex, idx + 1);
                    } else if (e.key === 'ArrowLeft') {
                      e.preventDefault();
                      targetIndex = Math.max(0, idx - 1);
                    } else if (e.key === 'Escape') {
                      e.preventDefault();
                      if (searchInputRef.current) {
                        searchInputRef.current.focus();
                        searchInputRef.current.select();
                      }
                    }
                    if (targetIndex !== idx) {
                      const targetBtn = document.querySelector(`.grid-item-card[data-index="${targetIndex}"]`);
                      if (targetBtn) targetBtn.focus();
                    }
                  }}
                >
                  {/* Top: Veg / Non Veg FSSAI Symbol & variants status badge */}
                  <div style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      {/* FSSAI Square Icon */}
                      <span style={{ 
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '12px',
                        height: '12px',
                        border: `1.5px solid ${item.isVeg ? '#10b981' : '#ef4444'}`,
                        borderRadius: '2px',
                        padding: '1px',
                        flexShrink: 0
                      }}>
                        <span style={{
                          width: '5px',
                          height: '5px',
                          borderRadius: '50%',
                          background: item.isVeg ? '#10b981' : '#ef4444'
                        }} />
                      </span>
                      {item.variants && item.variants.length > 0 && (
                        <span style={{ fontSize: '7px', background: '#eff6ff', color: '#2563eb', padding: '2px 5px', borderRadius: '4px', fontWeight: 800 }}>
                          VARIANTS
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#1e293b', lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {item.name}
                    </div>
                  </div>

                  {/* Bottom: Price indicator */}
                  <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: '900', color: '#0f172a' }}>
                      ₹{item.price ? Math.round(item.price) : 0}
                    </span>
                    {item.variants && item.variants.length > 0 && (
                      <span style={{ fontSize: '7.5px', color: '#64748b', fontWeight: 700 }}>
                        {item.variants.length} sizes
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(MenuPanel);
