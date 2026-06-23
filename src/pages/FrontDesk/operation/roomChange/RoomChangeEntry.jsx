import React, { useState } from 'react';
import CommonTable from '../../../../components/common/CommonTable';
import DeleteConfirmationModal from '../../../../components/common/DeleteConfirmationModal';
import RoomChangeEntryForm from './RoomChangeEntryForm';

const RoomChangeEntry = ({ showToast }) => {
  const [data, setData] = useState([
    { id: 1, folioNo: 'FL-4051', fromRoom: '101', toRoom: '202', changeDate: '2026-06-22', reason: 'AC not cooling properly in 101.', active: 'Yes' },
    { id: 2, folioNo: 'FL-4052', fromRoom: '104', toRoom: '105', changeDate: '2026-06-22', reason: 'Guest upgraded to larger room.', active: 'Yes' },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState({ mode: 'add', row: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, row: null });

  const columns = [
    { key: 'folioNo', label: 'Folio No' },
    { key: 'fromRoom', label: 'From Room' },
    { key: 'toRoom', label: 'To Room' },
    { key: 'changeDate', label: 'Change Date' },
    { key: 'reason', label: 'Reason for Change' },
    { key: 'active', label: 'Active', renderStatus: true },
    { key: 'action', label: 'Action', sortable: false },
  ];

  const handleSave = (formData) => {
    if (editMode.mode === 'add') {
      setData(prev => [...prev, { ...formData, id: Date.now() }]);
      showToast('Room change entry recorded successfully!');
    } else {
      setData(prev => prev.map(item => item.id === editMode.row.id ? { ...formData, id: item.id } : item));
      showToast('Room change entry updated successfully!');
    }
    setShowForm(false);
  };

  const handleDelete = () => {
    setData(prev => prev.filter(item => item.id !== deleteModal.row.id));
    showToast('Room change entry deleted.');
    setDeleteModal({ open: false, row: null });
  };

  if (showForm) {
    return (
      <RoomChangeEntryForm
        mode={editMode.mode}
        initialData={editMode.row}
        onSave={handleSave}
        onCancel={() => setShowForm(false)}
      />
    );
  }

  return (
    <>
      <CommonTable
        title="Room Change Entry"
        columns={columns}
        data={data}
        actions={[
          { label: 'Edit', onClick: (row) => { setEditMode({ mode: 'edit', row }); setShowForm(true); } },
          { label: 'Delete', isDanger: true, onClick: (row) => setDeleteModal({ open: true, row }) },
        ]}
        onAddEntry={() => { setEditMode({ mode: 'add', row: null }); setShowForm(true); }}
        addEntryLabel="+ Add Room Change"
        searchPlaceholder="Search folio, from/to room or reason..."
        showToast={showToast}
        breadcrumbs={['Dashboard', 'Front Desk', 'Operation', 'Room Change Entry']}
      />

      <DeleteConfirmationModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, row: null })}
        onConfirm={handleDelete}
        itemName={`Folio ${deleteModal.row?.folioNo} (Room ${deleteModal.row?.fromRoom} -> ${deleteModal.row?.toRoom})`}
      />
    </>
  );
};

export default RoomChangeEntry;
