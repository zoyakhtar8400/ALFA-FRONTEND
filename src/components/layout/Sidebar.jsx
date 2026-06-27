import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  FaTachometerAlt,
  FaConciergeBell,
  FaBroom,
  FaCashRegister,
  FaUtensils,
  FaGlassCheers,
  FaShoppingCart,
  FaCog,
  FaTimes,
  FaSignOutAlt,
  FaChevronRight,
  FaCogs,
  FaFolder,
  FaChartBar,
  FaFileAlt,
  FaBars
} from 'react-icons/fa';

const Sidebar = ({ isOpen, toggleSidebar, isCollapsed, toggleCollapse, onLogout }) => {
  const location = useLocation();
  const [frontDeskOpen, setFrontDeskOpen] = useState(true); // default open to show submenus
  const [masterOpen, setMasterOpen] = useState(() => location.pathname.startsWith('/front-desk/master'));
  const [operationOpen, setOperationOpen] = useState(() => location.pathname.startsWith('/front-desk/operation'));
  const [misOpen, setMisOpen] = useState(() => location.pathname.startsWith('/front-desk/mis'));

  // ERP Sidebar Flyout state
  const [activeFlyout, setActiveFlyout] = useState(null); // { menu: string, top: number }
  const [activeSubFlyout, setActiveSubFlyout] = useState(null); // { submenu: string, top: number }
  const closeTimerRef = React.useRef(null);

  React.useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  const clearCloseTimer = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const startCloseTimer = () => {
    clearCloseTimer();
    closeTimerRef.current = setTimeout(() => {
      setActiveFlyout(null);
      setActiveSubFlyout(null);
    }, 250);
  };

  const handleFrontDeskMouseEnter = (e) => {
    if (!isCollapsed) return;
    clearCloseTimer();
    const rect = e.currentTarget.getBoundingClientRect();
    setActiveFlyout({
      menu: 'front-desk',
      top: rect.top
    });
    setActiveSubFlyout(null);
  };

  const handleFrontDeskMouseLeave = () => {
    if (!isCollapsed) return;
    startCloseTimer();
  };

  const handleOtherItemMouseEnter = () => {
    if (!isCollapsed) return;
    clearCloseTimer();
    setActiveFlyout(null);
    setActiveSubFlyout(null);
  };

  const handleFlyoutL1MouseEnter = () => {
    clearCloseTimer();
  };

  const handleFlyoutL1MouseLeave = () => {
    startCloseTimer();
  };

  const handleFlyoutL2MouseEnter = () => {
    clearCloseTimer();
  };

  const handleFlyoutL2MouseLeave = () => {
    startCloseTimer();
  };

  const handleSubmenuMouseEnter = (e, submenuId) => {
    clearCloseTimer();
    const rect = e.currentTarget.getBoundingClientRect();
    setActiveSubFlyout({
      submenu: submenuId,
      top: rect.top
    });
  };

  const handleSubmenuMouseLeave = () => {
    startCloseTimer();
  };

  React.useEffect(() => {
    if (location.pathname.startsWith('/front-desk/master')) {
      setMasterOpen(true);
    } else if (location.pathname.startsWith('/front-desk/operation')) {
      setOperationOpen(true);
    } else if (location.pathname.startsWith('/front-desk/mis')) {
      setMisOpen(true);
    }
  }, [location.pathname]);

  const handleMasterToggle = () => {
    setMasterOpen(!masterOpen);
    if (!masterOpen) {
      setOperationOpen(false);
      setMisOpen(false);
    }
  };

  const handleOperationToggle = () => {
    setOperationOpen(!operationOpen);
    if (!operationOpen) {
      setMasterOpen(false);
      setMisOpen(false);
    }
  };

  const handleMisToggle = () => {
    setMisOpen(!misOpen);
    if (!misOpen) {
      setMasterOpen(false);
      setOperationOpen(false);
    }
  };

  const handleLogoutClick = () => {
    const confirmLogout = window.confirm("Are you sure you want to log out from ALFA HMS?");
    if (confirmLogout) {
      onLogout();
    }
  };

  const masters = [
    { name: 'Tax Structure', path: '/front-desk/master/tax-structure' },
    { name: 'Floor Master', path: '/front-desk/master/floor-master' },
    { name: 'Room Feature', path: '/front-desk/master/room-feature' },
    { name: 'Room Category', path: '/front-desk/master/room-category' },
    { name: 'Room Master', path: '/front-desk/master/room-master' },
    { name: 'Meal Master', path: '/front-desk/master/meal-master' },
    { name: 'Room Rate Master', path: '/front-desk/master/room-rate-master' },
    { name: 'Service Charge Master', path: '/front-desk/master/service-charge-master' },
    { name: 'Company Master', path: '/front-desk/master/company-master' },
    { name: 'Market Segment', path: '/front-desk/master/market-segment' },
    { name: 'Business Master', path: '/front-desk/master/business-master' },
    { name: 'Vehicle Master', path: '/front-desk/master/vehicle-master' },
    { name: 'Expense Master', path: '/front-desk/master/expense-master' },
    { name: 'City Master', path: '/front-desk/master/city-master' },
    { name: 'State Master', path: '/front-desk/master/state-master' },
  ];

  const operations = [
    { name: 'Booking', path: '/front-desk/operation/booking' },
    { name: 'Walkin Checkin Entry', path: '/front-desk/operation/walkin-checkin-entry' },
    { name: 'Payment Recieve Entry', path: '/front-desk/operation/payment-recieve-entry' },
    { name: 'Service Charge Entry', path: '/front-desk/operation/service-charge-entry' },
    { name: 'Room Change Entry', path: '/front-desk/operation/room-change-entry' },
    { name: 'Room Checkout Entry', path: '/front-desk/operation/room-checkout-entry' },
    { name: 'Checkout Entry', path: '/front-desk/operation/checkout-entry' },
    { name: 'Refund Entry', path: '/front-desk/operation/refund-entry' },
    { name: 'Add Guest in Room Entry', path: '/front-desk/operation/add-guest-in-room-entry' },
    { name: 'Night Audit Entry', path: '/front-desk/operation/night-audit-entry' },
    { name: 'Guest Profile', path: '/front-desk/operation/guest-profile' },
    { name: 'Multi Room Checkout', path: '/front-desk/operation/multi-room-checkout' },
    { name: 'Room Enquiry Entry', path: '/front-desk/operation/room-enquiry-entry' },
    { name: 'Expense Entry', path: '/front-desk/operation/expense-entry' },
  ];

  const misItems = [
        { name: 'Reservation Dashboard', path: '/front-desk/mis/reservation-dashboard' },

    { name: 'Front Office Dashboard', path: '/front-desk/mis/front-office-dashboard' },
  ];

  const handleMobileNav = () => {
    if (window.innerWidth <= 768) {
      toggleSidebar();
    }
  };

  const handleHamburgerClick = () => {
    if (window.innerWidth > 768) {
      toggleCollapse();
    } else {
      toggleSidebar();
    }
  };

  return (
    <>
      {/* Backdrop for mobile devices */}
      <div
        className={`sidebar-backdrop ${isOpen ? 'open' : ''}`}
        onClick={toggleSidebar}
      />

      <aside className={`sidebar ${isOpen ? 'open' : ''} ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-brand">
          <img src="/logo/hotel-logo.png" alt="Logo" className="sidebar-logo" />
          <button
            className="sidebar-toggle-btn"
            onClick={handleHamburgerClick}
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            <span className="desktop-only-toggle"><FaBars /></span>
            <span className="mobile-only-toggle"><FaTimes /></span>
          </button>
        </div>

        <nav className="sidebar-menu">
          {/* Dashboard */}
          <NavLink to="/" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`} onClick={handleMobileNav} onMouseEnter={handleOtherItemMouseEnter} title={isCollapsed ? "Dashboard" : ""}>
            <FaTachometerAlt className="sidebar-icon" />
            <span>Dashboard</span>
          </NavLink>

          {/* Front Desk Accordion Container */}
          <div>
            <div
              className={`sidebar-item ${location.pathname.startsWith('/front-desk') ? 'active' : ''}`}
              onClick={() => {
                if (isCollapsed) {
                  setActiveFlyout(prev => prev ? null : { menu: 'front-desk', top: 150 });
                  setActiveSubFlyout(null);
                } else {
                  setFrontDeskOpen(!frontDeskOpen);
                }
              }}
              onMouseEnter={handleFrontDeskMouseEnter}
              onMouseLeave={handleFrontDeskMouseLeave}
              style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
              title={isCollapsed ? "Front Desk" : ""}
            >
              <FaConciergeBell className="sidebar-icon" />
              <span>Front Desk</span>
              <FaChevronRight className={`chevron-icon ${frontDeskOpen ? 'open' : ''}`} />
            </div>

            {/* Front Desk Submenu (only when NOT collapsed) */}
            {frontDeskOpen && !isCollapsed && (
              <div className="sidebar-submenu">
                {/* Master Sub-Accordion */}
                <div>
                  <div
                    className="sidebar-subitem"
                    onClick={handleMasterToggle}
                    style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                  >
                    <FaCogs style={{ fontSize: '0.95rem' }} />
                    <span>Master</span>
                    <FaChevronRight className={`chevron-icon ${masterOpen ? 'open' : ''}`} />
                  </div>

                  {/* Master Subitems list */}
                  {masterOpen && (
                    <div className="sidebar-submenu" style={{ paddingLeft: '10px', marginLeft: '16px' }}>
                      {masters.map((m) => (
                        <NavLink
                          key={m.name}
                          to={m.path}
                          className={({ isActive }) => `sidebar-subitem ${isActive ? 'active' : ''}`}
                          onClick={handleMobileNav}
                        >
                          {m.name}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>

                {/* Operations Sub-Accordion */}
                <div>
                  <div
                    className="sidebar-subitem"
                    onClick={handleOperationToggle}
                    style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                  >
                    <FaFolder style={{ fontSize: '0.95rem' }} />
                    <span>Operation</span>
                    <FaChevronRight className={`chevron-icon ${operationOpen ? 'open' : ''}`} />
                  </div>

                  {/* Operations Subitems list */}
                  {operationOpen && (
                    <div className="sidebar-submenu" style={{ paddingLeft: '10px', marginLeft: '16px' }}>
                      {operations.map((o) => (
                        <NavLink
                          key={o.name}
                          to={o.path}
                          className={({ isActive }) => `sidebar-subitem ${isActive ? 'active' : ''}`}
                          onClick={handleMobileNav}
                        >
                          {o.name}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>

                {/* MIS Sub-Accordion */}
                <div>
                  <div
                    className="sidebar-subitem"
                    onClick={handleMisToggle}
                    style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                  >
                    <FaChartBar style={{ fontSize: '0.95rem' }} />
                    <span>MIS</span>
                    <FaChevronRight className={`chevron-icon ${misOpen ? 'open' : ''}`} />
                  </div>

                  {/* MIS Subitems list */}
                  {misOpen && (
                    <div className="sidebar-submenu" style={{ paddingLeft: '10px', marginLeft: '16px' }}>
                      {misItems.map((mis) => (
                        <NavLink
                          key={mis.name}
                          to={mis.path}
                          className={({ isActive }) => `sidebar-subitem ${isActive ? 'active' : ''}`}
                          onClick={handleMobileNav}
                        >
                          {mis.name}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>

                {/* Report */}
                <NavLink to="/front-desk/report" className={({ isActive }) => `sidebar-subitem ${isActive ? 'active' : ''}`} onClick={handleMobileNav}>
                  <FaFileAlt style={{ fontSize: '0.95rem' }} />
                  <span>Report</span>
                </NavLink>
              </div>
            )}
          </div>

          {/* House Keeping */}
          <NavLink to="/housekeeping" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`} onClick={handleMobileNav} onMouseEnter={handleOtherItemMouseEnter} title={isCollapsed ? "House Keeping" : ""}>
            <FaBroom className="sidebar-icon" />
            <span>House Keeping</span>
          </NavLink>

          {/* Point Of Sale */}
          <NavLink to="/pos" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`} onClick={handleMobileNav} onMouseEnter={handleOtherItemMouseEnter} title={isCollapsed ? "Point Of Sale" : ""}>
            <FaCashRegister className="sidebar-icon" />
            <span>Point Of Sale</span>
          </NavLink>

          {/* Room Services */}
          <NavLink to="/room-services" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`} onClick={handleMobileNav} onMouseEnter={handleOtherItemMouseEnter} title={isCollapsed ? "Room Services" : ""}>
            <FaUtensils className="sidebar-icon" />
            <span>Room Services</span>
          </NavLink>

          {/* Restaurant */}
          <NavLink to="/restaurant" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`} onClick={handleMobileNav} onMouseEnter={handleOtherItemMouseEnter} title={isCollapsed ? "Restaurant" : ""}>
            <FaUtensils className="sidebar-icon" />
            <span>Restaurant</span>
          </NavLink>

          {/* Banquet */}
          <NavLink to="/banquet" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`} onClick={handleMobileNav} onMouseEnter={handleOtherItemMouseEnter} title={isCollapsed ? "Banquet" : ""}>
            <FaGlassCheers className="sidebar-icon" />
            <span>Banquet</span>
          </NavLink>

          {/* Purchase */}
          <NavLink to="/purchase" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`} onClick={handleMobileNav} onMouseEnter={handleOtherItemMouseEnter} title={isCollapsed ? "Purchase" : ""}>
            <FaShoppingCart className="sidebar-icon" />
            <span>Purchase</span>
          </NavLink>

          {/* Setting */}
          <NavLink to="/setting" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`} onClick={handleMobileNav} onMouseEnter={handleOtherItemMouseEnter} title={isCollapsed ? "Setting" : ""}>
            <FaCog className="sidebar-icon" />
            <span>Setting</span>
          </NavLink>
        </nav>

        {/* Sidebar Footer with Logout Button & Profile */}
        <div className="sidebar-footer" onMouseEnter={handleOtherItemMouseEnter}>
          <div className="sidebar-profile">
            <div className="profile-details">
              <span className="profile-name">Zoya</span>
              <span className="profile-role">Hotel Manager</span>
            </div>
            <button className="logout-btn" onClick={handleLogoutClick} title="Log Out">
              <FaSignOutAlt />
            </button>
          </div>
        </div>
      </aside>

      {/* Level 1 Flyout */}
      {isCollapsed && activeFlyout && activeFlyout.menu === 'front-desk' && (
        <div
          className="sidebar-flyout-l1"
          style={{ top: `${activeFlyout.top}px` }}
          onMouseEnter={handleFlyoutL1MouseEnter}
          onMouseLeave={handleFlyoutL1MouseLeave}
        >
          <div className="flyout-header">Front Desk</div>
          <div className="flyout-menu-items">
            <div
              className={`flyout-menu-item ${location.pathname.startsWith('/front-desk/master') ? 'active' : ''} ${activeSubFlyout?.submenu === 'master' ? 'hovered' : ''}`}
              onMouseEnter={(e) => handleSubmenuMouseEnter(e, 'master')}
              onMouseLeave={handleSubmenuMouseLeave}
              onClick={() => setActiveSubFlyout(prev => prev?.submenu === 'master' ? null : { submenu: 'master', top: activeFlyout.top })}
            >
              <FaCogs className="flyout-item-icon" />
              <span>Master</span>
              <FaChevronRight className="flyout-chevron" />
            </div>

            <div
              className={`flyout-menu-item ${location.pathname.startsWith('/front-desk/operation') ? 'active' : ''} ${activeSubFlyout?.submenu === 'operation' ? 'hovered' : ''}`}
              onMouseEnter={(e) => handleSubmenuMouseEnter(e, 'operation')}
              onMouseLeave={handleSubmenuMouseLeave}
              onClick={() => setActiveSubFlyout(prev => prev?.submenu === 'operation' ? null : { submenu: 'operation', top: activeFlyout.top })}
            >
              <FaFolder className="flyout-item-icon" />
              <span>Operation</span>
              <FaChevronRight className="flyout-chevron" />
            </div>

            <div
              className={`flyout-menu-item ${location.pathname.startsWith('/front-desk/mis') ? 'active' : ''} ${activeSubFlyout?.submenu === 'mis' ? 'hovered' : ''}`}
              onMouseEnter={(e) => handleSubmenuMouseEnter(e, 'mis')}
              onMouseLeave={handleSubmenuMouseLeave}
              onClick={() => setActiveSubFlyout(prev => prev?.submenu === 'mis' ? null : { submenu: 'mis', top: activeFlyout.top })}
            >
              <FaChartBar className="flyout-item-icon" />
              <span>MIS</span>
              <FaChevronRight className="flyout-chevron" />
            </div>

            <NavLink
              to="/front-desk/report"
              className={({ isActive }) => `flyout-menu-item ${isActive ? 'active' : ''}`}
              onClick={() => {
                setActiveFlyout(null);
                setActiveSubFlyout(null);
                handleMobileNav();
              }}
              onMouseEnter={() => setActiveSubFlyout(null)}
            >
              <FaFileAlt className="flyout-item-icon" />
              <span>Report</span>
            </NavLink>
          </div>
        </div>
      )}

      {/* Level 2 Flyout */}
      {isCollapsed && activeFlyout && activeSubFlyout && (
        <div
          className="sidebar-flyout-l2"
          style={{ top: `${activeSubFlyout.top}px` }}
          onMouseEnter={handleFlyoutL2MouseEnter}
          onMouseLeave={handleFlyoutL2MouseLeave}
        >
          <div className="flyout-header">
            {activeSubFlyout.submenu === 'mis' ? 'MIS' : activeSubFlyout.submenu.charAt(0).toUpperCase() + activeSubFlyout.submenu.slice(1)}
          </div>
          <div className="flyout-menu-items scrollable-submenu">
            {activeSubFlyout.submenu === 'master' && masters.map((m) => (
              <NavLink
                key={m.name}
                to={m.path}
                className={({ isActive }) => `flyout-subitem ${isActive ? 'active' : ''}`}
                onClick={() => {
                  setActiveFlyout(null);
                  setActiveSubFlyout(null);
                  handleMobileNav();
                }}
              >
                {m.name}
              </NavLink>
            ))}

            {activeSubFlyout.submenu === 'operation' && operations.map((o) => (
              <NavLink
                key={o.name}
                to={o.path}
                className={({ isActive }) => `flyout-subitem ${isActive ? 'active' : ''}`}
                onClick={() => {
                  setActiveFlyout(null);
                  setActiveSubFlyout(null);
                  handleMobileNav();
                }}
              >
                {o.name}
              </NavLink>
            ))}

            {activeSubFlyout.submenu === 'mis' && misItems.map((mis) => (
              <NavLink
                key={mis.name}
                to={mis.path}
                className={({ isActive }) => `flyout-subitem ${isActive ? 'active' : ''}`}
                onClick={() => {
                  setActiveFlyout(null);
                  setActiveSubFlyout(null);
                  handleMobileNav();
                }}
              >
                {mis.name}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
