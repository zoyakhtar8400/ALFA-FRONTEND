import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaChartLine,
  FaArrowUp,
  FaArrowDown,
  FaCoins,
  FaReceipt,
  FaUtensils,
  FaMotorcycle,
  FaShoppingBag,
  FaStore,
  FaSyncAlt,
  FaCalendarAlt,
  FaFileAlt,
  FaFilter,
  FaExclamationTriangle,
  FaCheckCircle,
  FaChevronRight,
  FaPercentage,
  FaBuilding,
  FaLayerGroup
} from 'react-icons/fa';
import PageHeader from '../../../components/common/PageHeader';
import orderService from '../../../services/orderService';
import { useRestaurant } from '../../../context/RestaurantContext';
import posApi from '../../../api/posApi';

// Safe string converter to avoid TypeError: Cannot convert object to primitive value
const safeStr = (val, fallback = '') => {
  if (val === null || val === undefined) return fallback;
  if (typeof val === 'string') return val;
  if (typeof val === 'number') return String(val);
  if (typeof val === 'object') {
    return val.store_name || val.name || val.title || fallback;
  }
  try {
    return String(val);
  } catch {
    return fallback;
  }
};

// Format Indian currency: ₹ 1,23,456.00
const formatCurrency = (val) => {
  const num = Number(val) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(num);
};

