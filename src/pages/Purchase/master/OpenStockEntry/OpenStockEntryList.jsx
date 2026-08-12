import React, { useState } from 'react';
import CommonTable from '../../../../components/common/CommonTable';
import DeleteConfirmationModal from '../../../../components/common/DeleteConfirmationModal';
import OpenStockEntryForm from './OpenStockEntryForm';
import { usePurchase } from '../../hooks/usePurchase';
import { inventoryApi } from '../../../../api/inventoryApi';

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

  React.useEffect(() => {
    const loadOpenStock = async () => {
      try {
        const json = await inventoryApi.getStockLedger({ module: 'OPENING_STOCK' });
        if (Array.isArray(json?.data) && json.data.length > 0) {
          const mappedEntries = json.data.map((l, idx) => ({
            id: l.ledger_id,
            openingNo: l.reference_no || String(idx + 1),
            date: new Date(l.created_at || Date.now()).toISOString().split('T')[0],
            department: 'PURCHASE STORE',
            vPrefix: 'OS',
            lines: [{
              sNo: 1,
              item: String(l.inventory_item_id),
              opStockQty: Number(l.qty_change || 0),
              unit: l.unit || 'Kg'
            }]
          }));
          setOpenStockEntries(mappedEntries);
        }
      } catch (err) {
        console.warn('Error loading opening stock entries from PostgreSQL:', err.message);
      }
    };
    loadOpenStock();
  }, []);

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

  const handleSave = async (entry) => {
    try {
      const payload = {
        remarks: `Open Stock Entry #${entry.openingNo}`,
        items: (entry.lines || []).map((l) => ({
          inventory_item_id: l.item ? Number(l.item) : 1,
          opening_stock: Number(l.opStockQty || 1),
          unit: l.unit || 'Kg'
        }))
      };

      await inventoryApi.postOpenStock(payload);
      console.log('✅ Opening Stock posted to PostgreSQL via inventoryApi.postOpenStock');
    } catch (e) {
      console.warn('Error posting opening stock to PostgreSQL:', e.message);
    }
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
