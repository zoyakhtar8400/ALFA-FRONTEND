import React from 'react';
import { FaSearch, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

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
  loadingMenu = false,
  onOpenAddItem,
  onEditTempItem,
  onDeleteTempItem
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
          background: #fff1f2;
          color: #c92534;
          border-left: 4px solid #c92534;
          font-weight: 900;
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
          outline: 2px solid #29b49b;
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
            background: isBillingDesk ? 'rgba(27, 122, 109, 0.08)' : 'rgba(41, 180, 155, 0.1)',
            color: isBillingDesk ? '#1b7a6d' : '#0f766e'
          }}>
            {isBillingDesk ? 'Settlement' : 'Sales Engine'}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {/* + Add Item Button */}
          <button
            type="button"
            onClick={onOpenAddItem}
            title="Create Temporary Item for Billing"
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              border: '1.5px solid #0d9488',
              background: '#f0fdfa',
              color: '#0d9488',
              fontSize: '0.78rem',
              fontWeight: '800',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#0d9488'; e.currentTarget.style.color = '#ffffff'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#f0fdfa'; e.currentTarget.style.color = '#0d9488'; }}
          >
            <FaPlus size={10} /> Add Item
          </button>

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

          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <div style={{ display: 'flex', border: '1.5px solid #cbd5e1', borderRadius: '6px', overflow: 'hidden', background: '#ffffff', height: '32px', alignItems: 'center' }}>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search Item"
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
              <button style={{ border: 'none', background: '#f1f5f9', color: '#64748b', padding: '0 8px', height: '100%', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <FaSearch size={10} />
              </button>
            </div>

            <div style={{ display: 'flex', border: '1.5px solid #cbd5e1', borderRadius: '6px', overflow: 'hidden', background: '#ffffff', height: '32px', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="Short Code"
                onChange={e => setSearchItem(e.target.value)}
                style={{ border: 'none', padding: '6px 8px', fontSize: '0.78rem', outline: 'none', width: '80px', fontWeight: 600 }}
              />
            </div>
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
                      {/* FSSAI Square Icon & TEMP badge */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
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
                        {(item.is_open_item === 1 || item.is_open_item === '1' || item.is_open_item === true) && (
                          <span style={{
                            fontSize: '6.5px',
                            fontWeight: 900,
                            background: '#fef3c7',
                            color: '#b45309',
                            padding: '1px 4px',
                            borderRadius: '3px',
                            border: '1px solid #fde68a',
                            lineHeight: 1
                          }}>
                            TEMP
                          </span>
                        )}
                      </div>

                      {/* Right side: Edit & Delete for temp item (only before billing is completed), or VARIANTS badge */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        {(item.is_open_item === 1 || item.is_open_item === '1' || item.is_open_item === true) && !(item.is_billed === 1 || item.is_billed === '1' || item.is_billed === true) && (
                          <div style={{ display: 'inline-flex', gap: '3px' }} onClick={e => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditTempItem?.(item);
                              }}
                              title="Edit Temporary Item"
                              aria-label="Edit Temporary Item"
                              style={{
                                background: '#f8fafc',
                                border: '1px solid #cbd5e1',
                                color: '#475569',
                                borderRadius: '3px',
                                padding: '2px 4px',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                              onMouseEnter={e => { e.currentTarget.style.color = '#0284c7'; e.currentTarget.style.borderColor = '#0284c7'; }}
                              onMouseLeave={e => { e.currentTarget.style.color = '#475569'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
                            >
                              <FaEdit size={8.5} />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteTempItem?.(item);
                              }}
                              title="Delete Temporary Item"
                              aria-label="Delete Temporary Item"
                              style={{
                                background: '#fef2f2',
                                border: '1px solid #fecaca',
                                color: '#ef4444',
                                borderRadius: '3px',
                                padding: '2px 4px',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                              onMouseEnter={e => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = '#ffffff'; }}
                              onMouseLeave={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = '#ef4444'; }}
                            >
                              <FaTrash size={8.5} />
                            </button>
                          </div>
                        )}
                        {item.variants && item.variants.length > 0 && (
                          <span
                            title={item.variants.map(v => `${v.name}${v.serving ? ` (${v.serving})` : ''}: ₹${v.price}`).join(', ')}
                            style={{
                              fontSize: '7px',
                              background: '#e0f2fe',
                              color: '#0369a1',
                              border: '1px solid #bae6fd',
                              padding: '2px 5px',
                              borderRadius: '4px',
                              fontWeight: 800,
                              letterSpacing: '0.02em'
                            }}
                          >
                            {item.variants.some(v => /half|full/i.test(v.name)) ? 'HALF / FULL' : 'VARIANTS'}
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#1e293b', lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {item.name}
                    </div>
                  </div>

                  {/* Bottom: Price indicator, Unit & Addons / Variants */}
                  <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: '900', color: '#0f172a' }}>
                        ₹{item.price ? Math.round(item.price) : 0}
                      </span>
                      {item.unit && (
                        <span style={{ fontSize: '7.5px', color: '#64748b', fontWeight: 700 }}>
                          /{item.unit}
                        </span>
                      )}
                    </div>
                    {item.variants && item.variants.length > 0 && (
                      <span style={{ fontSize: '7.5px', color: '#0e7490', background: '#ecfeff', padding: '1px 5px', borderRadius: '4px', fontWeight: 800 }}>
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