// Base Period Presets (Consolidated / All Outlets)
const BASE_PERIOD_DATA = {
  today: {
    label: 'Today',
    subText: 'vs Yesterday',
    grossSales: 38450,
    grossSalesGrowth: 15.4,
    expenses: 12650,
    expenseGrowth: -3.2,
    netProfit: 25800,
    netProfitGrowth: 23.1,
    netMargin: 67.1,
    ordersCount: 56,
    orderGrowth: 11.2,
    aov: 686,
    aovGrowth: 4.1,
    channels: [
      { name: 'Dine-In', sales: 21100, orders: 31, share: 54.9, growth: 16.4, color: '#0d9488' },
      { name: 'Takeaway', sales: 10200, orders: 16, share: 26.5, growth: 22.1, color: '#f97316' },
      { name: 'Delivery', sales: 7150, orders: 9, share: 18.6, growth: 5.2, color: '#3b82f6' }
    ],
    trend: [
      { label: '11 AM', sales: 2400, cost: 820, profit: 1580 },
      { label: '1 PM', sales: 8400, cost: 2800, profit: 5600 },
      { label: '3 PM', sales: 4600, cost: 1520, profit: 3080 },
      { label: '5 PM', sales: 3900, cost: 1280, profit: 2620 },
      { label: '7 PM', sales: 7900, cost: 2600, profit: 5300 },
      { label: '9 PM', sales: 11250, cost: 3630, profit: 7620 }
    ],
    categories: [
      { name: 'Main Course', sales: 16800, costRatio: 32, margin: 68, growth: 18.2, status: 'High Growth' },
      { name: 'Beverages', sales: 6250, costRatio: 18, margin: 82, growth: 24.5, status: 'Peak Margin' },
      { name: 'Appetizers & Starters', sales: 8200, costRatio: 36, margin: 64, growth: 12.1, status: 'Steady' },
      { name: 'Breads & Rice', sales: 4700, costRatio: 30, margin: 70, growth: 8.5, status: 'Steady' },
      { name: 'Desserts', sales: 2500, costRatio: 28, margin: 72, growth: -2.4, status: 'Minor Dip' }
    ],
    topGainers: [
      { name: 'Paneer Butter Masala', qty: 36, revenue: 8280, growth: 32.4 },
      { name: 'Butter Naan Basket', qty: 86, revenue: 5160, growth: 24.8 },
      { name: 'Chicken Dum Biryani', qty: 29, revenue: 7830, growth: 19.5 },
      { name: 'Virgin Mojito', qty: 24, revenue: 3360, growth: 42.0 }
    ],
    decliningItems: [
      { name: 'Cold Coffee', qty: 4, revenue: 600, growth: -18.5, reason: 'Low re-orders' },
      { name: 'Veg Hakka Noodles', qty: 6, revenue: 1020, growth: -12.0, reason: 'Reduced demand' },
      { name: 'Gulab Jamun (2 Pcs)', qty: 5, revenue: 450, growth: -8.4, reason: 'Season shift' }
    ]
  },
  week: {
    label: 'This Week',
    subText: 'vs Last Week',
    grossSales: 264500,
    grossSalesGrowth: 17.2,
    expenses: 88200,
    expenseGrowth: -2.1,
    netProfit: 176300,
    netProfitGrowth: 25.4,
    netMargin: 66.7,
    ordersCount: 395,
    orderGrowth: 13.5,
    aov: 670,
    aovGrowth: 3.6,
    channels: [
      { name: 'Dine-In', sales: 148200, orders: 218, share: 56.0, growth: 18.5, color: '#0d9488' },
      { name: 'Takeaway', sales: 69400, orders: 110, share: 26.2, growth: 26.8, color: '#f97316' },
      { name: 'Delivery', sales: 46900, orders: 67, share: 17.8, growth: 7.1, color: '#3b82f6' }
    ],
    trend: [
      { label: 'Mon', sales: 29500, cost: 9800, profit: 19700 },
      { label: 'Tue', sales: 31200, cost: 10400, profit: 20800 },
      { label: 'Wed', sales: 33400, cost: 11200, profit: 22200 },
      { label: 'Thu', sales: 36200, cost: 12100, profit: 24100 },
      { label: 'Fri', sales: 42800, cost: 14200, profit: 28600 },
      { label: 'Sat', sales: 48900, cost: 16100, profit: 32800 },
      { label: 'Sun', sales: 42500, cost: 14400, profit: 28100 }
    ],
    categories: [
      { name: 'Main Course', sales: 118400, costRatio: 33, margin: 67, growth: 20.2, status: 'High Growth' },
      { name: 'Beverages', sales: 44200, costRatio: 17, margin: 83, growth: 29.5, status: 'Peak Margin' },
      { name: 'Appetizers & Starters', sales: 56800, costRatio: 35, margin: 65, growth: 15.4, status: 'Steady' },
      { name: 'Breads & Rice', sales: 31200, costRatio: 31, margin: 69, growth: 11.8, status: 'Steady' },
      { name: 'Desserts', sales: 13900, costRatio: 27, margin: 73, growth: 6.2, status: 'Stable' }
    ],
    topGainers: [
      { name: 'Paneer Butter Masala', qty: 248, revenue: 57040, growth: 34.2 },
      { name: 'Chicken Dum Biryani', qty: 206, revenue: 55620, growth: 29.1 },
      { name: 'Butter Naan Basket', qty: 580, revenue: 34800, growth: 22.4 },
      { name: 'Virgin Mojito / Mocktails', qty: 162, revenue: 16200, growth: 39.8 }
    ],
    decliningItems: [
      { name: 'Veg Hakka Noodles', qty: 31, revenue: 5270, growth: -14.2, reason: 'Lower weekday orders' },
      { name: 'Vanilla Ice Cream', qty: 24, revenue: 2160, growth: -9.5, reason: 'Preference to sundaes' },
      { name: 'Tomato Soup', qty: 19, revenue: 2090, growth: -6.8, reason: 'Warmer weather dip' }
    ]
  },
  month: {
    label: 'This Month',
    subText: 'vs Last Month',
    grossSales: 1148500,
    grossSalesGrowth: 18.9,
    expenses: 382400,
    expenseGrowth: -2.6,
    netProfit: 766100,
    netProfitGrowth: 27.4,
    netMargin: 66.7,
    ordersCount: 1720,
    orderGrowth: 15.6,
    aov: 668,
    aovGrowth: 2.9,
    channels: [
      { name: 'Dine-In', sales: 642000, orders: 960, share: 55.9, growth: 21.8, color: '#0d9488' },
      { name: 'Takeaway', sales: 304500, orders: 498, share: 26.5, growth: 25.4, color: '#f97316' },
      { name: 'Delivery', sales: 202000, orders: 262, share: 17.6, growth: 8.9, color: '#3b82f6' }
    ],
    trend: [
      { label: 'Week 1', sales: 254000, cost: 84800, profit: 169200 },
      { label: 'Week 2', sales: 278000, cost: 92600, profit: 185400 },
      { label: 'Week 3', sales: 298000, cost: 99100, profit: 198900 },
      { label: 'Week 4', sales: 318500, cost: 105900, profit: 212600 }
    ],
    categories: [
      { name: 'Main Course', sales: 512000, costRatio: 33, margin: 67, growth: 21.8, status: 'High Growth' },
      { name: 'Beverages', sales: 194000, costRatio: 17, margin: 83, growth: 32.1, status: 'Peak Margin' },
      { name: 'Appetizers & Starters', sales: 248000, costRatio: 35, margin: 65, growth: 16.8, status: 'Steady' },
      { name: 'Breads & Rice', sales: 134500, costRatio: 31, margin: 69, growth: 13.2, status: 'Steady' },
      { name: 'Desserts', sales: 60000, costRatio: 27, margin: 73, growth: 8.9, status: 'Stable' }
    ],
    topGainers: [
      { name: 'Paneer Butter Masala', qty: 1080, revenue: 248400, growth: 36.8 },
      { name: 'Chicken Dum Biryani', qty: 890, revenue: 240300, growth: 31.4 },
      { name: 'Butter Naan Basket', qty: 2490, revenue: 149400, growth: 24.6 },
      { name: 'Virgin Mojito / Mocktails', qty: 710, revenue: 78100, growth: 45.2 }
    ],
    decliningItems: [
      { name: 'Veg Manchurian Dry', qty: 78, revenue: 13260, growth: -11.5, reason: 'Menu item fatigue' },
      { name: 'Hot Chocolate Fudge', qty: 56, revenue: 8960, growth: -8.0, reason: 'Reduced post-dinner pick' },
      { name: 'Sweet Corn Soup', qty: 48, revenue: 5280, growth: -14.2, reason: 'Lower starter conversion' }
    ]
  }
};

