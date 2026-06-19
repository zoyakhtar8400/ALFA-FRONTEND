import React from 'react';
import MasterTable from '../components/MasterTable';
import RoomMasterForm from './RoomMasterForm';

const columns = [
  { key: 'roomNo', label: 'Room No' },
  { key: 'floor', label: 'Floor' },
  { key: 'category', label: 'Category' },
  { key: 'maxOccupancy', label: 'Max Occupancy' },
  { key: 'bedType', label: 'Bed Type' },
  { key: 'rate', label: 'Base Rate' },
  { key: 'hkStatus', label: 'HK Status', renderStatus: true, activeValue: 'Clean' },
  { key: 'action', label: 'Action', sortable: false },
];

const seed = [
  { id: 1, roomNo: '101', floor: 'First Floor', category: 'Standard', maxOccupancy: '2', bedType: 'Queen', rate: 'Rs. 120', hkStatus: 'Clean' },
  { id: 2, roomNo: '102', floor: 'First Floor', category: 'Standard', maxOccupancy: '2', bedType: 'Queen', rate: 'Rs. 120', hkStatus: 'Dirty' },
  { id: 3, roomNo: '201', floor: 'Second Floor', category: 'Deluxe', maxOccupancy: '3', bedType: 'King', rate: 'Rs. 220', hkStatus: 'Clean' },
  { id: 4, roomNo: '301', floor: 'Third Floor', category: 'Suite', maxOccupancy: '4', bedType: 'King', rate: 'Rs. 450', hkStatus: 'Clean' },
];

const RoomMaster = ({ showToast }) => (
  <MasterTable title="Room Master" columns={columns} seed={seed} FormComponent={RoomMasterForm} showToast={showToast} />
);

export default RoomMaster;
