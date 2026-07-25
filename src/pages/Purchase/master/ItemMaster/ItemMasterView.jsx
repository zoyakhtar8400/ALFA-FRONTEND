import React from 'react';
import CommonModal from '../../../../components/common/CommonModal';

const ItemMasterView = ({ isOpen, onClose, data }) => {
  if (!isOpen || !data) return null;

  const Row = ({ label, value }) => (
    <div className="flex items-start gap-3 py-2 border-b border-slate-100 last:border-0 text-xs">
      <span className="w-40 font-semibold text-slate-500 shrink-0">{label}</span>
      <span className="text-slate-800 font-medium">{value || '—'}</span>
    </div>
  );

  return (
    <CommonModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Item Master Details — ${data.name}`}
      maxWidth="550px"
    >
      <div className="py-2">
        <div className="p-4 bg-teal-50/60 border border-teal-200 rounded-xl mb-4 flex justify-between items-center">
          <div>
            <h4 className="text-base font-bold text-slate-800">{data.name}</h4>
            <p className="text-xs text-teal-700 font-medium mt-0.5">{data.itemGroupName} • {data.storeDepartment}</p>
          </div>
          <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${data.active === 'Yes' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
            {data.active === 'Yes' ? 'Active' : 'Inactive'}
          </span>
        </div>

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-0.5 max-h-[60vh] overflow-y-auto">
          <Row label="Item Name" value={data.name} />
          <Row label="Stock Unit (SKU)" value={data.unitName} />
          <Row label="Active" value={data.active} />
          <Row label="Item Category" value={data.itemCategory} />
          <Row label="Item Group" value={data.itemGroupName} />
          <Row label="Store Department" value={data.storeDepartment} />
          <Row label="Lot No Applicable" value={data.lotBatchNo} />
          <Row label="Conversion Unit" value={data.conversionUnit} />
          <Row label="Conv. Ratio (CR)" value={data.convRatio} />
          <Row label="Max Level" value={data.maxLevel} />
          <Row label="Min Level" value={data.minLevel} />
          <Row label="Re Order Level" value={data.reOrderLevel} />
          <Row label="MOQ" value={data.moq} />
          <Row label="PO Mandatory" value={data.poMandatory} />
          <Row label="HSN/SAC Code" value={data.hsnSacCode} />
          <Row label="Description" value={data.description} />
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-[#418A8B] hover:bg-[#346f70] text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
          >
            Close
          </button>
        </div>
      </div>
    </CommonModal>
  );
};

export default ItemMasterView;
