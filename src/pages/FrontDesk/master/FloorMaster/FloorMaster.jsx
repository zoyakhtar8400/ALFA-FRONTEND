import React from 'react';
import MasterTable from '../components/MasterTable';
import FloorMasterForm from './FloorMasterForm';

const columns = [
  { key: 'name', label: 'Floor Name' },
  { key: 'active', label: 'Active', renderStatus: true },
  { key: 'action', label: 'Action', sortable: false },
];

const seed = [
  { id: 1, name: 'Ground Floor', active: 'Yes' },
  { id: 2, name: 'First Floor', active: 'Yes' },
  { id: 3, name: 'Second Floor', active: 'Yes' },
];

const FloorMaster = ({ showToast }) => (
  <MasterTable title="Floor Master" columns={columns} seed={seed} FormComponent={FloorMasterForm} showToast={showToast} />
);

export default FloorMaster;
