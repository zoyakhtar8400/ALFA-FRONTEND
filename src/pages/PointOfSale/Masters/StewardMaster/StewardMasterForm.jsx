import React, { useState, useEffect } from 'react';
import CommonModal from '../../../../components/common/CommonModal';
import FormCard from '../../../../components/common/FormCard';
import CommonActionButtons from '../../../../components/common/CommonActionButtons';
import useDuplicateValidation from '../../../../hooks/useDuplicateValidation';
import { handleEnterNavigation } from '../../../../utils/keyboardNavigation';
import posApi from '../../../../api/posApi';
import areaService from '../../../../services/areaService';

const StewardMasterForm = ({
  isOpen,
  mode,
  initialData,
  onSave,
  onClose,
  existingRecords = []
}) => {
  const [form, setForm] = useState({ name: '', area: '', store_id: 'STORE_1', active: 'Yes' });
  const [outlets, setOutlets] = useState([]);
  const [areas, setAreas] = useState([]);

  // HMS Duplicate validation helper
  const { isDuplicate, DuplicateModal, checkBeforeSave } = useDuplicateValidation({
    existingRecords,
    currentFormData: form,
    uniqueFields: ['name'],
    currentId: initialData?.id,
    mode
  });

  useEffect(() => {
    posApi.getOutlets().then(res => {
      const list = res?.data || res?.stores || [];
      setOutlets(list);
    }).catch(err => console.warn('Failed to fetch outlets in StewardMasterForm', err));

    areaService.getAreas().then(res => {
      const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
      setAreas(list);
    }).catch(err => console.warn('Failed to fetch areas in StewardMasterForm', err));
  }, []);

  useEffect(() => {
    const activeOutlet = localStorage.getItem('activeOutletId') || 'STORE_1';
    if (initialData) {
      setForm({
        name: initialData.name || '',
        area: initialData.area || '',
        store_id: initialData.store_id || activeOutlet,
        active: initialData.active || 'Yes'
      });
    } else {
      setForm({ name: '', area: '', store_id: activeOutlet, active: 'Yes' });
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    if (!checkBeforeSave()) return;

    // Pass updated form data back to page action
    onSave(form);
  };

  return (
    <CommonModal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'add' ? 'Add Steward Master' : 'Edit Steward Master'}
    >
      <form onKeyDown={handleEnterNavigation} onSubmit={handleSubmit}>
        <FormCard>
          <div className="form-grid-2">
            {/* Steward Name Input */}
            <div className="form-field">
              <label className="form-label">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter steward name"
                value={form.name}
                onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                required
                minLength={2}
                maxLength={50}
                className="form-input"
              />
            </div>


            {/* Outlet Selector */}
            <div className="form-field">
              <label className="form-label">
                Outlet <span className="text-red-500">*</span>
              </label>
              <select
                value={form.store_id}
                onChange={(e) => setForm(prev => ({ ...prev, store_id: e.target.value }))}
                className="form-select"
                required
              >
                {outlets.length === 0 && <option value="STORE_1">Main Restaurant</option>}
                {outlets.map(o => (
                  <option key={o.store_id || o.id} value={o.store_id || o.id}>
                    {o.store_name || o.name || `Outlet ${o.id}`}
                  </option>
                ))}
              </select>
            </div>
            {/* Assigned Area Selector */}
            <div className="form-field">
              <label className="form-label">
                Assigned Dining Area
              </label>
              <select
                value={form.area || ''}
                onChange={(e) => setForm(prev => ({ ...prev, area: e.target.value }))}
                className="form-select"
              >
                <option value="">All Dining Areas</option>
                {areas.map(a => {
                  const aName = a.name || a.area_name || a;
                  return <option key={a.id || aName} value={aName}>{aName}</option>;
                })}
              </select>
            </div>

            {/* Active Status Select */}
            <div className="form-field">
              <label className="form-label">Active Status</label>
              <select
                value={form.active}
                onChange={(e) => setForm(prev => ({ ...prev, active: e.target.value }))}
                className="form-select"
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
          </div>
        </FormCard>

        {/* Footer Actions */}
        <div className="mt-4">
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

export default StewardMasterForm;
export { StewardMasterForm };
