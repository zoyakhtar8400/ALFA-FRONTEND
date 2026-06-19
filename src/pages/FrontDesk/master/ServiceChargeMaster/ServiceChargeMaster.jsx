import React from 'react';
import MasterTable from '../components/MasterTable';

const columns = [
  { key: 'code', label: 'Charge Code' },
  { key: 'name', label: 'Service Name' },
  { key: 'chargeType', label: 'Charge Type' },
  { key: 'amount', label: 'Amount / Rate' },
  { key: 'status', label: 'Status', renderStatus: true },
  { key: 'action', label: 'Action', sortable: false },
];

const seed = [
  { id: 1, code: 'SC-LAU', name: 'Laundry Service', chargeType: 'Fixed', amount: 'Rs. 50.00', status: 'Active' },
  { id: 2, code: 'SC-SPA', name: 'Spa & Wellness', chargeType: 'Per Session', amount: 'Rs. 120.00', status: 'Active' },
  { id: 3, code: 'SC-PKG', name: 'Valet Car Parking', chargeType: 'Per Day', amount: 'Rs. 20.00', status: 'Active' },
  { id: 4, code: 'SC-AIR', name: 'Airport Transfer', chargeType: 'Fixed', amount: 'Rs. 80.00', status: 'Active' },
];

const formFields = [
  { key: 'code', label: 'Charge Code', type: 'text' },
  { key: 'name', label: 'Service Name', type: 'text' },
  { key: 'chargeType', label: 'Charge Type', type: 'select', options: ['Fixed', 'Per Session', 'Per Day', 'Percentage'] },
  { key: 'amount', label: 'Amount / Rate', type: 'text' },
  { key: 'status', label: 'Status', type: 'select', options: ['Active', 'Inactive'] },
];

const ServiceChargeMaster = ({ showToast }) => (
  <MasterTable title="Service Charge Master" columns={columns} seed={seed} formFields={formFields} showToast={showToast} />
);

export default ServiceChargeMaster;
