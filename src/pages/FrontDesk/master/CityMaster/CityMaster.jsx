import React from 'react';
import MasterTable from '../components/MasterTable';
import CityMasterForm from './CityMasterForm';

const columns = [
  { key: 'name', label: 'City Name' },
  { key: 'state', label: 'State' },
  { key: 'country', label: 'Country' },
  { key: 'action', label: 'Action', sortable: false },
];

const seed = [
  { id: 1, name: 'New York', state: 'New York', country: 'USA' },
  { id: 2, name: 'Mumbai', state: 'Maharashtra', country: 'India' },
  { id: 3, name: 'Los Angeles', state: 'California', country: 'USA' },
  { id: 4, name: 'Delhi', state: 'Delhi', country: 'India' },
];

const CityMaster = ({ showToast }) => (
  <MasterTable title="City Master" columns={columns} seed={seed} FormComponent={CityMasterForm} showToast={showToast} />
);

export default CityMaster;
