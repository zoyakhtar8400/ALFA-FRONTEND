import React, { useState } from 'react';
import CommonModal from '../../../../components/common/CommonModal';
import CommonActionButtons from '../../../../components/common/CommonActionButtons';
import F from '../../../../components/common/F';

const IndentApprovalForm = ({ isOpen, onClose, onSave, indents = [] }) => {
  const pendingIndents = indents.filter((i) => i.status !== 'Approved' && i.status !== 'Rejected');
  const [selectedIndentId, setSelectedIndentId] = useState(pendingIndents[0]?.id || '');
  const [approvedQty, setApprovedQty] = useState('');
  const [approvalStatus, setApprovalStatus] = useState('Approved');
  const [remarks, setRemarks] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const ind = indents.find((i) => String(i.id) === String(selectedIndentId));
    if (!ind) return;

    onSave({
      ...ind,
      approvedQty: parseFloat(approvedQty) || ind.requiredQty,
      status: approvalStatus,
      approvalRemarks: remarks || `Status set to ${approvalStatus}`
    });
  };

  return (
    <CommonModal
      isOpen={isOpen}
      onClose={onClose}
      title="Indent Requisition Approval"
      maxWidth="500px"
    >
      <form onSubmit={handleSubmit} className="py-1">
        <div className="grid grid-cols-1 gap-4">
          <F label="Select Pending Indent" required>
            <select
              value={selectedIndentId}
              onChange={(e) => {
                const id = e.target.value;
                setSelectedIndentId(id);
                const found = indents.find((i) => String(i.id) === String(id));
                if (found) setApprovedQty(found.requiredQty);
              }}
              className="form-select w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:border-teal-600 font-bold"
            >
              {pendingIndents.length === 0 && <option value="">No pending indents available</option>}
              {pendingIndents.map((i) => (
                <option key={i.id} value={i.id}>{i.indentNo} — {i.itemName} ({i.requiredQty} {i.unitName})</option>
              ))}
            </select>
          </F>

          <div className="grid grid-cols-2 gap-4">
            <F
              label="Approved Quantity"
              type="number"
              required
              value={approvedQty}
              onChange={(e) => setApprovedQty(e.target.value)}
              placeholder="0"
            />

            <F label="Decision">
              <select
                value={approvalStatus}
                onChange={(e) => setApprovalStatus(e.target.value)}
                className="form-select w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:border-teal-600 font-bold"
              >
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </F>
          </div>

          <F
            label="Approval Remarks"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Approval reason or instructions..."
          />
        </div>

        <CommonActionButtons
          onCancel={onClose}
          saveText="Process Approval"
        />
      </form>
    </CommonModal>
  );
};

export default IndentApprovalForm;
