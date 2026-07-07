import { FaBed, FaPlus } from 'react-icons/fa';

const WalkinRoomGridSection = ({ rooms, setRoom, addRoom, removeRoom, roomInfoExpanded, setRoomInfoExpanded, sectionTitle }) => {
  return (
    <div style={{ background: 'var(--card-bg, #fff)', border: '1px solid var(--border)', borderRadius: '6px', padding: '10px 14px' }}>
      <div
        onClick={() => setRoomInfoExpanded(prev => !prev)}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}
      >
        <div style={{ pointerEvents: 'none', display: 'flex', alignItems: 'center', gap: '6px', padding: '2px 0 4px', borderBottom: '2px solid var(--primary)', flex: 1 }}>
          <span style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', color: 'var(--primary)' }}><FaBed /></span>
          <span style={{ fontWeight: 700, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--primary)' }}>Room Information</span>
        </div>
        <div style={{ marginLeft: '10px', display: 'flex', alignItems: 'center', color: 'var(--primary)', fontWeight: 'bold', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {roomInfoExpanded ? '▲ Collapse' : '▼ Expand'}
        </div>
      </div>

      <div style={{
        maxHeight: roomInfoExpanded ? '1000px' : '0px',
        opacity: roomInfoExpanded ? 1 : 0,
        overflowY: 'hidden',
        overflowX: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        marginTop: roomInfoExpanded ? '10px' : '0px'
      }}>
        <div style={{ overflowX: 'auto', width: '100%', marginBottom: '8px', border: '1px solid var(--border)', borderRadius: '6px' }}>
          <table style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: 'var(--primary-light)', borderBottom: '1.5px solid var(--border)' }}>
                {['Remove', 'S No.', 'Room No', 'Plan / Package', 'No. of Adults', 'No. of Childs', 'Rate', 'Tax Inc.', 'Leader'].map((h, idx) => {
                  const widths = ['6%', '7%', '14%', '14%', '11%', '11%', '13%', '12%', '12%'];
                  return (
                    <th key={h} style={{
                      padding: '8px 4px',
                      width: widths[idx],
                      textAlign: idx === 0 ? 'center' : 'left',
                      fontWeight: 700,
                      color: 'var(--primary)',
                      fontSize: '0.72rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.02em',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {h}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {rooms.map((row, idx) => (
                <tr key={idx} style={{
                  borderBottom: '1px solid var(--border)',
                  background: idx % 2 === 0 ? 'transparent' : 'rgba(0, 0, 0, 0.015)'
                }}>
                  {/* Remove Action */}
                  <td style={{ padding: '4px', textAlign: 'center' }}>
                    <button
                      type="button"
                      onClick={() => removeRoom(idx)}
                      disabled={rooms.length === 1}
                      style={{
                        color: rooms.length === 1 ? '#cbd5e1' : 'var(--danger)',
                        background: 'none',
                        border: 'none',
                        cursor: rooms.length === 1 ? 'not-allowed' : 'pointer',
                        fontWeight: 700,
                        fontSize: '0.95rem'
                      }}
                    >
                      ✕
                    </button>
                  </td>

                  {/* S No. */}
                  <td style={{ padding: '6px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    {idx + 1}
                  </td>

                  {/* Room No */}
                  <td style={{ padding: '4px' }}>
                    <select
                      className="form-select"
                      value={row.roomNo}
                      onChange={e => setRoom(idx, 'roomNo', e.target.value)}
                      style={{ fontSize: '0.85rem', padding: '2px 4px', height: '32px', width: '100%', boxSizing: 'border-box' }}
                      required
                    >
                      <option value="">Select</option>
                      <option value="101">101</option>
                      <option value="102">102</option>
                      <option value="201">201</option>
                      <option value="202">202</option>
                    </select>
                  </td>

                  {/* Plan / Package */}
                  <td style={{ padding: '4px' }}>
                    <select
                      className="form-select"
                      value={row.plan}
                      onChange={e => setRoom(idx, 'plan', e.target.value)}
                      style={{ fontSize: '0.85rem', padding: '2px 4px', height: '32px', width: '100%', boxSizing: 'border-box' }}
                      required
                    >
                      <option value="">Select</option>
                      <option value="EP">EP</option>
                      <option value="CP">CP</option>
                      <option value="MAP">MAP</option>
                      <option value="AP">AP</option>
                    </select>
                  </td>

                  {/* No. of Adults */}
                  <td style={{ padding: '4px' }}>
                    <input
                      className="form-input"
                      type="number"
                      min="1"
                      value={row.adults}
                      onChange={e => setRoom(idx, 'adults', e.target.value)}
                      style={{ width: '100%', fontSize: '0.85rem', height: '32px', padding: '2px 4px', boxSizing: 'border-box' }}
                      required
                    />
                  </td>

                  {/* No. of Childs */}
                  <td style={{ padding: '4px' }}>
                    <input
                      className="form-input"
                      type="number"
                      min="0"
                      value={row.children}
                      onChange={e => setRoom(idx, 'children', e.target.value)}
                      style={{ width: '100%', fontSize: '0.85rem', height: '32px', padding: '2px 4px', boxSizing: 'border-box' }}
                      required
                    />
                  </td>

                  {/* Rate */}
                  <td style={{ padding: '4px' }}>
                    <input
                      className="form-input"
                      type="number"
                      value={row.rate}
                      onChange={e => setRoom(idx, 'rate', e.target.value)}
                      placeholder="0.00"
                      style={{ width: '100%', fontSize: '0.85rem', height: '32px', padding: '2px 4px', boxSizing: 'border-box' }}
                      required
                    />
                  </td>

                  {/* Tax Inc. */}
                  <td style={{ padding: '4px' }}>
                    <select
                      className="form-select"
                      value={row.taxInclusive}
                      onChange={e => setRoom(idx, 'taxInclusive', e.target.value)}
                      style={{ fontSize: '0.85rem', padding: '2px 4px', height: '32px', width: '100%', boxSizing: 'border-box' }}
                      required
                    >
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                    </select>
                  </td>

                  {/* Leader */}
                  <td style={{ padding: '4px' }}>
                    <select
                      className="form-select"
                      value={row.leader}
                      onChange={e => setRoom(idx, 'leader', e.target.value)}
                      style={{ fontSize: '0.85rem', padding: '2px 4px', height: '32px', width: '100%', boxSizing: 'border-box' }}
                      required
                    >
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button
          type="button"
          onClick={addRoom}
          className="btn-secondary"
          style={{ fontSize: '0.82rem', padding: '5px 12px', display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          <FaPlus size={8} /> Add Room
        </button>
      </div>
    </div>
  );
};

export default WalkinRoomGridSection;
