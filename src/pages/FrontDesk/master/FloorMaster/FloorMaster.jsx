import React, { useState, useEffect, useCallback } from 'react';
import CommonTable from '../../../../components/common/CommonTable';
import DeleteConfirmationModal from '../../../../components/common/DeleteConfirmationModal';
import FloorMasterForm from './FloorMasterForm';
import { floorService } from '../../../../services/floorService';

const columns = [
  { key: 'name', label: 'Floor Name' },
  { key: 'active', label: 'Active', renderStatus: true },
  { key: 'action', label: 'Action', sortable: false },
];

const EMPTY_MODAL = { open: false, mode: 'add', row: null };
const EMPTY_DELETE = { open: false, row: null };

const FloorMaster = ({ showToast }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(EMPTY_MODAL);
  const [deleteModal, setDeleteModal] = useState(EMPTY_DELETE);

  const notify = useCallback((msg, type = 'success') => {
    if (typeof showToast === 'function') {
      showToast(msg);
    } else if (window.showToast) {
      window.showToast(msg, type);
    }
  }, [showToast]);

  // Load floors from backend database
  const loadFloors = useCallback(async () => {
    try {
      setLoading(true);
      const res = await floorService.getFloors();
      const list = res?.data || res?.floors || (Array.isArray(res) ? res : []);
      setData(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Error loading floors from backend:', err);
      notify(err.message || 'Failed to load floors', 'error');
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    loadFloors();
  }, [loadFloors]);

  const openAdd = () => {
    setModal({ open: true, mode: 'add', row: null });
  };

  const openEdit = (row) => {
    setModal({ open: true, mode: 'edit', row });
  };

  const closeModal = () => setModal(EMPTY_MODAL);

  const handleSave = async (savedData) => {
    if (!savedData || !savedData.name?.trim()) {
      notify('Floor Name is required', 'error');
      return;
    }

    try {
      if (modal.mode === 'add') {
        const res = await floorService.createFloor({
          name: savedData.name.trim(),
          active: savedData.active || 'Yes'
        });
        notify(res?.message || 'Floor added successfully!');
      } else {
        const res = await floorService.updateFloor(modal.row.id, {
          name: savedData.name.trim(),
          active: savedData.active || 'Yes'
        });
        notify(res?.message || 'Floor updated successfully!');
      }
      closeModal();
      await loadFloors();
      window.dispatchEvent(new CustomEvent('floorsMasterRefreshed'));
      window.dispatchEvent(new CustomEvent('tableMasterSync'));
    } catch (err) {
      console.error('Error saving floor:', err);
      const errMsg = err.response?.data?.message || err.message || 'Failed to save floor';
      notify(errMsg, 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.row?.id) return;
    try {
      const res = await floorService.deleteFloor(deleteModal.row.id);
      notify(res?.message || 'Floor deleted successfully!');
      setDeleteModal(EMPTY_DELETE);
      await loadFloors();
      window.dispatchEvent(new CustomEvent('floorsMasterRefreshed'));
      window.dispatchEvent(new CustomEvent('tableMasterSync'));
    } catch (err) {
      console.error('Error deleting floor:', err);
      const errMsg = err.response?.data?.message || err.message || 'Failed to delete floor';
      notify(errMsg, 'error');
    }
  };

  return (
    <>
      <CommonTable
        title="Floor Master"
        columns={columns}
        data={data}
        loading={loading}
        actions={[
          { label: 'Edit', onClick: openEdit },
          { label: 'Delete', isDanger: true, onClick: (row) => setDeleteModal({ open: true, row }) },
        ]}
        onAddEntry={openAdd}
        addEntryLabel="+ Add Floor"
        searchPlaceholder="Search Floor Master..."
        showToast={showToast}
        breadcrumbs={['Dashboard', 'Front Desk', 'Master', 'Floor Master']}
      />

      {/* Add / Edit Floor Modal */}
      {modal.open && (
        <FloorMasterForm
          isOpen={modal.open}
          mode={modal.mode}
          initialData={modal.row}
          existingRecords={data}
          onSave={handleSave}
          onClose={closeModal}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.open && (
        <DeleteConfirmationModal
          isOpen={deleteModal.open}
          onClose={() => setDeleteModal(EMPTY_DELETE)}
          onConfirm={handleDelete}
          itemName={deleteModal.row?.name || 'this floor'}
        />
      )}
    </>
  );
};

export default FloorMaster;
