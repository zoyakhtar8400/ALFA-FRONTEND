import { FaBed, FaPlus, FaTrash } from 'react-icons/fa';

const RoomGridSection = ({ form, rooms, setRoom, addRoom, removeRoom, sectionTitle }) => {
  return (
    <div style={{ background: 'var(--card-bg, #fff)', border: '1px solid var(--border)', borderRadius: '6px', padding: '12px 16px' }}>
      {sectionTitle(<FaBed />, 'Room Information')}

      {/* ── Booking No / Date / Status highlight strip ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '14px' }}>

        {/* Booking No – Indigo */}
        <div style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', borderRadius: '10px', padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.75)' }}>Booking No</span>
          <span style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', letterSpacing: '0.04em' }}>{form.bookingNo}</span>
        </div>

        {/* Date – Teal */}
        <div style={{ background: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)', borderRadius: '10px', padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.75)' }}>Date</span>
          <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fff' }}>
            {form.date ? new Date(form.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
          </span>
        </div>

        {/* Booking Status – Dynamic Color */}
        <div style={{
          borderRadius: '10px',
          padding: '10px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          background: form.bookingStatus === 'Confirmed'
            ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
            : form.bookingStatus === 'Tentative'
            ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
            : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        }}>
          <span style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.75)' }}>Booking Status</span>
          <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#fff' }}>
            {form.bookingStatus === 'Confirmed' ? '✔ Confirm' : form.bookingStatus === 'Tentative' ? '⏳ Tentative' : '✘ Cancel'}
          </span>
        </div>
      </div>
      
      {/* Room Rows – Table Layout in a single scrollable row */}
      <div style={{ overflowX: 'auto', width: '100%', marginBottom: '12px', border: '1px solid var(--border)', borderRadius: '8px' }}>
        <table style={{ width: '100%', minWidth: '1800px', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
          <thead>
            <tr style={{ background: 'var(--primary-light)', borderBottom: '2px solid var(--border)' }}>
              {['Action', 'S. No', 'Room / PKG', 'Arrival Date', 'Arrival Time', 'Days', 'Dep. Date', 'Dep. Time', 'Category', 'No. of Room', 'Plan Package', 'No. of Occ', 'No. of Child', 'Rate', 'Tax Inc.YN', 'Taxable Amount', 'Net Amount'].map((h, i) => (
                <th key={h} style={{ 
                  padding: '10px 8px', 
                  textAlign: h === 'Action' ? 'center' : 'left', 
                  fontWeight: 700, 
                  color: 'var(--primary)', 
                  fontSize: '0.72rem', 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.04em', 
                  whiteSpace: 'nowrap',
                  width: i === 0 ? '60px' : i === 1 ? '50px' : 'auto'
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rooms.map((row, idx) => (
              <tr key={idx} style={{ 
                borderBottom: '1px solid var(--border)',
                background: idx % 2 === 0 ? 'transparent' : 'rgba(0, 0, 0, 0.02)'
              }}>
                {/* Action - Delete Button */}
                <td style={{ padding: '8px', textAlign: 'center' }}>
                  <button
                    type="button"
                    onClick={() => removeRoom(idx)}
                    style={{
                      padding: '4px 8px', 
                      borderRadius: '6px',
                      background: 'rgba(239,68,68,0.1)', 
                      border: '1px solid rgba(239,68,68,0.3)',
                      color: '#ef4444', 
                      cursor: 'pointer', 
                      fontSize: '0.8rem', 
                      fontWeight: 600,
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      transition: 'all 0.2s',
                    }}
                    title="Remove Row"
                  >
                    <FaTrash style={{ fontSize: '0.75rem' }} />
                  </button>
                </td>

                {/* S. No */}
                <td style={{ padding: '8px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  {idx + 1}
                </td>

                {/* Room / PKG */}
                <td style={{ padding: '8px' }}>
                  <select 
                    className="form-select" 
                    value={row.roomNo} 
                    onChange={e => setRoom(idx, 'roomNo', e.target.value)} 
                    style={{ fontSize: '0.8rem', padding: '4px 6px', height: '32px', minHeight: '32px', width: '120px' }}
                  >
                    <option value="">Select</option>
                    <option value="101">101</option>
                    <option value="102">102</option>
                    <option value="201">201</option>
                    <option value="202">202</option>
                    <option value="Deluxe Package">Deluxe Package</option>
                  </select>
                </td>

                {/* Arrival Date */}
                <td style={{ padding: '8px' }}>
                  <input 
                    className="form-input" 
                    type="date" 
                    value={row.arrivalDate} 
                    onChange={e => setRoom(idx, 'arrivalDate', e.target.value)} 
                    style={{ fontSize: '0.8rem', padding: '4px 6px', height: '32px', minHeight: '32px', width: '135px' }} 
                  />
                </td>

                {/* Arrival Time */}
                <td style={{ padding: '8px' }}>
                  <input 
                    className="form-input" 
                    type="text" 
                    value={row.arrivalTime} 
                    onChange={e => setRoom(idx, 'arrivalTime', e.target.value)} 
                    placeholder="03:00 PM" 
                    style={{ fontSize: '0.8rem', padding: '4px 6px', height: '32px', minHeight: '32px', width: '100px' }} 
                  />
                </td>

                {/* Days */}
                <td style={{ padding: '8px' }}>
                  <input 
                    className="form-input" 
                    type="number" 
                    min="1" 
                    value={row.days} 
                    onChange={e => setRoom(idx, 'days', e.target.value)} 
                    placeholder="0"
                    style={{ fontSize: '0.8rem', padding: '4px 6px', height: '32px', minHeight: '32px', width: '70px' }} 
                  />
                </td>

                {/* Dep. Date */}
                <td style={{ padding: '8px' }}>
                  <input 
                    className="form-input" 
                    type="date" 
                    value={row.depDate} 
                    onChange={e => setRoom(idx, 'depDate', e.target.value)} 
                    style={{ fontSize: '0.8rem', padding: '4px 6px', height: '32px', minHeight: '32px', width: '135px' }} 
                  />
                </td>

                {/* Dep. Time */}
                <td style={{ padding: '8px' }}>
                  <input 
                    className="form-input" 
                    type="text" 
                    value={row.depTime} 
                    onChange={e => setRoom(idx, 'depTime', e.target.value)} 
                    placeholder="12:00 PM" 
                    style={{ fontSize: '0.8rem', padding: '4px 6px', height: '32px', minHeight: '32px', width: '100px' }} 
                  />
                </td>

                {/* Category */}
                <td style={{ padding: '8px' }}>
                  <select 
                    className="form-select" 
                    value={row.category} 
                    onChange={e => setRoom(idx, 'category', e.target.value)} 
                    style={{ fontSize: '0.8rem', padding: '4px 6px', height: '32px', minHeight: '32px', width: '150px' }}
                  >
                    <option value="">Select</option>
                    <option value="Deluxe">Deluxe Room</option>
                    <option value="Super Deluxe">Super Deluxe</option>
                    <option value="Executive Suite">Executive Suite</option>
                  </select>
                </td>

                {/* No. of Room */}
                <td style={{ padding: '8px' }}>
                  <input 
                    className="form-input" 
                    type="number" 
                    min="1" 
                    value={row.noOfRooms} 
                    onChange={e => setRoom(idx, 'noOfRooms', e.target.value)} 
                    placeholder="0"
                    style={{ fontSize: '0.8rem', padding: '4px 6px', height: '32px', minHeight: '32px', width: '80px' }} 
                  />
                </td>

                {/* Plan Package */}
                <td style={{ padding: '8px' }}>
                  <select 
                    className="form-select" 
                    value={row.plan} 
                    onChange={e => setRoom(idx, 'plan', e.target.value)} 
                    style={{ fontSize: '0.8rem', padding: '4px 6px', height: '32px', minHeight: '32px', width: '90px' }}
                  >
                    <option value="">Select</option>
                    <option value="EP">EP</option>
                    <option value="CP">CP</option>
                    <option value="MAP">MAP</option>
                    <option value="AP">AP</option>
                  </select>
                </td>

                {/* No. of Occ */}
                <td style={{ padding: '8px' }}>
                  <input 
                    className="form-input" 
                    type="number" 
                    min="1" 
                    value={row.noOfOcc} 
                    onChange={e => setRoom(idx, 'noOfOcc', e.target.value)} 
                    placeholder="0"
                    style={{ fontSize: '0.8rem', padding: '4px 6px', height: '32px', minHeight: '32px', width: '80px' }} 
                  />
                </td>

                {/* No. of Child */}
                <td style={{ padding: '8px' }}>
                  <input 
                    className="form-input" 
                    type="number" 
                    min="0" 
                    value={row.noOfChild} 
                    onChange={e => setRoom(idx, 'noOfChild', e.target.value)} 
                    placeholder="0"
                    style={{ fontSize: '0.8rem', padding: '4px 6px', height: '32px', minHeight: '32px', width: '80px' }} 
                  />
                </td>

                {/* Rate */}
                <td style={{ padding: '8px' }}>
                  <input 
                    className="form-input" 
                    type="number" 
                    value={row.rate} 
                    onChange={e => setRoom(idx, 'rate', e.target.value)} 
                    placeholder="0" 
                    style={{ fontSize: '0.8rem', padding: '4px 6px', height: '32px', minHeight: '32px', width: '100px' }} 
                  />
                </td>

                {/* Tax Inc.YN */}
                <td style={{ padding: '8px' }}>
                  <select 
                    className="form-select" 
                    value={row.taxInclusive} 
                    onChange={e => setRoom(idx, 'taxInclusive', e.target.value)} 
                    style={{ fontSize: '0.8rem', padding: '4px 6px', height: '32px', minHeight: '32px', width: '80px' }}
                  >
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </td>

                {/* Taxable Amount */}
                <td style={{ padding: '8px' }}>
                  <input 
                    className="form-input" 
                    type="text" 
                    value={row.taxableAmount} 
                    disabled 
                    placeholder="0.00"
                    style={{ 
                      fontSize: '0.8rem', 
                      padding: '4px 6px', 
                      height: '32px', 
                      minHeight: '32px', 
                      width: '100px',
                      background: 'var(--primary-light)', 
                      fontWeight: 600, 
                      color: 'var(--primary)',
                      border: '1px solid var(--border)'
                    }} 
                  />
                </td>

                {/* Net Amount */}
                <td style={{ padding: '8px' }}>
                  <input 
                    className="form-input" 
                    type="text" 
                    value={row.netAmount} 
                    disabled 
                    placeholder="0.00"
                    style={{ 
                      fontSize: '0.8rem', 
                      padding: '4px 6px', 
                      height: '32px', 
                      minHeight: '32px', 
                      width: '100px',
                      background: 'rgba(16,185,129,0.08)', 
                      fontWeight: 700, 
                      color: '#059669',
                      border: '1px solid rgba(16,185,129,0.2)'
                    }} 
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        type="button"
        onClick={addRoom}
        style={{
          marginTop: '10px',
          fontSize: '0.88rem',
          padding: '9px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'linear-gradient(135deg, var(--primary), var(--primary-dark, #3a7a7b))',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          fontWeight: 700,
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(65,138,139,0.25)',
          transition: 'all 0.2s',
        }}
      >
        <FaPlus /> Add Room
      </button>
    </div>
  );
};

export default RoomGridSection;
