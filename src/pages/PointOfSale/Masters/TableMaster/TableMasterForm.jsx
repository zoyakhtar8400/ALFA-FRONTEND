import React, { useState, useEffect, useMemo } from 'react';
import CommonModal from '../../../../components/common/CommonModal';
import FormCard from '../../../../components/common/FormCard';
import CommonActionButtons from '../../../../components/common/CommonActionButtons';
import areaService from '../../../../services/areaService';
import posApi from '../../../../api/posApi';

const TableMasterForm = ({ isOpen, onClose, onSave, initialData = {}, isEdit }) => {
  const [dbAreas, setDbAreas] = useState([]);
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
    area: 'Main Area',
    description: '',
    isActive: true
  });

  // Fetch Areas and Outlets from backend when modal opens
  useEffect(() => {
    let isMounted = true;
    if (isOpen) {
      // 1. Areas from Area Master
      areaService.getAreas()
        .then(res => {
          let list = [];
          if (Array.isArray(res)) list = res;
          else if (Array.isArray(res?.data)) list = res.data;
          else if (Array.isArray(res?.areas)) list = res.areas;
          else if (Array.isArray(res?.data?.data)) list = res.data.data;
          else if (Array.isArray(res?.data?.areas)) list = res.data.areas;

          if (isMounted && list.length > 0) {
            const parsedAreas = list
              .filter(a => a && (a.active !== 'No' && a.isActive !== false))
              .map(a => {
                if (typeof a === 'string') return { name: a, store_id: null };
                return {
                  name: a.name || a.area_name || a.areaName || '',
                  store_id: a.store_id ? String(a.store_id).replace('STORE_', '') : null
                };
              })
              .filter(a => Boolean(a.name));
            setDbAreas(parsedAreas);
          }
        })
        .catch(err => console.warn('Error fetching areas for TableMasterForm:', err));

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

  const areaOptions = useMemo(() => {
    if (dbAreas.length > 0) {
      const activeStore = fields.store_id ? String(fields.store_id).replace('STORE_', '') : null;
      const validNames = dbAreas
        .filter(a => {
          if (!activeStore) return true;
          if (!a.store_id || a.store_id === '') return true;
          return a.store_id === activeStore;
        })
        .map(a => a.name);
        
      const merged = new Set(validNames);
      return Array.from(merged);
    }
    return [];
  }, [dbAreas, fields.store_id]);

  useEffect(() => {
    if (areaOptions.length > 0 && !areaOptions.includes(fields.area)) {
      setFields(prev => ({ ...prev, area: areaOptions[0] }));
    }
  }, [areaOptions, fields.area]);

  // Set fields on form open or edit
  useEffect(() => {
    if (isOpen) {
      const defaultDept = outletInfo.openName || 'Main Restaurant';
      const matchedStore = dbOutlets.find(o => (o.store_name || o.name) === defaultDept || o.store_id === defaultDept);
      const targetStoreId = matchedStore?.store_id || localStorage.getItem('activeOutletId') || 'STORE_1';

      const isRowActive = initialData?.isActive !== undefined
        ? Boolean(initialData.isActive)
        : (initialData?.isactive !== undefined ? (initialData.isactive !== 0 && initialData.isactive !== '0' && initialData.isactive !== false) : String(initialData?.status || '').toUpperCase() !== 'INACTIVE');

      setFields(isEdit ? {
        department: defaultDept,
        store_id: initialData?.store_id || targetStoreId,
        name: '',
        no: initialData?.no || initialData?.table_no || '',
        pax: '4',
        area: initialData?.area || initialData?.floor || (dbAreas[0]?.name || 'Main Dining Area'),
        description: '',
        prefix: initialData?.prefix || initialData?.extra_details?.prefix || '',
        ...initialData,
        isActive: isRowActive
      } : {
        department: defaultDept,
        store_id: targetStoreId,
        name: '',
        no: '',
        pax: '4',
        area: dbAreas[0]?.name || 'Main Dining Area',
        description: '',
        isActive: true,
        prefix: ''
      });
    }
  }, [isOpen, isEdit, initialData, dbAreas, outletInfo, dbOutlets]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanPrefix = (fields.prefix || '').trim();
    const cleanNo = (fields.no || '').trim();
    const resolvedName = (fields.name || '').trim() || `${cleanPrefix}${cleanNo}`;
    onSave({
      ...fields,
      name: resolvedName,
      table_name: resolvedName,
      prefix: cleanPrefix,
      no: cleanNo
    });
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
                onChange={(e) => {
                  const val = e.target.value;
                  const matched = dbOutlets.find(o => (o.store_name || o.name) === val || o.store_id === val);
                  setFields(p => ({
                    ...p,
                    department: val,
                    store_id: matched?.store_id || p.store_id || 'STORE_1'
                  }));
                }}
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

            {/* Table Prefix */}
            <div className="form-field">
              <label className="form-label">Table Prefix (e.g. M, T, B, VIP)</label>
              <input
                type="text"
                placeholder="e.g. M, T, B, VIP"
                value={fields.prefix || ''}
                onChange={(e) => {
                  const newPrefix = e.target.value;
                  setFields(p => {
                    const prevPfx = p.prefix || '';
                    const prevNo = p.no || '';
                    const updated = { ...p, prefix: newPrefix };
                    if (!isEdit && (!p.name || p.name === `${prevPfx}${prevNo}`)) {
                      updated.name = `${newPrefix}${prevNo}`;
                    }
                    return updated;
                  });
                }}
                className="form-input"
              />
            </div>

            {/* Table No */}
            <div className="form-field">
              <label className="form-label">Table No *</label>
              <input
                type="text"
                placeholder="e.g. 1, 01, 10A"
                value={fields.no || ''}
                onChange={(e) => {
                  const newNo = e.target.value;
                  setFields(p => {
                    const prevPfx = p.prefix || '';
                    const prevNo = p.no || '';
                    const updated = { ...p, no: newNo };
                    if (!isEdit && (!p.name || p.name === `${prevPfx}${prevNo}`)) {
                      updated.name = `${prevPfx}${newNo}`;
                    }
                    return updated;
                  });
                }}
                className="form-input"
                required
              />
            </div>

            {/* Table Name */}
            <div className="form-field">
              <label className="form-label">Table Name *</label>
              <input
                type="text"
                placeholder="e.g. M1, T01, Table 1"
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

            {/* Area Name */}
            <div className="form-field">
              <label className="form-label">Area Name</label>
              <select
                value={fields.area || fields.floor || ''}
                onChange={(e) => setFields(p => ({ ...p, area: e.target.value, floor: e.target.value }))}
                className="form-select"
              >
                <option value="">--Area Name--</option>
                {areaOptions.map(ar => (
                  <option key={ar} value={ar}>{ar}</option>
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
