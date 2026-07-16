import React, { useState } from 'react';
import CommonTable from '../../../../components/common/CommonTable';
import DeleteConfirmationModal from '../../../../components/common/DeleteConfirmationModal';
import RoomRateMasterForm from './RoomRateMasterForm';

import FormLoadingWrapper from '../../../../components/common/FormLoadingWrapper';

const RoomRateMaster = ({ showToast }) => {
  const [data, setData] = useState([
    { id: 1, name: 'Peak Season Standard Plan', shortName: 'PEAK-STD', category: 'Standard Comfort Room', applicableDate: '2026-11-01', planType: 'American Plan', mealType: 'Veg', active: 'Yes', roomSingle: '100.00', roomDouble: '120.00', roomExtraAdult: '30.00', roomTriple: '150.00', roomQuadrant: '180.00', roomExtraChild: '20.00', mealSingle: '15.00', mealDouble: '30.00', mealExtraAdult: '10.00', mealTriple: '45.00', mealQuadrant: '60.00', mealExtraChild: '5.00', netSingle: '115.00', netDouble: '150.00', netTriple: '195.00', netQuadrant: '240.00', netExtraAdult: '40.00', netExtraChild: '25.00' },
    { id: 2, name: 'Off Season Deluxe Plan', shortName: 'OFF-DLX', category: 'Premium Deluxe King Room', applicableDate: '2026-04-15', planType: 'MAP', mealType: 'Mixed', active: 'Yes', roomSingle: '200.00', roomDouble: '220.00', roomExtraAdult: '50.00', roomTriple: '280.00', roomQuadrant: '340.00', roomExtraChild: '40.00', mealSingle: '10.00', mealDouble: '20.00', mealExtraAdult: '8.00', mealTriple: '30.00', mealQuadrant: '40.00', mealExtraChild: '4.00', netSingle: '210.00', netDouble: '240.00', netTriple: '310.00', netQuadrant: '380.00', netExtraAdult: '58.00', netExtraChild: '44.00' },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState({ mode: 'add', row: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, row: null });

  const columns = [
    { key: 'name', label: 'Rate Plan Name' },
    { key: 'category', label: 'Room Category' },
    { key: 'shortName', label: 'Short Name' },
    { key: 'applicableDate', label: 'Applicable Date' },
    { key: 'netSingle', label: 'Net Single Rate' },
    { key: 'netDouble', label: 'Net Double Rate' },
    { key: 'active', label: 'Active', renderStatus: true },
    { key: 'action', label: 'Action', sortable: false },
  ];

  const handleSave = (formData) => {
    if (editMode.mode === 'add') {
      setData(prev => [...prev, { ...formData, id: Date.now() }]);
      showToast('Rate Plan added successfully!');
    } else {
      setData(prev => prev.map(r => r.id === editMode.row.id ? { ...formData, id: r.id } : r));
      showToast('Rate Plan updated successfully!');
    }
    setShowForm(false);
  };

  const handleDelete = () => {
    setData(prev => prev.filter(r => r.id !== deleteModal.row.id));
    showToast('Rate Plan deleted.');
    setDeleteModal({ open: false, row: null });
  };

  if (showForm) {
    return (
      <FormLoadingWrapper>
        <RoomRateMasterForm
          mode={editMode.mode}
          initialData={editMode.row}
          onSave={handleSave}
          onCancel={() => setShowForm(false)}
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
        title="Room Rate Master"
        columns={columns}
        data={data}
        actions={[
          { label: 'Edit', onClick: (row) => { setEditMode({ mode: 'edit', row }); setShowForm(true); } },
          { label: 'Delete', isDanger: true, onClick: (row) => setDeleteModal({ open: true, row }) },
        ]}
        onAddEntry={() => { setEditMode({ mode: 'add', row: null }); setShowForm(true); }}
        addEntryLabel="+ Add Rate Plan"
        searchPlaceholder="Search rate plans..."
        showToast={showToast}
        breadcrumbs={['Dashboard', 'Front Desk', 'Room Rate Master']}
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

export default RoomRateMaster;
