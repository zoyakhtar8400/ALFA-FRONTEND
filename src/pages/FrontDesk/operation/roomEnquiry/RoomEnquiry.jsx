import React, { useState } from 'react';
import CommonTable from '../../../../components/common/CommonTable';

const RoomEnquiry = ({ showToast, onlyList = false }) => {
  const [data] = useState([
    { id: 1, guestName: 'Deepak Nair', mobile: '+91 9087654321', roomCategory: 'Deluxe Room', checkIn: '2026-06-25', checkOut: '2026-06-28', adults: 2, children: 0, source: 'Phone', active: 'Yes' },
    { id: 2, guestName: 'Laura Jenkins', mobile: '+1 555 102 3456', roomCategory: 'Executive Suite', checkIn: '2026-07-01', checkOut: '2026-07-07', adults: 2, children: 1, source: 'Online', active: 'Yes' },
    { id: 3, guestName: 'Ramesh Iyer', mobile: '+91 9123456789', roomCategory: 'Standard Room', checkIn: '2026-06-24', checkOut: '2026-06-26', adults: 1, children: 0, source: 'Walk-in', active: 'No' },
  ]);

  const columns = [
    { key: 'guestName', label: 'Guest Name' },
    { key: 'mobile', label: 'Mobile' },
    { key: 'roomCategory', label: 'Room Category' },
    { key: 'checkIn', label: 'Check-In' },
    { key: 'checkOut', label: 'Check-Out' },
    { key: 'adults', label: 'Adults' },
    { key: 'children', label: 'Children' },
    { key: 'source', label: 'Source' },
    { key: 'active', label: 'Active', renderStatus: true },
  ];

  return (
    <CommonTable
      title="Room Enquiry Entry"
      columns={columns}
      data={data}
      actions={[]}
      searchPlaceholder="Search by guest name, room category..."
      showToast={showToast}
      breadcrumbs={['Dashboard', 'Front Desk', 'Operation', 'Room Enquiry Entry']}
      onlyTable={onlyList}
    />
  );
};

export default RoomEnquiry;
