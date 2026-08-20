import React, { useCallback } from 'react';
import CommonTable from '../../../../components/common/CommonTable';
import DeleteConfirmationModal from '../../../../components/common/DeleteConfirmationModal';
import DuplicateConfirmationModal from '../../../../components/common/DuplicateConfirmationModal';
import AreaMasterForm from './AreaMasterForm';
import { useAreaMaster } from './useAreaMaster';

import { useRestaurant } from '../../../../context/RestaurantContext';

const AreaMasterPage = ({ showToast }) => {
  const { allOutlets } = useRestaurant();

  const columns = [
    { key: 'name', label: 'Area Name', sortable: true },
    { key: 'store_id', label: 'Outlet', sortable: true, render: (v) => {
        if (!v) return 'All / Global';
        const outlet = allOutlets?.find(o => String(o.id) === String(v));
        return outlet?.store_name || outlet?.name || `Outlet ${v}`;
      } 
    },
    { key: 'description', label: 'Description', sortable: true, render: (v) => v || '—' },
    { key: 'active', label: 'Status', sortable: true, renderStatus: true, activeValue: 'Yes' },
  ];

  const toastTrigger = useCallback((msg, type = 'success') => {
    if (typeof showToast === 'function') {
      showToast(msg);
    } else if (window.showToast) {
      window.showToast(msg, type);
    }
  }, [showToast]);

  const {
    data,
    loading,
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
    handleDelete
  } = useAreaMaster(toastTrigger);

  const handleOpenAdd = () => {
    setModal({ open: true, isEdit: false, fields: {} });
  };

  const handleOpenEdit = (row) => {
    setModal({ open: true, isEdit: true, fields: row });
  };

  return (
    <div className="w-full flex flex-col p-6 animate-in fade-in duration-200">
      <CommonTable
        title="Area Master"
        columns={columns}
        data={data}
        loading={loading}
        actions={[
          { label: 'Edit', onClick: handleOpenEdit },
          { label: 'Delete', isDanger: true, onClick: (row) => setDeleteModal({ open: true, row }) }
        ]}
        onAddEntry={handleOpenAdd}
        addEntryLabel="+ Add Area"
        searchPlaceholder="Search Area Master..."
        showToast={toastTrigger}
        breadcrumbs={['Dashboard', 'Point Of Sale', 'Master', 'Area Master']}
        emptyMessage="No Area Records Found"
        statusFilterKey="active"
      />

      {/* Add / Edit Area Modal */}
      {modal.open && (
        <AreaMasterForm
          isOpen={modal.open}
          onClose={() => setModal({ open: false, isEdit: false, fields: {} })}
          onSave={handleSave}
          initialData={modal.fields}
          isEdit={modal.isEdit}
        />
      )}

      {/* Duplicate Confirmation Modal */}
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

      {/* Delete Confirmation Modal */}
      {deleteModal.open && (
        <DeleteConfirmationModal
          isOpen={deleteModal.open}
          onClose={() => setDeleteModal({ open: false, row: null })}
          onConfirm={handleDelete}
          itemName={deleteModal.row?.name || 'this area'}
        />
      )}
    </div>
  );
};

export default AreaMasterPage;
export { AreaMasterPage };
