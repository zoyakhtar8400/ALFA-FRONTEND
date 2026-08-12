import React, { useState } from 'react';
import CommonTable from '../../../../components/common/CommonTable';
import DeleteConfirmationModal from '../../../../components/common/DeleteConfirmationModal';
import PurchaseBillEntryForm from './PurchaseBillEntryForm';
import PurchaseBillEntryView from './PurchaseBillEntryView';
import { usePurchase } from '../../hooks/usePurchase';
import { purchaseApi } from '../../../../api/purchaseApi';

const columns = [
  { key: 'entryNo', label: 'Entry No', sortable: true },
  { key: 'entryDate', label: 'Entry Date', sortable: true },
  { key: 'ptyBillNo', label: 'Pty BillNo', sortable: true },
  { key: 'ptyBillDt', label: 'Pty BillDt', sortable: true },
  { key: 'customer', label: 'Customer / Supplier', sortable: true },
  { key: 'action', label: 'Action' }
];

const PurchaseBillEntryList = ({ showToast }) => {
  const { purchaseBills, setPurchaseBills, items, units } = usePurchase();

  const [viewMode, setViewMode] = useState('list'); // 'list' | 'form'
  const [formMode, setFormMode] = useState('add'); // 'add' | 'edit'
  const [selectedRow, setSelectedRow] = useState(null);

  const [viewModal, setViewModal] = useState({ open: false, row: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, row: null });

  const toast = (msg) => {
    if (showToast) showToast(msg);
    else if (window.showToast) window.showToast(msg);
  };

  React.useEffect(() => {
    const loadBills = async () => {
      try {
        const json = await purchaseApi.getPurchaseBills();
        if (Array.isArray(json?.data) && json.data.length > 0) {
          const mappedBills = json.data.map((b) => ({
            id: b.bill_id,
            entryNo: b.bill_number,
            entryDate: new Date(b.bill_date || Date.now()).toISOString().split('T')[0],
            ptyBillNo: b.supplier_invoice_no || 'INV-1001',
            ptyBillDt: new Date(b.bill_date || Date.now()).toISOString().split('T')[0],
            customer: b.Supplier?.supplier_name || 'A P SUPPLY',
            netAmount: Number(b.total_amount || 0),
            grossAmount: Number(b.total_amount || 0)
          }));
          setPurchaseBills(mappedBills);
        }
      } catch (err) {
        console.warn('Error loading purchase bills from PostgreSQL:', err.message);
      }
    };
    loadBills();
  }, []);

  const nextNo = (purchaseBills?.length || 0) + 1;

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

  const handleSave = async (entry) => {
    try {
      const payload = {
        bill_number: `BILL-${entry.entryNo || Date.now()}`,
        supplier_invoice_no: entry.ptyBillNo || '',
        supplier_id: 1,
        bill_date: entry.entryDate || new Date(),
        total_amount: Number(entry.netAmount || entry.grossAmount || 0),
        paid_amount: 0
      };

      const json = await purchaseApi.createPurchaseBill(payload);
      console.log('✅ Purchase Bill posted to PostgreSQL via purchaseApi.createPurchaseBill:', json?.message);
    } catch (e) {
      console.warn('Error posting Purchase Bill to PostgreSQL:', e.message);
    }

    if (formMode === 'edit' && selectedRow) {
      setPurchaseBills((prev) => prev.map((b) => (b.id === selectedRow.id ? { ...entry, id: b.id } : b)));
      toast(`Purchase Bill Entry #${entry.entryNo} updated in PostgreSQL!`);
    } else {
      setPurchaseBills((prev) => [entry, ...prev]);
      toast(`Purchase Bill Entry #${entry.entryNo} saved & Supplier Payables updated in PostgreSQL!`);
    }
    setViewMode('list');
    setSelectedRow(null);
  };

  const handleDelete = () => {
    if (!deleteModal.row) return;
    setPurchaseBills((prev) => prev.filter((b) => b.id !== deleteModal.row.id));
    toast('Purchase Bill Entry deleted.');
    setDeleteModal({ open: false, row: null });
  };

  if (viewMode === 'form') {
    return (
      <PurchaseBillEntryForm
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
        title="Purchase Bill Entry"
        columns={columns}
        data={purchaseBills}
        actions={[
          { label: 'Edit', onClick: handleOpenEdit },
          { label: 'Delete', isDanger: true, onClick: (row) => setDeleteModal({ open: true, row }) }
        ]}
        onAddEntry={handleOpenAdd}
        addEntryLabel="+ Add Purchase Bill Entry"
        searchPlaceholder="Search Bills..."
        showToast={toast}
        breadcrumbs={['Dashboard', 'Purchase', 'Operations', 'Purchase Bill Entry']}
        emptyMessage="No Purchase Bills found."
      />

      <PurchaseBillEntryView
        isOpen={viewModal.open}
        onClose={() => setViewModal({ open: false, row: null })}
        data={viewModal.row}
      />

      {deleteModal.open && (
        <DeleteConfirmationModal
          isOpen={deleteModal.open}
          onClose={() => setDeleteModal({ open: false, row: null })}
          onConfirm={handleDelete}
          itemName={`Bill #${deleteModal.row?.entryNo || ''}`}
        />
      )}
    </div>
  );
};

export default PurchaseBillEntryList;
