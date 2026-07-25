import React, { useState } from 'react';
import CommonTable from '../../../../components/common/CommonTable';
import DeleteConfirmationModal from '../../../../components/common/DeleteConfirmationModal';
import QuotationEntryForm from './QuotationEntryForm';
import QuotationEntryView from './QuotationEntryView';
import { usePurchase } from '../../hooks/usePurchase';

const columns = [
  { key: 'entryNo', label: 'Entry No', sortable: true },
  { key: 'entryDate', label: 'Entry Date', sortable: true },
  { key: 'vendor', label: 'Vendor', sortable: true },
  { key: 'vPrefix', label: 'V Prefix', sortable: true },
  { key: 'action', label: 'Action' }
];

const QuotationEntryList = ({ showToast }) => {
  const { quotations, setQuotations, items, units } = usePurchase();

  const [viewMode, setViewMode] = useState('list'); // 'list' | 'form'
  const [formMode, setFormMode] = useState('add'); // 'add' | 'edit'
  const [selectedRow, setSelectedRow] = useState(null);

  const [viewModal, setViewModal] = useState({ open: false, row: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, row: null });

  const toast = (msg) => {
    if (showToast) showToast(msg);
    else if (window.showToast) window.showToast(msg);
  };

  const nextNo = (quotations?.length || 0) + 1;

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
      setQuotations((prev) => prev.map((q) => (q.id === selectedRow.id ? { ...entry, id: q.id } : q)));
      toast(`Quotation Entry #${entry.entryNo} updated successfully!`);
    } else {
      setQuotations((prev) => [entry, ...prev]);
      toast(`Quotation Entry #${entry.entryNo} saved successfully!`);
    }
    setViewMode('list');
    setSelectedRow(null);
  };

  const handleDelete = () => {
    if (!deleteModal.row) return;
    setQuotations((prev) => prev.filter((q) => q.id !== deleteModal.row.id));
    toast('Quotation Entry deleted.');
    setDeleteModal({ open: false, row: null });
  };

  if (viewMode === 'form') {
    return (
      <QuotationEntryForm
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
        title="Quotation Entry"
        columns={columns}
        data={quotations}
        actions={[
          { label: 'Edit', onClick: handleOpenEdit },
          { label: 'Delete', isDanger: true, onClick: (row) => setDeleteModal({ open: true, row }) }
        ]}
        onAddEntry={handleOpenAdd}
        addEntryLabel="+ Add Quotation Entry"
        searchPlaceholder="Search Quotations..."
        showToast={toast}
        breadcrumbs={['Dashboard', 'Purchase', 'Operations', 'Quotation Entry']}
        emptyMessage="No Quotation Entries found."
      />

      <QuotationEntryView
        isOpen={viewModal.open}
        onClose={() => setViewModal({ open: false, row: null })}
        data={viewModal.row}
      />

      {deleteModal.open && (
        <DeleteConfirmationModal
          isOpen={deleteModal.open}
          onClose={() => setDeleteModal({ open: false, row: null })}
          onConfirm={handleDelete}
          itemName={`Quotation #${deleteModal.row?.entryNo || ''}`}
        />
      )}
    </div>
  );
};

export default QuotationEntryList;
