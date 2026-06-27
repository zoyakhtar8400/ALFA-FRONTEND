import React, { useState, useEffect, useRef } from 'react';
import { FaSearch } from 'react-icons/fa';

/**
 * CommonSearch input component with search icon and smooth focus transitions.
 * Optimized with a 300ms debounce and React.memo to keep focus and prevent lag.
 */
const CommonSearch = React.memo(({ value, onChange, placeholder = 'Search...' }) => {
  const [inputValue, setInputValue] = useState(value);
  const debounceTimeoutRef = useRef(null);

  // Sync internal input value with external value if it changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleChange = (e) => {
    const val = e.target.value;
    setInputValue(val);

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      onChange({ target: { value: val } });
    }, 300);
  };

  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="relative flex items-center">
      <span className="absolute left-4 text-slate-400 pointer-events-none">
        <FaSearch size={12} style={{ color: 'var(--text-secondary)' }} />
      </span>
      <input
        type="text"
        value={inputValue}
        onChange={handleChange}
        placeholder={placeholder}
        className="table-search-input focus:w-[280px]"
        style={{ paddingLeft: '38px' }}
      />
    </div>
  );
});

export default CommonSearch;

