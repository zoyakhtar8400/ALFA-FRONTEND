import React, { useState, useEffect, useCallback } from 'react';
import PageHeader from '../../../../components/common/PageHeader';
import CommonTable from '../../../../components/common/CommonTable';
import DeleteConfirmationModal from '../../../../components/common/DeleteConfirmationModal';
import posApi from '../../../../api/posApi';
import { LuRefreshCw, LuCheck } from 'react-icons/lu';

const ItemRateUpdatePage = ({ showToast }) => {
  const toastTrigger = useCallback((msg, type = 'success') => {
    if (showToast) showToast(msg, type);
    else if (window.showToast) window.showToast(msg, type);
  }, [showToast]);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [direction, setDirection] = useState('increase');
  const [mode, setMode] = useState('percentage');
  const [value, setValue] = useState('');
  const [deleteModal, setDeleteModal] = useState({ open: false, row: null });

  const fetchItems = useCallback(() => {
    setLoading(true);
    posApi.getMenuItems().then(res => {
      const menuList = Array.isArray(res?.data?.menuItems) ? res.data.menuItems : (Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []));
      const mapped = menuList.map((m, idx) => ({
        id: m.id || m.item_id || idx + 1,
        name: m.name || m.title || `Item ${idx + 1}`,
        outlet: m.outlet || 'Main Restaurant',
        itemGroup: m['mpos_category.category_name'] || m.category || 'General',
        price: Number(m.price || m.sale_price || 0),
        unit: m.unit || 'PCS',
        hsnCode: m.hsn_code || '9963'
      }));
      setItems(mapped);
    }).catch(err => {
      console.error('Error fetching menu items:', err);
      setItems([]);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handlePriceChange = (id, newPrice) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, price: newPrice } : i));
  };

  const handleSaveRow = (row) => {
    const p = parseFloat(row.price);
    if (isNaN(p) || p < 0) {
      toastTrigger('Enter a valid price.', 'error');
      return;
    }
    posApi.updateItemRates({ item_id: row.id, price: p }).then(() => {
      toastTrigger(`Updated rate for "${row.name}" to ₹${p}`);
      fetchItems();
    }).catch(err => {
      toastTrigger(err?.response?.data?.message || 'Failed to update rate', 'error');
    });
  };

  const handleDeleteRow = () => {
    if (!deleteModal.row) return;
    posApi.deleteMenuItem(deleteModal.row.id).then(() => {
      toastTrigger(`Deleted item "${deleteModal.row.name}"`);
      setDeleteModal({ open: false, row: null });
      fetchItems();
    }).catch(err => {
      toastTrigger(err?.response?.data?.message || 'Failed to delete item', 'error');
      setDeleteModal({ open: false, row: null });
    });
  };

  const handleBulkUpdate = () => {
    const v = parseFloat(value);
    if (isNaN(v) || v <= 0) {
      toastTrigger('Enter a valid adjustment value.', 'error');
      return;
    }
    const payloadItems = items.map(item => {
      const diff = mode === 'percentage' ? (item.price * v) / 100 : v;
      const newPrice = direction === 'increase' ? item.price + diff : Math.max(0, item.price - diff);
      return { id: item.id, price: Math.round(newPrice) };
    });

    posApi.updateItemRates({ items: payloadItems }).then(() => {
      toastTrigger(`Bulk rate update applied (${direction}d by ${v}${mode === 'percentage' ? '%' : ' ₹'}).`);
      setValue('');
      fetchItems();
    }).catch(err => {
      toastTrigger(err?.response?.data?.message || 'Failed bulk rate update', 'error');
    });
  };

  const columns = [
    { key: 'name', label: 'Item Name', sortable: true },
    { key: 'itemGroup', label: 'Category', sortable: true },
    { key: 'outlet', label: 'Outlet', sortable: true },
    { 
      key: 'price', 
      label: 'Sale Rate (₹)', 
      sortable: true,
      render: (val, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="number"
            value={val}
            onChange={(e) => handlePriceChange(row.id, e.target.value)}
            style={{ width: '100px', padding: '4px 8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', fontWeight: 600 }}
          />
          <button
            onClick={() => handleSaveRow(row)}
            className="btn-primary"
            style={{ padding: '4px 8px', fontSize: '12px', borderRadius: '4px' }}
            title="Save Rate"
          >
            <LuCheck /> Save
          </button>
        </div>
      )
    },
    { key: 'unit', label: 'Unit', sortable: true },
    { key: 'hsnCode', label: 'HSN Code', sortable: true }
  ];

  return (
    <div className="w-full flex flex-col p-6 animate-in fade-in duration-200">
      {/* Bulk Rate Control Bar */}
      <div style={{ background: '#fff', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '16px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '14px', fontWeight: 700, color: '#334155' }}>Bulk Rate Adjustment:</span>
          <select
            value={direction}
            onChange={(e) => setDirection(e.target.value)}
            style={{ padding: '6px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
          >
            <option value="increase">Increase (+)</option>
            <option value="decrease">Decrease (-)</option>
          </select>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            style={{ padding: '6px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
          >
            <option value="percentage">Percentage (%)</option>
            <option value="fixed">Fixed Amount (₹)</option>
          </select>
          <input
            type="number"
            placeholder={mode === 'percentage' ? 'e.g. 10' : 'e.g. 50'}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            style={{ width: '120px', padding: '6px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
          />
          <button
            onClick={handleBulkUpdate}
            className="btn-primary"
            style={{ padding: '6px 16px', fontSize: '13px', borderRadius: '6px' }}
          >
            Apply Bulk Update
          </button>
        </div>
        <button
          onClick={fetchItems}
          className="btn-secondary"
          style={{ padding: '6px 12px', fontSize: '13px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <LuRefreshCw /> Refresh Rates
        </button>
      </div>

      <CommonTable
        title="Item Rate Update"
        columns={columns}
        data={items}
        isLoading={loading}
        actions={[
          { label: 'Save', onClick: handleSaveRow },
          { label: 'Delete', isDanger: true, onClick: (row) => setDeleteModal({ open: true, row }) }
        ]}
        searchPlaceholder="Search menu item or category..."
        showToast={toastTrigger}
        breadcrumbs={['Dashboard', 'Point Of Sale', 'Master', 'Item Rate Update']}
        emptyMessage="No Menu Items Found for Rate Update"
      />

      {deleteModal.open && (
        <DeleteConfirmationModal
          isOpen={deleteModal.open}
          onClose={() => setDeleteModal({ open: false, row: null })}
          onConfirm={handleDeleteRow}
          itemName={deleteModal.row?.name || ''}
        />
      )}
    </div>
  );
};

export default ItemRateUpdatePage;
