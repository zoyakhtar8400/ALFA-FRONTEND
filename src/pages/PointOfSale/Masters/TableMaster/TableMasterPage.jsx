import React, { useCallback, useState } from 'react';
import CommonTable from '../../../../components/common/CommonTable';
import DeleteConfirmationModal from '../../../../components/common/DeleteConfirmationModal';
import DuplicateConfirmationModal from '../../../../components/common/DuplicateConfirmationModal';
import TableMasterForm from './TableMasterForm';
import TableMasterBulkForm from './TableMasterBulkForm';
import { useTableMaster } from './useTableMaster';

const columns = [
  { key: 'no', label: 'Table No', sortable: true },
  { key: 'name', label: 'Table Name', sortable: true },
  { key: 'department', label: 'Section', sortable: true },
  { key: 'pax', label: 'PAX', sortable: true, render: (v) => (v !== undefined && v !== null && v !== '') ? `${v} Pax` : '' },
  { key: 'area', label: 'Area', sortable: true, render: (v, row) => row.area || row.floor || '' },
  { key: 'status', label: 'Status', sortable: true }
];

const TableMasterPage = ({ showToast }) => {
  const toastTrigger = useCallback((msg) => {
    if (showToast) showToast(msg);
    else if (window.showToast) window.showToast(msg);
  }, [showToast]);

  const [bulkOpen, setBulkOpen] = useState(false);

  const {
    data,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    modal,
    setModal,
    deleteModal,
    setDeleteModal,
    duplicateConfirm,
    setDuplicateConfirm,
    handleSave,
    handleDelete,
    handleBulkSave
  } = useTableMaster(toastTrigger);

  const handleOpenAdd = () => {
    setModal({ open: true, isEdit: false, fields: {} });
  };

  const handleOpenEdit = (row) => {
    setModal({ open: true, isEdit: true, fields: row });
  };

  return (
    <div className="w-full flex flex-col p-6 animate-in fade-in duration-200">
      <CommonTable
        title="Table Master"
        columns={columns}
        data={data}
        actions={[
          { label: 'Edit', onClick: handleOpenEdit },
          { label: 'Delete', isDanger: true, onClick: (row) => setDeleteModal({ open: true, row }) }
        ]}
        onAddEntry={handleOpenAdd}
        addEntryLabel="+ Add Table"
        searchPlaceholder="Search table name or department..."
        showToast={toastTrigger}
        breadcrumbs={['Dashboard', 'Point Of Sale', 'Master', 'Table Master']}
        emptyMessage="No Table Records Found"
        extraButtons={[
          {
            label: 'Bulk Create Tables',
            onClick: () => setBulkOpen(true),
            className: 'btn-secondary'
          }
        ]}
      />

      {modal.open && (
        <TableMasterForm
          isOpen={modal.open}
          onClose={() => setModal({ open: false, isEdit: false, fields: {} })}
          onSave={handleSave}
          initialData={modal.fields}
          isEdit={modal.isEdit}
        />
      )}

      {bulkOpen && (
        <TableMasterBulkForm
          isOpen={bulkOpen}
          onClose={() => setBulkOpen(false)}
          onSave={(fields) => {
            const success = handleBulkSave(fields);
            if (success) {
              setBulkOpen(false);
            }
          }}
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

export default TableMasterPage;
export { TableMasterPage };
