import React from 'react';
import MasterTable from '../components/MasterTable';

const columns = [
  { key: 'code', label: 'Rate Code' },
  { key: 'category', label: 'Room Category' },
  { key: 'season', label: 'Season' },
  { key: 'rate', label: 'Rate / Night' },
  { key: 'status', label: 'Status', renderStatus: true },
  { key: 'action', label: 'Action', sortable: false },
];

const seed = [
  { id: 1, code: 'RR-STD-PK', category: 'Standard Comfort Room', season: 'Peak Season', rate: 'Rs. 180.00', status: 'Active' },
  { id: 2, code: 'RR-STD-OF', category: 'Standard Comfort Room', season: 'Off Season', rate: 'Rs. 120.00', status: 'Active' },
  { id: 3, code: 'RR-DLX-PK', category: 'Premium Deluxe King Room', season: 'Peak Season', rate: 'Rs. 320.00', status: 'Active' },
  { id: 4, code: 'RR-SUT-PK', category: 'Presidential Penthouse Suite', season: 'Peak Season', rate: 'Rs. 650.00', status: 'Active' },
];

const formFields = [
  { key: 'code', label: 'Rate Code', type: 'text' },
  { key: 'category', label: 'Room Category', type: 'text' },
  { key: 'season', label: 'Season', type: 'select', options: ['Peak Season', 'Off Season', 'Festival Season'] },
  { key: 'rate', label: 'Rate / Night', type: 'text' },
  { key: 'status', label: 'Status', type: 'select', options: ['Active', 'Inactive'] },
];

const RoomRateMaster = ({ showToast }) => (
  <MasterTable title="Room Rate Master" columns={columns} seed={seed} formFields={formFields} showToast={showToast} />
);

export default RoomRateMaster;
