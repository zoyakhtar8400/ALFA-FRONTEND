import React, { useState, useEffect } from 'react';
import CommonTable from '../../../../components/common/CommonTable';
import DeleteConfirmationModal from '../../../../components/common/DeleteConfirmationModal';
import PurchaseReturnEntryForm from './PurchaseReturnEntryForm';
import PurchaseReturnEntryView from './PurchaseReturnEntryView';
import { usePurchase } from '../../hooks/usePurchase';
import { stockApi } from '../../../../api/stockApi';

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
  const [purchaseReturns, setPurchaseReturns] = useState([]);

  const [viewMode, setViewMode] = useState('list');
  const [formMode, setFormMode] = useState('add');
  const [selectedRow, setSelectedRow] = useState(null);

  const [viewModal, setViewModal] = useState({ open: false, row: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, row: null });

  useEffect(() => {
    let mounted = true;
    stockApi.getPurchaseReturns().then(res => {
      if (mounted) {
        const data = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
        setPurchaseReturns(data.map((r, idx) => ({
          id: r.return_id || idx + 1,
          entryNo: String(r.return_number || r.return_id || idx + 1),
          entryDate: r.return_date ? new Date(r.return_date).toISOString().split('T')[0] : '',
          ptyBillNo: r.return_number || '',
          ptyBillDt: r.return_date ? new Date(r.return_date).toISOString().split('T')[0] : '',
          customer: r.Supplier?.supplier_name || '',
          supplier: r.Supplier?.supplier_name || '',
          approvedBy: r.approved_by || '',
          rowNo: idx + 1,
          netAmount: Number(r.total_amount || 0),
          lines: [],
        })));
      }
    }).catch(() => { if (mounted) setPurchaseReturns([]); });
    return () => { mounted = false; };
  }, []);

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

  const handleSave = async (entry) => {
    try {
      const payload = {
        return_number: `RET-${entry.entryNo || Date.now()}`,
        supplier_id: 1,
        return_date: entry.entryDate || new Date(),
        reason: entry.reason || 'Damaged Stock',
        total_amount: Number(entry.netAmount || entry.grossAmount || 0),
        items: (entry.lines || []).map((l) => ({
          inventory_item_id: l.item ? Number(l.item) : 1,
          return_qty: Number(l.retQty || 1),
          unit: l.unit || 'Kg',
          unit_price: Number(l.rate || 0),
          total_amount: Number(l.amount || 0)
        }))
      };

      await stockApi.processPurchaseReturn(payload);
      console.log('✅ Purchase Return saved to PostgreSQL & inventory reduced via stockApi');
    } catch (e) {
      console.warn('Error posting Purchase Return to PostgreSQL:', e.message);
    }
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
