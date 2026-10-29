import React, { useCallback } from 'react';
import CommonTable from '../../../../components/common/CommonTable';
import DeleteConfirmationModal from '../../../../components/common/DeleteConfirmationModal';
import DuplicateConfirmationModal from '../../../../components/common/DuplicateConfirmationModal';
import DeliveryMasterForm from './DeliveryMasterForm';
import { useDeliveryMaster } from './useDeliveryMaster';

const DeliveryMasterPage = ({ showToast }) => {
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
    outletFilter,
    setOutletFilter,
    outletsList,
    areaFilter,
    setAreaFilter,
    areasList,
    modal,
    setModal,
    deleteModal,
    setDeleteModal,
    duplicateConfirm,
    setDuplicateConfirm,
    handleSave,
    handleDelete,
    handleBulkDelete
  } = useDeliveryMaster(toastTrigger);

  const columns = [
    { key: 'partner', label: 'Partner Name', sortable: true },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'phone', label: 'Phone', sortable: true },
    {
      key: 'area',
      label: 'Assigned Area',
      sortable: true,
      render: (v) => (
        <span className="font-semibold text-slate-700">
          {v || <span className="text-slate-400 font-normal">All Areas</span>}
        </span>
      )
    },
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
    { key: 'status', label: 'Status', sortable: true, renderStatus: true, activeValue: 'Active' }
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
        title="Delivery Master"
        columns={columns}
        data={data}
        outletFilter={outletFilter}
        setOutletFilter={setOutletFilter}
        outletsList={outletsList}
        areaFilter={areaFilter}
        setAreaFilter={setAreaFilter}
        areasList={areasList}
        actions={[
          { label: 'Edit', onClick: handleOpenEdit },
          { label: 'Delete', isDanger: true, onClick: (row) => setDeleteModal({ open: true, row }) }
        ]}
        onBulkDelete={handleBulkDelete}
        onAddEntry={handleOpenAdd}
        addEntryLabel="+ Add Delivery"
        searchPlaceholder="Search delivery boy or partner..."
        showToast={toastTrigger}
        breadcrumbs={['Dashboard', 'Point Of Sale', 'Master', 'Delivery Master']}
        emptyMessage="No Delivery Boy Records Found"
        statusFilterKey="status"
      />

      {modal.open && (
        <DeliveryMasterForm
          isOpen={modal.open}
          onClose={() => setModal({ open: false, isEdit: false, fields: {} })}
          onSave={handleSave}
          initialData={modal.fields}
          isEdit={modal.isEdit}
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
          itemName={deleteModal.row ? `${deleteModal.row.name} (${deleteModal.row.partner})` : ''}
        />
      )}
    </div>
  );
};

export default DeliveryMasterPage;
export { DeliveryMasterPage };
