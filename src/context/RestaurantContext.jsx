import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_TABLES, INITIAL_MOCK_ORDER_DETAILS } from '../pages/Restaurant/constants/mockData';

const RestaurantContext = createContext(null);

export const RestaurantProvider = ({ children }) => {
  const [tables, setTables] = useState(() => {
    try {
      const saved = localStorage.getItem('alfa_restaurant_tables');
      return saved ? JSON.parse(saved) : INITIAL_TABLES;
    } catch {
      return INITIAL_TABLES;
    }
  });

  const [orderItemsMap, setOrderItemsMap] = useState(() => {
    try {
      const saved = localStorage.getItem('alfa_restaurant_orders');
      return saved ? JSON.parse(saved) : INITIAL_MOCK_ORDER_DETAILS;
    } catch {
      return INITIAL_MOCK_ORDER_DETAILS;
    }
  });

  // Sync state changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('alfa_restaurant_tables', JSON.stringify(tables));
    } catch (err) {
      console.error("Failed to persist tables", err);
    }
  }, [tables]);

  useEffect(() => {
    try {
      localStorage.setItem('alfa_restaurant_orders', JSON.stringify(orderItemsMap));
    } catch (err) {
      console.error("Failed to persist orders map", err);
    }
  }, [orderItemsMap]);

  return (
    <RestaurantContext.Provider value={{ tables, setTables, orderItemsMap, setOrderItemsMap }}>
      {children}
    </RestaurantContext.Provider>
  );
};

export const useRestaurant = () => {
  const context = useContext(RestaurantContext);
  if (!context) {
    throw new Error('useRestaurant must be used within a RestaurantProvider');
  }
  return context;
};
