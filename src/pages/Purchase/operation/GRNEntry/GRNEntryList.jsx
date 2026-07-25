import React, { useState } from 'react';
import CommonTable from '../../../../components/common/CommonTable';
import DeleteConfirmationModal from '../../../../components/common/DeleteConfirmationModal';
import GRNEntryForm from './GRNEntryForm';
import GRNEntryView from './GRNEntryView';
import { usePurchase } from '../../hooks/usePurchase';

const columns = [
  { key: 'entryNo', label: 'Entry No', sortable: true },
  { key: 'entryDate', label: 'Entry Date', sortable: true },
  { key: 'itemName', label: 'Item Name', sortable: true },
  { key: 'partyChNo', label: 'Party ChNo', sortable: true },
  { key: 'partyChDt', label: 'Party ChDt', sortable: true },
  { key: 'partyName', label: 'Party Name', sortable: true },
  { key: 'action', label: 'Action' }
];

const GRNEntryList = ({ showToast }) => {
  const { grns, setGrns, items, units } = usePurchase();

  const [viewMode, setViewMode] = useState('list'); // 'list' | 'form'
  const [formMode, setFormMode] = useState('add'); // 'add' | 'edit'
  const [selectedRow, setSelectedRow] = useState(null);

  const [viewModal, setViewModal] = useState({ open: false, row: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, row: null });

  const toast = (msg) => {
    if (showToast) showToast(msg);
    else if (window.showToast) window.showToast(msg);
  };

  const nextNo = (grns?.length || 0) + 1;

  const handleOpenAdd = () => {
    setFormMode('add');
    setSelectedRow(null);
    setViewMode('form');
  };

  const handleOpenEdit = (row) => {
    setFormMode('edit');
    setSelectedRow(row);
    setViewMode('form');
  };

  const handleSave = (entry) => {
    if (formMode === 'edit' && selectedRow) {
      setGrns((prev) => prev.map((g) => (g.id === selectedRow.id ? { ...entry, id: g.id } : g)));
      toast(`GRN Entry #${entry.entryNo} updated successfully!`);
    } else {
      setGrns((prev) => [entry, ...prev]);
      toast(`GRN Entry #${entry.entryNo} saved successfully!`);
    }
    setViewMode('list');
    setSelectedRow(null);
  };

  const handleDelete = () => {
    if (!deleteModal.row) return;
    setGrns((prev) => prev.filter((g) => g.id !== deleteModal.row.id));
    toast('GRN Entry deleted.');
    setDeleteModal({ open: false, row: null });
  };

  if (viewMode === 'form') {
    return (
      <GRNEntryForm
        mode={formMode}
        initialData={selectedRow}
        onSave={handleSave}
        onCancel={() => setViewMode('list')}
        items={items}
        units={units}
        nextNo={nextNo}
      />
    );
  }

  return (
    <div className="w-full flex flex-col p-6 animate-in fade-in duration-200">
      <CommonTable
        title="GRN Entry"
        columns={columns}
        data={grns}
        actions={[
          { label: 'Edit', onClick: handleOpenEdit },
          { label: 'Delete', isDanger: true, onClick: (row) => setDeleteModal({ open: true, row }) }
        ]}
        onAddEntry={handleOpenAdd}
        addEntryLabel="+ Add GRN Entry"
        searchPlaceholder="Search GRN Entries..."
        showToast={toast}
        breadcrumbs={['Dashboard', 'Purchase', 'Operations', 'GRN Entry']}
        emptyMessage="No GRN Entries found."
      />

      <GRNEntryView
        isOpen={viewModal.open}
        onClose={() => setViewModal({ open: false, row: null })}
        data={viewModal.row}
      />

      {deleteModal.open && (
        <DeleteConfirmationModal
          isOpen={deleteModal.open}
          onClose={() => setDeleteModal({ open: false, row: null })}
          onConfirm={handleDelete}
          itemName={`GRN #${deleteModal.row?.entryNo || ''}`}
        />
      )}
    </div>
  );
};

export default GRNEntryList;
