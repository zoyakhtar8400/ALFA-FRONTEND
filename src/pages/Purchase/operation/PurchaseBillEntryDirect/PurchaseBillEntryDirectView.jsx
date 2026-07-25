import React from 'react';
import CommonModal from '../../../../components/common/CommonModal';

const PurchaseBillEntryDirectView = ({ isOpen, onClose, data }) => {
  if (!isOpen || !data) return null;

  return (
    <CommonModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Direct Purchase Bill Details — #${data.entryNo}`}
      maxWidth="600px"
    >
      <div className="py-2 text-xs space-y-3">
        <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg flex justify-between items-center">
          <div>
            <h4 className="font-bold text-slate-800 text-sm">{data.customer || data.supplier}</h4>
            <p className="text-slate-500">Bill No: {data.ptyBillNo} • Date: {data.entryDate}</p>
          </div>
          <span className="font-extrabold text-[#418A8B] text-base">₹{Number(data.netAmount || 0).toLocaleString('en-IN')}</span>
        </div>

        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 font-bold border-b border-slate-200 text-slate-600">
              <tr>
                <th className="p-2">Item</th>
                <th className="p-2 text-right">Qty</th>
                <th className="p-2 text-right">Rate</th>
                <th className="p-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(data.lines || []).map((l, i) => (
                <tr key={i}>
                  <td className="p-2 font-medium">{l.item}</td>
                  <td className="p-2 text-right">{l.qty} {l.unit}</td>
                  <td className="p-2 text-right">₹{l.rate}</td>
                  <td className="p-2 text-right font-bold">₹{l.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#418A8B] text-white font-bold rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    </CommonModal>
  );
};

export default PurchaseBillEntryDirectView;
