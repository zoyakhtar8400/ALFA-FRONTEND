import { useState, useRef, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaBars, FaBell, FaSearch, FaUserCircle, FaFlask, FaTimes } from 'react-icons/fa';

// Enterprise Global Search Mock Data (Guests, Rooms, Bookings, Companies, Bills, GRC records)
const SEARCH_DATA = [
  { type: 'Guest', name: 'John Smith', detail: 'Room 101 | +91 98765 43210', link: '/front-desk/mis-reservation-dashboard' },
  { type: 'Guest', name: 'Emma Johnson', detail: 'Room 102 | +1 555-0199', link: '/front-desk/mis-reservation-dashboard' },
  { type: 'Guest', name: 'Michael Brown', detail: 'Room 104 | +1 202-555-0143', link: '/front-desk/mis-reservation-dashboard' },
  { type: 'Company', name: 'Alfa Group Ltd', detail: 'Nature: Corporate | GSTIN: 29AAAAA1111A1Z1', link: '/front-desk/master-company-master' },
  { type: 'Company', name: 'Google Inc.', detail: 'Nature: Corporate', link: '/front-desk/master-company-master' },
  { type: 'Booking', name: 'BK-10029 (Alice Smith)', detail: 'Check-In: 18-06-2026', link: '/' },
  { type: 'Room', name: 'Room 101', detail: 'Category: Standard | Status: Clean', link: '/' },
  { type: 'Room', name: 'Room 104', detail: 'Category: Deluxe | Status: Checked-In', link: '/' },
  { type: 'Bill', name: 'BL-9801 (Robert Johnson)', detail: 'Amount: Rs. 180.00 | Visa Card', link: '/' },
  { type: 'GRC', name: 'GRC-8902 (John Doe)', detail: 'Company: Google | Plan: CP', link: '/' },
];

const Navbar = ({ toggleSidebar, toggleCollapse, sidebarCollapsed, showToast }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);

  // Close search results dropdown on outside clicks
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const getPageTitle = (path) => {
    const parts = path.split('/').filter(Boolean);
    if (parts.length >= 2) {
      const section = parts[0];
      const item = parts[1].split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
      return `${section.charAt(0).toUpperCase() + section.slice(1)}: ${item}`;
    }

    switch (path) {
      case '/':
        return 'Dashboard Overview';
      case '/front-desk':
        return 'Front Desk Operations';
      case '/housekeeping':
        return 'House Keeping';
      case '/pos':
        return 'Point Of Sale (POS)';
      case '/room-services':
        return 'Room Services';
      case '/restaurant':
        return 'Restaurant Management';
      case '/banquet':
        return 'Banquet & Events';
      case '/purchase':
        return 'Purchase & Inventory';
      case '/setting':
        return 'System Settings';
      default:
        return 'ALFA HMS';
    }
  };

  const handleHamburger = () => {
    if (window.innerWidth > 768) {
      toggleCollapse();
    } else {
      toggleSidebar();
    }
  };

  // Perform search memoization for efficiency
  const filteredResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return SEARCH_DATA.filter(item =>
      item.name.toLowerCase().includes(query) ||
      item.type.toLowerCase().includes(query) ||
      item.detail.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const handleResultClick = (item) => {
    showToast(`Navigating to ${item.type}: ${item.name}`);
    setSearchQuery('');
    setShowResults(false);
    navigate(item.link);
  };

  return (
    <header className="navbar relative">
      <div className="navbar-left">
        <button
          className="menu-toggle-btn"
          onClick={handleHamburger}
          aria-label={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          <FaBars />
        </button>
        <span className="navbar-page-title">{getPageTitle(location.pathname)}</span>
      </div>

      {/* Global Search Component */}
      <div className="flex-1 max-w-md mx-8 relative no-print" ref={searchRef}>
        <div className="relative">
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowResults(true);
            }}
            onFocus={() => setShowResults(true)}
            placeholder="Search Guest, Company, Booking, Room, Bill, GRC... (Ctrl+F)"
            className="w-full bg-slate-50 border border-slate-200 rounded-full py-1.5 pl-10 pr-4 text-xs text-slate-800 placeholder-slate-400 focus:bg-white transition-all duration-200"
          />
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            {/* <FaSearch size={11} /> */}
          </div>
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setShowResults(false);
              }}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              aria-label="Clear Search"
            >
              <FaTimes size={11} />
            </button>
          )}
        </div>

        {/* Global Search Results Dropdown */}
        {showResults && searchQuery.trim() && (
          <div className="absolute left-0 right-0 mt-2 bg-white border border-slate-100 rounded-xl shadow-lg z-[1001] max-h-80 overflow-y-auto p-1.5 flex flex-col gap-0.5">
            <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wide border-b border-slate-50">
              Search Results ({filteredResults.length})
            </div>
            {filteredResults.length > 0 ? (
              filteredResults.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => handleResultClick(item)}
                  className="px-3 py-2 rounded-lg hover:bg-slate-50 cursor-pointer flex justify-between items-center gap-4 transition-colors"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-semibold text-slate-700">{item.name}</span>
                    <span className="text-[10px] text-slate-400 font-medium">{item.detail}</span>
                  </div>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${item.type === 'Room' ? 'bg-indigo-50 text-indigo-500' :
                    item.type === 'Guest' ? 'bg-emerald-50 text-emerald-500' :
                      item.type === 'Booking' ? 'bg-amber-50 text-amber-500' :
                        item.type === 'Company' ? 'bg-cyan-50 text-[#418a8b]' :
                          'bg-slate-100 text-slate-600'
                    }`}>
                    {item.type}
                  </span>
                </div>
              ))
            ) : (
              <div className="px-3 py-4 text-center text-xs text-slate-400 font-medium">
                No matches found for "{searchQuery}"
              </div>
            )}
          </div>
        )}
      </div>

      <div className="navbar-right">
        {/* Top bar indicators */}
        <button
          className="navbar-dummy-btn"
          onClick={() => showToast("Sandbox Dummy Action Triggered! 🎉")}
          title="Sandbox Dummy Action"
        >
          <FaFlask />
          <span>Dummy</span>
        </button>

        <button className="navbar-action-btn" aria-label="Notifications" onClick={() => showToast("No new notifications.")}>
          <FaBell />
          <span className="badge"></span>
        </button>

        <div className="user-profile" onClick={() => showToast("Active session details: Admin User")}>
          <div className="user-avatar">
            <FaUserCircle size={22} />
          </div>
          <div className="user-info">
            <span className="user-name">Zoya</span>
            <span className="user-role">Hotel Manager</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
