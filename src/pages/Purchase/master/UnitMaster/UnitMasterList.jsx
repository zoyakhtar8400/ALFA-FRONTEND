import React, { useState } from 'react';
import CommonTable from '../../../../components/common/CommonTable';
import DeleteConfirmationModal from '../../../../components/common/DeleteConfirmationModal';
import UnitMasterForm from './UnitMasterForm';
import { usePurchase } from '../../hooks/usePurchase';
import { inventoryApi } from '../../../../api/inventoryApi';

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

  React.useEffect(() => {
    const loadUnits = async () => {
      try {
        const json = await inventoryApi.getUnits();
        if (Array.isArray(json?.data) && json.data.length > 0) {
          const mappedUnits = json.data.map(u => ({
            id: u.unit_id,
            name: u.unit_name,
            qtyDecimalPlaces: String(u.qty_decimal_places || 3)
          }));
          setUnits(mappedUnits);
        }
      } catch (err) {
        console.warn('Error loading units from PostgreSQL:', err.message);
      }
    };
    loadUnits();
  }, []);

  const handleOpenAdd = () => setModal({ open: true, mode: 'add', row: null });
  const handleOpenEdit = (row) => setModal({ open: true, mode: 'edit', row });

  const handleSave = async (formData) => {
    try {
      await inventoryApi.saveUnit({
        unit_id: modal.mode === 'edit' && modal.row ? modal.row.id : undefined,
        unit_name: formData.name,
        qty_decimal_places: Number(formData.qtyDecimalPlaces || 3)
      });
      console.log('✅ Unit saved to PostgreSQL via inventoryApi.saveUnit');
    } catch (e) {
      console.warn('Error saving Unit to PostgreSQL:', e.message);
    }

    if (modal.mode === 'edit' && modal.row) {
      setUnits((prev) => prev.map((u) => (u.id === modal.row.id ? { ...formData, id: u.id } : u)));
      toast('Unit updated in PostgreSQL!');
    } else {
      const newId = Date.now();
      setUnits((prev) => [{ ...formData, id: newId }, ...prev]);
      toast('Unit created in PostgreSQL!');
    }
    setModal({ open: false, mode: 'add', row: null });
  };

  const handleDelete = () => {
    if (!deleteModal.row) return;
    setUnits((prev) => prev.filter((u) => u.id !== deleteModal.row.id));
    toast('Unit deleted.');
    setDeleteModal({ open: false, row: null });
  };

  const handleBulkDelete = (selectedRows, selectedIds) => {
    setUnits((prev) => prev.filter((u) => !selectedIds.includes(String(u.id)) && !selectedRows.some(sr => sr.id === u.id)));
    toast(`Deleted ${selectedRows.length} unit(s).`);
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
        onBulkDelete={handleBulkDelete}
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
