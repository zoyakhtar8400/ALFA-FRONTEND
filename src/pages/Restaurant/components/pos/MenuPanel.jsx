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
    <div className="pos-menu-section" style={{ flex: 1, flexDirection: 'column', height: '100%', background: '#fff', borderRight: '1px solid #cbd5e1' }}>
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
          width: 180px;
          background: #fff;
          border-right: 1px solid #cbd5e1;
          display: flex;
          flex-direction: column;
          padding-top: 12px;
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
          background: #fff;
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
            background: #f8fafc !important;
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

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderBottom: '1px solid #cbd5e1', background: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: isBillingDesk ? '#047857' : '#0e7490', margin: 0, letterSpacing: '0.5px' }}>
            {isBillingDesk ? 'RESTAURANT BILLING DESK' : 'RESTAURANT POS'}
          </h2>
          <span style={{
            fontSize: '0.7rem', fontWeight: 800, padding: '3px 8px', borderRadius: '12px',
            background: isBillingDesk ? '#ecfdf5' : '#ecfeff',
            color: isBillingDesk ? '#047857' : '#0e7490',
            border: isBillingDesk ? '1px solid #a7f3d0' : '1px solid #a5f3fc'
          }}>
            {isBillingDesk ? 'Cashier & Settlement' : 'Point of Sale'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            onClick={onPreviousBookingsClick}
            style={{ padding: '7px 14px', borderRadius: '6px', border: '1.5px solid #0e7490', background: '#ecfeff', color: '#0e7490', fontSize: '0.78rem', fontWeight: 800, cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#0e7490'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#ecfeff'; e.currentTarget.style.color = '#0e7490'; }}
          >
            📋 Previous Bookings
          </button>
          <div style={{ display: 'flex', border: '1.5px solid #0e7490', borderRadius: '6px', overflow: 'hidden', background: '#fff' }}>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="SEARCH / ITEM ID (ENTER TO ADD)"
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
                  const firstGridBtn = document.querySelector('.grid-item-btn[data-index="0"]');
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
              style={{ border: 'none', padding: '8px 12px', fontSize: '0.8rem', outline: 'none', width: '160px' }}
            />
            <button style={{ border: 'none', background: '#0e7490', color: '#fff', padding: '8px 12px', cursor: 'pointer' }}>
              <FaSearch size={12} />
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
                border: isSelected ? '1.5px solid #0e7490' : '1px solid #cbd5e1',
                background: isSelected ? '#0e7490' : '#ffffff',
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
                className={isSelected ? 'active-category' : ''}
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
                onFocus={e => { if (!isSelected) { e.currentTarget.style.background = '#e0f2fe'; e.currentTarget.style.color = '#0e7490'; } e.currentTarget.style.outline = 'none'; e.currentTarget.style.boxShadow = '0 0 0 2px rgba(14,116,144,0.4)'; }}
                onBlur={e => { if (!isSelected) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#475569'; } e.currentTarget.style.boxShadow = 'none'; }}
                style={{
                  width: '100%', padding: '16px 20px', textAlign: 'left', fontSize: '0.85rem', fontWeight: 700, border: 'none',
                  background: isSelected ? '#f1f5f9' : 'transparent', color: isSelected ? '#0e7490' : '#475569', cursor: 'pointer',
                  borderLeft: isSelected ? '4px solid #0e7490' : '4px solid transparent',
                  transition: 'all 150ms ease-in-out'
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Food Items Grid (100% width on Mobile) */}
        <div className="items-grid-container">
          {loadingMenu ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px' }}>
              {Array.from({ length: 12 }).map((_, idx) => (
                <div key={idx} style={{
                  padding: '16px 10px', borderRadius: '8px', border: '1px solid #e2e8f0',
                  background: 'linear-gradient(90deg, #f1f5f9 25%, #cbd5e1 50%, #f1f5f9 75%)',
                  backgroundSize: '200% 100%', animation: 'skeletonShimmer 1.5s infinite',
                  minHeight: '80px'
                }} />
              ))}
            </div>
          ) : filteredGridItems.length === 0 ? (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: '#64748b', fontSize: '0.9rem', fontWeight: 700 }}>
              No menu items available in this category
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px' }}>
              {filteredGridItems.map((item, idx) => (
                <button
                  key={item.id ? `${item.id}-${item.name}-${idx}` : item.name || idx}
                  className="grid-item-btn"
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
                      const targetBtn = document.querySelector(`.grid-item-btn[data-index="${targetIndex}"]`);
                      if (targetBtn) targetBtn.focus();
                    }
                  }}
                  style={{
                    padding: '16px 10px', borderRadius: '8px',
                    border: item.isVeg === false ? '2px solid #ef4444' : '2px solid #16a34a',
                    background: '#fff', textAlign: 'center', cursor: 'pointer',
                    fontSize: '0.78rem', fontWeight: 800, color: '#334155',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex',
                    flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    minHeight: '80px', textTransform: 'uppercase', transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                >
                  <span>{item.name}</span>
                  {item.variants && item.variants.length > 0 && (
                    <span style={{ fontSize: '0.62rem', color: '#0e7490', marginTop: '4px', fontWeight: 700 }}>
                      {item.variants.length} Variants Available
                    </span>
                  )}
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
