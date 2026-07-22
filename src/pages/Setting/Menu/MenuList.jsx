import React, { useState, useEffect } from 'react';
import CommonTable from '../../../components/common/CommonTable';
import DeleteConfirmationModal from '../../../components/common/DeleteConfirmationModal';
import FormLoadingWrapper from '../../../components/common/FormLoadingWrapper';
import CommonModal from '../../../components/common/CommonModal';
import MenuForm from './MenuForm';
import QuickAddMenuModal from './QuickAddMenuModal';
import { FaBolt, FaTags } from 'react-icons/fa';

const INITIAL_MENU_DATA = [
  {
    id: 101,
    name: 'CHICKEN TANDOORI',
    shortCode: '101',
    category: 'FOOD',
    foodType: 'Non-Veg',
    price: '280.00',
    taxStructure: 'TAX @5%',
    kitchen: 'Main Kitchen',
    active: 'Yes',
    areaPrices: {
      'Restaurant Dining': '280.00',
      'Rooftop': '320.00',
      'Pool Side': '340.00',
      'Room Service': '360.00',
      'Banquet': '380.00'
    }
  },
  {
    id: 102,
    name: 'PANEER TIKKA',
    shortCode: '102',
    category: 'FOOD',
    foodType: 'Veg',
    price: '180.00',
    taxStructure: 'TAX @5%',
    kitchen: 'Main Kitchen',
    active: 'Yes',
    areaPrices: {
      'Restaurant Dining': '180.00',
      'Rooftop': '210.00',
      'Pool Side': '230.00',
      'Room Service': '240.00',
      'Banquet': '250.00'
    }
  },
  {
    id: 103,
    name: 'DAL MAKHANI',
    shortCode: '103',
    category: 'FOOD',
    foodType: 'Veg',
    price: '160.00',
    taxStructure: 'TAX @5%',
    kitchen: 'Main Kitchen',
    active: 'Yes',
    areaPrices: {
      'Restaurant Dining': '160.00',
      'Rooftop': '190.00',
      'Pool Side': '200.00',
      'Room Service': '210.00',
      'Banquet': '220.00'
    }
  },
  {
    id: 104,
    name: 'PANEER BUTTER MASALA',
    shortCode: '104',
    category: 'FOOD',
    foodType: 'Veg',
    price: '260.00',
    taxStructure: 'TAX @5%',
    kitchen: 'Main Kitchen',
    active: 'Yes',
    areaPrices: {
      'Restaurant Dining': '260.00',
      'Rooftop': '300.00',
      'Pool Side': '320.00',
      'Room Service': '340.00',
      'Banquet': '360.00'
    }
  },
  {
    id: 105,
    name: 'COLD DRINK (500ML)',
    shortCode: '105',
    category: 'BEVERAGE',
    foodType: 'Veg',
    price: '70.00',
    taxStructure: 'TAX @12%',
    kitchen: 'Bar Desk',
    active: 'Yes',
    areaPrices: {
      'Restaurant Dining': '70.00',
      'Rooftop': '80.00',
      'Room Service': '90.00'
    }
  }
];

