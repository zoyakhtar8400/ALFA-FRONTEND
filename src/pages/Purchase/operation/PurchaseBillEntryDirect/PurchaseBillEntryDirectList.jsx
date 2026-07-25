import React, { useState } from 'react';
import CommonTable from '../../../../components/common/CommonTable';
import DeleteConfirmationModal from '../../../../components/common/DeleteConfirmationModal';
import PurchaseBillEntryDirectForm from './PurchaseBillEntryDirectForm';
import PurchaseBillEntryDirectView from './PurchaseBillEntryDirectView';
import { usePurchase } from '../../hooks/usePurchase';

const columns = [
  { key: 'entryNo', label: 'Entry No', sortable: true },
  { key: 'entryDate', label: 'Entry Date', sortable: true },
  { key: 'ptyBillNo', label: 'Pty BillNo', sortable: true },
  { key: 'ptyBillDt', label: 'Pty BillDt', sortable: true },
  { key: 'customer', label: 'Customer / Supplier', sortable: true },
  { key: 'action', label: 'Action' }
];

const INITIAL_DIRECT_BILLS = [
  {
    id: 1,
    entryNo: '1',
    entryDate: '25-07-2026',
    ptyBillNo: 'DIR-101',
    ptyBillDt: '25-07-2026',
    customer: 'A P SUPPLY',
    supplier: 'A P SUPPLY',
    type: 'Tax Invoice',
    gstin: '09AAAAA0000A1Z5',
    netAmount: 450,
    lines: [
      { sNo: 1, item: 'AATA', unit: 'K.G.', qty: 10, rate: 32, amount: 320, department: 'PURCHASE STORE', expiry: '2026-12-31' }
    ]
  }
];

const PurchaseBillEntryDirectList = ({ showToast }) => {
  const { items, units } = usePurchase();
  const [directBills, setDirectBills] = useState(INITIAL_DIRECT_BILLS);

  const [viewMode, setViewMode] = useState('list'); // 'list' | 'form'
  const [formMode, setFormMode] = useState('add'); // 'add' | 'edit'
  const [selectedRow, setSelectedRow] = useState(null);

  const [viewModal, setViewModal] = useState({ open: false, row: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, row: null });

  const toast = (msg) => {
    if (showToast) showToast(msg);
    else if (window.showToast) window.showToast(msg);
  };

  const nextNo = (directBills?.length || 0) + 1;

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
      setDirectBills((prev) => prev.map((b) => (b.id === selectedRow.id ? { ...entry, id: b.id } : b)));
      toast(`Purchase Bill Direct Entry #${entry.entryNo} updated successfully!`);
    } else {
      setDirectBills((prev) => [entry, ...prev]);
      toast(`Purchase Bill Direct Entry #${entry.entryNo} saved successfully!`);
    }
    setViewMode('list');
    setSelectedRow(null);
  };

  const handleDelete = () => {
    if (!deleteModal.row) return;
    setDirectBills((prev) => prev.filter((b) => b.id !== deleteModal.row.id));
    toast('Direct Purchase Bill deleted.');
    setDeleteModal({ open: false, row: null });
  };

  if (viewMode === 'form') {
    return (
      <PurchaseBillEntryDirectForm
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
        title="Purchase Bill Entry Direct"
        columns={columns}
        data={directBills}
        actions={[
          { label: 'Edit', onClick: handleOpenEdit },
          { label: 'Delete', isDanger: true, onClick: (row) => setDeleteModal({ open: true, row }) }
        ]}
        onAddEntry={handleOpenAdd}
        addEntryLabel="+ Add Purchase Bill Entry Direct"
        searchPlaceholder="Search Direct Bills..."
        showToast={toast}
        breadcrumbs={['Dashboard', 'Purchase', 'Operations', 'Purchase Bill Entry Direct']}
        emptyMessage="No Direct Purchase Bills found."
      />

      <PurchaseBillEntryDirectView
        isOpen={viewModal.open}
        onClose={() => setViewModal({ open: false, row: null })}
        data={viewModal.row}
      />

      {deleteModal.open && (
        <DeleteConfirmationModal
          isOpen={deleteModal.open}
          onClose={() => setDeleteModal({ open: false, row: null })}
          onConfirm={handleDelete}
          itemName={`Direct Bill #${deleteModal.row?.entryNo || ''}`}
        />
      )}
    </div>
  );
};

export default PurchaseBillEntryDirectList;
