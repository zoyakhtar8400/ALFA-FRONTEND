import { useState } from 'react';
import { useFrontDesk } from '../../context/FrontDeskContext';
import { useDashboardContext } from '../../context/DashboardContext';

export const useDashboard = (showToast) => {
  const { activeTab, setActiveTab, timeframe, setTimeframe } = useDashboardContext();
  const { rooms, cycleRoomStatus } = useFrontDesk();
  const [isLoading, setIsLoading] = useState(false);

  const handleTimeframeChange = (newTimeframe) => {
    setIsLoading(true);
    setTimeframe(newTimeframe);
    if (showToast) {
      showToast(`Analytics timeframe updated to: ${newTimeframe.toUpperCase()}`);
    }
    setTimeout(() => setIsLoading(false), 400);
  };

  return {
    activeTab,
    setActiveTab,
    timeframe,
    setTimeframe: handleTimeframeChange,
    rooms,
    cycleRoomStatus: (roomNo) => cycleRoomStatus(roomNo, showToast),
    isLoading
  };
};
