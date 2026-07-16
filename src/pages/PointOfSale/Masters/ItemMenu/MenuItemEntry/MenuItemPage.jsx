import React, { useCallback } from 'react';
import CommonTable from '../../../../../components/common/CommonTable';
import DeleteConfirmationModal from '../../../../../components/common/DeleteConfirmationModal';
import DuplicateConfirmationModal from '../../../../../components/common/DuplicateConfirmationModal';
import MenuItemForm from './MenuItemForm';
import { useItemMenu } from '../useItemMenu';

const columns = [
  { key: 'name', label: 'Item Name', sortable: true },
  { key: 'outlet', label: 'Outlet', sortable: true },
  { key: 'price', label: 'Sale Rate', sortable: true, render: (v) => `₹${v}` },
  { key: 'category', label: 'Item Category', sortable: true },
  { key: 'rateEdit', label: 'Rate Edit', sortable: true },
  { key: 'discApp', label: 'DISC App', sortable: true },
  { key: 'kitchen', label: 'Kitchen', sortable: true },
  { key: 'status', label: 'Active', sortable: true, renderStatus: true, activeValue: 'Active' },
  { key: 'hsnCode', label: 'HSN Code', sortable: true }
];

const MenuItemPage = ({ showToast }) => {
  const toastTrigger = useCallback((msg) => {
    if (showToast) showToast(msg);
    else if (window.showToast) window.showToast(msg);
  }, [showToast]);

  const {
    data,
    itemGroups,
    mainGroups,
    modal,
    setModal,
    deleteModal,
    setDeleteModal,
    duplicateConfirm,
    setDuplicateConfirm,
    handleSave,
    handleDelete
  } = useItemMenu('menu-item', toastTrigger);

  const handleOpenAdd = () => {
    setModal({ open: true, isEdit: false, fields: {} });
  };

  const handleOpenEdit = (row) => {
    setModal({ open: true, isEdit: true, fields: row });
  };

  return (
    <div className="w-full flex flex-col p-6 animate-in fade-in duration-200">
      <CommonTable
        title="Item Menu - Menu Item Entry"
        columns={columns}
        data={data}
        actions={[
          { label: 'Edit', onClick: handleOpenEdit },
          { label: 'Delete', isDanger: true, onClick: (row) => setDeleteModal({ open: true, row }) }
        ]}
        onAddEntry={handleOpenAdd}
        addEntryLabel="+ Add Menu Item Entry"
        searchPlaceholder="Search Menu Item Entry..."
        showToast={toastTrigger}
        breadcrumbs={['Dashboard', 'Point Of Sale', 'Master', 'Item Menu', 'Menu Item Entry']}
        emptyMessage="No Menu Item Entry records found."
        statusFilterKey="status"
      />

      {modal.open && (
        <MenuItemForm
          isOpen={modal.open}
          onClose={() => setModal({ open: false, isEdit: false, fields: {} })}
          onSave={handleSave}
          initialData={modal.fields}
          isEdit={modal.isEdit}
          itemGroups={itemGroups}
          mainGroups={mainGroups}
        />
      )}

      {duplicateConfirm.open && (
        <DuplicateConfirmationModal
          isOpen={duplicateConfirm.open}
          onClose={() => setDuplicateConfirm({ open: false, fields: null, duplicateItem: null })}
          onEditExisting={() => {
            const item = duplicateConfirm.duplicateItem;
            setDuplicateConfirm({ open: false, fields: null, duplicateItem: null });
            setModal({ open: true, isEdit: true, fields: item });
          }}
          itemName={duplicateConfirm.duplicateItem?.name || ''}
        />
      )}

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

export default MenuItemPage;
