import React from 'react';
import MasterTable from '../components/MasterTable';

const columns = [
  { key: 'code', label: 'Company Code' },
  { key: 'name', label: 'Company Name' },
  { key: 'contact', label: 'Contact Person' },
  { key: 'mobile', label: 'Mobile' },
  { key: 'city', label: 'City' },
  { key: 'status', label: 'Status', renderStatus: true },
  { key: 'action', label: 'Action', sortable: false },
];

const seed = [
  { id: 1, code: 'COMP-001', name: 'Alfa Group Ltd', contact: 'Zoya Khan', mobile: '+1 555-9021', city: 'New York', status: 'Active' },
  { id: 2, code: 'COMP-002', name: 'TechNova Corp', contact: 'Arjun Mehta', mobile: '+91 9812345', city: 'Mumbai', status: 'Active' },
  { id: 3, code: 'COMP-003', name: 'Blue Horizon LLC', contact: 'Sarah Miller', mobile: '+1 555-1122', city: 'Los Angeles', status: 'Active' },
];

const formFields = [
  { key: 'code', label: 'Company Code', type: 'text' },
  { key: 'name', label: 'Company Name', type: 'text' },
  { key: 'contact', label: 'Contact Person', type: 'text' },
  { key: 'mobile', label: 'Mobile', type: 'text' },
  { key: 'city', label: 'City', type: 'text' },
  { key: 'status', label: 'Status', type: 'select', options: ['Active', 'Inactive'] },
];

const CompanyMaster = ({ showToast }) => (
  <MasterTable title="Company Master" columns={columns} seed={seed} formFields={formFields} showToast={showToast} />
);

export default CompanyMaster;
