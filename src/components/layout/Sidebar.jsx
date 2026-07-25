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
  restaurantItems, restaurantMasters,
  purchaseMasters, purchaseOperationsProcess, purchaseOperationsDirect
} from './components/SidebarConfig';
import SidebarFlyoutL1 from './components/SidebarFlyoutL1';
import SidebarFlyoutL2 from './components/SidebarFlyoutL2';
import SidebarFlyoutL3 from './components/SidebarFlyoutL3';

const Sidebar = ({ isOpen, toggleSidebar, isCollapsed, toggleCollapse, onLogout }) => {
  // Global Keyboard Navigation for Sidebar
  React.useEffect(() => {
    const handleAltS = (e) => {
      if (e.altKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
          const first = Array.from(sidebar.querySelectorAll('[tabindex="0"]'))
            .find(el => el.offsetWidth > 0 || el.offsetHeight > 0);
          if (first) {
            first.focus();
          }
        }
      }
    };
    window.addEventListener('keydown', handleAltS);
    return () => {
      window.removeEventListener('keydown', handleAltS);
    };
  }, []);

  const handleSidebarKeyDown = (e) => {
    const active = document.activeElement;
    if (!active || !e.currentTarget.contains(active)) return;

    const focusable = Array.from(e.currentTarget.querySelectorAll('[tabindex="0"]'))
      .filter(el => el.offsetWidth > 0 || el.offsetHeight > 0);

    const idx = focusable.indexOf(active);
    if (idx === -1) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (idx < focusable.length - 1) {
          focusable[idx + 1].focus();
        }
        break;

      case 'ArrowUp':
        e.preventDefault();
        if (idx > 0) {
          focusable[idx - 1].focus();
        }
        break;

      case 'ArrowRight':
        e.preventDefault();
        const isCollapsedHeader = active.querySelector('.chevron-icon:not(.open)');
        if (isCollapsedHeader) {
          active.click();
        }
        break;

      case 'ArrowLeft':
        e.preventDefault();
        const isExpandedHeader = active.querySelector('.chevron-icon.open');
        if (isExpandedHeader) {
          active.click();
        } else {
          const parentAccordion = active.closest('.sidebar-submenu');
          if (parentAccordion) {
            const header = parentAccordion.previousElementSibling;
            if (header && header.getAttribute('tabindex') === '0') {
              header.focus();
            }
          }
        }
        break;

      case 'Enter':
        const isHeader = active.querySelector('.chevron-icon') || (active.classList.contains('sidebar-subitem') && active.tagName !== 'A');
        if (isHeader) {
          e.preventDefault();
          active.click();
        }
        break;

      default:
        break;
    }
  };

  const location = useLocation();
  const [frontDeskOpen, setFrontDeskOpen] = useState(true); // default open to show submenus
  const [masterOpen, setMasterOpen] = useState(() => location.pathname.startsWith('/front-desk/master'));
  const [operationOpen, setOperationOpen] = useState(() => location.pathname.startsWith('/front-desk/operation'));
  const [misOpen, setMisOpen] = useState(() => location.pathname.startsWith('/front-desk/mis'));

  const [purchaseOpen, setPurchaseOpen] = useState(() => location.pathname.startsWith('/purchase'));
  const [purchaseMasterOpen, setPurchaseMasterOpen] = useState(true);
  const [purchaseOperationOpen, setPurchaseOperationOpen] = useState(true);
  const [purchaseProcessOpen, setPurchaseProcessOpen] = useState(true);
  const [purchaseDirectOpen, setPurchaseDirectOpen] = useState(true);

  const [restaurantOpen, setRestaurantOpen] = useState(() =>
    (location.pathname.startsWith('/restaurant') || location.pathname.startsWith('/pos')) &&
    !location.pathname.includes('/master') &&
    !location.pathname.includes('/masters') &&
    !location.pathname.includes('order-details')
  );
  const [posOpen, setPosOpen] = useState(() =>
    location.pathname.startsWith('/pos') ||
    location.pathname.includes('/restaurant/masters') ||
    location.pathname.includes('/restaurant/master') ||
    location.pathname.includes('order-details')
  );
  const [posMasterOpen, setPosMasterOpen] = useState(() =>
    location.pathname.includes('/pos/master') ||
    location.pathname.includes('/pos/masters') ||
    location.pathname.includes('/restaurant/master') ||
    location.pathname.includes('/restaurant/masters')
  );
  const [posReportOpen, setPosReportOpen] = useState(() => location.pathname.includes('order-details'));
  const [itemMenuOpen, setItemMenuOpen] = useState(() =>
    location.pathname.includes('/pos/master/item-menu') ||
    location.pathname.includes('/restaurant/master/item-menu')
  );

  // ERP Sidebar Flyout state
  const [activeFlyout, setActiveFlyout] = useState(null); // { menu: string, top: number }
  const [activeSubFlyout, setActiveSubFlyout] = useState(null); // { submenu: string, top: number }
  const [activeSubSubFlyout, setActiveSubSubFlyout] = useState(null); // { submenu: string, top: number }
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

  const handlePOSMouseEnter = (e) => {
    if (!isCollapsed) return;
    clearCloseTimer();
    const rect = e.currentTarget.getBoundingClientRect();
    setActiveFlyout({
      menu: 'point-of-sale',
      top: rect.top
    });
    setActiveSubFlyout(null);
  };

  const handlePOSMouseLeave = () => {
    if (!isCollapsed) return;
    startCloseTimer();
  };

  const handlePurchaseMouseEnter = (e) => {
    if (!isCollapsed) return;
    clearCloseTimer();
    const rect = e.currentTarget.getBoundingClientRect();
    setActiveFlyout({
      menu: 'purchase',
      top: rect.top
    });
    setActiveSubFlyout(null);
  };

  const handlePurchaseMouseLeave = () => {
    if (!isCollapsed) return;
    startCloseTimer();
  };

  const handleOtherItemMouseEnter = () => {
    if (!isCollapsed) return;
    clearCloseTimer();
    setActiveFlyout(null);
    setActiveSubFlyout(null);
    setActiveSubSubFlyout(null);
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

  const handleFlyoutL3MouseEnter = () => {
    clearCloseTimer();
  };

  const handleFlyoutL3MouseLeave = () => {
    startCloseTimer();
  };

  const handleSubSubmenuMouseEnter = (e, submenuId) => {
    clearCloseTimer();
    const rect = e.currentTarget.getBoundingClientRect();
    setActiveSubSubFlyout({
      submenu: submenuId,
      top: rect.top
    });
  };

  const handleSubSubmenuMouseLeave = () => {
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

    if (location.pathname.includes('/restaurant/master/item-menu') || location.pathname.includes('/pos/master/item-menu')) {
      setPosOpen(true);
      setPosMasterOpen(true);
      setItemMenuOpen(true);
    } else if (location.pathname.includes('/restaurant/master') || location.pathname.includes('/restaurant/masters') || location.pathname.includes('/pos/master') || location.pathname.includes('/pos/masters')) {
      setPosOpen(true);
      setPosMasterOpen(true);
    } else if (location.pathname.includes('order-details')) {
      setPosOpen(true);
      setPosReportOpen(true);
    } else if (location.pathname.startsWith('/restaurant') || location.pathname.startsWith('/pos')) {
      setRestaurantOpen(true);
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
          <img src="/logo/alfa-logo.png" alt="Logo" className="sidebar-logo" />
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

        <nav className="sidebar-menu" onKeyDown={handleSidebarKeyDown}>
          {/* Dashboard */}
          <NavLink to="/" tabIndex={0} className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`} onClick={handleMobileNav} onMouseEnter={handleOtherItemMouseEnter} title={isCollapsed ? "Dashboard" : ""}>
            <FaTachometerAlt className="sidebar-icon" />
            <span>Dashboard</span>
          </NavLink>

          {/* Front Desk Accordion Container */}
          <div>
            <div
              tabIndex={0} className={`sidebar-item ${location.pathname.startsWith('/front-desk') ? 'active' : ''}`}
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
                  <div tabIndex={0}
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
                        <NavLink tabIndex={0}
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
                  <div tabIndex={0}
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
                        <NavLink tabIndex={0}
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
                  <div tabIndex={0}
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
                        <NavLink tabIndex={0}
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
                <NavLink to="/front-desk/report" tabIndex={0} className={({ isActive }) => `sidebar-subitem ${isActive ? 'active' : ''}`} onClick={handleMobileNav}>
                  <FaFileAlt style={{ fontSize: '0.95rem' }} />
                  <span>Report</span>
                </NavLink>
              </div>
            )}
          </div>

          {/* House Keeping */}
          <NavLink to="/housekeeping" tabIndex={0} className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`} onClick={handleMobileNav} onMouseEnter={handleOtherItemMouseEnter} title={isCollapsed ? "House Keeping" : ""}>
            <FaBroom className="sidebar-icon" />
            <span>House Keeping</span>
          </NavLink>

          {/* Point Of Sale Accordion Container */}
          <div>
            <div
              tabIndex={0} className={`sidebar-item ${(location.pathname.startsWith('/restaurant/master') || location.pathname.startsWith('/restaurant/masters') || location.pathname.startsWith('/pos') || location.pathname.includes('order-details')) ? 'active' : ''}`}
              onClick={() => {
                if (isCollapsed) {
                  setActiveFlyout(prev => prev ? null : { menu: 'point-of-sale', top: 280 });
                  setActiveSubFlyout(null);
                } else {
                  setPosOpen(!posOpen);
                }
              }}
              onMouseEnter={handlePOSMouseEnter}
              onMouseLeave={handlePOSMouseLeave}
              style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
              title={isCollapsed ? "Point Of Sale" : ""}
            >
              <FaCashRegister className="sidebar-icon" />
              <span>Point Of Sale</span>
              <FaChevronRight className={`chevron-icon ${posOpen ? 'open' : ''}`} />
            </div>

            {/* POS Submenu (only when NOT collapsed) */}
            {posOpen && !isCollapsed && (
              <div className="sidebar-submenu">
                {/* Master Sub-Accordion */}
                <div>
                  <div tabIndex={0}
                    className="sidebar-subitem"
                    onClick={() => setPosMasterOpen(!posMasterOpen)}
                    style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                  >
                    <FaCogs style={{ fontSize: '0.95rem' }} />
                    <span>Master</span>
                    <FaChevronRight className={`chevron-icon ${posMasterOpen ? 'open' : ''}`} />
                  </div>

                  {posMasterOpen && (
                    <div className="sidebar-submenu" style={{ paddingLeft: '10px', marginLeft: '16px' }}>
                      {restaurantMasters.map((m) => {
                        if (m.subitems) {
                          return (
                            <div key={m.name}>
                              <div tabIndex={0}
                                className="sidebar-subitem"
                                onClick={() => setItemMenuOpen(!itemMenuOpen)}
                                style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '6px' }}
                              >
                                <span>{m.name}</span>
                                <FaChevronRight className={`chevron-icon ${itemMenuOpen ? 'open' : ''}`} style={{ fontSize: '0.7rem', marginLeft: 'auto' }} />
                              </div>
                              {itemMenuOpen && (
                                <div className="sidebar-submenu" style={{ paddingLeft: '10px', marginLeft: '12px' }}>
                                  {m.subitems.map((sub) => (
                                    <NavLink tabIndex={0}
                                      key={sub.name}
                                      to={sub.path}
                                      className={({ isActive }) => `sidebar-subitem ${isActive ? 'active' : ''}`}
                                      onClick={handleMobileNav}
                                    >
                                      {sub.name}
                                    </NavLink>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        }

                        return (
                          <NavLink tabIndex={0}
                            key={m.name}
                            to={m.path}
                            className={({ isActive }) => `sidebar-subitem ${isActive ? 'active' : ''}`}
                            onClick={handleMobileNav}
                          >
                            {m.name}
                          </NavLink>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Report Sub-Accordion */}
                <div>
                  <div tabIndex={0}
                    className="sidebar-subitem"
                    onClick={() => setPosReportOpen(!posReportOpen)}
                    style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                  >
                    <FaFileAlt style={{ fontSize: '0.95rem' }} />
                    <span>Report</span>
                    <FaChevronRight className={`chevron-icon ${posReportOpen ? 'open' : ''}`} />
                  </div>

                  {posReportOpen && (
                    <div className="sidebar-submenu" style={{ paddingLeft: '10px', marginLeft: '16px' }}>
                      <NavLink to="/pos/report" tabIndex={0} className={({ isActive }) => `sidebar-subitem ${isActive ? 'active' : ''}`} onClick={handleMobileNav}>
                        POS Reports Hub
                      </NavLink>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Room Services */}
          <NavLink to="/room-services" tabIndex={0} className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`} onClick={handleMobileNav} onMouseEnter={handleOtherItemMouseEnter} title={isCollapsed ? "Room Services" : ""}>
            <FaUtensils className="sidebar-icon" />
            <span>Room Services</span>
          </NavLink>

          {/* Restaurant Accordion Container */}
          <div>
            <div
              tabIndex={0} className={`sidebar-item ${(location.pathname.startsWith('/restaurant') && !location.pathname.startsWith('/restaurant/master') && !location.pathname.startsWith('/restaurant/masters')) ? 'active' : ''}`}
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
                    <NavLink tabIndex={0}
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
          <NavLink to="/banquet" tabIndex={0} className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`} onClick={handleMobileNav} onMouseEnter={handleOtherItemMouseEnter} title={isCollapsed ? "Banquet" : ""}>
            <FaGlassCheers className="sidebar-icon" />
            <span>Banquet</span>
          </NavLink>

          {/* Purchase Accordion Container */}
          <div onMouseEnter={handlePurchaseMouseEnter} onMouseLeave={handlePurchaseMouseLeave}>
            <div
              tabIndex={0}
              className={`sidebar-item ${location.pathname.startsWith('/purchase') ? 'active' : ''}`}
              onClick={() => {
                if (isCollapsed) {
                  setActiveFlyout(prev => prev?.menu === 'purchase' ? null : { menu: 'purchase', top: 340 });
                  setActiveSubFlyout(null);
                } else {
                  setPurchaseOpen(!purchaseOpen);
                }
              }}
              style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
              title={isCollapsed ? "Purchase" : ""}
            >
              <FaShoppingCart className="sidebar-icon" />
              <span>Purchase</span>
              <FaChevronRight className={`chevron-icon ${purchaseOpen ? 'open' : ''}`} />
            </div>

            {/* Purchase Submenu (only when NOT collapsed) */}
            {purchaseOpen && !isCollapsed && (
              <div className="sidebar-submenu">
                {/* Master Sub-Accordion */}
                <div>
                  <div
                    tabIndex={0}
                    className="sidebar-subitem"
                    onClick={() => setPurchaseMasterOpen(!purchaseMasterOpen)}
                    style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                  >
                    <FaCogs style={{ fontSize: '0.95rem' }} />
                    <span>Master</span>
                    <FaChevronRight className={`chevron-icon ${purchaseMasterOpen ? 'open' : ''}`} />
                  </div>

                  {purchaseMasterOpen && (
                    <div className="sidebar-submenu" style={{ paddingLeft: '10px', marginLeft: '16px' }}>
                      {purchaseMasters.map((m) => (
                        <NavLink
                          tabIndex={0}
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

                {/* Operation Sub-Accordion */}
                <div>
                  <div
                    tabIndex={0}
                    className="sidebar-subitem"
                    onClick={() => setPurchaseOperationOpen(!purchaseOperationOpen)}
                    style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                  >
                    <FaFolder style={{ fontSize: '0.95rem' }} />
                    <span>Operation</span>
                    <FaChevronRight className={`chevron-icon ${purchaseOperationOpen ? 'open' : ''}`} />
                  </div>

                  {purchaseOperationOpen && (
                    <div className="sidebar-submenu" style={{ paddingLeft: '10px', marginLeft: '16px' }}>
                      <div style={{ opacity: 0.9 }}>
                        <div
                          tabIndex={0}
                          className="sidebar-subitem"
                          onClick={() => setPurchaseProcessOpen(!purchaseProcessOpen)}
                          style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700 }}
                        >
                          <span>Purchase Process</span>
                          <FaChevronRight className={`chevron-icon ${purchaseProcessOpen ? 'open' : ''}`} style={{ fontSize: '0.7rem', marginLeft: 'auto' }} />
                        </div>

                        {purchaseProcessOpen && (
                          <div className="sidebar-submenu" style={{ paddingLeft: '10px', marginLeft: '12px' }}>
                            {purchaseOperationsProcess.map((o) => (
                              <NavLink
                                tabIndex={0}
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

                      <div style={{ marginTop: '4px' }}>
                        <div
                          tabIndex={0}
                          className="sidebar-subitem"
                          onClick={() => setPurchaseDirectOpen(!purchaseDirectOpen)}
                          style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700 }}
                        >
                          <span>Direct Process</span>
                          <FaChevronRight className={`chevron-icon ${purchaseDirectOpen ? 'open' : ''}`} style={{ fontSize: '0.7rem', marginLeft: 'auto' }} />
                        </div>

                        {purchaseDirectOpen && (
                          <div className="sidebar-submenu" style={{ paddingLeft: '10px', marginLeft: '12px' }}>
                            {purchaseOperationsDirect.map((o) => (
                              <NavLink
                                tabIndex={0}
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
                    </div>
                  )}
                </div>

                {/* Reports */}
                <NavLink
                  to="/purchase/reports"
                  tabIndex={0}
                  className={({ isActive }) => `sidebar-subitem ${isActive ? 'active' : ''}`}
                  onClick={handleMobileNav}
                >
                  <FaFileAlt style={{ fontSize: '0.95rem' }} />
                  <span>Report</span>
                </NavLink>
              </div>
            )}
          </div>

          {/* Setting */}
          <NavLink to="/setting" tabIndex={0} className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`} onClick={handleMobileNav} onMouseEnter={handleOtherItemMouseEnter} title={isCollapsed ? "Setting" : ""}>
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
        activeSubSubFlyout={activeSubSubFlyout}
        handleFlyoutL2MouseEnter={handleFlyoutL2MouseEnter}
        handleFlyoutL2MouseLeave={handleFlyoutL2MouseLeave}
        handleSubSubmenuMouseEnter={handleSubSubmenuMouseEnter}
        handleSubSubmenuMouseLeave={handleSubSubmenuMouseLeave}
        masters={masters}
        operations={operations}
        misItems={misItems}
        restaurantMasters={restaurantMasters}
        purchaseMasters={purchaseMasters}
        purchaseOperationsProcess={purchaseOperationsProcess}
        purchaseOperationsDirect={purchaseOperationsDirect}
        setActiveFlyout={setActiveFlyout}
        setActiveSubFlyout={setActiveSubFlyout}
        setActiveSubSubFlyout={setActiveSubSubFlyout}
        handleMobileNav={handleMobileNav}
        location={location}
      />

      {/* Render modular Level 3 Flyout */}
      <SidebarFlyoutL3
        isCollapsed={isCollapsed}
        activeFlyout={activeFlyout}
        activeSubFlyout={activeSubFlyout}
        activeSubSubFlyout={activeSubSubFlyout}
        handleFlyoutL3MouseEnter={handleFlyoutL3MouseEnter}
        handleFlyoutL3MouseLeave={handleFlyoutL3MouseLeave}
        restaurantMasters={restaurantMasters}
        setActiveFlyout={setActiveFlyout}
        setActiveSubFlyout={setActiveSubFlyout}
        setActiveSubSubFlyout={setActiveSubSubFlyout}
        handleMobileNav={handleMobileNav}
      />
    </>
  );
};

export default Sidebar;
