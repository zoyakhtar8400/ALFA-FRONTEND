import React from 'react';
import CommonModal from '../../../../components/common/CommonModal';
import { PrintHeader, PrintFooter } from '../../../../components/common/PrintComponent';
import { FaPrint } from 'react-icons/fa';

const IndentEntryView = ({ isOpen, onClose, data }) => {
  if (!isOpen || !data) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <CommonModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Purchase Indent Voucher — ${data.indentNo}`}
      maxWidth="500px"
    >
      <div id="printable-voucher" className="flex flex-col gap-3 py-2 text-xs">
        <PrintHeader title={`Purchase Indent Requisition (${data.indentNo})`} />

        <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg flex justify-between items-center">
          <div>
            <span className="font-mono text-[10px] font-bold px-2 py-0.5 bg-slate-200 rounded">{data.indentNo}</span>
            <h4 className="text-sm font-bold text-slate-800 mt-1">{data.itemName}</h4>
            <p className="text-slate-500">Dept: {data.department}</p>
          </div>
          <div className="text-right">
            <span className="text-base font-extrabold text-[#418A8B]">{data.requiredQty} {data.unitName}</span>
            <p className="font-bold text-amber-700 mt-1">{data.status}</p>
          </div>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
          <p className="text-slate-500 font-semibold mb-1">Notes / Requisition Purpose:</p>
          <p className="text-slate-800">{data.notes || 'No notes provided.'}</p>
        </div>

        <PrintFooter title={data.indentNo} />

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

export default IndentEntryView;
