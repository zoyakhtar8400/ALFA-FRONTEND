import React, { useState, useEffect, useMemo } from 'react';
import CommonModal from '../../../../components/common/CommonModal';
import FormCard from '../../../../components/common/FormCard';
import CommonActionButtons from '../../../../components/common/CommonActionButtons';

const TableMasterBulkForm = ({ isOpen, onClose, onSave }) => {
  const [fields, setFields] = useState({
    prefix: 'T',
    startNum: '1',
    endNum: '10',
    department: 'Restaurant',
    floor: 'Dining',
    pax: '4',
    isActive: true
  });

  useEffect(() => {
    if (isOpen) {
      setFields({ prefix: 'T', startNum: '1', endNum: '10', department: 'Restaurant', floor: 'Dining', pax: '4', isActive: true });
    }
  }, [isOpen]);

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

            <div className="form-field">
              <label className="form-label">Section (Department) *</label>
              <select value={fields.department}
                onChange={(e) => setFields(p => ({ ...p, department: e.target.value }))}
                className="form-select" required>
                <option value="Restaurant">Restaurant</option>
              </select>
            </div>

            <div className="form-field">
              <label className="form-label">Table Type *</label>
              <select value={fields.floor}
                onChange={(e) => setFields(p => ({ ...p, floor: e.target.value }))}
                className="form-select" required>
                <option value="">--Select Table Type--</option>
                <option value="Dining">Dining</option>
                <option value="Bar Stool">Bar Stool</option>
                <option value="Lounge">Lounge</option>
                <option value="Banquet">Banquet</option>
                <option value="Cafe">Cafe</option>
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
