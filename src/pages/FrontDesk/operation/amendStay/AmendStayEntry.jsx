import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import CommonTable from '../../../../components/common/CommonTable';
import DeleteConfirmationModal from '../../../../components/common/DeleteConfirmationModal';
import AmendStayForm from './AmendStayForm';
import FormLoadingWrapper from '../../../../components/common/FormLoadingWrapper';

const AmendStayEntry = ({ showToast }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [data, setData] = useState([
    { id: 1, grcNo: 'GRC-119', guestName: 'PRAMOD MISHRA', roomNo: '104', originalDeparture: '2026-06-30', amendedDeparture: '2026-07-05', reason: 'Extended business trip', status: 'Approved', active: 'Yes' },
    { id: 2, grcNo: 'GRC-120', guestName: 'Sarah Wilson', roomNo: '201', originalDeparture: '2026-07-01', amendedDeparture: '2026-07-03', reason: 'Personal request', status: 'Pending', active: 'Yes' },
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
    { key: 'grcNo', label: 'GRC No' },
    { key: 'guestName', label: 'Guest Name' },
    { key: 'roomNo', label: 'Room No' },
    { key: 'originalDeparture', label: 'Original Departure' },
    { key: 'amendedDeparture', label: 'Amended Departure' },
    { key: 'reason', label: 'Reason' },
    { key: 'status', label: 'Status', renderStatus: true },
    { key: 'active', label: 'Active', renderStatus: true },
    { key: 'action', label: 'Action', sortable: false },
  ];

  const handleSave = (formData) => {
    if (editMode.mode === 'add') {
      setData(prev => [...prev, { ...formData, id: Date.now() }]);
      showToast('Amend stay saved successfully!');
    } else {
      setData(prev => prev.map(item => item.id === editMode.row.id ? { ...formData, id: item.id } : item));
      showToast('Amend stay updated successfully!');
    }
    setShowForm(false);
  };

  const handleDelete = () => {
    setData(prev => prev.filter(item => item.id !== deleteModal.row.id));
    showToast('Amend stay record deleted.');
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
        <AmendStayForm
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
        title="Amend Stay Entry"
        columns={columns}
        data={data}
        actions={[
          { label: 'Edit', onClick: (row) => { setEditMode({ mode: 'edit', row }); setShowForm(true); } },
          { label: 'Delete', isDanger: true, onClick: (row) => setDeleteModal({ open: true, row }) },
        ]}
        onAddEntry={() => { setEditMode({ mode: 'add', row: null }); setShowForm(true); }}
        addEntryLabel="+ Amend Stay"
        searchPlaceholder="Search by GRC, guest or room..."
        showToast={showToast}
        breadcrumbs={['Dashboard', 'Front Desk', 'Operation', 'Amend Stay Entry']}
      />

      <DeleteConfirmationModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, row: null })}
        onConfirm={handleDelete}
        itemName={`GRC ${deleteModal.row?.grcNo} – ${deleteModal.row?.guestName}`}
      />
    </>
  );
};

export default AmendStayEntry;
