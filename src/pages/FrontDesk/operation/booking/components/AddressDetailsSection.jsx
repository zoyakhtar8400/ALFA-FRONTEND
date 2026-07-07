import F from '../../../../../components/common/F';
import SearchDropdown from '../../../../../components/common/SearchDropdown';
import { FaBuilding } from 'react-icons/fa';

const AddressDetailsSection = ({ form, set, setForm, sectionTitle }) => {
  return (
    <div style={{ background: 'var(--card-bg, #fff)', border: '1px solid var(--border)', borderRadius: '6px', padding: '12px 16px' }}>
      {sectionTitle(<FaBuilding />, 'Address Details')}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 12px' }}>
        <div className="form-field" style={{ gridColumn: 'span 2', marginBottom: '8px' }}>
          <F label="Address" placeholder="Enter full address" required value={form.address} onChange={set('address')} />
        </div>

        <div style={{ gridColumn: 'span 2' }}>
          <SearchDropdown
            value={form.city}
            onChange={val => setForm(f => ({ ...f, city: val }))}
            label="City"
            required
            addBtn
            options={[
              { value: 'Delhi', label: 'Delhi' },
              { value: 'Mumbai', label: 'Mumbai' },
              { value: 'Bangalore', label: 'Bangalore' },
              { value: 'Chennai', label: 'Chennai' },
              { value: 'Hyderabad', label: 'Hyderabad' },
              { value: 'Pune', label: 'Pune' },
              { value: 'Kolkata', label: 'Kolkata' },
              { value: 'Ahmedabad', label: 'Ahmedabad' },
              { value: 'Jaipur', label: 'Jaipur' },
              { value: 'Surat', label: 'Surat' },
            ]}
            placeholder="Search city..."
          />
        </div>
      </div>
    </div>
  );
};

export default AddressDetailsSection;
