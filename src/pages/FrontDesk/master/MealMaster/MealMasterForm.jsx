import { handleEnterNavigation } from '../../../../utils/keyboardNavigation';
import { useState } from 'react';
import PageHeader from '../../../../components/common/PageHeader';
import CommonActionButtons from '../../../../components/common/CommonActionButtons';
import FormCard from '../../../../components/common/FormCard';
import useDuplicateValidation from '../../../../hooks/useDuplicateValidation';

const MealMasterForm = ({ mode, initialData, onSave, onCancel, existingRecords = [], onEditExisting }) => {
  const [form, setForm] = useState(() => ({
    name: initialData?.name || '',
    acName: initialData?.acName || 'Food Revenue',
    taxStructure: initialData?.taxStructure || 'NO TAX',
    active: initialData?.active || 'Yes',
    singleRate: initialData?.singleRate || '',
    doubleRate: initialData?.doubleRate || '',
    extraAdult: initialData?.extraAdult || '',
    tripleRate: initialData?.tripleRate || '',
    quadrantRate: initialData?.quadrantRate || '',
    extraChild: initialData?.extraChild || ''
  }));

  const { isDuplicate, DuplicateModal, checkBeforeSave } = useDuplicateValidation({
    existingRecords,
    currentFormData: form,
    uniqueFields: ['name'],
    currentId: initialData?.id,
    mode,
    onEditExisting
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    if (!checkBeforeSave()) return;
    onSave(form);
  };

  return (
    <div className="animate-in duration-200">
      <PageHeader
        title={mode === 'add' ? 'Add Meal Plan' : 'Edit Meal Plan'}
        breadcrumbs={['Dashboard', 'Front Desk', 'Meal Master', mode === 'add' ? 'Add' : 'Edit']}
        showBack
        onBack={onCancel}
      />

      <form onKeyDown={handleEnterNavigation} onSubmit={handleSubmit} className="m-6 p-4 flex flex-col gap-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card 1: Basic Information */}
          <FormCard title="Basic Information">
            <div className="form-grid-2">
              {/* Meal Plan Name */}
              <div className="form-field form-span-2">
                <label className="form-label">
                  Meal Plan Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  required
                  placeholder="e.g. American Plan"
                  className="form-input"
                />
              </div>

              {/* A/c Name */}
              <div className="form-field">
                <label className="form-label">A/c Name</label>
                <select
                  value={form.acName}
                  onChange={e => setForm(f => ({ ...f, acName: e.target.value }))}
                  className="form-select"
                >
                  <option value="Food Revenue">Food Revenue</option>
                  <option value="Beverage Revenue">Beverage Revenue</option>
                </select>
              </div>

              {/* Tax Structure */}
              <div className="form-field">
                <label className="form-label">Tax Structure</label>
                <select
                  value={form.taxStructure}
                  onChange={e => setForm(f => ({ ...f, taxStructure: e.target.value }))}
                  className="form-select"
                >
                  <option value="NO TAX">NO TAX</option>
                  <option value="TAX @5%">TAX @5%</option>
                  <option value="TAX @12%">TAX @12%</option>
                  <option value="TAX @18%">TAX @18%</option>
                </select>
              </div>

              {/* Active Status */}
              <div className="form-field form-span-2">
                <label className="form-label">Active</label>
                <select
                  value={form.active}
                  onChange={e => setForm(f => ({ ...f, active: e.target.value }))}
                  className="form-select"
                >
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
            </div>
          </FormCard>

          {/* Card 2: Rate Structure */}
          <FormCard title="Rate Structure">
            <div className="form-grid-2">
              {[
                { label: 'Single Rate', key: 'singleRate' },
                { label: 'Double Rate', key: 'doubleRate' },
                { label: 'Extra Adult', key: 'extraAdult' },
                { label: 'Triple Rate', key: 'tripleRate' },
                { label: 'Quadrant Rate', key: 'quadrantRate' },
                { label: 'Extra Child', key: 'extraChild' }
              ].map(({ label, key }) => (
                <div key={key} className="form-field">
                  <label className="form-label">{label}</label>
                  <input
                    type="number"
                    value={form[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    placeholder="0.00"
                    className="form-input"
                  />
                </div>
              ))}
            </div>
          </FormCard>
        </div>

        <div className="mt-2 border-t border-slate-100 pt-4">
          <CommonActionButtons
            onCancel={onCancel}
            saveText={mode === 'add' ? 'Save' : 'Update'}
            saveDisabled={isDuplicate}
          />
        </div>
        <DuplicateModal />
      </form>
    </div>
  );
};

export default MealMasterForm;
