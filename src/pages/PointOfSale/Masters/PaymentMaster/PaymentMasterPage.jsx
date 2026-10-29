import React, { useCallback } from 'react';
import CommonTable from '../../../../components/common/CommonTable';
import DeleteConfirmationModal from '../../../../components/common/DeleteConfirmationModal';
import DuplicateConfirmationModal from '../../../../components/common/DuplicateConfirmationModal';
import PaymentMasterForm from './PaymentMasterForm';
import { usePaymentMaster } from './usePaymentMaster';

const columns = [
  { key: 'name', label: 'Payment Mode Name', sortable: true },
  { key: 'type', label: 'Category', sortable: true, render: (v) => v || 'CASH' },
  {
    key: 'charge_percent',
    label: 'Fee / Surcharge',
    sortable: true,
    render: (v) => (Number(v) > 0 ? `${Number(v)}%` : '0%')
  },
  {
    key: 'is_quick_pay',
    label: 'Quick Bar',
    sortable: true,
    render: (v) => (
      <span
        style={{
          padding: '3px 8px',
          borderRadius: '4px',
          fontSize: '0.72rem',
          fontWeight: 800,
          background: v !== false ? '#ecfdf5' : '#f1f5f9',
          color: v !== false ? '#047857' : '#64748b'
        }}
      >
        {v !== false ? 'Primary Bar' : 'More Menu'}
      </span>
    )
  },
  { key: 'description', label: 'Description', sortable: true, render: (v) => v || '—' },
  { key: 'active', label: 'Status', sortable: true, renderStatus: true, activeValue: 'Yes' }
];

const PaymentMasterPage = ({ showToast }) => {
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
    handleDelete,
    handleBulkDelete
  } = usePaymentMaster(toastTrigger);

  const handleOpenAdd = () => {
    setModal({ open: true, isEdit: false, fields: {} });
  };

  const handleOpenEdit = (row) => {
    setModal({ open: true, isEdit: true, fields: row });
  };

  return (
    <div className="w-full flex flex-col p-6 animate-in fade-in duration-200">
      <CommonTable
        title="Payment Master"
        columns={columns}
        data={data}
        loading={loading}
        actions={[
          { label: 'Edit', onClick: handleOpenEdit },
          { label: 'Delete', isDanger: true, onClick: (row) => setDeleteModal({ open: true, row }) }
        ]}
        onBulkDelete={handleBulkDelete}
        onAddEntry={handleOpenAdd}
        addEntryLabel="+ Add Payment Mode"
        searchPlaceholder="Search Payment Mode..."
        showToast={toastTrigger}
        breadcrumbs={['Dashboard', 'Point Of Sale', 'Master', 'Payment Master']}
        emptyMessage="No Payment Modes Found"
        statusFilterKey="active"
      />

      {/* Add / Edit Payment Mode Modal */}
      {modal.open && (
        <PaymentMasterForm
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
          itemName={deleteModal.row?.name || 'this payment mode'}
        />
      )}
    </div>
  );
};

export default PaymentMasterPage;
export { PaymentMasterPage };
