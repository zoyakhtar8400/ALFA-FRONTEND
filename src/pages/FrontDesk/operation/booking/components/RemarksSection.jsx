import F from '../../../../../components/common/F';
import { FaCar } from 'react-icons/fa';

const RemarksSection = ({ form, set, sectionTitle }) => {
  return (
    <div style={{ background: 'var(--card-bg, #fff)', border: '1px solid var(--border)', borderRadius: '6px', padding: '12px 16px' }}>
      {sectionTitle(<FaCar />, 'Reference & Remarks')}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 12px' }}>
        <F label="Arived Form" placeholder="Arrived from" value={form.arrivedFrom} onChange={set('arrivedFrom')} />
        <F label="Booking Ref. No" placeholder="Ref No" value={form.bookingRefNo} onChange={set('bookingRefNo')} />
        
        <F label="Booking Ref Date" type="date" value={form.bookingRefDate} onChange={set('bookingRefDate')} />
        <F label="Billing Instruction" placeholder="Enter instructions" value={form.billingInstruction} onChange={set('billingInstruction')} />

        <div style={{ gridColumn: 'span 2' }}>
          <F label="Final Remark" placeholder="Enter remarks" value={form.remark} onChange={set('remark')} />
        </div>
      </div>
    </div>
  );
};

export default RemarksSection;
