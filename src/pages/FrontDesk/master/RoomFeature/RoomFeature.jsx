import React from 'react';
import MasterTable from '../components/MasterTable';
import RoomFeatureForm from './RoomFeatureForm';

const columns = [
  { key: 'name', label: 'Feature Name' },
  { key: 'active', label: 'Active', renderStatus: true },
  { key: 'action', label: 'Action', sortable: false },
];

const seed = [
  { id: 1, name: 'Ocean Front View Balcony', active: 'Yes' },
  { id: 2, name: 'Fully Stocked Mini Bar', active: 'Yes' },
  { id: 3, name: 'In-Room Private Jacuzzi Tub', active: 'Yes' },
];

const RoomFeature = ({ showToast }) => (
  <MasterTable title="Room Feature" columns={columns} seed={seed} FormComponent={RoomFeatureForm} showToast={showToast} />
);

export default RoomFeature;
