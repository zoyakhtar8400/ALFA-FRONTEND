import React, { useState, useEffect } from 'react';
import PageHeader from '../../../../components/common/PageHeader';
import CommonActionButtons from '../../../../components/common/CommonActionButtons';
import F from '../../../../components/common/F';
import { handleEnterNavigation } from '../../../../utils/keyboardNavigation';
import { FaFileInvoiceDollar, FaBoxes, FaCalculator, FaCheckSquare, FaPlus, FaTrash } from 'react-icons/fa';

const SUPPLIERS = [
  'A P SUPPLY',
  'Metro Cash & Carry India',
  'Diversey Hygiene Pvt Ltd',
  'Amul Dairy Federation',
  'Nestle India Commercial',
  'RADHIKA ENTERPRISES'
];

const DEPARTMENTS = ['PURCHASE STORE', 'MAIN KITCHEN', 'DISPENSE BAR', 'HOUSEKEEPING', 'MAINTENANCE'];

const emptyLine = () => ({
  id: Date.now() + Math.random(),
  grnNo: 'GRN-1',
  item: '',
  unit: '',
  docQty: '',
  rate: '',
  amount: '',
  department: 'PURCHASE STORE'
});

const PurchaseBillEntryForm = ({
  mode = 'add',
  initialData = null,
  onSave,
  onCancel,
  items = [],
  units = [],
  nextNo = 1
}) => {
  const [billNo, setBillNo] = useState(nextNo);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [billPrtyNo, setBillPrtyNo] = useState('INV-1001');
  const [billPrtyDate, setBillPrtyDate] = useState(new Date().toISOString().split('T')[0]);
  const [supplier, setSupplier] = useState('A P SUPPLY');
  const [gstin, setGstin] = useState('09AAAAA0000A1Z5');
  const [agnstForm, setAgnstForm] = useState('WITH IN STATE PURCHASE');

  const [discountPct, setDiscountPct] = useState('0');
  const [sgstAmt, setSgstAmt] = useState('0.00');
  const [cgstAmt, setCgstAmt] = useState('0.00');
  const [igstAmt, setIgstAmt] = useState('0.00');
  const [roundOff, setRoundOff] = useState('0.00');
  const [lines, setLines] = useState([emptyLine()]);
  const [selectedGrnNo, setSelectedGrnNo] = useState('GRN-1');

  useEffect(() => {
    if (initialData) {
      setBillNo(initialData.billNo || initialData.entryNo || nextNo);
      setDate(initialData.date || initialData.entryDate || new Date().toISOString().split('T')[0]);
      setBillPrtyNo(initialData.billPrtyNo || initialData.ptyBillNo || 'INV-1001');
      setBillPrtyDate(initialData.billPrtyDate || initialData.ptyBillDt || new Date().toISOString().split('T')[0]);
      setSupplier(initialData.supplier || initialData.customer || 'A P SUPPLY');
      setGstin(initialData.gstin || '09AAAAA0000A1Z5');
      setAgnstForm(initialData.agnstForm || 'WITH IN STATE PURCHASE');
      setDiscountPct(initialData.discountPct || '0');
      setSgstAmt(initialData.sgstAmt || '0.00');
      setCgstAmt(initialData.cgstAmt || '0.00');
      setIgstAmt(initialData.igstAmt || '0.00');
      setRoundOff(initialData.roundOff || '0.00');
      setLines(initialData.lines && initialData.lines.length > 0 ? initialData.lines : [emptyLine()]);
    } else {
      setBillNo(nextNo);
      setDate(new Date().toISOString().split('T')[0]);
      setBillPrtyNo('INV-1001');
      setBillPrtyDate(new Date().toISOString().split('T')[0]);
      setSupplier('A P SUPPLY');
      setGstin('09AAAAA0000A1Z5');
      setAgnstForm('WITH IN STATE PURCHASE');
      setDiscountPct('0');
      setSgstAmt('0.00');
      setCgstAmt('0.00');
      setIgstAmt('0.00');
      setRoundOff('0.00');
      setLines([emptyLine()]);
    }
  }, [initialData, nextNo]);

  const updateLine = (idx, key, value) => {
    setLines((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [key]: value };

      if (key === 'docQty' || key === 'rate') {
        const q = parseFloat(key === 'docQty' ? value : updated[idx].docQty) || 0;
        const r = parseFloat(key === 'rate' ? value : updated[idx].rate) || 0;
        updated[idx].amount = (q * r).toFixed(2);
      }

      if (key === 'item') {
        const found = items.find((i) => i.name === value);
        if (found) updated[idx].unit = found.unitName || 'K.G.';
      }

      return updated;
    });
  };

  const addLine = () => setLines((prev) => [...prev, emptyLine()]);
  const removeLine = (idx) => setLines((prev) => prev.filter((_, i) => i !== idx));

  // Financial Calculations
  const grossAmount = lines.reduce((sum, l) => sum + (parseFloat(l.amount) || 0), 0);
  const discValue = (grossAmount * (parseFloat(discountPct) || 0)) / 100;
  const netAmount = grossAmount - discValue + (parseFloat(sgstAmt) || 0) + (parseFloat(cgstAmt) || 0) + (parseFloat(igstAmt) || 0) + (parseFloat(roundOff) || 0);

  const totalQty = lines.reduce((sum, l) => sum + (parseFloat(l.docQty) || 0), 0);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    const validLines = lines.filter((l) => l.item && l.docQty);
    if (!validLines.length) return;

    onSave({
      id: initialData?.id || Date.now(),
      billNo,
      entryNo: billNo,
      date,
      entryDate: date,
      billPrtyNo,
      ptyBillNo: billPrtyNo,
      billPrtyDate,
      ptyBillDt: billPrtyDate,
      supplier,
      customer: supplier,
      gstin,
      agnstForm,
      discountPct,
      discountAmt: discValue.toFixed(2),
      sgstAmt,
      cgstAmt,
      igstAmt,
      roundOff,
      grossAmount,
      netAmount,
      lines: validLines.map((l, i) => ({
        ...l,
        sNo: i + 1,
        docQty: parseFloat(l.docQty) || 0,
        rate: parseFloat(l.rate) || 0,
        amount: parseFloat(l.amount) || 0
      })),
      totalQty,
      totalAmt: netAmount
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
        title={mode === 'add' ? 'Add Purchase Bill Entry' : 'Edit Purchase Bill Entry'}
        breadcrumbs={['Dashboard', 'Purchase', 'Operations', 'Purchase Bill Entry', mode === 'add' ? 'Add' : 'Edit']}
        showBack
        onBack={onCancel}
        style={{ marginBottom: '8px', paddingBottom: '2px' }}
      />

      <form onKeyDown={handleEnterNavigation} onSubmit={handleSubmit} style={{ padding: '0 4px 12px' }}>
        
        {/* Card 1: Bill Header Information */}
        <div style={{ background: 'var(--card-bg, #fff)', border: '1px solid var(--border, #e2e8f0)', borderRadius: '6px', padding: '12px 16px', marginBottom: '12px' }}>
          {sectionTitle(<FaFileInvoiceDollar />, 'Purchase Bill Header Details')}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px 12px' }}>
            <F label="Bill No *">
              <input
                type="text"
                value={billNo}
                readOnly
                className="form-input"
                style={{ ...inputStyle, background: 'var(--bg-light, #f8fafc)', cursor: 'not-allowed', fontWeight: 700 }}
              />
            </F>

            <F label="Date *">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="form-input"
                style={inputStyle}
              />
            </F>

            <F label="Bill Prty *">
              <input
                type="text"
                value={billPrtyNo}
                onChange={(e) => setBillPrtyNo(e.target.value)}
                required
                placeholder="Party Bill No"
                className="form-input"
                style={inputStyle}
              />
            </F>

            <F label="Date *">
              <input
                type="date"
                value={billPrtyDate}
                onChange={(e) => setBillPrtyDate(e.target.value)}
                required
                className="form-input"
                style={inputStyle}
              />
            </F>

            <F label="Supplier *">
              <select
                className="form-select"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                required
                style={selectStyle}
              >
                <option value="">Select Supplier</option>
                {SUPPLIERS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </F>

            <F label="GSTIN">
              <input
                type="text"
                value={gstin}
                onChange={(e) => setGstin(e.target.value)}
                placeholder="GSTIN No"
                className="form-input"
                style={inputStyle}
              />
            </F>
          </div>
        </div>

        {/* Card 2: Items Grid */}
        <div style={{ background: 'var(--card-bg, #fff)', border: '1px solid var(--border, #e2e8f0)', borderRadius: '6px', padding: '12px 16px', marginBottom: '12px' }}>
          {sectionTitle(<FaBoxes />, 'Bill Line Items Grid')}

          <div style={{ overflowX: 'auto', marginBottom: '12px', border: '1px solid var(--border, #e2e8f0)', borderRadius: '6px' }}>
            <table className="w-full text-xs" style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-light, #f8fafc)', borderBottom: '1px solid var(--border, #e2e8f0)', color: '#475569' }}>
                  <th style={{ padding: '8px 10px', textAlign: 'center', width: '40px' }}>SNo</th>
                  <th style={{ padding: '8px 10px', textAlign: 'left', width: '100px' }}>GRN No</th>
                  <th style={{ padding: '8px 10px', textAlign: 'left', minWidth: '200px' }}>Item Name *</th>
                  <th style={{ padding: '8px 10px', textAlign: 'left', width: '90px' }}>Unit</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right', width: '100px' }}>Doc Qty *</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right', width: '100px' }}>Rate *</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right', width: '110px' }}>Amt</th>
                  <th style={{ padding: '8px 10px', textAlign: 'left', width: '130px' }}>Department</th>
                  <th style={{ padding: '8px 10px', textAlign: 'center', width: '45px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {lines.map((line, idx) => (
                  <tr key={line.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '6px 10px', textAlign: 'center', fontWeight: 600, color: '#64748b' }}>{idx + 1}</td>
                    
                    <td style={{ padding: '6px 8px' }}>
                      <input
                        type="text"
                        value={line.grnNo}
                        onChange={(e) => updateLine(idx, 'grnNo', e.target.value)}
                        placeholder="GRN No"
                        className="form-input"
                        style={{ ...inputStyle, height: '30px' }}
                      />
                    </td>

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
                        value={line.docQty}
                        onChange={(e) => updateLine(idx, 'docQty', e.target.value)}
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

                    <td style={{ padding: '6px 8px' }}>
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

        {/* Card 3: Pending GRN Selector & Financial Calculation Heads */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
          
          {/* Pending GRN Selector */}
          <div style={{ background: 'var(--card-bg, #fff)', border: '1px solid var(--border, #e2e8f0)', borderRadius: '6px', padding: '12px 16px' }}>
            {sectionTitle(<FaCheckSquare />, 'Pending GRNs')}
            <table className="w-full text-xs" style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-light, #f8fafc)', borderBottom: '1px solid var(--border, #e2e8f0)', color: '#475569' }}>
                  <th style={{ padding: '6px 10px', textAlign: 'center', width: '40px' }}>Tick</th>
                  <th style={{ padding: '6px 10px', textAlign: 'left' }}>GRN No</th>
                  <th style={{ padding: '6px 10px', textAlign: 'left' }}>Chl No</th>
                  <th style={{ padding: '6px 10px', textAlign: 'left' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {['GRN-1', 'GRN-2'].map((gNo) => (
                  <tr key={gNo} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '6px 10px', textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={selectedGrnNo === gNo}
                        onChange={() => setSelectedGrnNo(gNo)}
                      />
                    </td>
                    <td style={{ padding: '6px 10px', fontWeight: 700, color: '#1e293b' }}>{gNo}</td>
                    <td style={{ padding: '6px 10px' }}>CH-101</td>
                    <td style={{ padding: '6px 10px' }}>{date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Calculation Heads */}
          <div style={{ background: 'var(--card-bg, #fff)', border: '1px solid var(--border, #e2e8f0)', borderRadius: '6px', padding: '12px 16px' }}>
            {sectionTitle(<FaCalculator />, 'Calculation Heads')}

            <table className="w-full text-xs" style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-light, #f8fafc)', borderBottom: '1px solid var(--border, #e2e8f0)', color: '#475569' }}>
                  <th style={{ padding: '6px 10px', textAlign: 'left' }}>Heads</th>
                  <th style={{ padding: '6px 10px', textAlign: 'center', width: '80px' }}>At Rate (%)</th>
                  <th style={{ padding: '6px 10px', textAlign: 'right', width: '100px' }}>Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td style={{ padding: '5px 10px', fontWeight: 600 }}>Gross Amount</td>
                  <td style={{ padding: '5px 10px', textAlign: 'center', color: '#94a3b8' }}>—</td>
                  <td style={{ padding: '5px 10px', textAlign: 'right', fontWeight: 700 }}>₹{grossAmount.toFixed(2)}</td>
                </tr>

                <tr>
                  <td style={{ padding: '5px 10px', fontWeight: 600 }}>Discount</td>
                  <td style={{ padding: '3px 4px', textAlign: 'center' }}>
                    <input
                      type="number"
                      value={discountPct}
                      onChange={(e) => setDiscountPct(e.target.value)}
                      className="form-input"
                      style={{ fontSize: '0.78rem', height: '24px', padding: '2px 4px', textAlign: 'center' }}
                    />
                  </td>
                  <td style={{ padding: '5px 10px', textAlign: 'right' }}>₹{discValue.toFixed(2)}</td>
                </tr>

                <tr>
                  <td style={{ padding: '5px 10px', fontWeight: 600 }}>SGST</td>
                  <td style={{ padding: '5px 10px', textAlign: 'center', color: '#94a3b8' }}>—</td>
                  <td style={{ padding: '3px 4px', textAlign: 'right' }}>
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
                  <td style={{ padding: '5px 10px', fontWeight: 600 }}>CGST</td>
                  <td style={{ padding: '5px 10px', textAlign: 'center', color: '#94a3b8' }}>—</td>
                  <td style={{ padding: '3px 4px', textAlign: 'right' }}>
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
                  <td style={{ padding: '5px 10px', fontWeight: 600 }}>IGST</td>
                  <td style={{ padding: '5px 10px', textAlign: 'center', color: '#94a3b8' }}>—</td>
                  <td style={{ padding: '3px 4px', textAlign: 'right' }}>
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
                  <td style={{ padding: '5px 10px', fontWeight: 600 }}>Round Off</td>
                  <td style={{ padding: '5px 10px', textAlign: 'center', color: '#94a3b8' }}>—</td>
                  <td style={{ padding: '3px 4px', textAlign: 'right' }}>
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
                  <td style={{ padding: '6px 10px', color: '#166534' }}>Net Amount</td>
                  <td style={{ padding: '6px 10px', textAlign: 'center' }}>—</td>
                  <td style={{ padding: '6px 10px', textAlign: 'right', color: '#166534', fontSize: '0.95rem' }}>₹{netAmount.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>

        {/* Card 4: Agnst Form Selector */}
        <div style={{ background: 'var(--card-bg, #fff)', border: '1px solid var(--border, #e2e8f0)', borderRadius: '6px', padding: '12px 16px', marginBottom: '12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px', alignItems: 'center' }}>
            <F label="Agnst Form *">
              <select
                className="form-select"
                value={agnstForm}
                onChange={(e) => setAgnstForm(e.target.value)}
                required
                style={selectStyle}
              >
                <option value="WITH IN STATE PURCHASE">WITH IN STATE PURCHASE</option>
                <option value="OUTSIDE STATE PURCHASE">OUTSIDE STATE PURCHASE</option>
              </select>
            </F>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic' }}>
              Select tax structure applicability for intrastate or interstate purchase bill.
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <CommonActionButtons
          onSave={handleSubmit}
          onCancel={onCancel}
          saveText={mode === 'add' ? 'Save Bill' : 'Update Bill'}
        />

      </form>
    </div>
  );
};

export default PurchaseBillEntryForm;
