import React, { useState, useEffect } from 'react';
import PageHeader from '../../../../components/common/PageHeader';
import CommonActionButtons from '../../../../components/common/CommonActionButtons';
import F from '../../../../components/common/F';
import { handleEnterNavigation } from '../../../../utils/keyboardNavigation';
import { FaUndo, FaBoxes, FaCalculator, FaUserEdit, FaPlus, FaTrash } from 'react-icons/fa';

const SUPPLIERS = [
  'A P SUPPLY',
  'Metro Cash & Carry India',
  'Diversey Hygiene Pvt Ltd',
  'Amul Dairy Federation',
  'Nestle India Commercial',
  'RADHIKA ENTERPRISES'
];

const TYPES = ['Debit Note', 'Credit Note', 'Return Memo'];
const DEPARTMENTS = ['PURCHASE STORE', 'MAIN KITCHEN', 'DISPENSE BAR', 'HOUSEKEEPING', 'MAINTENANCE'];

const emptyLine = () => ({
  id: Date.now() + Math.random(),
  item: '',
  convUnit: 'K.G.',
  qty: '',
  skuQty: '',
  skuUnit: 'K.G.',
  rate: '',
  amt: '',
  department: 'PURCHASE STORE',
  hsnCode: '1001'
});

const PurchaseReturnEntryForm = ({
  mode = 'add',
  initialData = null,
  onSave,
  onCancel,
  items = [],
  units = [],
  nextNo = 1
}) => {
  const [type, setType] = useState('Debit Note');
  const [entryNo, setEntryNo] = useState(nextNo);
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);
  const [supplier, setSupplier] = useState('A P SUPPLY');
  const [vrNo, setVrNo] = useState('VR-101');
  const [vrDt, setVrDt] = useState(new Date().toISOString().split('T')[0]);
  const [prtyBillNo, setPrtyBillNo] = useState('INV-1001');
  const [prtyBillDt, setPrtyBillDt] = useState(new Date().toISOString().split('T')[0]);
  const [gstinNo, setGstinNo] = useState('09AAAAA0000A1Z5');
  const [agnstForm, setAgnstForm] = useState('WITH IN STATE PURCHASE');
  const [approvedBy, setApprovedBy] = useState('Store Manager');

  // Info
  const [preparedBy, setPreparedBy] = useState('DEMO');
  const [modifiedBy, setModifiedBy] = useState('DEMO');
  const [remark, setRemark] = useState('');

  // Financial Heads
  const [discountAmt, setDiscountAmt] = useState('0.00');
  const [sgstAmt, setSgstAmt] = useState('0.00');
  const [cgstAmt, setCgstAmt] = useState('0.00');
  const [igstAmt, setIgstAmt] = useState('0.00');
  const [cessAmt, setCessAmt] = useState('0.00');
  const [roundOff, setRoundOff] = useState('0.00');

  const [lines, setLines] = useState([
    {
      id: 1,
      item: 'AATA',
      convUnit: '1',
      qty: '125',
      skuQty: '2354',
      skuUnit: 'K.G.',
      rate: '125',
      amt: '2354',
      department: 'PURCHASE STORE',
      hsnCode: '1001'
    },
    {
      id: 2,
      item: 'PATATO 5KG',
      convUnit: '2',
      qty: '125',
      skuQty: '2354',
      skuUnit: 'K.G.',
      rate: '125',
      amt: '2354',
      department: 'PURCHASE STORE',
      hsnCode: '1001'
    }
  ]);

  useEffect(() => {
    if (initialData) {
      setType(initialData.type || 'Debit Note');
      setEntryNo(initialData.entryNo || nextNo);
      setEntryDate(initialData.entryDate || new Date().toISOString().split('T')[0]);
      setSupplier(initialData.supplier || initialData.customer || 'A P SUPPLY');
      setVrNo(initialData.vrNo || 'VR-101');
      setVrDt(initialData.vrDt || new Date().toISOString().split('T')[0]);
      setPrtyBillNo(initialData.prtyBillNo || initialData.ptyBillNo || 'INV-1001');
      setPrtyBillDt(initialData.prtyBillDt || initialData.ptyBillDt || new Date().toISOString().split('T')[0]);
      setGstinNo(initialData.gstinNo || '09AAAAA0000A1Z5');
      setAgnstForm(initialData.agnstForm || 'WITH IN STATE PURCHASE');
      setApprovedBy(initialData.approvedBy || 'Store Manager');

      setPreparedBy(initialData.preparedBy || 'DEMO');
      setModifiedBy(initialData.modifiedBy || 'DEMO');
      setRemark(initialData.remark || '');

      setDiscountAmt(initialData.discountAmt || '0.00');
      setSgstAmt(initialData.sgstAmt || '0.00');
      setCgstAmt(initialData.cgstAmt || '0.00');
      setIgstAmt(initialData.igstAmt || '0.00');
      setCessAmt(initialData.cessAmt || '0.00');
      setRoundOff(initialData.roundOff || '0.00');
      setLines(initialData.lines && initialData.lines.length > 0 ? initialData.lines : [emptyLine()]);
    } else {
      setEntryNo(nextNo);
      setEntryDate(new Date().toISOString().split('T')[0]);
      setSupplier('A P SUPPLY');
      setVrNo('VR-101');
      setVrDt(new Date().toISOString().split('T')[0]);
      setPrtyBillNo('INV-1001');
      setPrtyBillDt(new Date().toISOString().split('T')[0]);
      setGstinNo('09AAAAA0000A1Z5');
      setAgnstForm('WITH IN STATE PURCHASE');
      setApprovedBy('Store Manager');

      setPreparedBy('DEMO');
      setModifiedBy('DEMO');
      setRemark('');

      setDiscountAmt('0.00');
      setSgstAmt('0.00');
      setCgstAmt('0.00');
      setIgstAmt('0.00');
      setCessAmt('0.00');
      setRoundOff('0.00');
    }
  }, [initialData, nextNo]);

  const updateLine = (idx, key, value) => {
    setLines((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [key]: value };

      if (key === 'qty' || key === 'rate') {
        const q = parseFloat(key === 'qty' ? value : updated[idx].qty) || 0;
        const r = parseFloat(key === 'rate' ? value : updated[idx].rate) || 0;
        updated[idx].amt = (q * r).toFixed(2);
      }

      if (key === 'item') {
        const found = items.find((i) => i.name === value);
        if (found) updated[idx].skuUnit = found.unitName || 'K.G.';
      }

      return updated;
    });
  };

  const addLine = () => setLines((prev) => [...prev, emptyLine()]);
  const removeLine = (idx) => setLines((prev) => prev.filter((_, i) => i !== idx));

  // Calculations
  const grossAmount = lines.reduce((sum, l) => sum + (parseFloat(l.amt) || 0), 0);
  const netAmount = grossAmount - (parseFloat(discountAmt) || 0) + (parseFloat(sgstAmt) || 0) + (parseFloat(cgstAmt) || 0) + (parseFloat(igstAmt) || 0) + (parseFloat(cessAmt) || 0) + (parseFloat(roundOff) || 0);

  const totalQty = lines.reduce((sum, l) => sum + (parseFloat(l.qty) || 0), 0);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    const validLines = lines.filter((l) => l.qty);
    if (!validLines.length) return;

    onSave({
      id: initialData?.id || Date.now(),
      type,
      entryNo,
      entryDate,
      supplier,
      customer: supplier,
      vrNo,
      vrDt,
      prtyBillNo,
      ptyBillNo: prtyBillNo,
      prtyBillDt,
      ptyBillDt: prtyBillDt,
      gstinNo,
      agnstForm,
      approvedBy,
      preparedBy,
      modifiedBy,
      remark,
      rowNo: validLines.length,
      discountAmt,
      sgstAmt,
      cgstAmt,
      igstAmt,
      cessAmt,
      roundOff,
      grossAmount,
      netAmount,
      lines: validLines.map((l, i) => ({
        ...l,
        sNo: i + 1,
        qty: parseFloat(l.qty) || 0,
        rate: parseFloat(l.rate) || 0,
        amt: parseFloat(l.amt) || 0
      })),
      totalQty,
      totalAmt: netAmount
    });
  };

  const sectionTitle = (icon, title) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '2px 0 6px', borderBottom: '2px solid var(--primary, #418a8b)', marginBottom: '10px' }}>
      <span style={{ fontSize: '0.95rem', display: 'flex', alignItems: 'center', color: 'var(--primary, #418a8b)' }}>{icon}</span>
      <span style={{ fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--primary, #418a8b)' }}>{title}</span>
    </div>
  );

  const selectStyle = { fontSize: '0.85rem', height: '34px', padding: '4px 8px', fontWeight: 600, color: '#0f172a' };
  const inputStyle = { fontSize: '0.85rem', height: '34px', padding: '4px 8px', fontWeight: 600 };

  return (
    <div className="animate-in duration-200" style={{ padding: '0 4px' }}>
      <style dangerouslySetInnerHTML={{
        __html: `
        ::-webkit-scrollbar { display: none !important; width: 0px !important; height: 0px !important; }
        * { -ms-overflow-style: none !important; scrollbar-width: none !important; }
      `}} />

      <PageHeader
        title={mode === 'add' ? 'Add Purchase Return Entry' : 'Edit Purchase Return Entry'}
        breadcrumbs={['Dashboard', 'Purchase', 'Operations', 'Purchase Return Entry', mode === 'add' ? 'Add' : 'Edit']}
        showBack
        onBack={onCancel}
        style={{ marginBottom: '6px', paddingBottom: '2px' }}
      />

      <form onKeyDown={handleEnterNavigation} onSubmit={handleSubmit} style={{ padding: '0 2px 10px' }}>
        
        {/* Card 1: Header Information */}
        <div style={{ background: 'var(--card-bg, #fff)', border: '1px solid var(--border, #e2e8f0)', borderRadius: '6px', padding: '10px 14px', marginBottom: '10px' }}>
          {sectionTitle(<FaUndo />, 'Purchase Return Header Details')}

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            <F label="Type *">
              <select
                className="form-select"
                value={type}
                onChange={(e) => setType(e.target.value)}
                style={selectStyle}
              >
                {TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </F>

            <F label="Entry No *">
              <input
                type="text"
                value={entryNo}
                readOnly
                className="form-input"
                style={{ ...inputStyle, background: 'var(--bg-light, #f8fafc)', cursor: 'not-allowed', fontWeight: 700 }}
              />
            </F>

            <F label="Entry Date *">
              <input
                type="date"
                value={entryDate}
                onChange={(e) => setEntryDate(e.target.value)}
                required
                className="form-input"
                style={inputStyle}
              />
            </F>

            <F label="Supplier">
              <select
                className="form-select"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                style={selectStyle}
              >
                <option value="">Select Supplier</option>
                {SUPPLIERS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </F>

            <F label="Vr No">
              <input
                type="text"
                value={vrNo}
                onChange={(e) => setVrNo(e.target.value)}
                className="form-input"
                style={inputStyle}
              />
            </F>

            <F label="Vr Dt *">
              <input
                type="date"
                value={vrDt}
                onChange={(e) => setVrDt(e.target.value)}
                required
                className="form-input"
                style={inputStyle}
              />
            </F>

            <F label="Prty BillNo">
              <input
                type="text"
                value={prtyBillNo}
                onChange={(e) => setPrtyBillNo(e.target.value)}
                className="form-input"
                style={inputStyle}
              />
            </F>

            <F label="Prty BillDt">
              <input
                type="date"
                value={prtyBillDt}
                onChange={(e) => setPrtyBillDt(e.target.value)}
                className="form-input"
                style={inputStyle}
              />
            </F>

            <F label="GSTIN No">
              <input
                type="text"
                value={gstinNo}
                onChange={(e) => setGstinNo(e.target.value)}
                className="form-input"
                style={inputStyle}
              />
            </F>

            <F label="Agnst Form">
              <select
                className="form-select"
                value={agnstForm}
                onChange={(e) => setAgnstForm(e.target.value)}
                style={selectStyle}
              >
                <option value="WITH IN STATE PURCHASE">WITH IN STATE PURCHASE</option>
                <option value="OUTSIDE STATE PURCHASE">OUTSIDE STATE PURCHASE</option>
              </select>
            </F>
          </div>
        </div>

        {/* Card 2: Return Items Table */}
        <div style={{ background: 'var(--card-bg, #fff)', border: '1px solid var(--border, #e2e8f0)', borderRadius: '6px', padding: '10px 14px', marginBottom: '10px' }}>
          {sectionTitle(<FaBoxes />, 'Return Line Items Grid')}

          <div style={{ overflowX: 'auto', marginBottom: '8px', border: '1px solid var(--border, #e2e8f0)', borderRadius: '6px' }}>
            <table className="w-full text-xs" style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-light, #f8fafc)', borderBottom: '1px solid var(--border, #e2e8f0)', color: '#475569' }}>
                  <th style={{ padding: '6px 8px', textAlign: 'center', width: '35px' }}>SNo</th>
                  <th style={{ padding: '6px 8px', textAlign: 'left', minWidth: '180px' }}>Item Name *</th>
                  <th style={{ padding: '6px 8px', textAlign: 'left', width: '90px' }}>Conv Unit</th>
                  <th style={{ padding: '6px 8px', textAlign: 'right', width: '90px' }}>Qty *</th>
                  <th style={{ padding: '6px 8px', textAlign: 'right', width: '90px' }}>SKU Qty</th>
                  <th style={{ padding: '6px 8px', textAlign: 'left', width: '90px' }}>SKU Unit</th>
                  <th style={{ padding: '6px 8px', textAlign: 'right', width: '90px' }}>Rate *</th>
                  <th style={{ padding: '6px 8px', textAlign: 'right', width: '100px' }}>Amt</th>
                  <th style={{ padding: '6px 8px', textAlign: 'left', width: '130px' }}>Department</th>
                  <th style={{ padding: '6px 8px', textAlign: 'left', width: '90px' }}>HSN Code</th>
                  <th style={{ padding: '6px 8px', textAlign: 'center', width: '40px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {lines.map((line, idx) => (
                  <tr key={line.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '4px 6px', textAlign: 'center', fontWeight: 600, color: '#64748b' }}>{idx + 1}</td>

                    <td style={{ padding: '4px 6px' }}>
                      <select
                        className="form-select"
                        value={line.item}
                        onChange={(e) => updateLine(idx, 'item', e.target.value)}
                        style={{ ...selectStyle, height: '30px', minWidth: '170px', fontWeight: 700, color: '#0f172a', background: '#fff' }}
                      >
                        <option value="">Select Item</option>
                        {items.map((i) => (
                          <option key={i.id || i.name} value={i.name}>{i.name}</option>
                        ))}
                      </select>
                    </td>

                    <td style={{ padding: '4px 6px' }}>
                      <input
                        type="text"
                        value={line.convUnit}
                        onChange={(e) => updateLine(idx, 'convUnit', e.target.value)}
                        className="form-input"
                        style={{ ...inputStyle, height: '30px' }}
                      />
                    </td>

                    <td style={{ padding: '4px 6px' }}>
                      <input
                        type="number"
                        value={line.qty}
                        onChange={(e) => updateLine(idx, 'qty', e.target.value)}
                        placeholder="0.00"
                        className="form-input"
                        style={{ ...inputStyle, height: '30px', textAlign: 'right' }}
                      />
                    </td>

                    <td style={{ padding: '4px 6px' }}>
                      <input
                        type="number"
                        value={line.skuQty}
                        onChange={(e) => updateLine(idx, 'skuQty', e.target.value)}
                        placeholder="0.00"
                        className="form-input"
                        style={{ ...inputStyle, height: '30px', textAlign: 'right' }}
                      />
                    </td>

                    <td style={{ padding: '4px 6px' }}>
                      <input
                        type="text"
                        value={line.skuUnit}
                        onChange={(e) => updateLine(idx, 'skuUnit', e.target.value)}
                        className="form-input"
                        style={{ ...inputStyle, height: '30px' }}
                      />
                    </td>

                    <td style={{ padding: '4px 6px' }}>
                      <input
                        type="number"
                        value={line.rate}
                        onChange={(e) => updateLine(idx, 'rate', e.target.value)}
                        placeholder="0.00"
                        className="form-input"
                        style={{ ...inputStyle, height: '30px', textAlign: 'right' }}
                      />
                    </td>

                    <td style={{ padding: '4px 6px' }}>
                      <input
                        type="text"
                        value={line.amt}
                        readOnly
                        placeholder="0.00"
                        className="form-input"
                        style={{ ...inputStyle, height: '30px', textAlign: 'right', background: 'var(--bg-light, #f8fafc)', fontWeight: 700 }}
                      />
                    </td>

                    <td style={{ padding: '4px 6px' }}>
                      <select
                        className="form-select"
                        value={line.department}
                        onChange={(e) => updateLine(idx, 'department', e.target.value)}
                        style={{ ...selectStyle, height: '30px' }}
                      >
                        {DEPARTMENTS.map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </td>

                    <td style={{ padding: '4px 6px' }}>
                      <input
                        type="text"
                        value={line.hsnCode}
                        onChange={(e) => updateLine(idx, 'hsnCode', e.target.value)}
                        className="form-input"
                        style={{ ...inputStyle, height: '30px' }}
                      />
                    </td>

                    <td style={{ padding: '4px 6px', textAlign: 'center' }}>
                      {lines.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeLine(idx)}
                          style={{
                            border: 'none', background: '#fee2e2', color: '#dc2626',
                            width: '24px', height: '24px', borderRadius: '4px', cursor: 'pointer',
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
                          }}
                          title="Remove row"
                        >
                          <FaTrash size={10} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              type="button"
              onClick={addLine}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '4px 12px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700,
                cursor: 'pointer', border: '1px solid var(--primary, #418a8b)',
                background: '#f0fdf4', color: 'var(--primary, #418a8b)'
              }}
            >
              <FaPlus size={10} /> Add Item Row
            </button>

            <div style={{ display: 'flex', gap: '20px', fontSize: '0.82rem', fontWeight: 700 }}>
              <div>Total Quantity: <span style={{ color: 'var(--primary, #418a8b)' }}>{totalQty.toFixed(2)}</span></div>
              <div>Total Amount: <span style={{ color: 'var(--primary, #418a8b)' }}>₹{grossAmount.toFixed(2)}</span></div>
            </div>
          </div>
        </div>

        {/* Card 3: Financial Heads & Audit Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3" style={{ marginBottom: '10px' }}>
          
          {/* Financial Calculation Heads Table */}
          <div style={{ background: 'var(--card-bg, #fff)', border: '1px solid var(--border, #e2e8f0)', borderRadius: '6px', padding: '10px 14px' }}>
            {sectionTitle(<FaCalculator />, 'Financial Calculation Heads')}

            <table className="w-full text-xs" style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-light, #f8fafc)', borderBottom: '1px solid var(--border, #e2e8f0)', color: '#475569' }}>
                  <th style={{ padding: '4px 8px', textAlign: 'left' }}>Heads</th>
                  <th style={{ padding: '4px 8px', textAlign: 'center', width: '75px' }}>At Rate</th>
                  <th style={{ padding: '4px 8px', textAlign: 'right', width: '95px' }}>Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td style={{ padding: '4px 8px', fontWeight: 600 }}>Gross Amount</td>
                  <td style={{ padding: '4px 8px', textAlign: 'center', color: '#94a3b8' }}>—</td>
                  <td style={{ padding: '4px 8px', textAlign: 'right', fontWeight: 700 }}>₹{grossAmount.toFixed(2)}</td>
                </tr>

                <tr>
                  <td style={{ padding: '4px 8px', fontWeight: 600 }}>Discount</td>
                  <td style={{ padding: '4px 8px', textAlign: 'center', color: '#94a3b8' }}>—</td>
                  <td style={{ padding: '2px 4px', textAlign: 'right' }}>
                    <input
                      type="number"
                      value={discountAmt}
                      onChange={(e) => setDiscountAmt(e.target.value)}
                      className="form-input"
                      style={{ fontSize: '0.78rem', height: '24px', padding: '2px 4px', textAlign: 'right' }}
                    />
                  </td>
                </tr>

                <tr>
                  <td style={{ padding: '4px 8px', fontWeight: 600 }}>SGST</td>
                  <td style={{ padding: '4px 8px', textAlign: 'center', color: '#94a3b8' }}>—</td>
                  <td style={{ padding: '2px 4px', textAlign: 'right' }}>
                    <input
                      type="number"
                      value={sgstAmt}
                      onChange={(e) => setSgstAmt(e.target.value)}
                      className="form-input"
                      style={{ fontSize: '0.78rem', height: '24px', padding: '2px 4px', textAlign: 'right' }}
                    />
                  </td>
                </tr>

                <tr>
                  <td style={{ padding: '4px 8px', fontWeight: 600 }}>CGST</td>
                  <td style={{ padding: '4px 8px', textAlign: 'center', color: '#94a3b8' }}>—</td>
                  <td style={{ padding: '2px 4px', textAlign: 'right' }}>
                    <input
                      type="number"
                      value={cgstAmt}
                      onChange={(e) => setCgstAmt(e.target.value)}
                      className="form-input"
                      style={{ fontSize: '0.78rem', height: '24px', padding: '2px 4px', textAlign: 'right' }}
                    />
                  </td>
                </tr>

                <tr>
                  <td style={{ padding: '4px 8px', fontWeight: 600 }}>IGST</td>
                  <td style={{ padding: '4px 8px', textAlign: 'center', color: '#94a3b8' }}>—</td>
                  <td style={{ padding: '2px 4px', textAlign: 'right' }}>
                    <input
                      type="number"
                      value={igstAmt}
                      onChange={(e) => setIgstAmt(e.target.value)}
                      className="form-input"
                      style={{ fontSize: '0.78rem', height: '24px', padding: '2px 4px', textAlign: 'right' }}
                    />
                  </td>
                </tr>

                <tr>
                  <td style={{ padding: '4px 8px', fontWeight: 600 }}>CESS</td>
                  <td style={{ padding: '4px 8px', textAlign: 'center', color: '#94a3b8' }}>—</td>
                  <td style={{ padding: '2px 4px', textAlign: 'right' }}>
                    <input
                      type="number"
                      value={cessAmt}
                      onChange={(e) => setCessAmt(e.target.value)}
                      className="form-input"
                      style={{ fontSize: '0.78rem', height: '24px', padding: '2px 4px', textAlign: 'right' }}
                    />
                  </td>
                </tr>

                <tr>
                  <td style={{ padding: '4px 8px', fontWeight: 600 }}>Round Off</td>
                  <td style={{ padding: '4px 8px', textAlign: 'center', color: '#94a3b8' }}>—</td>
                  <td style={{ padding: '2px 4px', textAlign: 'right' }}>
                    <input
                      type="number"
                      value={roundOff}
                      onChange={(e) => setRoundOff(e.target.value)}
                      className="form-input"
                      style={{ fontSize: '0.78rem', height: '24px', padding: '2px 4px', textAlign: 'right' }}
                    />
                  </td>
                </tr>

                <tr style={{ background: '#f0fdf4', fontWeight: 800 }}>
                  <td style={{ padding: '6px 8px', color: '#166534' }}>Net Amount</td>
                  <td style={{ padding: '6px 8px', textAlign: 'center' }}>—</td>
                  <td style={{ padding: '6px 8px', textAlign: 'right', color: '#166534', fontSize: '0.92rem' }}>₹{netAmount.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Prepared By, Modified By & Remark Info Box */}
          <div style={{ background: 'var(--card-bg, #fff)', border: '1px solid var(--border, #e2e8f0)', borderRadius: '6px', padding: '10px 14px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              {sectionTitle(<FaUserEdit />, 'Audit & Remarks Details')}

              <div className="grid grid-cols-2 gap-2 mb-3">
                <F label="Prepared By">
                  <input
                    type="text"
                    value={preparedBy}
                    onChange={(e) => setPreparedBy(e.target.value)}
                    className="form-input"
                    style={inputStyle}
                  />
                </F>

                <F label="Modified By">
                  <input
                    type="text"
                    value={modifiedBy}
                    onChange={(e) => setModifiedBy(e.target.value)}
                    className="form-input"
                    style={inputStyle}
                  />
                </F>
              </div>

              <F label="Remark">
                <textarea
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  rows={3}
                  placeholder="Enter return remarks..."
                  className="form-input w-full p-2 text-xs border border-slate-300 rounded-lg outline-none focus:border-teal-600"
                />
              </F>
            </div>

            <div style={{ paddingTop: '10px', borderTop: '1px solid #f1f5f9', marginTop: '10px', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 800 }}>
              <span>Total Payable Net:</span>
              <span style={{ color: 'var(--primary, #418a8b)' }}>₹{netAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <CommonActionButtons
          onSave={handleSubmit}
          onCancel={onCancel}
          saveText={mode === 'add' ? 'Save Return Entry' : 'Update Return Entry'}
        />

      </form>
    </div>
  );
};

export default PurchaseReturnEntryForm;
