import React, { useState } from 'react';
import CommonTable from '../../../../components/common/CommonTable';
import DeleteConfirmationModal from '../../../../components/common/DeleteConfirmationModal';

const MultiRoomCheckout = ({ showToast }) => {
  const [data, setData] = useState([
    { id: 1, grcNo: 'GRC-1001', guestName: 'Rajan Mehta', roomNo: '101, 102', checkinDate: '2026-06-18', checkoutDate: '2026-06-22', totalBill: '₹28,400', paymentStatus: 'Pending', active: 'Yes' },
    { id: 2, grcNo: 'GRC-1002', guestName: 'Priya Sharma', roomNo: '205, 206, 207', checkinDate: '2026-06-19', checkoutDate: '2026-06-22', totalBill: '₹45,600', paymentStatus: 'Paid', active: 'Yes' },
    { id: 3, grcNo: 'GRC-1003', guestName: 'Amit Patel', roomNo: '310, 311', checkinDate: '2026-06-20', checkoutDate: '2026-06-22', totalBill: '₹18,900', paymentStatus: 'Pending', active: 'Yes' },
  ]);
  const [deleteModal, setDeleteModal] = useState({ open: false, row: null });

  const columns = [
    { key: 'grcNo', label: 'GRC No' },
    { key: 'guestName', label: 'Guest Name' },
    { key: 'roomNo', label: 'Room No(s)' },
    { key: 'checkinDate', label: 'Check-In' },
    { key: 'checkoutDate', label: 'Check-Out' },
    { key: 'totalBill', label: 'Total Bill' },
    { key: 'paymentStatus', label: 'Payment Status' },
    { key: 'active', label: 'Active', renderStatus: true },
    { key: 'action', label: 'Action', sortable: false },
  ];

  const handleDelete = () => {
    setData(prev => prev.filter(item => item.id !== deleteModal.row.id));
    showToast('Record deleted successfully.');
    setDeleteModal({ open: false, row: null });
  };

  return (
    <>
      <CommonTable
        title="Multi Room Checkout"
        columns={columns}
        data={data}
        actions={[
          {
            label: 'Checkout',
            onClick: (row) => showToast(`Checkout initiated for ${row.guestName}`),
          },
          {
            label: 'Delete',
            isDanger: true,
            onClick: (row) => setDeleteModal({ open: true, row }),
          },
        ]}
        searchPlaceholder="Search by guest name, GRC No, or room..."
        showToast={showToast}
        breadcrumbs={['Dashboard', 'Front Desk', 'Operation', 'Multi Room Checkout']}
      />

      <DeleteConfirmationModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, row: null })}
        onConfirm={handleDelete}
        itemName={deleteModal.row?.guestName}
      />
    </>
  );
};

export default MultiRoomCheckout;
