import React from 'react';
import { NavLink } from 'react-router-dom';

const SidebarFlyoutL3 = ({
  isCollapsed,
  activeFlyout,
  activeSubFlyout,
  activeSubSubFlyout,
  handleFlyoutL3MouseEnter,
  handleFlyoutL3MouseLeave,
  restaurantMasters,
  setActiveFlyout,
  setActiveSubFlyout,
  setActiveSubSubFlyout,
  handleMobileNav,
}) => {
  if (!isCollapsed || !activeFlyout || !activeSubFlyout || !activeSubSubFlyout) return null;

  // Find the subitems to display
  let subitems = [];
  if (activeSubSubFlyout.submenu === 'item-menu') {
    const itemMenuObj = restaurantMasters?.find(m => m.name === 'Item Menu');
    subitems = itemMenuObj?.subitems || [];
  }

  if (subitems.length === 0) return null;

  return (
    <div
      className="sidebar-flyout-l3"
      style={{ top: `${activeSubSubFlyout.top}px` }}
      onMouseEnter={handleFlyoutL3MouseEnter}
      onMouseLeave={handleFlyoutL3MouseLeave}
    >
      <div className="flyout-header">
        {activeSubSubFlyout.submenu === 'item-menu' ? 'Item Menu' : activeSubSubFlyout.submenu}
      </div>
      <div className="flyout-menu-items scrollable-submenu">
        {subitems.map((sub) => (
          <NavLink
            key={sub.name}
            to={sub.path}
            className={({ isActive }) => `flyout-subitem ${isActive ? 'active' : ''}`}
            onClick={() => {
              setActiveFlyout(null);
              setActiveSubFlyout(null);
              setActiveSubSubFlyout(null);
              handleMobileNav();
            }}
          >
            {sub.name}
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default SidebarFlyoutL3;
