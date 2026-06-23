import React, { useState } from 'react';
import CommonTable from '../../../../components/common/CommonTable';
import DeleteConfirmationModal from '../../../../components/common/DeleteConfirmationModal';
import RefundEntryForm from './RefundEntryForm';

const RefundEntry = ({ showToast }) => {
  const [data, setData] = useState([
    { id: 1, folioNo: 'FL-9011', guestName: 'Karan Mehra', roomNo: '104', refundAmount: 1500, reason: 'Advance booking cancellation.', paymentMode: 'UPI', active: 'Yes' },
    { id: 2, folioNo: 'FL-9012', guestName: 'Samantha Ruth', roomNo: '202', refundAmount: 2000, reason: 'Charged double for extra bed.', paymentMode: 'Cash', active: 'Yes' },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState({ mode: 'add', row: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, row: null });

  const columns = [
    { key: 'folioNo', label: 'Folio No' },
    { key: 'guestName', label: 'Guest Name' },
    { key: 'roomNo', label: 'Room No' },
    { key: 'refundAmount', label: 'Refund Amount' },
    { key: 'reason', label: 'Reason for Refund' },
    { key: 'paymentMode', label: 'Refund Mode' },
    { key: 'active', label: 'Active', renderStatus: true },
    { key: 'action', label: 'Action', sortable: false },
  ];

  const handleSave = (formData) => {
    if (editMode.mode === 'add') {
      setData(prev => [...prev, { ...formData, id: Date.now() }]);
      showToast('Refund entry added successfully!');
    } else {
      setData(prev => prev.map(item => item.id === editMode.row.id ? { ...formData, id: item.id } : item));
      showToast('Refund entry updated successfully!');
    }
    setShowForm(false);
  };

  const handleDelete = () => {
    setData(prev => prev.filter(item => item.id !== deleteModal.row.id));
    showToast('Refund entry deleted.');
    setDeleteModal({ open: false, row: null });
  };

  if (showForm) {
    return (
      <RefundEntryForm
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
        title="Refund Entry"
        columns={columns}
        data={data}
        actions={[
          { label: 'Edit', onClick: (row) => { setEditMode({ mode: 'edit', row }); setShowForm(true); } },
          { label: 'Delete', isDanger: true, onClick: (row) => setDeleteModal({ open: true, row }) },
        ]}
        onAddEntry={() => { setEditMode({ mode: 'add', row: null }); setShowForm(true); }}
        addEntryLabel="+ Add Refund Entry"
        searchPlaceholder="Search refund folio, guest or reason..."
        showToast={showToast}
        breadcrumbs={['Dashboard', 'Front Desk', 'Operation', 'Refund Entry']}
      />

      <DeleteConfirmationModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, row: null })}
        onConfirm={handleDelete}
        itemName={`Folio ${deleteModal.row?.folioNo} - Room ${deleteModal.row?.roomNo}`}
      />
    </>
  );
};

export default RefundEntry;
