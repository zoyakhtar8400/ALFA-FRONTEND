import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
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
  FaReceipt,
  FaBars,
  FaUserCircle
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
import companyProfileService from '../../services/companyProfileService';
import { useRestaurant } from '../../context/RestaurantContext';
import ConfirmationDialog from '../common/ConfirmationDialog';

const Sidebar = ({ isOpen, toggleSidebar, isCollapsed, toggleCollapse, onLogout }) => {
  const navigate = useNavigate();
  const { activeOutletId, allOutlets } = useRestaurant();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const activeOutlet = allOutlets.find(o => Number(o.id) === Number(activeOutletId));
  const activeOutletName = activeOutlet ? activeOutlet.name || activeOutlet.store_name : '';
  const [companyProfile, setCompanyProfile] = useState(null);

  const getMappedPath = (path) => {
    const targetOutletId = activeOutletId || 1;
    if (path.startsWith('/restaurant/')) {
      const subpath = path.replace('/restaurant/', '');
      return `/pos/master/outlet/${targetOutletId}/${subpath}`;
    }
    return path;
  };

  const getOutletMappedPath = (path, outletId) => {
    const targetOutletId = outletId || activeOutletId || 1;
    if (path.startsWith('/restaurant/')) {
      const subpath = path.replace('/restaurant/', '');
      return `/pos/master/outlet/${targetOutletId}/${subpath}`;
    }
    return path;
  };

  const isOutletActive = (outletId) => {
    const parts = location.pathname.split('/').filter(Boolean);
    const inOutletWorkspace = parts[0] === 'pos' && parts[1] === 'master' && parts[2] === 'outlet' && parts[3] && parts[4];
    if (inOutletWorkspace) {
      return Number(parts[3]) === Number(outletId);
    }
    if (location.pathname.startsWith('/restaurant')) {
      return Number(activeOutletId || 1) === Number(outletId);
    }
    return false;
  };

  // Load real Company Profile from PostgreSQL and listen for live updates
  React.useEffect(() => {
    let isMounted = true;
    const loadComp = async () => {
      try {
        const res = await companyProfileService.getProfile();
        const p = res?.data || res?.companyProfile || (res && res.id ? res : null);
        if (isMounted && p) {
          setCompanyProfile(p);
        }
      } catch (e) { }
    };
    loadComp();

    const handleUpdate = (e) => {
      if (isMounted) {
        setCompanyProfile(e.detail);
      }
    };
    window.addEventListener('companyProfileUpdated', handleUpdate);
    window.addEventListener('authLoginSuccess', loadComp);
    return () => {
      isMounted = false;
      window.removeEventListener('companyProfileUpdated', handleUpdate);
      window.removeEventListener('authLoginSuccess', loadComp);
    };
  }, []);

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

  const isOutletWorkspace = (() => {
    const parts = location.pathname.split('/').filter(Boolean);
    // /pos/master/outlet/:id/something — need at least 5 parts
    return parts[0] === 'pos' && parts[1] === 'master' && parts[2] === 'outlet' && parts[3] && parts[4];
  })();
  const [openOutlets, setOpenOutlets] = useState(() => {
    const parts = location.pathname.split('/').filter(Boolean);
    const inOutletWorkspace = parts[0] === 'pos' && parts[1] === 'master' && parts[2] === 'outlet' && parts[3] && parts[4];
    const currentOutletId = inOutletWorkspace ? Number(parts[3]) : null;
    const initialOpen = {};
    if (currentOutletId) {
      initialOpen[currentOutletId] = true;
    } else if (location.pathname.startsWith('/restaurant') &&
      !location.pathname.includes('/master') &&
      !location.pathname.includes('/masters') &&
      !location.pathname.includes('order-details')) {
      initialOpen[activeOutletId || 1] = true;
    }
    if (location.pathname.includes('order-details')) {
      initialOpen[activeOutletId || 1] = true;
    }
    return initialOpen;
  });
  const [posOpen, setPosOpen] = useState(() =>
    (location.pathname.startsWith('/pos') && !location.pathname.includes('/pos/master/outlet/')) ||
    location.pathname.includes('/restaurant/masters') ||
    location.pathname.includes('/restaurant/master') ||
    location.pathname.includes('order-details')
  );
  const [posMasterOpen, setPosMasterOpen] = useState(() => location.pathname.startsWith('/restaurant/master') || location.pathname.startsWith('/restaurant/masters') || (location.pathname.startsWith('/pos') && !location.pathname.includes('/pos/master/outlet/')));
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

  const handleRestaurantMouseEnter = (e, outletId) => {
    if (!isCollapsed) return;
    clearCloseTimer();
    const rect = e.currentTarget.getBoundingClientRect();
    setActiveFlyout({
      menu: 'restaurant',
      outletId,
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

    const parts = location.pathname.split('/').filter(Boolean);
    const inOutletWorkspace = parts[0] === 'pos' && parts[1] === 'master' && parts[2] === 'outlet' && parts[3] && parts[4];

    if (location.pathname.includes('/restaurant/master/item-menu') || location.pathname.includes('/pos/master/item-menu')) {
      setPosOpen(true);
      setPosMasterOpen(true);
      setItemMenuOpen(true);
    } else if (location.pathname.includes('/restaurant/master') || location.pathname.includes('/restaurant/masters') || location.pathname.includes('/pos/master') || location.pathname.includes('/pos/masters')) {
      if (!inOutletWorkspace) {
        setPosOpen(true);
        setPosMasterOpen(true);
      }
    } else if (location.pathname.includes('order-details')) {
      setPosOpen(true);
      setPosReportOpen(true);
    } else if (inOutletWorkspace) {
      const targetId = Number(parts[3]);
      setOpenOutlets(prev => ({ ...prev, [targetId]: true }));
    } else if (location.pathname.startsWith('/restaurant')) {
      setOpenOutlets(prev => ({ ...prev, [activeOutletId || 1]: true }));
    }
  }, [location.pathname, activeOutletId]);

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
    setShowLogoutModal(true);
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
        <div className="sidebar-brand" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '16px 20px', gap: '8px', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
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
          {!isCollapsed && activeOutletName && (
            <div style={{ fontSize: '11px', fontWeight: '800', background: '#0e7490', color: '#ffffff', padding: '4px 8px', borderRadius: '4px', width: '100%', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '4px' }}>
              Outlet: {activeOutletName}
            </div>
          )}
        </div>

        <nav className="sidebar-menu" onKeyDown={handleSidebarKeyDown}>
          {/* Dashboard */}
          <NavLink to="/" tabIndex={0} className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`} onClick={handleMobileNav} onMouseEnter={handleOtherItemMouseEnter} title={isCollapsed ? "Dashboard" : ""}>
            <FaTachometerAlt className="sidebar-icon" />
            <span>Dashboard</span>
          </NavLink>

          {/* Point Of Sale Accordion Container */}
          <div>
            <div
              tabIndex={0} className={`sidebar-item ${(location.pathname.startsWith('/restaurant/master') || location.pathname.startsWith('/restaurant/masters') || (location.pathname.startsWith('/pos') && !location.pathname.includes('/pos/master/outlet/')) || location.pathname.includes('order-details')) ? 'active' : ''}`}
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

          {/* Room Services (Commented)
          <NavLink to="/room-services" tabIndex={0} className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`} onClick={handleMobileNav} onMouseEnter={handleOtherItemMouseEnter} title={isCollapsed ? "Room Services" : ""}>
            <FaUtensils className="sidebar-icon" />
            <span>Room Services</span>
          </NavLink>
          */}

          {/* Restaurant Accordion Container */}
          {(() => {
            const outletsToRender = [...allOutlets].sort((a, b) => Number(a.id) - Number(b.id));

            return outletsToRender.map((outlet) => {
              const outletId = Number(outlet.id);
              const outletName = outlet.store_name || outlet.name || 'Restaurant';
              const isOpen = !!openOutlets[outletId];
              const isActive = isOutletActive(outletId);

              return (
                <div key={outletId}>
                  <div
                    tabIndex={0}
                    className={`sidebar-item ${isActive ? 'active' : ''}`}
                    onClick={() => {
                      if (isCollapsed) {
                        setActiveFlyout(prev => prev && prev.menu === 'restaurant' && prev.outletId === outletId
                          ? null
                          : { menu: 'restaurant', outletId, top: 320 }
                        );
                        setActiveSubFlyout(null);
                      } else {
                        setOpenOutlets(prev => {
                          const nextState = { [outletId]: !prev[outletId] };
                          if (nextState[outletId]) {
                            setPosOpen(false);
                            setFrontDeskOpen(false);
                            setPurchaseOpen(false);
                          }
                          return nextState;
                        });
                      }
                    }}
                    onMouseEnter={(e) => handleRestaurantMouseEnter(e, outletId)}
                    onMouseLeave={handleRestaurantMouseLeave}
                    style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                    title={isCollapsed ? outletName : ''}
                  >
                    <FaUtensils className="sidebar-icon" />
                    <span>{outletName}</span>
                    <FaChevronRight className={`chevron-icon ${isOpen ? 'open' : ''}`} />
                  </div>

                  {/* Restaurant Submenu (only when NOT collapsed) */}
                  {isOpen && !isCollapsed && (
                    <div className="sidebar-submenu">
                      {restaurantItems.map((item) => {
                        let SubIcon = FaFileAlt;
                        if (item.name === 'POS') SubIcon = FaCashRegister;
                        else if (item.name === 'Billing Desk') SubIcon = FaReceipt;
                        else if (item.name === 'Display Table') SubIcon = FaUtensils;
                        else if (item.name === 'View KOT') SubIcon = FaConciergeBell;
                        else if (item.name === 'Order Details') SubIcon = FaFolder;

                        return (
                          <NavLink
                            tabIndex={0}
                            key={`${outletId}-${item.name}`}
                            to={getOutletMappedPath(item.path, outletId)}
                            className={({ isActive: isLinkActive }) => `sidebar-subitem ${isLinkActive ? 'active' : ''}`}
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
              );
            });
          })()}

          {/* Banquet (Commented)
          <NavLink to="/banquet" tabIndex={0} className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`} onClick={handleMobileNav} onMouseEnter={handleOtherItemMouseEnter} title={isCollapsed ? "Banquet" : ""}>
            <FaGlassCheers className="sidebar-icon" />
            <span>Banquet</span>
          </NavLink>
          */}

          {/* Purchase Accordion Container (Commented Out) */}
          {/*
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

            {purchaseOpen && !isCollapsed && (
              <div className="sidebar-submenu">
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
          */}

          {/* Setting */}
          <NavLink
            to="/setting"
            tabIndex={0}
            className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
            onClick={(e) => {
              handleMobileNav(e);
              setPosOpen(false);
            }}
            onMouseEnter={handleOtherItemMouseEnter}
            title={isCollapsed ? "Setting" : ""}
          >
            <FaCog className="sidebar-icon" />
            <span>Setting</span>
          </NavLink>
        </nav>

        {/* Sidebar Footer with Logout Button & Profile */}
        <div className="sidebar-footer" onMouseEnter={handleOtherItemMouseEnter}>
          <div className="sidebar-profile" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              onClick={() => navigate('/company-profile')}
              style={{
                width: '36px',
                height: '36px',
                minWidth: '36px',
                borderRadius: '6px',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                padding: companyProfile?.logo ? '2px' : '0'
              }}
              title="Open Company Profile"
            >
              {companyProfile?.logo ? (
                <img
                  src={companyProfile.logo}
                  alt="Logo"
                  style={{ width: '100%', height: '100%', objectFit: 'contain', imageRendering: '-webkit-optimize-contrast' }}
                />
              ) : (
                <FaUserCircle size={22} style={{ color: '#0f766e' }} />
              )}
            </div>
            <div
              className="profile-details"
              onClick={() => navigate('/company-profile')}
              style={{ cursor: 'pointer', flex: 1, minWidth: 0 }}
              title="Open Company Profile"
            >
              <span className="profile-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                {companyProfile?.company_name || companyProfile?.name || 'ALFA Restaurant'}
              </span>
              <span className="profile-role" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block', color: activeOutletName ? '#0e7490' : '#64748b', fontWeight: activeOutletName ? '800' : 'normal' }}>
                {activeOutletName ? `Outlet: ${activeOutletName}` : (companyProfile?.city ? `${companyProfile.city}, ${companyProfile.state || ''}`.replace(/,\s*$/, '') : 'Company Details')}
              </span>
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
      <ConfirmationDialog
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={onLogout}
        title="Confirm Log Out"
        message="Are you sure you want to log out from ALFA HMS?"
        confirmText="Log Out"
        cancelText="Cancel"
        type="danger"
        isLoadingText="Logging out..."
      />
    </>
  );
};

export default Sidebar;
