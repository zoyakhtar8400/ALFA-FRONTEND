import React, { useState, useEffect } from 'react';
import CommonModal from '../../../../components/common/CommonModal';
import FormCard from '../../../../components/common/FormCard';
import CommonActionButtons from '../../../../components/common/CommonActionButtons';
import { handleEnterNavigation } from '../../../../utils/keyboardNavigation';

const PAYMENT_TYPES = [
  { value: 'CASH', label: 'Cash' },
  { value: 'CARD', label: 'Credit / Debit Card' },
  { value: 'UPI', label: 'UPI / QR Code' },
  { value: 'WALLET', label: 'Digital Wallet' },
  { value: 'CREDIT', label: 'Due / Room Credit' },
  { value: 'ONLINE', label: 'Online / Gateway' },
  { value: 'OTHER', label: 'Other' }
];

const PaymentMasterForm = ({ isOpen, onClose, onSave, initialData = {}, isEdit }) => {
  const [fields, setFields] = useState({
    name: '',
    type: 'CASH',
    charge_percent: 0,
    is_quick_pay: true,
    description: '',
    active: 'Yes',
    isActive: true
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData && Object.keys(initialData).length > 0) {
        setFields({
          name: initialData.name || initialData.payment_mode_name || '',
          type: initialData.type || 'CASH',
          charge_percent: initialData.charge_percent !== undefined ? initialData.charge_percent : 0,
          is_quick_pay: initialData.is_quick_pay !== false,
          description: initialData.description || '',
          active: initialData.active || (initialData.isActive !== false ? 'Yes' : 'No'),
          isActive: initialData.active !== 'No' && initialData.isActive !== false,
          ...initialData
        });
      } else {
        setFields({
          name: '',
          type: 'CASH',
          charge_percent: 0,
          is_quick_pay: true,
          description: '',
          active: 'Yes',
          isActive: true
        });
      }
    }
  }, [isOpen, initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!fields.name.trim()) return;
    onSave({
      ...fields,
      active: fields.isActive ? 'Yes' : 'No'
    });
  };

  return (
    <CommonModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Payment Mode' : 'Add Payment Mode'}
    >
      <form onKeyDown={handleEnterNavigation} onSubmit={handleSubmit}>
        <FormCard>
          <div className="form-grid-2">
            {/* Payment Mode Name */}
            <div className="form-field">
              <label className="form-label">
                Payment Mode Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Cash, Visa Card, GPay UPI, Swiggy Pay"
                value={fields.name || ''}
                onChange={(e) => setFields((prev) => ({ ...prev, name: e.target.value }))}
                required
                className="form-input"
                autoFocus
              />
            </div>

            {/* Payment Type */}
            <div className="form-field">
              <label className="form-label">Payment Category / Type</label>
              <select
                value={fields.type || 'CASH'}
                onChange={(e) => setFields((prev) => ({ ...prev, type: e.target.value }))}
                className="form-select"
              >
                {PAYMENT_TYPES.map(pt => (
                  <option key={pt.value} value={pt.value}>{pt.label}</option>
                ))}
              </select>
            </div>

            {/* Surcharge / Charge % */}
            <div className="form-field">
              <label className="form-label">Surcharge / Fee (%)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                placeholder="0.00"
                value={fields.charge_percent !== undefined ? fields.charge_percent : ''}
                onChange={(e) => setFields((prev) => ({ ...prev, charge_percent: e.target.value }))}
                className="form-input"
              />
            </div>

            {/* Active Status */}
            <div className="form-field">
              <label className="form-label">Active</label>
              <select
                value={fields.active || (fields.isActive ? 'Yes' : 'No')}
                onChange={(e) => {
                  const val = e.target.value;
                  setFields((prev) => ({
                    ...prev,
                    active: val,
                    isActive: val === 'Yes'
                  }));
                }}
                className="form-select"
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>

            {/* Quick Pay Bar Display */}
            <div className="form-field form-span-2 flex items-center gap-2 mt-1">
              <input
                type="checkbox"
                id="isQuickPay"
                checked={fields.is_quick_pay !== false}
                onChange={(e) => setFields(prev => ({ ...prev, is_quick_pay: e.target.checked }))}
                className="w-4 h-4 text-[#418a8b] border-slate-300 rounded focus:ring-[#418a8b]"
              />
              <label htmlFor="isQuickPay" className="form-label cursor-pointer select-none mb-0 pt-0.5 font-bold text-slate-700">
                Show as Quick Primary Button in POS Billing Bar
              </label>
            </div>

            {/* Description */}
            <div className="form-field form-span-2">
              <label className="form-label">Description / Instructions</label>
              <textarea
                rows={2}
                placeholder="Optional notes or instructions about this payment method"
                value={fields.description || ''}
                onChange={(e) => setFields((prev) => ({ ...prev, description: e.target.value }))}
                className="form-input"
                style={{ resize: 'vertical' }}
              />
            </div>
          </div>
        </FormCard>

        <div className="mt-4">
          <CommonActionButtons
            onCancel={onClose}
            saveText={isEdit ? 'Update' : 'Save'}
          />
        </div>
      </form>
    </CommonModal>
  );
};

export default PaymentMasterForm;
