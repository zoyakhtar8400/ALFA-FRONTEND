import React, { useState } from 'react';
import CommonTable from '../../../../components/common/CommonTable';
import DeleteConfirmationModal from '../../../../components/common/DeleteConfirmationModal';
import ItemMasterForm from './ItemMasterForm';
import { usePurchase } from '../../hooks/usePurchase';

const columns = [
  { key: 'name', label: 'Item Name', sortable: true },
  { key: 'unitName', label: 'Unit', sortable: true },
  { key: 'active', label: 'Active', sortable: true, renderStatus: true, activeValue: 'Yes' },
  { key: 'itemCategory', label: 'Item Category', sortable: true },
  { key: 'itemGroupName', label: 'Item Group', sortable: true },
  { key: 'storeDepartment', label: 'Store Department', sortable: true },
  { key: 'lotBatchNo', label: 'Lot No Applicable', sortable: true },
  { key: 'conversionUnit', label: 'Conv Unit', sortable: true },
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

  const handleSave = (formData) => {
    if (formMode === 'edit' && selectedRow) {
      setItems((prev) => prev.map((i) => (i.id === selectedRow.id ? { ...formData, id: i.id } : i)));
      toast('Item Master updated successfully!');
    } else {
      const newId = Date.now();
      setItems((prev) => [{ ...formData, id: newId }, ...prev]);
      toast('Item Master created successfully!');
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
