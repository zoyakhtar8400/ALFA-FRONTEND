import F from '../../../../../components/common/F';
import SearchDropdown from '../../../../../components/common/SearchDropdown';
import { FaTag } from 'react-icons/fa';

const BillingInfoSection = ({ form, set, setForm, sectionTitle }) => {
  return (
    <div style={{ background: 'var(--card-bg, #fff)', border: '1px solid var(--border)', borderRadius: '6px', padding: '10px 14px' }}>
      {sectionTitle(<FaTag />, 'Marketing & Reference Information')}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px 8px', alignItems: 'start' }}>

        {/* Row 1: Purpose | Company */}
        <div style={{ gridColumn: 'span 3', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <F label="Purpose of Visit">
            <select className="form-select" value={form.purposeOfVisit} onChange={set('purposeOfVisit')} style={{ fontSize: '0.9rem', padding: '4px 6px', height: '34px' }}>
              <option value="">Select Purpose</option>
              <option value="Business">Business</option>
              <option value="Leisure">Leisure</option>
              <option value="Medical">Medical</option>
              <option value="Transit">Transit</option>
              <option value="Education">Education</option>
            </select>
          </F>
          <SearchDropdown
            label="Company"
            value={form.company}
            onChange={val => setForm(f => ({ ...f, company: val }))}
            options={[
              { value: 'Alfa Corp', label: 'Alfa Corp' },
              { value: 'Google', label: 'Google' },
              { value: 'Microsoft', label: 'Microsoft' },
              { value: 'Infosys', label: 'Infosys' },
              { value: 'TCS', label: 'TCS' },
              { value: 'Wipro', label: 'Wipro' },
              { value: 'Reliance', label: 'Reliance' },
            ]}
            placeholder="Search company..."
          />
        </div>

        {/* Row 2: Company GSTIN */}
        <div style={{ gridColumn: 'span 3' }}>
          <F label="Company GSTIN" placeholder="GST number" value={form.companyGstin} onChange={set('companyGstin')} />
        </div>

        {/* Row 3: Market Seg | Bus. Src | Bkg Ref No */}
        <F label="Market Seg" required>
          <select className="form-select" value={form.marketSegment} onChange={set('marketSegment')} style={{ fontSize: '0.9rem', padding: '4px 6px', height: '34px' }} required>
            <option value="SELF">SELF</option>
            <option value="Corporate">Corporate</option>
            <option value="FIT">FIT</option>
            <option value="Group">Group</option>
            <option value="Government">Government</option>
            <option value="Leisure">Leisure</option>
          </select>
        </F>
        <F label="Bus. Src" required>
          <select className="form-select" value={form.businessSource} onChange={set('businessSource')} style={{ fontSize: '0.9rem', padding: '4px 6px', height: '34px' }} required>
            <option value="SELF">SELF</option>
            <option value="Direct">Direct</option>
            <option value="OTA">OTA</option>
            <option value="Travel Agent">Travel Agent</option>
            <option value="Walk-in">Walk-in</option>
          </select>
        </F>
        <F label="Bkg Ref No" placeholder="Booking Ref No" value={form.bookingRefNo} onChange={set('bookingRefNo')} />

        {/* Row 4: Mgmt Blk | Arrived From | Destination */}
        <F label="Mgmt Blk">
          <select className="form-select" value={form.managementBlock} onChange={set('managementBlock')} style={{ fontSize: '0.9rem', padding: '4px 6px', height: '34px' }}>
            <option value="No">No</option>
            <option value="Yes">Yes</option>
          </select>
        </F>
        <F label="Arrived From" placeholder="Arrived from" value={form.arrivedFrom} onChange={set('arrivedFrom')} />
        <F label="Destination" placeholder="Destination" required value={form.destination} onChange={set('destination')} />

        {/* Row 5: Discount | Payment Mode | Remark */}
        <F label="Discount" type="number" placeholder="0" value={form.discount} onChange={set('discount')} />
        <F label="Payment Mode" required>
          <select className="form-select" value={form.paymentMode} onChange={set('paymentMode')} style={{ fontSize: '0.9rem', padding: '4px 6px', height: '34px' }} required>
            <option value="CASH">CASH</option>
            <option value="CARD">CARD</option>
            <option value="UPI">UPI</option>
            <option value="BANK TRANSFER">BANK TRANSFER</option>
            <option value="CREDIT">CREDIT</option>
          </select>
        </F>
        <F label="Remark" placeholder="Remarks..." value={form.remark} onChange={set('remark')} />

      </div>
    </div>
  );
};

export default BillingInfoSection;
