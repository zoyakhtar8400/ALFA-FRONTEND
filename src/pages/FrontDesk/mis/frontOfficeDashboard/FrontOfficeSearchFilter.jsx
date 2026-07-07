import React from 'react';
import { FaFilter, FaSortAmountDown } from 'react-icons/fa';
import CommonSearch from '../../../../components/common/CommonSearch';

const FrontOfficeSearchFilter = ({
  searchQuery,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  activeTab,
  onActiveTabChange,
  counts = {},
  sortBy,
  onSortChange,
  categories = []
}) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        background: 'var(--surface)',
        borderRadius: '16px',
        border: '1px solid var(--border)',
        padding: '12px 18px',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Search Input using reusable CommonSearch */}
      <div style={{ minWidth: '240px', flex: 1 }}>
        <CommonSearch
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search Guest Name, Room No, GRC..."
        />
      </div>

      {/* Filter & Sort controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        {/* Status Dropdown selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <FaFilter style={{ color: 'var(--text-secondary)', fontSize: '11px' }} />
          <select
            value={activeTab}
            onChange={(e) => onActiveTabChange(e.target.value)}
            className="entries-select"
            style={{ height: '38px', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 600 }}
          >
            <option value="Current Occupancy">Current Occupancy ({counts['Current Occupancy'] ?? 0})</option>
            <option value="Arrivals">Arrivals ({counts['Arrivals'] ?? 0})</option>
            <option value="Room Status">Room Status ({counts['Room Status'] ?? 0})</option>
            <option value="Departures">Departures ({counts['Departures'] ?? 0})</option>
            <option value="Expected Arrivals">Expected Arrivals ({counts['Expected Arrivals'] ?? 0})</option>
            <option value="Expected Departures">Expected Departures ({counts['Expected Departures'] ?? 0})</option>
            <option value="Pending Bills">Pending Bills ({counts['Pending Bills'] ?? 0})</option>
          </select>
        </div>

        {/* Category Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <FaFilter style={{ color: 'var(--text-secondary)', fontSize: '11px' }} />
          <select
            value={categoryFilter}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="entries-select"
            style={{ height: '38px', borderRadius: '10px', fontSize: '0.82rem' }}
          >
            <option value="All">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Sort By */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <FaSortAmountDown style={{ color: 'var(--text-secondary)', fontSize: '11px' }} />
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="entries-select"
            style={{ height: '38px', borderRadius: '10px', fontSize: '0.82rem' }}
          >
            <option value="guestName">Sort by Guest Name</option>
            <option value="roomNo">Sort by Room No</option>
            <option value="arrival">Sort by Arrival Date</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default FrontOfficeSearchFilter;
