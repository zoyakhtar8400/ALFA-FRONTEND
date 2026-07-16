import { useState, useEffect, useMemo } from 'react';

const INITIAL_MAIN_GROUPS = [
  { id: 'MG1', name: 'Food' },
  { id: 'MG2', name: 'Banquet Food' }
];

const INITIAL_ITEM_GROUPS = [
  { id: 'IG1', name: 'Indian Starter', mainGroup: 'Food', code: '2106' },
  { id: 'IG2', name: 'Chinese Main Course', mainGroup: 'Food', code: '2106' },
  { id: 'IG3', name: 'Domestic Beer', mainGroup: 'Banquet Food', code: '2203' }
];

const INITIAL_MENU_ITEMS = [
  { 
    id: 'M1', 
    name: 'Chicken Tandoori', 
    dispCode: '101', 
    itemGroup: 'Indian Starter', 
    mainGroup: 'Food', 
    unitType: 'Plate', 
    outlet: 'Main Restaurant', 
    price: 280, 
    category: 'Veg', 
    rateEdit: 'No', 
    discApp: 'Yes', 
    kitchen: 'Main Kitchen', 
    status: 'Active', 
    hsnCode: '2106' 
  },
  { 
    id: 'M2', 
    name: 'Paneer Tikka', 
    dispCode: '102', 
    itemGroup: 'Indian Starter', 
    mainGroup: 'Food', 
    unitType: 'Plate', 
    outlet: 'Main Restaurant', 
    price: 220, 
    category: 'Veg', 
    rateEdit: 'No', 
    discApp: 'Yes', 
    kitchen: 'Main Kitchen', 
    status: 'Active', 
    hsnCode: '2106' 
  }
];

