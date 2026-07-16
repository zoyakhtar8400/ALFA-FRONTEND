import { useState } from 'react';
import CommonTable from '../../../../components/common/CommonTable';
import CommonModal from '../../../../components/common/CommonModal';
import DeleteConfirmationModal from '../../../../components/common/DeleteConfirmationModal';
import CommonActionButtons from '../../../../components/common/CommonActionButtons';
import useDuplicateValidation from '../../../../hooks/useDuplicateValidation';

const EMPTY_MODAL = { open: false, mode: 'add', row: null };
const EMPTY_DELETE = { open: false, row: null };

/**
 * MasterTable acts as a simplified generic list page for basic master entries that
 * don't require their own custom React list components.
 */
const MasterTable = ({ title, columns, seed, formFields, FormComponent, showToast }) => {
  const [data, setData] = useState([...seed]);
  const [modal, setModal] = useState(EMPTY_MODAL);
  const [deleteModal, setDeleteModal] = useState(EMPTY_DELETE);
  const [form, setForm] = useState({});

  const uniqueFields = formFields ? formFields.filter(f => ['name', 'code', 'roomNo', 'regNo'].includes(f.key)).map(f => f.key) : [];
  const { isDuplicate, DuplicateModal, checkBeforeSave } = useDuplicateValidation({
    existingRecords: data,
    currentFormData: form,
    uniqueFields: uniqueFields.length > 0 ? uniqueFields : (formFields && formFields.length > 0 ? [formFields[0].key] : []),
    currentId: modal.row?.id,
    mode: modal.mode,
    onEditExisting: (item) => {
      if (FormComponent) {
        setModal({ open: true, mode: 'edit', row: item });
      } else {
        setForm({ ...item });
        setModal({ open: true, mode: 'edit', row: item });
      }
    }
  });

  const openAdd = () => {
    if (FormComponent) {
      setModal({ open: true, mode: 'add', row: null });
    } else {
      const empty = {};
      formFields.forEach(f => { empty[f.key] = f.options ? (typeof f.options[0] === 'object' ? f.options[0].value : f.options[0]) : ''; });
      setForm(empty);
      setModal({ open: true, mode: 'add', row: null });
    }
  };

  const openEdit = (row) => {
    setForm({ ...row });
    setModal({ open: true, mode: 'edit', row });
  };

  const closeModal = () => setModal(EMPTY_MODAL);

  const handleSave = (savedData) => {
    const finalData = FormComponent ? savedData : form;
    if (!finalData) { closeModal(); return; }

    // Validation for generic form input fields
    if (!FormComponent) {
      const missing = formFields.filter(f => f.type !== 'select' && f.type !== 'date').find(f => !finalData[f.key]?.trim());
      if (missing) { showToast(`Please fill in: ${missing.label}`); return; }
      if (!checkBeforeSave()) return;
    }

    if (modal.mode === 'add') {
      setData(prev => [...prev, { ...finalData, id: Date.now() }]);
      showToast(`${title} added!`);
    } else {
      setData(prev => prev.map(r => r.id === modal.row.id ? { ...finalData, id: r.id } : r));
      showToast(`${title} updated!`);
    }
    closeModal();
  };

  const handleDelete = () => {
    setData(prev => prev.filter(r => r.id !== deleteModal.row.id));
    showToast('Entry deleted.');
    setDeleteModal(EMPTY_DELETE);
  };

  const getLabel = (row) => row.name || row.code || row.roomNo || row.regNo || '';

  return (
    <>
      <CommonTable
        title={title}
        columns={columns}
        data={data}
        actions={[
          { label: 'Edit', onClick: openEdit },
          { label: 'Delete', isDanger: true, onClick: (row) => setDeleteModal({ open: true, row }) },
        ]}
        onAddEntry={openAdd}
        addEntryLabel="+ Add Entry"
        searchPlaceholder={`Search ${title}...`}
        showToast={showToast}
        breadcrumbs={['Dashboard', 'Front Desk', 'Master', title]}
      />

      {FormComponent && modal.open && (
        <FormComponent
          key={modal.row?.id || 'new'}
          isOpen={modal.open}
          mode={modal.mode}
          initialData={modal.row}
          onSave={handleSave}
          onClose={closeModal}
          showToast={showToast}
          existingRecords={data}
        />
      )}

      {!FormComponent && modal.open && (
        <CommonModal
          isOpen={modal.open}
          onClose={closeModal}
          title={modal.mode === 'add' ? `Add ${title}` : `Edit ${title}`}
        >
          {/* Body */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {formFields.map(field => (
              <div key={field.key} className={`flex flex-col gap-2 ${field.fullWidth ? 'sm:col-span-2' : ''}`}>
                <label className="text-xs font-semibold text-[#244e5f]">
                  {field.label}
                </label>
                {field.type === 'select' ? (
                  <select
                    value={form[field.key] || ''}
                    onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:border-[#418a8b] focus:ring-2 focus:ring-[#418a8b]/20 transition-all cursor-pointer"
                  >
                    {field.options.map((opt, idx) => {
                      const val = typeof opt === 'object' ? opt.value : opt;
                      const labelText = typeof opt === 'object' ? opt.label : opt;
                      return <option key={idx} value={val}>{labelText}</option>;
                    })}
                  </select>
                ) : field.type === 'date' ? (
                  <input
                    type="date"
                    value={form[field.key] || ''}
                    onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg bg-[#F8FAFC] text-gray-800 focus:outline-none focus:border-[#418a8b] focus:ring-2 focus:ring-[#418a8b]/20 transition-all"
                  />
                ) : (
                  <input
                    type={field.type || 'text'}
                    value={form[field.key] || ''}
                    onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                    placeholder={field.label}
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg bg-[#F8FAFC] text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#418a8b] focus:ring-2 focus:ring-[#418a8b]/20 transition-all"
                  />
                )}
              </div>
            ))}
          </div>

          <CommonActionButtons
            onCancel={closeModal}
            onSave={() => handleSave()}
            saveText={modal.mode === 'add' ? 'Save' : 'Update'}
            saveDisabled={isDuplicate}
          />
          <DuplicateModal />
        </CommonModal>
      )}

      <DeleteConfirmationModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal(EMPTY_DELETE)}
        onConfirm={handleDelete}
        itemName={getLabel(deleteModal.row || {})}
      />
    </>
  );
};

export default MasterTable;
