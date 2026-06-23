import React from 'react';
import { FaSearch } from 'react-icons/fa';

/**
 * CommonSearch input component with search icon and smooth focus transitions.
 */
const CommonSearch = ({ value, onChange, placeholder = 'Search...' }) => {
  return (
    <div className="relative flex items-center">
      <span className="absolute left-4 text-slate-400 pointer-events-none">
        <FaSearch size={12} style={{ color: 'var(--text-secondary)' }} />
      </span>
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="table-search-input focus:w-[280px]"
        style={{ paddingLeft: '38px' }}
      />
    </div>
  );
};

export default CommonSearch;

