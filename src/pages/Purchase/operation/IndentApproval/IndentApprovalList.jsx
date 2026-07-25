import React, { useState, useMemo } from 'react';
import PageHeader from '../../../../components/common/PageHeader';
import F from '../../../../components/common/F';
import { usePurchase } from '../../hooks/usePurchase';
import { FaCheckCircle, FaTimesCircle, FaFilter } from 'react-icons/fa';

const DEPARTMENTS = ['All', 'MAIN KITCHEN', 'PURCHASE STORE', 'DISPENSE BAR', 'HOUSEKEEPING', 'MAINTENANCE'];
const INDENTORS = ['All', 'DEMO', 'Chef Mohan', 'Store Manager', 'Bar Captain'];
const ASSIGNED_TO = ['All', 'Store Keeper', 'Purchaser', 'Manager'];
const STATUSES = ['Pending', 'Approved', 'Rejected', 'All'];

const IndentApprovalList = ({ showToast }) => {
  const { indents, setIndents, items } = usePurchase();

  // Filters
  const [filterIndentNo, setFilterIndentNo] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [filterItem, setFilterItem] = useState('All');
  const [filterDept, setFilterDept] = useState('All');
  const [filterIndentor, setFilterIndentor] = useState('All');
  const [filterAssigned, setFilterAssigned] = useState('All');
  const [filterStatus, setFilterStatus] = useState('Pending');

  // Multi-select & Appr Qty state
  const [selectedIds, setSelectedIds] = useState([]);
  const [apprQtys, setApprQtys] = useState({});

  const toast = (msg) => {
    if (showToast) showToast(msg);
    else if (window.showToast) window.showToast(msg);
  };

  // Flatten lines for approval table display
  const approvalRows = useMemo(() => {
    const rows = [];
    (indents || []).forEach((ind) => {
      if (ind.lines && Array.isArray(ind.lines)) {
        ind.lines.forEach((line) => {
          rows.push({
            id: `${ind.id}-${line.sNo}`,
            indentId: ind.id,
            indentNo: ind.indentNo || '1',
            indentDate: ind.indentDate || '25-07-2026',
            department: ind.department || 'MAIN KITCHEN',
            indentorName: ind.indentorName || 'DEMO',
            assignedTo: ind.assignedTo || 'Store Keeper',
            itemName: line.item || 'AATA',
            indQty: line.indQty || 0,
            unit: line.unit || 'K.G.',
            apprQty: apprQtys[`${ind.id}-${line.sNo}`] !== undefined ? apprQtys[`${ind.id}-${line.sNo}`] : (line.indQty || 0),
            status: line.status || ind.status || 'Pending'
          });
        });
      }
    });
    return rows;
  }, [indents, apprQtys]);

  // Apply filters
  const filteredData = useMemo(() => {
    return approvalRows.filter((r) => {
      if (filterIndentNo && !String(r.indentNo).toLowerCase().includes(filterIndentNo.toLowerCase())) return false;
      if (filterItem !== 'All' && r.itemName !== filterItem) return false;
      if (filterDept !== 'All' && r.department !== filterDept) return false;
      if (filterIndentor !== 'All' && r.indentorName !== filterIndentor) return false;
      if (filterAssigned !== 'All' && r.assignedTo !== filterAssigned) return false;
      if (filterStatus !== 'All' && r.status !== filterStatus) return false;
      return true;
    });
  }, [approvalRows, filterIndentNo, filterItem, filterDept, filterIndentor, filterAssigned, filterStatus]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredData.map((r) => r.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const handleApprQtyChange = (id, val) => {
    setApprQtys((prev) => ({ ...prev, [id]: val }));
  };

  const handleApproveRow = (row) => {
    toast(`Approved Indent #${row.indentNo} - ${row.itemName} (${row.apprQty} ${row.unit})`);
  };

  const handleRejectRow = (row) => {
    toast(`Rejected Indent #${row.indentNo} - ${row.itemName}`);
  };

  const handleBatchApprove = () => {
    if (selectedIds.length === 0) {
      toast('Please select at least one item to approve.');
      return;
    }
    toast(`Approved ${selectedIds.length} selected indent items!`);
    setSelectedIds([]);
  };

  const handleBatchReject = () => {
    if (selectedIds.length === 0) {
      toast('Please select at least one item to reject.');
      return;
    }
    toast(`Rejected ${selectedIds.length} selected indent items.`);
    setSelectedIds([]);
  };

  const selectStyle = { fontSize: '0.82rem', height: '32px', padding: '2px 6px' };
  const inputStyle = { fontSize: '0.82rem', height: '32px', padding: '2px 6px' };

  return (
    <div className="w-full flex flex-col p-6 animate-in fade-in duration-200 gap-4">
      <PageHeader
        title="Indent Approval Entry"
        breadcrumbs={['Dashboard', 'Purchase', 'Operations', 'Indent Approval Entry']}
      />

      {/* Filter Controls Card */}
      <div style={{ background: 'var(--card-bg, #fff)', border: '1px solid var(--border, #e2e8f0)', borderRadius: '8px', padding: '12px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px', color: 'var(--primary, #418a8b)', fontWeight: 700, fontSize: '0.82rem', textTransform: 'uppercase' }}>
          <FaFilter size={12} /> Search & Filter Criteria
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px 12px' }}>
          <F label="Indent No">
            <input
              type="text"
              placeholder="All"
              value={filterIndentNo}
              onChange={(e) => setFilterIndentNo(e.target.value)}
              className="form-input"
              style={inputStyle}
            />
          </F>

          <F label="Date From">
            <input
              type="date"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
              className="form-input"
              style={inputStyle}
            />
          </F>

          <F label="Date To">
            <input
              type="date"
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
              className="form-input"
              style={inputStyle}
            />
          </F>

          <F label="Item">
            <select
              className="form-select"
              value={filterItem}
              onChange={(e) => setFilterItem(e.target.value)}
              style={selectStyle}
            >
              <option value="All">All</option>
              {items.map((i) => (
                <option key={i.id || i.name} value={i.name}>{i.name}</option>
              ))}
            </select>
          </F>

          <F label="Department">
            <select
              className="form-select"
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              style={selectStyle}
            >
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </F>

          <F label="Indentor Name">
            <select
              className="form-select"
              value={filterIndentor}
              onChange={(e) => setFilterIndentor(e.target.value)}
              style={selectStyle}
            >
              {INDENTORS.map((i) => (
                <option key={i} value={i}>{i}</option>
              ))}
            </select>
          </F>

          <F label="Assigned To">
            <select
              className="form-select"
              value={filterAssigned}
              onChange={(e) => setFilterAssigned(e.target.value)}
              style={selectStyle}
            >
              {ASSIGNED_TO.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </F>

          <F label="Appr Status">
            <select
              className="form-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={selectStyle}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </F>
        </div>
      </div>

      {/* Batch Actions Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748b' }}>
          Showing <span style={{ color: '#1e293b', fontWeight: 700 }}>{filteredData.length}</span> entries requiring approval action
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={handleBatchApprove}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '6px 14px', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 700,
              cursor: 'pointer', border: 'none', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff',
              boxShadow: '0 2px 6px rgba(16, 185, 129, 0.2)'
            }}
          >
            <FaCheckCircle size={12} /> Approve Selected ({selectedIds.length})
          </button>

          <button
            type="button"
            onClick={handleBatchReject}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '6px 14px', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 700,
              cursor: 'pointer', border: 'none', background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: '#fff',
              boxShadow: '0 2px 6px rgba(239, 68, 68, 0.2)'
            }}
          >
            <FaTimesCircle size={12} /> Reject Selected ({selectedIds.length})
          </button>
        </div>
      </div>

      {/* Approval Table */}
      <div style={{ background: '#fff', border: '1px solid var(--border, #e2e8f0)', borderRadius: '8px', overflowX: 'auto' }}>
        <table className="w-full text-xs" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg-light, #f8fafc)', borderBottom: '2px solid var(--border, #e2e8f0)', color: '#475569' }}>
              <th style={{ padding: '10px 12px', textAlign: 'center', width: '40px' }}>
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={filteredData.length > 0 && selectedIds.length === filteredData.length}
                />
              </th>
              <th style={{ padding: '10px 12px', textAlign: 'center', width: '45px' }}>S No</th>
              <th style={{ padding: '10px 12px', textAlign: 'left' }}>Ind No</th>
              <th style={{ padding: '10px 12px', textAlign: 'left' }}>Ind Date</th>
              <th style={{ padding: '10px 12px', textAlign: 'left' }}>Item Name</th>
              <th style={{ padding: '10px 12px', textAlign: 'right', width: '90px' }}>Ind. Qty</th>
              <th style={{ padding: '10px 12px', textAlign: 'right', width: '100px' }}>Appr. Qty</th>
              <th style={{ padding: '10px 12px', textAlign: 'left' }}>Assigned To</th>
              <th style={{ padding: '10px 12px', textAlign: 'left' }}>Indentor</th>
              <th style={{ padding: '10px 12px', textAlign: 'left' }}>Department</th>
              <th style={{ padding: '10px 12px', textAlign: 'left' }}>Unit</th>
              <th style={{ padding: '10px 12px', textAlign: 'center', width: '90px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={12} style={{ padding: '32px 16px', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                  No data available in table matching approval criteria
                </td>
              </tr>
            ) : (
              filteredData.map((row, idx) => (
                <tr key={row.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(row.id)}
                      onChange={() => handleSelectOne(row.id)}
                    />
                  </td>
                  <td style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 600, color: '#64748b' }}>{idx + 1}</td>
                  <td style={{ padding: '8px 12px', fontWeight: 700, color: '#1e293b' }}>{row.indentNo}</td>
                  <td style={{ padding: '8px 12px' }}>{row.indentDate}</td>
                  <td style={{ padding: '8px 12px', fontWeight: 700, color: '#0f172a' }}>{row.itemName}</td>
                  <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600 }}>{row.indQty}</td>
                  
                  {/* Appr Qty Input */}
                  <td style={{ padding: '4px 8px', textAlign: 'right' }}>
                    <input
                      type="number"
                      value={row.apprQty}
                      onChange={(e) => handleApprQtyChange(row.id, e.target.value)}
                      className="form-input"
                      style={{ fontSize: '0.8rem', height: '28px', padding: '2px 6px', textAlign: 'right', fontWeight: 700, border: '1px solid #cbd5e1' }}
                    />
                  </td>

                  <td style={{ padding: '8px 12px' }}>{row.assignedTo}</td>
                  <td style={{ padding: '8px 12px' }}>{row.indentorName}</td>
                  <td style={{ padding: '8px 12px' }}>{row.department}</td>
                  <td style={{ padding: '8px 12px' }}>{row.unit}</td>
                  
                  {/* Inline Action Buttons */}
                  <td style={{ padding: '6px 8px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                      <button
                        type="button"
                        onClick={() => handleApproveRow(row)}
                        style={{ border: 'none', background: '#dcfce7', color: '#15803d', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontWeight: 700, fontSize: '0.72rem' }}
                        title="Approve"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRejectRow(row)}
                        style={{ border: 'none', background: '#fee2e2', color: '#dc2626', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontWeight: 700, fontSize: '0.72rem' }}
                        title="Reject"
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default IndentApprovalList;
