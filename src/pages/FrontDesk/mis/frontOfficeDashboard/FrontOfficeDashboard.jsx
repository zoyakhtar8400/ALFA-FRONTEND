import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaExchangeAlt, FaFileInvoice, FaPlusCircle, FaMoneyBillWave, FaSignOutAlt, FaUsers, FaCalendarAlt, FaBan, FaCoins, FaChevronDown } from 'react-icons/fa';
import PageHeader from '../../../../components/common/PageHeader';
import { PrintHeader, PrintFooter } from '../../../../components/common/PrintComponent';
import FrontOfficeKpiCards from './FrontOfficeKpiCards';
import FrontOfficeSearchFilter from './FrontOfficeSearchFilter';
import FrontOfficeCard from './FrontOfficeCard';
import FrontOfficeViewDrawer from './FrontOfficeViewDrawer';
import FrontOfficeEditDrawer from './FrontOfficeEditDrawer';
import FrontOfficeActionModal from './FrontOfficeActionModal';

// Mock datasets covering all status tabs
const INITIAL_DATA = {
  'Current Occupancy': [
    { id: 1, roomNo: '104', grcNo: '119', guestName: 'PRAMOD MISHRA', mobile: '+91 77788 91234', arrival: '29 Jun 2026', departure: '30 Jun 2026', pkg: 'CP STANDARD', ota: 'SELF', pending: '₹0', status: 'Occupied', category: 'Deluxe Room' },
    { id: 2, roomNo: '201', grcNo: '120', guestName: 'Sarah Wilson', mobile: '+91 91234 56789', arrival: '26 Jun 2026', departure: '29 Jun 2026', pkg: 'MAP DELUXE', ota: 'Direct', pending: '₹0', status: 'Occupied', category: 'Executive Suite' },
    { id: 3, roomNo: '301', grcNo: '122', guestName: 'Robert Taylor', mobile: '+91 99999 88888', arrival: '26 Jun 2026', departure: '05 Jul 2026', pkg: 'AP SUITE', ota: 'Agent', pending: '₹1,500', status: 'Occupied', category: 'Presidential Suite' },
    { id: 4, roomNo: '202', grcNo: '125', guestName: 'David Miller', mobile: '+1 570-555-0156', arrival: '27 Jun 2026', departure: '30 Jun 2026', pkg: 'CP STANDARD', ota: 'Website', pending: '₹0', status: 'Occupied', category: 'Deluxe Room' },
    { id: 5, roomNo: '101', grcNo: '128', guestName: 'John Smith', mobile: '+91 98765 43210', arrival: '28 Jun 2026', departure: '01 Jul 2026', pkg: 'EP ROOM ONLY', ota: 'Direct', pending: '₹0', status: 'Occupied', category: 'Standard Room' },
    { id: 6, roomNo: '102', grcNo: '127', guestName: 'SURAJ', mobile: '+91 98888 77777', arrival: '02 Jul 2026', departure: '03 Jul 2026', pkg: 'EP STANDARD', ota: 'SELF', pending: '₹1,050', status: 'Occupied', category: 'Standard Room' },
  ],
  'Arrivals': [
    { id: 101, bookingNo: '#101', grcNo: '#101', guestName: 'PRAMOD MISHRA', roomNo: '104', category: 'CP STANDARD', arrival: 'Today 07:05 AM', pax: 2, company: 'Self', status: 'Arrival' },
    { id: 102, bookingNo: '#102', grcNo: '#102', guestName: 'Emma Johnson', roomNo: '102', category: 'Deluxe Room', arrival: 'Today 11:30 AM', pax: 1, company: 'Booking.com', status: 'Arrival' },
    { id: 103, bookingNo: '#104', grcNo: '#104', guestName: 'Michael Brown', roomNo: '105', category: 'Standard Room', arrival: 'Today 02:00 PM', pax: 2, company: 'Expedia', status: 'Arrival' },
  ],
  'Room Status': [
    { id: 201, roomNo: '101', category: 'Deluxe', status: 'Occupied', floor: 'Ground' },
    { id: 202, roomNo: '102', category: 'Deluxe', status: 'Clean', floor: 'Ground' },
    { id: 203, roomNo: '103', category: 'Suite', status: 'Dirty', floor: 'Ground' },
    { id: 204, roomNo: '104', category: 'Deluxe', status: 'Out Of Order', floor: 'Ground' },
    { id: 205, roomNo: '105', category: 'Standard', status: 'Clean', floor: 'Ground' },
  ],
  'Departures': [
    { id: 301, billNo: '#220', grcNo: '119', guestName: 'PRAMOD MISHRA', roomNo: '104', departure: 'Today 12 PM', company: 'SELF', totalBill: '₹4,200', pending: '₹0', status: 'Departure' },
    { id: 302, billNo: '#218', grcNo: '114', guestName: 'James Wilson', roomNo: '302', departure: 'Today 11 AM', company: 'MakeMyTrip', totalBill: '₹8,500', pending: '₹0', status: 'Departure' },
    { id: 303, billNo: '119', grcNo: '127', guestName: 'SURAJ', roomNo: '102', departure: 'Today 11 AM', company: 'SONY INDIA PVT. LTD', totalBill: '₹1,050', pending: '₹1,050', status: 'Departure' },
  ],
  'Expected Arrivals': [
    { id: 401, bookingNo: '#551', grcNo: '#551', guestName: 'Amit Sharma', category: 'Deluxe Room', arrival: 'Tomorrow 10:00 AM', roomsCount: 2, pickup: 'Yes', company: 'Tech Corp', status: 'Reserved' },
    { id: 402, bookingNo: '#552', grcNo: '#552', guestName: 'Priya Patel', category: 'Executive Suite', arrival: 'Tomorrow 01:00 PM', roomsCount: 1, pickup: 'No', company: 'Self', status: 'Reserved' },
  ],
  'Expected Departures': [
    { id: 501, grcNo: '115', guestName: 'Rahul Singh', roomNo: '203', departure: 'Tomorrow 11 AM', company: 'XYZ Corp', status: 'Departure' },
    { id: 502, grcNo: '118', guestName: 'Anita Roy', roomNo: '205', departure: 'Tomorrow 12 PM', company: 'Self', status: 'Departure' },
  ],
  'Pending Bills': [
    { id: 601, billNo: '#220', grcNo: '119', guestName: 'PRAMOD MISHRA', roomNo: '104', totalBill: '₹4,200', pending: '₹1,200', status: 'Pending Bill' },
    { id: 602, billNo: '#215', grcNo: '112', guestName: 'Vikram Malhotra', roomNo: '305', totalBill: '₹15,500', pending: '₹3,500', status: 'Pending Bill' },
    { id: 603, billNo: '119', grcNo: '127', guestName: 'SURAJ', roomNo: '102', totalBill: '₹1,050', pending: '₹1,050', status: 'Pending Bill' },
  ],
};

