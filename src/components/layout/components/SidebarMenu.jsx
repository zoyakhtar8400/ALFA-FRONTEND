import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaChartLine, FaBed, FaUtensils, FaChevronDown, FaChevronRight,
  FaHome, FaExchangeAlt, FaFolder, FaFileAlt, FaSignOutAlt,
  FaConciergeBell, FaFolderOpen, FaBuilding, FaWrench, FaCogs,
  FaCalculator, FaClock, FaCalendarAlt, FaTools, FaShoppingBag
} from 'react-icons/fa';

const SidebarMenu = ({
  location, isCollapsed, searchQuery, handleMobileNav,
  frontDeskOpen, setFrontDeskOpen,
  masterOpen, setMasterOpen,
  operationOpen, setOperationOpen,
  misOpen, setMisOpen,
  restaurantOpen, setRestaurantOpen,
  posOpen, setPosOpen,
  posMasterOpen, setPosMasterOpen,
  posReportOpen, setPosReportOpen,
  itemMenuOpen, setItemMenuOpen,
  masters, operations, misItems,
  restaurantItems, restaurantMasters,
  handleFrontDeskMouseEnter, handleFrontDeskMouseLeave,
  handleRestaurantMouseEnter, handleRestaurantMouseLeave,
  handleOtherItemMouseEnter
}) => {
  const currentPath = location.pathname;
  const isQuery = searchQuery.trim().length > 0;
  const query = searchQuery.toLowerCase();

  // Highlight check
  const isActive = (path) => currentPath === path;
  
  // Accordions filter match check
  const matchesFilter = (label) => {
    if (!isQuery) return true;
    return label.toLowerCase().includes(query);
  };

  const hasMatchesFD = () => {
    if (!isQuery) return true;
    const mMatch = masters.some(m => matchesFilter(m.label));
    const oMatch = operations.some(o => matchesFilter(o.label));
    const miMatch = misItems.some(mi => matchesFilter(mi.label));
    return mMatch || oMatch || miMatch;
  };

  const hasMatchesRest = () => {
    if (!isQuery) return true;
    const rMatch = restaurantItems.some(ri => matchesFilter(ri.label));
    const rmMatch = restaurantMasters.some(rm => matchesFilter(rm.label));
    return rMatch || rmMatch;
  };

  return (
    <div 
      className="sidebar-menu-scroll custom-scrollbar" 
      style={{ flex: 1, overflowY: 'auto', padding: '0 12px 16px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}
    >
      {/* Dashboard Link */}
      {matchesFilter('Dashboard') && (
        <Link
          to="/"
          onClick={handleMobileNav}
          onMouseEnter={handleOtherItemMouseEnter}
          className={`sidebar-menu-link ${isActive('/') ? 'active' : ''}`}
          style={{
            display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px',
            borderRadius: '6px', fontSize: '0.8rem', fontWeight: isActive('/') ? 800 : 600,
            color: isActive('/') ? '#0e7490' : '#475569', background: isActive('/') ? '#ecfeff' : 'transparent',
            textDecoration: 'none', transition: 'all 0.15s'
          }}
        >
          <FaChartLine size={15} />
          {!isCollapsed && <span>Dashboard</span>}
        </Link>
      )}

      {/* Front Desk Module Section */}
      {hasMatchesFD() && (
        <div 
          onMouseEnter={handleFrontDeskMouseEnter}
          onMouseLeave={handleFrontDeskMouseLeave}
          style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}
        >
          <div
            onClick={() => !isCollapsed && setFrontDeskOpen(prev => !prev)}
            className={`sidebar-menu-link ${currentPath.startsWith('/front-desk') ? 'active-parent' : ''}`}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: isCollapsed ? 'center' : 'space-between',
              padding: '10px 14px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600,
              color: currentPath.startsWith('/front-desk') ? '#0f172a' : '#475569', cursor: isCollapsed ? 'default' : 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FaBed size={15} style={{ color: currentPath.startsWith('/front-desk') ? '#0e7490' : '#64748b' }} />
              {!isCollapsed && <span>Front Office</span>}
            </div>
            {!isCollapsed && (frontDeskOpen ? <FaChevronDown size={10} /> : <FaChevronRight size={10} />)}
          </div>

          {/* Front Desk Nested Drawer Links */}
          {frontDeskOpen && !isCollapsed && (
            <div style={{ paddingLeft: '14px', display: 'flex', flexDirection: 'column', borderLeft: '1px solid #e2e8f0', marginLeft: '20px', gap: '2px', marginTop: '2px' }}>
              {/* Masters Accordion */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div 
                  onClick={() => setMasterOpen(p => !p)} 
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 12px', fontSize: '0.74rem', fontWeight: 700, color: '#64748b', cursor: 'pointer' }}
                >
                  <span>MASTERS</span>
                  {masterOpen ? <FaChevronDown size={8} /> : <FaChevronRight size={8} />}
                </div>
                {masterOpen && masters.filter(m => matchesFilter(m.label)).map(m => (
                  <Link
                    key={m.path}
                    to={m.path}
                    onClick={handleMobileNav}
                    style={{
                      display: 'block', padding: '6px 12px 6px 20px', fontSize: '0.74rem', fontWeight: isActive(m.path) ? 800 : 600,
                      color: isActive(m.path) ? '#0e7490' : '#64748b', textDecoration: 'none', background: isActive(m.path) ? '#ecfeff' : 'transparent',
                      borderRadius: '4px'
                    }}
                  >
                    {m.label}
                  </Link>
                ))}
              </div>

              {/* Operations Accordion */}
              <div style={{ display: 'flex', flexDirection: 'column', marginTop: '4px' }}>
                <div 
                  onClick={() => setOperationOpen(p => !p)} 
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 12px', fontSize: '0.74rem', fontWeight: 700, color: '#64748b', cursor: 'pointer' }}
                >
                  <span>OPERATIONS</span>
                  {operationOpen ? <FaChevronDown size={8} /> : <FaChevronRight size={8} />}
                </div>
                {operationOpen && operations.filter(o => matchesFilter(o.label)).map(o => (
                  <Link
                    key={o.path}
                    to={o.path}
                    onClick={handleMobileNav}
                    style={{
                      display: 'block', padding: '6px 12px 6px 20px', fontSize: '0.74rem', fontWeight: isActive(o.path) ? 800 : 600,
                      color: isActive(o.path) ? '#0e7490' : '#64748b', textDecoration: 'none', background: isActive(o.path) ? '#ecfeff' : 'transparent',
                      borderRadius: '4px'
                    }}
                  >
                    {o.label}
                  </Link>
                ))}
              </div>

              {/* MIS Report Accordion */}
              <div style={{ display: 'flex', flexDirection: 'column', marginTop: '4px' }}>
                <div 
                  onClick={() => setMisOpen(p => !p)} 
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 12px', fontSize: '0.74rem', fontWeight: 700, color: '#64748b', cursor: 'pointer' }}
                >
                  <span>MIS & CHARTS</span>
                  {misOpen ? <FaChevronDown size={8} /> : <FaChevronRight size={8} />}
                </div>
                {misOpen && misItems.filter(mi => matchesFilter(mi.label)).map(mi => (
                  <Link
                    key={mi.path}
                    to={mi.path}
                    onClick={handleMobileNav}
                    style={{
                      display: 'block', padding: '6px 12px 6px 20px', fontSize: '0.74rem', fontWeight: isActive(mi.path) ? 800 : 600,
                      color: isActive(mi.path) ? '#0e7490' : '#64748b', textDecoration: 'none', background: isActive(mi.path) ? '#ecfeff' : 'transparent',
                      borderRadius: '4px'
                    }}
                  >
                    {mi.label}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Restaurant POS Section */}
      {hasMatchesRest() && (
        <div 
          onMouseEnter={handleRestaurantMouseEnter}
          onMouseLeave={handleRestaurantMouseLeave}
          style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}
        >
          <div
            onClick={() => !isCollapsed && setRestaurantOpen(prev => !prev)}
            className={`sidebar-menu-link ${currentPath.startsWith('/restaurant') || currentPath.startsWith('/pos') ? 'active-parent' : ''}`}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: isCollapsed ? 'center' : 'space-between',
              padding: '10px 14px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600,
              color: currentPath.startsWith('/restaurant') || currentPath.startsWith('/pos') ? '#0f172a' : '#475569', cursor: isCollapsed ? 'default' : 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FaUtensils size={15} style={{ color: currentPath.startsWith('/restaurant') || currentPath.startsWith('/pos') ? '#0e7490' : '#64748b' }} />
              {!isCollapsed && <span>Restaurant POS</span>}
            </div>
            {!isCollapsed && (restaurantOpen ? <FaChevronDown size={10} /> : <FaChevronRight size={10} />)}
          </div>

          {/* Restaurant Nested Links */}
          {restaurantOpen && !isCollapsed && (
            <div style={{ paddingLeft: '14px', display: 'flex', flexDirection: 'column', borderLeft: '1px solid #e2e8f0', marginLeft: '20px', gap: '2px', marginTop: '2px' }}>
              <div 
                onClick={() => setPosOpen(p => !p)} 
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 12px', fontSize: '0.74rem', fontWeight: 700, color: '#64748b', cursor: 'pointer' }}
              >
                <span>POS SERVICE</span>
                {posOpen ? <FaChevronDown size={8} /> : <FaChevronRight size={8} />}
              </div>
              {posOpen && restaurantItems.filter(ri => matchesFilter(ri.label)).map(ri => (
                <Link
                  key={ri.path}
                  to={ri.path}
                  onClick={handleMobileNav}
                  style={{
                    display: 'block', padding: '6px 12px 6px 20px', fontSize: '0.74rem', fontWeight: isActive(ri.path) ? 800 : 600,
                    color: isActive(ri.path) ? '#0e7490' : '#64748b', textDecoration: 'none', background: isActive(ri.path) ? '#ecfeff' : 'transparent',
                    borderRadius: '4px'
                  }}
                >
                  {ri.label}
                </Link>
              ))}

              <div 
                onClick={() => setPosMasterOpen(p => !p)} 
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 12px', fontSize: '0.74rem', fontWeight: 700, color: '#64748b', cursor: 'pointer', marginTop: '4px' }}
              >
                <span>POS CONFIGS</span>
                {posMasterOpen ? <FaChevronDown size={8} /> : <FaChevronRight size={8} />}
              </div>
              {posMasterOpen && restaurantMasters.filter(rm => matchesFilter(rm.label)).map(rm => (
                <Link
                  key={rm.path}
                  to={rm.path}
                  onClick={handleMobileNav}
                  style={{
                    display: 'block', padding: '6px 12px 6px 20px', fontSize: '0.74rem', fontWeight: isActive(rm.path) ? 800 : 600,
                    color: isActive(rm.path) ? '#0e7490' : '#64748b', textDecoration: 'none', background: isActive(rm.path) ? '#ecfeff' : 'transparent',
                    borderRadius: '4px'
                  }}
                >
                  {rm.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Direct Module Links */}
      {matchesFilter('Housekeeping') && (
        <Link
          to="/housekeeping"
          onClick={handleMobileNav}
          onMouseEnter={handleOtherItemMouseEnter}
          className={`sidebar-menu-link ${isActive('/housekeeping') ? 'active' : ''}`}
          style={{
            display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px',
            borderRadius: '6px', fontSize: '0.8rem', fontWeight: isActive('/housekeeping') ? 800 : 600,
            color: isActive('/housekeeping') ? '#0e7490' : '#475569', background: isActive('/housekeeping') ? '#ecfeff' : 'transparent',
            textDecoration: 'none', transition: 'all 0.15s'
          }}
        >
          <FaHome size={15} />
          {!isCollapsed && <span>Housekeeping</span>}
        </Link>
      )}

      {/* Room Service Link */}
      {matchesFilter('Room Services') && (
        <Link
          to="/room-services"
          onClick={handleMobileNav}
          onMouseEnter={handleOtherItemMouseEnter}
          className={`sidebar-menu-link ${isActive('/room-services') ? 'active' : ''}`}
          style={{
            display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px',
            borderRadius: '6px', fontSize: '0.8rem', fontWeight: isActive('/room-services') ? 800 : 600,
            color: isActive('/room-services') ? '#0e7490' : '#475569', background: isActive('/room-services') ? '#ecfeff' : 'transparent',
            textDecoration: 'none', transition: 'all 0.15s'
          }}
        >
          <FaConciergeBell size={15} />
          {!isCollapsed && <span>Room Services</span>}
        </Link>
      )}

      {/* Settings Link */}
      {matchesFilter('System Settings') && (
        <Link
          to="/setting"
          onClick={handleMobileNav}
          onMouseEnter={handleOtherItemMouseEnter}
          className={`sidebar-menu-link ${isActive('/setting') ? 'active' : ''}`}
          style={{
            display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px',
            borderRadius: '6px', fontSize: '0.8rem', fontWeight: isActive('/setting') ? 800 : 600,
            color: isActive('/setting') ? '#0e7490' : '#475569', background: isActive('/setting') ? '#ecfeff' : 'transparent',
            textDecoration: 'none', transition: 'all 0.15s'
          }}
        >
          <FaCogs size={15} />
          {!isCollapsed && <span>System Settings</span>}
        </Link>
      )}
    </div>
  );
};

export default React.memo(SidebarMenu);
