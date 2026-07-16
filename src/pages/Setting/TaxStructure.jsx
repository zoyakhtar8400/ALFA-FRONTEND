import React, { useState } from 'react';
import CommonTable from '../../components/common/CommonTable';
import CommonModal from '../../components/common/CommonModal';
import useDuplicateValidation from '../../hooks/useDuplicateValidation';

const INITIAL_TAXES = [
  { id: 1, name: 'GST', type: 'Percentage', rate: '18%', appliedOn: 'Room Charges', status: 'Active' },
  { id: 2, name: 'Service Tax', type: 'Percentage', rate: '10%', appliedOn: 'Restaurant', status: 'Active' },
  { id: 3, name: 'Flat Fee', type: 'Fixed', rate: '₹50', appliedOn: 'Laundry', status: 'Inactive' },
];

const EMPTY_FORM = { name: '', type: 'Percentage', rate: '', appliedOn: '', status: 'Active' };

const columns = [
  { key: 'name', label: 'Tax Name' },
  { key: 'type', label: 'Type' },
  { key: 'rate', label: 'Rate' },
  { key: 'appliedOn', label: 'Applied On' },
  {
    key: 'status', label: 'Status',
    render: (val) => (
      <span className={`px-3 py-1 rounded-full text-xs font-bold ${val === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
        {val}
      </span>
    ),
  },
  { key: 'action', label: 'Actions', sortable: false },
];

const TaxStructure = ({ showToast = () => {} }) => {
  const [taxes, setTaxes] = useState(INITIAL_TAXES);
  const [modal, setModal] = useState({ open: false, mode: 'add', data: null });
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteModal, setDeleteModal] = useState({ open: false, row: null });

  const { isDuplicate, DuplicateModal, checkBeforeSave } = useDuplicateValidation({
    existingRecords: taxes,
    currentFormData: form,
    uniqueFields: ['name'],
    currentId: modal.data?.id,
    mode: modal.mode,
    onEditExisting: (item) => {
      setForm({ ...item });
      setModal({ open: true, mode: 'edit', data: item });
    }
  });

  const openAdd = () => { setForm(EMPTY_FORM); setModal({ open: true, mode: 'add', data: null }); };
  const openEdit = (row) => { setForm({ ...row }); setModal({ open: true, mode: 'edit', data: row }); };
  const closeModal = () => setModal({ open: false, mode: 'add', data: null });

  const handleSave = () => {
    if (!form.name.trim() || !form.rate.trim() || !form.appliedOn.trim()) {
      showToast('Please fill all fields.'); return;
    }
    if (!checkBeforeSave()) return;
    if (modal.mode === 'add') {
      setTaxes(prev => [...prev, { ...form, id: Date.now() }]);
      showToast('Tax added successfully!');
    } else {
      setTaxes(prev => prev.map(t => t.id === modal.data.id ? { ...form, id: t.id } : t));
      showToast('Tax updated successfully!');
    }
    closeModal();
  };

  const handleDelete = () => {
    setTaxes(prev => prev.filter(t => t.id !== deleteModal.row.id));
    showToast('Tax deleted.');
    setDeleteModal({ open: false, row: null });
  };

  const actions = [
    { label: 'Edit', onClick: openEdit },
    { label: 'Delete', isDanger: true, onClick: (row) => setDeleteModal({ open: true, row }) },
  ];

  return (
    <div>
      <CommonTable
        title="Tax Structure"
        columns={columns}
        data={taxes}
        actions={actions}
        onAddEntry={openAdd}
        addEntryLabel="+ Add Tax"
        searchPlaceholder="Search taxes..."
        showToast={showToast}
      />

      {/* Add / Edit Modal */}
      <CommonModal isOpen={modal.open} onClose={closeModal} title={modal.mode === 'add' ? 'Add Tax' : 'Edit Tax'}>
        <div className="flex flex-col gap-4">
          {[
            { label: 'Tax Name', key: 'name', placeholder: 'e.g. GST' },
            { label: 'Rate', key: 'rate', placeholder: 'e.g. 18% or ₹50' },
            { label: 'Applied On', key: 'appliedOn', placeholder: 'e.g. Room Charges' },
          ].map(({ label, key, placeholder }) => (
            <div key={key} className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">{label}</label>
              <input
                className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#418a8b] focus:ring-2 focus:ring-[#418a8b]/20"
                placeholder={placeholder}
                value={form[key]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
              />
            </div>
          ))}

          <div className="flex gap-4">
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-sm font-medium text-slate-700">Type</label>
              <select
                className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#418a8b] cursor-pointer"
                value={form.type}
                onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
              >
                <option>Percentage</option>
                <option>Fixed</option>
              </select>
            </div>
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-sm font-medium text-slate-700">Status</label>
              <select
                className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#418a8b] cursor-pointer"
                value={form.status}
                onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
              >
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-2">
            <button
              className="px-5 py-2 rounded-full text-sm font-bold border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              onClick={closeModal}
            >Cancel</button>
            <button
              className="px-5 py-2 rounded-full text-sm font-bold bg-[#418a8b] hover:bg-[#357273] text-white transition-colors"
              onClick={handleSave}
              disabled={isDuplicate}
              style={{
                cursor: isDuplicate ? 'not-allowed' : 'pointer',
                opacity: isDuplicate ? 0.6 : 1
              }}
            >Save</button>
          </div>
        </div>
        <DuplicateModal />
      </CommonModal>

      {/* Delete Confirm Modal */}
      <CommonModal isOpen={deleteModal.open} onClose={() => setDeleteModal({ open: false, row: null })} title="Confirm Delete">
        <p className="text-sm text-slate-600 mb-6">
          Are you sure you want to delete <span className="font-bold text-slate-800">{deleteModal.row?.name}</span>?
        </p>
        <div className="flex justify-end gap-3">
          <button
            className="px-5 py-2 rounded-full text-sm font-bold border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            onClick={() => setDeleteModal({ open: false, row: null })}
          >Cancel</button>
          <button
            className="px-5 py-2 rounded-full text-sm font-bold bg-red-500 hover:bg-red-600 text-white transition-colors cursor-pointer"
            onClick={handleDelete}
          >Delete</button>
        </div>
      </CommonModal>
    </div>
  );
};

export default TaxStructure;
