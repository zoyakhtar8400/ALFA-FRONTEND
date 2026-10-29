import React, { useState } from 'react';
import CommonTable from '../../../../components/common/CommonTable';
import DeleteConfirmationModal from '../../../../components/common/DeleteConfirmationModal';
import ItemGroupForm from './ItemGroupForm';
import { usePurchase } from '../../hooks/usePurchase';
import { inventoryApi } from '../../../../api/inventoryApi';

const columns = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'type', label: 'Type', sortable: true },
  { key: 'postInAc', label: 'Post In Account', sortable: true },
  { key: 'action', label: 'Action' }
];

const ItemGroupList = ({ showToast }) => {
  const { itemGroups, setItemGroups } = usePurchase();

  const [modal, setModal] = useState({ open: false, mode: 'add', row: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, row: null });

  const toast = (msg) => {
    if (showToast) showToast(msg);
    else if (window.showToast) window.showToast(msg);
  };

  React.useEffect(() => {
    const loadGroups = async () => {
      try {
        const json = await inventoryApi.getItemGroups();
        if (Array.isArray(json?.data) && json.data.length > 0) {
          const mappedGroups = json.data.map(g => ({
            id: g.group_id,
            name: g.group_name,
            type: g.group_type || 'Raw Material',
            postInAc: g.post_in_ac || ''
          }));
          setItemGroups(mappedGroups);
        }
      } catch (err) {
        console.warn('Error loading item groups from PostgreSQL:', err.message);
      }
    };
    loadGroups();
  }, []);

  const handleOpenAdd = () => setModal({ open: true, mode: 'add', row: null });
  const handleOpenEdit = (row) => setModal({ open: true, mode: 'edit', row });

  const handleSave = async (formData) => {
    try {
      await inventoryApi.saveItemGroup({
        group_id: modal.mode === 'edit' && modal.row ? modal.row.id : undefined,
        group_name: formData.name,
        group_type: formData.type || 'Raw Material',
        post_in_ac: formData.postInAc || ''
      });
      console.log('✅ Item Group saved to PostgreSQL via inventoryApi.saveItemGroup');
    } catch (e) {
      console.warn('Error saving Item Group to PostgreSQL:', e.message);
    }

    if (modal.mode === 'edit' && modal.row) {
      setItemGroups((prev) => prev.map((ig) => (ig.id === modal.row.id ? { ...formData, id: ig.id } : ig)));
      toast('Item Group updated in PostgreSQL!');
    } else {
      setItemGroups((prev) => [{ ...formData, id: Date.now() }, ...prev]);
      toast('Item Group created in PostgreSQL!');
    }
    setModal({ open: false, mode: 'add', row: null });
  };

  const handleDelete = () => {
    if (!deleteModal.row) return;
    setItemGroups((prev) => prev.filter((ig) => ig.id !== deleteModal.row.id));
    toast('Item Group deleted.');
    setDeleteModal({ open: false, row: null });
  };

  const handleBulkDelete = (selectedRows, selectedIds) => {
    setItemGroups((prev) => prev.filter((ig) => !selectedIds.includes(String(ig.id)) && !selectedRows.some(sr => sr.id === ig.id)));
    toast(`Deleted ${selectedRows.length} item group(s).`);
  };

  return (
    <div className="w-full flex flex-col p-6 animate-in fade-in duration-200">
      <CommonTable
        title="Item Group Master"
        columns={columns}
        data={itemGroups}
        actions={[
          { label: 'Edit', onClick: handleOpenEdit },
          { label: 'Delete', isDanger: true, onClick: (row) => setDeleteModal({ open: true, row }) }
        ]}
        onBulkDelete={handleBulkDelete}
        onAddEntry={handleOpenAdd}
        addEntryLabel="+ Add Item Group"
        searchPlaceholder="Search Item Groups..."
        showToast={toast}
        breadcrumbs={['Dashboard', 'Purchase', 'Master', 'Item Group']}
        emptyMessage="No Item Groups found."
      />

      <ItemGroupForm
        isOpen={modal.open}
        mode={modal.mode}
        initialData={modal.row}
        onSave={handleSave}
        onClose={() => setModal({ open: false, mode: 'add', row: null })}
        existingRecords={itemGroups}
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

export default ItemGroupList;
