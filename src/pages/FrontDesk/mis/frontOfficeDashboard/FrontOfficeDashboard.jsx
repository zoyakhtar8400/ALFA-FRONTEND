import React from 'react';
import PageHeader from '../../../../components/common/PageHeader';

const FrontOfficeDashboard = ({ showToast = () => {} }) => {
  return (
    <div className="max-w-7xl mx-auto w-full flex flex-col gap-8 text-slate-800 p-2">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/60 pb-5 no-print">
        <PageHeader
          title="Front Office Dashboard"
          breadcrumbs={['Dashboard', 'Front Desk', 'MIS', 'Front Office Dashboard']}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 flex flex-col justify-between gap-2 shadow-sm">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Today In-House</span>
          <span className="text-3xl font-black text-[#418a8b]">84 Guests</span>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 flex flex-col justify-between gap-2 shadow-sm">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Expected Arrivals</span>
          <span className="text-3xl font-black text-emerald-600">18 Rooms</span>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 flex flex-col justify-between gap-2 shadow-sm">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Expected Departures</span>
          <span className="text-3xl font-black text-amber-600">12 Rooms</span>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 flex flex-col justify-between gap-2 shadow-sm">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Daily Revenue</span>
          <span className="text-3xl font-black text-indigo-600">$14,250</span>
        </div>
      </div>
    </div>
  );
};

export default FrontOfficeDashboard;