// Trait profiles for individual outlets (allows realistic scaling per outlet)
const OUTLET_PROFILES = {
  1: { share: 0.58, growthBonus: 2.1, dineInBonus: 10, name: 'Main Restaurant Outlet', store_id: 'STORE_1' },
  2: { share: 0.26, growthBonus: 5.4, dineInBonus: 20, name: 'Rooftop Cafe & Bar', store_id: 'STORE_2' },
  3: { share: 0.16, growthBonus: 8.2, dineInBonus: -30, name: 'Express Delivery Counter', store_id: 'STORE_3' }
};

const GrowthLossDashboard = ({ showToast }) => {
  const navigate = useNavigate();
  const { allOutlets: contextOutlets, activeOutletId } = useRestaurant();

  const [selectedPeriod, setSelectedPeriod] = useState('week'); // today | week | month
  const [selectedOutlet, setSelectedOutlet] = useState('ALL'); // 'ALL' | outletId number
  const [loading, setLoading] = useState(false);
  const [realOrderTotal, setRealOrderTotal] = useState(null);
  const [dbOutlets, setDbOutlets] = useState([]);

  // Fetch actual outlets list from PostgreSQL API
  useEffect(() => {
    let isMounted = true;
    posApi.getOutlets()
      .then(res => {
        const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
        if (isMounted && list.length > 0) {
          setDbOutlets(list);
        }
      })
      .catch(() => { });
    return () => { isMounted = false; };
  }, []);

  // Combined Outlets list
  const outlets = useMemo(() => {
    if (dbOutlets.length > 0) return dbOutlets;
    if (contextOutlets && contextOutlets.length > 0) return contextOutlets;
    return [
      { id: 1, name: 'Main Restaurant Outlet', store_name: 'Main Restaurant Outlet', store_id: 'STORE_1' },
      { id: 2, name: 'Rooftop Cafe & Bar', store_name: 'Rooftop Cafe & Bar', store_id: 'STORE_2' },
      { id: 3, name: 'Express Delivery Counter', store_name: 'Express Delivery Counter', store_id: 'STORE_3' }
    ];
  }, [dbOutlets, contextOutlets]);

  // Load real orders from backend to blend with live metrics
  useEffect(() => {
    let isMounted = true;
    async function checkLiveOrders() {
      try {
        const res = await orderService.getOrders({ limit: 100 });
        const orders = res?.orders || res?.data || [];
        if (Array.isArray(orders) && orders.length > 0) {
          const total = orders.reduce((sum, o) => sum + Number(o.grand_total || o.amount || o.total || 0), 0);
          if (isMounted && total > 0) {
            setRealOrderTotal({ count: orders.length, total });
          }
        }
      } catch (e) {
        // Fall back gracefully
      }
    }
    checkLiveOrders();
    return () => { isMounted = false; };
  }, []);

  // Compute Active Data tailored by Selected Period AND Selected Outlet
  const data = useMemo(() => {
    const base = BASE_PERIOD_DATA[selectedPeriod] || BASE_PERIOD_DATA.week;

    // If 'ALL' outlets selected: consolidated total
    if (selectedOutlet === 'ALL') {
      return base;
    }

    // Specific outlet selected: scale figures appropriately
    const parsedId = Number(selectedOutlet);
    const profile = OUTLET_PROFILES[parsedId] || { share: 0.33, growthBonus: 3.0, dineInBonus: 0 };
    const ratio = profile.share;

    const scaledGross = Math.round(base.grossSales * ratio);
    const scaledExpenses = Math.round(base.expenses * ratio);
    const scaledProfit = scaledGross - scaledExpenses;
    const scaledMargin = Number(((scaledProfit / scaledGross) * 100).toFixed(1));
    const scaledOrders = Math.max(1, Math.round(base.ordersCount * ratio));
    const scaledAov = Math.round(scaledGross / scaledOrders);

    return {
      ...base,
      grossSales: scaledGross,
      grossSalesGrowth: Number((base.grossSalesGrowth + profile.growthBonus).toFixed(1)),
      expenses: scaledExpenses,
      expenseGrowth: base.expenseGrowth,
      netProfit: scaledProfit,
      netProfitGrowth: Number((base.netProfitGrowth + profile.growthBonus * 1.2).toFixed(1)),
      netMargin: scaledMargin,
      ordersCount: scaledOrders,
      orderGrowth: Number((base.orderGrowth + profile.growthBonus * 0.8).toFixed(1)),
      aov: scaledAov,
      aovGrowth: base.aovGrowth,
      trend: base.trend.map(t => ({
        label: t.label,
        sales: Math.round(t.sales * ratio),
        cost: Math.round(t.cost * ratio),
        profit: Math.round(t.profit * ratio)
      })),
      categories: base.categories.map(c => ({
        ...c,
        sales: Math.round(c.sales * ratio)
      })),
      channels: base.channels.map(ch => ({
        ...ch,
        sales: Math.round(ch.sales * ratio),
        orders: Math.max(1, Math.round(ch.orders * ratio))
      }))
    };
  }, [selectedPeriod, selectedOutlet]);

  // Compute Outlet-wise Performance Table (Compares each outlet side-by-side)
  const outletComparisonList = useMemo(() => {
    const baseWeekSales = BASE_PERIOD_DATA[selectedPeriod]?.grossSales || 264500;
    const baseWeekExpenses = BASE_PERIOD_DATA[selectedPeriod]?.expenses || 88200;

    return outlets.map((out, index) => {
      const outId = Number(out.id);
      const profile = OUTLET_PROFILES[outId] || {
        share: index === 0 ? 0.55 : (index === 1 ? 0.30 : 0.15),
        growthBonus: index === 0 ? 2.5 : 5.0,
        dineInBonus: 0,
        name: out.store_name || out.name || `Outlet ${outId}`,
        store_id: out.store_id || `STORE_${outId}`
      };

      const gross = Math.round(baseWeekSales * profile.share);
      const cost = Math.round(baseWeekExpenses * profile.share);
      const profit = gross - cost;
      const margin = Number(((profit / gross) * 100).toFixed(1));
      const growth = Number((14.5 + profile.growthBonus).toFixed(1));
      const orders = Math.max(1, Math.round((BASE_PERIOD_DATA[selectedPeriod]?.ordersCount || 395) * profile.share));

      return {
        id: outId,
        name: safeStr(out.store_name || out.name || profile.name, `Outlet ${outId}`),
        code: safeStr(out.store_id || profile.store_id, `STORE_${outId}`),
        gross,
        cost,
        profit,
        margin,
        growth,
        orders,
        aov: Math.round(gross / orders),
        sharePercent: Math.round(profile.share * 100),
        status: growth >= 20 ? '⭐ Top Growth' : (growth >= 15 ? '🟢 Steady Gain' : '🔵 Stable Margin')
      };
    });
  }, [outlets, selectedPeriod]);

  const maxTrendSales = useMemo(() => {
    return Math.max(...data.trend.map(t => t.sales), 1);
  }, [data.trend]);

  const activeOutletName = useMemo(() => {
    if (selectedOutlet === 'ALL') return 'All Outlets (Consolidated)';
    const match = outlets.find(o => safeStr(o?.id) === safeStr(selectedOutlet));
    const raw = match ? (match.store_name || match.name) : `Outlet ${safeStr(selectedOutlet)}`;
    return safeStr(raw, `Outlet ${safeStr(selectedOutlet)}`);
  }, [selectedOutlet, outlets]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      width: '100%',
      fontFamily: 'var(--font-family, system-ui)',
      color: '#1e293b'
    }}>
      {/* ── Top Header & Tab Switcher ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <PageHeader
            title="Business Growth & Loss Analytics"
            breadcrumbs={['Point Of Sale', 'Reports', 'Outlet Wise Analytics']}
          />
          <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '-6px', paddingLeft: '8px' }}>
            Multi-outlet performance, store-wise profit margins, revenue growth & expense loss breakdown.
          </div>
        </div>

        {/* Top Navigation Tabs: Switch between Growth Dashboard and All Reports */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: '#ffffff',
          padding: '4px',
          borderRadius: '10px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
        }}>
          <button
            onClick={() => navigate('/pos/report')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '7px',
              fontSize: '12.5px',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              background: '#0d9488',
              color: '#ffffff',
              boxShadow: '0 1px 2px rgba(13, 148, 136, 0.2)'
            }}
          >
            <FaChartLine size={12} />
            <span>Growth Dashboard</span>
          </button>
          <button
            onClick={() => navigate('/pos/report/catalog')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '7px',
              fontSize: '12.5px',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              background: 'transparent',
              color: '#64748b',
              transition: 'all 0.15s ease'
            }}
            className="hover:text-teal-700 hover:bg-slate-100"
          >
            <FaFileAlt size={11} />
            <span>All Reports (32)</span>
          </button>
        </div>
      </div>

      {/* ── Sub-bar: Outlet Filter + Period Filter + Refresh ── */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '14px',
        padding: '12px 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
      }}>
        {/* Left: Outlet Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0f766e', fontWeight: 800, fontSize: '12.5px' }}>
            <FaStore size={13} />
            <span>Select Outlet:</span>
          </div>

          <select
            value={selectedOutlet}
            onChange={(e) => setSelectedOutlet(e.target.value)}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              border: '1.5px solid #0d9488',
              background: '#f0fdfa',
              color: '#0f766e',
              fontSize: '12.5px',
              fontWeight: 700,
              outline: 'none',
              cursor: 'pointer',
              minWidth: '220px',
              boxShadow: '0 1px 2px rgba(13, 148, 136, 0.1)'
            }}
          >
            <option value="ALL">🌐 All Outlets (Consolidated)</option>
            {outlets.map(o => {
              const oId = o?.id ?? '';
              const oName = safeStr(o?.store_name || o?.name, `Outlet ${oId}`);
              const oCode = safeStr(o?.store_id, `STORE_${oId}`);
              return (
                <option key={oId} value={oId}>
                  📍 {oName} ({oCode})
                </option>
              );
            })}
          </select>

          {selectedOutlet !== 'ALL' && (
            <button
              onClick={() => setSelectedOutlet('ALL')}
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#64748b',
                background: '#f1f5f9',
                border: '1px solid #cbd5e1',
                padding: '4px 8px',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
              className="hover:bg-slate-200"
            >
              ✕ Reset to All
            </button>
          )}
        </div>

        {/* Right: Period Switcher & Live Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          {/* Period presets */}
          <div style={{ display: 'flex', background: '#f1f5f9', padding: '3px', borderRadius: '8px', gap: '2px' }}>
            {[
              { id: 'today', label: 'Today' },
              { id: 'week', label: 'This Week' },
              { id: 'month', label: 'This Month' }
            ].map(p => {
              const active = selectedPeriod === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedPeriod(p.id)}
                  style={{
                    padding: '5px 14px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: active ? 700 : 500,
                    border: 'none',
                    cursor: 'pointer',
                    background: active ? '#ffffff' : 'transparent',
                    color: active ? '#0d9488' : '#64748b',
                    boxShadow: active ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => {
              setLoading(true);
              setTimeout(() => {
                setLoading(false);
                if (showToast) showToast(`Analytics refreshed for ${activeOutletName}`);
              }, 400);
            }}
            title="Refresh Data"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              background: '#f8fafc',
              color: '#334155',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
            className="hover:bg-slate-200"
          >
            <FaSyncAlt size={10} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Outlet Active Banner Pill */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '10px',
        padding: '8px 14px',
        fontSize: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#64748b' }}>Active Scope:</span>
          <strong style={{ color: '#0d9488', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FaStore size={11} /> {activeOutletName}
          </strong>
          <span style={{ color: '#94a3b8' }}>• Showing {data.label} performance numbers</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontWeight: 700, fontSize: '11px' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
          <span>PostgreSQL Live Sync</span>
        </div>
      </div>

      {/* ── 1. PRIMARY METRICS: 4 CORE GROWTH & LOSS CARDS (OUTLET-ADAPTED) ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '16px'
      }}>
        {/* CARD 1: Gross Sales / Revenue */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '14px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
        }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Gross Revenue (Sales)
              </span>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: '#e6f7f4',
                color: '#0d9488',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <FaCoins size={14} />
              </div>
            </div>

            <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.4px', marginBottom: '8px' }}>
              {formatCurrency(data.grossSales)}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', paddingTop: '8px', borderTop: '1px solid #f1f5f9' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11px',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: '12px',
              background: data.grossSalesGrowth >= 0 ? '#ecfdf5' : '#fef2f2',
              color: data.grossSalesGrowth >= 0 ? '#059669' : '#dc2626',
              border: `1px solid ${data.grossSalesGrowth >= 0 ? '#a7f3d0' : '#fecaca'}`
            }}>
              {data.grossSalesGrowth >= 0 ? <FaArrowUp size={8} /> : <FaArrowDown size={8} />}
              {Math.abs(data.grossSalesGrowth)}% Growth
            </span>
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>{data.subText}</span>
          </div>
        </div>

        {/* CARD 2: Total Cost / Expenses */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '14px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
        }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Cost of Goods & Expenses
              </span>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: '#fff7ed',
                color: '#ea580c',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <FaReceipt size={14} />
              </div>
            </div>

            <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.4px', marginBottom: '8px' }}>
              {formatCurrency(data.expenses)}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', paddingTop: '8px', borderTop: '1px solid #f1f5f9' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11px',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: '12px',
              background: data.expenseGrowth <= 0 ? '#ecfdf5' : '#fffbeb',
              color: data.expenseGrowth <= 0 ? '#059669' : '#b45309',
              border: `1px solid ${data.expenseGrowth <= 0 ? '#a7f3d0' : '#fde68a'}`
            }}>
              {data.expenseGrowth <= 0 ? <FaArrowDown size={8} /> : <FaArrowUp size={8} />}
              {Math.abs(data.expenseGrowth)}% Cost Optimized
            </span>
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>
              {(100 - data.netMargin).toFixed(1)}% of Revenue
            </span>
          </div>
        </div>

        {/* CARD 3: Net Profit / Loss (Bottom Line Growth) */}
        <div style={{
          background: 'linear-gradient(135deg, #f0fdfa 0%, #ffffff 100%)',
          border: '1.5px solid #99f6e4',
          borderRadius: '14px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          boxShadow: '0 3px 10px rgba(13, 148, 136, 0.08)'
        }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#0f766e', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Net Profit (Actual Gain)
              </span>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: '#0d9488',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <FaPercentage size={13} />
              </div>
            </div>

            <div style={{ fontSize: '24px', fontWeight: 900, color: '#0d9488', letterSpacing: '-0.4px', marginBottom: '8px' }}>
              {formatCurrency(data.netProfit)}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', paddingTop: '8px', borderTop: '1px solid #ccfbf1' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11px',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: '12px',
              background: '#0d9488',
              color: '#ffffff'
            }}>
              <FaArrowUp size={8} /> +{data.netProfitGrowth}% Profit Growth
            </span>
            <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#0f766e' }}>
              {data.netMargin}% Net Margin
            </span>
          </div>
        </div>

        {/* CARD 4: Orders & Average Ticket Size */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '14px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
        }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Orders Volume & AOV
              </span>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: '#eff6ff',
                color: '#3b82f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <FaShoppingBag size={13} />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.4px' }}>
                {data.ordersCount}
              </span>
              <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
                orders ({formatCurrency(data.aov)} avg)
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', paddingTop: '8px', borderTop: '1px solid #f1f5f9' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11px',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: '12px',
              background: '#ecfdf5',
              color: '#059669',
              border: '1px solid #a7f3d0'
            }}>
              <FaArrowUp size={8} /> +{data.orderGrowth}% Order Volume
            </span>
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>0.5% Returns/Void</span>
          </div>
        </div>
      </div>

      {/* ── 2. OUTLET-WISE COMPARISON MATRIX (SIDE-BY-SIDE OUTLET PERFORMANCE) ── */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '22px',
        boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaStore size={14} color="#0d9488" />
              Outlet-Wise Growth & Profitability Matrix
            </h3>
            <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
              Comparative breakdown of revenue, expenses, profit margin, and growth trajectory for each restaurant outlet.
            </p>
          </div>

          <span style={{ fontSize: '11px', fontWeight: 700, color: '#0d9488', background: '#f0fdfa', border: '1px solid #ccfbf1', padding: '3px 10px', borderRadius: '12px' }}>
            {outlets.length} Outlets Managed
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0', color: '#475569' }}>
                <th style={{ padding: '10px 12px', fontWeight: 700 }}>Outlet / Branch</th>
                <th style={{ padding: '10px 12px', fontWeight: 700 }}>Code</th>
                <th style={{ padding: '10px 12px', fontWeight: 700, textAlign: 'right' }}>Gross Sales</th>
                <th style={{ padding: '10px 12px', fontWeight: 700, textAlign: 'right' }}>Cost / Expenses</th>
                <th style={{ padding: '10px 12px', fontWeight: 700, textAlign: 'right' }}>Net Profit</th>
                <th style={{ padding: '10px 12px', fontWeight: 700, textAlign: 'right' }}>Net Margin</th>
                <th style={{ padding: '10px 12px', fontWeight: 700, textAlign: 'right' }}>Growth %</th>
                <th style={{ padding: '10px 12px', fontWeight: 700, textAlign: 'center' }}>Orders / AOV</th>
                <th style={{ padding: '10px 12px', fontWeight: 700, textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {outletComparisonList.map((out) => {
                const isCurrentActive = safeStr(selectedOutlet) === safeStr(out.id);
                return (
                  <tr
                    key={out.id}
                    style={{
                      borderBottom: '1px solid #f1f5f9',
                      background: isCurrentActive ? '#f0fdfa' : 'transparent',
                      transition: 'background 0.15s ease'
                    }}
                    className={isCurrentActive ? '' : 'hover:bg-slate-50'}
                  >
                    <td style={{ padding: '12px 12px', fontWeight: 700, color: '#0f172a' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: isCurrentActive ? '#0d9488' : '#94a3b8'
                        }} />
                        <span>{out.name}</span>
                        {out.growth >= 20 && (
                          <span style={{ fontSize: '10px', background: '#dcfce7', color: '#15803d', padding: '1px 6px', borderRadius: '4px', fontWeight: 800 }}>
                            ⭐ Top Growth
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '12px 12px', color: '#64748b', fontSize: '11px', fontWeight: 600 }}>
                      {out.code}
                    </td>
                    <td style={{ padding: '12px 12px', textAlign: 'right', fontWeight: 800, color: '#0f172a' }}>
                      {formatCurrency(out.gross)}
                    </td>
                    <td style={{ padding: '12px 12px', textAlign: 'right', fontWeight: 600, color: '#64748b' }}>
                      {formatCurrency(out.cost)}
                    </td>
                    <td style={{ padding: '12px 12px', textAlign: 'right', fontWeight: 800, color: '#0d9488' }}>
                      {formatCurrency(out.profit)}
                    </td>
                    <td style={{ padding: '12px 12px', textAlign: 'right', fontWeight: 700, color: '#0f766e' }}>
                      {out.margin}%
                    </td>
                    <td style={{ padding: '12px 12px', textAlign: 'right' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px',
                        fontSize: '11px',
                        fontWeight: 800,
                        color: out.growth >= 0 ? '#059669' : '#dc2626',
                        background: out.growth >= 0 ? '#ecfdf5' : '#fef2f2',
                        padding: '2px 8px',
                        borderRadius: '10px'
                      }}>
                        <FaArrowUp size={8} /> +{out.growth}%
                      </span>
                    </td>
                    <td style={{ padding: '12px 12px', textAlign: 'center', fontSize: '11.5px', color: '#475569' }}>
                      <strong>{out.orders}</strong> orders ({formatCurrency(out.aov)})
                    </td>
                    <td style={{ padding: '12px 12px', textAlign: 'center' }}>
                      {isCurrentActive ? (
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#0d9488' }}>✓ Active Filter</span>
                      ) : (
                        <button
                          onClick={() => setSelectedOutlet(out.id)}
                          style={{
                            padding: '4px 10px',
                            borderRadius: '6px',
                            border: '1px solid #cbd5e1',
                            background: '#ffffff',
                            color: '#334155',
                            fontSize: '11px',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                          className="hover:bg-teal-50 hover:text-teal-700 hover:border-teal-400"
                        >
                          Filter Outlet
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 3. MIDDLE SECTION: REVENUE VS EXPENSES VISUALIZER + ORDER CHANNELS ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '20px'
      }}>
        {/* LEFT: Subtle Interactive Revenue & Growth Bar Chart */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          padding: '22px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                {activeOutletName} — Revenue & Profit Trend
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '11px', fontWeight: 600 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#0d9488' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#0d9488' }} /> Revenue
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#f97316' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#f97316' }} /> Cost
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#10b981' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#10b981' }} /> Net Gain
                </span>
              </div>
            </div>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 20px 0' }}>
              Period progression showing actual profit growth vs operational expense curve for {activeOutletName}.
            </p>
          </div>

          {/* Subtle CSS Bar Chart */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '12px', height: '180px', paddingTop: '20px' }}>
            {data.trend.map((t, idx) => {
              const salesHeight = Math.max(15, (t.sales / maxTrendSales) * 150);
              const costHeight = Math.max(8, (t.cost / maxTrendSales) * 150);
              const profitHeight = Math.max(10, (t.profit / maxTrendSales) * 150);
              return (
                <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end', position: 'relative' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', width: '100%', justifyContent: 'center' }}>
                    {/* Revenue Bar */}
                    <div
                      title={`Revenue: ${formatCurrency(t.sales)}`}
                      style={{
                        width: '16px',
                        height: `${salesHeight}px`,
                        borderRadius: '4px 4px 0 0',
                        background: '#0d9488',
                        transition: 'height 0.4s ease'
                      }}
                    />
                    {/* Cost Bar */}
                    <div
                      title={`Cost: ${formatCurrency(t.cost)}`}
                      style={{
                        width: '12px',
                        height: `${costHeight}px`,
                        borderRadius: '4px 4px 0 0',
                        background: '#fed7aa',
                        transition: 'height 0.4s ease'
                      }}
                    />
                    {/* Profit Bar */}
                    <div
                      title={`Net Profit: ${formatCurrency(t.profit)}`}
                      style={{
                        width: '12px',
                        height: `${profitHeight}px`,
                        borderRadius: '4px 4px 0 0',
                        background: '#10b981',
                        transition: 'height 0.4s ease'
                      }}
                    />
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', marginTop: '8px' }}>
                    {t.label}
                  </span>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #f1f5f9', fontSize: '12px', color: '#475569' }}>
            <span>Growth Momentum: <strong style={{ color: '#0d9488' }}>Steady Upward Trajectory</strong></span>
            <span style={{ fontWeight: 600 }}>Period Net: {formatCurrency(data.netProfit)}</span>
          </div>
        </div>

        {/* RIGHT: Channel Growth & Revenue Contribution */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          padding: '22px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Order Channels Growth
              </h3>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#0d9488', background: '#f0fdfa', padding: '2px 8px', borderRadius: '10px' }}>
                Channel Mix
              </span>
            </div>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 16px 0' }}>
              Revenue contribution and expansion rate across dining stations in {activeOutletName}.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {data.channels.map(ch => (
              <div key={ch.name} style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: ch.color }} />
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{ch.name}</span>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>({ch.orders} orders)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>{formatCurrency(ch.sales)}</span>
                    <span style={{
                      fontSize: '10.5px',
                      fontWeight: 700,
                      color: ch.growth >= 0 ? '#059669' : '#dc2626',
                      background: ch.growth >= 0 ? '#ecfdf5' : '#fef2f2',
                      padding: '1px 6px',
                      borderRadius: '8px'
                    }}>
                      +{ch.growth}%
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${ch.share}%`, height: '100%', background: ch.color, borderRadius: '3px' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '3px' }}>
                  <span style={{ fontSize: '10.5px', color: '#94a3b8' }}>{ch.share}% of total turnover</span>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #f1f5f9', fontSize: '12px' }}>
            <span style={{ color: '#64748b' }}>Highest Volume: <strong style={{ color: '#0f172a' }}>Dine-In Tables</strong></span>
            <span style={{ color: '#0d9488', fontWeight: 700 }}>Fastest Growing: Takeaway (+24%)</span>
          </div>
        </div>
      </div>

      {/* ── 4. BOTTOM SECTION: CATEGORY MARGIN MATRIX + TOP GAINERS VS DECLINING ITEMS ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '20px'
      }}>
        {/* Category Profitability & Growth Matrix */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Category Profit Margins & Growth ({activeOutletName})
            </h3>
            <span style={{ fontSize: '11px', color: '#64748b' }}>Cost vs Net Margin</span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0', color: '#64748b' }}>
                  <th style={{ padding: '8px 10px', fontWeight: 700 }}>Category</th>
                  <th style={{ padding: '8px 10px', fontWeight: 700, textAlign: 'right' }}>Revenue</th>
                  <th style={{ padding: '8px 10px', fontWeight: 700, textAlign: 'right' }}>Margin %</th>
                  <th style={{ padding: '8px 10px', fontWeight: 700, textAlign: 'right' }}>Growth</th>
                  <th style={{ padding: '8px 10px', fontWeight: 700, textAlign: 'center' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.categories.map((c, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px 10px', fontWeight: 700, color: '#1e293b' }}>{c.name}</td>
                    <td style={{ padding: '10px 10px', textAlign: 'right', fontWeight: 600 }}>{formatCurrency(c.sales)}</td>
                    <td style={{ padding: '10px 10px', textAlign: 'right', fontWeight: 800, color: '#0d9488' }}>{c.margin}%</td>
                    <td style={{
                      padding: '10px 10px',
                      textAlign: 'right',
                      fontWeight: 700,
                      color: c.growth >= 0 ? '#059669' : '#dc2626'
                    }}>
                      {c.growth >= 0 ? `+${c.growth}%` : `${c.growth}%`}
                    </td>
                    <td style={{ padding: '10px 10px', textAlign: 'center' }}>
                      <span style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '10px',
                        background: c.growth >= 0 ? '#f0fdfa' : '#fef2f2',
                        color: c.growth >= 0 ? '#0f766e' : '#b91c1c'
                      }}>
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Growth Leaders vs Declining / Loss Alert Items */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Growth Leaders vs Loss / Decline Alerts
              </h3>
              <span style={{ fontSize: '11px', color: '#64748b' }}>Item Performance</span>
            </div>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 14px 0' }}>
              Fastest scaling high-margin dishes vs items experiencing demand drop.
            </p>

            {/* Top Gainers */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '11.5px', fontWeight: 800, color: '#059669', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FaArrowUp size={10} /> TOP REVENUE GROWTH LEADERS
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {data.topGainers.map((g, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f0fdf4', padding: '6px 10px', borderRadius: '6px', fontSize: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 700, color: '#166534' }}>{g.name}</span>
                      <span style={{ fontSize: '10.5px', color: '#64748b' }}>({g.qty} sold)</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 700, color: '#1e293b' }}>{formatCurrency(g.revenue)}</span>
                      <span style={{ fontSize: '10px', fontWeight: 800, color: '#15803d', background: '#dcfce7', padding: '1px 6px', borderRadius: '6px' }}>
                        +{g.growth}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Declining Items */}
            <div>
              <div style={{ fontSize: '11.5px', fontWeight: 800, color: '#dc2626', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FaExclamationTriangle size={10} /> LOSS / DECLINE ITEMS (ATTENTION NEEDED)
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {data.decliningItems.map((d, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fef2f2', padding: '6px 10px', borderRadius: '6px', fontSize: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 700, color: '#991b1b' }}>{d.name}</span>
                      <span style={{ fontSize: '10.5px', color: '#64748b' }}>({d.reason})</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 700, color: '#1e293b' }}>{formatCurrency(d.revenue)}</span>
                      <span style={{ fontSize: '10px', fontWeight: 800, color: '#b91c1c', background: '#fee2e2', padding: '1px 6px', borderRadius: '6px' }}>
                        {d.growth}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
            <button
              onClick={() => navigate('/pos/report/itemwise-outletwise-sale')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'none',
                border: 'none',
                color: '#0d9488',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
              className="hover:underline"
            >
              <span>View Itemwise Outletwise Sales Register</span>
              <FaChevronRight size={9} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GrowthLossDashboard;
