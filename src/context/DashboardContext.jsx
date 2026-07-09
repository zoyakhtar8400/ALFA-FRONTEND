import React, { createContext, useContext, useState, useEffect } from 'react';

const DashboardContext = createContext(null);

export const DashboardProvider = ({ children }) => {
  const [activeTab, setActiveTab] = useState(() => {
    try {
      return localStorage.getItem('alfa_dashboard_active_tab') || 'overview';
    } catch {
      return 'overview';
    }
  });

  const [timeframe, setTimeframe] = useState(() => {
    try {
      return localStorage.getItem('alfa_dashboard_timeframe') || 'weekly';
    } catch {
      return 'weekly';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('alfa_dashboard_active_tab', activeTab);
    } catch (err) {
      console.error(err);
    }
  }, [activeTab]);

  useEffect(() => {
    try {
      localStorage.setItem('alfa_dashboard_timeframe', timeframe);
    } catch (err) {
      console.error(err);
    }
  }, [timeframe]);

  return (
    <DashboardContext.Provider value={{ activeTab, setActiveTab, timeframe, setTimeframe }}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboardContext = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboardContext must be used within a DashboardProvider');
  }
  return context;
};
