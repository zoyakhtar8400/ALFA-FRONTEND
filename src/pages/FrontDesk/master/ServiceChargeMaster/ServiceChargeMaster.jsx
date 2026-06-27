import React, { useState } from 'react';
import CommonTable from '../../../../components/common/CommonTable';
import DeleteConfirmationModal from '../../../../components/common/DeleteConfirmationModal';
import ServiceChargeForm from './ServiceChargeForm';

import FormLoadingWrapper from '../../../../components/common/FormLoadingWrapper';

const ServiceChargeMaster = ({ showToast }) => {
  const [data, setData] = useState([
    { id: 1, name: 'Laundry Service', acName: 'Laundry Revenue', nature: 'Fixed', adultRate: '50.00', childRate: '25.00', applicableDate: '2026-04-01', taxStructure: 'NO TAX', sacCode: '996311', discountAllowed: 'Yes', backDateAllow: 'No', active: 'Yes' },
    { id: 2, name: 'Spa & Wellness', acName: 'Service Charge Revenue', nature: 'Per Session', adultRate: '120.00', childRate: '60.00', applicableDate: '2026-04-01', taxStructure: 'TAX @18%', sacCode: '996312', discountAllowed: 'No', backDateAllow: 'No', active: 'Yes' },
    { id: 3, name: 'Valet Car Parking', acName: 'Service Charge Revenue', nature: 'Per Day', adultRate: '20.00', childRate: '10.00', applicableDate: '2026-04-01', taxStructure: 'NO TAX', sacCode: '996313', discountAllowed: 'Yes', backDateAllow: 'Yes', active: 'Yes' },
    { id: 4, name: 'Airport Transfer', acName: 'Service Charge Revenue', nature: 'Fixed', adultRate: '80.00', childRate: '40.00', applicableDate: '2026-04-01', taxStructure: 'TAX @12%', sacCode: '996314', discountAllowed: 'Yes', backDateAllow: 'No', active: 'Yes' },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState({ mode: 'add', row: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, row: null });

  const columns = [
    { key: 'name', label: 'Service Name' },
    { key: 'acName', label: 'A/c Name' },
    { key: 'nature', label: 'Nature' },
    { key: 'adultRate', label: 'Adult Rate' },
    { key: 'active', label: 'Active', renderStatus: true },
    { key: 'action', label: 'Action', sortable: false },
  ];

  const handleSave = (formData) => {
    if (editMode.mode === 'add') {
      setData(prev => [...prev, { ...formData, id: Date.now() }]);
      showToast('Service Charge added successfully!');
    } else {
      setData(prev => prev.map(s => s.id === editMode.row.id ? { ...formData, id: s.id } : s));
      showToast('Service Charge updated successfully!');
    }
    setShowForm(false);
  };

  const handleDelete = () => {
    setData(prev => prev.filter(s => s.id !== deleteModal.row.id));
    showToast('Service Charge deleted.');
    setDeleteModal({ open: false, row: null });
  };

  if (showForm) {
    return (
      <FormLoadingWrapper>
        <ServiceChargeForm
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
        title="Service Charge Master"
        columns={columns}
        data={data}
        actions={[
          { label: 'Edit', onClick: (row) => { setEditMode({ mode: 'edit', row }); setShowForm(true); } },
          { label: 'Delete', isDanger: true, onClick: (row) => setDeleteModal({ open: true, row }) },
        ]}
        onAddEntry={() => { setEditMode({ mode: 'add', row: null }); setShowForm(true); }}
        addEntryLabel="+ Add Service Charge"
        searchPlaceholder="Search service charges..."
        showToast={showToast}
        breadcrumbs={['Dashboard', 'Front Desk', 'Service Charge Master']}
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

export default ServiceChargeMaster;
