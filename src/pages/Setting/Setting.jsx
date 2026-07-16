import React, { useState } from 'react';
import TaxStructure from './TaxStructure';

const TABS = ['Tax Structure'];

const Setting = ({ showToast = () => { } }) => {
  const [activeTab, setActiveTab] = useState('Tax Structure');

  return (
    <div className="p-6 flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">System Settings</h2>
        <p className="text-sm text-slate-500 mt-1">Configure company details, room rates, staff roles, and billing rules.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 text-sm font-bold rounded-t-lg transition-colors cursor-pointer ${activeTab === tab
                ? 'bg-[#418a8b] text-white'
                : 'text-slate-500 hover:text-[#418a8b]'
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Tax Structure' && <TaxStructure showToast={showToast} />}
    </div>
  );
};

export default Setting;
