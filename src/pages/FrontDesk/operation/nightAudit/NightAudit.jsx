import React, { useState } from 'react';
import CommonTable from '../../../../components/common/CommonTable';
import DeleteConfirmationModal from '../../../../components/common/DeleteConfirmationModal';
import CommonModal from '../../../../components/common/CommonModal';
import NightAuditForm from './NightAuditForm';

const NightAudit = ({ showToast }) => {
  const [data, setData] = useState([
    { id: 1, auditDate: '2026-06-21', notes: 'All room charges and taxes posted successfully.', active: 'Yes' },
    { id: 2, auditDate: '2026-06-20', notes: 'No discrepancies found. House count reconciled.', active: 'Yes' },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState({ mode: 'add', row: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, row: null });

  const columns = [
    { key: 'auditDate', label: 'Audit Date' },
    { key: 'notes', label: 'Audit Summary Notes' },
    { key: 'active', label: 'Active/Completed', renderStatus: true },
    { key: 'action', label: 'Action', sortable: false },
  ];

  const handleSave = (formData) => {
    if (editMode.mode === 'add') {
      setData(prev => [...prev, { ...formData, id: Date.now() }]);
      showToast('Night audit completed successfully!');
    } else {
      setData(prev => prev.map(item => item.id === editMode.row.id ? { ...formData, id: item.id } : item));
      showToast('Night audit entry updated successfully!');
    }
    setShowForm(false);
  };

  const handleDelete = () => {
    setData(prev => prev.filter(item => item.id !== deleteModal.row.id));
    showToast('Night audit entry deleted.');
    setDeleteModal({ open: false, row: null });
  };

  return (
    <>
      <CommonTable
        title="Night Audit Entry"
        columns={columns}
        data={data}
        actions={[
          { label: 'Edit', onClick: (row) => { setEditMode({ mode: 'edit', row }); setShowForm(true); } },
          { label: 'Delete', isDanger: true, onClick: (row) => setDeleteModal({ open: true, row }) },
        ]}
        onAddEntry={() => { setEditMode({ mode: 'add', row: null }); setShowForm(true); }}
        addEntryLabel="+ Run Night Audit"
        searchPlaceholder="Search audit notes or date..."
        showToast={showToast}
        breadcrumbs={['Dashboard', 'Front Desk', 'Operation', 'Night Audit Entry']}
      />

      <CommonModal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editMode.mode === 'add' ? 'Run Night Audit' : 'Edit Night Audit'}
        maxWidth="480px"
      >
        <NightAuditForm
          mode={editMode.mode}
          initialData={editMode.row}
          onSave={handleSave}
          onCancel={() => setShowForm(false)}
        />
      </CommonModal>

      <DeleteConfirmationModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, row: null })}
        onConfirm={handleDelete}
        itemName={`Audit of ${deleteModal.row?.auditDate}`}
      />
    </>
  );
};

export default NightAudit;
