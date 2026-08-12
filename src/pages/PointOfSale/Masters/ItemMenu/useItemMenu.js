import { useState, useEffect, useMemo, useCallback } from 'react';
import posApi from '../../../../api/posApi';

export const useItemMenu = (activeTab, showToast) => {
  const [mainGroups, setMainGroups] = useState([]);
  const [itemGroups, setItemGroups] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal open states
  const [modal, setModal] = useState({ open: false, isEdit: false, fields: {} });
  const [deleteModal, setDeleteModal] = useState({ open: false, row: null });
  const [duplicateConfirm, setDuplicateConfirm] = useState({ open: false, fields: null, duplicateItem: null });

  const fetchMenuData = useCallback(() => {
    setLoading(true);
    Promise.all([
      posApi.getProductGroups(),
      posApi.getCategories(),
      posApi.getMenuItems()
    ]).then(([pgRes, catRes, menuRes]) => {
      const groups = Array.isArray(pgRes?.data?.productGroups) ? pgRes.data.productGroups : (Array.isArray(pgRes?.data) ? pgRes.data : []);
      const categories = Array.isArray(catRes?.data?.categories) ? catRes.data.categories : (Array.isArray(catRes?.data) ? catRes.data : []);
      const items = Array.isArray(menuRes?.data?.menuItems) ? menuRes.data.menuItems : (Array.isArray(menuRes?.data) ? menuRes.data : []);

      const mappedProductGroups = groups.map((g, idx) => ({
        id: g.id || g.product_group_id || idx + 1,
        name: g.name || g.product_group_name || `Main Group ${idx + 1}`
      }));

      const mappedCategories = categories.map((c, idx) => ({
        id: c.id || c.category_refid || idx + 1,
        name: c.name || c.category_name || `Category ${idx + 1}`,
        mainGroup: c.mainGroup || 'Food',
        code: c.hsnCode || '2106'
      }));

      const mappedMenuItems = items.map((m, idx) => ({
        id: m.id || m.item_id || idx + 1,
        name: m.name || m.title || `Menu Item ${idx + 1}`,
        dispCode: String(m.id || idx + 100),
        itemGroup: m.category || 'General',
        mainGroup: 'Food',
        unitType: 'Plate',
        outlet: 'Main Restaurant',
        price: Number(m.price || m.sale_price || 0),
        category: m.foodType || 'Veg',
        rateEdit: 'No',
        discApp: 'Yes',
        kitchen: 'Main Kitchen',
        status: m.active !== 0 ? 'Active' : 'Inactive',
        hsnCode: '2106'
      }));

      setMainGroups(mappedProductGroups);
      setItemGroups(mappedCategories);
      setMenuItems(mappedMenuItems);
    }).catch(err => {
      console.error('Error fetching menu catalog:', err);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchMenuData();
  }, [fetchMenuData]);

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
    }
    if (activeTab === 'item-group') {
      if (!fields.name || fields.name.trim().length < 2) {
        showToast('Item Group Name must be at least 2 characters.');
        return false;
      }
    }
    if (activeTab === 'menu-item') {
      if (!fields.name || fields.name.trim().length < 2) {
        showToast('Item Name must be at least 2 characters.');
        return false;
      }
      if (fields.price === undefined || fields.price === '' || Number(fields.price) < 0) {
        showToast('Sale Rate must be a valid number.');
        return false;
      }
    }
    return true;
  };

  const handleSave = (fields, skipDuplicateCheck = false) => {
    if (!validate(fields, skipDuplicateCheck)) return false;

    if (activeTab === 'main-group') {
      posApi.saveProductGroup({
        id: modal.isEdit ? fields.id : undefined,
        product_group_name: fields.name,
        name: fields.name
      }).then(() => {
        showToast(modal.isEdit ? 'Main Group updated in PostgreSQL.' : 'Main Group created in PostgreSQL.');
        fetchMenuData();
        setModal({ open: false, isEdit: false, fields: {} });
      }).catch(err => {
        showToast(err?.response?.data?.message || 'Failed to save Main Group');
      });
    } else if (activeTab === 'item-group') {
      posApi.saveCategory({
        id: modal.isEdit ? fields.id : undefined,
        category_name: fields.name,
        name: fields.name
      }).then(() => {
        showToast(modal.isEdit ? 'Item Group updated in PostgreSQL.' : 'Item Group created in PostgreSQL.');
        fetchMenuData();
        setModal({ open: false, isEdit: false, fields: {} });
      }).catch(err => {
        showToast(err?.response?.data?.message || 'Failed to save Item Group');
      });
    } else if (activeTab === 'menu-item') {
      posApi.saveMenuItem({
        ...(modal.isEdit && { id: fields.id || fields.item_id, item_id: fields.id || fields.item_id }),
        title: fields.name,
        name: fields.name,
        price: Number(fields.price || 0),
        sale_price: Number(fields.price || 0),
        food_type: fields.category || 'Veg',
        inventory_type: 'RECIPE'
      }).then(() => {
        showToast(modal.isEdit ? 'Menu item updated in PostgreSQL.' : 'Menu item created in PostgreSQL.');
        fetchMenuData();
        setModal({ open: false, isEdit: false, fields: {} });
      }).catch(err => {
        showToast(err?.response?.data?.message || 'Failed to save menu item');
      });
    }

    setDuplicateConfirm({ open: false, fields: null, duplicateItem: null });
    return true;
  };

  const handleDelete = () => {
    if (!deleteModal.row) return;

    if (activeTab === 'main-group') {
      posApi.deleteProductGroup(deleteModal.row.id).then(() => {
        showToast('Main Group deleted in PostgreSQL.');
        fetchMenuData();
        setDeleteModal({ open: false, row: null });
      }).catch(err => {
        showToast(err?.response?.data?.message || 'Failed to delete Main Group');
      });
    } else if (activeTab === 'item-group') {
      posApi.deleteCategory(deleteModal.row.id).then(() => {
        showToast('Item Group deactivated in PostgreSQL.');
        fetchMenuData();
        setDeleteModal({ open: false, row: null });
      }).catch(err => {
        showToast(err?.response?.data?.message || 'Failed to delete Item Group');
      });
    } else if (activeTab === 'menu-item') {
      posApi.deleteMenuItem(deleteModal.row.id).then(() => {
        showToast('Menu Item deactivated in PostgreSQL.');
        fetchMenuData();
        setDeleteModal({ open: false, row: null });
      }).catch(err => {
        showToast(err?.response?.data?.message || 'Failed to delete Menu Item');
      });
    }
  };

  return {
    data: filteredData,
    loading,
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

export default useItemMenu;
