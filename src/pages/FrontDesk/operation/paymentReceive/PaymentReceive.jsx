import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import CommonTable from '../../../../components/common/CommonTable';
import DeleteConfirmationModal from '../../../../components/common/DeleteConfirmationModal';
import PaymentReceiveForm from './PaymentReceiveForm';

import FormLoadingWrapper from '../../../../components/common/FormLoadingWrapper';

const PaymentReceive = ({ showToast }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [data, setData] = useState([
    { id: 1, folioNo: 'FL-2021', guestName: 'Amit Verma', roomNo: '102', paymentMode: 'UPI', amount: 5000, receiptNo: 'RCP-5501', date: '2026-06-22', active: 'Yes' },
    { id: 2, folioNo: 'FL-2022', guestName: 'Zeenat Khan', roomNo: '105', paymentMode: 'Card', amount: 12000, receiptNo: 'RCP-5502', date: '2026-06-22', active: 'Yes' },
    { id: 3, folioNo: 'FL-2023', guestName: 'Jessica Alva', roomNo: '304', paymentMode: 'Cash', amount: 3500, receiptNo: 'RCP-5503', date: '2026-06-21', active: 'No' },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState({ mode: 'add', row: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, row: null });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('add') === 'true') {
      const rowData = {};
      params.forEach((value, key) => {
        if (key !== 'add') {
          rowData[key] = value;
        }
      });
      setEditMode({ mode: 'add', row: Object.keys(rowData).length ? rowData : null });
      setShowForm(true);
    }
  }, [location]);

  const columns = [
    { key: 'folioNo', label: 'Folio No' },
    { key: 'guestName', label: 'Guest Name' },
    { key: 'roomNo', label: 'Room No' },
    { key: 'paymentMode', label: 'Payment Mode' },
    { key: 'amount', label: 'Amount Recieved' },
    { key: 'receiptNo', label: 'Receipt No' },
    { key: 'date', label: 'Payment Date' },
    { key: 'active', label: 'Active', renderStatus: true },
    { key: 'action', label: 'Action', sortable: false },
  ];

  const handleSave = (formData) => {
    if (editMode.mode === 'add') {
      setData(prev => [...prev, { ...formData, id: Date.now() }]);
      showToast('Payment receive entry added successfully!');
    } else {
      setData(prev => prev.map(item => item.id === editMode.row.id ? { ...formData, id: item.id } : item));
      showToast('Payment receive entry updated successfully!');
    }
    setShowForm(false);
  };

  const handleDelete = () => {
    setData(prev => prev.filter(item => item.id !== deleteModal.row.id));
    showToast('Payment entry deleted.');
    setDeleteModal({ open: false, row: null });
  };

  const handleCancel = () => {
    if (location.state?.returnTo) {
      navigate(location.state.returnTo);
    } else {
      setShowForm(false);
    }
  };

  if (showForm) {
    return (
      <FormLoadingWrapper>
        <PaymentReceiveForm
          mode={editMode.mode}
          initialData={editMode.row}
          onSave={handleSave}
          onCancel={handleCancel}
          existingRecords={data}
        />
      </FormLoadingWrapper>
    );
  }

  return (
    <>
      <CommonTable
        title="Payment Recieve Entry"
        columns={columns}
        data={data}
        actions={[
          { label: 'Edit', onClick: (row) => { setEditMode({ mode: 'edit', row }); setShowForm(true); } },
          { label: 'Delete', isDanger: true, onClick: (row) => setDeleteModal({ open: true, row }) },
        ]}
        onAddEntry={() => { setEditMode({ mode: 'add', row: null }); setShowForm(true); }}
        addEntryLabel="+ Add Payment Receive"
        searchPlaceholder="Search folio, guest or receipt..."
        showToast={showToast}
        breadcrumbs={['Dashboard', 'Front Desk', 'Operation', 'Payment Recieve Entry']}
      />

      <DeleteConfirmationModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, row: null })}
        onConfirm={handleDelete}
        itemName={deleteModal.row?.receiptNo}
      />
    </>
  );
};

export default PaymentReceive;
