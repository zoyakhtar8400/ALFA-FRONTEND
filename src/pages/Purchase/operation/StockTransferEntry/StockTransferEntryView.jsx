import React from 'react';
import CommonModal from '../../../../components/common/CommonModal';

const StockTransferEntryView = ({ isOpen, onClose, data }) => {
  if (!isOpen || !data) return null;

  return (
    <CommonModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Stock Transfer Voucher — ${data.transferNo}`}
      maxWidth="500px"
    >
      <div className="flex flex-col gap-3 py-2 text-xs">
        <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg flex justify-between items-center">
          <div>
            <span className="font-mono text-[10px] font-bold px-2 py-0.5 bg-slate-200 rounded">{data.transferNo}</span>
            <h4 className="text-sm font-bold text-slate-800 mt-1">{data.itemName}</h4>
            <p className="text-slate-500">{data.fromStore} → {data.toStore}</p>
          </div>
          <div className="text-right">
            <span className="text-base font-extrabold text-[#418A8B]">{data.transferQty} {data.unitName}</span>
            <p className="font-bold text-emerald-700 mt-1">{data.status}</p>
          </div>
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

export default StockTransferEntryView;
