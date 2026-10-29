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
  FaChevronDown,
  FaChevronLeft,
  FaFolder,
  FaChartBar,
  FaFileAlt,
  FaReceipt,
  FaBars,
  FaStore,
  FaLayerGroup,
  FaThLarge,
  FaBuilding,
  FaChartLine,
  FaMoon,
  FaKeyboard,
  FaHandPointer
} from 'react-icons/fa';
import { useRestaurant } from '../../context/RestaurantContext';

const Sidebar = ({ isOpen, toggleSidebar, isCollapsed, toggleCollapse, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { activeOutletId, allOutlets, selectOutlet } = useRestaurant();
  const [adminOpen, setAdminOpen] = useState(false);

  // Billing Mode State: 'Touch Screen' vs 'Keyboard' (default: 'Touch Screen')
  const [billingMode, setBillingMode] = useState(() => {
    try {
      const saved = localStorage.getItem('alfa_billing_mode') || localStorage.getItem('billing_mode');
      return saved === 'Keyboard' ? 'Keyboard' : 'Touch Screen';
    } catch {
      return 'Touch Screen';
    }
  });

  const handleBillingModeChange = (mode) => {
    setBillingMode(mode);
    try {
      localStorage.setItem('alfa_billing_mode', mode);
      localStorage.setItem('billing_mode', mode);
      window.dispatchEvent(new CustomEvent('billingModeChanged', { detail: { mode } }));
    } catch (e) {
      console.warn('Could not persist billing mode:', e);
    }
  };

  // Sync across tabs/windows
  React.useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'alfa_billing_mode' || e.key === 'billing_mode') {
        const val = e.newValue;
        if (val === 'Touch Screen' || val === 'Keyboard') {
          setBillingMode(val);
        }
      }
    };
    const handleCustom = (e) => {
      if (e.detail?.mode) {
        setBillingMode(e.detail.mode);
      }
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener('billingModeChanged', handleCustom);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('billingModeChanged', handleCustom);
    };
  }, []);

  // Fallback if no outlets in state yet
  const outletsToRender = allOutlets && allOutlets.length > 0
    ? allOutlets
    : [{ id: 1, name: 'Main Restaurant Outlet', store_name: 'Main Restaurant Outlet' }];

  // State to track open/closed state for each outlet
  const [openOutlets, setOpenOutlets] = useState(() => {
    const initial = {};
    outletsToRender.forEach((o, i) => {
      // First outlet or currently active outlet open by default
      initial[o.id] = i === 0 || Number(o.id) === Number(activeOutletId);
    });
    return initial;
  });

  const toggleOutletAccordion = (outletId) => {
    setOpenOutlets(prev => ({
      ...prev,
      [outletId]: !prev[outletId]
    }));
  };

  const handleMobileNav = () => {
    if (window.innerWidth <= 768) {
      toggleSidebar();
    }
  };

  const isMasterActive =
    location.pathname.startsWith('/pos/master') ||
    location.pathname.startsWith('/pos/masters') ||
    location.pathname === '/pos';

  // Base navigation items: Display Table, View KOT, Order Detail, Billing Desk
  const allOutletNavItems = [
    { name: 'Display Table', subpath: 'display-table', icon: FaThLarge },
    { name: 'View KOT', subpath: 'view-kot', icon: FaConciergeBell },
    { name: 'Order Detail', subpath: 'order-details', icon: FaFileAlt },
    { name: 'Billing Desk', subpath: 'billing-desk', icon: FaReceipt },
  ];

  // Dynamic items based on Billing Mode:
  // Touch Screen -> Display Table, View KOT, Order Detail, Billing Desk
  // Keyboard     -> Display Table, View KOT, Order Detail (Billing Desk hidden)
  const outletNavItems = allOutletNavItems.filter(item => {
    if (billingMode === 'Keyboard' && item.name === 'Billing Desk') {
      return false;
    }
    return true;
  });

  return (
    <>
      {/* Backdrop for mobile devices */}
      <div
        className={`sidebar-backdrop ${isOpen ? 'open' : ''}`}
        onClick={toggleSidebar}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.4)',
          zIndex: 90,
          display: isOpen && window.innerWidth <= 768 ? 'block' : 'none'
        }}
      />

      <aside
        className={`sidebar ${isOpen ? 'open' : ''} ${isCollapsed ? 'collapsed' : ''}`}
        style={{
          width: isCollapsed ? '64px' : '230px',
          minWidth: isCollapsed ? '64px' : '230px',
          background: '#ffffff',
          borderRight: '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          position: 'relative',
          transition: 'width 0.22s ease-in-out',
          fontFamily: 'var(--font-family, system-ui)',
          userSelect: 'none'
        }}
      >
        {/* Floating Right Collapse Chevron Button (<) matching screenshot */}
        <button
          onClick={toggleCollapse}
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          style={{
            position: 'absolute',
            right: '-10px',
            top: '48%',
            transform: 'translateY(-50%)',
            width: '20px',
            height: '28px',
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 120,
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            color: '#64748b',
            fontSize: '10px'
          }}
          className="hover:text-teal-700 hover:border-teal-500"
        >
          {isCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
        </button>

        {/* ── Brand Header (Matching Screenshot & Linked to Company Profile) ── */}
        <div
          onClick={() => navigate('/company-profile')}
          title="Company Setup & Profile"
          style={{
            padding: isCollapsed ? '12px 6px' : '14px 16px',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            justifyContent: isCollapsed ? 'center' : 'flex-start',
            cursor: 'pointer'
          }}
          className="hover:bg-slate-50 transition-colors"
        >
          {/* Original ALFA Logo */}
          <div
            style={{
              width: isCollapsed ? '32px' : '36px',
              height: isCollapsed ? '32px' : '36px',
              borderRadius: '8px',
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              overflow: 'hidden',
              padding: '2px'
            }}
          >
            <img
              src="/logo/alfa-logo.png"
              alt="ALFA POS Logo"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain'
              }}
              onError={(e) => {
                e.currentTarget.src = '/logo/hotel-logo.png';
              }}
            />
          </div>

          {!isCollapsed && (
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.2' }}>
              <span style={{ fontSize: '14.5px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.2px' }}>
                ALFA POS
              </span>
              <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 500, letterSpacing: '0.01em' }}>
                Hospitality Operating System
              </span>
            </div>
          )}
        </div>

        {/* ── Scrollable Menu Body ── */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: '10px 8px',
          display: 'flex',
          flexDirection: 'column',
          gap: '2px'
        }}>

          {/* ══════ SECTION: POINT OF SALE ══════ */}
          {!isCollapsed && (
            <div style={{
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '0.06em',
              color: '#94a3b8',
              textTransform: 'uppercase',
              padding: '6px 10px 2px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span>POINT OF SALE</span>
            </div>
          )}

          {/* Dashboard */}
          <NavLink
            to="/"
            end
            onClick={handleMobileNav}
            title={isCollapsed ? 'Dashboard' : ''}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '7px 10px',
              borderRadius: '6px',
              textDecoration: 'none',
              fontSize: '12.5px',
              fontWeight: isActive ? 600 : 500,
              color: isActive ? '#0d9488' : '#334155',
              background: isActive ? '#e6f7f4' : 'transparent',
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              transition: 'all 0.15s ease'
            })}
            className="hover:bg-slate-100"
          >
            <FaThLarge style={{ fontSize: '13px', color: location.pathname === '/' ? '#0d9488' : '#64748b' }} />
            {!isCollapsed && <span>Dashboard</span>}
          </NavLink>

          {/* Master (Active highlighted item in screenshot) */}
          <NavLink
            to="/pos/master"
            onClick={handleMobileNav}
            title={isCollapsed ? 'Master' : ''}
            style={() => ({
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '7px 10px',
              borderRadius: '6px',
              textDecoration: 'none',
              fontSize: '12.5px',
              fontWeight: isMasterActive ? 600 : 500,
              color: isMasterActive ? '#0d9488' : '#334155',
              background: isMasterActive ? '#e6f7f4' : 'transparent',
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              transition: 'all 0.15s ease'
            })}
            className="hover:bg-slate-100"
          >
            <FaLayerGroup style={{ fontSize: '13px', color: isMasterActive ? '#0d9488' : '#64748b' }} />
            {!isCollapsed && <span>Master</span>}
          </NavLink>

          {/* ══════ Outlets Accordion List (Every outlet displays Display Table, View KOT, Order Details, Billing Desk) ══════ */}
          {outletsToRender.map((outlet) => {
            const outletId = Number(outlet.id);
            const outletName = outlet.store_name || outlet.name || `Outlet ${outletId}`;
            const isOpen = !!openOutlets[outletId];
            const isCurrentOutletActive = Number(activeOutletId) === outletId;

            return (
              <div key={outletId} style={{ marginTop: '2px' }}>
                {/* Outlet Header */}
                <div
                  onClick={() => toggleOutletAccordion(outletId)}
                  title={isCollapsed ? outletName : ''}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '7px 10px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '12.5px',
                    fontWeight: 500,
                    color: isCurrentOutletActive ? '#0d9488' : '#334155',
                    background: isCurrentOutletActive && !isOpen ? '#f0fdfa' : 'transparent',
                    justifyContent: isCollapsed ? 'center' : 'space-between',
                    transition: 'all 0.15s ease'
                  }}
                  className="hover:bg-slate-100"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                    <FaStore style={{ fontSize: '13px', color: '#0d9488', flexShrink: 0 }} />
                    {!isCollapsed && (
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {outletName}
                      </span>
                    )}
                  </div>
                  {!isCollapsed && (
                    <FaChevronDown style={{
                      fontSize: '9px',
                      color: '#94a3b8',
                      transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
                      transition: 'transform 0.18s ease'
                    }} />
                  )}
                </div>

                {/* Submenu for this Outlet: Display Table, View KOT, Order Details, Billing Desk */}
                {isOpen && !isCollapsed && (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1px',
                    paddingLeft: '22px',
                    borderLeft: '1px dashed #cbd5e1',
                    marginLeft: '16px',
                    marginTop: '2px',
                    marginBottom: '4px'
                  }}>
                    {outletNavItems.map((item, idx) => {
                      const Icon = item.icon;
                      // Target route for this outlet
                      const targetPath = `/pos/master/outlet/${outletId}/${item.subpath}`;
                      const isItemActive =
                        (location.pathname === targetPath || location.pathname === `/restaurant/${item.subpath}`) &&
                        (Number(activeOutletId) === outletId);

                      return (
                        <NavLink
                          key={idx}
                          to={targetPath}
                          onClick={() => {
                            selectOutlet(outletId);
                            handleMobileNav();
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '6px 8px',
                            borderRadius: '5px',
                            textDecoration: 'none',
                            fontSize: '11.8px',
                            color: isItemActive ? '#0d9488' : '#475569',
                            background: isItemActive ? '#e6f7f4' : 'transparent',
                            fontWeight: isItemActive ? 600 : 400,
                            transition: 'all 0.15s ease'
                          }}
                          className="hover:bg-slate-100"
                        >
                          <Icon style={{ fontSize: '11px', flexShrink: 0 }} />
                          <span>{item.name}</span>
                        </NavLink>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {/* ══════ SECTION: ONLINE ORDERS ══════ */}
          {!isCollapsed && (
            <div style={{
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '0.06em',
              color: '#94a3b8',
              textTransform: 'uppercase',
              padding: '12px 10px 2px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span>ONLINE ORDERS</span>
            </div>
          )}

          {/* Zomato */}
          <div
            title="Zomato Integration"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: isCollapsed ? 'center' : 'space-between',
              padding: '7px 10px',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
            className="hover:bg-slate-100"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{
                color: '#e23744',
                fontWeight: 900,
                fontSize: '13px',
                fontStyle: 'italic',
                fontFamily: 'sans-serif'
              }}>
                Z
              </span>
              {!isCollapsed && <span style={{ fontSize: '12.5px', color: '#e23744', fontWeight: 600 }}>Zomato</span>}
            </div>
            {!isCollapsed && (
              <span style={{
                fontSize: '9px',
                fontWeight: 700,
                color: '#e23744',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                padding: '1px 5px',
                borderRadius: '4px'
              }}>
                LIVE
              </span>
            )}
          </div>

          {/* Swiggy */}
          <div
            title="Swiggy Integration"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: isCollapsed ? 'center' : 'space-between',
              padding: '7px 10px',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
            className="hover:bg-slate-100"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{
                color: '#fc8019',
                fontWeight: 900,
                fontSize: '13px',
                fontFamily: 'sans-serif'
              }}>
                S
              </span>
              {!isCollapsed && <span style={{ fontSize: '12.5px', color: '#fc8019', fontWeight: 600 }}>Swiggy</span>}
            </div>
            {!isCollapsed && (
              <span style={{
                fontSize: '9px',
                fontWeight: 700,
                color: '#fc8019',
                background: '#fff7ed',
                border: '1px solid #fed7aa',
                padding: '1px 5px',
                borderRadius: '4px'
              }}>
                LIVE
              </span>
            )}
          </div>

          {/* ══════ SECTION: REPORTS ══════ */}
          {!isCollapsed && (
            <div style={{
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '0.06em',
              color: '#94a3b8',
              textTransform: 'uppercase',
              padding: '12px 10px 2px'
            }}>
              <span>REPORTS</span>
            </div>
          )}

          {/* Reports Dashboard (Growth & Loss) */}
          <NavLink
            to="/pos/report"
            end
            onClick={handleMobileNav}
            title={isCollapsed ? 'Growth & Loss Dashboard' : ''}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '7px 10px',
              borderRadius: '6px',
              textDecoration: 'none',
              fontSize: '12.5px',
              fontWeight: isActive ? 600 : 500,
              color: isActive ? '#0d9488' : '#334155',
              background: isActive ? '#e6f7f4' : 'transparent',
              justifyContent: isCollapsed ? 'center' : 'flex-start'
            })}
            className="hover:bg-slate-100"
          >
            <FaChartLine style={{ fontSize: '13px', color: location.pathname === '/pos/report' ? '#0d9488' : '#64748b' }} />
            {!isCollapsed && <span>Dashboard</span>}
          </NavLink>

          {/* Reports Catalog (All 32 Reports) */}
          <NavLink
            to="/pos/report/catalog"
            onClick={handleMobileNav}
            title={isCollapsed ? 'All Reports' : ''}
            style={({ isActive }) => {
              const isCatalogActive = isActive || location.pathname.startsWith('/pos/report/') && location.pathname !== '/pos/report';
              return {
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '7px 10px',
                borderRadius: '6px',
                textDecoration: 'none',
                fontSize: '12.5px',
                fontWeight: isCatalogActive ? 600 : 500,
                color: isCatalogActive ? '#0d9488' : '#334155',
                background: isCatalogActive ? '#e6f7f4' : 'transparent',
                justifyContent: isCollapsed ? 'center' : 'flex-start'
              };
            }}
            className="hover:bg-slate-100"
          >
            <FaFileAlt style={{ fontSize: '13px', color: (location.pathname.startsWith('/pos/report/') && location.pathname !== '/pos/report') ? '#0d9488' : '#64748b' }} />
            {!isCollapsed && <span>Reports</span>}
          </NavLink>

          {/* Night Audit & Day-End Settlement */}
          <NavLink
            to="/front-desk/operation/night-audit-entry"
            onClick={handleMobileNav}
            title={isCollapsed ? 'Night Audit' : ''}
            style={({ isActive }) => {
              const isAuditActive = isActive || location.pathname.includes('night-audit');
              return {
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '7px 10px',
                borderRadius: '6px',
                textDecoration: 'none',
                fontSize: '12.5px',
                fontWeight: isAuditActive ? 600 : 500,
                color: isAuditActive ? '#0d9488' : '#334155',
                background: isAuditActive ? '#e6f7f4' : 'transparent',
                justifyContent: isCollapsed ? 'center' : 'flex-start'
              };
            }}
            className="hover:bg-slate-100"
          >
            <FaMoon style={{ fontSize: '13px', color: location.pathname.includes('night-audit') ? '#0d9488' : '#64748b' }} />
            {!isCollapsed && <span>Night Audit</span>}
          </NavLink>

          {/* ══════ SECTION: ADMINISTRATION ══════ */}
          {!isCollapsed && (
            <div style={{
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '0.06em',
              color: '#94a3b8',
              textTransform: 'uppercase',
              padding: '12px 10px 2px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer'
            }}
            onClick={() => setAdminOpen(!adminOpen)}
            >
              <span>ADMINISTRATION</span>
              <FaChevronDown style={{
                fontSize: '8px',
                transform: adminOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
                transition: 'transform 0.15s ease'
              }} />
            </div>
          )}

          {/* Company Setup (Connected to Company Profile Page) */}
          <NavLink
            to="/company-profile"
            onClick={handleMobileNav}
            title={isCollapsed ? 'Company Setup' : ''}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '7px 10px',
              borderRadius: '6px',
              textDecoration: 'none',
              fontSize: '12.5px',
              fontWeight: isActive ? 600 : 500,
              color: isActive ? '#0d9488' : '#334155',
              background: isActive ? '#e6f7f4' : 'transparent',
              justifyContent: isCollapsed ? 'center' : 'flex-start'
            })}
            className="hover:bg-slate-100"
          >
            <FaBuilding style={{ fontSize: '13px', color: '#64748b' }} />
            {!isCollapsed && <span>Company Setup</span>}
          </NavLink>

          {/* Settings */}
          <NavLink
            to="/setting"
            onClick={handleMobileNav}
            title={isCollapsed ? 'Settings' : ''}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '7px 10px',
              borderRadius: '6px',
              textDecoration: 'none',
              fontSize: '12.5px',
              fontWeight: isActive ? 600 : 500,
              color: isActive ? '#0d9488' : '#334155',
              background: isActive ? '#e6f7f4' : 'transparent',
              justifyContent: isCollapsed ? 'center' : 'flex-start'
            })}
            className="hover:bg-slate-100"
          >
            <FaCog style={{ fontSize: '13px', color: '#64748b' }} />
            {!isCollapsed && <span>Settings</span>}
          </NavLink>

          {/* Extra Administration Modules (Collapsible) */}
          {adminOpen && !isCollapsed && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1px',
              paddingLeft: '20px',
              borderLeft: '1px dashed #cbd5e1',
              marginLeft: '16px',
              marginTop: '2px'
            }}>
              <NavLink to="/front-desk" onClick={handleMobileNav} style={{ fontSize: '11.5px', color: '#475569', textDecoration: 'none', padding: '5px 8px', borderRadius: '4px' }} className="hover:bg-slate-100">
                Front Desk
              </NavLink>
              <NavLink to="/housekeeping" onClick={handleMobileNav} style={{ fontSize: '11.5px', color: '#475569', textDecoration: 'none', padding: '5px 8px', borderRadius: '4px' }} className="hover:bg-slate-100">
                House Keeping
              </NavLink>
              <NavLink to="/purchase" onClick={handleMobileNav} style={{ fontSize: '11.5px', color: '#475569', textDecoration: 'none', padding: '5px 8px', borderRadius: '4px' }} className="hover:bg-slate-100">
                Purchase & Inventory
              </NavLink>
              <NavLink to="/banquet" onClick={handleMobileNav} style={{ fontSize: '11.5px', color: '#475569', textDecoration: 'none', padding: '5px 8px', borderRadius: '4px' }} className="hover:bg-slate-100">
                Banquet & Events
              </NavLink>
            </div>
          )}

        </div>

        {/* ── Sidebar Footer (ALFA POS v1.0 matching screenshot) ── */}
        {!isCollapsed && (
          <div style={{
            padding: '10px 14px',
            borderTop: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#ffffff'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#334155' }}>ALFA POS</span>
            </div>
            <span style={{
              fontSize: '10px',
              fontWeight: 700,
              color: '#64748b',
              background: '#f1f5f9',
              padding: '2px 6px',
              borderRadius: '4px'
            }}>
              v1.0
            </span>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;
