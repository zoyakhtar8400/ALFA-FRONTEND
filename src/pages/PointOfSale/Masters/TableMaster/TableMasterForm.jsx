import React, { useState, useEffect, useMemo } from 'react';
import CommonModal from '../../../../components/common/CommonModal';
import FormCard from '../../../../components/common/FormCard';
import CommonActionButtons from '../../../../components/common/CommonActionButtons';
import { floorService } from '../../../../services/floorService';
import posApi from '../../../../api/posApi';

const TableMasterForm = ({ isOpen, onClose, onSave, initialData = {}, isEdit }) => {
  const [dbFloors, setDbFloors] = useState([]);
  const [dbOutlets, setDbOutlets] = useState([]);
  const [activeOutletName, setActiveOutletName] = useState('Main Restaurant');

  // Determine user role and accessible outlets
  const outletInfo = useMemo(() => {
    try {
      const userRaw = localStorage.getItem('alfa_user') || localStorage.getItem('user');
      const selectedOutletId = localStorage.getItem('activeOutletId');

      let isAdmin = true;
      let assignedOutletIds = [];
      let userStoreId = 'STORE_1';

      if (userRaw) {
        const u = JSON.parse(userRaw);
        isAdmin = String(u.role || u.type || '').toUpperCase() === 'ADMIN' || u.username === 'admin';
        assignedOutletIds = Array.isArray(u.assigned_outlets) && u.assigned_outlets.length > 0
          ? u.assigned_outlets
          : [u.store_id || 'STORE_1'];
        userStoreId = u.store_id || 'STORE_1';
      }

      const all = dbOutlets.length > 0
        ? dbOutlets
        : [{ id: 1, store_id: 'STORE_1', name: 'Main Restaurant', store_name: 'Main Restaurant' }];

      if (isAdmin) {
        // Admin: Show currently selected/open outlet (or Main Restaurant) and all outlets
        const active = all.find(o => o.store_id === selectedOutletId || String(o.id) === String(selectedOutletId)) ||
                       all.find(o => /main restaurant|main/i.test(o.store_name || o.name)) ||
                       all[0];
        const openName = active?.store_name || active?.name || 'Main Restaurant';
        const options = all.map(o => o.store_name || o.name || `Outlet ${o.id}`);
        return { openName, options, isAdmin: true };
      } else {
        // Staff: ONLY show the outlet(s) assigned to / open by this staff
        const staffOutlets = all.filter(o => 
          assignedOutletIds.includes(o.store_id) || 
          assignedOutletIds.includes(String(o.id)) ||
          o.store_id === userStoreId
        );
        const validList = staffOutlets.length > 0 ? staffOutlets : [all[0]];
        const active = validList.find(o => o.store_id === selectedOutletId) || validList[0];
        const openName = active?.store_name || active?.name || 'Main Restaurant';
        const options = validList.map(o => o.store_name || o.name || `Outlet ${o.id}`);
        return { openName, options, isAdmin: false };
      }
    } catch (e) {
      return { openName: 'Main Restaurant', options: ['Main Restaurant'], isAdmin: true };
    }
  }, [dbOutlets]);

  const [fields, setFields] = useState({
    department: 'Main Restaurant',
    name: '',
    pax: '4',
    floor: 'Ground Floor',
    description: '',
    isActive: true
  });

  // Fetch Floors and Outlets from backend when modal opens
  useEffect(() => {
    let isMounted = true;
    if (isOpen) {
      // 1. Floors
      floorService.getFloors()
        .then(res => {
          const list = res?.data || res?.floors || (Array.isArray(res) ? res : []);
          if (isMounted && Array.isArray(list) && list.length > 0) {
            setDbFloors(list.filter(f => f.active !== 'No').map(f => f.name));
          }
        })
        .catch(err => console.warn('Error fetching floors for TableMasterForm:', err));

      // 2. Outlets
      posApi.getOutlets()
        .then(res => {
          const stores = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
          if (isMounted && Array.isArray(stores) && stores.length > 0) {
            setDbOutlets(stores.map(s => ({
              id: s.id,
              store_id: s.store_id || `STORE_${s.id}`,
              name: s.store_name || s.name || `Outlet ${s.id}`,
              store_name: s.store_name || s.name || `Outlet ${s.id}`
            })));
          }
        })
        .catch(err => console.warn('Error fetching outlets for TableMasterForm:', err));
    }
    return () => { isMounted = false; };
  }, [isOpen]);

  const floorOptions = useMemo(() => {
    const defaults = ['Ground Floor', 'First Floor', 'Second Floor', 'Balcony', 'Garden'];
    const merged = new Set(dbFloors.length > 0 ? dbFloors : defaults);
    if (fields.floor) merged.add(fields.floor);
    return Array.from(merged);
  }, [dbFloors, fields.floor]);

  // Set fields on form open or edit
  useEffect(() => {
    if (isOpen) {
      const defaultDept = outletInfo.openName || 'Main Restaurant';
      setFields(isEdit ? {
        department: defaultDept,
        name: '',
        pax: '4',
        floor: 'Ground Floor',
        description: '',
        isActive: true,
        ...initialData
      } : {
        department: defaultDept,
        name: '',
        pax: '4',
        floor: dbFloors[0] || 'Ground Floor',
        description: '',
        isActive: true
      });
    }
  }, [isOpen, isEdit, initialData, dbFloors, outletInfo]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(fields);
  };

  return (
    <CommonModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Table' : 'Add Table'}
    >
      <form onSubmit={handleSubmit}>
        <FormCard>
          <div className="form-grid-2">
            {/* Department (Open Outlet) */}
            <div className="form-field">
              <label className="form-label">Department (Open Outlet) *</label>
              <select
                value={fields.department || outletInfo.openName || ''}
                onChange={(e) => setFields(p => ({ ...p, department: e.target.value }))}
                className="form-select"
                required
              >
                {outletInfo.options.map(opt => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {/* Table Name */}
            <div className="form-field">
              <label className="form-label">Table Name *</label>
              <input
                type="text"
                placeholder="e.g. Table 01, T10A"
                value={fields.name || ''}
                onChange={(e) => setFields(p => ({ ...p, name: e.target.value }))}
                className="form-input"
                required
              />
            </div>
            
            {/* PAX Capacity */}
            <div className="form-field">
              <label className="form-label">PAX *</label>
              <input
                type="number"
                placeholder="Enter seating capacity"
                value={fields.pax !== undefined ? fields.pax : ''}
                onChange={(e) => setFields(p => ({ ...p, pax: e.target.value }))}
                className="form-input"
                required
              />
            </div>

            {/* Floor Name */}
            <div className="form-field">
              <label className="form-label">Floor Name</label>
              <select
                value={fields.floor || ''}
                onChange={(e) => setFields(p => ({ ...p, floor: e.target.value }))}
                className="form-select"
              >
                <option value="">--Floor Name--</option>
                {floorOptions.map(fl => (
                  <option key={fl} value={fl}>{fl}</option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div className="form-field form-span-2">
              <label className="form-label">Description</label>
              <input
                type="text"
                placeholder="Enter table description"
                value={fields.description || ''}
                onChange={(e) => setFields(p => ({ ...p, description: e.target.value }))}
                className="form-input"
              />
            </div>

            {/* Active Status */}
            <div className="form-field form-span-2 flex flex-row items-center gap-2 mt-2">
              <input
                type="checkbox"
                id="isActive"
                checked={fields.isActive === true}
                onChange={(e) => setFields(p => ({ ...p, isActive: e.target.checked }))}
                className="w-4 h-4 text-[#418a8b] border-slate-300 rounded focus:ring-[#418a8b]"
              />
              <label htmlFor="isActive" className="form-label cursor-pointer select-none mb-0 pt-0.5">
                Active (YES)
              </label>
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

export default TableMasterForm;
