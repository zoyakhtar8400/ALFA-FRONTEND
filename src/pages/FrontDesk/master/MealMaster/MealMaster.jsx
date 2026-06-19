// MealMaster.jsx
import React from 'react';
import MasterTable from '../components/MasterTable';

const columns = [
  { key: 'code', label: 'Meal Code' },
  { key: 'name', label: 'Meal Plan Name' },
  { key: 'price', label: 'Rate / Pax' },
  { key: 'status', label: 'Status', renderStatus: true },
  { key: 'action', label: 'Action', sortable: false },
];

const seed = [
  { id: 1, code: 'EP', name: 'European Plan (Room Only)', price: 'Rs. 0.00', status: 'Active' },
  { id: 2, code: 'CP', name: 'Continental Plan (Breakfast)', price: 'Rs. 25.00', status: 'Active' },
  { id: 3, code: 'MAP', name: 'Modified American Plan (B+D)', price: 'Rs. 60.00', status: 'Active' },
  { id: 4, code: 'AP', name: 'American Plan (All 3 Meals)', price: 'Rs. 90.00', status: 'Active' },
];

const formFields = [
  { key: 'code', label: 'Meal Code', type: 'text' },
  { key: 'name', label: 'Meal Plan Name', type: 'text' },
  { key: 'price', label: 'Rate / Pax', type: 'text' },
  { key: 'status', label: 'Status', type: 'select', options: ['Active', 'Inactive'] },
];

const MealMaster = ({ showToast }) => (
  <MasterTable title="Meal Master" columns={columns} seed={seed} formFields={formFields} showToast={showToast} />
);

export default MealMaster;