export const useItemMenu = (activeTab, showToast) => {
  // Main Groups State
  const [mainGroups, setMainGroups] = useState(() => {
    const saved = localStorage.getItem('hms_pos_main_groups');
    return saved ? JSON.parse(saved) : INITIAL_MAIN_GROUPS;
  });

  // Item Groups State
  const [itemGroups, setItemGroups] = useState(() => {
    const saved = localStorage.getItem('hms_pos_item_groups');
    return saved ? JSON.parse(saved) : INITIAL_ITEM_GROUPS;
  });

  // Menu Items State
  const [menuItems, setMenuItems] = useState(() => {
    const saved = localStorage.getItem('hms_pos_menu_items');
    return saved ? JSON.parse(saved) : INITIAL_MENU_ITEMS;
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal open states
  const [modal, setModal] = useState({ open: false, isEdit: false, fields: {} });
  const [deleteModal, setDeleteModal] = useState({ open: false, row: null });
  const [duplicateConfirm, setDuplicateConfirm] = useState({ open: false, fields: null, duplicateItem: null });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('hms_pos_main_groups', JSON.stringify(mainGroups));
  }, [mainGroups]);

  useEffect(() => {
    localStorage.setItem('hms_pos_item_groups', JSON.stringify(itemGroups));
  }, [itemGroups]);

  useEffect(() => {
    localStorage.setItem('hms_pos_menu_items', JSON.stringify(menuItems));
  }, [menuItems]);

  const filteredData = useMemo(() => {
    if (activeTab === 'main-group') {
      return mainGroups.filter(item => 
        (item.name || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (activeTab === 'item-group') {
      return itemGroups.filter(item => 
        (item.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
        (item.mainGroup || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
        (item.code || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (activeTab === 'menu-item') {
      return menuItems.filter(item => {
        const matchSearch = 
          (item.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
          (item.itemGroup || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
          (item.dispCode || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.outlet || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchStatus = statusFilter === 'All' || item.status === statusFilter;
        return matchSearch && matchStatus;
      });
    }
    return [];
  }, [activeTab, mainGroups, itemGroups, menuItems, searchTerm, statusFilter]);

  const validate = (fields, skipDuplicateCheck = false) => {
    if (activeTab === 'main-group') {
      if (!fields.name || fields.name.trim().length < 2) {
        showToast('Main Group Name must be at least 2 characters.');
        return false;
      }
      if (!skipDuplicateCheck) {
        const duplicateItem = mainGroups.find(item => 
          item.id !== fields.id && 
          item.name.toLowerCase().trim() === fields.name.toLowerCase().trim()
        );
        if (duplicateItem) {
          setDuplicateConfirm({ open: true, fields, duplicateItem });
          return false;
        }
      }
    }

    if (activeTab === 'item-group') {
      if (!fields.name || fields.name.trim().length < 2) {
        showToast('Item Group Name must be at least 2 characters.');
        return false;
      }
      if (!fields.mainGroup) {
        showToast('Please select a Main Group.');
        return false;
      }
      if (!fields.code || fields.code.trim().length < 2) {
        showToast('HSN/SAC Code must be at least 2 characters.');
        return false;
      }
      if (!skipDuplicateCheck) {
        const duplicateItem = itemGroups.find(item => 
          item.id !== fields.id && 
          item.name.toLowerCase().trim() === fields.name.toLowerCase().trim()
        );
        if (duplicateItem) {
          setDuplicateConfirm({ open: true, fields, duplicateItem });
          return false;
        }
      }
    }

    if (activeTab === 'menu-item') {
      if (!fields.name || fields.name.trim().length < 2) {
        showToast('Item Name must be at least 2 characters.');
        return false;
      }
      if (!fields.dispCode || fields.dispCode.trim().length < 1) {
        showToast('DISP Code is required.');
        return false;
      }
      if (!fields.itemGroup) {
        showToast('Please select an Item Group.');
        return false;
      }
      if (!fields.mainGroup) {
        showToast('Please select a Main Group.');
        return false;
      }
      if (!fields.outlet) {
        showToast('Please select an Outlet.');
        return false;
      }
      if (fields.price === undefined || fields.price === '' || Number(fields.price) < 0) {
        showToast('Sale Rate must be a valid number.');
        return false;
      }
      if (!skipDuplicateCheck) {
        const duplicateItem = menuItems.find(item => 
          item.id !== fields.id && 
          item.name.toLowerCase().trim() === fields.name.toLowerCase().trim()
        );
        if (duplicateItem) {
          setDuplicateConfirm({ open: true, fields, duplicateItem });
          return false;
        }
      }
    }

    return true;
  };

  const handleSave = (fields, skipDuplicateCheck = false) => {
    if (!validate(fields, skipDuplicateCheck)) return false;

    if (activeTab === 'main-group') {
      if (modal.isEdit) {
        setMainGroups(prev => prev.map(item => item.id === fields.id ? fields : item));
        showToast('Main Group updated successfully.');
      } else {
        const newId = `MG${Math.floor(Math.random() * 10000)}`;
        setMainGroups(prev => [...prev, { ...fields, id: newId }]);
        showToast('Main Group created successfully.');
      }
    } else if (activeTab === 'item-group') {
      if (modal.isEdit) {
        setItemGroups(prev => prev.map(item => item.id === fields.id ? fields : item));
        showToast('Item Group updated successfully.');
      } else {
        const newId = `IG${Math.floor(Math.random() * 10000)}`;
        setItemGroups(prev => [...prev, { ...fields, id: newId }]);
        showToast('Item Group created successfully.');
      }
    } else if (activeTab === 'menu-item') {
      if (modal.isEdit) {
        setMenuItems(prev => prev.map(item => item.id === fields.id ? fields : item));
        showToast('Menu Item updated successfully.');
      } else {
        const newId = `M${Math.floor(Math.random() * 10000)}`;
        setMenuItems(prev => [...prev, { ...fields, id: newId, status: fields.status || 'Active' }]);
        showToast('Menu Item created successfully.');
      }
    }

    setModal({ open: false, isEdit: false, fields: {} });
    setDuplicateConfirm({ open: false, fields: null, duplicateItem: null });
    return true;
  };

  const handleDelete = () => {
    if (!deleteModal.row) return;

    if (activeTab === 'main-group') {
      setMainGroups(prev => prev.filter(item => item.id !== deleteModal.row.id));
      showToast('Main Group deleted successfully.');
    } else if (activeTab === 'item-group') {
      setItemGroups(prev => prev.filter(item => item.id !== deleteModal.row.id));
      showToast('Item Group deleted successfully.');
    } else if (activeTab === 'menu-item') {
      setMenuItems(prev => prev.filter(item => item.id !== deleteModal.row.id));
      showToast('Menu Item deleted successfully.');
    }

    setDeleteModal({ open: false, row: null });
  };

  return {
    data: filteredData,
    mainGroups,
    itemGroups,
    menuItems,
    setMenuItems,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    modal,
    setModal,
    deleteModal,
    setDeleteModal,
    duplicateConfirm,
    setDuplicateConfirm,
    handleSave,
    handleDelete
  };
};
