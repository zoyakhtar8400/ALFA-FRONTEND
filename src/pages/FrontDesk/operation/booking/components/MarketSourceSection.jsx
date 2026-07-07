import F from '../../../../../components/common/F';
import SearchDropdown from '../../../../../components/common/SearchDropdown';
import { FaIdCard } from 'react-icons/fa';

const MarketSourceSection = ({ form, set, setForm, sectionTitle }) => {
  return (
    <div style={{ background: 'var(--card-bg, #fff)', border: '1px solid var(--border)', borderRadius: '6px', padding: '12px 16px' }}>
      {sectionTitle(<FaIdCard />, 'Market & Source')}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 12px' }}>
        
        {/* Company Add – Search Dropdown */}
        <div style={{ gridColumn: 'span 2' }}>
          <SearchDropdown
            value={form.company}
            onChange={val => setForm(f => ({ ...f, company: val }))}
            label="Company Add"
            addBtn
            options={[
              { value: 'Alfa Corp', label: 'Alfa Corp' },
              { value: 'Google', label: 'Google' },
              { value: 'Microsoft', label: 'Microsoft' },
              { value: 'Infosys', label: 'Infosys' },
              { value: 'TCS', label: 'TCS' },
              { value: 'Wipro', label: 'Wipro' },
              { value: 'HCL', label: 'HCL' },
              { value: 'Reliance', label: 'Reliance' },
            ]}
            placeholder="Search company..."
          />
        </div>

        <F label="Market Seg" value={form.marketSegment} onChange={set('marketSegment')}>
          <select className="form-select" value={form.marketSegment} onChange={set('marketSegment')} style={{ fontSize: '0.9rem' }}>
            <option value="">Select Market Seg</option>
            <option value="SELF">SELF</option>
            <option value="Corporate">Corporate</option>
            <option value="FIT">FIT</option>
            <option value="Group">Group</option>
            <option value="Government">Government</option>
            <option value="Leisure">Leisure</option>
          </select>
        </F>

        <F label="Bus. Src" value={form.businessSource} onChange={set('businessSource')}>
          <select className="form-select" value={form.businessSource} onChange={set('businessSource')} style={{ fontSize: '0.9rem' }}>
            <option value="">Select Bus. Src</option>
            <option value="SELF">SELF</option>
            <option value="Direct">Direct</option>
            <option value="OTA">OTA</option>
            <option value="Travel Agent">Travel Agent</option>
            <option value="Walk-in">Walk-in</option>
          </select>
        </F>

        <div style={{ gridColumn: 'span 2' }}>
          <F label="Discount %" type="number" placeholder="0" value={form.discount} onChange={set('discount')} />
        </div>
      </div>
    </div>
  );
};

export default MarketSourceSection;
