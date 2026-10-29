import React, { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaMapMarkedAlt,
  FaChair,
  FaFileInvoiceDollar,
  FaConciergeBell,
  FaUserTie,
  FaMotorcycle,
  FaUsers,
  FaUtensils,
  FaBookOpen,
  FaPrint,
  FaShieldAlt,
  FaChevronRight,
  FaStore,
  FaMoneyBillWave,
  FaPercentage,
  FaTags,
  FaExchangeAlt,
  FaThList,
  FaLayerGroup,
  FaFileCsv,
  FaBarcode,
  FaIndustry,
  FaCoins,
  FaSearch,
  FaTimes,
  FaBorderAll,
  FaSlidersH,
  FaListUl,
  FaPlusCircle,
  FaWeight,
  FaBuilding
} from 'react-icons/fa';

const MasterWorkspace = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const searchInputRef = useRef(null);

  const sections = [
    {
      id: 'outlet-hardware',
      shortTitle: 'Outlet & Hardware',
      title: 'OUTLET & HARDWARE (MAIN)',
      icon: <FaStore />,
      cards: [
        {
          title: 'Outlet Master',
          icon: <FaStore />,
          path: '/pos/master/outlet',
          desc: 'Primary store setup, multi-outlet configuration, GSTIN & bill headers'
        },
        {
          title: 'Outlet Configuration',
          icon: <FaSlidersH />,
          path: '/pos/master/outlet-config',
          desc: 'Operating hours, bill rounding, service charge & KOT sync intervals'
        },
        {
          title: 'Printer Master',
          icon: <FaPrint />,
          path: '/pos/master/printer',
          desc: 'Thermal KOT, Bot & Invoice printer assignment'
        }
      ]
    },
    {
      id: 'area-tables',
      shortTitle: 'Area & Tables',
      title: 'AREA & TABLES',
      icon: <FaMapMarkedAlt />,
      cards: [
        {
          title: 'Area Master',
          icon: <FaMapMarkedAlt />,
          path: '/pos/master/area',
          desc: 'Configure dining zones & sections'
        },
        {
          title: 'Table Master',
          icon: <FaChair />,
          path: '/pos/master/table',
          desc: 'Manage dining tables, capacity & active status'
        },
        // {
        //   title: 'Table Structure Design',
        //   icon: <FaThList />,
        //   path: '/pos/master/structure-design',
        //   desc: 'Interactive visual restaurant floor designer'
        // }
      ]
    },
    {
      id: 'item-menu',
      shortTitle: 'Item & Menu',
      title: 'ITEM & MENU MANAGEMENT',
      icon: <FaUtensils />,
      cards: [
        {
          title: 'Main Group Entry',
          icon: <FaLayerGroup />,
          path: '/pos/master/item-menu/main-group',
          desc: 'Top-level menu classifications (Food, Beverage, etc.)'
        },
        {
          title: 'Item Category',
          icon: <FaThList />,
          path: '/pos/master/item-menu/item-group',
          desc: 'Item groups & sub-category kitchen courses'
        },
        {
          title: 'Menu Item Entry',
          icon: <FaUtensils />,
          path: '/pos/master/item-menu/menu-item',
          desc: 'Create food items, pricing, variants & taxes'
        },
        {
          title: 'HSN Code Update',
          icon: <FaBarcode />,
          path: '/pos/master/item-menu/hsn-update',
          desc: 'Bulk HSN/SAC code updates & GST mappings'
        },
        {
          title: 'Production Category',
          icon: <FaIndustry />,
          path: '/pos/master/production-category',
          desc: 'Kitchen production stations & KOT routing'
        },
        {
          title: 'Item Outlet Config & Pricing',
          icon: <FaStore />,
          path: '/pos/master/item-outlet-pricing',
          desc: 'Multi-outlet item price overrides, In-Stock/Sold-Out & aggregator flags'
        },
        {
          title: 'Modifier Group',
          icon: <FaListUl />,
          path: '/pos/master/modifier-group',
          desc: 'Spice levels, crusts, bread choices, add-on rules & min/max limits'
        },
        {
          title: 'Modifier Add-ons',
          icon: <FaPlusCircle />,
          path: '/pos/master/modifier-addon',
          desc: 'Toppings, dips, extra cheese with add-on prices & Veg/Non-Veg flags'
        },
        {
          title: 'Unit of Measure (UOM)',
          icon: <FaWeight />,
          path: '/pos/master/uom',
          desc: 'Manage measurement units (Portion, Plate, Kg, Pc) & conversions'
        }
      ]
    },
    {
      id: 'rates-taxes',
      shortTitle: 'Rates & Taxes',
      title: 'RATES & TAXES',
      icon: <FaFileInvoiceDollar />,
      cards: [
        {
          title: 'Item Tax Category',
          icon: <FaPercentage />,
          path: '/pos/master/tax-category',
          desc: 'GST tax categories, CGST/SGST/IGST rates'
        },
        {
          title: 'Item Rate Category',
          icon: <FaTags />,
          path: '/pos/master/rate-category',
          desc: 'Dine-In, AC, Swiggy & Zomato pricing tiers'
        },
        {
          title: 'Item Rate Update',
          icon: <FaExchangeAlt />,
          path: '/pos/master/rate-update',
          desc: 'Quick bulk price updates across categories'
        }
      ]
    },
    {
      id: 'service-ordering',
      shortTitle: 'Service & Ordering',
      title: 'SERVICE & ORDERING',
      icon: <FaConciergeBell />,
      cards: [
        {
          title: 'Service Mode Master',
          icon: <FaConciergeBell />,
          path: '/pos/master/area',
          desc: 'Dine-In, Takeaway, Delivery, Room Service'
        },
        {
          title: 'Steward Master',
          icon: <FaUserTie />,
          path: '/pos/masters/steward-master',
          desc: 'Waiters, captains & steward assignments'
        },
        {
          title: 'Delivery Master',
          icon: <FaMotorcycle />,
          path: '/pos/master/delivery',
          desc: 'Delivery personnel, phone & vehicle tracking'
        },
        {
          title: 'Payment Master',
          icon: <FaMoneyBillWave />,
          path: '/pos/master/payment',
          desc: 'Cash, UPI, Credit Card, Wallets & Due methods'
        },
        {
          title: 'Customer Master',
          icon: <FaUsers />,
          path: '/front-desk/operation/guest-profile',
          desc: 'Customer directory, credits & order history'
        },
        {
          title: 'Company Master',
          icon: <FaBuilding />,
          path: '/pos/master/company',
          desc: 'Company directory, GSTIN, phone & corporate accounts'
        },
        {
          title: 'Check Master',
          icon: <FaFileInvoiceDollar />,
          path: '/pos/master/check',
          desc: 'Check / Order details, settled bills, KOT history & invoice audits'
        }
      ]
    },
    {
      id: 'kitchen-production',
      shortTitle: 'Kitchen & Production',
      title: 'KITCHEN & PRODUCTION',
      icon: <FaBookOpen />,
      cards: [
        {
          title: 'Kitchen Station (KDS)',
          icon: <FaUtensils />,
          path: '/restaurant/kds',
          desc: 'Kitchen display systems & station routing'
        },
        {
          title: 'Recipe Master',
          icon: <FaBookOpen />,
          path: '/restaurant/inventory-recipes',
          desc: 'Ingredient consumption & standard recipe specs'
        }
      ]
    },
    {
      id: 'control-reasons',
      shortTitle: 'Control & Expenses',
      title: 'CONTROL, REASONS & EXPENSES',
      icon: <FaShieldAlt />,
      cards: [
        {
          title: 'NC Type Master',
          icon: <FaShieldAlt />,
          path: '/pos/master/nc-type',
          desc: 'Discount reasons, void KOT & NC bill authorization'
        },
        {
          title: 'Expense Master',
          icon: <FaCoins />,
          path: '/pos/operation/expense-entry',
          desc: 'POS petty cash & operational expense vouchers'
        }
      ]
    }
  ];

  // Calculate total cards count
  const totalCardsCount = useMemo(() => {
    return sections.reduce((acc, s) => acc + s.cards.length, 0);
  }, [sections]);

  // Filter sections by search and category
  const filteredSections = useMemo(() => {
    let result = sections;

    // Filter by category tab
    if (selectedCategory !== 'ALL') {
      result = result.filter(s => s.id === selectedCategory);
    }

    // Filter by search query
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      result = result.map(s => {
        const matchingCards = s.cards.filter(c =>
          c.title.toLowerCase().includes(q) || (c.desc && c.desc.toLowerCase().includes(q))
        );
        return {
          ...s,
          cards: matchingCards
        };
      }).filter(s => s.cards.length > 0);
    }

    return result;
  }, [sections, selectedCategory, searchTerm]);

  return (
    <div style={{
      padding: '16px 24px 40px',
      background: '#f8fafc',
      minHeight: 'calc(100vh - 80px)',
      fontFamily: 'var(--font-family, system-ui)'
    }}>

      {/* ── Category Quick Navigation & Search Header ── */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '10px',
        padding: '10px 14px',
        marginBottom: '20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        {/* Top Row: Search Input + Quick Info */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '14px',
          flexWrap: 'wrap'
        }}>
          {/* Search Box */}
          <div style={{
            position: 'relative',
            flex: '1',
            maxWidth: '360px',
            minWidth: '220px'
          }}>
            <FaSearch style={{
              position: 'absolute',
              left: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#94a3b8',
              fontSize: '12px'
            }} />
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search master (e.g. Table, Tax, Steward)..."
              style={{
                width: '100%',
                padding: '8px 32px 8px 32px',
                fontSize: '13px',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                outline: 'none',
                background: '#f8fafc',
                color: '#1e293b'
              }}
              onFocus={(e) => { e.target.style.borderColor = '#0d9488'; e.target.style.background = '#ffffff'; }}
              onBlur={(e) => { e.target.style.borderColor = '#cbd5e1'; e.target.style.background = '#f8fafc'; }}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '2px'
                }}
              >
                <FaTimes style={{ fontSize: '12px' }} />
              </button>
            )}
          </div>

          {/* Quick Counter */}
          <div style={{ fontSize: '12.5px', color: '#64748b', fontWeight: 500 }}>
            Showing{' '}
            <strong style={{ color: '#0d9488', fontWeight: 700 }}>
              {filteredSections.reduce((acc, s) => acc + s.cards.length, 0)}
            </strong>{' '}
            of {totalCardsCount} Masters
          </div>
        </div>

        {/* Bottom Row: Category Navigation Pills */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '4px',
          scrollbarWidth: 'none'
        }}>
          {/* ALL Tab */}
          <button
            onClick={() => setSelectedCategory('ALL')}
            style={{
              padding: '7px 15px',
              borderRadius: '8px',
              fontSize: '12.5px',
              fontWeight: 600,
              cursor: 'pointer',
              border: selectedCategory === 'ALL' ? '1px solid #0d9488' : '1px solid #e2e8f0',
              background: selectedCategory === 'ALL' ? '#0d9488' : '#ffffff',
              color: selectedCategory === 'ALL' ? '#ffffff' : '#475569',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.15s ease'
            }}
            className={selectedCategory !== 'ALL' ? 'hover:bg-slate-50 hover:text-slate-900' : ''}
          >
            <FaBorderAll style={{ fontSize: '11px' }} />
            <span>All Categories</span>
          </button>

          {/* Individual Category Pills */}
          {sections.map((section) => {
            const isSelected = selectedCategory === section.id;
            return (
              <button
                key={section.id}
                onClick={() => setSelectedCategory(section.id)}
                style={{
                  padding: '7px 14px',
                  borderRadius: '8px',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: isSelected ? '1px solid #0d9488' : '1px solid #e2e8f0',
                  background: isSelected ? '#0d9488' : '#ffffff',
                  color: isSelected ? '#ffffff' : '#475569',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.15s ease'
                }}
                className={!isSelected ? 'hover:bg-slate-50 hover:text-slate-900' : ''}
              >
                <span style={{ fontSize: '12px', opacity: isSelected ? 1 : 0.7 }}>{section.icon}</span>
                <span>{section.shortTitle}</span>
                <span style={{
                  fontSize: '10.5px',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  background: isSelected ? 'rgba(255,255,255,0.25)' : '#f1f5f9',
                  color: isSelected ? '#ffffff' : '#64748b',
                  fontWeight: 700
                }}>
                  {section.cards.length}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Content Sections List ── */}
      {filteredSections.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {filteredSections.map((section) => (
            <div key={section.id}>
              {/* Section Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '12px',
                color: '#0d9488',
                fontSize: '12px',
                fontWeight: 800,
                letterSpacing: '0.07em',
                textTransform: 'uppercase'
              }}>
                <span style={{ fontSize: '15px' }}>{section.icon}</span>
                <span>{section.title}</span>
              </div>

              {/* Cards Grid — Bigger dimensions */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '16px'
              }}>
                {section.cards.map((card, cIdx) => (
                  <div
                    key={cIdx}
                    onClick={() => navigate(card.path)}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      padding: '16px 20px',
                      minHeight: '82px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      boxShadow: '0 1px 4px rgba(0, 0, 0, 0.04)',
                      transition: 'all 0.18s ease-in-out'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#0d9488';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 8px 18px rgba(13, 148, 136, 0.14)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#e2e8f0';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 1px 4px rgba(0, 0, 0, 0.04)';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '10px',
                        background: '#e6f7f4',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#0d9488',
                        fontSize: '20px',
                        flexShrink: 0
                      }}>
                        {card.icon}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{
                          fontWeight: 700,
                          fontSize: '14.5px',
                          color: '#0f172a'
                        }}>
                          {card.title}
                        </span>
                        {card.desc && (
                          <span style={{
                            fontSize: '11.5px',
                            color: '#64748b',
                            marginTop: '2px',
                            lineHeight: '1.35'
                          }}>
                            {card.desc}
                          </span>
                        )}
                      </div>
                    </div>
                    <FaChevronRight style={{ color: '#94a3b8', fontSize: '13px', flexShrink: 0, marginLeft: '8px' }} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          background: '#ffffff',
          borderRadius: '10px',
          border: '1px dashed #cbd5e1'
        }}>
          <FaSearch style={{ fontSize: '28px', color: '#cbd5e1', marginBottom: '12px' }} />
          <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#334155', margin: '0 0 6px 0' }}>
            No matching masters found
          </h4>
          <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 16px 0' }}>
            No masters match your filter or search query "{searchTerm}".
          </p>
          <button
            onClick={() => { setSearchTerm(''); setSelectedCategory('ALL'); }}
            style={{
              padding: '6px 16px',
              fontSize: '12px',
              fontWeight: 600,
              background: '#0d9488',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default MasterWorkspace;
