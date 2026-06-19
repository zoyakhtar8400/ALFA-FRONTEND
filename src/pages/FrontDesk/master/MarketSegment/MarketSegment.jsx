import React from 'react';
import MasterTable from '../components/MasterTable';
import MarketSegmentForm from './MarketSegmentForm';

const columns = [
  { key: 'name', label: 'Segment Name' },
  { key: 'status', label: 'Status', renderStatus: true },
  { key: 'action', label: 'Action', sortable: false },
];

const seed = [
  { id: 1, name: 'Corporate', status: 'Active' },
  { id: 2, name: 'Leisure', status: 'Active' },
  { id: 3, name: 'Group Tour', status: 'Active' },
  { id: 4, name: 'Government', status: 'Active' },
];

const MarketSegment = ({ showToast }) => (
  <MasterTable title="Market Segment" columns={columns} seed={seed} FormComponent={MarketSegmentForm} showToast={showToast} />
);

export default MarketSegment;
