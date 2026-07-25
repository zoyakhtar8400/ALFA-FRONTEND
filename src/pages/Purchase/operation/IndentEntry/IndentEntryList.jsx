import React, { useState } from 'react';
import CommonTable from '../../../../components/common/CommonTable';
import DeleteConfirmationModal from '../../../../components/common/DeleteConfirmationModal';
import IndentEntryForm from './IndentEntryForm';
import IndentEntryView from './IndentEntryView';
import { usePurchase } from '../../hooks/usePurchase';

const columns = [
  { key: 'indentNo', label: 'Entry No', sortable: true },
  { key: 'indentDate', label: 'Entry Date', sortable: true },
  { key: 'indentName', label: 'Indent Name', sortable: true },
  { key: 'action', label: 'Action' }
];

const IndentEntryList = ({ showToast }) => {
  const { indents, setIndents, items, units } = usePurchase();

  const [viewMode, setViewMode] = useState('list'); // 'list' | 'form'
  const [formMode, setFormMode] = useState('add'); // 'add' | 'edit'
  const [selectedRow, setSelectedRow] = useState(null);

  const [viewModal, setViewModal] = useState({ open: false, row: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, row: null });

  const toast = (msg) => {
    if (showToast) showToast(msg);
    else if (window.showToast) window.showToast(msg);
  };

  const nextNo = (indents?.length || 0) + 1;

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
      setIndents((prev) => prev.map((e) => (e.id === selectedRow.id ? { ...entry, id: e.id } : e)));
      toast(`Indent Entry #${entry.indentNo} updated successfully!`);
    } else {
      setIndents((prev) => [entry, ...prev]);
      toast(`Indent Entry #${entry.indentNo} saved successfully!`);
    }
    setViewMode('list');
    setSelectedRow(null);
  };

  const handleDelete = () => {
    if (!deleteModal.row) return;
    setIndents((prev) => prev.filter((e) => e.id !== deleteModal.row.id));
    toast('Indent Entry deleted.');
    setDeleteModal({ open: false, row: null });
  };

  if (viewMode === 'form') {
    return (
      <IndentEntryForm
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
        title="Indent Entry"
        columns={columns}
        data={indents}
        actions={[
          { label: 'Edit', onClick: handleOpenEdit },
          { label: 'Delete', isDanger: true, onClick: (row) => setDeleteModal({ open: true, row }) }
        ]}
        onAddEntry={handleOpenAdd}
        addEntryLabel="+ Add Indent Entry"
        searchPlaceholder="Search Indents..."
        showToast={toast}
        breadcrumbs={['Dashboard', 'Purchase', 'Operations', 'Indent Entry']}
        emptyMessage="No Indent Entries found."
      />

      <IndentEntryView
        isOpen={viewModal.open}
        onClose={() => setViewModal({ open: false, row: null })}
        data={viewModal.row}
      />

      {deleteModal.open && (
        <DeleteConfirmationModal
          isOpen={deleteModal.open}
          onClose={() => setDeleteModal({ open: false, row: null })}
          onConfirm={handleDelete}
          itemName={`Indent #${deleteModal.row?.indentNo || ''}`}
        />
      )}
    </div>
  );
};

export default IndentEntryList;
