import React, { useCallback } from 'react';
import CommonTable from '../../../../components/common/CommonTable';
import DeleteConfirmationModal from '../../../../components/common/DeleteConfirmationModal';
import DuplicateConfirmationModal from '../../../../components/common/DuplicateConfirmationModal';
import NCTypeMasterForm from './NCTypeMasterForm';
import { useNCTypeMaster } from './useNCTypeMaster';

const columns = [
  { key: 'name', label: 'NC Type', sortable: true },
  { key: 'status', label: 'Active', sortable: true, renderStatus: true, activeValue: 'Active' }
];

const NCTypeMasterPage = ({ showToast }) => {
  const toastTrigger = useCallback((msg) => {
    if (showToast) showToast(msg);
    else if (window.showToast) window.showToast(msg);
  }, [showToast]);

  const {
    data,
    filteredData,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    outletFilter,
    setOutletFilter,
    outletsList,
    modal,
    setModal,
    deleteModal,
    setDeleteModal,
    duplicateConfirm,
    setDuplicateConfirm,
    handleSave,
    handleDelete,
    handleBulkDelete
  } = useNCTypeMaster(toastTrigger);

  const columns = [
    { key: 'name', label: 'NC Type', sortable: true },
    {
      key: 'store_id',
      label: 'Outlet',
      sortable: true,
      render: (val) => {
        const cleanVal = String(val || '').trim();
        const o = (outletsList || []).find(store => 
          String(store.store_id || '') === cleanVal || 
          String(store.id || '') === cleanVal || 
          `STORE_${store.id}` === cleanVal ||
          String(store.code || '') === cleanVal
        );
        if (o) return o.store_name || o.name || o.outlet_name || 'Main Restaurant';
        if (cleanVal === 'STORE_1' || cleanVal === '1' || !cleanVal) {
          const firstOutlet = outletsList && outletsList[0];
          return firstOutlet?.store_name || firstOutlet?.name || 'Main Restaurant';
        }
        return cleanVal;
      }
    },
    { key: 'status', label: 'Active', sortable: true, renderStatus: true, activeValue: 'Active' }
  ];

  const handleOpenAdd = () => {
    setModal({ open: true, isEdit: false, fields: {} });
  };

  const handleOpenEdit = (row) => {
    setModal({ open: true, isEdit: true, fields: row });
  };

  return (
    <div className="w-full flex flex-col p-6 animate-in fade-in duration-200">
      <CommonTable
        title="NC Type Master"
        columns={columns}
        data={filteredData || data}
        outletFilter={outletFilter}
        setOutletFilter={setOutletFilter}
        outletsList={outletsList}
        actions={[
          { label: 'Edit', onClick: handleOpenEdit },
          { label: 'Delete', isDanger: true, onClick: (row) => setDeleteModal({ open: true, row }) }
        ]}
        onBulkDelete={handleBulkDelete}
        onAddEntry={handleOpenAdd}
        addEntryLabel="+ Add NC Type"
        searchPlaceholder="Search NC Type..."
        showToast={toastTrigger}
        breadcrumbs={['Dashboard', 'Point Of Sale', 'Master', 'NC Type Master']}
        emptyMessage="No NC Type Records Found"
        statusFilterKey="status"
      />

      {modal.open && (
        <NCTypeMasterForm
          isOpen={modal.open}
          onClose={() => setModal({ open: false, isEdit: false, fields: {} })}
          onSave={handleSave}
          initialData={modal.fields}
          isEdit={modal.isEdit}
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
    </div>
  );
};

export default NCTypeMasterPage;
export { NCTypeMasterPage };
