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
  purchaseMasters,
  purchaseOperationsProcess,
  purchaseOperationsDirect,
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
         activeSubFlyout.submenu === 'purchase-master' ? 'Purchase Master' :
         activeSubFlyout.submenu === 'purchase-operation' ? 'Purchase Operations' :
         activeSubFlyout.submenu.charAt(0).toUpperCase() + activeSubFlyout.submenu.slice(1)}
      </div>
      <div className="flyout-menu-items scrollable-submenu">
        {activeSubFlyout.submenu === 'purchase-master' && purchaseMasters && purchaseMasters.map((m) => (
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

        {activeSubFlyout.submenu === 'purchase-operation' && (
          <>
            <div style={{ padding: '6px 12px 2px', fontSize: '0.68rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Purchase Process</div>
            {purchaseOperationsProcess && purchaseOperationsProcess.map((o) => (
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

            <div style={{ padding: '8px 12px 2px', fontSize: '0.68rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Direct Process</div>
            {purchaseOperationsDirect && purchaseOperationsDirect.map((o) => (
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
          </>
        )}

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
