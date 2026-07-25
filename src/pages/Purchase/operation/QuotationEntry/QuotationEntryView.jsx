import React from 'react';
import CommonModal from '../../../../components/common/CommonModal';

const QuotationEntryView = ({ isOpen, onClose, data }) => {
  if (!isOpen || !data) return null;

  return (
    <CommonModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Vendor Quotation Card — ${data.quotationNo}`}
      maxWidth="500px"
    >
      <div className="flex flex-col gap-3 py-2 text-xs">
        <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg flex justify-between items-center">
          <div>
            <span className="font-mono text-[10px] font-bold px-2 py-0.5 bg-slate-200 rounded">{data.quotationNo}</span>
            <h4 className="text-sm font-bold text-slate-800 mt-1">{data.vendorName}</h4>
            <p className="text-slate-500">Item: {data.itemName}</p>
          </div>
          <div className="text-right">
            <span className="text-base font-extrabold text-[#418A8B]">₹{Number(data.quotedRate || 0).toFixed(2)}</span>
            <p className="font-bold text-teal-700 mt-1">Valid: {data.validUntil}</p>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#418A8B] text-white font-bold rounded-lg transition-colors"
          >
            Close Card
          </button>
        </div>
      </div>
    </CommonModal>
  );
};

export default QuotationEntryView;
