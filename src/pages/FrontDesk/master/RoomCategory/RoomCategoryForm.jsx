import { handleEnterNavigation } from '../../../../utils/keyboardNavigation';
import React, { useState, useEffect } from 'react';
import PageHeader from '../../../../components/common/PageHeader';
import CommonActionButtons from '../../../../components/common/CommonActionButtons';
import FormCard from '../../../../components/common/FormCard';

const RoomCategoryForm = ({ mode, initialData, onSave, onCancel }) => {
  const [form, setForm] = useState({
    name: '',
    shortName: '',
    noOfRoom: '',
    applicableDate: '',
    acName: 'Room Revenue',
    taxStructure: 'NO TAX',
    active: 'Yes',
    singleRate: '',
    doubleRate: '',
    extraAdult: '',
    tripleRate: '',
    quadrantRate: '',
    extraChild: ''
  });

  useEffect(() => {
    if (initialData) {
      setForm(initialData);
    } else {
      setForm({
        name: '',
        shortName: '',
        noOfRoom: '',
        applicableDate: '',
        acName: 'Room Revenue',
        taxStructure: 'NO TAX',
        active: 'Yes',
        singleRate: '',
        doubleRate: '',
        extraAdult: '',
        tripleRate: '',
        quadrantRate: '',
        extraChild: ''
      });
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.shortName.trim()) return;
    onSave(form);
  };

  return (
    <div className="animate-in duration-200">
      <PageHeader
        title={mode === 'add' ? 'Add Room Category' : 'Edit Room Category'}
        breadcrumbs={['Dashboard', 'Front Desk', 'Room Category', mode === 'add' ? 'Add' : 'Edit']}
        showBack
        onBack={onCancel}
      />

      <form onKeyDown={handleEnterNavigation} onSubmit={handleSubmit} className="m-6 p-4 flex flex-col gap-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card 1: Category Information */}
          <FormCard title="Category Information">
            <div className="form-grid-2">
              {/* Name */}
              <div className="form-field form-span-2">
                <label className="form-label">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Enter name"
                  required
                  className="form-input"
                />
              </div>

              {/* Short Name */}
              <div className="form-field">
                <label className="form-label">
                  Short Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.shortName}
                  onChange={e => setForm(f => ({ ...f, shortName: e.target.value }))}
                  placeholder="Enter short name"
                  required
                  className="form-input"
                />
              </div>

              {/* No. of Room */}
              <div className="form-field">
                <label className="form-label">No. of Room</label>
                <input
                  type="number"
                  value={form.noOfRoom}
                  onChange={e => setForm(f => ({ ...f, noOfRoom: e.target.value }))}
                  placeholder="Enter number"
                  className="form-input"
                />
              </div>

              {/* Applicable Date */}
              <div className="form-field">
                <label className="form-label">Applicable Date</label>
                <input
                  type="date"
                  value={form.applicableDate}
                  onChange={e => setForm(f => ({ ...f, applicableDate: e.target.value }))}
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
                  <option value="Room Revenue">Room Revenue</option>
                  <option value="Suite Revenue">Suite Revenue</option>
                  <option value="Standard Revenue">Standard Revenue</option>
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

              {/* Active */}
              <div className="form-field">
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
              {/* Single Rate */}
              <div className="form-field">
                <label className="form-label">Single Rate</label>
                <input
                  type="number"
                  value={form.singleRate}
                  onChange={e => setForm(f => ({ ...f, singleRate: e.target.value }))}
                  placeholder="0.00"
                  className="form-input"
                />
              </div>

              {/* Double Rate */}
              <div className="form-field">
                <label className="form-label">Double Rate</label>
                <input
                  type="number"
                  value={form.doubleRate}
                  onChange={e => setForm(f => ({ ...f, doubleRate: e.target.value }))}
                  placeholder="0.00"
                  className="form-input"
                />
              </div>

              {/* Extra Adult */}
              <div className="form-field">
                <label className="form-label">Extra Adult</label>
                <input
                  type="number"
                  value={form.extraAdult}
                  onChange={e => setForm(f => ({ ...f, extraAdult: e.target.value }))}
                  placeholder="0.00"
                  className="form-input"
                />
              </div>

              {/* Triple Rate */}
              <div className="form-field">
                <label className="form-label">Triple Rate</label>
                <input
                  type="number"
                  value={form.tripleRate}
                  onChange={e => setForm(f => ({ ...f, tripleRate: e.target.value }))}
                  placeholder="0.00"
                  className="form-input"
                />
              </div>

              {/* Quadrant Rate */}
              <div className="form-field">
                <label className="form-label">Quadrant Rate</label>
                <input
                  type="number"
                  value={form.quadrantRate}
                  onChange={e => setForm(f => ({ ...f, quadrantRate: e.target.value }))}
                  placeholder="0.00"
                  className="form-input"
                />
              </div>

              {/* Extra Child */}
              <div className="form-field">
                <label className="form-label">Extra Child</label>
                <input
                  type="number"
                  value={form.extraChild}
                  onChange={e => setForm(f => ({ ...f, extraChild: e.target.value }))}
                  placeholder="0.00"
                  className="form-input"
                />
              </div>
            </div>
          </FormCard>
        </div>

        <div className="mt-2 border-t border-slate-100 pt-4">
          <CommonActionButtons
            onCancel={onCancel}
            saveText={mode === 'add' ? 'Save' : 'Update'}
          />
        </div>
      </form>
    </div>
  );
};

export default RoomCategoryForm;
