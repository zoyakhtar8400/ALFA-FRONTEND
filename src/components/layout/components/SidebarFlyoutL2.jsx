import { NavLink } from 'react-router-dom';
import { FaChevronRight } from 'react-icons/fa';

const SidebarFlyoutL2 = ({
  isCollapsed,
  activeFlyout,
  activeSubFlyout,
  activeSubSubFlyout,
  handleFlyoutL2MouseEnter,
  handleFlyoutL2MouseLeave,
  handleSubSubmenuMouseEnter,
  handleSubSubmenuMouseLeave,
  masters,
  operations,
  misItems,
  restaurantMasters,
  setActiveFlyout,
  setActiveSubFlyout,
  setActiveSubSubFlyout,
  handleMobileNav,
  location,
}) => {
  if (!isCollapsed || !activeFlyout || !activeSubFlyout) return null;

  return (
    <div
      className="sidebar-flyout-l2"
      style={{ top: `${activeSubFlyout.top}px` }}
      onMouseEnter={handleFlyoutL2MouseEnter}
      onMouseLeave={handleFlyoutL2MouseLeave}
    >
      <div className="flyout-header">
        {activeSubFlyout.submenu === 'mis' ? 'MIS' : 
         activeSubFlyout.submenu === 'restaurant-master' ? 'Master' :
         activeSubFlyout.submenu === 'restaurant-report' ? 'Report' :
         activeSubFlyout.submenu.charAt(0).toUpperCase() + activeSubFlyout.submenu.slice(1)}
      </div>
      <div className="flyout-menu-items scrollable-submenu">
        {activeSubFlyout.submenu === 'restaurant-master' && restaurantMasters && restaurantMasters.map((m) => {
          if (m.subitems) {
            return (
              <div
                key={m.name}
                className={`flyout-subitem ${location.pathname.startsWith(m.path) ? 'active' : ''} ${activeSubSubFlyout?.submenu === 'item-menu' ? 'hovered' : ''}`}
                onMouseEnter={(e) => handleSubSubmenuMouseEnter(e, 'item-menu')}
                onMouseLeave={handleSubSubmenuMouseLeave}
                onClick={() => setActiveSubSubFlyout(prev => prev?.submenu === 'item-menu' ? null : { submenu: 'item-menu', top: activeSubFlyout.top })}
                style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '6px' }}
              >
                <span>{m.name}</span>
                <FaChevronRight style={{ fontSize: '0.7rem', marginLeft: 'auto', opacity: 0.8 }} />
              </div>
            );
          }

          return (
            <NavLink
              key={m.name}
              to={m.path}
              className={({ isActive }) => `flyout-subitem ${isActive ? 'active' : ''}`}
              onClick={() => {
                setActiveFlyout(null);
                setActiveSubFlyout(null);
                handleMobileNav();
              }}
              onMouseEnter={() => setActiveSubSubFlyout(null)}
            >
              {m.name}
            </NavLink>
          );
        })}

        {activeSubFlyout.submenu === 'restaurant-report' && (
          <NavLink
            to="/restaurant/order-details"
            className={({ isActive }) => `flyout-subitem ${isActive ? 'active' : ''}`}
            onClick={() => {
              setActiveFlyout(null);
              setActiveSubFlyout(null);
              handleMobileNav();
            }}
          >
            Order Details Report
          </NavLink>
        )}

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
  );
};

export default SidebarFlyoutL2;
