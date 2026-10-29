import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import {
  FaReceipt, FaClipboardList, FaUtensils, FaPrint, FaShoppingBag, FaWallet,
  FaTable, FaDesktop, FaMotorcycle, FaSlidersH, FaCoins, FaArrowCircleUp,
  FaArrowCircleDown, FaSyncAlt, FaToggleOn, FaPercent, FaTag, FaUsers,
  FaCommentAlt, FaUser, FaBuilding, FaClock, FaChartBar, FaCalendarCheck,
  FaFileExcel, FaFileAlt, FaChartPie, FaUserCheck, FaSearch, FaStar,
  FaHistory, FaTimes, FaArrowLeft, FaWeight, FaKeyboard, FaHandPointer
} from 'react-icons/fa';
import SettingsCard from './components/SettingsCard';
import TaxStructure from './TaxStructure';
import MenuList from './Menu/MenuList';
import ExpenseList from './Expense/ExpenseList';
import ExpenseForm from './Expense/ExpenseForm';
import BillingScreenConfiguration from './BillingScreenConfiguration';
import UserManagementList from './User/UserManagementList';
import CompanyProfilePage from './CompanyProfile/CompanyProfilePage';
import { useAuth } from '../../context/AuthContext';

const ALL_SETTINGS_MODULES = [
  { id: 'company-profile', title: 'Company Profile', description: 'Business identity, GSTIN, FSSAI & Branding', icon: FaBuilding, section: 'Restaurant Operations', path: '/setting/company-profile' },
  { id: 'user-management', title: 'User Management', description: 'Admin user accounts & role management', icon: FaUser, section: 'Restaurant Operations', path: '/setting/user-management' },
  // Orders & Billing
  { id: 'billing', title: 'Billing', description: 'Open POS Billing Workspace', icon: FaReceipt, section: 'Orders & Billing', path: '/restaurant/pos-billing' },
  { id: 'billing-desk', title: 'Billing Desk', description: 'Open Cashier & Bill Settlement Desk', icon: FaReceipt, section: 'Orders & Billing', path: '/restaurant/billing-desk' },
  { id: 'orders', title: 'Orders', description: 'View & track customer orders', icon: FaClipboardList, section: 'Orders & Billing', path: '/restaurant/order-details' },
  { id: 'online-orders', title: 'Online Orders', description: 'Manage delivery aggregator orders', icon: FaShoppingBag, section: 'Orders & Billing', path: '/restaurant/booking-list' },
  { id: 'kots', title: 'KOTs', description: 'Kitchen order ticket queue', icon: FaUtensils, section: 'Orders & Billing', path: '/restaurant/view-kot' },
  { id: 'due-payment', title: 'Due Payment', description: 'Manage customer credit & dues', icon: FaWallet, section: 'Orders & Billing', path: '/front-desk/operation/payment-recieve-entry' },
  { id: 'billing-screen', title: 'Billing Screen Configuration', description: 'POS Billing screen configuration & default settings', icon: FaReceipt, section: 'Orders & Billing', path: '/setting/billing-screen' },
  { id: 'live-view', title: 'Live View', description: 'Real-time dining room status', icon: FaDesktop, section: 'Orders & Billing', path: '/restaurant/display-table' },
  { id: 'bill-kot-print', title: 'Bill / KOT Print', description: 'Print bill & KOT receipts', icon: FaPrint, section: 'Orders & Billing', path: '/restaurant/master/printer-master' },
  { id: 'table', title: 'Table', description: 'Restaurant table layout desk', icon: FaTable, section: 'Orders & Billing', path: '/restaurant/display-table' },
  { id: 'custom-order-status', title: 'Custom Order Status', description: 'Order workflow status flags', icon: FaSlidersH, section: 'Orders & Billing', path: '/restaurant/booking-list' },
  { id: 'delivery-boys', title: 'Delivery Boys', description: 'Delivery staff management', icon: FaMotorcycle, section: 'Orders & Billing', path: '/pos/master/delivery' },

  // Payments & Finance
  { id: 'cash-flow', title: 'Cash Flow', description: 'Track register cash intake', icon: FaWallet, section: 'Payments & Finance', path: '/front-desk/operation/payment-recieve-entry' },
  { id: 'expense', title: 'Expense', description: 'Record daily petty cash expenses', icon: FaCoins, section: 'Payments & Finance', path: '/pos/operation/expense-entry' },
  { id: 'withdrawal', title: 'Withdrawal', description: 'Cash drawer withdrawals', icon: FaArrowCircleUp, section: 'Payments & Finance', path: '/pos/operation/expense-entry' },
  { id: 'cash-topup', title: 'Cash Top-Up', description: 'Drawer float & top-up entries', icon: FaArrowCircleDown, section: 'Payments & Finance', path: '/front-desk/operation/payment-recieve-entry' },
  { id: 'currency-conversion', title: 'Currency Conversion', description: 'Multi-currency exchange rates', icon: FaSyncAlt, section: 'Payments & Finance', path: '/pos/master/tax-category' },

  // Menu & Inventory
  { id: 'menu', title: 'Menu', description: 'Manage outlet menu & pricing catalog', icon: FaUtensils, section: 'Menu & Inventory', path: '/pos/master/item-menu/menu-item' },
  { id: 'menu-item-on-off', title: 'Menu Item On Off', description: 'Instantly toggle item availability', icon: FaToggleOn, section: 'Menu & Inventory', path: '/pos/master/item-menu/menu-item' },
  { id: 'uom', title: 'Unit of Measure (UOM)', description: 'Manage measurement units (Portion, Plate, Kg, Pc) & conversions', icon: FaWeight, section: 'Menu & Inventory', path: '/pos/master/uom' },
  { id: 'tax', title: 'Tax', description: 'GST slabs & tax calculation rules', icon: FaPercent, section: 'Menu & Inventory', path: '/pos/master/tax-category' },
  { id: 'discount', title: 'Discount', description: 'Discounts & tax categories', icon: FaTag, section: 'Menu & Inventory', path: '/pos/master/tax-category' },
  { id: 'customers', title: 'Customers', description: 'Customer directory & profiles', icon: FaUsers, section: 'Menu & Inventory', path: '/front-desk/operation/guest-profile' },
  { id: 'feedback', title: 'Feedback', description: 'Customer feedback & ratings', icon: FaCommentAlt, section: 'Menu & Inventory', path: '/front-desk/operation/guest-profile' },

  // Restaurant Operations
  { id: 'kitchen', title: 'Kitchen', description: 'KOT display & preparation desk', icon: FaUtensils, section: 'Restaurant Operations', path: '/restaurant/view-kot' },
  { id: 'table-management', title: 'Table Management', description: 'Configure dining tables & zones', icon: FaTable, section: 'Restaurant Operations', path: '/pos/master/table' },
  { id: 'waiter-management', title: 'Waiter Management', description: 'Steward & waiter master registry', icon: FaUser, section: 'Restaurant Operations', path: '/pos/masters/steward-master' },
  { id: 'printer-master', title: 'Printer Master', description: 'Configure KOT & receipt printers', icon: FaPrint, section: 'Restaurant Operations', path: '/restaurant/master/printer-master' },
  { id: 'department-master', title: 'Department Master', description: 'Outlets & POS department masters', icon: FaBuilding, section: 'Restaurant Operations', path: '/pos/master/outlet' },
  { id: 'shift-management', title: 'Shift Management', description: 'Operational shifts & timing', icon: FaClock, section: 'Restaurant Operations', path: '/pos/master/outlet' },

  // Reports
  { id: 'sales-report', title: 'Sales Report', description: 'Comprehensive sales performance', icon: FaChartBar, section: 'Reports', path: '/pos/report' },
  { id: 'day-closing', title: 'Day Closing', description: 'End-of-day register closing summary', icon: FaCalendarCheck, section: 'Reports', path: '/pos/report' },
  { id: 'collection-report', title: 'Collection Report', description: 'Payment mode collection totals', icon: FaFileExcel, section: 'Reports', path: '/pos/report' },
  { id: 'kot-report', title: 'KOT Report', description: 'Kitchen order ticket metrics', icon: FaFileAlt, section: 'Reports', path: '/pos/report' },
  { id: 'tax-report', title: 'Tax Report', description: 'GST & tax audit breakdown', icon: FaReceipt, section: 'Reports', path: '/pos/report' },
  { id: 'item-wise-report', title: 'Item Wise Report', description: 'Item quantity & revenue ranking', icon: FaChartPie, section: 'Reports', path: '/pos/report' },
  { id: 'waiter-wise-report', title: 'Waiter Wise Report', description: 'Steward order performance summary', icon: FaUserCheck, section: 'Reports', path: '/pos/report' }
];

