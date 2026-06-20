import React from 'react';
import MasterTable from '../components/MasterTable';
import FloorMasterForm from './FloorMasterForm';

const columns = [
  { key: 'name', label: 'Floor Name' },
  { key: 'floorNumber', label: 'Floor Number' },
  { key: 'description', label: 'Description' },
  { key: 'active', label: 'Active', renderStatus: true },
  { key: 'action', label: 'Action', sortable: false },
];

const seed = [
  { id: 1, name: 'Ground Floor', floorNumber: '0', description: 'Main Lobby and Reception Area', active: 'Yes' },
  { id: 2, name: 'First Floor', floorNumber: '1', description: 'Deluxe Rooms Corridor', active: 'Yes' },
  { id: 3, name: 'Second Floor', floorNumber: '2', description: 'Executive Suites Corridor', active: 'Yes' },
];

const FloorMaster = ({ showToast }) => (
  <MasterTable title="Floor Master" columns={columns} seed={seed} FormComponent={FloorMasterForm} showToast={showToast} />
);

export default FloorMaster;
