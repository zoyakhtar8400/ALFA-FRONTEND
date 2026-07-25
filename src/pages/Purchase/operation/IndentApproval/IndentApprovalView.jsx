import React from 'react';
import CommonModal from '../../../../components/common/CommonModal';

const IndentApprovalView = ({ isOpen, onClose, data }) => {
  if (!isOpen || !data) return null;

  return (
    <CommonModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Indent Approval Details — ${data.indentNo}`}
      maxWidth="500px"
    >
      <div className="flex flex-col gap-3 py-2 text-xs">
        <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg flex justify-between items-center">
          <div>
            <span className="font-mono text-[10px] font-bold px-2 py-0.5 bg-slate-200 rounded">{data.indentNo}</span>
            <h4 className="text-sm font-bold text-slate-800 mt-1">{data.itemName}</h4>
            <p className="text-slate-500">Dept: {data.department}</p>
          </div>
          <div className="text-right">
            <span className="text-base font-extrabold text-emerald-700">{data.approvedQty || data.requiredQty} {data.unitName}</span>
            <p className="font-bold text-teal-700 mt-1">{data.status}</p>
          </div>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
          <p className="text-slate-500 font-semibold mb-1">Approval Remarks:</p>
          <p className="text-slate-800">{data.approvalRemarks || 'Approved according to standard quota.'}</p>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#418A8B] text-white font-bold rounded-lg transition-colors"
          >
            Close Voucher
          </button>
        </div>
      </div>
    </CommonModal>
  );
};

export default IndentApprovalView;
