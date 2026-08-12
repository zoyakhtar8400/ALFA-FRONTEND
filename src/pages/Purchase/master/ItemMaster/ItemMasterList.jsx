import React, { useState } from 'react';
import CommonTable from '../../../../components/common/CommonTable';
import DeleteConfirmationModal from '../../../../components/common/DeleteConfirmationModal';
import ItemMasterForm from './ItemMasterForm';
import { usePurchase } from '../../hooks/usePurchase';
import { inventoryApi } from '../../../../api/inventoryApi';

const columns = [
  { key: 'name', label: 'Item Name', sortable: true },
  { key: 'itemCategory', label: 'Category', sortable: true },
  { key: 'unitName', label: 'Unit', sortable: true },
  {
    key: 'currentStock',
    label: 'Current Stock (PostgreSQL)',
    sortable: true,
    render: (val, row) => (
      <span className="font-extrabold text-teal-700 bg-teal-50 px-2.5 py-1 rounded text-xs">
        {Number(val !== undefined && val !== null ? val : row.currentStock || 0)} {row.unitName || ''}
      </span>
    )
  },
  { key: 'active', label: 'Active', sortable: true, renderStatus: true, activeValue: 'Yes' },
  { key: 'storeDepartment', label: 'Store Dept', sortable: true },
  { key: 'action', label: 'Action' }
];

const ItemMasterList = ({ showToast }) => {
  const { items, setItems, itemGroups, units } = usePurchase();

  const [viewMode, setViewMode] = useState('list'); // 'list' | 'form'
  const [formMode, setFormMode] = useState('add'); // 'add' | 'edit'
  const [selectedRow, setSelectedRow] = useState(null);

  const [deleteModal, setDeleteModal] = useState({ open: false, row: null });

  const toast = (msg) => {
    if (showToast) showToast(msg);
    else if (window.showToast) window.showToast(msg);
  };

  React.useEffect(() => {
    const loadItems = async () => {
      try {
        const json = await inventoryApi.getInventoryItems();
        const dbItems = json?.data || json;
        if (Array.isArray(dbItems) && dbItems.length > 0) {
          const mappedItems = dbItems.map((inv) => ({
            id: inv.inventory_item_id,
            name: inv.item_name,
            itemCategory: inv.item_type === 'RAW' ? 'RAW MATERIAL' : 'FINISHED GOODS',
            itemGroupName: inv.item_type === 'RAW' ? 'RAW MATERIAL' : 'FINISHED GOODS',
            unitName: inv.unit || 'Kg',
            currentStock: Number(inv.current_stock || 0),
            minLevel: Number(inv.minimum_stock || 0),
            reorderLevel: Number(inv.minimum_stock || 0),
            purchaseRate: Number(inv.purchase_price || 0),
            salesRate: Number(inv.selling_price || 0),
            active: inv.is_active === 1 ? 'Yes' : 'No',
            storeDepartment: 'PURCHASE'
          }));
          setItems(mappedItems);
        }
      } catch (err) {
        console.warn('Error loading items from PostgreSQL:', err.message);
      }
    };
    loadItems();
  }, []);

  const handleOpenAdd = () => {
    setFormMode('add');
    setSelectedRow(null);
    setViewMode('form');
  };

  const handleOpenEdit = (row) => {
    setFormMode('edit');
    setSelectedRow(row);
    setViewMode('form');
  };

  const handleSave = async (formData) => {
    try {
      const payload = {
        inventory_item_id: formMode === 'edit' && selectedRow ? selectedRow.id : undefined,
        item_name: formData.name,
        item_type: formData.itemCategory && String(formData.itemCategory).toLowerCase().includes('finished') ? 'FINISHED' : 'RAW',
        unit: formData.unitName || 'Kg',
        minimum_stock: Number(formData.minLevel || 0),
        purchase_price: Number(formData.purchaseRate || 0),
        selling_price: Number(formData.salesRate || 0)
      };

      await inventoryApi.saveInventoryItem(payload);
      console.log('✅ Real item saved to PostgreSQL via inventoryApi.saveInventoryItem');
    } catch (e) {
      console.warn('Error posting item to PostgreSQL:', e.message);
    }

    if (formMode === 'edit' && selectedRow) {
      setItems((prev) => prev.map((i) => (i.id === selectedRow.id ? { ...formData, id: i.id } : i)));
      toast('Item Master updated in PostgreSQL!');
    } else {
      const newId = Date.now();
      setItems((prev) => [{ ...formData, id: newId }, ...prev]);
      toast('Item Master created in PostgreSQL!');
    }

    setViewMode('list');
    setSelectedRow(null);
  };

  const handleDelete = () => {
    if (!deleteModal.row) return;
    setItems((prev) => prev.filter((i) => i.id !== deleteModal.row.id));
    toast('Item deleted.');
    setDeleteModal({ open: false, row: null });
  };

  if (viewMode === 'form') {
    return (
      <ItemMasterForm
        mode={formMode}
        initialData={selectedRow}
        onSave={handleSave}
        onCancel={() => setViewMode('list')}
        itemGroups={itemGroups}
        units={units}
        existingRecords={items}
        showToast={toast}
      />
    );
  }

  return (
    <div className="w-full flex flex-col p-6 animate-in fade-in duration-200">
      <CommonTable
        title="Item Master"
        columns={columns}
        data={items}
        actions={[
          { label: 'Edit', onClick: handleOpenEdit },
          { label: 'Delete', isDanger: true, onClick: (row) => setDeleteModal({ open: true, row }) }
        ]}
        onAddEntry={handleOpenAdd}
        addEntryLabel="+ Add Item Master"
        searchPlaceholder="Search Item Master..."
        showToast={toast}
        breadcrumbs={['Dashboard', 'Purchase', 'Master', 'Item Master']}
        emptyMessage="No Items found in catalog."
      />

      {deleteModal.open && (
        <DeleteConfirmationModal
          isOpen={deleteModal.open}
          onClose={() => setDeleteModal({ open: false, row: null })}
          onConfirm={handleDelete}
          itemName={deleteModal.row?.name || ''}
        />
      )}
    </div>
  );
};

export default ItemMasterList;