const MenuList = ({ showToast = () => {} }) => {
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem('alfa_menu_items');
      return saved ? JSON.parse(saved) : INITIAL_MENU_DATA;
    } catch {
      return INITIAL_MENU_DATA;
    }
  });

  const [showForm, setShowForm] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [editMode, setEditMode] = useState({ mode: 'add', row: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, row: null });

  // Area Price Detail Modal
  const [areaPricesModal, setAreaPricesModal] = useState({ open: false, item: null });

  useEffect(() => {
    try {
      localStorage.setItem('alfa_menu_items', JSON.stringify(data));
    } catch (err) { /* ignore */ }
  }, [data]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (showForm) return;
      if (e.key === 'F2' || (e.altKey && e.key.toLowerCase() === 'q')) {
        e.preventDefault();
        setIsQuickAddOpen(true);
      } else if (e.key === 'F4' || (e.altKey && e.key.toLowerCase() === 'n')) {
        e.preventDefault();
        setEditMode({ mode: 'add', row: null });
        setShowForm(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showForm]);

  const columns = [
    { key: 'shortCode', label: 'Code' },
    {
      key: 'name',
      label: 'Item Name',
      render: (v, row) => (
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-800">{v}</span>
          {row.foodType === 'Veg' && <span className="text-[10px] px-1.5 py-0.5 bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 rounded">Veg</span>}
          {row.foodType === 'Non-Veg' && <span className="text-[10px] px-1.5 py-0.5 bg-red-50 text-red-700 font-bold border border-red-200 rounded">Non-Veg</span>}
          {row.foodType === 'Egg' && <span className="text-[10px] px-1.5 py-0.5 bg-amber-50 text-amber-700 font-bold border border-amber-200 rounded">Egg</span>}
        </div>
      )
    },
    { key: 'category', label: 'Category' },
    {
      key: 'price',
      label: 'Base Price (₹)',
      render: (v) => <span className="font-bold text-[#418A8B]">₹{v}</span>
    },
    {
      key: 'areaPrices',
      label: 'Area Wise Prices',
      render: (v, row) => {
        const entries = v ? Object.entries(v).filter(([, p]) => p !== '') : [];
        if (entries.length === 0) {
          return <span className="text-slate-400 text-[11px]">Base Rate Only</span>;
        }

        return (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setAreaPricesModal({ open: true, item: row });
            }}
            className="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-[#418A8B] border border-teal-200 text-[11px] font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
            title="Click to view area price breakdown"
          >
            <FaTags className="text-[10px]" />
            <span>{entries.length} Area Rates</span>
          </button>
        );
      }
    },
    { key: 'kitchen', label: 'Kitchen Station' },
    { key: 'active', label: 'Active', renderStatus: true },
    { key: 'action', label: 'Action', sortable: false }
  ];

  const handleSave = (formData) => {
    if (editMode.mode === 'add') {
      const newItem = { ...formData, id: Date.now() };
      setData(prev => [newItem, ...prev]);
      showToast('Menu Item added successfully!');
    } else {
      setData(prev => prev.map(r => r.id === editMode.row.id ? { ...formData, id: r.id } : r));
      showToast('Menu Item updated successfully!');
    }
    setShowForm(false);
  };

  const handleQuickAddSave = (newItem) => {
    const itemWithId = { ...newItem, id: Date.now() };
    setData(prev => [itemWithId, ...prev]);
    showToast(`Quick Added: ${newItem.name}`);
  };

  const handleDelete = () => {
    setData(prev => prev.filter(r => r.id !== deleteModal.row.id));
    showToast('Menu Item deleted.');
    setDeleteModal({ open: false, row: null });
  };

  if (showForm) {
    return (
      <FormLoadingWrapper>
        <MenuForm
          mode={editMode.mode}
          initialData={editMode.row}
          onSave={handleSave}
          onCancel={() => setShowForm(false)}
          existingRecords={data}
        />
      </FormLoadingWrapper>
    );
  }

  return (
    <>
      <CommonTable
        title="Menu Item Catalog Master"
        columns={columns}
        data={data}
        actions={[
          { label: 'Edit', onClick: (row) => { setEditMode({ mode: 'edit', row }); setShowForm(true); } },
          { label: 'Delete', isDanger: true, onClick: (row) => setDeleteModal({ open: true, row }) }
        ]}
        onAddEntry={() => { setEditMode({ mode: 'add', row: null }); setShowForm(true); }}
        addEntryLabel="+ Add Menu Item"
        extraButtons={[
          {
            label: '+ Quick Add Item',
            onClick: () => setIsQuickAddOpen(true),
            icon: <FaBolt size={12} />,
            className: 'btn-secondary text-amber-700 bg-amber-50 border border-amber-200 hover:bg-amber-100 font-bold'
          }
        ]}
        searchPlaceholder="Search Menu Items..."
        showToast={showToast}
        breadcrumbs={['Dashboard', 'System Settings', 'Menu Catalog Master']}
      />

      {/* Quick Add Short Form Modal using CommonModal */}
      <QuickAddMenuModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onSave={handleQuickAddSave}
      />

      {/* Area Wise Pricing Breakdown Modal using CommonModal */}
      {areaPricesModal.open && areaPricesModal.item && (
        <CommonModal
          isOpen={areaPricesModal.open}
          onClose={() => setAreaPricesModal({ open: false, item: null })}
          title={`Area Wise Pricing Rates - ${areaPricesModal.item.name}`}
          maxWidth="540px"
        >
          <div className="flex flex-col gap-4 py-2">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600">Base Price Rate</span>
              <span className="text-sm font-extrabold text-[#418A8B]">₹{areaPricesModal.item.price}</span>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider">
                  <tr>
                    <th className="p-3">Service Area</th>
                    <th className="p-3 text-right">Applicable Selling Price (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {Object.entries(areaPricesModal.item.areaPrices || {}).map(([area, price]) => (
                    <tr key={area} className="hover:bg-slate-50">
                      <td className="p-3 font-semibold text-slate-700">{area}</td>
                      <td className="p-3 text-right font-bold text-slate-800">
                        {price ? `₹${price}` : `₹${areaPricesModal.item.price} (Base)`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setAreaPricesModal({ open: false, item: null })}
                className="px-4 py-2 bg-[#418A8B] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </CommonModal>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, row: null })}
        onConfirm={handleDelete}
        itemName={deleteModal.row?.name}
      />
    </>
  );
};

export default MenuList;
