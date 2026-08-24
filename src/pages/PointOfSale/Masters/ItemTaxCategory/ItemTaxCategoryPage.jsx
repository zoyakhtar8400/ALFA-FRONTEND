import React, { useCallback } from 'react';
import CommonTable from '../../../../components/common/CommonTable';
import DeleteConfirmationModal from '../../../../components/common/DeleteConfirmationModal';
import DuplicateConfirmationModal from '../../../../components/common/DuplicateConfirmationModal';
import ItemTaxCategoryForm from './ItemTaxCategoryForm';
import { useItemTaxCategory } from './useItemTaxCategory';

const formatDateToDMY = (dateStr) => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  if (!year || !month || !day) return dateStr;
  return `${day}-${month}-${year}`;
};

const columns = [
  { key: 'name', label: 'Category Name', sortable: true },
  { key: 'applicableDate', label: 'Applicable Date', sortable: true, render: (v) => formatDateToDMY(v) },
  { key: 'department', label: 'Department', sortable: true },
  { 
    key: 'taxes', 
    label: 'Taxes', 
    sortable: false,
    render: (v) => (v && Array.isArray(v)) ? v.map(t => `${t.taxName} (${t.percentage})`).join(', ') : '' 
  },
  { key: 'status', label: 'Status', sortable: true, renderStatus: true, activeValue: 'Active' }
];

const ItemTaxCategoryPage = ({ showToast }) => {
  const toastTrigger = useCallback((msg) => {
    if (showToast) showToast(msg);
    else if (window.showToast) window.showToast(msg);
  }, [showToast]);

  const {
    data,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    modal,
    setModal,
    deleteModal,
    setDeleteModal,
    duplicateConfirm,
    setDuplicateConfirm,
    handleSave,
    handleDelete
  } = useItemTaxCategory(toastTrigger);

  const handleOpenAdd = () => {
    setModal({ 
      open: true, 
      isEdit: false, 
      fields: {
        applicableDate: new Date().toISOString().split('T')[0],
        department: 'Restaurant',
        status: 'Active',
        taxes: [
          { taxName: 'GST', percentage: '5', postAccount: 'GST Output A/c' }
        ]
      } 
    });
  };

  const handleOpenEdit = (row) => {
    setModal({ open: true, isEdit: true, fields: row });
  };

  return (
    <div className="w-full flex flex-col p-6 animate-in fade-in duration-200">
      {modal.open ? (
        <ItemTaxCategoryForm
          isOpen={modal.open}
          onClose={() => setModal({ open: false, isEdit: false, fields: {} })}
          onSave={handleSave}
          initialData={modal.fields}
          isEdit={modal.isEdit}
        />
      ) : (
        <CommonTable
          title="Item Category Master"
          columns={columns}
          data={data}
          actions={[
            { label: 'Edit', onClick: handleOpenEdit },
            { label: 'Delete', isDanger: true, onClick: (row) => setDeleteModal({ open: true, row }) }
          ]}
          onAddEntry={handleOpenAdd}
          addEntryLabel="+ Add Item Category"
          searchPlaceholder="Search category name or department..."
          showToast={toastTrigger}
          breadcrumbs={['Dashboard', 'Point Of Sale', 'Master', 'Item Category']}
          emptyMessage="No Item Category Records Found"
          statusFilterKey="status"
        />
      )}

      {deleteModal.open && (
        <DeleteConfirmationModal
          isOpen={deleteModal.open}
          onClose={() => setDeleteModal({ open: false, row: null })}
          onConfirm={handleDelete}
          itemName={deleteModal.row?.name || ''}
        />
      )}

      {duplicateConfirm.open && (
        <DuplicateConfirmationModal
          isOpen={duplicateConfirm.open}
          onClose={() => setDuplicateConfirm({ open: false, fields: null, duplicateItem: null })}
          onEditExisting={() => {
            const item = duplicateConfirm.duplicateItem;
            setDuplicateConfirm({ open: false, fields: null, duplicateItem: null });
            setModal({ open: true, isEdit: true, fields: item });
          }}
          itemName={duplicateConfirm.duplicateItem?.name || ''}
        />
      )}
    </div>
  );
};

export default ItemTaxCategoryPage;
export { ItemTaxCategoryPage };
