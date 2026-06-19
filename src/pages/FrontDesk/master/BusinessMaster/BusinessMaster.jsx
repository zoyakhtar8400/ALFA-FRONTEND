import React from 'react';
import MasterTable from '../components/MasterTable';
import BusinessMasterForm from './BusinessMasterForm';

const columns = [
  { key: 'code', label: 'Business Code' },
  { key: 'name', label: 'Business Source' },
  { key: 'type', label: 'Type' },
  { key: 'action', label: 'Action', sortable: false },
];

const seed = [
  { id: 1, code: 'BIZ-OTA', name: 'Online Travel Agency', type: 'Digital' },
  { id: 2, code: 'BIZ-DIR', name: 'Direct Walk-In', type: 'Direct' },
  { id: 3, code: 'BIZ-COR', name: 'Corporate Contract', type: 'B2B' },
  { id: 4, code: 'BIZ-AGT', name: 'Travel Agent', type: 'Commission' },
];

const BusinessMaster = ({ showToast }) => (
  <MasterTable title="Business Master" columns={columns} seed={seed} FormComponent={BusinessMasterForm} showToast={showToast} />
);

export default BusinessMaster;
