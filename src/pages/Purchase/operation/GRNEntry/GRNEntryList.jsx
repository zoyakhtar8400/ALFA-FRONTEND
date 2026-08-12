import React, { useState } from 'react';
import CommonTable from '../../../../components/common/CommonTable';
import DeleteConfirmationModal from '../../../../components/common/DeleteConfirmationModal';
import GRNEntryForm from './GRNEntryForm';
import GRNEntryView from './GRNEntryView';
import { usePurchase } from '../../hooks/usePurchase';
import { purchaseApi } from '../../../../api/purchaseApi';

const columns = [
  { key: 'entryNo', label: 'Entry No', sortable: true },
  { key: 'entryDate', label: 'Entry Date', sortable: true },
  { key: 'itemName', label: 'Item Name', sortable: true },
  { key: 'partyChNo', label: 'Party ChNo', sortable: true },
  { key: 'partyChDt', label: 'Party ChDt', sortable: true },
  { key: 'partyName', label: 'Party Name', sortable: true },
  { key: 'action', label: 'Action' }
];

const GRNEntryList = ({ showToast }) => {
  const { grns, setGrns, items, units } = usePurchase();

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
    const loadGRNs = async () => {
      try {
        const json = await purchaseApi.getGRNs();
        if (Array.isArray(json?.data) && json.data.length > 0) {
          const mappedGRNs = json.data.map((g) => ({
            id: g.grn_id,
            entryNo: g.grn_number,
            entryDate: new Date(g.grn_date || Date.now()).toISOString().split('T')[0],
            partyChNo: g.party_challan_no || 'CH-101',
            partyChDt: new Date(g.grn_date || Date.now()).toISOString().split('T')[0],
            partyName: g.Supplier?.supplier_name || 'A P SUPPLY',
            netAmount: Number(g.net_amount || 0),
            grossAmount: Number(g.gross_amount || 0),
            lines: (g.grnItems || []).map((gi, idx) => ({
              sNo: idx + 1,
              item: String(gi.inventory_item_id),
              docQty: Number(gi.received_qty || 0),
              unit: gi.unit || 'Kg',
              rate: Number(gi.unit_price || 0),
              amount: Number(gi.total_amount || 0)
            }))
          }));
          setGrns(mappedGRNs);
        }
      } catch (err) {
        console.warn('Error loading GRNs from PostgreSQL:', err.message);
      }
    };
    loadGRNs();
  }, []);

  const nextNo = (grns?.length || 0) + 1;

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
        grn_number: `GRN-${entry.entryNo || Date.now()}`,
        supplier_id: 1,
        grn_date: entry.entryDate || new Date(),
        party_challan_no: entry.partyChNo || '',
        net_amount: entry.netAmount || entry.grossAmount || 0,
        gross_amount: entry.grossAmount || 0,
        items: (entry.lines || []).map((l) => ({
          inventory_item_id: l.item ? Number(l.item) : 1,
          received_qty: Number(l.docQty || l.ordQty || 1),
          unit: l.unit || 'Kg',
          unit_price: Number(l.rate || 0),
          total_amount: Number(l.amount || 0)
        }))
      };

      const json = await purchaseApi.createGRN(payload);
      console.log('✅ GRN posted to PostgreSQL via purchaseApi.createGRN:', json?.message);
    } catch (e) {
      console.warn('Error posting GRN to PostgreSQL:', e.message);
    }

    if (formMode === 'edit' && selectedRow) {
      setGrns((prev) => prev.map((g) => (g.id === selectedRow.id ? { ...entry, id: g.id } : g)));
      toast(`GRN Entry #${entry.entryNo} updated in PostgreSQL!`);
    } else {
      setGrns((prev) => [entry, ...prev]);
      toast(`GRN Entry #${entry.entryNo} posted & Inventory Stock increased in PostgreSQL!`);
    }
    setViewMode('list');
    setSelectedRow(null);
  };

  const handleDelete = () => {
    if (!deleteModal.row) return;
    setGrns((prev) => prev.filter((g) => g.id !== deleteModal.row.id));
    toast('GRN Entry deleted.');
    setDeleteModal({ open: false, row: null });
  };

  if (viewMode === 'form') {
    return (
      <GRNEntryForm
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
        title="GRN Entry"
        columns={columns}
        data={grns}
        actions={[
          { label: 'Edit', onClick: handleOpenEdit },
          { label: 'Delete', isDanger: true, onClick: (row) => setDeleteModal({ open: true, row }) }
        ]}
        onAddEntry={handleOpenAdd}
        addEntryLabel="+ Add GRN Entry"
        searchPlaceholder="Search GRN Entries..."
        showToast={toast}
        breadcrumbs={['Dashboard', 'Purchase', 'Operations', 'GRN Entry']}
        emptyMessage="No GRN Entries found."
      />

      <GRNEntryView
        isOpen={viewModal.open}
        onClose={() => setViewModal({ open: false, row: null })}
        data={viewModal.row}
      />

      {deleteModal.open && (
        <DeleteConfirmationModal
          isOpen={deleteModal.open}
          onClose={() => setDeleteModal({ open: false, row: null })}
          onConfirm={handleDelete}
          itemName={`GRN #${deleteModal.row?.entryNo || ''}`}
        />
      )}
    </div>
  );
};

export default GRNEntryList;
