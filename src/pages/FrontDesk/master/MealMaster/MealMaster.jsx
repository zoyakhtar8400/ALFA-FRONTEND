import React, { useState } from 'react';
import CommonTable from '../../../../components/common/CommonTable';
import DeleteConfirmationModal from '../../../../components/common/DeleteConfirmationModal';
import MealMasterForm from './MealMasterForm';

import FormLoadingWrapper from '../../../../components/common/FormLoadingWrapper';

const MealMaster = ({ showToast }) => {
  const [data, setData] = useState([
    { id: 1, name: 'European Plan (Room Only)', acName: 'Food Revenue', taxStructure: 'NO TAX', active: 'Yes', singleRate: '0.00', doubleRate: '0.00', extraAdult: '0.00', tripleRate: '0.00', quadrantRate: '0.00', extraChild: '0.00' },
    { id: 2, name: 'Continental Plan (Breakfast)', acName: 'Food Revenue', taxStructure: 'TAX @5%', active: 'Yes', singleRate: '250.00', doubleRate: '450.00', extraAdult: '200.00', tripleRate: '600.00', quadrantRate: '750.00', extraChild: '150.00' },
    { id: 3, name: 'Modified American Plan (B+D)', acName: 'Food Revenue', taxStructure: 'TAX @12%', active: 'Yes', singleRate: '600.00', doubleRate: '1100.00', extraAdult: '500.00', tripleRate: '1500.00', quadrantRate: '1900.00', extraChild: '350.00' },
    { id: 4, name: 'American Plan (All 3 Meals)', acName: 'Food Revenue', taxStructure: 'TAX @18%', active: 'Yes', singleRate: '900.00', doubleRate: '1700.00', extraAdult: '800.00', tripleRate: '2400.00', quadrantRate: '3000.00', extraChild: '550.00' },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState({ mode: 'add', row: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, row: null });

  const columns = [
    { key: 'name', label: 'Meal Plan Name' },
    { key: 'acName', label: 'A/c Name' },
    { key: 'taxStructure', label: 'Tax Structure' },
    { key: 'singleRate', label: 'Single Rate' },
    { key: 'doubleRate', label: 'Double Rate' },
    { key: 'active', label: 'Active', renderStatus: true },
    { key: 'action', label: 'Action', sortable: false },
  ];

  const handleSave = (formData) => {
    if (editMode.mode === 'add') {
      setData(prev => [...prev, { ...formData, id: Date.now() }]);
      showToast('Meal Plan added successfully!');
    } else {
      setData(prev => prev.map(m => m.id === editMode.row.id ? { ...formData, id: m.id } : m));
      showToast('Meal Plan updated successfully!');
    }
    setShowForm(false);
  };

  const handleDelete = () => {
    setData(prev => prev.filter(m => m.id !== deleteModal.row.id));
    showToast('Meal Plan deleted.');
    setDeleteModal({ open: false, row: null });
  };

  if (showForm) {
    return (
      <FormLoadingWrapper>
        <MealMasterForm
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
        title="Meal Master"
        columns={columns}
        data={data}
        actions={[
          { label: 'Edit', onClick: (row) => { setEditMode({ mode: 'edit', row }); setShowForm(true); } },
          { label: 'Delete', isDanger: true, onClick: (row) => setDeleteModal({ open: true, row }) },
        ]}
        onAddEntry={() => { setEditMode({ mode: 'add', row: null }); setShowForm(true); }}
        addEntryLabel="+ Add Meal Plan"
        searchPlaceholder="Search meal plans..."
        showToast={showToast}
        breadcrumbs={['Dashboard', 'Front Desk', 'Meal Master']}
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

export default MealMaster;
