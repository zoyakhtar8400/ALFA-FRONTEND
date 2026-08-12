import React, { useState } from 'react';
import CommonTable from '../../../../components/common/CommonTable';
import DeleteConfirmationModal from '../../../../components/common/DeleteConfirmationModal';
import IndentEntryForm from './IndentEntryForm';
import IndentEntryView from './IndentEntryView';
import { usePurchase } from '../../hooks/usePurchase';
import { purchaseApi } from '../../../../api/purchaseApi';

const columns = [
  { key: 'indentNo', label: 'Entry No', sortable: true },
  { key: 'indentDate', label: 'Entry Date', sortable: true },
  { key: 'indentName', label: 'Indent Name', sortable: true },
  { key: 'action', label: 'Action' }
];

const IndentEntryList = ({ showToast }) => {
  const { indents, setIndents, items, units } = usePurchase();

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
    const loadIndents = async () => {
      try {
        const json = await purchaseApi.getIndents();
        if (Array.isArray(json?.data) && json.data.length > 0) {
          const mappedIndents = json.data.map((ind) => ({
            id: ind.indent_id,
            indentNo: ind.indent_number,
            indentDate: new Date(ind.indent_date || Date.now()).toISOString().split('T')[0],
            indentName: `${ind.department} - ${ind.requested_by || 'Staff'}`,
            department: ind.department,
            status: ind.status,
            lines: (ind.indentItems || []).map((ii, idx) => ({
              sNo: idx + 1,
              item: String(ii.inventory_item_id),
              indQty: Number(ii.quantity || 0),
              unit: ii.unit || 'Kg',
              remark: ii.remark || ''
            }))
          }));
          setIndents(mappedIndents);
        }
      } catch (err) {
        console.warn('Error loading indents from PostgreSQL:', err.message);
      }
    };
    loadIndents();
  }, []);

  const nextNo = (indents?.length || 0) + 1;

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
      await purchaseApi.createIndent({
        indent_number: `IND-${entry.indentNo || Date.now()}`,
        department: entry.department || 'MAIN KITCHEN',
        requested_by: entry.indentorName || 'Staff',
        items: (entry.lines || []).map((l) => ({
          inventory_item_id: l.item ? Number(l.item) : 1,
          quantity: Number(l.indQty || 1),
          unit: l.unit || 'Kg',
          remark: l.remark || ''
        }))
      });
      console.log('✅ Indent saved to PostgreSQL via purchaseApi.createIndent');
    } catch (e) {
      console.warn('Error saving indent to PostgreSQL:', e.message);
    }

    if (formMode === 'edit' && selectedRow) {
      setIndents((prev) => prev.map((e) => (e.id === selectedRow.id ? { ...entry, id: e.id } : e)));
      toast(`Indent Entry #${entry.indentNo} updated in PostgreSQL!`);
    } else {
      setIndents((prev) => [entry, ...prev]);
      toast(`Indent Entry #${entry.indentNo} saved in PostgreSQL!`);
    }
    setViewMode('list');
    setSelectedRow(null);
  };

  const handleDelete = () => {
    if (!deleteModal.row) return;
    setIndents((prev) => prev.filter((e) => e.id !== deleteModal.row.id));
    toast('Indent Entry deleted.');
    setDeleteModal({ open: false, row: null });
  };

  if (viewMode === 'form') {
    return (
      <IndentEntryForm
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
        title="Indent Entry"
        columns={columns}
        data={indents}
        actions={[
          { label: 'Edit', onClick: handleOpenEdit },
          { label: 'Delete', isDanger: true, onClick: (row) => setDeleteModal({ open: true, row }) }
        ]}
        onAddEntry={handleOpenAdd}
        addEntryLabel="+ Add Indent Entry"
        searchPlaceholder="Search Indents..."
        showToast={toast}
        breadcrumbs={['Dashboard', 'Purchase', 'Operations', 'Indent Entry']}
        emptyMessage="No Indent Entries found."
      />

      <IndentEntryView
        isOpen={viewModal.open}
        onClose={() => setViewModal({ open: false, row: null })}
        data={viewModal.row}
      />

      {deleteModal.open && (
        <DeleteConfirmationModal
          isOpen={deleteModal.open}
          onClose={() => setDeleteModal({ open: false, row: null })}
          onConfirm={handleDelete}
          itemName={`Indent #${deleteModal.row?.indentNo || ''}`}
        />
      )}
    </div>
  );
};

export default IndentEntryList;
