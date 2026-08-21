import React, { useState, useEffect } from 'react';
import CommonModal from '../../../../../components/common/CommonModal';
import FormCard from '../../../../../components/common/FormCard';
import CommonActionButtons from '../../../../../components/common/CommonActionButtons';

const MenuItemForm = ({ isOpen, onClose, onSave, initialData = {}, isEdit, itemGroups = [], mainGroups = [], outlets = [], taxCategories = [] }) => {
  const [fields, setFields] = useState({
    name: '',
    dispCode: '',
    itemGroup: '',
    mainGroup: '',
    unitType: 'Plate',
    outlet: '',
    price: '',
    category: 'Veg',
    rateEdit: 'No',
    discApp: 'Yes',
    kitchen: 'Main Kitchen',
    status: 'Active',
    hsnCode: '',
    taxCategory: 'Default 5%'
  });

  const groupOptions = itemGroups.map(g => g.name);
  const parentOptions = mainGroups.map(g => g.name);

  useEffect(() => {
    if (isOpen) {
      const firstOutletId = outlets.length > 0 ? outlets[0].store_id : '';
      setFields(isEdit ? {
        name: '',
        dispCode: '',
        itemGroup: groupOptions[0],
        mainGroup: parentOptions[0],
        unitType: 'Plate',
        outlet: firstOutletId,
        price: '',
        category: 'Veg',
        rateEdit: 'No',
        discApp: 'Yes',
        kitchen: 'Main Kitchen',
        status: 'Active',
        hsnCode: '',
        taxCategory: 'Default 5%',
        ...initialData
      } : {
        name: '',
        dispCode: '',
        itemGroup: groupOptions[0],
        mainGroup: parentOptions[0],
        unitType: 'Plate',
        outlet: firstOutletId,
        price: '',
        category: 'Veg',
        rateEdit: 'No',
        discApp: 'Yes',
        kitchen: 'Main Kitchen',
        status: 'Active',
        hsnCode: '',
        taxCategory: 'Default 5%'
      });
    }
  }, [isOpen, isEdit, initialData, itemGroups, mainGroups, outlets]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(fields);
  };

  return (
    <CommonModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Menu Item' : 'Add Menu Item'}
    >
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-2">
          <FormCard>
            <div className="form-grid-2">
              <div className="form-field">
                <label className="form-label">Item Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Chicken Tikka"
                  value={fields.name || ''}
                  onChange={(e) => setFields(p => ({ ...p, name: e.target.value }))}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-field">
                <label className="form-label">DISP Code *</label>
                <input
                  type="text"
                  placeholder="e.g. 101"
                  value={fields.dispCode || ''}
                  onChange={(e) => setFields(p => ({ ...p, dispCode: e.target.value }))}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-field">
                <label className="form-label">Item Group *</label>
                <select
                  value={fields.itemGroup || ''}
                  onChange={(e) => setFields(p => ({ ...p, itemGroup: e.target.value }))}
                  className="form-select"
                  required
                >
                  {groupOptions.map((g, idx) => (
                    <option key={idx} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label className="form-label">Main Group *</label>
                <select
                  value={fields.mainGroup || ''}
                  onChange={(e) => setFields(p => ({ ...p, mainGroup: e.target.value }))}
                  className="form-select"
                  required
                >
                  {parentOptions.map((g, idx) => (
                    <option key={idx} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label className="form-label">Unit Type *</label>
                <select
                  value={fields.unitType || 'Plate'}
                  onChange={(e) => setFields(p => ({ ...p, unitType: e.target.value }))}
                  className="form-select"
                  required
                >
                  <option value="Plate">Plate</option>
                  <option value="Portion">Portion</option>
                  <option value="Pcs">Pcs</option>
                  <option value="Bowl">Bowl</option>
                  <option value="Bottle">Bottle</option>
                  <option value="Cup">Cup</option>
                  <option value="Glass">Glass</option>
                </select>
              </div>

              <div className="form-field">
                <label className="form-label">Outlet *</label>
                <select
                  value={fields.outlet || (outlets.length > 0 ? outlets[0].store_id : '')}
                  onChange={(e) => setFields(p => ({ ...p, outlet: e.target.value }))}
                  className="form-select"
                  required
                >
                  {outlets.length > 0 ? outlets.map((o) => (
                    <option key={o.store_id} value={o.store_id}>{o.name}</option>
                  )) : (
                    <option value="">Loading outlets...</option>
                  )}
                </select>
              </div>

              <div className="form-field">
                <label className="form-label">Sale Rate (INR) *</label>
                <input
                  type="number"
                  placeholder="e.g. 250"
                  value={fields.price === undefined || fields.price === null ? '' : fields.price}
                  onChange={(e) => setFields(p => ({ ...p, price: e.target.value }))}
                  className="form-input"
                  required
                />
              </div>

              {/* <div className="form-field">
                <label className="form-label">Item Category *</label>
                <select
                  value={fields.category || 'Veg'}
                  onChange={(e) => setFields(p => ({ ...p, category: e.target.value }))}
                  className="form-select"
                  required
                >
                  <option value="Veg">Veg</option>
                  <option value="Non-Veg">Non-Veg</option>
                  <option value="Beverage">Beverage</option>
                </select>
              </div> */}

              <div className="form-field">
                <label className="form-label">Tax Category</label>
                <select
                  value={fields.taxCategory || 'Default 5%'}
                  onChange={(e) => setFields(p => ({ ...p, taxCategory: e.target.value }))}
                  className="form-select"
                >
                  {taxCategories.length > 0 ? taxCategories.map((t) => (
                    <option key={t.id || t.name} value={t.name}>{t.name} ({t.percentage}%)</option>
                  )) : null}
                  <option value="Default 5%">Default 5%</option>
                </select>
              </div>

              <div className="form-field">
                <label className="form-label">Rate Edit *</label>
                <select
                  value={fields.rateEdit || 'No'}
                  onChange={(e) => setFields(p => ({ ...p, rateEdit: e.target.value }))}
                  className="form-select"
                  required
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </div>

              <div className="form-field">
                <label className="form-label">DISC App *</label>
                <select
                  value={fields.discApp || 'Yes'}
                  onChange={(e) => setFields(p => ({ ...p, discApp: e.target.value }))}
                  className="form-select"
                  required
                >
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>

              <div className="form-field">
                <label className="form-label">Kitchen *</label>
                <select
                  value={fields.kitchen || 'Main Kitchen'}
                  onChange={(e) => setFields(p => ({ ...p, kitchen: e.target.value }))}
                  className="form-select"
                  required
                >
                  <option value="Main Kitchen">Main Kitchen</option>
                  <option value="Bar Kitchen">Bar Kitchen</option>
                  <option value="Chinese Kitchen">Chinese Kitchen</option>
                  <option value="Tandoori Kitchen">Tandoori Kitchen</option>
                </select>
              </div>

              <div className="form-field">
                <label className="form-label">Active *</label>
                <select
                  value={fields.status || 'Active'}
                  onChange={(e) => setFields(p => ({ ...p, status: e.target.value }))}
                  className="form-select"
                  required
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="form-field form-span-2">
                <label className="form-label">HSN Code</label>
                <input
                  type="text"
                  placeholder="e.g. 2106"
                  value={fields.hsnCode || ''}
                  onChange={(e) => setFields(p => ({ ...p, hsnCode: e.target.value }))}
                  className="form-input"
                />
              </div>
            </div>
          </FormCard>
        </div>

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

export default MenuItemForm;
