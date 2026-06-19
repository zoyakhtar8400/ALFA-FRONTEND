import React from 'react';
import MasterTable from '../components/MasterTable';
import VehicleMasterForm from './VehicleMasterForm';

const columns = [
  { key: 'regNo', label: 'Reg. No' },
  { key: 'type', label: 'Vehicle Type' },
  { key: 'driver', label: 'Driver Name' },
  { key: 'mobile', label: 'Mobile' },
  { key: 'capacity', label: 'Capacity' },
  { key: 'status', label: 'Status', renderStatus: true },
  { key: 'action', label: 'Action', sortable: false },
];

const seed = [
  { id: 1, regNo: 'NY-AX-1234', type: 'Sedan', driver: 'James Wilson', mobile: '+1 555-4412', capacity: '4', status: 'Active' },
  { id: 2, regNo: 'NY-BX-5678', type: 'SUV', driver: 'Carlos Reyes', mobile: '+1 555-7821', capacity: '6', status: 'Active' },
  { id: 3, regNo: 'NY-CX-9012', type: 'Mini Van', driver: 'Priya Sharma', mobile: '+91 9909012', capacity: '8', status: 'Active' },
];

const VehicleMaster = ({ showToast }) => (
  <MasterTable title="Vehicle Master" columns={columns} seed={seed} FormComponent={VehicleMasterForm} showToast={showToast} />
);

export default VehicleMaster;
