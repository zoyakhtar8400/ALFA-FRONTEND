import React, { useState } from 'react';
import CommonTable from '../../../../components/common/CommonTable';
import DeleteConfirmationModal from '../../../../components/common/DeleteConfirmationModal';
import ServiceChargeEntryForm from './ServiceChargeEntryForm';

const ServiceChargeEntry = ({ showToast }) => {
  const [data, setData] = useState([
    { id: 1, folioNo: 'FL-3011', roomNo: '103', serviceName: 'Airport Transfer', date: '2026-06-22', adultQty: 2, childQty: 0, rate: 1200, amount: 2400, active: 'Yes' },
    { id: 2, folioNo: 'FL-3012', roomNo: '204', serviceName: 'Extra Bed', date: '2026-06-22', adultQty: 1, childQty: 0, rate: 800, amount: 800, active: 'Yes' },
    { id: 3, folioNo: 'FL-3013', roomNo: '206', serviceName: 'Laundry Service', date: '2026-06-21', adultQty: 1, childQty: 2, rate: 300, amount: 900, active: 'No' },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState({ mode: 'add', row: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, row: null });

  const columns = [
    { key: 'folioNo', label: 'Folio No' },
    { key: 'roomNo', label: 'Room No' },
    { key: 'serviceName', label: 'Service Name' },
    { key: 'date', label: 'Post Date' },
    { key: 'rate', label: 'Rate' },
    { key: 'amount', label: 'Total Amount' },
    { key: 'active', label: 'Active', renderStatus: true },
    { key: 'action', label: 'Action', sortable: false },
  ];

  const handleSave = (formData) => {
    if (editMode.mode === 'add') {
      setData(prev => [...prev, { ...formData, id: Date.now() }]);
      showToast('Service charge entry added successfully!');
    } else {
      setData(prev => prev.map(item => item.id === editMode.row.id ? { ...formData, id: item.id } : item));
      showToast('Service charge entry updated successfully!');
    }
    setShowForm(false);
  };

  const handleDelete = () => {
    setData(prev => prev.filter(item => item.id !== deleteModal.row.id));
    showToast('Service charge entry deleted.');
    setDeleteModal({ open: false, row: null });
  };

  if (showForm) {
    return (
      <ServiceChargeEntryForm
        mode={editMode.mode}
        initialData={editMode.row}
        onSave={handleSave}
        onCancel={() => setShowForm(false)}
      />
    );
  }

  return (
    <>
      <CommonTable
        title="Service Charge Entry"
        columns={columns}
        data={data}
        actions={[
          { label: 'Edit', onClick: (row) => { setEditMode({ mode: 'edit', row }); setShowForm(true); } },
          { label: 'Delete', isDanger: true, onClick: (row) => setDeleteModal({ open: true, row }) },
        ]}
        onAddEntry={() => { setEditMode({ mode: 'add', row: null }); setShowForm(true); }}
        addEntryLabel="+ Add Service Charge"
        searchPlaceholder="Search folio, room or service..."
        showToast={showToast}
        breadcrumbs={['Dashboard', 'Front Desk', 'Operation', 'Service Charge Entry']}
      />

      <DeleteConfirmationModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, row: null })}
        onConfirm={handleDelete}
        itemName={`${deleteModal.row?.serviceName} - Room ${deleteModal.row?.roomNo}`}
      />
    </>
  );
};

export default ServiceChargeEntry;
