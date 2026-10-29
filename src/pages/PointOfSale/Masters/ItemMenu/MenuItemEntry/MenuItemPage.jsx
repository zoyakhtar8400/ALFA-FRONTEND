import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaFileCsv, FaTrash } from 'react-icons/fa';
import CommonTable from '../../../../../components/common/CommonTable';
import DeleteConfirmationModal from '../../../../../components/common/DeleteConfirmationModal';
import DuplicateConfirmationModal from '../../../../../components/common/DuplicateConfirmationModal';
import CommonModal from '../../../../../components/common/CommonModal';
import MenuItemForm from './MenuItemForm';
import { useItemMenu } from '../useItemMenu';
import useOutletFilter from '../../../../../hooks/useOutletFilter';

const columns = [
  { key: 'name', label: 'Item Name', sortable: true },
  {
    key: 'portions',
    label: 'Variants / Portions',
    sortable: false,
    render: (v, row) => {
      const pList = row.portions || row.variants || [];
      if (!pList || pList.length === 0) return <span style={{ color: '#94a3b8', fontSize: '11px' }}>—</span>;
      return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
          {pList.map((p, idx) => (
            <span
              key={idx}
              style={{
                background: '#e0f2fe',
                color: '#0369a1',
                border: '1px solid #bae6fd',
                fontSize: '10px',
                fontWeight: 800,
                padding: '2px 6px',
                borderRadius: '4px'
              }}
            >
              {p.name}{p.serving ? ` (${p.serving})` : ''}: ₹{p.price}
            </span>
          ))}
        </div>
      );
    }
  },
  { key: 'outletName', label: 'Outlet', sortable: true },
  { key: 'price', label: 'Sale Rate', sortable: true, render: (v) => `₹${v}` },
  { key: 'itemGroup', label: 'Menu Category', sortable: true },
  { key: 'category', label: 'Food Type', sortable: true },
  { key: 'taxCategory', label: 'Tax', sortable: true, render: (v, row) => row.taxDisplay || v },
  { key: 'rateEdit', label: 'Rate Edit', sortable: true },
  { key: 'discApp', label: 'DISC App', sortable: true },
  { key: 'kitchen', label: 'Kitchen', sortable: true },
  { key: 'status', label: 'Active', sortable: true, renderStatus: true, activeValue: 'Active' },
  { key: 'hsnCode', label: 'HSN Code', sortable: true }
];


const MenuItemPage = ({ showToast }) => {
  const navigate = useNavigate();
  const [clearAllModalOpen, setClearAllModalOpen] = useState(false);
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
    handleBulkDelete,
    handleClearAllMenu,
    fetchMenuData,
    taxCategories
  } = useItemMenu('menu-item', toastTrigger);

  const handleOpenAdd = () => {
    const defaultTax = taxCategories.find(t => String(t.percentage) === '5' || (t.name && t.name.includes('5'))) || taxCategories[0];
    const defaultTaxName = defaultTax ? defaultTax.name : '';

    setModal({
      open: true,
      isEdit: false,
      fields: {
        taxCategory: defaultTaxName
      }
    });
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
          {
            label: 'Edit',
            onClick: handleOpenEdit,
            hide: (row) => Boolean((row.is_open_item === 1 || row.rateEdit === 'Yes') && row.is_billed)
          },
          {
            label: 'Delete',
            isDanger: true,
            onClick: (row) => setDeleteModal({ open: true, row }),
            hide: (row) => Boolean((row.is_open_item === 1 || row.rateEdit === 'Yes') && row.is_billed)
          }
        ]}
        onBulkDelete={handleBulkDelete}
        onAddEntry={handleOpenAdd}
        addEntryLabel="+ Menu Item Entry"
        extraButtons={[
          {
            label: 'CSV Bulk Upload',
            onClick: () => navigate('/pos/master/item-menu/csv-upload'),
            icon: <FaFileCsv size={13} />,
            className: 'btn-secondary text-teal-800 bg-teal-50 border border-teal-300 hover:bg-teal-100 font-bold'
          }
        ]}
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

      {clearAllModalOpen && (
        <DeleteConfirmationModal
          isOpen={clearAllModalOpen}
          onClose={() => setClearAllModalOpen(false)}
          onConfirm={async () => {
            setClearAllModalOpen(false);
            await handleClearAllMenu(outletFilter !== 'All' ? outletFilter : undefined);
          }}
          itemName="All Menu Items"
          message="Are you sure you want to permanently delete / clear the overall menu from the database? This action cannot be undone."
        />
      )}
    </div>
  );
};

export default MenuItemPage;
