import React, { useState, useEffect } from 'react';
import CommonModal from '../../../../components/common/CommonModal';
import CommonActionButtons from '../../../../components/common/CommonActionButtons';
import F from '../../../../components/common/F';
import { handleEnterNavigation } from '../../../../utils/keyboardNavigation';
import useDuplicateValidation from '../../../../hooks/useDuplicateValidation';

const DECIMAL_PLACES = ['0', '1', '2', '3', '4'];

const UnitMasterForm = ({ isOpen, mode, initialData, onSave, onClose, existingRecords = [] }) => {
  const [form, setForm] = useState({ name: '', qtyDecimalPlaces: '' });

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
        qtyDecimalPlaces: initialData.qtyDecimalPlaces || ''
      });
    } else {
      setForm({ name: '', qtyDecimalPlaces: '' });
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
      title={mode === 'add' ? 'Add Unit' : 'Edit Unit'}
      maxWidth="420px"
    >
      <form onKeyDown={handleEnterNavigation} onSubmit={handleSubmit} className="py-1">
        <div className="flex flex-col gap-4">

          {/* Unit Name */}
          <F
            label="Unit Name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Kilogram, Bottle, CAN"
          />

          {/* Qty. Decimal Places */}
          <F label="Qty. Decimal Places">
            <select
              value={form.qtyDecimalPlaces}
              onChange={(e) => setForm({ ...form, qtyDecimalPlaces: e.target.value })}
              className="form-select w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:border-teal-600"
            >
              <option value="">Select</option>
              {DECIMAL_PLACES.map((d) => (
                <option key={d} value={d}>{d}</option>
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

export default UnitMasterForm;
