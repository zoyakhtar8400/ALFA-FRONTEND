import { NavLink } from 'react-router-dom';

const SidebarFlyoutL2 = ({
  isCollapsed,
  activeFlyout,
  activeSubFlyout,
  handleFlyoutL2MouseEnter,
  handleFlyoutL2MouseLeave,
  masters,
  operations,
  misItems,
  setActiveFlyout,
  setActiveSubFlyout,
  handleMobileNav,
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
  );
};

export default SidebarFlyoutL2;
