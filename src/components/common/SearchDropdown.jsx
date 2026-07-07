import { useState, useEffect, useRef } from 'react';
import { FaChevronDown, FaPlus } from 'react-icons/fa';

const SearchDropdown = ({ label, value, onChange, options, placeholder = 'Search...', required, addBtn }) => {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const filtered = options.filter(o =>
    o.label.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selected = options.find(o => o.value === value);

  return (
    <div className="form-field" style={{ marginBottom: '8px', position: 'relative' }} ref={ref}>
      <label className="form-label">{label}{required && <span className="text-red-500"> *</span>}</label>
      <div style={{ display: 'grid', gridTemplateColumns: addBtn ? '1fr auto' : '1fr', gap: '4px' }}>
        <div
          style={{ position: 'relative', cursor: 'pointer' }}
          onClick={() => setOpen(o => !o)}
        >
          {open ? (
            <input
              autoFocus
              className="form-input"
              style={{ fontSize: '0.9rem', paddingRight: '28px' }}
              placeholder={placeholder}
              value={query}
              onChange={e => { setQuery(e.target.value); }}
              onClick={e => e.stopPropagation()}
            />
          ) : (
            <div
              className="form-select"
              style={{ fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: '34px', userSelect: 'none', padding: '4px 8px', height: '34px' }}
            >
              <span style={{ color: selected ? 'inherit' : '#9ca3af' }}>
                {selected ? selected.label : `Select ${label}`}
              </span>
              <FaChevronDown style={{ fontSize: '0.75rem', color: '#9ca3af', marginLeft: '6px' }} />
            </div>
          )}

          {open && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 9999,
              background: 'var(--card-bg, #fff)', border: '1px solid var(--primary)',
              borderRadius: '6px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              maxHeight: '200px', overflowY: 'auto', marginTop: '2px',
            }}>
              {filtered.length === 0 ? (
                <div style={{ padding: '8px 12px', color: '#9ca3af', fontSize: '0.85rem' }}>No results</div>
              ) : filtered.map(o => (
                <div
                  key={o.value}
                  onMouseDown={e => { e.preventDefault(); onChange(o.value); setQuery(''); setOpen(false); }}
                  style={{
                    padding: '7px 12px', fontSize: '0.88rem', cursor: 'pointer',
                    background: value === o.value ? 'var(--primary-light)' : 'transparent',
                    color: value === o.value ? 'var(--primary)' : 'inherit',
                    fontWeight: value === o.value ? 700 : 400,
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-light)'}
                  onMouseLeave={e => e.currentTarget.style.background = value === o.value ? 'var(--primary-light)' : 'transparent'}
                >
                  {o.label}
                </div>
              ))}
            </div>
          )}
        </div>
        {addBtn && (
          <button type="button" className="btn-secondary" style={{ padding: '0 12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title={`Add ${label}`}>
            <FaPlus />
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchDropdown;
