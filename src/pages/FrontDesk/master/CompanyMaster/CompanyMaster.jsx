import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import CommonTable from '../../../../components/common/CommonTable';
import DeleteConfirmationModal from '../../../../components/common/DeleteConfirmationModal';
import CompanyMasterForm from './CompanyMasterForm';

import FormLoadingWrapper from '../../../../components/common/FormLoadingWrapper';

const CompanyMaster = ({ showToast }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [data, setData] = useState([
    { id: 1, name: 'Alfa Group Ltd', underGroup: 'Sundry Debtors', shortName: 'ALFA-GRP', nature: 'Corporate', gstNumber: '29AAAAA1111A1Z1', contractPerson: 'Zoya Akhtar', address: '123 Luxury Ave', city: 'Mumbai', phone: '+91 22 998877', mobile: '+91 9876543210', email: 'info@alfagroup.com', active: 'Yes' },
    { id: 2, name: 'TechNova Corp', underGroup: 'Sundry Debtors', shortName: 'TECH-NOV', nature: 'Corporate', gstNumber: '27BBBBB2222B2Z2', contractPerson: 'John Doe', address: '456 Tech Park', city: 'Delhi', phone: '+91 11 887766', mobile: '+91 9812345678', email: 'contact@technova.in', active: 'Yes' },
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
    { key: 'name', label: 'Company Name' },
    { key: 'underGroup', label: 'Under Group' },
    { key: 'shortName', label: 'Short Name' },
    { key: 'nature', label: 'Nature' },
    { key: 'gstNumber', label: 'GSTIN No.' },
    { key: 'contractPerson', label: 'Contact Person' },
    { key: 'mobile', label: 'Mobile Number' },
    { key: 'active', label: 'Active', renderStatus: true },
    { key: 'action', label: 'Action', sortable: false },
  ];

  const handleSave = (formData) => {
    if (editMode.mode === 'add') {
      setData(prev => [...prev, { ...formData, id: Date.now() }]);
      showToast('Company added successfully!');
    } else {
      setData(prev => prev.map(c => c.id === editMode.row.id ? { ...formData, id: c.id } : c));
      showToast('Company updated successfully!');
    }
    setShowForm(false);
  };

  const handleDelete = () => {
    setData(prev => prev.filter(c => c.id !== deleteModal.row.id));
    showToast('Company deleted.');
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
        <CompanyMasterForm
          key={editMode.row?.id || 'new'}
          mode={editMode.mode}
          initialData={editMode.row}
          onSave={handleSave}
          onCancel={handleCancel}
          existingRecords={data}
          onEditExisting={(item) => {
            setEditMode({ mode: 'edit', row: item });
            setShowForm(true);
          }}
        />
      </FormLoadingWrapper>
    );
  }

  return (
    <>
      <CommonTable
        title="Company Master"
        columns={columns}
        data={data}
        actions={[
          { label: 'Edit', onClick: (row) => { setEditMode({ mode: 'edit', row }); setShowForm(true); } },
          { label: 'Delete', isDanger: true, onClick: (row) => setDeleteModal({ open: true, row }) },
        ]}
        onAddEntry={() => { setEditMode({ mode: 'add', row: null }); setShowForm(true); }}
        addEntryLabel="+ Add Company"
        searchPlaceholder="Search companies..."
        showToast={showToast}
        breadcrumbs={['Dashboard', 'Front Desk', 'Company Master']}
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

export default CompanyMaster;
