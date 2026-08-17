import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import CommonTable from '../../../../components/common/CommonTable';
import DeleteConfirmationModal from '../../../../components/common/DeleteConfirmationModal';
import DuplicateConfirmationModal from '../../../../components/common/DuplicateConfirmationModal';
import OutletMasterForm from './OutletMasterForm';
import { useOutletMaster } from './useOutletMaster';

const OutletMasterPage = ({ showToast }) => {
  const navigate = useNavigate();

  const columns = [
    {
      key: 'name',
      label: 'Outlet Name',
      sortable: true,
      render: (val, row) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/pos/master/outlet/${row.id}/display-table`);
          }}
          style={{ background: 'none', border: 'none', color: '#7c3aed', fontWeight: 800, cursor: 'pointer', textDecoration: 'underline', padding: 0, outline: 'none' }}
        >
          {val}
        </button>
      )
    },
    { key: 'shortName', label: 'Short Name', sortable: true },
    { key: 'phone', label: 'Phone Number', sortable: true },
    { key: 'status', label: 'Status', sortable: true, renderStatus: true, activeValue: 'Active' }
  ];
  const toastTrigger = useCallback((msg) => {
    if (showToast) showToast(msg);
    else if (window.showToast) window.showToast(msg);
  }, [showToast]);

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
    handleDelete
  } = useOutletMaster(toastTrigger);

  const handleOpenAdd = () => {
    setModal({ open: true, isEdit: false, fields: {} });
  };

  const handleOpenEdit = (row) => {
    setModal({ open: true, isEdit: true, fields: row });
  };

  return (
    <div className="w-full flex flex-col p-6 animate-in fade-in duration-200">
      {modal.open ? (
        <OutletMasterForm
          isOpen={modal.open}
          onClose={() => setModal({ open: false, isEdit: false, fields: {} })}
          onSave={handleSave}
          initialData={modal.fields}
          isEdit={modal.isEdit}
        />
      ) : (
        <CommonTable
          title="Outlet Master"
          columns={columns}
          data={data}
          actions={[
            { label: 'Edit', onClick: handleOpenEdit },
            { label: 'Delete', isDanger: true, onClick: (row) => setDeleteModal({ open: true, row }) }
          ]}
          onAddEntry={handleOpenAdd}
          addEntryLabel="+ Add Outlet"
          searchPlaceholder="Search outlet name or short name..."
          showToast={toastTrigger}
          breadcrumbs={['Dashboard', 'Point Of Sale', 'Master', 'Outlet Master']}
          emptyMessage="No Outlet Records Found"
          statusFilterKey="status"
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

export default OutletMasterPage;
export { OutletMasterPage };
