import React, { useState } from 'react';
import CommonTable from '../../../../components/common/CommonTable';
import DeleteConfirmationModal from '../../../../components/common/DeleteConfirmationModal';
import PurchaseReturnEntryForm from './PurchaseReturnEntryForm';
import PurchaseReturnEntryView from './PurchaseReturnEntryView';
import { usePurchase } from '../../hooks/usePurchase';

const columns = [
  { key: 'entryNo', label: 'Entry No', sortable: true },
  { key: 'entryDate', label: 'Entry Date', sortable: true },
  { key: 'ptyBillNo', label: 'Pty BillNo', sortable: true },
  { key: 'ptyBillDt', label: 'Pty BillDt', sortable: true },
  { key: 'customer', label: 'Customer / Supplier', sortable: true },
  { key: 'approvedBy', label: 'Approved By', sortable: true },
  { key: 'rowNo', label: 'Row No', sortable: true },
  { key: 'action', label: 'Action' }
];

const INITIAL_RETURNS = [
  {
    id: 1,
    entryNo: '1',
    entryDate: '25-07-2026',
    ptyBillNo: 'INV-1001',
    ptyBillDt: '25-07-2026',
    customer: 'A P SUPPLY',
    supplier: 'A P SUPPLY',
    approvedBy: 'Store Manager',
    rowNo: 2,
    preparedBy: 'DEMO',
    modifiedBy: 'DEMO',
    remark: 'Defective packaging return',
    grossAmount: 4708,
    netAmount: 4708,
    lines: [
      { sNo: 1, convUnit: '1', qty: 125, skuQty: 2354, skuUnit: '1254', rate: 125, amt: 2354, department: '1254', hsnCode: '1001' },
      { sNo: 2, convUnit: '2', qty: 125, skuQty: 2354, skuUnit: '1254', rate: 125, amt: 2354, department: '1254', hsnCode: '1001' }
    ]
  }
];

const PurchaseReturnEntryList = ({ showToast }) => {
  const { items, units } = usePurchase();
  const [purchaseReturns, setPurchaseReturns] = useState(INITIAL_RETURNS);

  const [viewMode, setViewMode] = useState('list'); // 'list' | 'form'
  const [formMode, setFormMode] = useState('add'); // 'add' | 'edit'
  const [selectedRow, setSelectedRow] = useState(null);

  const [viewModal, setViewModal] = useState({ open: false, row: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, row: null });

  const toast = (msg) => {
    if (showToast) showToast(msg);
    else if (window.showToast) window.showToast(msg);
  };

  const nextNo = (purchaseReturns?.length || 0) + 1;

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
      setPurchaseReturns((prev) => prev.map((r) => (r.id === selectedRow.id ? { ...entry, id: r.id } : r)));
      toast(`Purchase Return Entry #${entry.entryNo} updated successfully!`);
    } else {
      setPurchaseReturns((prev) => [entry, ...prev]);
      toast(`Purchase Return Entry #${entry.entryNo} saved successfully!`);
    }
    setViewMode('list');
    setSelectedRow(null);
  };

  const handleDelete = () => {
    if (!deleteModal.row) return;
    setPurchaseReturns((prev) => prev.filter((r) => r.id !== deleteModal.row.id));
    toast('Purchase Return Entry deleted.');
    setDeleteModal({ open: false, row: null });
  };

  if (viewMode === 'form') {
    return (
      <PurchaseReturnEntryForm
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
        title="Purchase Return Entry"
        columns={columns}
        data={purchaseReturns}
        actions={[
          { label: 'Edit', onClick: handleOpenEdit },
          { label: 'Delete', isDanger: true, onClick: (row) => setDeleteModal({ open: true, row }) }
        ]}
        onAddEntry={handleOpenAdd}
        addEntryLabel="+ Add Purchase Return Entry"
        searchPlaceholder="Search Purchase Returns..."
        showToast={toast}
        breadcrumbs={['Dashboard', 'Purchase', 'Operations', 'Purchase Return Entry']}
        emptyMessage="No Purchase Returns found."
      />

      <PurchaseReturnEntryView
        isOpen={viewModal.open}
        onClose={() => setViewModal({ open: false, row: null })}
        data={viewModal.row}
      />

      {deleteModal.open && (
        <DeleteConfirmationModal
          isOpen={deleteModal.open}
          onClose={() => setDeleteModal({ open: false, row: null })}
          onConfirm={handleDelete}
          itemName={`Return #${deleteModal.row?.entryNo || ''}`}
        />
      )}
    </div>
  );
};

export default PurchaseReturnEntryList;
