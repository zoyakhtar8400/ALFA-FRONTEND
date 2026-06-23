import React, { useState } from 'react';
import CommonTable from '../../../../components/common/CommonTable';
import DeleteConfirmationModal from '../../../../components/common/DeleteConfirmationModal';
import CheckoutEntryForm from './CheckoutEntryForm';

const CheckoutEntry = ({ showToast }) => {
  const [data, setData] = useState([
    { id: 1, folioNo: 'FL-8001', guestName: 'Harish Mehta', roomNo: '102', checkoutDate: '2026-06-22', totalAmount: 18500, discount: 1000, netAmount: 17500, paymentMode: 'Card', active: 'Yes' },
    { id: 2, folioNo: 'FL-8002', guestName: 'Alia Bhatt', roomNo: '301', checkoutDate: '2026-06-22', totalAmount: 32000, discount: 2000, netAmount: 30000, paymentMode: 'UPI', active: 'Yes' },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState({ mode: 'add', row: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, row: null });

  const columns = [
    { key: 'folioNo', label: 'Folio No' },
    { key: 'guestName', label: 'Guest Name' },
    { key: 'roomNo', label: 'Room No' },
    { key: 'checkoutDate', label: 'Checkout Date' },
    { key: 'totalAmount', label: 'Total Bill' },
    { key: 'discount', label: 'Discount' },
    { key: 'netAmount', label: 'Net Amount' },
    { key: 'paymentMode', label: 'Payment Mode' },
    { key: 'active', label: 'Active', renderStatus: true },
    { key: 'action', label: 'Action', sortable: false },
  ];

  const handleSave = (formData) => {
    if (editMode.mode === 'add') {
      setData(prev => [...prev, { ...formData, id: Date.now() }]);
      showToast('Checkout entry saved successfully!');
    } else {
      setData(prev => prev.map(item => item.id === editMode.row.id ? { ...formData, id: item.id } : item));
      showToast('Checkout entry updated successfully!');
    }
    setShowForm(false);
  };

  const handleDelete = () => {
    setData(prev => prev.filter(item => item.id !== deleteModal.row.id));
    showToast('Checkout entry deleted.');
    setDeleteModal({ open: false, row: null });
  };

  if (showForm) {
    return (
      <CheckoutEntryForm
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
        title="Checkout Entry"
        columns={columns}
        data={data}
        actions={[
          { label: 'Edit', onClick: (row) => { setEditMode({ mode: 'edit', row }); setShowForm(true); } },
          { label: 'Delete', isDanger: true, onClick: (row) => setDeleteModal({ open: true, row }) },
        ]}
        onAddEntry={() => { setEditMode({ mode: 'add', row: null }); setShowForm(true); }}
        addEntryLabel="+ Add Checkout Entry"
        searchPlaceholder="Search checkout folio, room or guest..."
        showToast={showToast}
        breadcrumbs={['Dashboard', 'Front Desk', 'Operation', 'Checkout Entry']}
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

export default CheckoutEntry;
