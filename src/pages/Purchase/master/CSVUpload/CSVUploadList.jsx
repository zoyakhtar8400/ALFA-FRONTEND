import React, { useState } from 'react';
import CommonTable from '../../../../components/common/CommonTable';
import DeleteConfirmationModal from '../../../../components/common/DeleteConfirmationModal';
import CSVUploadForm from './CSVUploadForm';
import { usePurchase } from '../../hooks/usePurchase';

const columns = [
  { key: 'name', label: 'Item Name', sortable: true },
  { key: 'unitName', label: 'Unit', sortable: true },
  { key: 'active', label: 'Active', sortable: true, renderStatus: true, activeValue: 'Yes' },
  { key: 'itemCategory', label: 'Item Category', sortable: true },
  { key: 'itemGroupName', label: 'Item Group', sortable: true },
  { key: 'storeDepartment', label: 'Store Department', sortable: true },
  { key: 'lotBatchNo', label: 'Lot No Applicable', sortable: true },
  { key: 'conversionUnit', label: 'Conv Unit', sortable: true },
  { key: 'action', label: 'Action' }
];

const CSVUploadList = ({ showToast }) => {
  const { items, setItems } = usePurchase();
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ open: false, row: null });

  const toast = (msg) => {
    if (showToast) showToast(msg);
    else if (window.showToast) window.showToast(msg);
  };

  const handleImport = (validRows) => {
    const newItems = validRows.map((r, idx) => ({
      id: Date.now() + idx,
      name: r.ItemName,
      unitName: r.Unit || 'K.G.',
      active: r.Active || 'Yes',
      itemCategory: r.ItemCategory || 'PURCHASE 0%',
      itemGroupName: r.ItemGroup || 'RAW MATERIAL',
      storeDepartment: r.StoreDepartment || 'PURCHASE',
      lotBatchNo: r.LotNoApplicable || 'Yes',
      conversionUnit: r.ConvUnit || r.Unit || 'K.G.',
      maxLevel: '',
      minLevel: '',
      reOrderLevel: '',
      poMandatory: 'Yes',
      convRatio: '1',
      moq: '',
      description: '',
      hsnSacCode: ''
    }));

    setItems((prev) => [...newItems, ...prev]);
    toast(`Successfully imported ${newItems.length} items from CSV!`);
    setModalOpen(false);
  };

  const handleDelete = () => {
    if (!deleteModal.row) return;
    setItems((prev) => prev.filter((i) => i.id !== deleteModal.row.id));
    toast('Item deleted.');
    setDeleteModal({ open: false, row: null });
  };

  return (
    <div className="w-full flex flex-col p-6 animate-in fade-in duration-200">
      <CommonTable
        title="Purchase Item Entry Upload"
        columns={columns}
        data={items}
        actions={[
          { label: 'Delete', isDanger: true, onClick: (row) => setDeleteModal({ open: true, row }) }
        ]}
        onAddEntry={() => setModalOpen(true)}
        addEntryLabel="+ Upload Item CSV"
        searchPlaceholder="Search Items..."
        showToast={toast}
        breadcrumbs={['Dashboard', 'Purchase', 'Master', 'Purchase Item Entry Upload']}
        emptyMessage="No Items uploaded."
      />

      <CSVUploadForm
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onImport={handleImport}
        showToast={toast}
      />

      {deleteModal.open && (
        <DeleteConfirmationModal
          isOpen={deleteModal.open}
          onClose={() => setDeleteModal({ open: false, row: null })}
          onConfirm={handleDelete}
          itemName={deleteModal.row?.name || ''}
        />
      )}
    </div>
  );
};

export default CSVUploadList;
