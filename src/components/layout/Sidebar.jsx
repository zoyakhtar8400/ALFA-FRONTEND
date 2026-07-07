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

// Import split modules
import { 
  masters, operations, misItems,
  restaurantItems
} from './components/SidebarConfig';
import SidebarFlyoutL1 from './components/SidebarFlyoutL1';
import SidebarFlyoutL2 from './components/SidebarFlyoutL2';

const Sidebar = ({ isOpen, toggleSidebar, isCollapsed, toggleCollapse, onLogout }) => {
  const location = useLocation();
  const [frontDeskOpen, setFrontDeskOpen] = useState(true); // default open to show submenus
  const [masterOpen, setMasterOpen] = useState(() => location.pathname.startsWith('/front-desk/master'));
  const [operationOpen, setOperationOpen] = useState(() => location.pathname.startsWith('/front-desk/operation'));
  const [misOpen, setMisOpen] = useState(() => location.pathname.startsWith('/front-desk/mis'));

  const [restaurantOpen, setRestaurantOpen] = useState(() => location.pathname.startsWith('/restaurant'));

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

  const handleRestaurantMouseEnter = (e) => {
    if (!isCollapsed) return;
    clearCloseTimer();
    const rect = e.currentTarget.getBoundingClientRect();
    setActiveFlyout({
      menu: 'restaurant',
      top: rect.top
    });
    setActiveSubFlyout(null);
  };

  const handleRestaurantMouseLeave = () => {
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

          {/* Restaurant Accordion Container */}
          <div>
            <div
              className={`sidebar-item ${location.pathname.startsWith('/restaurant') ? 'active' : ''}`}
              onClick={() => {
                if (isCollapsed) {
                  setActiveFlyout(prev => prev ? null : { menu: 'restaurant', top: 320 });
                  setActiveSubFlyout(null);
                } else {
                  setRestaurantOpen(!restaurantOpen);
                }
              }}
              onMouseEnter={handleRestaurantMouseEnter}
              onMouseLeave={handleRestaurantMouseLeave}
              style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
              title={isCollapsed ? "Restaurant" : ""}
            >
              <FaUtensils className="sidebar-icon" />
              <span>Restaurant</span>
              <FaChevronRight className={`chevron-icon ${restaurantOpen ? 'open' : ''}`} />
            </div>

            {/* Restaurant Submenu (only when NOT collapsed) */}
            {restaurantOpen && !isCollapsed && (
              <div className="sidebar-submenu">
                {restaurantItems.map((item) => {
                  let SubIcon = FaFileAlt;
                  if (item.name === 'Display Table') SubIcon = FaUtensils;
                  else if (item.name === 'View KOT') SubIcon = FaConciergeBell;
                  else if (item.name === 'Order Details') SubIcon = FaFolder;

                  return (
                    <NavLink
                      key={item.name}
                      to={item.path}
                      className={({ isActive }) => `sidebar-subitem ${isActive ? 'active' : ''}`}
                      onClick={handleMobileNav}
                    >
                      <SubIcon style={{ fontSize: '0.85rem' }} />
                      <span>{item.name}</span>
                    </NavLink>
                  );
                })}
              </div>
            )}
          </div>

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

      {/* Render modular Level 1 Flyout */}
      <SidebarFlyoutL1
        isCollapsed={isCollapsed}
        activeFlyout={activeFlyout}
        location={location}
        activeSubFlyout={activeSubFlyout}
        handleFlyoutL1MouseEnter={handleFlyoutL1MouseEnter}
        handleFlyoutL1MouseLeave={handleFlyoutL1MouseLeave}
        handleSubmenuMouseEnter={handleSubmenuMouseEnter}
        handleSubmenuMouseLeave={handleSubmenuMouseLeave}
        setActiveSubFlyout={setActiveSubFlyout}
        handleMobileNav={handleMobileNav}
        setActiveFlyout={setActiveFlyout}
      />

      {/* Render modular Level 2 Flyout */}
      <SidebarFlyoutL2
        isCollapsed={isCollapsed}
        activeFlyout={activeFlyout}
        activeSubFlyout={activeSubFlyout}
        handleFlyoutL2MouseEnter={handleFlyoutL2MouseEnter}
        handleFlyoutL2MouseLeave={handleFlyoutL2MouseLeave}
        masters={activeFlyout?.menu === 'restaurant' ? restaurantMasters : masters}
        operations={activeFlyout?.menu === 'restaurant' ? restaurantOperations : operations}
        misItems={activeFlyout?.menu === 'restaurant' ? restaurantMisItems : misItems}
        setActiveFlyout={setActiveFlyout}
        setActiveSubFlyout={setActiveSubFlyout}
        handleMobileNav={handleMobileNav}
      />
    </>
  );
};

export default Sidebar;
