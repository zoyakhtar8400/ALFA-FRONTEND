import React, { useState } from 'react';
import CommonTable from '../../../../components/common/CommonTable';
import DeleteConfirmationModal from '../../../../components/common/DeleteConfirmationModal';
import UnitMasterForm from './UnitMasterForm';
import { usePurchase } from '../../hooks/usePurchase';

const columns = [
  { key: 'name', label: 'Unit Name', sortable: true },
  { key: 'qtyDecimalPlaces', label: 'Qty. Decimal Places', sortable: true },
  { key: 'action', label: 'Action' }
];

const UnitMasterList = ({ showToast }) => {
  const { units, setUnits } = usePurchase();

  const [modal, setModal] = useState({ open: false, mode: 'add', row: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, row: null });

  const toast = (msg) => {
    if (showToast) showToast(msg);
    else if (window.showToast) window.showToast(msg);
  };

  const handleOpenAdd = () => setModal({ open: true, mode: 'add', row: null });
  const handleOpenEdit = (row) => setModal({ open: true, mode: 'edit', row });

  const handleSave = (formData) => {
    if (modal.mode === 'edit' && modal.row) {
      setUnits((prev) => prev.map((u) => (u.id === modal.row.id ? { ...formData, id: u.id } : u)));
      toast('Unit updated successfully!');
    } else {
      const newId = Date.now();
      setUnits((prev) => [{ ...formData, id: newId }, ...prev]);
      toast('Unit created successfully!');
    }
    setModal({ open: false, mode: 'add', row: null });
  };

  const handleDelete = () => {
    if (!deleteModal.row) return;
    setUnits((prev) => prev.filter((u) => u.id !== deleteModal.row.id));
    toast('Unit deleted.');
    setDeleteModal({ open: false, row: null });
  };

  return (
    <div className="w-full flex flex-col p-6 animate-in fade-in duration-200">
      <CommonTable
        title="Unit Master"
        columns={columns}
        data={units}
        actions={[
          { label: 'Edit', onClick: handleOpenEdit },
          { label: 'Delete', isDanger: true, onClick: (row) => setDeleteModal({ open: true, row }) }
        ]}
        onAddEntry={handleOpenAdd}
        addEntryLabel="+ Add Unit"
        searchPlaceholder="Search Units..."
        showToast={toast}
        breadcrumbs={['Dashboard', 'Purchase', 'Master', 'Unit Master']}
        emptyMessage="No Units found."
      />

      <UnitMasterForm
        isOpen={modal.open}
        mode={modal.mode}
        initialData={modal.row}
        onSave={handleSave}
        onClose={() => setModal({ open: false, mode: 'add', row: null })}
        existingRecords={units}
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

export default UnitMasterList;
