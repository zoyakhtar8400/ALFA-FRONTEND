import React from 'react';
import { useLocation } from 'react-router-dom';
import { FaBars, FaBell, FaSearch, FaUserCircle, FaFlask } from 'react-icons/fa';

const Navbar = ({ toggleSidebar, showToast }) => {
  const location = useLocation();

  const getPageTitle = (path) => {
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

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button className="menu-toggle-btn" onClick={toggleSidebar} aria-label="Toggle Sidebar">
          <FaBars />
        </button>
        <span className="navbar-page-title">{getPageTitle(location.pathname)}</span>
      </div>

      <div className="navbar-right">
        {/* Dummy Button like Logout */}
        <button 
          className="navbar-dummy-btn" 
          onClick={() => showToast("Dummy Action Triggered from Top Bar! 🎉")}
          title="Sandbox Dummy Action"
        >
          <FaFlask />
          <span>Dummy</span>
        </button>

        <button className="navbar-action-btn" aria-label="Search" onClick={() => showToast("Search clicked (Dummy Action)")}>
          <FaSearch />
        </button>
        
        <button className="navbar-action-btn" aria-label="Notifications" onClick={() => showToast("Notifications clicked (Dummy Action)")}>
          <FaBell />
          <span className="badge"></span>
        </button>

        <div className="user-profile" onClick={() => showToast("User profile clicked (Dummy Action)")}>
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