const SECTIONS = [
  'Orders & Billing',
  'Payments & Finance',
  'Menu & Inventory',
  'Restaurant Operations',
  'Reports'
];

const Setting = ({ showToast = () => { } }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;
  const { user } = useAuth();
  // Safe role check: If user role is not explicitly restricted, allow access to User Management
  const isUserAdmin = !user || user?.role === 'ADMIN' || user?.type === 'ADMIN' || user?.role === 'SUPERADMIN' || user?.type === 'SUPERADMIN' || String(user?.username || '').toLowerCase() === 'admin' || user?.role !== 'STAFF';

  const [searchQuery, setSearchQuery] = useState('');

  // Billing Mode State: 'Touch Screen' vs 'Keyboard'
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
      showToast?.(`Billing mode switched to ${mode}. Sidebar updated.`);
    } catch (e) {
      console.warn('Could not persist billing mode:', e);
    }
  };

  // Sync cross-tab/window
  React.useEffect(() => {
    const handleCustom = (e) => {
      if (e.detail?.mode) {
        setBillingMode(e.detail.mode);
      }
    };
    window.addEventListener('billingModeChanged', handleCustom);
    return () => window.removeEventListener('billingModeChanged', handleCustom);
  }, []);

  // Load Pinned Favorites from localStorage
  const [pinnedIds, setPinnedIds] = useState(() => {
    try {
      const saved = localStorage.getItem('alfa_pinned_settings');
      return saved ? JSON.parse(saved) : ['billing', 'billing-screen', 'orders', 'menu'];
    } catch {
      return ['billing', 'billing-screen', 'orders', 'menu'];
    }
  });

  // Load Recently Opened from localStorage
  const [recentlyOpened, setRecentlyOpened] = useState(() => {
    try {
      const saved = localStorage.getItem('alfa_recent_settings');
      return saved ? JSON.parse(saved) : ['billing', 'billing-screen', 'orders', 'menu'];
    } catch {
      return ['billing', 'billing-screen', 'orders', 'menu'];
    }
  });

  // Toggle Pinned status
  const togglePin = useCallback((id) => {
    setPinnedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id];
      try {
        localStorage.setItem('alfa_pinned_settings', JSON.stringify(next));
      } catch (err) { /* ignore */ }
      return next;
    });
  }, []);

  // Handle Card Click
  const handleCardClick = useCallback((item) => {
    // Add to Recently Opened
    setRecentlyOpened((prev) => {
      const filtered = prev.filter((i) => i !== item.id);
      const next = [item.id, ...filtered].slice(0, 5);
      try {
        localStorage.setItem('alfa_recent_settings', JSON.stringify(next));
      } catch (err) { /* ignore */ }
      return next;
    });

    if (item.path) {
      navigate(item.path);
    } else {
      showToast?.(`Opening ${item.title}`);
    }
  }, [navigate, showToast]);

  // Filtered items based on search query
  const filteredModules = useMemo(() => {
    let modules = ALL_SETTINGS_MODULES;
    if (!searchQuery.trim()) return modules;
    const q = searchQuery.toLowerCase().trim();
    return modules.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        m.section.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Map of modules by ID for fast lookup
  const moduleMap = useMemo(() => {
    const map = new Map();
    ALL_SETTINGS_MODULES.forEach((m) => map.set(m.id, m));
    return map;
  }, []);

  // Pinned Items list
  const pinnedList = useMemo(() => {
    return pinnedIds
      .map((id) => moduleMap.get(id))
      .filter(Boolean);
  }, [pinnedIds, moduleMap]);

  // Recently Opened Items list
  const recentList = useMemo(() => {
    return recentlyOpened
      .map((id) => moduleMap.get(id))
      .filter(Boolean);
  }, [recentlyOpened, moduleMap]);

  // Sub-route Check: /setting/company-profile or /setting/profile
  if (path.includes('/setting/company-profile') || path.includes('/setting/profile')) {
    return <CompanyProfilePage showToast={showToast} />;
  }

  // Sub-route Check: /setting/expense/new or edit
  if (path.includes('/setting/expense/new') || path.includes('/setting/expense/edit')) {
    return <ExpenseForm showToast={showToast} />;
  }

  // Sub-route Check: /setting/expense
  if (path.includes('/setting/expense')) {
    return <ExpenseList showToast={showToast} />;
  }

  // Sub-route Check: /setting/user-management or /setting/user
  if (path.includes('/setting/user-management') || path.includes('/setting/user')) {
    return <UserManagementList showToast={showToast} />;
  }

  // Sub-route Check: /setting/billing-screen
  if (path.includes('/setting/billing-screen')) {
    return <BillingScreenConfiguration showToast={showToast} />;
  }

  // Sub-route Check: /setting/menu
  if (path.includes('/setting/menu')) {
    return <Navigate to="/pos/master/item-menu/menu-item" replace />;
  }

  // Sub-route Check: /setting/uom
  if (path.includes('/setting/uom')) {
    return <Navigate to="/pos/master/uom" replace />;
  }

  // Sub-route Check: /setting/tax-structure
  if (path.includes('/setting/tax-structure')) {
    return (
      <div style={{ backgroundColor: '#F8FAFC', minHeight: '100vh', padding: '24px 32px' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
          <button
            type="button"
            onClick={() => navigate('/setting')}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px',
              fontSize: '0.78rem', fontWeight: 700, color: '#334155', backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1', borderRadius: '10px', cursor: 'pointer'
            }}
          >
            <FaArrowLeft style={{ fontSize: '14px', color: '#418a8b' }} /> Back to Operations Dashboard
          </button>
        </div>
        <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <TaxStructure showToast={showToast} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px 32px', backgroundColor: '#F8FAFC', minHeight: '100vh', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1f2937', margin: 0, letterSpacing: '-0.3px' }}>
            Operations & Settings
          </h1>
          <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '4px 0 0 0' }}>
            Enterprise ALFA HMS Operations and Configuration Center.
          </p>
        </div>

        {/* Billing Mode Setting Control */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          backgroundColor: '#ffffff',
          padding: '6px 14px',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0e7490', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Sidebar Billing Mode
            </span>
            <span style={{ fontSize: '0.68rem', color: '#64748b' }}>
              {billingMode === 'Touch Screen' ? 'Shows Billing Desk in sidebar' : 'Hides Billing Desk from sidebar'}
            </span>
          </div>

          <div style={{
            display: 'flex',
            backgroundColor: '#f1f5f9',
            padding: '3px',
            borderRadius: '9px',
            border: '1px solid #e2e8f0'
          }}>
            <button
              type="button"
              onClick={() => handleBillingModeChange('Touch Screen')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '7px',
                border: 'none',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                backgroundColor: billingMode === 'Touch Screen' ? '#0e7490' : 'transparent',
                color: billingMode === 'Touch Screen' ? '#ffffff' : '#64748b',
                boxShadow: billingMode === 'Touch Screen' ? '0 1px 3px rgba(14,116,144,0.3)' : 'none'
              }}
            >
              <FaHandPointer style={{ fontSize: '12px' }} />
              Touch Screen
            </button>
            <button
              type="button"
              onClick={() => handleBillingModeChange('Keyboard')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '7px',
                border: 'none',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                backgroundColor: billingMode === 'Keyboard' ? '#0e7490' : 'transparent',
                color: billingMode === 'Keyboard' ? '#ffffff' : '#64748b',
                boxShadow: billingMode === 'Keyboard' ? '0 1px 3px rgba(14,116,144,0.3)' : 'none'
              }}
            >
              <FaKeyboard style={{ fontSize: '12px' }} />
              Keyboard
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
          <div style={{ position: 'relative', maxWidth: '480px', width: '100%' }}>
            <div style={{ position: 'absolute', top: 0, bottom: 0, left: '12px', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
              <FaSearch style={{ fontSize: '14px', color: '#418a8b' }} />
            </div>
            <input
              type="text"
              placeholder="Search Operations & Settings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%', padding: '10px 14px 10px 38px', backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1', borderRadius: '12px', fontSize: '0.82rem',
                color: '#1f2937', outline: 'none', boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{ position: 'absolute', top: 0, bottom: 0, right: '12px', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                <FaTimes style={{ fontSize: '14px', color: '#94a3b8' }} />
              </button>
            )}
          </div>

          {!searchQuery && (
            <>
              {/* Recently Opened Section */}
              {recentList.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FaHistory style={{ fontSize: '14px', color: '#418a8b' }} />
                    <h2 style={{ fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748b', margin: 0 }}>
                      Recently Opened
                    </h2>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    {recentList.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={`recent-${item.id}`}
                          onClick={() => handleCardClick(item)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px',
                            backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px',
                            fontSize: '0.76rem', fontWeight: 700, color: '#334155', cursor: 'pointer',
                            transition: 'all 150ms'
                          }}
                        >
                          {Icon && <Icon size={14} color="#418a8b" />}
                          <span>{item.title}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Favorite / Pinned Settings Section */}
              {pinnedList.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FaStar style={{ fontSize: '16px', color: '#f59e0b' }} />
                    <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#1f2937', margin: 0 }}>
                      Favorite Settings
                    </h2>
                  </div>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '20px'
                  }}>
                    {pinnedList.map((item) => (
                      <SettingsCard
                        key={`pinned-${item.id}`}
                        item={item}
                        isPinned={true}
                        onTogglePin={togglePin}
                        onClick={handleCardClick}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Categorized Settings Sections - Explicit 3-Column Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {SECTIONS.map((sectionName) => {
              const sectionItems = filteredModules.filter(
                (m) => m.section === sectionName
              );

              if (sectionItems.length === 0) return null;

              return (
                <div key={sectionName} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {/* Section Title & Header */}
                  <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>
                    <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#1f2937', margin: 0 }}>
                      {sectionName}
                    </h2>
                  </div>

                  {/* 3-Column Grid Layout */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '20px'
                  }}>
                    {sectionItems.map((item) => (
                      <SettingsCard
                        key={item.id}
                        item={item}
                        isPinned={pinnedIds.includes(item.id)}
                        onTogglePin={togglePin}
                        onClick={handleCardClick}
                      />
                    ))}
                  </div>
                </div>
              );
            })}

            {filteredModules.length === 0 && (
              <div style={{ padding: '48px', textAlign: 'center', background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                <FaSearch style={{ fontSize: '32px', color: '#cbd5e1' }} />
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#334155', margin: 0 }}>No operations or settings found</h3>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>
                  Try searching for keywords like &quot;Billing Screen&quot;, &quot;Orders&quot;, &quot;KOTs&quot;, or &quot;Tax&quot;.
                </p>
                <button
                  onClick={() => setSearchQuery('')}
                  style={{ marginTop: '8px', padding: '8px 16px', background: '#418a8b', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '0.76rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  Clear Search
                </button>
              </div>
            )}
          </div>
    </div>
  );
};

export default Setting;
