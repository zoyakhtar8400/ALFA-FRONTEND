import apiClient from './apiClient';

export const menuService = {
  // Load full restaurant menu catalog (categories, items, prices)
  async getMenu() {
    return await apiClient.get('/menu');
  },

  // Load menu categories from PostgreSQL
  async getCategories() {
    return await apiClient.get('/categories');
  },

  // Load menu items from PostgreSQL
  async getMenuItems() {
    return await apiClient.get('/menu-items');
  },

  // Load department & kitchen categories
  async getDepartments() {
    return await apiClient.get('/department');
  },
};

export default menuService;

