import React, { useState, useEffect } from 'react';
import PageHeader from '../../../../components/common/PageHeader';
import CommonActionButtons from '../../../../components/common/CommonActionButtons';
import F from '../../../../components/common/F';
import { handleEnterNavigation } from '../../../../utils/keyboardNavigation';
import { FaClipboardList, FaBoxes, FaPlus, FaTrash } from 'react-icons/fa';

const DEPARTMENTS = [
  'MAIN KITCHEN',
  'PURCHASE STORE',
  'DISPENSE BAR',
  'GARDENIA ROOFTOP',
  'HOUSEKEEPING',
  'FRONT OFFICE',
  'MAINTENANCE'
];

const emptyLine = () => ({ id: Date.now() + Math.random(), item: '', unit: '', quantity: '', rate: '', amount: '' });

const OpenStockEntryForm = ({
  mode = 'add',
  initialData,
  onSave,
  onCancel,
  items = [],
  units = [],
  nextNo = 1
}) => {
  const [openingNo, setOpeningNo] = useState(nextNo);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [department, setDepartment] = useState('MAIN KITCHEN');
  const [vPrefix, setVPrefix] = useState('OPN');
  const [lines, setLines] = useState([emptyLine()]);

  useEffect(() => {
    if (initialData) {
      setOpeningNo(initialData.openingNo || nextNo);
      setDate(initialData.date || new Date().toISOString().split('T')[0]);
      setDepartment(initialData.department || 'MAIN KITCHEN');
      setVPrefix(initialData.vPrefix || 'OPN');
      setLines(initialData.lines && initialData.lines.length > 0 ? initialData.lines : [emptyLine()]);
    } else {
      setOpeningNo(nextNo);
      setDate(new Date().toISOString().split('T')[0]);
      setDepartment('MAIN KITCHEN');
      setVPrefix('OPN');
      setLines([emptyLine()]);
    }
  }, [initialData, nextNo]);

  const updateLine = (idx, key, value) => {
    setLines((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [key]: value };

      if (key === 'quantity' || key === 'rate') {
        const qty = parseFloat(key === 'quantity' ? value : updated[idx].quantity) || 0;
        const rate = parseFloat(key === 'rate' ? value : updated[idx].rate) || 0;
        updated[idx].amount = (qty * rate).toFixed(2);
      }

      if (key === 'item') {
        const found = items.find((i) => i.name === value);
        if (found) updated[idx].unit = found.unitName || '';
      }

      return updated;
    });
  };

  const addLine = () => setLines((prev) => [...prev, emptyLine()]);
  const removeLine = (idx) => setLines((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!department) return;
    const validLines = lines.filter((l) => l.item && l.quantity);
    if (!validLines.length) return;

    onSave({
      id: initialData?.id || Date.now(),
      openingNo,
      date,
      department,
      vPrefix,
      lines: validLines.map((l, i) => ({
        ...l,
        sNo: i + 1,
        quantity: parseFloat(l.quantity) || 0,
        rate: parseFloat(l.rate) || 0,
        amount: parseFloat(l.amount) || 0
      }))
    });
  };

  const sectionTitle = (icon, title) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '2px 0 6px', borderBottom: '2px solid var(--primary, #418a8b)', marginBottom: '12px' }}>
      <span style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', color: 'var(--primary, #418a8b)' }}>{icon}</span>
      <span style={{ fontWeight: 700, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--primary, #418a8b)' }}>{title}</span>
    </div>
  );

  const selectStyle = { fontSize: '0.88rem', height: '34px', padding: '4px 8px' };
  const inputStyle = { fontSize: '0.88rem', height: '34px', padding: '4px 8px' };

  return (
    <div className="animate-in duration-200" style={{ padding: '0 8px' }}>
      {/* Scrollbar reset styling */}
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
        title={mode === 'add' ? 'Add Open Stock Entry' : 'Edit Open Stock Entry'}
        breadcrumbs={['Dashboard', 'Purchase', 'Master', 'Open Stock Entry', mode === 'add' ? 'Add' : 'Edit']}
        showBack
        onBack={onCancel}
        style={{ marginBottom: '8px', paddingBottom: '2px' }}
      />

      <form onKeyDown={handleEnterNavigation} onSubmit={handleSubmit} style={{ padding: '0 4px 12px' }}>
        
        {/* Card 1: Entry Header Information */}
        <div style={{ background: 'var(--card-bg, #fff)', border: '1px solid var(--border, #e2e8f0)', borderRadius: '6px', padding: '12px 16px', marginBottom: '12px' }}>
          {sectionTitle(<FaClipboardList />, 'Entry Details')}
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px 12px' }}>
            
            {/* Entry No */}
            <F label="Entry No *">
              <input
                type="text"
                value={openingNo}
                readOnly
                className="form-input"
                style={{ ...inputStyle, background: 'var(--bg-light, #f8fafc)', cursor: 'not-allowed', fontWeight: 700 }}
              />
            </F>

            {/* Entry Date */}
            <F label="Entry Date *">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="form-input"
                style={inputStyle}
              />
            </F>

            {/* Department */}
            <F label="Department *">
              <select
                className="form-select"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                required
                style={selectStyle}
              >
                <option value="">Select Department</option>
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </F>

            {/* V Prefix */}
            <F label="V Prefix">
              <input
                type="text"
                value={vPrefix}
                onChange={(e) => setVPrefix(e.target.value)}
                placeholder="e.g. OPN"
                className="form-input"
                style={inputStyle}
              />
            </F>

          </div>
        </div>

        {/* Card 2: Stock Item Grid */}
        <div style={{ background: 'var(--card-bg, #fff)', border: '1px solid var(--border, #e2e8f0)', borderRadius: '6px', padding: '12px 16px', marginBottom: '12px' }}>
          {sectionTitle(<FaBoxes />, 'Stock Items Detail Grid')}

          <div style={{ overflowX: 'auto', marginBottom: '12px', border: '1px solid var(--border, #e2e8f0)', borderRadius: '6px' }}>
            <table className="w-full text-xs" style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-light, #f8fafc)', borderBottom: '1px solid var(--border, #e2e8f0)', color: '#475569' }}>
                  <th style={{ padding: '8px 12px', textAlign: 'center', width: '50px' }}>S No</th>
                  <th style={{ padding: '8px 12px', textAlign: 'left', minWidth: '200px' }}>Item Name *</th>
                  <th style={{ padding: '8px 12px', textAlign: 'left', width: '130px' }}>Unit</th>
                  <th style={{ padding: '8px 12px', textAlign: 'right', width: '120px' }}>Quantity *</th>
                  <th style={{ padding: '8px 12px', textAlign: 'right', width: '120px' }}>Rate (₹)</th>
                  <th style={{ padding: '8px 12px', textAlign: 'right', width: '130px' }}>Amount (₹)</th>
                  <th style={{ padding: '8px 12px', textAlign: 'center', width: '50px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {lines.map((line, idx) => (
                  <tr key={line.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '6px 12px', textAlign: 'center', fontWeight: 600, color: '#64748b' }}>{idx + 1}</td>
                    
                    {/* Item Selection */}
                    <td style={{ padding: '6px 8px' }}>
                      <select
                        className="form-select"
                        value={line.item}
                        onChange={(e) => updateLine(idx, 'item', e.target.value)}
                        style={{ ...selectStyle, height: '30px', minWidth: '180px', fontWeight: 700, color: '#0f172a', background: '#fff' }}
                      >
                        <option value="">Select Item</option>
                        {items.map((i) => (
                          <option key={i.id || i.name} value={i.name}>{i.name}</option>
                        ))}
                      </select>
                    </td>

                    {/* Unit */}
                    <td style={{ padding: '6px 8px' }}>
                      <select
                        className="form-select"
                        value={line.unit}
                        onChange={(e) => updateLine(idx, 'unit', e.target.value)}
                        style={{ ...selectStyle, height: '30px' }}
                      >
                        <option value="">Select Unit</option>
                        {units.map((u) => (
                          <option key={u.id || u.name} value={u.name}>{u.name}</option>
                        ))}
                      </select>
                    </td>

                    {/* Quantity */}
                    <td style={{ padding: '6px 8px' }}>
                      <input
                        type="number"
                        value={line.quantity}
                        onChange={(e) => updateLine(idx, 'quantity', e.target.value)}
                        placeholder="0"
                        className="form-input"
                        style={{ ...inputStyle, height: '30px', textAlign: 'right' }}
                      />
                    </td>

                    {/* Rate */}
                    <td style={{ padding: '6px 8px' }}>
                      <input
                        type="number"
                        value={line.rate}
                        onChange={(e) => updateLine(idx, 'rate', e.target.value)}
                        placeholder="0.00"
                        className="form-input"
                        style={{ ...inputStyle, height: '30px', textAlign: 'right' }}
                      />
                    </td>

                    {/* Amount */}
                    <td style={{ padding: '6px 8px' }}>
                      <input
                        type="text"
                        value={line.amount}
                        readOnly
                        placeholder="0.00"
                        className="form-input"
                        style={{ ...inputStyle, height: '30px', textAlign: 'right', background: 'var(--bg-light, #f8fafc)', fontWeight: 700 }}
                      />
                    </td>

                    {/* Delete Row */}
                    <td style={{ padding: '6px 8px', textAlign: 'center' }}>
                      {lines.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeLine(idx)}
                          style={{
                            border: 'none', background: '#fee2e2', color: '#dc2626',
                            width: '26px', height: '26px', borderRadius: '4px', cursor: 'pointer',
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
                          }}
                          title="Remove row"
                        >
                          <FaTrash size={11} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            type="button"
            onClick={addLine}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '6px 14px', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 700,
              cursor: 'pointer', border: '1px solid var(--primary, #418a8b)',
              background: '#f0fdf4', color: 'var(--primary, #418a8b)'
            }}
          >
            <FaPlus size={11} /> Add Item Row
          </button>
        </div>

        {/* Footer Actions */}
        <CommonActionButtons
          onSave={handleSubmit}
          onCancel={onCancel}
          saveText={mode === 'add' ? 'Save Entry' : 'Update Entry'}
        />

      </form>
    </div>
  );
};

export default OpenStockEntryForm;
