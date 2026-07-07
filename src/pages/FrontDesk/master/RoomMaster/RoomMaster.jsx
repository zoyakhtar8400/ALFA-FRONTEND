import React, { useState } from 'react';
import CommonTable from '../../../../components/common/CommonTable';
import DeleteConfirmationModal from '../../../../components/common/DeleteConfirmationModal';
import RoomMasterForm from './RoomMasterForm';

import FormLoadingWrapper from '../../../../components/common/FormLoadingWrapper';

const RoomMaster = ({ showToast }) => {
  const [data, setData] = useState([
    { id: 1, roomNo: '101', name: 'Room 101', floor: 'First Floor', category: 'Standard Comfort Room', includeInCount: 'Yes', active: 'Yes', features: 'Air Conditioning, LED Television' },
    { id: 2, roomNo: '102', name: 'Room 102', floor: 'First Floor', category: 'Standard Comfort Room', includeInCount: 'Yes', active: 'Yes', features: 'Air Conditioning, LED Television' },
    { id: 3, roomNo: '201', name: 'Room 201', floor: 'Second Floor', category: 'Premium Deluxe King Room', includeInCount: 'Yes', active: 'Yes', features: 'Air Conditioning, LED Television, Mini Bar, Ocean Front View Balcony' },
    { id: 4, roomNo: '301', name: 'Room 301', floor: 'Third Floor', category: 'Presidential Penthouse Suite', includeInCount: 'Yes', active: 'Yes', features: 'Air Conditioning, LED Television, Mini Bar, Private Jacuzzi Tub, Ocean Front View Balcony' },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState({ mode: 'add', row: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, row: null });

  const columns = [
    { key: 'roomNo', label: 'Room No' },
    { key: 'name', label: 'Room Name' },
    { key: 'floor', label: 'Floor' },
    { key: 'category', label: 'Category' },
    { key: 'features', label: 'Features' },
    { key: 'active', label: 'Active', renderStatus: true },
    { key: 'action', label: 'Action', sortable: false },
  ];

  const handleSave = (formData) => {
    if (editMode.mode === 'add') {
      setData(prev => [...prev, { ...formData, id: Date.now() }]);
      showToast('Room added successfully!');
    } else {
      setData(prev => prev.map(r => r.id === editMode.row.id ? { ...formData, id: r.id } : r));
      showToast('Room updated successfully!');
    }
    setShowForm(false);
  };

  const handleDelete = () => {
    setData(prev => prev.filter(r => r.id !== deleteModal.row.id));
    showToast('Room deleted.');
    setDeleteModal({ open: false, row: null });
  };

  if (showForm) {
    return (
      <FormLoadingWrapper>
        <RoomMasterForm
          mode={editMode.mode}
          initialData={editMode.row}
          onSave={handleSave}
          onCancel={() => setShowForm(false)}
          existingRecords={data}
        />
      </FormLoadingWrapper>
    );
  }

  return (
    <>
      <CommonTable
        title="Room Master"
        columns={columns}
        data={data}
        actions={[
          { label: 'Edit', onClick: (row) => { setEditMode({ mode: 'edit', row }); setShowForm(true); } },
          { label: 'Delete', isDanger: true, onClick: (row) => setDeleteModal({ open: true, row }) },
        ]}
        onAddEntry={() => { setEditMode({ mode: 'add', row: null }); setShowForm(true); }}
        addEntryLabel="+ Add Room"
        searchPlaceholder="Search rooms..."
        showToast={showToast}
        breadcrumbs={['Dashboard', 'Front Desk', 'Room Master']}
      />

      <DeleteConfirmationModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, row: null })}
        onConfirm={handleDelete}
        itemName={deleteModal.row?.roomNo ? `Room ${deleteModal.row.roomNo}` : 'this room'}
      />
    </>
  );
};

export default RoomMaster;
