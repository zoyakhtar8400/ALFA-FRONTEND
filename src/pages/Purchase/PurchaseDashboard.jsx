import React from 'react';
import PageHeader from '../../components/common/PageHeader';
import { usePurchase } from './hooks/usePurchase';
import { purchaseApi } from '../../api/purchaseApi';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaBoxes, FaShoppingCart, FaTruck,
  FaExclamationTriangle, FaPlus, FaCloudUploadAlt
} from 'react-icons/fa';

const PurchaseDashboard = () => {
  const navigate = useNavigate();
  const { items, purchaseOrders } = usePurchase();
  const [kpis, setKpis] = React.useState({
    totalStockValuation: 0,
    totalCatalogItems: 0,
    issuedPurchaseOrdersCount: 0,
    reorderAlertsCount: 0,
  });

  React.useEffect(() => {
    const loadKPIs = async () => {
      try {
        const json = await purchaseApi.getDashboardKPIs();
        if (json?.data) setKpis(json.data);
      } catch (err) {
        console.warn('Could not load purchase dashboard KPIs:', err.message);
      }
    };
    loadKPIs();
  }, []);

  const lowStockCount = kpis.reorderAlertsCount || items.filter((i) => Number(i.currentStock) <= Number(i.reorderLevel)).length;
  const totalStockValuation = kpis.totalStockValuation || items.reduce((sum, i) => sum + (Number(i.currentStock || 0) * Number(i.purchaseRate || 0)), 0);

  return (
    <div className="w-full flex flex-col p-6 animate-in fade-in duration-200 gap-6">
      <PageHeader
        title="Purchase & Inventory Enterprise Workspace"
        breadcrumbs={['Dashboard', 'Purchase']}
        showBack
        onBack={() => navigate('/')}
      />

      {/* Quick Action Buttons */}
      <div className="flex flex-wrap items-center gap-3">
        <Link
          to="/purchase/operation/purchase-order-entry"
          className="px-4 py-2.5 bg-[#418A8B] hover:bg-[#346f70] text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-2 shadow-sm"
        >
          <FaPlus /> + Create Purchase Order
        </Link>
        <Link
          to="/purchase/operation/grn-entry"
          className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-2 shadow-sm"
        >
          <FaTruck /> Post Goods Receipt (GRN)
        </Link>
        <Link
          to="/purchase/master/item-master"
          className="px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold rounded-lg transition-colors flex items-center gap-2"
        >
          <FaBoxes /> Item Catalog Master
        </Link>
        <Link
          to="/purchase/master/item-entry-csv-upload"
          className="px-4 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold rounded-lg transition-colors flex items-center gap-2"
        >
          <FaCloudUploadAlt /> Item Entry CSV Upload
        </Link>
      </div>

      {/* Overview KPI Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Total Stock Value</span>
            <h3 className="text-lg font-extrabold text-slate-800 mt-1">₹{totalStockValuation.toLocaleString('en-IN')}</h3>
            <p className="text-[11px] text-teal-700 font-bold mt-1">{items.length} Active Catalog Items</p>
          </div>
          <div className="p-3.5 bg-teal-50 text-[#418A8B] rounded-xl text-2xl">
            <FaBoxes />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Issued PO Orders</span>
            <h3 className="text-lg font-extrabold text-slate-800 mt-1">{purchaseOrders.length} Orders</h3>
            <p className="text-[11px] text-slate-500 font-bold mt-1">Active Procurement</p>
          </div>
          <div className="p-3.5 bg-blue-50 text-blue-600 rounded-xl text-2xl">
            <FaShoppingCart />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Reorder Alerts</span>
            <h3 className="text-lg font-extrabold text-amber-700 mt-1">{lowStockCount} Low Stock Items</h3>
            <p className="text-[11px] text-amber-600 font-bold mt-1">Requires Reordering</p>
          </div>
          <div className="p-3.5 bg-amber-50 text-amber-600 rounded-xl text-2xl">
            <FaExclamationTriangle />
          </div>
        </div>
      </div>

      {/* Inventory & Recent PO Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
              <FaShoppingCart className="text-[#418A8B]" /> Recent Purchase Orders
            </h3>
            <Link to="/purchase/operation/purchase-order-entry" className="text-xs font-bold text-[#418A8B] hover:underline">
              View Orders →
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {purchaseOrders.slice(0, 4).map((po) => (
              <div key={po.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <span className="font-mono font-bold text-slate-800">{po.poNumber}</span>
                  <p className="text-slate-500 text-[11px]">{po.vendorName}</p>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-[#418A8B]">₹{Number(po.grandTotal).toLocaleString('en-IN')}</span>
                  <p className="text-[10px] font-bold text-emerald-700">{po.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
              <FaBoxes className="text-[#418A8B]" /> Inventory Stock Overview
            </h3>
            <Link to="/purchase/master/item-master" className="text-xs font-bold text-[#418A8B] hover:underline">
              Manage Items →
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {items.slice(0, 4).map((itm) => (
              <div key={itm.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-800">{itm.name}</span>
                  <p className="text-slate-500 text-[11px]">{itm.itemGroupName}</p>
                </div>
                <div className="text-right">
                  <span className={`font-extrabold ${Number(itm.currentStock) <= Number(itm.reorderLevel) ? 'text-amber-600' : 'text-emerald-700'}`}>
                    {itm.currentStock} {itm.unitName}
                  </span>
                  <p className="text-[10px] text-slate-400">Rate: ₹{itm.purchaseRate}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseDashboard;
