import React, { useState } from 'react';
import CommonTable from '../../../../components/common/CommonTable';
import DeleteConfirmationModal from '../../../../components/common/DeleteConfirmationModal';
import StockTransferEntryForm from './StockTransferEntryForm';
import StockTransferEntryView from './StockTransferEntryView';
import { usePurchase } from '../../hooks/usePurchase';

const columns = [
  { key: 'entryNo', label: 'Entry No', sortable: true },
  { key: 'entryDate', label: 'Entry Date', sortable: true },
  { key: 'department', label: 'Department', sortable: true },
  { key: 'toDepartment', label: 'To Department', sortable: true },
  { key: 'action', label: 'Action' }
];

const INITIAL_STOCK_TRANSFERS = [
  {
    id: 1,
    transferNo: '1',
    entryNo: '1',
    date: '25-07-2026',
    entryDate: '25-07-2026',
    department: 'PURCHASE STORE',
    fromDepartment: 'PURCHASE STORE',
    toDepartment: 'MAIN KITCHEN',
    remarks: 'Inter-dept transfer',
    lines: [
      { sNo: 1, item: 'AATA', unit: 'K.G.', quantity: 10, rate: 32, amount: 320, currentStock: 40 }
    ]
  }
];

const StockTransferEntryList = ({ showToast }) => {
  const { items, units } = usePurchase();
  const [stockTransfers, setStockTransfers] = useState(INITIAL_STOCK_TRANSFERS);

  const [viewMode, setViewMode] = useState('list'); // 'list' | 'form'
  const [formMode, setFormMode] = useState('add'); // 'add' | 'edit'
  const [selectedRow, setSelectedRow] = useState(null);

  const [viewModal, setViewModal] = useState({ open: false, row: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, row: null });

  const toast = (msg) => {
    if (showToast) showToast(msg);
    else if (window.showToast) window.showToast(msg);
  };

  const nextNo = (stockTransfers?.length || 0) + 1;

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
      setStockTransfers((prev) => prev.map((s) => (s.id === selectedRow.id ? { ...entry, id: s.id } : s)));
      toast(`Stock Transfer Entry #${entry.entryNo} updated successfully!`);
    } else {
      setStockTransfers((prev) => [entry, ...prev]);
      toast(`Stock Transfer Entry #${entry.entryNo} saved successfully!`);
    }
    setViewMode('list');
    setSelectedRow(null);
  };

  const handleDelete = () => {
    if (!deleteModal.row) return;
    setStockTransfers((prev) => prev.filter((s) => s.id !== deleteModal.row.id));
    toast('Stock Transfer Entry deleted.');
    setDeleteModal({ open: false, row: null });
  };

  if (viewMode === 'form') {
    return (
      <StockTransferEntryForm
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
        title="Stock Transfer Entry"
        columns={columns}
        data={stockTransfers}
        actions={[
          { label: 'Edit', onClick: handleOpenEdit },
          { label: 'Delete', isDanger: true, onClick: (row) => setDeleteModal({ open: true, row }) }
        ]}
        onAddEntry={handleOpenAdd}
        addEntryLabel="+ Add Stock Transfer Entry"
        searchPlaceholder="Search Stock Transfers..."
        showToast={toast}
        breadcrumbs={['Dashboard', 'Purchase', 'Operations', 'Stock Transfer Entry']}
        emptyMessage="No Stock Transfers found."
      />

      <StockTransferEntryView
        isOpen={viewModal.open}
        onClose={() => setViewModal({ open: false, row: null })}
        data={viewModal.row}
      />

      {deleteModal.open && (
        <DeleteConfirmationModal
          isOpen={deleteModal.open}
          onClose={() => setDeleteModal({ open: false, row: null })}
          onConfirm={handleDelete}
          itemName={`Transfer #${deleteModal.row?.entryNo || ''}`}
        />
      )}
    </div>
  );
};

export default StockTransferEntryList;
