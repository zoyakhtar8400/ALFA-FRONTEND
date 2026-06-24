import React, { useState } from 'react';
import CommonTable from '../../../../components/common/CommonTable';
import DeleteConfirmationModal from '../../../../components/common/DeleteConfirmationModal';
import BookingForm from './BookingForm';

const Booking = ({ showToast, onlyList = false }) => {
  const [data, setData] = useState([
    { id: 1, bookingNo: 'BK-1001', guestName: 'Rohan Sharma', roomCategory: 'Deluxe Room', checkIn: '2026-06-22', checkOut: '2026-06-25', adults: 2, children: 1, mealPlan: 'CP (Bed & Breakfast)', ratePlan: 'Standard Rate', advance: 3000, remarks: 'Require airport pickup.', active: 'Yes' },
    { id: 2, bookingNo: 'BK-1002', guestName: 'Amanda Smith', roomCategory: 'Executive Suite', checkIn: '2026-06-24', checkOut: '2026-06-28', adults: 2, children: 0, mealPlan: 'MAP (Half Board)', ratePlan: 'Seasonal Offer', advance: 8000, remarks: 'High floor preferred.', active: 'Yes' },
    { id: 3, bookingNo: 'BK-1003', guestName: 'Vikram Malhotra', roomCategory: 'Super Deluxe', checkIn: '2026-06-25', checkOut: '2026-06-26', adults: 1, children: 0, mealPlan: 'EP (Room Only)', ratePlan: 'Corporate Rate', advance: 0, remarks: 'Early check-in requested.', active: 'No' },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState({ mode: 'add', row: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, row: null });

  const columns = [
    { key: 'bookingNo', label: 'Booking No' },
    { key: 'guestName', label: 'Guest Name' },
    { key: 'roomCategory', label: 'Room Category' },
    { key: 'checkIn', label: 'Check-In' },
    { key: 'checkOut', label: 'Check-Out' },
    { key: 'mealPlan', label: 'Meal Plan' },
    { key: 'advance', label: 'Advance Paid' },
    { key: 'active', label: 'Active', renderStatus: true },
    ...(onlyList ? [] : [{ key: 'action', label: 'Action', sortable: false }]),
  ];

  const handleSave = (formData) => {
    if (editMode.mode === 'add') {
      setData(prev => [...prev, { ...formData, id: Date.now() }]);
      showToast('Booking added successfully!');
    } else {
      setData(prev => prev.map(item => item.id === editMode.row.id ? { ...formData, id: item.id } : item));
      showToast('Booking updated successfully!');
    }
    setShowForm(false);
  };

  const handleDelete = () => {
    setData(prev => prev.filter(item => item.id !== deleteModal.row.id));
    showToast('Booking cancelled/deleted.');
    setDeleteModal({ open: false, row: null });
  };

  if (showForm) {
    return (
      <BookingForm
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
        title="Booking"
        columns={columns}
        data={data}
        actions={onlyList ? [] : [
          { label: 'Edit', onClick: (row) => { setEditMode({ mode: 'edit', row }); setShowForm(true); } },
          { label: 'Delete', isDanger: true, onClick: (row) => setDeleteModal({ open: true, row }) },
        ]}
        onAddEntry={onlyList ? null : () => { setEditMode({ mode: 'add', row: null }); setShowForm(true); }}
        addEntryLabel="+ Add Booking"
        searchPlaceholder="Search bookings..."
        showToast={showToast}
        breadcrumbs={['Dashboard', 'Front Desk', 'Operation', 'Booking']}
        onlyTable={onlyList}
      />

      <DeleteConfirmationModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, row: null })}
        onConfirm={handleDelete}
        itemName={deleteModal.row?.bookingNo}
      />
    </>
  );
};

export default Booking;
