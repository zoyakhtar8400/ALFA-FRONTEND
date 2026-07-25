import React, { useState } from 'react';
import CommonTable from '../../../../components/common/CommonTable';
import DeleteConfirmationModal from '../../../../components/common/DeleteConfirmationModal';
import OpenStockEntryForm from './OpenStockEntryForm';
import { usePurchase } from '../../hooks/usePurchase';

const columns = [
  { key: 'openingNo', label: 'Entry No', sortable: true },
  { key: 'date', label: 'Entry Date', sortable: true },
  { key: 'department', label: 'Department', sortable: true },
  { key: 'vPrefix', label: 'V Prefix', sortable: true },
  { key: 'action', label: 'Action' }
];

const OpenStockEntryList = ({ showToast }) => {
  const { openStockEntries, setOpenStockEntries, items, units } = usePurchase();

  const [viewMode, setViewMode] = useState('list'); // 'list' | 'form'
  const [formMode, setFormMode] = useState('add'); // 'add' | 'edit'
  const [selectedRow, setSelectedRow] = useState(null);

  const [deleteModal, setDeleteModal] = useState({ open: false, row: null });

  const toast = (msg) => {
    if (showToast) showToast(msg);
    else if (window.showToast) window.showToast(msg);
  };

  const nextNo = (openStockEntries?.length || 0) + 1;

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
      setOpenStockEntries((prev) => prev.map((e) => (e.id === selectedRow.id ? { ...entry, id: e.id } : e)));
      toast(`Open Stock Entry #${entry.openingNo} updated successfully!`);
    } else {
      setOpenStockEntries((prev) => [entry, ...prev]);
      toast(`Open Stock Entry #${entry.openingNo} saved successfully!`);
    }
    setViewMode('list');
    setSelectedRow(null);
  };

  const handleDelete = () => {
    if (!deleteModal.row) return;
    setOpenStockEntries((prev) => prev.filter((e) => e.id !== deleteModal.row.id));
    toast('Entry deleted.');
    setDeleteModal({ open: false, row: null });
  };

  return (
    <div className="w-full flex flex-col p-6 animate-in fade-in duration-200">
      {viewMode === 'form' ? (
        <OpenStockEntryForm
          mode={formMode}
          initialData={selectedRow}
          onSave={handleSave}
          onCancel={() => setViewMode('list')}
          items={items}
          units={units}
          nextNo={nextNo}
        />
      ) : (
        <CommonTable
          title="Open Stock Entry"
          columns={columns}
          data={openStockEntries}
          actions={[
            { label: 'Edit', onClick: handleOpenEdit },
            { label: 'Delete', isDanger: true, onClick: (row) => setDeleteModal({ open: true, row }) }
          ]}
          onAddEntry={handleOpenAdd}
          addEntryLabel="+ Add Open Stock"
          searchPlaceholder="Search Open Stock Entries..."
          showToast={toast}
          breadcrumbs={['Dashboard', 'Purchase', 'Master', 'Open Stock Entry']}
          emptyMessage="No Open Stock Entries found."
        />
      )}

      {deleteModal.open && (
        <DeleteConfirmationModal
          isOpen={deleteModal.open}
          onClose={() => setDeleteModal({ open: false, row: null })}
          onConfirm={handleDelete}
          itemName={`Entry #${deleteModal.row?.openingNo || ''}`}
        />
      )}
    </div>
  );
};

export default OpenStockEntryList;
