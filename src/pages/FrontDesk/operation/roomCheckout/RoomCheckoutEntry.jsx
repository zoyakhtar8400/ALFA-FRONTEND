import React, { useState } from 'react';
import CommonTable from '../../../../components/common/CommonTable';
import DeleteConfirmationModal from '../../../../components/common/DeleteConfirmationModal';
import CommonModal from '../../../../components/common/CommonModal';
import RoomCheckoutEntryForm from './RoomCheckoutEntryForm';

const RoomCheckoutEntry = ({ showToast }) => {
  const [data, setData] = useState([
    { id: 1, roomNo: '101', folioNo: 'FL-1002', guestName: 'Rajesh Sen', expectedCheckout: '2026-06-22', actualCheckout: '2026-06-22', active: 'Yes' },
    { id: 2, roomNo: '204', folioNo: 'FL-1005', guestName: 'Maria Sharapova', expectedCheckout: '2026-06-22', actualCheckout: '2026-06-22', active: 'Yes' },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState({ mode: 'add', row: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, row: null });

  const columns = [
    { key: 'roomNo', label: 'Room No' },
    { key: 'folioNo', label: 'Folio No' },
    { key: 'guestName', label: 'Guest Name' },
    { key: 'expectedCheckout', label: 'Expected Checkout' },
    { key: 'actualCheckout', label: 'Actual Checkout' },
    { key: 'active', label: 'Active', renderStatus: true },
    { key: 'action', label: 'Action', sortable: false },
  ];

  const handleSave = (formData) => {
    if (editMode.mode === 'add') {
      setData(prev => [...prev, { ...formData, id: Date.now() }]);
      showToast('Room checkout entry created successfully!');
    } else {
      setData(prev => prev.map(item => item.id === editMode.row.id ? { ...formData, id: item.id } : item));
      showToast('Room checkout entry updated successfully!');
    }
    setShowForm(false);
  };

  const handleDelete = () => {
    setData(prev => prev.filter(item => item.id !== deleteModal.row.id));
    showToast('Room checkout entry deleted.');
    setDeleteModal({ open: false, row: null });
  };

  return (
    <>
      <CommonTable
        title="Room Checkout Entry"
        columns={columns}
        data={data}
        actions={[
          { label: 'Edit', onClick: (row) => { setEditMode({ mode: 'edit', row }); setShowForm(true); } },
          { label: 'Delete', isDanger: true, onClick: (row) => setDeleteModal({ open: true, row }) },
        ]}
        onAddEntry={() => { setEditMode({ mode: 'add', row: null }); setShowForm(true); }}
        addEntryLabel="+ Add Room Checkout"
        searchPlaceholder="Search room, folio or guest..."
        showToast={showToast}
        breadcrumbs={['Dashboard', 'Front Desk', 'Operation', 'Room Checkout Entry']}
      />

      <CommonModal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editMode.mode === 'add' ? 'Add Room Checkout' : 'Edit Room Checkout'}
        maxWidth="540px"
      >
        <RoomCheckoutEntryForm
          mode={editMode.mode}
          initialData={editMode.row}
          onSave={handleSave}
          onCancel={() => setShowForm(false)}
          existingRecords={data}
        />
      </CommonModal>

      <DeleteConfirmationModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, row: null })}
        onConfirm={handleDelete}
        itemName={`Room ${deleteModal.row?.roomNo} - Folio ${deleteModal.row?.folioNo}`}
      />
    </>
  );
};

export default RoomCheckoutEntry;
