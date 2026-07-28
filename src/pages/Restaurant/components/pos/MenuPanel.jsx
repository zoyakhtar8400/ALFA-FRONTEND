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
  toast
}) => {
  return (
    <div className="pos-menu-section" style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', background: '#fff', borderRight: '1px solid #cbd5e1' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid #cbd5e1', background: '#fff' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0e7490', margin: 0, letterSpacing: '0.5px' }}>
          RESTAURANT POS
        </h2>
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

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <div style={{ width: '180px', background: '#fff', borderRight: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', paddingTop: '20px' }}>
          {availableCategories.map(cat => {
            const isSelected = category === cat;
            return (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                tabIndex={0}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setCategory(cat); } }}
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

        <div style={{ flex: 1, padding: '24px', overflowY: 'auto', background: '#fff' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
            {filteredGridItems.map((item, idx) => (
              <button
                key={item.id || item.name}
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
                  padding: '20px 12px', borderRadius: '8px',
                  border: item.isVeg === false ? '2px solid #ef4444' : '2px solid #16a34a',
                  background: '#fff', textAlign: 'center', cursor: 'pointer',
                  fontSize: '0.8rem', fontWeight: 800, color: '#334155',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex',
                  flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  minHeight: '85px', textTransform: 'uppercase', transition: 'all 0.15s ease'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}
              >
                <span>{item.name}</span>
                {item.variants && item.variants.length > 0 && (
                  <span style={{ fontSize: '0.65rem', color: '#0e7490', marginTop: '4px', fontWeight: 700 }}>
                    {item.variants.length} Variants Available
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(MenuPanel);
