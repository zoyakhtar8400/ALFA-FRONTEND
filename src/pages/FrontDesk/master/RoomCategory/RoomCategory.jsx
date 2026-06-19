import React, { useState } from 'react';
import Table from '../../../../components/common/Table';
import ConfirmModal from '../../../../components/common/ConfirmModal';
import RoomCategoryForm from './RoomCategoryForm';

const RoomCategory = ({ showToast }) => {
  const [data, setData] = useState([
    { id: 1, name: 'Standard Comfort Room', shortName: 'STD', noOfRoom: '10', singleRate: '100.00', doubleRate: '120.00', active: 'Yes' },
    { id: 2, name: 'Premium Deluxe King Room', shortName: 'DLX', noOfRoom: '8', singleRate: '200.00', doubleRate: '220.00', active: 'Yes' },
    { id: 3, name: 'Presidential Penthouse Suite', shortName: 'SUT', noOfRoom: '3', singleRate: '400.00', doubleRate: '450.00', active: 'Yes' },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState({ mode: 'add', row: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, row: null });

  const columns = [
    { key: 'name', label: 'Category Name' },
    { key: 'shortName', label: 'Short Name' },
    { key: 'noOfRoom', label: 'No. of Room' },
    { key: 'singleRate', label: 'Single Rate' },
    { key: 'doubleRate', label: 'Double Rate' },
    { key: 'active', label: 'Active', renderStatus: true },
    { key: 'action', label: 'Action', sortable: false },
  ];

  const handleSave = (formData) => {
    if (editMode.mode === 'add') {
      setData(prev => [...prev, { ...formData, id: Date.now() }]);
      showToast('Room Category added!');
    } else {
      setData(prev => prev.map(r => r.id === editMode.row.id ? { ...formData, id: r.id } : r));
      showToast('Room Category updated!');
    }
    setShowForm(false);
  };

  const handleDelete = () => {
    setData(prev => prev.filter(r => r.id !== deleteModal.row.id));
    showToast('Category deleted.');
    setDeleteModal({ open: false, row: null });
  };

  if (showForm) {
    return (
      <RoomCategoryForm
        mode={editMode.mode}
        initialData={editMode.row}
        onSave={handleSave}
        onCancel={() => setShowForm(false)}
      />
    );
  }

  return (
    <>
      <Table
        title="Room Category"
        columns={columns}
        data={data}
        actions={[
          { label: 'Edit', onClick: (row) => { setEditMode({ mode: 'edit', row }); setShowForm(true); } },
          { label: 'Delete', isDanger: true, onClick: (row) => setDeleteModal({ open: true, row }) },
        ]}
        onAddEntry={() => { setEditMode({ mode: 'add', row: null }); setShowForm(true); }}
        addEntryLabel="+ Add Category"
        searchPlaceholder="Search categories..."
        showToast={showToast}
      />

      <ConfirmModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, row: null })}
        onConfirm={handleDelete}
        message={`Delete "${deleteModal.row?.name}"? This cannot be undone.`}
      />
    </>
  );
};

export default RoomCategory;
