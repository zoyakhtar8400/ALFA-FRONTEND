import { useState, useEffect } from 'react';
import menuService from '../services/menuService';

export function useMenu() {
  const [menu, setMenu] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMenu = async () => {
    try {
      setLoading(true);
      const data = await menuService.getMenu();
      setMenu(data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load menu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  return { menu, loading, error, refetch: fetchMenu };
}

export default useMenu;
