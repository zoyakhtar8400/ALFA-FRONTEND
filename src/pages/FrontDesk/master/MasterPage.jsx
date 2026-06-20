import React from 'react';
import TaxStructure from './TaxStructure/TaxStructure';
import FloorMaster from './FloorMaster/FloorMaster';
import RoomFeature from './RoomFeature/RoomFeature';
import RoomCategory from './RoomCategory/RoomCategory';
import RoomMaster from './RoomMaster/RoomMaster';
import MealMaster from './MealMaster/MealMaster';
import RoomRateMaster from './RoomRateMaster/RoomRateMaster';
import ServiceChargeMaster from './ServiceChargeMaster/ServiceChargeMaster';
import CompanyMaster from './CompanyMaster/CompanyMaster';
import MarketSegment from './MarketSegment/MarketSegment';
import BusinessMaster from './BusinessMaster/BusinessMaster';
import VehicleMaster from './VehicleMaster/VehicleMaster';
import ExpenseMaster from './ExpenseMaster/ExpenseMaster';
import CityMaster from './CityMaster/CityMaster';
import StateMaster from './StateMaster/StateMaster';

const MasterPage = ({ masterName, showToast }) => {
  const components = {
    'Tax Structure': TaxStructure,
    'Floor Master': FloorMaster,
    'Room Feature': RoomFeature,
    'Room Category': RoomCategory,
    'Room Master': RoomMaster,
    'Meal Master': MealMaster,
    'Room Rate Master': RoomRateMaster,
    'Service Charge Master': ServiceChargeMaster,
    'Company Master': CompanyMaster,
    'Market Segment': MarketSegment,
    'Business Master': BusinessMaster,
    'Vehicle Master': VehicleMaster,
    'Expense Master': ExpenseMaster,
    'City Master': CityMaster,
    'State Master': StateMaster,
  };

  const Component = components[masterName];

  if (!Component) {
    return (
      <div className="dashboard-panel">
        <div className="panel-header">
          <h3 className="panel-title">{masterName}</h3>
        </div>
        <p className="text-secondary">Configuration for {masterName} is coming soon.</p>
      </div>
    );
  }

  return <Component showToast={showToast} />;
};

export default MasterPage;

