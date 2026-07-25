import React from 'react';
import CommonModal from '../../../../components/common/CommonModal';

const PurchaseReturnEntryView = ({ isOpen, onClose, data }) => {
  if (!isOpen || !data) return null;

  return (
    <CommonModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Purchase Return Voucher — #${data.entryNo}`}
      maxWidth="600px"
    >
      <div className="flex flex-col gap-3 py-2 text-xs">
        <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg flex justify-between items-center">
          <div>
            <span className="font-mono text-[10px] font-bold px-2 py-0.5 bg-slate-200 rounded">Entry #{data.entryNo}</span>
            <h4 className="text-sm font-bold text-slate-800 mt-1">{data.customer || data.supplier}</h4>
            <p className="text-slate-500">Bill No: {data.ptyBillNo || data.prtyBillNo} • Date: {data.entryDate}</p>
          </div>
          <div className="text-right">
            <span className="text-base font-extrabold text-[#418A8B]">₹{Number(data.netAmount || 0).toLocaleString('en-IN')}</span>
            <p className="text-[11px] font-bold text-slate-600 mt-0.5">Approved: {data.approvedBy}</p>
          </div>
        </div>

        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 font-bold border-b border-slate-200 text-slate-600">
              <tr>
                <th className="p-2">SNo</th>
                <th className="p-2">Conv Unit</th>
                <th className="p-2 text-right">Qty</th>
                <th className="p-2 text-right">SKU Qty</th>
                <th className="p-2 text-right">Rate</th>
                <th className="p-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(data.lines || []).map((l, i) => (
                <tr key={i}>
                  <td className="p-2 font-medium">{i + 1}</td>
                  <td className="p-2">{l.convUnit}</td>
                  <td className="p-2 text-right font-bold">{l.qty}</td>
                  <td className="p-2 text-right">{l.skuQty} {l.skuUnit}</td>
                  <td className="p-2 text-right">₹{l.rate}</td>
                  <td className="p-2 text-right font-bold">₹{l.amt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center text-slate-500 text-[11px] pt-1">
          <div>Prepared By: <span className="font-bold text-slate-700">{data.preparedBy || 'DEMO'}</span> | Modified By: <span className="font-bold text-slate-700">{data.modifiedBy || 'DEMO'}</span></div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-[#418A8B] text-white font-bold rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    </CommonModal>
  );
};

export default PurchaseReturnEntryView;
