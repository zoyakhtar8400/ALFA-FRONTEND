// API & Mock Data Service layer for ALFA HMS Purchase Module

export const fetchItemGroups = async () => {
  const saved = localStorage.getItem('alfa_purchase_item_groups');
  return saved ? JSON.parse(saved) : [];
};

export const saveItemGroups = async (itemGroups) => {
  localStorage.setItem('alfa_purchase_item_groups', JSON.stringify(itemGroups));
  return true;
};

export const fetchItemMasters = async () => {
  const saved = localStorage.getItem('alfa_purchase_items');
  return saved ? JSON.parse(saved) : [];
};

export const saveItemMasters = async (items) => {
  localStorage.setItem('alfa_purchase_items', JSON.stringify(items));
  return true;
};

export const fetchUnits = async () => {
  const saved = localStorage.getItem('alfa_purchase_units');
  return saved ? JSON.parse(saved) : [];
};

export const saveUnits = async (units) => {
  localStorage.setItem('alfa_purchase_units', JSON.stringify(units));
  return true;
};
