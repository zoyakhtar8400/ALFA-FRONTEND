import React from 'react';
import MasterTable from '../components/MasterTable';
import TaxStructureForm from './TaxStructureForm';

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'applicableDate', label: 'Applicable Date' },
  { key: 'active', label: 'Active', renderStatus: true },
  { key: 'action', label: 'Action', sortable: false },
];

const seed = [
  { id: 1, name: 'NO TAX', applicableDate: '01-04-2023', active: 'Yes' },
  { id: 2, name: 'BEVERAGE TAX', applicableDate: '01-04-2023', active: 'Yes' },
  { id: 3, name: 'MEAL TAX', applicableDate: '06-11-2023', active: 'Yes' },
  { id: 4, name: 'TAX @5%', applicableDate: '14-01-2024', active: 'Yes' },
  { id: 5, name: 'TAX @12', applicableDate: '13-02-2024', active: 'Yes' },
];

const TaxStructure = ({ showToast }) => (
  <MasterTable title="Tax Structure" columns={columns} seed={seed} FormComponent={TaxStructureForm} showToast={showToast} />
);

export default TaxStructure;
