import React from 'react';
import CommonModal from '../../../../components/common/CommonModal';

const UnitMasterView = ({ isOpen, onClose, data }) => {
  if (!isOpen || !data) return null;

  return (
    <CommonModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Unit Master Details — ${data.name}`}
      maxWidth="450px"
    >
      <div className="flex flex-col gap-3 py-2 text-xs">
        <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg flex justify-between items-center">
          <div>
            <span className="font-mono text-[10px] font-bold px-2 py-0.5 bg-slate-200 rounded">{data.code}</span>
            <h4 className="text-sm font-bold text-slate-800 mt-1">{data.name}</h4>
          </div>
          <span className="font-bold text-teal-700 bg-teal-100 px-2 py-1 rounded">{data.active === 'Yes' ? 'Active' : 'Inactive'}</span>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
          <p className="text-slate-500 font-semibold mb-1">Short Symbol:</p>
          <p className="text-sm font-bold text-slate-800">{data.shortName || data.code}</p>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#418A8B] text-white font-bold rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </CommonModal>
  );
};

export default UnitMasterView;
