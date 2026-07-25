import React, { useState, useEffect } from 'react';
import PageHeader from '../../../../components/common/PageHeader';
import CommonActionButtons from '../../../../components/common/CommonActionButtons';
import F from '../../../../components/common/F';
import { handleEnterNavigation } from '../../../../utils/keyboardNavigation';
import { FaExchangeAlt, FaBoxes, FaPlus, FaTrash } from 'react-icons/fa';

const DEPARTMENTS = [
  'PURCHASE STORE',
  'MAIN KITCHEN',
  'DISPENSE BAR',
  'GARDENIA ROOFTOP',
  'HOUSEKEEPING',
  'FRONT OFFICE',
  'MAINTENANCE'
];

const emptyLine = () => ({
  id: Date.now() + Math.random(),
  item: '',
  unit: '',
  quantity: '',
  rate: '',
  amount: '',
  currentStock: '50.00'
});

const StockTransferEntryForm = ({
  mode = 'add',
  initialData = null,
  onSave,
  onCancel,
  items = [],
  units = [],
  nextNo = 1
}) => {
  const [transferNo, setTransferNo] = useState(nextNo);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [fromDepartment, setFromDepartment] = useState('PURCHASE STORE');
  const [toDepartment, setToDepartment] = useState('MAIN KITCHEN');
  const [remarks, setRemarks] = useState('');
  const [lines, setLines] = useState([emptyLine()]);

  useEffect(() => {
    if (initialData) {
      setTransferNo(initialData.transferNo || initialData.entryNo || nextNo);
      setDate(initialData.date || initialData.entryDate || new Date().toISOString().split('T')[0]);
      setFromDepartment(initialData.fromDepartment || initialData.department || 'PURCHASE STORE');
      setToDepartment(initialData.toDepartment || 'MAIN KITCHEN');
      setRemarks(initialData.remarks || '');
      setLines(initialData.lines && initialData.lines.length > 0 ? initialData.lines : [emptyLine()]);
    } else {
      setTransferNo(nextNo);
      setDate(new Date().toISOString().split('T')[0]);
      setFromDepartment('PURCHASE STORE');
      setToDepartment('MAIN KITCHEN');
      setRemarks('');
      setLines([emptyLine()]);
    }
  }, [initialData, nextNo]);

  const updateLine = (idx, key, value) => {
    setLines((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [key]: value };

      if (key === 'quantity' || key === 'rate') {
        const q = parseFloat(key === 'quantity' ? value : updated[idx].quantity) || 0;
        const r = parseFloat(key === 'rate' ? value : updated[idx].rate) || 0;
        updated[idx].amount = (q * r).toFixed(2);
      }

      if (key === 'item') {
        const found = items.find((i) => i.name === value);
        if (found) {
          updated[idx].unit = found.unitName || 'K.G.';
          updated[idx].currentStock = (found.currentStock || 50).toFixed(2);
        }
      }

      return updated;
    });
  };

  const addLine = () => setLines((prev) => [...prev, emptyLine()]);
  const removeLine = (idx) => setLines((prev) => prev.filter((_, i) => i !== idx));

  const totalQty = lines.reduce((sum, l) => sum + (parseFloat(l.quantity) || 0), 0);
  const totalAmount = lines.reduce((sum, l) => sum + (parseFloat(l.amount) || 0), 0);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    const validLines = lines.filter((l) => l.item && l.quantity);
    if (!validLines.length) return;

    onSave({
      id: initialData?.id || Date.now(),
      transferNo,
      entryNo: transferNo,
      date,
      entryDate: date,
      department: fromDepartment,
      fromDepartment,
      toDepartment,
      remarks,
      lines: validLines.map((l, i) => ({
        ...l,
        sNo: i + 1,
        quantity: parseFloat(l.quantity) || 0,
        rate: parseFloat(l.rate) || 0,
        amount: parseFloat(l.amount) || 0
      })),
      totalQty,
      totalAmount
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
      <style dangerouslySetInnerHTML={{
        __html: `
        ::-webkit-scrollbar { display: none !important; width: 0px !important; height: 0px !important; }
        * { -ms-overflow-style: none !important; scrollbar-width: none !important; }
      `}} />

      <PageHeader
        title={mode === 'add' ? 'Add Stock Transfer Entry' : 'Edit Stock Transfer Entry'}
        breadcrumbs={['Dashboard', 'Purchase', 'Operations', 'Stock Transfer Entry', mode === 'add' ? 'Add' : 'Edit']}
        showBack
        onBack={onCancel}
        style={{ marginBottom: '8px', paddingBottom: '2px' }}
      />

      <form onKeyDown={handleEnterNavigation} onSubmit={handleSubmit} style={{ padding: '0 4px 12px' }}>
        
        {/* Card 1: Header Details */}
        <div style={{ background: 'var(--card-bg, #fff)', border: '1px solid var(--border, #e2e8f0)', borderRadius: '6px', padding: '12px 16px', marginBottom: '12px' }}>
          {sectionTitle(<FaExchangeAlt />, 'Stock Transfer Header Details')}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px 12px' }}>
            <F label="Transfer No">
              <input
                type="text"
                value={transferNo}
                readOnly
                className="form-input"
                style={{ ...inputStyle, background: 'var(--bg-light, #f8fafc)', cursor: 'not-allowed', fontWeight: 700 }}
              />
            </F>

            <F label="Date">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="form-input"
                style={inputStyle}
              />
            </F>

            <F label="From Department">
              <select
                className="form-select"
                value={fromDepartment}
                onChange={(e) => setFromDepartment(e.target.value)}
                required
                style={selectStyle}
              >
                <option value="">Select Department</option>
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </F>

            <F label="To Department">
              <select
                className="form-select"
                value={toDepartment}
                onChange={(e) => setToDepartment(e.target.value)}
                required
                style={selectStyle}
              >
                <option value="">Select Department</option>
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </F>

            <F label="Remarks">
              <input
                type="text"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Transfer remarks..."
                className="form-input"
                style={inputStyle}
              />
            </F>
          </div>
        </div>

        {/* Card 2: Transfer Items Grid */}
        <div style={{ background: 'var(--card-bg, #fff)', border: '1px solid var(--border, #e2e8f0)', borderRadius: '6px', padding: '12px 16px', marginBottom: '12px' }}>
          {sectionTitle(<FaBoxes />, 'Stock Transfer Line Items Grid')}

          <div style={{ overflowX: 'auto', marginBottom: '12px', border: '1px solid var(--border, #e2e8f0)', borderRadius: '6px' }}>
            <table className="w-full text-xs" style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-light, #f8fafc)', borderBottom: '1px solid var(--border, #e2e8f0)', color: '#475569' }}>
                  <th style={{ padding: '8px 10px', textAlign: 'center', width: '40px' }}>S No</th>
                  <th style={{ padding: '8px 10px', textAlign: 'left', minWidth: '200px' }}>Item *</th>
                  <th style={{ padding: '8px 10px', textAlign: 'left', width: '100px' }}>Unit</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right', width: '110px' }}>Quantity *</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right', width: '110px' }}>Rate</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right', width: '120px' }}>Amount</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right', width: '110px' }}>Current Stock</th>
                  <th style={{ padding: '8px 10px', textAlign: 'center', width: '45px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {lines.map((line, idx) => (
                  <tr key={line.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '6px 10px', textAlign: 'center', fontWeight: 600, color: '#64748b' }}>{idx + 1}</td>
                    
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

                    <td style={{ padding: '6px 8px' }}>
                      <select
                        className="form-select"
                        value={line.unit}
                        onChange={(e) => updateLine(idx, 'unit', e.target.value)}
                        style={{ ...selectStyle, height: '30px' }}
                      >
                        <option value="">Select</option>
                        {units.map((u) => (
                          <option key={u.id || u.name} value={u.name}>{u.name}</option>
                        ))}
                      </select>
                    </td>

                    <td style={{ padding: '6px 8px' }}>
                      <input
                        type="number"
                        value={line.quantity}
                        onChange={(e) => updateLine(idx, 'quantity', e.target.value)}
                        placeholder="0.00"
                        className="form-input"
                        style={{ ...inputStyle, height: '30px', textAlign: 'right' }}
                      />
                    </td>

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

                    <td style={{ padding: '6px 10px', textAlign: 'right', fontWeight: 600, color: '#0f766e' }}>
                      {line.currentStock || '0.00'}
                    </td>

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

        {/* Card 3: Summary Totals */}
        <div style={{ background: 'var(--card-bg, #fff)', border: '1px solid var(--border, #e2e8f0)', borderRadius: '6px', padding: '12px 16px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '24px', alignItems: 'center', fontSize: '0.88rem', fontWeight: 700 }}>
            <div>Total Quantity: <span style={{ color: 'var(--primary, #418a8b)', fontSize: '1rem' }}>{totalQty.toFixed(2)}</span></div>
            <div>Total Amount: <span style={{ color: 'var(--primary, #418a8b)', fontSize: '1rem' }}>₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>
          </div>
        </div>

        {/* Footer Actions */}
        <CommonActionButtons
          onSave={handleSubmit}
          onCancel={onCancel}
          saveText={mode === 'add' ? 'Save Stock Transfer' : 'Update Stock Transfer'}
        />

      </form>
    </div>
  );
};

export default StockTransferEntryForm;
