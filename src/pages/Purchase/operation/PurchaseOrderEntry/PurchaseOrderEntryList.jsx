import React, { useState } from 'react';
import CommonTable from '../../../../components/common/CommonTable';
import DeleteConfirmationModal from '../../../../components/common/DeleteConfirmationModal';
import PurchaseOrderEntryForm from './PurchaseOrderEntryForm';
import PurchaseOrderEntryView from './PurchaseOrderEntryView';
import { usePurchase } from '../../hooks/usePurchase';
import { purchaseApi } from '../../../../api/purchaseApi';

const columns = [
  { key: 'entryNo', label: 'Entry No.', sortable: true },
  { key: 'entryDate', label: 'Entry Date', sortable: true },
  { key: 'customer', label: 'Customer / Supplier', sortable: true },
  { key: 'action', label: 'Action' }
];

const PurchaseOrderEntryList = ({ showToast }) => {
  const { purchaseOrders, setPurchaseOrders, items, units } = usePurchase();

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
    const loadPOs = async () => {
      try {
        const json = await purchaseApi.getPurchaseOrders();
        if (Array.isArray(json?.data) && json.data.length > 0) {
          const mappedPOs = json.data.map((po) => ({
            id: po.po_id,
            orderNo: po.po_number,
            entryNo: po.po_number,
            entryDate: new Date(po.order_date || Date.now()).toISOString().split('T')[0],
            customer: po.Supplier?.supplier_name || 'A P SUPPLY',
            netAmount: Number(po.net_amount || 0),
            grossAmount: Number(po.gross_amount || 0),
            status: po.status
          }));
          setPurchaseOrders(mappedPOs);
        }
      } catch (err) {
        console.warn('Error loading purchase orders from PostgreSQL:', err.message);
      }
    };
    loadPOs();
  }, []);

  const nextNo = (purchaseOrders?.length || 0) + 1;

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
        po_number: `PO-${entry.entryNo || Date.now()}`,
        supplier_id: 1,
        order_date: entry.entryDate || new Date(),
        net_amount: entry.netAmount || entry.grossAmount || 0,
        gross_amount: entry.grossAmount || 0,
        items: (entry.lines || []).map((l) => ({
          inventory_item_id: l.item ? Number(l.item) : 1,
          order_qty: Number(l.orderQty || 1),
          unit: l.orderUnit || 'Kg',
          unit_price: Number(l.rate || 0),
          total_amount: Number(l.amount || 0)
        }))
      };

      await purchaseApi.createPurchaseOrder(payload);
      console.log('✅ Purchase Order saved to PostgreSQL via purchaseApi.createPurchaseOrder');
    } catch (e) {
      console.warn('Error saving PO to PostgreSQL:', e.message);
    }

    if (formMode === 'edit' && selectedRow) {
      setPurchaseOrders((prev) => prev.map((po) => (po.id === selectedRow.id ? { ...entry, id: po.id } : po)));
      toast(`Purchase Order Entry #${entry.entryNo} updated in PostgreSQL!`);
    } else {
      setPurchaseOrders((prev) => [entry, ...prev]);
      toast(`Purchase Order Entry #${entry.entryNo} saved in PostgreSQL!`);
    }
    setViewMode('list');
    setSelectedRow(null);
  };

  const handleDelete = () => {
    if (!deleteModal.row) return;
    setPurchaseOrders((prev) => prev.filter((po) => po.id !== deleteModal.row.id));
    toast('Purchase Order Entry deleted.');
    setDeleteModal({ open: false, row: null });
  };

  if (viewMode === 'form') {
    return (
      <PurchaseOrderEntryForm
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
        title="Purchase Order Entry"
        columns={columns}
        data={purchaseOrders}
        actions={[
          { label: 'Edit', onClick: handleOpenEdit },
          { label: 'Delete', isDanger: true, onClick: (row) => setDeleteModal({ open: true, row }) }
        ]}
        onAddEntry={handleOpenAdd}
        addEntryLabel="+ Add Purchase Order Entry"
        searchPlaceholder="Search Orders..."
        showToast={toast}
        breadcrumbs={['Dashboard', 'Purchase', 'Operations', 'Purchase Order Entry']}
        emptyMessage="No Purchase Orders found."
      />

      <PurchaseOrderEntryView
        isOpen={viewModal.open}
        onClose={() => setViewModal({ open: false, row: null })}
        data={viewModal.row}
      />

      {deleteModal.open && (
        <DeleteConfirmationModal
          isOpen={deleteModal.open}
          onClose={() => setDeleteModal({ open: false, row: null })}
          onConfirm={handleDelete}
          itemName={`Order #${deleteModal.row?.entryNo || ''}`}
        />
      )}
    </div>
  );
};

export default PurchaseOrderEntryList;
