import React from 'react';
import MasterTable from '../components/MasterTable';
import StateMasterForm from './StateMasterForm';

const columns = [
  { key: 'name', label: 'State Name' },
  { key: 'country', label: 'Country' },
  { key: 'gstCode', label: 'GST Code' },
  { key: 'action', label: 'Action', sortable: false },
];

const seed = [
  { id: 1, name: 'New York', country: 'USA', gstCode: '-' },
  { id: 2, name: 'Maharashtra', country: 'India', gstCode: '27' },
  { id: 3, name: 'Delhi', country: 'India', gstCode: '07' },
  { id: 4, name: 'California', country: 'USA', gstCode: '-' },
];

const StateMaster = ({ showToast }) => (
  <MasterTable title="State Master" columns={columns} seed={seed} FormComponent={StateMasterForm} showToast={showToast} />
);

export default StateMaster;
