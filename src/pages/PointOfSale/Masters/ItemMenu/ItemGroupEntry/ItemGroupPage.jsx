import React, { useCallback } from 'react';
import CommonTable from '../../../../../components/common/CommonTable';
import DeleteConfirmationModal from '../../../../../components/common/DeleteConfirmationModal';
import DuplicateConfirmationModal from '../../../../../components/common/DuplicateConfirmationModal';
import ItemGroupForm from './ItemGroupForm';
import { useItemMenu } from '../useItemMenu';

const columns = [
  { key: 'name', label: 'Item Group', sortable: true },
  { key: 'mainGroup', label: 'Main Group', sortable: true },
  { key: 'code', label: 'HSN/SAC Code', sortable: true }
];

const ItemGroupPage = ({ showToast }) => {
  const toastTrigger = useCallback((msg) => {
    if (showToast) showToast(msg);
    else if (window.showToast) window.showToast(msg);
  }, [showToast]);

  const {
    data,
    mainGroups,
    modal,
    setModal,
    deleteModal,
    setDeleteModal,
    duplicateConfirm,
    setDuplicateConfirm,
    handleSave,
    handleDelete,
    handleBulkDelete
  } = useItemMenu('item-group', toastTrigger);

  const handleOpenAdd = () => {
    setModal({ open: true, isEdit: false, fields: {} });
  };

  const handleOpenEdit = (row) => {
    setModal({ open: true, isEdit: true, fields: row });
  };

  return (
    <div className="w-full flex flex-col p-6 animate-in fade-in duration-200">
      <CommonTable
        title="Item Menu - Item Category"
        columns={columns}
        data={data}
        actions={[
          { label: 'Edit', onClick: handleOpenEdit },
          { label: 'Delete', isDanger: true, onClick: (row) => setDeleteModal({ open: true, row }) }
        ]}
        onBulkDelete={handleBulkDelete}
        onAddEntry={handleOpenAdd}
        addEntryLabel="+ Add Item Category"
        searchPlaceholder="Search Item Category..."
        showToast={toastTrigger}
        breadcrumbs={['Dashboard', 'Point Of Sale', 'Master', 'Item Menu', 'Item Category']}
        emptyMessage="No Item Category records found."
      />

      {modal.open && (
        <ItemGroupForm
          isOpen={modal.open}
          onClose={() => setModal({ open: false, isEdit: false, fields: {} })}
          onSave={handleSave}
          initialData={modal.fields}
          isEdit={modal.isEdit}
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

export default ItemGroupPage;
