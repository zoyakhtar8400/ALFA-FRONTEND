import React, { useState, useEffect } from 'react';
import CommonModal from '../../../../components/common/CommonModal';
import CommonActionButtons from '../../../../components/common/CommonActionButtons';
import F from '../../../../components/common/F';
import { handleEnterNavigation } from '../../../../utils/keyboardNavigation';
import useDuplicateValidation from '../../../../hooks/useDuplicateValidation';

const TYPE_OPTIONS = [
  'Raw Material',
  'Store Item',
  'HouseKeeping',
  'Beverage',
  'Food',
  'Engineering',
  'Linen',
  'Stationery',
  'Other'
];

const POST_IN_AC_OPTIONS = [
  'CASH IN HAND',
  'Purchase A/c',
  'Purchase Return A/c',
  'Food Cost A/c',
  'Beverage Cost A/c',
  'Housekeeping Expense A/c',
  'Engineering Expense A/c',
  'Linen Expense A/c',
  'Misc Expense A/c'
];

const ItemGroupForm = ({ isOpen, mode, initialData, onSave, onClose, existingRecords = [] }) => {
  const [form, setForm] = useState({ name: '', type: '', postInAc: '' });

  const { isDuplicate, DuplicateModal, checkBeforeSave } = useDuplicateValidation({
    existingRecords,
    currentFormData: form,
    uniqueFields: ['name'],
    currentId: initialData?.id,
    mode
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || '',
        type: initialData.type || '',
        postInAc: initialData.postInAc || ''
      });
    } else {
      setForm({ name: '', type: '', postInAc: '' });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    if (!checkBeforeSave()) return;
    onSave(form);
  };

  return (
    <CommonModal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'add' ? 'Add Item Group' : 'Edit Item Group'}
      maxWidth="480px"
    >
      <form onKeyDown={handleEnterNavigation} onSubmit={handleSubmit} className="py-1">
        <div className="flex flex-col gap-4">

          {/* Item Group Name */}
          <F
            label="Item Group"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. RAW MATERIAL"
          />

          {/* Type */}
          <F label="Type">
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="form-select w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:border-teal-600"
            >
              <option value="">Select</option>
              {TYPE_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </F>

          {/* Post In A/c */}
          <F label="Post In A/c">
            <select
              value={form.postInAc}
              onChange={(e) => setForm({ ...form, postInAc: e.target.value })}
              className="form-select w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:border-teal-600"
            >
              <option value="">Select</option>
              {POST_IN_AC_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </F>

        </div>

        <div className="mt-5">
          <CommonActionButtons
            onCancel={onClose}
            saveText={mode === 'add' ? 'Save' : 'Update'}
            saveDisabled={isDuplicate}
          />
        </div>
        <DuplicateModal />
      </form>
    </CommonModal>
  );
};

export default ItemGroupForm;
