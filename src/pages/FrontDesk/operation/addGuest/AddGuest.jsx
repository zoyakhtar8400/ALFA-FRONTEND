import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import CommonTable from '../../../../components/common/CommonTable';
import DeleteConfirmationModal from '../../../../components/common/DeleteConfirmationModal';
import AddGuestForm from './AddGuestForm';

import FormLoadingWrapper from '../../../../components/common/FormLoadingWrapper';

const AddGuest = ({ showToast }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [data, setData] = useState([
    { id: 1, roomNo: '202', folioNo: 'FL-4051', newGuestName: 'Priya Sharma', idType: 'Aadhaar Card', idNo: '9876-5432-1098', relation: 'Spouse', active: 'Yes' },
    { id: 2, roomNo: '202', folioNo: 'FL-4051', newGuestName: 'Aarav Sharma', idType: 'Passport', idNo: 'Y1234567', relation: 'Child', active: 'Yes' },
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
    { key: 'roomNo', label: 'Room No' },
    { key: 'folioNo', label: 'Folio No' },
    { key: 'newGuestName', label: 'Additional Guest Name' },
    { key: 'idType', label: 'ID Type' },
    { key: 'idNo', label: 'ID Number' },
    { key: 'relation', label: 'Relation' },
    { key: 'active', label: 'Active', renderStatus: true },
    { key: 'action', label: 'Action', sortable: false },
  ];

  const handleSave = (formData) => {
    if (editMode.mode === 'add') {
      setData(prev => [...prev, { ...formData, id: Date.now() }]);
      showToast('Additional guest added successfully!');
    } else {
      setData(prev => prev.map(item => item.id === editMode.row.id ? { ...formData, id: item.id } : item));
      showToast('Additional guest details updated successfully!');
    }
    setShowForm(false);
  };

  const handleDelete = () => {
    setData(prev => prev.filter(item => item.id !== deleteModal.row.id));
    showToast('Additional guest removed.');
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
        <AddGuestForm
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
        title="Add Guest in Room Entry"
        columns={columns}
        data={data}
        actions={[
          { label: 'Edit', onClick: (row) => { setEditMode({ mode: 'edit', row }); setShowForm(true); } },
          { label: 'Delete', isDanger: true, onClick: (row) => setDeleteModal({ open: true, row }) },
        ]}
        onAddEntry={() => { setEditMode({ mode: 'add', row: null }); setShowForm(true); }}
        addEntryLabel="+ Add Guest in Room"
        searchPlaceholder="Search guest, room, or folio..."
        showToast={showToast}
        breadcrumbs={['Dashboard', 'Front Desk', 'Operation', 'Add Guest in Room Entry']}
      />

      <DeleteConfirmationModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, row: null })}
        onConfirm={handleDelete}
        itemName={deleteModal.row?.newGuestName}
      />
    </>
  );
};

export default AddGuest;