const CATEGORIES = ['Standard Room', 'Deluxe Room', 'Executive Suite', 'Presidential Suite', 'Deluxe', 'Suite', 'Standard', 'Executive'];

const FrontOfficeDashboard = ({ showToast = () => { } }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Current Occupancy');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortBy, setSortBy] = useState('guestName');

  const [dashboardData, setDashboardData] = useState(INITIAL_DATA);

  // Drawer & Modal States
  const [viewDrawer, setViewDrawer] = useState({ open: false, item: null });
  const [editDrawer, setEditDrawer] = useState({ open: false, item: null });
  const [actionModal, setActionModal] = useState({ open: false, type: '', item: null });

  const notify = (msg) => showToast(msg);

  // Compute live counts for tab badges
  const counts = useMemo(() => {
    const res = {};
    Object.keys(dashboardData).forEach(tab => {
      res[tab] = dashboardData[tab]?.length || 0;
    });
    return res;
  }, [dashboardData]);

  // Compute metrics for top KPI summary bar
  const metrics = useMemo(() => {
    return {
      inHouse: `${dashboardData['Current Occupancy']?.length || 5} Guests`,
      arrivals: `${dashboardData['Arrivals']?.length || 3} Rooms`,
      departures: `${dashboardData['Departures']?.length || 2} Rooms`,
      pendingBills: '3.30%',
      revenue: '85.00%',
    };
  }, [dashboardData]);

  // Filter & Sort Pipeline across Guest Name, Room Number, and GRC Number
  const filteredList = useMemo(() => {
    let list = dashboardData[activeTab] || [];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(item =>
        (item.guestName && item.guestName.toLowerCase().includes(q)) ||
        (item.roomNo && item.roomNo.toLowerCase().includes(q)) ||
        (item.grcNo && item.grcNo.toLowerCase().includes(q)) ||
        (item.bookingNo && item.bookingNo.toLowerCase().includes(q))
      );
    }

    if (categoryFilter !== 'All') {
      list = list.filter(item => item.category === categoryFilter);
    }

    return [...list].sort((a, b) => {
      if (sortBy === 'guestName') return (a.guestName || '').localeCompare(b.guestName || '');
      if (sortBy === 'roomNo') return (a.roomNo || '').localeCompare(b.roomNo || '');
      return 0;
    });
  }, [dashboardData, activeTab, searchQuery, categoryFilter, sortBy]);

  // Handlers
  const handleOpenView = (item) => setViewDrawer({ open: true, item });
  const handleOpenEdit = (item) => setEditDrawer({ open: true, item });
  const handleOpenAction = (type, item) => setActionModal({ open: true, type, item });

  const handleSaveEdit = (updatedItem) => {
    setDashboardData(prev => ({
      ...prev,
      [activeTab]: prev[activeTab].map(i => i.id === updatedItem.id ? updatedItem : i)
    }));
    notify(`Updated record for ${updatedItem.guestName || `Room ${updatedItem.roomNo}`}`);
    setEditDrawer({ open: false, item: null });
  };

  const handleConfirmAction = (type, item, payload) => {
    if (type === 'checkIn') {
      notify(`Checked-in ${item.guestName} to Room ${item.roomNo || '104'}!`);
    } else if (type === 'checkout') {
      notify(`Checked-out Room ${item.roomNo || '104'}. Status updated to Dirty.`);
    } else if (type === 'roomChange') {
      notify(`Moved ${item.guestName} to Room ${payload.targetRoom}.`);
    } else if (type === 'assignRoom') {
      notify(`Assigned Room ${payload.targetRoom} to ${item.guestName}.`);
    } else if (type === 'changeStatus') {
      setDashboardData(prev => ({
        ...prev,
        'Room Status': prev['Room Status'].map(r => r.id === item.id ? { ...r, status: payload.newStatus } : r)
      }));
      notify(`Updated Room ${item.roomNo} status to ${payload.newStatus}.`);
    } else if (type === 'receivePayment') {
      notify(`Payment of ₹${payload.paymentAmount} received via ${payload.paymentMode}.`);
    } else if (type === 'amendStay') {
      notify(`Stay amended for GRC ${item.grcNo || '127'} – ${item.guestName || 'Sarah Wilson'}! New checkout: ${payload.newCheckOutDate} at ${payload.newCheckOutTime}`);
    }
    setActionModal({ open: false, type: '', item: null });
  };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Page Header */}
      <div className="no-print">
        <PageHeader
          title="Front Office Dashboard"
          breadcrumbs={['Dashboard', 'Front Desk', 'MIS', 'Front Office Dashboard']}
          showBack
        />
      </div>

      <PrintHeader title="Front Office Dashboard Summary" />

      {/* KPI Metrics Cards */}
      <FrontOfficeKpiCards metrics={metrics} />

      {/* Search & Filter Toolbar */}
      <FrontOfficeSearchFilter
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
        activeTab={activeTab}
        onActiveTabChange={setActiveTab}
        counts={counts}
        sortBy={sortBy}
        onSortChange={setSortBy}
        categories={CATEGORIES}
      />

      {/* Cards Grid */}
      {filteredList.length === 0 ? (
        <div style={{ background: 'var(--surface)', borderRadius: '10px', border: '1px solid var(--border)', padding: '40px 20px', textAlign: 'center', color: 'var(--text-light)' }}>
          <p style={{ fontSize: '0.88rem', margin: 0 }}>No records found under <strong>{activeTab}</strong>.</p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '12px',
            width: '100%'
          }}
        >
          {filteredList.map(item => (
            <FrontOfficeCard
              key={item.id}
              item={item}
              activeTab={activeTab}
              onView={handleOpenView}
              onAction={handleOpenAction}
            />
          ))}
        </div>
      )}

      <PrintFooter title="Front Office Dashboard Summary" />

      {/* Slide-Out View Drawer */}
      <FrontOfficeViewDrawer
        isOpen={viewDrawer.open}
        activeTab={activeTab}
        item={viewDrawer.item}
        onClose={() => setViewDrawer({ open: false, item: null })}
        onAction={handleOpenAction}
        showToast={notify}
      />

      {/* Slide-Out Edit Drawer */}
      <FrontOfficeEditDrawer
        isOpen={editDrawer.open}
        item={editDrawer.item}
        onClose={() => setEditDrawer({ open: false, item: null })}
        onSave={handleSaveEdit}
      />

      {/* Contextual Action Modal */}
      <FrontOfficeActionModal
        isOpen={actionModal.open}
        type={actionModal.type}
        item={actionModal.item}
        onClose={() => setActionModal({ open: false, type: '', item: null })}
        onConfirm={handleConfirmAction}
      />
    </div>
  );
};

export default FrontOfficeDashboard;
