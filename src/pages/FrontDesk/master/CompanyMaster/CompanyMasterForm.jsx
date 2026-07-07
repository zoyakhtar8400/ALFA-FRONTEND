import { handleEnterNavigation } from '../../../../utils/keyboardNavigation';
import { useState } from 'react';
import PageHeader from '../../../../components/common/PageHeader';
import CommonActionButtons from '../../../../components/common/CommonActionButtons';
import FormCard from '../../../../components/common/FormCard';
import useDuplicateValidation from '../../../../hooks/useDuplicateValidation';

const CITIES = [
  'Mumbai',
  'Delhi',
  'Bangalore',
  'Kolkata',
  'Chennai',
  'Hyderabad',
  'Ahmedabad',
  'Pune',
  'New York',
  'London',
  'Singapore'
];

const CompanyMasterForm = ({ mode, initialData, onSave, onCancel, existingRecords = [] }) => {
  const [form, setForm] = useState(() => ({
    name: initialData?.name || '',
    underGroup: initialData?.underGroup || 'Sundry Debtors',
    shortName: initialData?.shortName || initialData?.code || '',
    nature: initialData?.nature || 'Corporate',
    gstNumber: initialData?.gstNumber || initialData?.gstNo || '',
    contractPerson: initialData?.contractPerson || '',
    address: initialData?.address || '',
    city: initialData?.city || 'Mumbai',
    phone: initialData?.phone || '',
    mobile: initialData?.mobile || '',
    email: initialData?.email || '',
    active: initialData?.active || initialData?.status || 'Yes'
  }));

  const { isDuplicate, DuplicateModal, checkBeforeSave } = useDuplicateValidation({
    existingRecords,
    currentFormData: form,
    uniqueFields: ['name'],
    currentId: initialData?.id,
    mode
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
        title={mode === 'add' ? 'Add Company' : 'Edit Company'}
        breadcrumbs={['Dashboard', 'Front Desk', 'Company Master', mode === 'add' ? 'Add' : 'Edit']}
        showBack
        onBack={onCancel}
      />

      <form onKeyDown={handleEnterNavigation} onSubmit={handleSubmit} className="m-6 p-4 flex flex-col gap-4">
        {/* Card: Company Information in 2 column layout */}
        <FormCard title="Company Information">
          <div className="form-grid-2">
            {/* Name */}
            <div className="form-field">
              <label className="form-label">
                Company Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Alfa Group Ltd"
                required
                className="form-input"
              />
            </div>

            {/* Under Group */}
            <div className="form-field">
              <label className="form-label">Under Group</label>
              <input
                type="text"
                value={form.underGroup}
                onChange={e => setForm(f => ({ ...f, underGroup: e.target.value }))}
                placeholder="Sundry Debtors"
                className="form-input"
              />
            </div>

            {/* Short Name */}
            <div className="form-field">
              <label className="form-label">Short Name</label>
              <input
                type="text"
                value={form.shortName}
                onChange={e => setForm(f => ({ ...f, shortName: e.target.value }))}
                placeholder="e.g. ALFA"
                className="form-input"
              />
            </div>

            {/* Nature */}
            <div className="form-field">
              <label className="form-label">Nature</label>
              <input
                type="text"
                value={form.nature}
                onChange={e => setForm(f => ({ ...f, nature: e.target.value }))}
                placeholder="Corporate"
                className="form-input"
              />
            </div>

            {/* GSTIN No. */}
            <div className="form-field">
              <label className="form-label">GSTIN No.</label>
              <input
                type="text"
                value={form.gstNumber}
                onChange={e => setForm(f => ({ ...f, gstNumber: e.target.value }))}
                placeholder="e.g. 29AAAAA1111A1Z1"
                className="form-input"
              />
            </div>

            {/* Contact Person */}
            <div className="form-field">
              <label className="form-label">Contract Person</label>
              <input
                type="text"
                value={form.contractPerson}
                onChange={e => setForm(f => ({ ...f, contractPerson: e.target.value }))}
                placeholder="e.g. John Doe"
                className="form-input"
              />
            </div>

            {/* City */}
            <div className="form-field">
              <label className="form-label">City</label>
              <select
                value={form.city}
                onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                className="form-select"
              >
                {CITIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Phone */}
            <div className="form-field">
              <label className="form-label">Phone</label>
              <input
                type="text"
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="e.g. +91 22 123456"
                className="form-input"
              />
            </div>

            {/* Mobile Number */}
            <div className="form-field">
              <label className="form-label">Mobile Number</label>
              <input
                type="text"
                value={form.mobile}
                onChange={e => setForm(f => ({ ...f, mobile: e.target.value }))}
                placeholder="e.g. +91 9876543210"
                className="form-input"
              />
            </div>

            {/* Email */}
            <div className="form-field">
              <label className="form-label">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="e.g. info@alfagroup.com"
                className="form-input"
              />
            </div>

            {/* Active */}
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

            {/* Address */}
            <div className="form-field form-span-2">
              <label className="form-label">Address</label>
              <textarea
                value={form.address}
                onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                placeholder="Enter complete office address..."
                rows={3}
                className="form-textarea"
              />
            </div>
          </div>
        </FormCard>

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

export default CompanyMasterForm;
