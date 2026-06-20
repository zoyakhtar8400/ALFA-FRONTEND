import React, { useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import CustomTable from './CustomTable';
import ConfirmModal from '../../../../components/common/ConfirmModal';

const EMPTY_MODAL = { open: false, mode: 'add', row: null };
const EMPTY_DELETE = { open: false, row: null };

const StatusBadge = ({ value, activeValue }) => {
  const isActive = activeValue ? value === activeValue : value === 'Active' || value === 'Yes';
  return <span className={`status-badge ${isActive ? 'available' : 'occupied'}`}>{value}</span>;
};

const MasterTable = ({ title, columns, seed, formFields, FormComponent, showToast }) => {
  const [data, setData] = useState([...seed]);
  const [modal, setModal] = useState(EMPTY_MODAL);
  const [deleteModal, setDeleteModal] = useState(EMPTY_DELETE);
  const [form, setForm] = useState({});

  const cols = columns.map(col =>
    col.renderStatus
      ? { ...col, render: (val) => <StatusBadge value={val} activeValue={col.activeValue} /> }
      : col
  );

  const openAdd = () => {
    if (FormComponent) {
      setModal({ open: true, mode: 'add', row: null });
    } else {
      const empty = {};
      formFields.forEach(f => { empty[f.key] = f.options ? f.options[0] : ''; });
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
    if (FormComponent) {
      if (!savedData) { closeModal(); return; }
      if (modal.mode === 'add') {
        setData(prev => [...prev, { ...savedData, id: Date.now() }]);
        showToast(`${title} added!`);
      } else {
        setData(prev => prev.map(r => r.id === modal.row.id ? { ...savedData, id: r.id } : r));
        showToast(`${title} updated!`);
      }
      closeModal();
    } else {
      const missing = formFields.filter(f => f.type === 'text').find(f => !form[f.key]?.trim());
      if (missing) { showToast(`Please fill in: ${missing.label}`); return; }
      if (modal.mode === 'add') {
        setData(prev => [...prev, { ...form, id: Date.now() }]);
        showToast(`${title} added!`);
      } else {
        setData(prev => prev.map(r => r.id === modal.row.id ? { ...form, id: r.id } : r));
        showToast(`${title} updated!`);
      }
      closeModal();
    }
  };

  const handleDelete = () => {
    setData(prev => prev.filter(r => r.id !== deleteModal.row.id));
    showToast('Entry deleted.');
    setDeleteModal(EMPTY_DELETE);
  };

  const getLabel = (row) => row.name || row.code || row.roomNo || row.regNo || '';

  return (
    <>
      <CustomTable
        title={title}
        columns={cols}
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
          isOpen={modal.open}
          mode={modal.mode}
          initialData={modal.row}
          onSave={handleSave}
          onClose={closeModal}
          showToast={showToast}
        />
      )}

      {!FormComponent && modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(15,23,42,0.18)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}>
          <div className="bg-white rounded-2xl p-10 w-full max-w-[640px] shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex justify-between items-center pb-4 mb-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-[#244e5f]">
                {modal.mode === 'add' ? `Add ${title}` : `Edit ${title}`}
              </h3>
              <button 
                onClick={closeModal} 
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-full transition-all"
              >
                <FaTimes size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {formFields.map(field => (
                <div key={field.key} className={`flex flex-col ${field.fullWidth ? 'sm:col-span-2' : ''}`}>
                  <label className="text-xs font-semibold text-[#244e5f] mb-1.5 block">
                    {field.label}
                  </label>
                  {field.type === 'select' ? (
                    <select
                      value={form[field.key] || ''}
                      onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                      className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:border-[#418a8b] focus:ring-2 focus:ring-[#418a8b]/20 transition-all cursor-pointer"
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
                      className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg bg-[#F8FAFC] text-gray-800 focus:outline-none focus:border-[#418a8b] focus:ring-2 focus:ring-[#418a8b]/20 transition-all"
                    />
                  ) : (
                    <input
                      type={field.type || 'text'}
                      value={form[field.key] || ''}
                      onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                      placeholder={field.label}
                      className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg bg-[#F8FAFC] text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#418a8b] focus:ring-2 focus:ring-[#418a8b]/20 transition-all"
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Footer Actions */}
            <div className="flex justify-end gap-3 mt-8 pt-5 border-t border-gray-100">
              <button
                type="button"
                onClick={closeModal}
                className="px-5 py-2 text-sm font-semibold rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSave(form)}
                className="px-5 py-2 text-sm font-semibold rounded-full bg-[#418a8b] hover:bg-[#357273] text-white shadow-sm hover:shadow-md transition-all cursor-pointer"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal(EMPTY_DELETE)}
        onConfirm={handleDelete}
        message={`Delete "${getLabel(deleteModal.row || {})}"? This cannot be undone.`}
      />
    </>
  );
};

export default MasterTable;
