import React from 'react';
import ReservationDashboard from './reservationDashboard/ReservationDashboard';
import FrontOfficeDashboard from './frontOfficeDashboard/FrontOfficeDashboard';

const MisPage = ({ misName, showToast }) => {
  if (misName === 'Reservation Dashboard') {
    return <ReservationDashboard showToast={showToast} />;
  }
  if (misName === 'Front Office Dashboard') {
    return <FrontOfficeDashboard showToast={showToast} />;
  }

  return (
    <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-200">
      <h3 className="text-lg font-bold text-slate-800">{misName}</h3>
      <p className="text-xs text-slate-500 mt-2">MIS report for {misName} is coming soon.</p>
    </div>
  );
};

export default MisPage;
