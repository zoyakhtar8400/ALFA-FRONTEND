import React from 'react';
import MasterTable from '../components/MasterTable';
import ExpenseMasterForm from './ExpenseMasterForm';

const columns = [
  { key: 'name', label: 'Expense Head' },
  { key: 'status', label: 'Status', renderStatus: true },
  { key: 'action', label: 'Action', sortable: false },
];

const seed = [
  { id: 1, name: 'Guest Amenities', status: 'Active' },
  { id: 2, name: 'Stationery & Supplies', status: 'Active' },
  { id: 3, name: 'Utilities & Services', status: 'Active' },
  { id: 4, name: 'Maintenance & Repairs', status: 'Active' },
];

const ExpenseMaster = ({ showToast }) => (
  <MasterTable title="Expense Master" columns={columns} seed={seed} FormComponent={ExpenseMasterForm} showToast={showToast} />
);

export default ExpenseMaster;
