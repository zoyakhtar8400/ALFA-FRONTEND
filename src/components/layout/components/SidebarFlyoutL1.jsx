import { NavLink } from 'react-router-dom';
import { FaCogs, FaFolder, FaChartBar, FaFileAlt, FaChevronRight, FaUtensils, FaConciergeBell } from 'react-icons/fa';

const SidebarFlyoutL1 = ({
  isCollapsed,
  activeFlyout,
  location,
  activeSubFlyout,
  handleFlyoutL1MouseEnter,
  handleFlyoutL1MouseLeave,
  handleSubmenuMouseEnter,
  handleSubmenuMouseLeave,
  setActiveSubFlyout,
  handleMobileNav,
  setActiveFlyout,
}) => {
  if (!isCollapsed || !activeFlyout || (activeFlyout.menu !== 'front-desk' && activeFlyout.menu !== 'restaurant')) return null;

  const isRestaurant = activeFlyout.menu === 'restaurant';
  const prefix = isRestaurant ? '/restaurant' : '/front-desk';

  return (
    <div
      className="sidebar-flyout-l1"
      style={{ top: `${activeFlyout.top}px` }}
      onMouseEnter={handleFlyoutL1MouseEnter}
      onMouseLeave={handleFlyoutL1MouseLeave}
    >
      <div className="flyout-header">{isRestaurant ? 'Restaurant' : 'Front Desk'}</div>
      <div className="flyout-menu-items">
        {isRestaurant ? (
          <>
            <NavLink
              to="/restaurant/display-table"
              className={({ isActive }) => `flyout-menu-item ${isActive ? 'active' : ''}`}
              onClick={() => {
                setActiveFlyout(null);
                setActiveSubFlyout(null);
                handleMobileNav();
              }}
              onMouseEnter={() => setActiveSubFlyout(null)}
            >
              <FaUtensils className="flyout-item-icon" />
              <span>Display Table</span>
            </NavLink>

            <NavLink
              to="/restaurant/view-kot"
              className={({ isActive }) => `flyout-menu-item ${isActive ? 'active' : ''}`}
              onClick={() => {
                setActiveFlyout(null);
                setActiveSubFlyout(null);
                handleMobileNav();
              }}
              onMouseEnter={() => setActiveSubFlyout(null)}
            >
              <FaConciergeBell className="flyout-item-icon" />
              <span>View KOT</span>
            </NavLink>

            <NavLink
              to="/restaurant/order-details"
              className={({ isActive }) => `flyout-menu-item ${isActive ? 'active' : ''}`}
              onClick={() => {
                setActiveFlyout(null);
                setActiveSubFlyout(null);
                handleMobileNav();
              }}
              onMouseEnter={() => setActiveSubFlyout(null)}
            >
              <FaFolder className="flyout-item-icon" />
              <span>Order Details</span>
            </NavLink>
          </>
        ) : (
          <>
            <div
              className={`flyout-menu-item ${location.pathname.startsWith(`${prefix}/master`) ? 'active' : ''} ${activeSubFlyout?.submenu === 'master' ? 'hovered' : ''}`}
              onMouseEnter={(e) => handleSubmenuMouseEnter(e, 'master')}
              onMouseLeave={handleSubmenuMouseLeave}
              onClick={() => setActiveSubFlyout(prev => prev?.submenu === 'master' ? null : { submenu: 'master', top: activeFlyout.top })}
            >
              <FaCogs className="flyout-item-icon" />
              <span>Master</span>
              <FaChevronRight className="flyout-chevron" />
            </div>

            <div
              className={`flyout-menu-item ${location.pathname.startsWith(`${prefix}/operation`) ? 'active' : ''} ${activeSubFlyout?.submenu === 'operation' ? 'hovered' : ''}`}
              onMouseEnter={(e) => handleSubmenuMouseEnter(e, 'operation')}
              onMouseLeave={handleSubmenuMouseLeave}
              onClick={() => setActiveSubFlyout(prev => prev?.submenu === 'operation' ? null : { submenu: 'operation', top: activeFlyout.top })}
            >
              <FaFolder className="flyout-item-icon" />
              <span>Operation</span>
              <FaChevronRight className="flyout-chevron" />
            </div>

            <div
              className={`flyout-menu-item ${location.pathname.startsWith(`${prefix}/mis`) ? 'active' : ''} ${activeSubFlyout?.submenu === 'mis' ? 'hovered' : ''}`}
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
          </>
        )}
      </div>
    </div>
  );
};

export default SidebarFlyoutL1;
