import { useState, useEffect, useMemo, useCallback } from 'react';
import posApi from '../../../../api/posApi';

export const useItemMenu = (activeTab, showToast) => {
  const [mainGroups, setMainGroups] = useState([]);
  const [itemGroups, setItemGroups] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [outlets, setOutlets] = useState([]);
  const [taxCategories, setTaxCategories] = useState([]);

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
      posApi.getMenuItems(),
      posApi.getOutlets(),
      posApi.getItemTaxCategories()
    ]).then(([pgRes, catRes, menuRes, outletsRes, taxesRes]) => {
      const groups = Array.isArray(pgRes?.data?.productGroups) ? pgRes.data.productGroups : (Array.isArray(pgRes?.data) ? pgRes.data : []);
      const categories = Array.isArray(catRes?.data?.categories) ? catRes.data.categories : (Array.isArray(catRes?.data) ? catRes.data : []);
      const items = Array.isArray(menuRes?.data?.menuItems) ? menuRes.data.menuItems : (Array.isArray(menuRes?.data) ? menuRes.data : []);
      const stores = Array.isArray(outletsRes?.data) ? outletsRes.data : (Array.isArray(outletsRes) ? outletsRes : []);
      const taxes = Array.isArray(taxesRes?.data) ? taxesRes.data : [];

      const mappedOutlets = stores.map((s, idx) => ({
        id: s.id,
        store_id: s.store_id || `STORE_${s.id || idx + 1}`,
        name: s.store_name || s.name || `Outlet ${s.id || idx + 1}`
      }));
      setOutlets(mappedOutlets);
      
      const mappedTaxes = taxes.map((t, idx) => ({
        id: t.id || idx + 1,
        name: t.name || 'GST Category',
        percentage: t.percentage || 5
      }));
      setTaxCategories(mappedTaxes);

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

      const mappedMenuItems = items.map((m, idx) => {
        const itemStoreId = m.store_id || (mappedOutlets.length > 0 ? mappedOutlets[0].store_id : 'STORE_1');
        const outletObj = mappedOutlets.find(o => String(o.store_id) === String(itemStoreId));
        return {
          id: m.id || m.item_id || idx + 1,
          name: m.name || m.title || `Menu Item ${idx + 1}`,
          dispCode: m.short_code || String(m.id || idx + 100),
          itemGroup: m.category || 'General',
          mainGroup: 'Food',
          unitType: 'Plate',
          outlet: itemStoreId,
          outletName: outletObj ? outletObj.name : 'Main Restaurant',
          price: Number(m.price || m.sale_price || 0),
          category: m.foodType || 'Veg',
          rateEdit: m.is_open_item === 1 ? 'Yes' : 'No',
          discApp: 'Yes',
          kitchen: 'Main Kitchen',
          status: m.active !== 0 ? 'Active' : 'Inactive',
          hsnCode: '2106',
          taxCategory: m.tax_name || 'Default 5%'
        };
      });

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
      const matchedCat = itemGroups.find(c => c.name === fields.itemGroup);
      const matchedTax = taxCategories.find(t => t.name === fields.taxCategory);
      const taxName = matchedTax ? matchedTax.name : 'Default 5%';
      const taxPer = matchedTax ? Number(matchedTax.percentage) : 5;

      posApi.saveMenuItem({
        ...fields,
        id: fields.id,
        name: fields.name,
        price: Number(fields.price || 0),
        sale_price: Number(fields.price || 0),
        food_type: fields.category || 'Veg',
        inventory_type: 'RECIPE',
        store_id: fields.outlet || 'STORE_1',
        short_code: fields.dispCode || '',
        is_open_item: fields.rateEdit === 'Yes' ? 1 : 0,
        open_price: fields.rateEdit === 'Yes' ? 1 : 0,
        category_ref_ids: matchedCat ? matchedCat.id : undefined,
        kitchen_dept: fields.kitchen === 'Main Kitchen' ? 1 : (fields.kitchen === 'Bar Kitchen' ? 2 : (fields.kitchen === 'Chinese Kitchen' ? 3 : 4)),
        tax_name: taxName,
        tax_per: taxPer
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
    handleDelete,
    outlets,
    taxCategories
  };
};

export default useItemMenu;
