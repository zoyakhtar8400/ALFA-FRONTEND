import React from 'react';
import CommonModal from '../../../../components/common/CommonModal';
import { PrintHeader, PrintFooter } from '../../../../components/common/PrintComponent';
import { FaPrint } from 'react-icons/fa';

const GRNEntryView = ({ isOpen, onClose, data }) => {
  if (!isOpen || !data) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <CommonModal
      isOpen={isOpen}
      onClose={onClose}
      title={`GRN Voucher Details — ${data.grnNo}`}
      maxWidth="500px"
    >
      <div className="flex flex-col gap-3 py-2 text-xs">
        <PrintHeader title={`Goods Receipt Note (${data.grnNo})`} />

        <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg flex justify-between items-center">
          <div>
            <span className="font-mono text-[10px] font-bold px-2 py-0.5 bg-slate-200 rounded">{data.grnNo}</span>
            <h4 className="text-sm font-bold text-slate-800 mt-1">{data.itemName}</h4>
            <p className="text-slate-500">Ref PO: {data.poNumber}</p>
          </div>
          <div className="text-right">
            <span className="text-base font-extrabold text-emerald-700">{data.receivedQty} {data.unitName}</span>
            <p className="font-bold text-[#418A8B] mt-1">₹{Number(data.totalAmount || 0).toLocaleString('en-IN')}</p>
          </div>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex justify-between">
          <p className="text-slate-600 font-bold">Challan / Bill Ref: <span className="text-slate-800 font-mono">{data.challanNo}</span></p>
          <p className="text-slate-600 font-bold">Rejected: <span className="text-red-600 font-bold">{data.rejectedQty || 0}</span></p>
        </div>

        <PrintFooter title={data.grnNo} />

        <div className="flex justify-between items-center pt-2 border-t border-slate-200 mt-2">
          <button
            type="button"
            onClick={handlePrint}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors"
          >
            <FaPrint size={12} /> Print Voucher
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-[#418A8B] text-white font-bold rounded-lg transition-colors"
          >
            Close Voucher
          </button>
        </div>
      </div>
    </CommonModal>
  );
};

export default GRNEntryView;
