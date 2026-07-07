import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import CommonTable from '../../../../components/common/CommonTable';
import DeleteConfirmationModal from '../../../../components/common/DeleteConfirmationModal';
import GuestProfileForm from './GuestProfileForm';

import FormLoadingWrapper from '../../../../components/common/FormLoadingWrapper';

const GuestProfile = ({ showToast }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [data, setData] = useState([
    { id: 1, name: 'Sanjay Dutt', dob: '1980-05-15', idType: 'Aadhaar Card', idNo: '8877-6655-4433', mobile: '+91 9876541234', email: 'sanjay@dutt.com', address: 'Bandra West', city: 'Mumbai', state: 'Maharashtra', country: 'India', nationality: 'Indian', active: 'Yes' },
    { id: 2, name: 'Emma Watson', dob: '1990-04-15', idType: 'Passport', idNo: 'G1234568', mobile: '+44 7700 900077', email: 'emma@watson.co.uk', address: 'Oxford Street', city: 'London', state: 'London', country: 'United Kingdom', nationality: 'British', active: 'Yes' },
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
    { key: 'name', label: 'Guest Name' },
    { key: 'dob', label: 'D.O.B' },
    { key: 'idType', label: 'ID Type' },
    { key: 'idNo', label: 'ID Number' },
    { key: 'mobile', label: 'Mobile No' },
    { key: 'email', label: 'Email Address' },
    { key: 'city', label: 'City' },
    { key: 'active', label: 'Active', renderStatus: true },
    { key: 'action', label: 'Action', sortable: false },
  ];

  const handleSave = (formData) => {
    if (editMode.mode === 'add') {
      setData(prev => [...prev, { ...formData, id: Date.now() }]);
      showToast('Guest profile added successfully!');
    } else {
      setData(prev => prev.map(item => item.id === editMode.row.id ? { ...formData, id: item.id } : item));
      showToast('Guest profile updated successfully!');
    }
    setShowForm(false);
  };

  const handleDelete = () => {
    setData(prev => prev.filter(item => item.id !== deleteModal.row.id));
    showToast('Guest profile deleted.');
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
        <GuestProfileForm
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
        title="Guest Profile"
        columns={columns}
        data={data}
        actions={[
          { label: 'Edit', onClick: (row) => { setEditMode({ mode: 'edit', row }); setShowForm(true); } },
          { label: 'Delete', isDanger: true, onClick: (row) => setDeleteModal({ open: true, row }) },
        ]}
        onAddEntry={() => { setEditMode({ mode: 'add', row: null }); setShowForm(true); }}
        addEntryLabel="+ Add Guest Profile"
        searchPlaceholder="Search guest profiles..."
        showToast={showToast}
        breadcrumbs={['Dashboard', 'Front Desk', 'Operation', 'Guest Profile']}
      />

      <DeleteConfirmationModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, row: null })}
        onConfirm={handleDelete}
        itemName={deleteModal.row?.name}
      />
    </>
  );
};

export default GuestProfile;
