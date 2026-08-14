import React, { useState, useEffect, useMemo } from 'react';
import CommonModal from '../../../../components/common/CommonModal';
import FormCard from '../../../../components/common/FormCard';
import CommonActionButtons from '../../../../components/common/CommonActionButtons';
import { floorService } from '../../../../services/floorService';
import posApi from '../../../../api/posApi';

const TableMasterBulkForm = ({ isOpen, onClose, onSave }) => {
  const [dbFloors, setDbFloors] = useState([]);
  const [dbOutlets, setDbOutlets] = useState([]);

  // Determine user role and open outlet
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
        const active = all.find(o => o.store_id === selectedOutletId || String(o.id) === String(selectedOutletId)) ||
                       all.find(o => /main restaurant|main/i.test(o.store_name || o.name)) ||
                       all[0];
        const openName = active?.store_name || active?.name || 'Main Restaurant';
        const options = all.map(o => o.store_name || o.name || `Outlet ${o.id}`);
        return { openName, options, isAdmin: true };
      } else {
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
    prefix: 'T',
    startNum: '1',
    endNum: '10',
    department: 'Main Restaurant',
    floor: 'Ground Floor',
    pax: '4',
    isActive: true
  });

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
        .catch(err => console.warn('Error fetching floors for TableMasterBulkForm:', err));

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
        .catch(err => console.warn('Error fetching outlets for TableMasterBulkForm:', err));
    }
    return () => { isMounted = false; };
  }, [isOpen]);

  const floorOptions = useMemo(() => {
    const defaults = ['Ground Floor', 'First Floor', 'Second Floor', 'Balcony', 'Garden'];
    const merged = new Set(dbFloors.length > 0 ? dbFloors : defaults);
    return Array.from(merged);
  }, [dbFloors]);

  useEffect(() => {
    if (isOpen) {
      setFields({
        prefix: 'T',
        startNum: '1',
        endNum: '10',
        department: outletInfo.openName || 'Main Restaurant',
        floor: dbFloors[0] || 'Ground Floor',
        pax: '4',
        isActive: true
      });
    }
  }, [isOpen, outletInfo, dbFloors]);

  const preview = useMemo(() => {
    const start = parseInt(fields.startNum);
    const end   = parseInt(fields.endNum);
    const prefix = fields.prefix.trim();
    if (!prefix || isNaN(start) || isNaN(end) || start > end || end - start > 199) return [];
    return Array.from({ length: end - start + 1 }, (_, i) => `${prefix}${start + i}`);
  }, [fields.prefix, fields.startNum, fields.endNum]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(fields);
  };

  return (
    <CommonModal isOpen={isOpen} onClose={onClose} title="Bulk Create Tables">
      <form onSubmit={handleSubmit}>
        <FormCard>
          <div className="form-grid-2">
            <div className="form-field">
              <label className="form-label">Table Prefix *</label>
              <input type="text" placeholder="e.g. T" value={fields.prefix}
                onChange={(e) => setFields(p => ({ ...p, prefix: e.target.value }))}
                className="form-input" required />
            </div>

            <div className="form-field">
              <label className="form-label">Capacity (PAX) *</label>
              <input type="number" placeholder="e.g. 4" min="1" value={fields.pax}
                onChange={(e) => setFields(p => ({ ...p, pax: e.target.value }))}
                className="form-input" required />
            </div>

            <div className="form-field">
              <label className="form-label">Starting Number *</label>
              <input type="number" placeholder="e.g. 1" min="1" value={fields.startNum}
                onChange={(e) => setFields(p => ({ ...p, startNum: e.target.value }))}
                className="form-input" required />
            </div>

            <div className="form-field">
              <label className="form-label">Ending Number *</label>
              <input type="number" placeholder="e.g. 10" min="1" value={fields.endNum}
                onChange={(e) => setFields(p => ({ ...p, endNum: e.target.value }))}
                className="form-input" required />
            </div>

            {/* Department (Open Outlet) */}
            <div className="form-field">
              <label className="form-label">Section / Department (Open Outlet) *</label>
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

            {/* Floor Name */}
            <div className="form-field">
              <label className="form-label">Floor Name</label>
              <select
                value={fields.floor || ''}
                onChange={(e) => setFields(p => ({ ...p, floor: e.target.value }))}
                className="form-select"
              >
                {floorOptions.map(fl => (
                  <option key={fl} value={fl}>{fl}</option>
                ))}
              </select>
            </div>

            <div className="form-field form-span-2 flex flex-row items-center gap-2 mt-2">
              <input type="checkbox" id="bulkIsActive" checked={fields.isActive === true}
                onChange={(e) => setFields(p => ({ ...p, isActive: e.target.checked }))}
                className="w-4 h-4 text-[#418a8b] border-slate-300 rounded focus:ring-[#418a8b]" />
              <label htmlFor="bulkIsActive" className="form-label cursor-pointer select-none mb-0 pt-0.5">Active *</label>
            </div>
          </div>

          {/* Live Preview */}
          {preview.length > 0 && (
            <div style={{ marginTop: '16px', padding: '12px 14px', background: '#f0fdfa', borderRadius: '8px', border: '1px solid #99f6e4' }}>
              <div style={{ fontSize: '11px', fontWeight: '800', color: '#0f766e', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                Preview — {preview.length} table{preview.length > 1 ? 's' : ''} will be created
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {preview.slice(0, 40).map(name => (
                  <span key={name} style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', background: '#ccfbf1', color: '#0f766e', border: '1px solid #99f6e4' }}>
                    {name}
                  </span>
                ))}
                {preview.length > 40 && (
                  <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', background: '#e2e8f0', color: '#475569' }}>
                    +{preview.length - 40} more
                  </span>
                )}
              </div>
            </div>
          )}
        </FormCard>

        <div className="mt-4">
          <CommonActionButtons onCancel={onClose} saveText={`Generate ${preview.length > 0 ? `(${preview.length})` : ''}`} />
        </div>
      </form>
    </CommonModal>
  );
};

export default TableMasterBulkForm;
