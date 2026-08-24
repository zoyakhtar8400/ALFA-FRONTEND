import React from 'react';
import PageHeader from '../../../../components/common/PageHeader';
import CommonTable from '../../../../components/common/CommonTable';
import DeleteConfirmationModal from '../../../../components/common/DeleteConfirmationModal';
import LoadingState from '../../../../components/common/LoadingState';
import StewardMasterForm from './StewardMasterForm';
import DuplicateConfirmationModal from '../../../../components/common/DuplicateConfirmationModal';
import { useStewardMaster } from './useStewardMaster';

const columns = [
  { key: 'name', label: 'Steward Name', sortable: true },
  { key: 'active', label: 'Active', sortable: true, renderStatus: true },
  { key: 'action', label: 'Action', sortable: false }
];

const StewardMasterPage = ({ showToast }) => {
  const toastTrigger = React.useCallback((msg) => {
    if (showToast) showToast(msg);
    else if (window.showToast) window.showToast(msg);
  }, [showToast]);

  const {
    data,
    loading,
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
    openAdd,
    openEdit,
    openDelete,
    duplicateConfirm,
    setDuplicateConfirm,
    handleSave,
    handleDelete
  } = useStewardMaster(toastTrigger);

  const columns = [
    { key: 'name', label: 'Steward Name', sortable: true },
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
    { key: 'active', label: 'Active', sortable: true, renderStatus: true },
    { key: 'action', label: 'Action', sortable: false }
  ];

  // If loading initially, show LoadingState with standard page header layout
  if (loading) {
    return (
      <div className="w-full flex flex-col p-6 animate-in fade-in duration-200">
        <PageHeader
          title="Steward Master"
          breadcrumbs={['Dashboard', 'Point Of Sale', 'Master', 'Steward Master']}
        />
        <LoadingState message="Loading Steward records..." />
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col p-6 animate-in fade-in duration-200">
      <CommonTable
        title="Steward Master"
        columns={columns}
        data={data}
        outletFilter={outletFilter}
        setOutletFilter={setOutletFilter}
        outletsList={outletsList}
        actions={[
          { label: 'Edit', onClick: openEdit },
          { label: 'Delete', isDanger: true, onClick: openDelete }
        ]}
        onAddEntry={openAdd}
        addEntryLabel="+ Add Steward Master"
        searchPlaceholder="Search Steward..."
        showToast={toastTrigger}
        breadcrumbs={['Dashboard', 'Point Of Sale', 'Master', 'Steward Master']}
        emptyMessage="No Steward Records Found"
      />

      {/* Add/Edit Modal */}
      {modal.open && (
        <StewardMasterForm
          key={modal.row?.id || 'new'}
          isOpen={modal.open}
          mode={modal.mode}
          initialData={modal.row}
          onSave={handleSave}
          onClose={() => setModal({ open: false, mode: 'add', row: null })}
          existingRecords={data}
        />
      )}

      {duplicateConfirm.open && (
        <DuplicateConfirmationModal
          isOpen={duplicateConfirm.open}
          onClose={() => setDuplicateConfirm({ open: false, fields: null, duplicateItem: null })}
          onEditExisting={() => {
            const item = duplicateConfirm.duplicateItem;
            setDuplicateConfirm({ open: false, fields: null, duplicateItem: null });
            setModal({ open: true, mode: 'edit', row: item });
          }}
          itemName={duplicateConfirm.duplicateItem?.name || ''}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, row: null })}
        onConfirm={handleDelete}
        itemName={deleteModal.row?.name || ''}
        message="Are you sure you want to delete this Steward?"
      />
    </div>
  );
};

export default StewardMasterPage;
export { StewardMasterPage };
