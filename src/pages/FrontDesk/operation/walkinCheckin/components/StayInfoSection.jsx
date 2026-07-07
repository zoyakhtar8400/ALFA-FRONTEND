import F from '../../../../../components/common/F';
import { FaClock } from 'react-icons/fa';

const StayInfoSection = ({ form, set, handleDaysChange, sectionTitle }) => {
  return (
    <div style={{ background: 'var(--card-bg, #fff)', border: '1px solid var(--border)', borderRadius: '6px', padding: '10px 14px' }}>
      {sectionTitle(<FaClock />, 'Stay & GRC Information')}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px 8px' }}>
        <F label="Days" type="number" required value={form.days} onChange={e => handleDaysChange(e.target.value)} />
        <F label="Time" type="text" placeholder="12:00 PM" required value={form.time} onChange={set('time')} />
        <F label="Exp.ChkOut Date" type="date" required value={form.expectedCheckoutDate} onChange={set('expectedCheckoutDate')} />
        <div style={{ gridColumn: 'span 3' }}>
          <F label="Exp. Checkout Time" type="text" placeholder="12:00 PM" required value={form.expectedCheckoutTime} onChange={set('expectedCheckoutTime')} />
        </div>
      </div>
    </div>
  );
};

export default StayInfoSection;
