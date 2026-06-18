import React from 'react';
import { useLocation } from 'react-router-dom';
import { 
  FaPlus, 
  FaSearch, 
  FaFileExport, 
  FaTable, 
  FaHotel, 
  FaDollarSign, 
  FaFileDownload,
  FaArrowRight,
  FaCalendarCheck,
  FaCheckCircle,
  FaExchangeAlt,
  FaSignOutAlt,
  FaUndo,
  FaUserPlus,
  FaMoon,
  FaUsers,
  FaBoxOpen,
  FaQuestionCircle,
  FaUserCheck,
  FaCalendarAlt,
  FaDoorOpen
} from 'react-icons/fa';

const FrontDesk = ({ showToast }) => {
  const location = useLocation();
  const path = location.pathname;

  // Resolve Sub-section and Sub-item from URL path
  const getRouteInfo = () => {
    const parts = path.split('/').filter(Boolean);
    if (parts.length === 2) {
      return {
        section: parts[1].toUpperCase(),
        item: null
      };
    } else if (parts.length === 3) {
      return {
        section: parts[1].toUpperCase(),
        item: parts[2].split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
      };
    }
    return { section: 'OVERVIEW', item: null };
  };

  const { section, item } = getRouteInfo();

  // Helper to generate mock data based on item selection (Master items)
  const renderMasterContent = (itemName) => {
    let headers = [];
    let rows = [];

    switch (itemName) {
      case 'Tax Structure':
        headers = ['Tax Code', 'Tax Name', 'Percentage Rate', 'Status'];
        rows = [
          { c1: 'TX-VAT15', c2: 'Value Added Tax', c3: '15.00%', c4: 'Active' },
          { c1: 'TX-GST05', c2: 'Goods & Services Tax', c3: '5.00%', c4: 'Active' },
          { c1: 'TX-LXT10', c2: 'Luxury Accommodation Tax', c3: '10.00%', c4: 'Active' }
        ];
        break;
      case 'Floor Master':
        headers = ['Floor Code', 'Floor Name', 'Total Rooms Allocated', 'Status'];
        rows = [
          { c1: 'FL-GND', c2: 'Ground Floor', c3: '12 Rooms', c4: 'Active' },
          { c1: 'FL-001', c2: 'First Floor', c3: '16 Rooms', c4: 'Active' },
          { c1: 'FL-002', c2: 'Second Floor (Executive Suite)', c3: '10 Rooms', c4: 'Active' }
        ];
        break;
      case 'Room Feature':
        headers = ['Feature Code', 'Feature Name', 'Surcharge Price', 'Status'];
        rows = [
          { c1: 'FT-OVW', c2: 'Ocean Front View balcony', c3: '+Rs. 35.00 / night', c4: 'Active' },
          { c1: 'FT-MINI', c2: 'Fully Stocked Mini bar', c3: '+Rs. 15.00 / night', c4: 'Active' },
          { c1: 'FT-JACZ', c2: 'In-Room Private Jacuzzi tub', c3: '+Rs. 60.00 / night', c4: 'Active' }
        ];
        break;
      case 'Room Category':
        headers = ['Category Code', 'Category Title', 'Base Rate', 'Max Adults / Kids'];
        rows = [
          { c1: 'CAT-STD', c2: 'Standard Comfort Room', c3: 'Rs. 120.00', c4: '2 Adults / 1 Kid' },
          { c1: 'CAT-DLX', c2: 'Premium Deluxe King Room', c3: 'Rs. 220.00', c4: '3 Adults / 2 Kids' },
          { c1: 'CAT-SUT', c2: 'Presidential Penthouse Suite', c3: 'Rs. 450.00', c4: '4 Adults / 2 Kids' }
        ];
        break;
      case 'Room Master':
        headers = ['Room No', 'Floor', 'Category', 'Housekeeping Status'];
        rows = [
          { c1: 'Room 101', c2: 'First Floor', c3: 'Standard Comfort Room', c4: 'Clean' },
          { c1: 'Room 102', c2: 'First Floor', c3: 'Standard Comfort Room', c4: 'Dirty' },
          { c1: 'Room 201', c2: 'Second Floor', c3: 'Premium Deluxe King Room', c4: 'Clean' },
          { c1: 'Room 301', c2: 'Third Floor', c3: 'Presidential Penthouse Suite', c4: 'Clean' }
        ];
        break;
      default:
        headers = ['Field Code', 'Configuration Title', 'Value', 'Status'];
        rows = [
          { c1: 'CONF-01', c2: `${itemName} Configuration`, c3: 'Default Mode', c4: 'Active' },
          { c1: 'CONF-02', c2: `${itemName} Parameters`, c3: 'System Managed', c4: 'Active' }
        ];
        break;
    }

    return (
      <div className="dashboard-panel">
        <div className="panel-header" style={{ borderBottom: 'none', paddingBottom: '0' }}>
          <div>
            <h3 className="panel-title">{itemName} Configuration</h3>
            <p className="text-secondary" style={{ fontSize: '0.85rem', marginTop: '4px' }}>
              System settings and values parameter entries for {itemName}.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="panel-action" style={{ display: 'flex', alignItems: 'center', gap: '6px' }} onClick={() => showToast(`Opening Excel export spreadsheet (Dummy Action)`)}>
              <FaFileExport size={12} />
              <span>Export</span>
            </button>
            <button className="panel-action" style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--primary)', color: '#ffffff' }} onClick={() => showToast(`Add new row entry inside ${itemName} master (Dummy Action)`)}>
              <FaPlus size={12} />
              <span>Add Entry</span>
            </button>
          </div>
        </div>

        {/* Search & Statistics mini row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 20px', backgroundColor: '#F8FAFC' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#ffffff', border: '1px solid var(--border)', borderRadius: '8px', padding: '6px 12px', width: '280px' }}>
            <FaSearch color="var(--text-light)" size={14} />
            <input type="text" placeholder={`Search ${itemName}...`} style={{ border: 'none', outline: 'none', fontSize: '0.85rem', width: '100%' }} />
          </div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Showing {rows.length} total register entries</span>
        </div>

        {/* Responsive Table */}
        <div className="custom-table-container">
          <table className="custom-table">
            <thead>
              <tr>
                {headers.map((h, i) => <th key={i}>{h}</th>)}
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: '700', color: 'var(--primary)' }}>{row.c1}</td>
                  <td style={{ fontWeight: '600' }}>{row.c2}</td>
                  <td>{row.c3}</td>
                  <td>
                    <span className={`status-badge ${row.c4 === 'Active' || row.c4 === 'Clean' ? 'available' : 'occupied'}`}>
                      {row.c4}
                    </span>
                  </td>
                  <td>
                    <button style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: '700', cursor: 'pointer', fontSize: '0.85rem' }} onClick={() => showToast(`Edit entry ${row.c1} inside ${itemName} (Dummy Action)`)}>
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Switcher block for Operations
  const renderOperationContent = (itemName) => {
    switch (itemName) {
      case 'Booking':
        return (
          <div className="dashboard-panel">
            <div className="panel-header">
              <div>
                <h3 className="panel-title">Active Booking Manifest</h3>
                <p className="text-secondary" style={{ fontSize: '0.85rem', marginTop: '4px' }}>Overview of booked reservations pending checking or confirmation.</p>
              </div>
              <button className="panel-action" style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--primary)', color: '#ffffff' }} onClick={() => showToast("Create New Reservation (Dummy Action)")}>
                <FaCalendarCheck size={12} />
                <span>New Booking</span>
              </button>
            </div>
            
            <div className="custom-table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Ref No</th>
                    <th>Guest Name</th>
                    <th>Arrival</th>
                    <th>Departure</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr onClick={() => showToast("Selected Booking Details: B-8902")}>
                    <td style={{ fontWeight: '700', color: 'var(--primary)' }}>#B-8902</td>
                    <td style={{ fontWeight: '600' }}>David Miller</td>
                    <td>18-06-2026</td>
                    <td>20-06-2026</td>
                    <td><span className="status-badge pending">Confirmed</span></td>
                  </tr>
                  <tr onClick={() => showToast("Selected Booking Details: B-8903")}>
                    <td style={{ fontWeight: '700', color: 'var(--primary)' }}>#B-8903</td>
                    <td style={{ fontWeight: '600' }}>Sophia Loren</td>
                    <td>19-06-2026</td>
                    <td>22-06-2026</td>
                    <td><span className="status-badge pending">Hold</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'Walkin Checkin Entry':
        return (
          <div className="dashboard-panel">
            <div className="panel-header">
              <h3 className="panel-title">Walk-In Guest Registration (Check-In)</h3>
            </div>
            
            <form style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }} onSubmit={(e) => { e.preventDefault(); showToast("Check-In Registered Successfully (Dummy)!"); }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--dark)' }}>Guest Full Name</label>
                <input type="text" placeholder="Johnathan Doe" style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 14px', outline: 'none' }} required />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--dark)' }}>Mobile Number</label>
                <input type="tel" placeholder="+1 (555) 902-1928" style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 14px', outline: 'none' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--dark)' }}>Assign Room Category</label>
                <select style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 14px', outline: 'none', backgroundColor: '#ffffff' }}>
                  <option>Premium Deluxe King Room (Rs. 220.00)</option>
                  <option>Standard Comfort Room (Rs. 120.00)</option>
                  <option>Presidential Penthouse Suite (Rs. 450.00)</option>
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--dark)' }}>Available Rooms</label>
                <select style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 14px', outline: 'none', backgroundColor: '#ffffff' }}>
                  <option>Room 201</option>
                  <option>Room 101</option>
                  <option>Room 301</option>
                </select>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <button type="submit" className="panel-action" style={{ backgroundColor: 'var(--primary)', color: '#ffffff', border: 'none', padding: '12px 24px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', width: '100%' }}>
                  Submit Check-In & Issue Keycard
                </button>
              </div>
            </form>
          </div>
        );

      case 'Payment Recieve Entry':
        return (
          <div className="dashboard-panel">
            <div className="panel-header">
              <h3 className="panel-title">Record Guest Payment Entry</h3>
            </div>
            
            <form style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} onSubmit={(e) => { e.preventDefault(); showToast("Payment Received Entry Saved (Dummy)!"); }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--dark)' }}>Select Active Room / Stay Guest</label>
                <select style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 14px', outline: 'none', backgroundColor: '#ffffff' }}>
                  <option>Room 104 - John Doe (Active balance: Rs. 450.00)</option>
                  <option>Room 201 - Alice Smith (Active balance: Rs. 700.00)</option>
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--dark)' }}>Payment Amount (Rs.)</label>
                  <input type="number" placeholder="450.00" style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 14px', outline: 'none' }} required />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--dark)' }}>Payment Method</label>
                  <select style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 14px', outline: 'none', backgroundColor: '#ffffff' }}>
                    <option>Credit Card / Visa</option>
                    <option>Cash Receipt</option>
                    <option>Bank Remittance</option>
                    <option>UPI / QR code</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="panel-action" style={{ backgroundColor: 'var(--primary)', color: '#ffffff', border: 'none', padding: '12px 24px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' }}>
                Post Payment Receipt
              </button>
            </form>
          </div>
        );

      case 'Room Change Entry':
        return (
          <div className="dashboard-panel">
            <div className="panel-header">
              <h3 className="panel-title">Room Change / Transfer Form</h3>
            </div>
            
            <form style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }} onSubmit={(e) => { e.preventDefault(); showToast("Room Transfer Request Executed (Dummy)!"); }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--dark)' }}>Current Stay Room</label>
                <select style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 14px', outline: 'none', backgroundColor: '#ffffff' }}>
                  <option>Room 104 - John Doe (Deluxe Room)</option>
                  <option>Room 201 - Alice Smith (Suite)</option>
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--dark)' }}>Target New Room</label>
                <select style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 14px', outline: 'none', backgroundColor: '#ffffff' }}>
                  <option>Room 110 - Vacant Deluxe</option>
                  <option>Room 305 - Vacant Suite</option>
                  <option>Room 102 - Vacant Standard</option>
                </select>
              </div>
              <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--dark)' }}>Transfer Reason / Notes</label>
                <textarea placeholder="AC unit malfunctioning in Room 104. Moving guest to Room 110." style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 14px', outline: 'none', minHeight: '80px', fontFamily: 'inherit' }} required />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <button type="submit" className="panel-action" style={{ backgroundColor: 'var(--primary)', color: '#ffffff', border: 'none', padding: '12px 24px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <FaExchangeAlt />
                  <span>Execute Room Change</span>
                </button>
              </div>
            </form>
          </div>
        );

      case 'Room Checkout Entry':
      case 'Checkout Entry':
        return (
          <div className="dashboard-panel">
            <div className="panel-header">
              <h3 className="panel-title">Guest Checkout Clearance & Invoicing</h3>
            </div>
            
            <form style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} onSubmit={(e) => { e.preventDefault(); showToast("Checkout Completed! Room flagged for housekeeping cleaning. (Dummy)!"); }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--dark)' }}>Select Room Pending Checkout</label>
                <select style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 14px', outline: 'none', backgroundColor: '#ffffff' }}>
                  <option>Room 104 - John Doe (Outstanding Invoice: Rs. 450.00)</option>
                  <option>Room 201 - Alice Smith (Outstanding Invoice: Rs. 0.00 - Paid)</option>
                </select>
              </div>
              
              <div style={{ border: '1px solid var(--border)', borderRadius: '12px', padding: '20px', backgroundColor: '#F8FAFC' }}>
                <h4 style={{ fontWeight: '700', color: 'var(--dark)', marginBottom: '12px' }}>Folio Charge Breakdown Summary</h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '8px' }}>
                  <span>Room Stay Charges (3 Nights)</span>
                  <span style={{ fontWeight: '600' }}>Rs. 360.00</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '8px' }}>
                  <span>Room Dining Service (Food & Bev)</span>
                  <span style={{ fontWeight: '600' }}>Rs. 65.00</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '8px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                  <span>VAT & Service Tax</span>
                  <span style={{ fontWeight: '600' }}>Rs. 25.00</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.05rem', fontWeight: '700', marginTop: '10px', color: 'var(--dark)' }}>
                  <span>Grand Total Bill Amount</span>
                  <span>Rs. 450.00</span>
                </div>
              </div>

              <button type="submit" className="panel-action" style={{ backgroundColor: 'var(--danger)', color: '#ffffff', border: 'none', padding: '12px 24px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <FaSignOutAlt />
                <span>Clear Invoice & Complete Checkout</span>
              </button>
            </form>
          </div>
        );

      case 'Refund Entry':
        return (
          <div className="dashboard-panel">
            <div className="panel-header">
              <h3 className="panel-title">Post Refund / Credit Note Entry</h3>
            </div>
            
            <form style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} onSubmit={(e) => { e.preventDefault(); showToast("Refund Processed & Credit Slip Issued (Dummy)!"); }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--dark)' }}>Select Folio/Room</label>
                  <select style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 14px', outline: 'none', backgroundColor: '#ffffff' }}>
                    <option>Room 201 - Alice Smith</option>
                    <option>Room 104 - John Doe</option>
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--dark)' }}>Refund Amount (Rs.)</label>
                  <input type="number" placeholder="50.00" style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 14px', outline: 'none' }} required />
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--dark)' }}>Reason for Refund Surcharge</label>
                <input type="text" placeholder="Overcharged on laundry services" style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 14px', outline: 'none' }} required />
              </div>
              <button type="submit" className="panel-action" style={{ backgroundColor: 'var(--primary)', color: '#ffffff', border: 'none', padding: '12px 24px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <FaUndo />
                <span>Process Refund Note</span>
              </button>
            </form>
          </div>
        );

      case 'Add Guest in Room Entry':
        return (
          <div className="dashboard-panel">
            <div className="panel-header">
              <h3 className="panel-title">Add Extra Guest / Co-Occupant</h3>
            </div>
            
            <form style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }} onSubmit={(e) => { e.preventDefault(); showToast("Extra Co-Occupant Added to Stay (Dummy)!"); }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--dark)' }}>Select Primary Stay Room</label>
                <select style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 14px', outline: 'none', backgroundColor: '#ffffff' }}>
                  <option>Room 201 - Alice Smith (Suite)</option>
                  <option>Room 104 - John Doe (Deluxe Room)</option>
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--dark)' }}>Co-Guest Name</label>
                <input type="text" placeholder="Robert Smith" style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 14px', outline: 'none' }} required />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--dark)' }}>Identity Proof Doc (Passport/ID)</label>
                <input type="text" placeholder="Passport No. US-980129" style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 14px', outline: 'none' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--dark)' }}>Relationship to Primary Guest</label>
                <input type="text" placeholder="Spouse / Colleague" style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 14px', outline: 'none' }} />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <button type="submit" className="panel-action" style={{ backgroundColor: 'var(--primary)', color: '#ffffff', border: 'none', padding: '12px 24px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <FaUserPlus />
                  <span>Register Co-Occupant</span>
                </button>
              </div>
            </form>
          </div>
        );

      case 'Night Audit Entry':
        return (
          <div className="dashboard-panel">
            <div className="panel-header">
              <h3 className="panel-title">Perform Hotel Night Audit Processing</h3>
            </div>
            
            <div style={{ border: '1px solid var(--border)', borderRadius: '12px', padding: '20px', backgroundColor: '#F8FAFC', marginBottom: '12px' }}>
              <h4 style={{ fontWeight: '700', color: 'var(--dark)', marginBottom: '8px' }}>Audit Status Checklists</h4>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '10px', listStyle: 'none', fontSize: '0.9rem' }}>
                <li style={{ display: 'flex', gap: '10px', alignItems: 'center' }}><span style={{ color: 'var(--success)', fontWeight: 'bold' }}>✓</span> All active rooms charged daily rates</li>
                <li style={{ display: 'flex', gap: '10px', alignItems: 'center' }}><span style={{ color: 'var(--success)', fontWeight: 'bold' }}>✓</span> Food & Beverage bills verified</li>
                <li style={{ display: 'flex', gap: '10px', alignItems: 'center' }}><span style={{ color: 'var(--warning)', fontWeight: 'bold' }}>!</span> 1 pending check-out folio unresolved (Room 102)</li>
              </ul>
            </div>

            <button className="panel-action" style={{ backgroundColor: 'var(--dark)', color: '#ffffff', border: 'none', padding: '14px 24px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }} onClick={() => showToast("Night Audit successfully locked, dates advanced. (Dummy)")}>
              <FaMoon />
              <span>Initiate End of Day Night Audit</span>
            </button>
          </div>
        );

      case 'Guest Profile':
        return (
          <div className="dashboard-panel">
            <div className="panel-header">
              <h3 className="panel-title">Guest Profiles Database</h3>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#ffffff', border: '1px solid var(--border)', borderRadius: '8px', padding: '6px 12px', width: '300px' }}>
              <FaSearch color="var(--text-light)" size={14} />
              <input type="text" placeholder="Search guests database..." style={{ border: 'none', outline: 'none', fontSize: '0.85rem', width: '100%' }} />
            </div>
            <div className="custom-table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Guest ID</th>
                    <th>Full Name</th>
                    <th>Email Contact</th>
                    <th>Total Stays</th>
                  </tr>
                </thead>
                <tbody>
                  <tr onClick={() => showToast("Selected Profile: G-90812")}>
                    <td style={{ fontWeight: '700', color: 'var(--primary)' }}>#G-90812</td>
                    <td style={{ fontWeight: '600' }}>David Miller</td>
                    <td>david.miller@gmail.com</td>
                    <td style={{ fontWeight: '700' }}>14 stays</td>
                  </tr>
                  <tr onClick={() => showToast("Selected Profile: G-90813")}>
                    <td style={{ fontWeight: '700', color: 'var(--primary)' }}>#G-90813</td>
                    <td style={{ fontWeight: '600' }}>Sophia Loren</td>
                    <td>sophia.loren@hollywood.com</td>
                    <td style={{ fontWeight: '700' }}>6 stays</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'Multi Room Checkout':
        return (
          <div className="dashboard-panel">
            <div className="panel-header">
              <h3 className="panel-title">Bulk / Multi-Room Checkout Desk</h3>
            </div>
            <div className="custom-table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Select</th>
                    <th>Room No</th>
                    <th>Guest Profile</th>
                    <th>Active Balance</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><input type="checkbox" defaultChecked /></td>
                    <td style={{ fontWeight: '700', color: 'var(--primary)' }}>Room 104</td>
                    <td style={{ fontWeight: '600' }}>John Doe</td>
                    <td style={{ fontWeight: '700' }}>Rs. 450.00</td>
                  </tr>
                  <tr>
                    <td><input type="checkbox" defaultChecked /></td>
                    <td style={{ fontWeight: '700', color: 'var(--primary)' }}>Room 201</td>
                    <td style={{ fontWeight: '600' }}>Alice Smith</td>
                    <td style={{ fontWeight: '700' }}>Rs. 0.00 (Cleared)</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <button className="panel-action" style={{ backgroundColor: 'var(--danger)', color: '#ffffff', border: 'none', padding: '12px 24px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} onClick={() => showToast("Bulk checkout performed for selected rooms (Dummy)")}>
              <FaSignOutAlt />
              <span>Checkout Selected Rooms</span>
            </button>
          </div>
        );

      case 'Room Enquiry Entry':
        return (
          <div className="dashboard-panel">
            <div className="panel-header">
              <h3 className="panel-title">Room Availability & Rate Enquiry Desk</h3>
            </div>
            <form style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }} onSubmit={(e) => { e.preventDefault(); showToast("Rooms checked! 4 available matching parameters (Dummy)!"); }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--dark)' }}>Stay Check-In Date</label>
                <input type="date" defaultValue="2026-06-18" style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 14px', outline: 'none' }} required />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--dark)' }}>Stay Check-Out Date</label>
                <input type="date" defaultValue="2026-06-21" style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 14px', outline: 'none' }} required />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <button type="submit" className="panel-action" style={{ backgroundColor: 'var(--primary)', color: '#ffffff', border: 'none', padding: '12px 24px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <FaQuestionCircle />
                  <span>Check Live Availability</span>
                </button>
              </div>
            </form>
          </div>
        );

      case 'Expense Entry':
        return (
          <div className="dashboard-panel">
            <div className="panel-header">
              <h3 className="panel-title">Record Front Desk Cash Out / Expense</h3>
            </div>
            <form style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} onSubmit={(e) => { e.preventDefault(); showToast("Front Desk Expense recorded successfully (Dummy)!"); }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--dark)' }}>Expense Value (Rs.)</label>
                  <input type="number" placeholder="25.00" style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 14px', outline: 'none' }} required />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--dark)' }}>Expense Category</label>
                  <select style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 14px', outline: 'none', backgroundColor: '#ffffff' }}>
                    <option>Guest Amenities / Refreshments</option>
                    <option>Stationery & Print supplies</option>
                    <option>Sundry Cash Disbursements</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--dark)' }}>Description Remarks</label>
                <input type="text" placeholder="Purchased paper supplies for front desk printer" style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 14px', outline: 'none' }} required />
              </div>
              <button type="submit" className="panel-action" style={{ backgroundColor: 'var(--primary)', color: '#ffffff', border: 'none', padding: '12px 24px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' }}>
                Post Expense Entry
              </button>
            </form>
          </div>
        );

      default:
        return (
          <div className="dashboard-panel">
            <div className="panel-header">
              <h3 className="panel-title">{itemName} Entry Form</h3>
            </div>
            <p className="text-secondary">Configuration form or record registration spreadsheet for {itemName}.</p>
            <button className="panel-action" style={{ alignSelf: 'flex-start', backgroundColor: 'var(--primary)', color: '#ffffff', border: 'none' }} onClick={() => showToast(`Executed transaction for ${itemName} (Dummy)`)}>
              Save Entry
            </button>
          </div>
        );
    }
  };

  // Switcher block for MIS sub-pages
  const renderMISContent = (itemName) => {
    switch (itemName) {
      case 'Reservation Dashboard':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div className="stats-grid" style={{ margin: '0' }}>
              <div className="stats-card">
                <div className="stats-info">
                  <span className="stats-label">Total Reservations</span>
                  <h3 className="stats-value">189</h3>
                  <div className="stats-trend up"><span>Active holds & Bookings</span></div>
                </div>
                <div className="stats-icon-wrapper"><FaCalendarAlt /></div>
              </div>
              <div className="stats-card">
                <div className="stats-info">
                  <span className="stats-label">Expected Arrivals Today</span>
                  <h3 className="stats-value">12</h3>
                  <div className="stats-trend up"><span>Checked-in: 8/12</span></div>
                </div>
                <div className="stats-icon-wrapper"><FaUserCheck /></div>
              </div>
              <div className="stats-card">
                <div className="stats-info">
                  <span className="stats-label">Expected Departures Today</span>
                  <h3 className="stats-value">6</h3>
                  <div className="stats-trend down"><span>Checked-out: 4/6</span></div>
                </div>
                <div className="stats-icon-wrapper"><FaSignOutAlt /></div>
              </div>
            </div>

            <div className="dashboard-panel">
              <div className="panel-header">
                <h3 className="panel-title">Monthly Occupancy Targets & Forecasts</h3>
              </div>
              <div style={{ border: '1px solid var(--border)', borderRadius: '12px', padding: '20px', backgroundColor: '#F8FAFC' }}>
                <h4 style={{ fontWeight: '700', color: 'var(--dark)', marginBottom: '8px' }}>Target Occupancy Index</h4>
                <div style={{ height: '10px', width: '100%', backgroundColor: 'var(--border)', borderRadius: '10px', overflow: 'hidden', marginTop: '12px' }}>
                  <div style={{ height: '100%', width: '78.5%', backgroundColor: 'var(--primary)' }} />
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '8px', fontWeight: '600' }}>Current Occupancy: 78.5% (Target: 85%)</p>
              </div>
            </div>
          </div>
        );

      case 'Front Office Dashboard':
        return (
          <div className="dashboard-panel">
            <div className="panel-header">
              <h3 className="panel-title">Front Office Real-Time Metrics</h3>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div style={{ border: '1px solid var(--border)', borderRadius: '12px', padding: '20px', backgroundColor: '#F8FAFC' }}>
                <h4 style={{ fontWeight: '700', color: 'var(--dark)' }}>Room Allocation Spread</h4>
                <p style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--primary)', marginTop: '8px' }}>42 / 50 Rooms</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Rooms clean and online: 48 (2 Out of Service)</p>
              </div>
              <div style={{ border: '1px solid var(--border)', borderRadius: '12px', padding: '20px', backgroundColor: '#F8FAFC' }}>
                <h4 style={{ fontWeight: '700', color: 'var(--dark)' }}>Walk-in Conversion Index</h4>
                <p style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--primary)', marginTop: '8px' }}>82.4%</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Based on 17 inquires resolved today</p>
              </div>
            </div>
          </div>
        );

      case 'Guest Status':
        return (
          <div className="dashboard-panel">
            <div className="panel-header">
              <h3 className="panel-title">Current In-House Guest Status Summary</h3>
            </div>
            <div className="custom-table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Room No</th>
                    <th>Occupant Profile</th>
                    <th>VIP Status Index</th>
                    <th>Balance Due</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ fontWeight: '700', color: 'var(--primary)' }}>Room 104</td>
                    <td style={{ fontWeight: '600' }}>John Doe</td>
                    <td><span className="status-badge available">Standard</span></td>
                    <td style={{ fontWeight: '700', color: 'var(--dark)' }}>Rs. 450.00</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: '700', color: 'var(--primary)' }}>Room 201</td>
                    <td style={{ fontWeight: '600' }}>Alice Smith</td>
                    <td><span className="status-badge occupied" style={{ backgroundColor: '#fef3c7', color: '#f59e0b' }}>VIP Tier-1</span></td>
                    <td style={{ fontWeight: '700', color: 'var(--dark)' }}>Rs. 0.00</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );

      default:
        return (
          <div className="dashboard-panel">
            <div className="panel-header">
              <h3 className="panel-title">MIS Analytics - {itemName}</h3>
            </div>
            <p className="text-secondary">Summary report overview statistics for {itemName}.</p>
          </div>
        );
    }
  };

  // Switcher block to render based on location
  const renderContent = () => {
    if (section === 'MASTER' && item) {
      return renderMasterContent(item);
    }

    if (section === 'OPERATION') {
      if (item) {
        return renderOperationContent(item);
      }
      return (
        <div className="dashboard-panel">
          <div className="panel-header">
            <h3 className="panel-title">Front Desk Operations Hub</h3>
          </div>
          
          <div className="stats-grid" style={{ margin: '0' }}>
            <div className="stats-card" style={{ cursor: 'pointer' }} onClick={() => showToast("Opening Check-in list (Dummy Action)")}>
              <div className="stats-info">
                <span className="stats-label">Guests Checked In</span>
                <h3 className="stats-value">28</h3>
                <span style={{ color: 'var(--primary)', fontSize: '0.85rem', fontWeight: '600', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Manage Check-ins <FaArrowRight size={10} />
                </span>
              </div>
              <div className="stats-icon-wrapper"><FaHotel /></div>
            </div>
            
            <div className="stats-card" style={{ cursor: 'pointer' }} onClick={() => showToast("Opening Guest Ledgers (Dummy Action)")}>
              <div className="stats-info">
                <span className="stats-label">Active Folios</span>
                <h3 className="stats-value">Rs. 12,450</h3>
                <span style={{ color: 'var(--primary)', fontSize: '0.85rem', fontWeight: '600', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Guest Ledger Balance <FaArrowRight size={10} />
                </span>
              </div>
              <div className="stats-icon-wrapper"><FaDollarSign /></div>
            </div>
          </div>
        </div>
      );
    }

    if (section === 'MIS') {
      if (item) {
        return renderMISContent(item);
      }
      return (
        <div className="dashboard-panel">
          <div className="panel-header">
            <h3 className="panel-title">Management Information System (MIS) Reports</h3>
          </div>
          
          <p className="text-secondary">Explore advanced revenue parameters, average daily rate (ADR), and revenue per available room (RevPAR) indices.</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '12px' }}>
            <div style={{ border: '1px solid var(--border)', borderRadius: '12px', padding: '20px', backgroundColor: '#F8FAFC' }}>
              <h4 style={{ fontWeight: '700', color: 'var(--dark)', marginBottom: '8px' }}>Average Daily Rate (ADR)</h4>
              <p style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--primary)' }}>Rs. 185.40</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>+5% occupancy adjusted from last month</p>
            </div>
            <div style={{ border: '1px solid var(--border)', borderRadius: '12px', padding: '20px', backgroundColor: '#F8FAFC' }}>
              <h4 style={{ fontWeight: '700', color: 'var(--dark)', marginBottom: '8px' }}>Revenue Per Room (RevPAR)</h4>
              <p style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--primary)' }}>Rs. 145.50</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Based on 78.5% occupancy rates today</p>
            </div>
          </div>
        </div>
      );
    }

    if (section === 'REPORT') {
      const reports = [
        { title: 'Daily Night Audit Report', size: '2.4 MB', type: 'PDF' },
        { title: 'Room Occupancy Forecast Analysis', size: '1.8 MB', type: 'PDF' },
        { title: 'Revenue Reconciliation Ledger', size: '3.1 MB', type: 'EXCEL' },
        { title: 'Staff Roster & Duty Allocations', size: '920 KB', type: 'PDF' }
      ];

      return (
        <div className="dashboard-panel">
          <div className="panel-header">
            <h3 className="panel-title">Printable Hotel Registers & Reports</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {reports.map((rep, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', justifycontent: 'space-between', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 24px', transition: 'var(--transition)', cursor: 'pointer' }} className="activity-item" onClick={() => showToast(`Downloading report file: ${rep.title}`)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div className="stats-icon-wrapper" style={{ width: '40px', height: '40px', borderRadius: '10px' }}>
                    <FaTable size={16} />
                  </div>
                  <div>
                    <h4 style={{ fontWeight: '700', color: 'var(--dark)', fontSize: '0.95rem' }}>{rep.title}</h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Format: {rep.type} • File Size: {rep.size}</span>
                  </div>
                </div>
                <button style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}>
                  <FaFileDownload size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Default Overview
    return (
      <div className="dashboard-panel">
        <div className="panel-header">
          <h3 className="panel-title">Front Desk Operations</h3>
        </div>
        <p className="text-secondary">Please select a category from the Master, Operation, MIS, or Report folders in the sidebar to review entries.</p>
      </div>
    );
  };

  return (
    <div>
      {/* Breadcrumb section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600', marginBottom: '24px' }}>
        <span>Front Desk</span>
        <span>&rsaquo;</span>
        <span style={{ color: 'var(--primary)' }}>{section}</span>
        {item && (
          <>
            <span>&rsaquo;</span>
            <span style={{ color: 'var(--dark)', fontWeight: '700' }}>{item}</span>
          </>
        )}
      </div>

      {renderContent()}
    </div>
  );
};

export default FrontDesk;
