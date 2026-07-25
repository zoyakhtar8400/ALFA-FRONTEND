import React from 'react';
import CommonModal from '../../../../components/common/CommonModal';

const ItemGroupView = ({ isOpen, onClose, data }) => {
  if (!isOpen || !data) return null;

  const Row = ({ label, value }) => (
    <div className="flex items-start gap-3 py-2 border-b border-slate-100 last:border-0">
      <span className="w-36 text-xs font-semibold text-slate-500 shrink-0">{label}</span>
      <span className="text-xs text-slate-800 font-medium">{value || '—'}</span>
    </div>
  );

  return (
    <CommonModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Item Group — ${data.name}`}
      maxWidth="420px"
    >
      <div className="py-2">
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex flex-col gap-0.5">
          <Row label="Item Group" value={data.name} />
          <Row label="Type" value={data.type} />
          <Row label="Post In A/c" value={data.postInAc} />
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#418A8B] text-white text-sm font-bold rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    </CommonModal>
  );
};

export default ItemGroupView;
