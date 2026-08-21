import React, { useCallback } from 'react';
import CommonTable from '../../../../../components/common/CommonTable';
import DeleteConfirmationModal from '../../../../../components/common/DeleteConfirmationModal';
import DuplicateConfirmationModal from '../../../../../components/common/DuplicateConfirmationModal';
import MenuItemForm from './MenuItemForm';
import { useItemMenu } from '../useItemMenu';
import useOutletFilter from '../../../../../hooks/useOutletFilter';

const columns = [
  { key: 'name', label: 'Item Name', sortable: true },
  { key: 'outletName', label: 'Outlet', sortable: true },
  { key: 'price', label: 'Sale Rate', sortable: true, render: (v) => `₹${v}` },
  { key: 'itemGroup', label: 'Menu Category', sortable: true },
  { key: 'category', label: 'Food Type', sortable: true },
  { key: 'taxCategory', label: 'Tax', sortable: true },
  { key: 'rateEdit', label: 'Rate Edit', sortable: true },
  { key: 'discApp', label: 'DISC App', sortable: true },
  { key: 'kitchen', label: 'Kitchen', sortable: true },
  { key: 'status', label: 'Active', sortable: true, renderStatus: true, activeValue: 'Active' },
  { key: 'hsnCode', label: 'HSN Code', sortable: true }
];

const MenuItemPage = ({ showToast }) => {
  const toastTrigger = useCallback((msg) => {
    if (showToast) showToast(msg);
    else if (window.showToast) window.showToast(msg);
  }, [showToast]);

  const { outlets, outletFilter, setOutletFilter, filterData } = useOutletFilter();

  const {
    data,
    itemGroups,
    mainGroups,
    modal,
    setModal,
    deleteModal,
    setDeleteModal,
    duplicateConfirm,
    setDuplicateConfirm,
    handleSave,
    handleDelete,
    taxCategories
  } = useItemMenu('menu-item', toastTrigger);

  const handleOpenAdd = () => {
    setModal({ open: true, isEdit: false, fields: {} });
  };

  const handleOpenEdit = (row) => {
    setModal({ open: true, isEdit: true, fields: row });
  };

  // Filter menu items using common hook helper
  const filteredData = filterData(data, 'outlet');

  return (
    <div className="w-full flex flex-col p-6 animate-in fade-in duration-200">
      <CommonTable
        title="Item Menu - Menu Item Entry"
        columns={columns}
        data={filteredData}
        actions={[
          { label: 'Edit', onClick: handleOpenEdit },
          { label: 'Delete', isDanger: true, onClick: (row) => setDeleteModal({ open: true, row }) }
        ]}
        onAddEntry={handleOpenAdd}
        addEntryLabel="+ Add Menu Item Entry"
        searchPlaceholder="Search Menu Item Entry..."
        showToast={toastTrigger}
        breadcrumbs={['Dashboard', 'Point Of Sale', 'Master', 'Item Menu', 'Menu Item Entry']}
        emptyMessage="No Menu Item Entry records found."
        statusFilterKey="status"
        outletFilter={outletFilter}
        setOutletFilter={setOutletFilter}
        outletsList={outlets}
      />

      {modal.open && (
        <MenuItemForm
          isOpen={modal.open}
          onClose={() => setModal({ open: false, isEdit: false, fields: {} })}
          onSave={handleSave}
          initialData={modal.fields}
          isEdit={modal.isEdit}
          itemGroups={itemGroups}
          mainGroups={mainGroups}
          outlets={outlets}
          taxCategories={taxCategories}
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

export default MenuItemPage;
