import React, { useState } from 'react';
import CommonTable from '../../../../components/common/CommonTable';
import DeleteConfirmationModal from '../../../../components/common/DeleteConfirmationModal';
import RoomChangeEntryForm from './RoomChangeEntryForm';

import FormLoadingWrapper from '../../../../components/common/FormLoadingWrapper';

const RoomChangeEntry = ({ showToast }) => {
  const [data, setData] = useState([
    { id: 1, voucherNo: 'RCH-1001', date: '2026-06-22', grcNo: 'GRC-1001', roomNo: '101', guestName: 'Rajan Mehta', adult: 1, child: 0, plan: 'EP', rate: '2500', taxInclusive: 'No', newRoom: '202', changeDate: '2026-06-22', changeTime: '14:30', newPlan: 'EP', newAdult: 1, newChild: 0, newRate: '2500', newTaxInclusive: 'No', discountPercent: '', reason: 'AC not cooling properly in 101.', active: 'Yes' },
    { id: 2, voucherNo: 'RCH-1002', date: '2026-06-22', grcNo: 'GRC-1002', roomNo: '104', guestName: 'Maria Sharapova', adult: 2, child: 1, plan: 'CP', rate: '4500', taxInclusive: 'Yes', newRoom: '105', changeDate: '2026-06-22', changeTime: '15:10', newPlan: 'CP', newAdult: 2, newChild: 1, newRate: '4500', newTaxInclusive: 'Yes', discountPercent: '', reason: 'Guest upgraded to larger room.', active: 'Yes' },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState({ mode: 'add', row: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, row: null });

  const columns = [
    { key: 'voucherNo', label: 'Voucher No' },
    { key: 'date', label: 'Date' },
    { key: 'grcNo', label: 'GRC No' },
    { key: 'roomNo', label: 'From Room' },
    { key: 'newRoom', label: 'To Room' },
    { key: 'guestName', label: 'Guest Name' },
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
      <FormLoadingWrapper>
        <RoomChangeEntryForm
          mode={editMode.mode}
          initialData={editMode.row}
          onSave={handleSave}
          onCancel={() => setShowForm(false)}
        />
      </FormLoadingWrapper>
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
        searchPlaceholder="Search by guest, room, or reason..."
        showToast={showToast}
        breadcrumbs={['Dashboard', 'Front Desk', 'Operation', 'Room Change Entry']}
      />

      <DeleteConfirmationModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, row: null })}
        onConfirm={handleDelete}
        itemName={`Voucher ${deleteModal.row?.voucherNo} (Room ${deleteModal.row?.roomNo} -> ${deleteModal.row?.newRoom})`}
      />
    </>
  );
};

export default RoomChangeEntry;
