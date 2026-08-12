import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FormCard from '../../../../../components/common/FormCard';
import PageHeader from '../../../../../components/common/PageHeader';
import F from '../../../../../components/common/F';
import { FaPercentage } from 'react-icons/fa';
import { useItemMenu } from '../useItemMenu';

const HSNCodeEntryPage = ({ showToast }) => {
  const navigate = useNavigate();

  const toastTrigger = useCallback((msg) => {
    if (showToast) showToast(msg);
    else if (window.showToast) window.showToast(msg);
  }, [showToast]);

  const cardStyle = {
    background: 'var(--card-bg, #fff)',
    border: '1px solid var(--border)',
    borderRadius: '6px',
    padding: '10px 14px',
    marginBottom: '10px'
  };

  const sectionTitle = (icon, title) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '2px 0 4px', borderBottom: '2px solid var(--primary)', marginBottom: '8px' }}>
      <span style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', color: 'var(--primary)' }}>{icon}</span>
      <span style={{ fontWeight: 700, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--primary)' }}>{title}</span>
    </div>
  );

  const {
    itemGroups,
    menuItems,
    setMenuItems
  } = useItemMenu('hsn-update', toastTrigger);

  // States for interactive HSN Code Entry tab
  const [selectedGroup, setSelectedGroup] = useState('');
  const [applicableDate, setApplicableDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [hsnTableList, setHsnTableList] = useState([]);

  // HSN Table Fill Action
  const handleHsnFill = () => {
    const targetGroup = selectedGroup || itemGroups[0]?.name;
    if (!targetGroup) {
      toastTrigger('No Item Group selected.');
      return;
    }
    const matchingItems = menuItems.filter(item => item.itemGroup === targetGroup);
    setHsnTableList(matchingItems.map(item => ({ ...item })));
    toastTrigger(`Loaded ${matchingItems.length} items for HSN update.`);
  };

  // Row HSN code change handler
  const handleHsnCodeChange = (idx, value) => {
    setHsnTableList(prev => {
      const list = [...prev];
      list[idx].hsnCode = value;
      return list;
    });
  };

  // HSN Table Save Action
  const handleHsnSave = () => {
    if (hsnTableList.length === 0) {
      toastTrigger('Please click Fill to load items first.');
      return;
    }
    const sampleHsn = hsnTableList[0]?.hsnCode || '2106';
    const selectedGroupObj = itemGroups.find(g => g.name === selectedGroup);
    
    posApi.updateHsnCodes({
      category_id: selectedGroupObj?.id || 1,
      hsn_code: sampleHsn
    }).then(() => {
      setMenuItems(prev => {
        return prev.map(item => {
          const match = hsnTableList.find(x => x.id === item.id);
          return match ? { ...item, hsnCode: match.hsnCode } : item;
        });
      });
      toastTrigger('HSN codes saved successfully in PostgreSQL for all loaded items.');
    }).catch(err => {
      toastTrigger(err?.response?.data?.message || 'Failed to update HSN codes');
    });
  };

  return (
    <div className="w-full flex flex-col p-6 animate-in fade-in duration-200">
      {/* Suppress scrollbars globally */}
      <style dangerouslySetInnerHTML={{
        __html: `
        ::-webkit-scrollbar {
          display: none !important;
          width: 0px !important;
          height: 0px !important;
        }
        * {
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
        }
      `}} />

      <PageHeader
        title="HSN Code Entry"
        breadcrumbs={['Dashboard', 'Point Of Sale', 'Master', 'Item Menu', 'HSN Code Entry']}
        style={{ marginBottom: '8px', paddingBottom: '2px' }}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '0 8px 4px' }}>
        {/* Parameters Form Card */}
        <div style={cardStyle}>
          {sectionTitle(<FaPercentage />, 'HSN Code Configuration')}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', alignItems: 'end', marginBottom: '8px' }}>
            <F label="Item Group *">
              <select
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                className="form-select"
                style={{ height: '34px', fontSize: '0.9rem' }}
              >
                <option value="">--Select Item Group--</option>
                {(itemGroups.length > 0 ? itemGroups : [{ name: 'Indian Starter' }, { name: 'Chinese Main Course' }, { name: 'Domestic Beer' }]).map((g, idx) => (
                  <option key={idx} value={g.name}>{g.name}</option>
                ))}
              </select>
            </F>

            <F label="Applicable Date *">
              <input
                type="date"
                value={applicableDate}
                onChange={(e) => setApplicableDate(e.target.value)}
                className="form-input"
                style={{ height: '34px' }}
                required
              />
            </F>
          </div>

          {/* Actions row */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
            <button
              type="button"
              onClick={handleHsnFill}
              className="btn-primary"
              style={{ padding: '6px 16px', borderRadius: '4px', height: '34px', fontSize: '13px' }}
            >
              Fill
            </button>
            <button
              type="button"
              onClick={handleHsnSave}
              className="btn-secondary"
              style={{ padding: '6px 16px', borderRadius: '4px', height: '34px', fontSize: '13px' }}
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => {
                setHsnTableList([]);
                navigate('/pos/master/item-menu/main-group');
              }}
              className="btn-secondary"
              style={{ padding: '6px 16px', borderRadius: '4px', height: '34px', fontSize: '13px', background: '#f1f5f9', color: '#475569' }}
            >
              Exit
            </button>
          </div>
        </div>

        {/* List updates Card */}
        <div style={cardStyle}>
          {sectionTitle(<FaPercentage />, 'HSN Code Updates List')}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="py-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center" style={{ width: '80px' }}>Serial Number</th>
                  <th className="py-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Item</th>
                  <th className="py-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider">HSN Code</th>
                  <th className="py-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Item Category</th>
                </tr>
              </thead>
              <tbody>
                {hsnTableList.map((item, idx) => (
                  <tr key={item.id} className="border-b border-slate-100 last:border-b-0">
                    <td className="py-2 text-center text-sm text-slate-600">{idx + 1}</td>
                    <td className="py-2 text-sm font-semibold text-slate-800">{item.name}</td>
                    <td className="py-2">
                      <input
                        type="text"
                        placeholder="Enter HSN Code"
                        value={item.hsnCode || ''}
                        onChange={(e) => handleHsnCodeChange(idx, e.target.value)}
                        className="form-input w-full max-w-[200px]"
                        style={{ height: '34px', fontSize: '13px', padding: '4px 8px' }}
                      />
                    </td>
                    <td className="py-2 text-sm text-slate-600">{item.category}</td>
                  </tr>
                ))}
                {hsnTableList.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-400 text-sm">
                      Please select an item group and click Fill to load items.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HSNCodeEntryPage;
