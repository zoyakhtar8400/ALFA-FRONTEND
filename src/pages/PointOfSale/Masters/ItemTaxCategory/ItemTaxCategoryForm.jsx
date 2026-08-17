import React, { useState, useEffect } from 'react';
import PageHeader from '../../../../components/common/PageHeader';
import CommonActionButtons from '../../../../components/common/CommonActionButtons';
import F from '../../../../components/common/F';
import { FaFolderOpen, FaPercentage } from 'react-icons/fa';

const ItemTaxCategoryForm = ({ isOpen, onClose, onSave, initialData = {}, isEdit }) => {
  const [fields, setFields] = useState({
    name: '',
    applicableDate: '',
    department: '',
    taxes: [],
    status: 'Active'
  });

  useEffect(() => {
    if (isOpen) {
      setFields(isEdit ? {
        name: '',
        applicableDate: '',
        department: '',
        taxes: [],
        status: 'Active',
        ...initialData
      } : {
        name: '',
        applicableDate: new Date().toISOString().split('T')[0],
        department: '',
        taxes: [
          { taxName: '', percentage: '', postAccount: '' }
        ],
        status: 'Active'
      });
    }
  }, [isOpen, isEdit, initialData]);

  const handleAddTaxRow = () => {
    setFields(p => ({
      ...p,
      taxes: [...(p.taxes || []), { taxName: '', percentage: '', postAccount: '' }]
    }));
  };

  const handleRemoveTaxRow = (index) => {
    setFields(p => ({
      ...p,
      taxes: (p.taxes || []).filter((_, i) => i !== index)
    }));
  };

  const handleTaxRowChange = (index, field, value) => {
    setFields(p => {
      const newTaxes = [...(p.taxes || [])];
      newTaxes[index] = { ...newTaxes[index], [field]: value };
      return { ...p, taxes: newTaxes };
    });
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    onSave(fields);
  };

  const sectionTitle = (icon, title) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '2px 0 4px', borderBottom: '2px solid var(--primary)', marginBottom: '8px' }}>
      <span style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', color: 'var(--primary)' }}>{icon}</span>
      <span style={{ fontWeight: 700, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--primary)' }}>{title}</span>
    </div>
  );

  const cardStyle = {
    background: 'var(--card-bg, #fff)',
    border: '1px solid var(--border)',
    borderRadius: '6px',
    padding: '10px 14px'
  };

  return (
    <div className="animate-in duration-200" style={{ padding: '0 8px', fontFamily: 'var(--font-family, system-ui)' }}>
      {/* Hide ALL scrollbars globally for a premium desktop app feel */}
      <style dangerouslySetInnerHTML={{
        __html: `
        ::-webkit-scrollbar {
          display: none !important;
          width: 0px !important;
          height: 0px !important;
        }
        * {
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
        }
      `}} />

      <PageHeader
        title={isEdit ? 'Edit Item Category' : 'Add Item Category'}
        breadcrumbs={['Dashboard', 'Point Of Sale', 'Master', 'Item Category', isEdit ? 'Edit' : 'Add']}
        showBack
        onBack={onClose}
        style={{ marginBottom: '8px', paddingBottom: '2px' }}
      />

      <form onSubmit={handleSubmit} style={{ padding: '0 8px 4px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '4fr 6fr', gap: '10px', alignItems: 'start', marginBottom: '10px' }}>

          {/* LEFT COLUMN: Category Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={cardStyle}>
              {sectionTitle(<FaFolderOpen />, 'Category Details')}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '4px 8px' }}>
                <F label="Category Name" required value={fields.name} onChange={val => setFields(p => ({ ...p, name: val }))} style={{ marginBottom: 0 }} inputStyle={{ height: '34px' }} />

                <F label="Applicable Date" required type="date" value={fields.applicableDate} onChange={val => setFields(p => ({ ...p, applicableDate: val }))} style={{ marginBottom: 0 }} inputStyle={{ height: '34px' }} />

                <F label="Department" required style={{ marginBottom: 0 }}>
                  <select
                    value={fields.department || ''}
                    onChange={e => setFields(p => ({ ...p, department: e.target.value }))}
                    className="form-select"
                    style={{ fontSize: '0.9rem', padding: '4px 6px', height: '34px' }}
                    required
                  >
                    <option value="Restaurant">Restaurant</option>
                  </select>
                </F>

                <F label="Status" style={{ marginBottom: 0 }}>
                  <select
                    value={fields.status || 'Active'}
                    onChange={e => setFields(p => ({ ...p, status: e.target.value }))}
                    className="form-select"
                    style={{ fontSize: '0.9rem', padding: '4px 6px', height: '34px' }}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </F>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Taxes Config Table */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={cardStyle}>
              {sectionTitle(<FaPercentage />, 'Item Tax Category Details')}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="py-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tax Name</th>
                      <th className="py-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Per %</th>
                      <th className="py-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tax Post A/c</th>
                      <th className="py-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right" style={{ width: '80px' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(fields.taxes || []).map((tax, idx) => (
                      <tr key={idx} className="border-b border-slate-100 last:border-b-0">
                        <td className="py-2 pr-2">
                          <input
                            type="text"
                            placeholder="e.g. CGST"
                            value={tax.taxName || ''}
                            onChange={(e) => handleTaxRowChange(idx, 'taxName', e.target.value)}
                            className="form-input"
                            style={{ padding: '6px 12px', fontSize: '13px', height: '34px' }}
                            required
                          />
                        </td>
                        <td className="py-2 pr-2">
                          <input
                            type="text"
                            placeholder="e.g. 2.5% or 9"
                            value={tax.percentage || ''}
                            onChange={(e) => handleTaxRowChange(idx, 'percentage', e.target.value)}
                            className="form-input"
                            style={{ padding: '6px 12px', fontSize: '13px', height: '34px' }}
                            required
                          />
                        </td>
                        <td className="py-2 pr-2">
                          <input
                            type="text"
                            placeholder="e.g. Tax Posting Account"
                            value={tax.postAccount || ''}
                            onChange={(e) => handleTaxRowChange(idx, 'postAccount', e.target.value)}
                            className="form-input"
                            style={{ padding: '6px 12px', fontSize: '13px', height: '34px' }}
                            required
                          />
                        </td>
                        <td className="py-2 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveTaxRow(idx)}
                            className="text-red-500 hover:text-red-700 text-xs font-semibold px-2 py-1"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                    {(fields.taxes || []).length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-4 text-center text-slate-400 text-sm">
                          No taxes configured for this category.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <button
                type="button"
                onClick={handleAddTaxRow}
                className="mt-3 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded transition-colors"
              >
                + Add Tax Row
              </button>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div style={{ marginTop: '12px' }}>
          <CommonActionButtons
            onSave={handleSubmit}
            onCancel={onClose}
            saveText={isEdit ? 'Update' : 'Save'}
          />
        </div>
      </form>
    </div>
  );
};

export default ItemTaxCategoryForm;
