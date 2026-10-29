import React, { useCallback, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LuUpload } from 'react-icons/lu';
import {
  FaCloudUploadAlt, FaDownload, FaCheckCircle, FaExclamationTriangle,
  FaFileExcel, FaFileCsv, FaUtensils, FaListAlt, FaLayerGroup, FaRedoAlt, FaArrowRight
} from 'react-icons/fa';
import PageHeader from '../../../../../components/common/PageHeader';
import posApi from '../../../../../api/posApi';
import { parseExcelOrCsvFile, downloadSampleTemplate, getRowFieldValue } from '../../../../../utils/excelImportUtils';
import CommonModal from '../../../../../components/common/CommonModal';
import useOutletFilter from '../../../../../hooks/useOutletFilter';
import { SAMPLE_MENU_ROWS } from '../MenuItemEntry/SpreadsheetMenuGrid';

const ItemEnterPage = ({ showToast, isModal = false, onClose, onSuccess }) => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [parsedRows, setParsedRows] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [parseError, setParseError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [dbCategories, setDbCategories] = useState([]);
  const [dbMenuItems, setDbMenuItems] = useState([]);
  const [dbItemGroups, setDbItemGroups] = useState([]);
  const [dbMainGroups, setDbMainGroups] = useState([]);
  const [filterTab, setFilterTab] = useState('ALL');

  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedOutlets, setSelectedOutlets] = useState([]);
  const [pendingFile, setPendingFile] = useState(null);
  const { outlets } = useOutletFilter();

  useEffect(() => {
    if (outlets.length > 0 && selectedOutlets.length === 0) {
      setSelectedOutlets([outlets[0].store_id]);
    }
  }, [outlets]);

  const handleToggleOutlet = (storeId) => {
    setSelectedOutlets((prev) => {
      if (prev.includes(storeId)) {
        return prev.filter((id) => id !== storeId);
      } else {
        return [...prev, storeId];
      }
    });
  };

  const handleToggleSelectAllOutlets = () => {
    if (selectedOutlets.length === outlets.length) {
      setSelectedOutlets([]);
    } else {
      setSelectedOutlets(outlets.map((o) => o.store_id));
    }
  };

  const toastTrigger = useCallback((msg) => {
    if (showToast) showToast(msg);
    else if (window.showToast) window.showToast(msg);
  }, [showToast]);

  // Load real categories, menu items, and groups from PostgreSQL on mount
  useEffect(() => {
    const extractArray = (res, key) => {
      if (Array.isArray(res)) return res;
      if (res && Array.isArray(res[key])) return res[key];
      if (res && Array.isArray(res.data)) return res.data;
      if (res && res.data && Array.isArray(res.data[key])) return res.data[key];
      return [];
    };

    Promise.allSettled([
      posApi.getCategories(),
      posApi.getMenuItems(),
      posApi.getProductGroups()
    ]).then(([catResult, menuResult, groupResult]) => {
      const catRes = catResult.status === 'fulfilled' ? catResult.value : null;
      const menuRes = menuResult.status === 'fulfilled' ? menuResult.value : null;
      const groupRes = groupResult.status === 'fulfilled' ? groupResult.value : null;

      const catList = extractArray(catRes, 'categories');
      const itemList = extractArray(menuRes, 'menuItems');
      const groupList = extractArray(groupRes, 'productGroups');

      setDbCategories(catList.map((c) => c.name || c.category_name || c.title).filter(Boolean));
      setDbMenuItems(itemList);
      setDbItemGroups(catList.map((c) => c.name || c.category_name).filter(Boolean));
      setDbMainGroups(groupList.map((g) => g.name || g.product_group_name).filter(Boolean));
    });
  }, []);

  // Complete sample generator containing POS Menu Item fields with both variant and non-variant items
  const getDynamicSampleData = () => {
    return [
      {
        ItemName: 'Classic Momos',
        VariantName: 'HALF',
        ServingQty: '4 PC',
        SaleRate: 49,
        ItemCategory: 'Veg',
        ItemGroup: 'Steam Momos',
        MainGroup: 'Food',
        DispCode: 'MOM-01',
        UnitType: 'Plate',
        Outlet: 'Main Restaurant',
        Kitchen: 'Main Kitchen',
        RateEdit: 'No',
        DiscApp: 'Yes',
        Status: 'Active',
        HsnCode: '2106'
      },
      {
        ItemName: 'Classic Momos',
        VariantName: 'FULL',
        ServingQty: '8 PC',
        SaleRate: 99,
        ItemCategory: 'Veg',
        ItemGroup: 'Steam Momos',
        MainGroup: 'Food',
        DispCode: 'MOM-01',
        UnitType: 'Plate',
        Outlet: 'Main Restaurant',
        Kitchen: 'Main Kitchen',
        RateEdit: 'No',
        DiscApp: 'Yes',
        Status: 'Active',
        HsnCode: '2106'
      },
      {
        ItemName: 'Paneer Butter Masala',
        VariantName: '',
        ServingQty: '',
        SaleRate: 260,
        ItemCategory: dbCategories[0] || 'Veg',
        ItemGroup: dbItemGroups[0] || 'Main Course',
        MainGroup: dbMainGroups[0] || 'Food',
        DispCode: '101',
        UnitType: 'Plate',
        Outlet: 'Main Restaurant',
        Kitchen: 'Main Kitchen',
        RateEdit: 'No',
        DiscApp: 'Yes',
        Status: 'Active',
        HsnCode: '2106'
      },
      {
        ItemName: 'Margherita Pizza',
        VariantName: '',
        ServingQty: '',
        SaleRate: 139,
        ItemCategory: 'Veg',
        ItemGroup: 'Pizza & Bakes',
        MainGroup: 'Food',
        DispCode: 'PIZ-01',
        UnitType: 'Plate',
        Outlet: 'Main Restaurant',
        Kitchen: 'Main Kitchen',
        RateEdit: 'No',
        DiscApp: 'Yes',
        Status: 'Active',
        HsnCode: '2106'
      },
      {
        ItemName: 'Chicken Biryani Special',
        VariantName: '',
        ServingQty: '',
        SaleRate: 380,
        ItemCategory: 'Non-Veg',
        ItemGroup: 'Biryani',
        MainGroup: 'Food',
        DispCode: '102',
        UnitType: 'Plate',
        Outlet: 'Main Restaurant',
        Kitchen: 'Main Kitchen',
        RateEdit: 'No',
        DiscApp: 'Yes',
        Status: 'Active',
        HsnCode: '2106'
      }
    ];
  };

  const handleDownloadSample = (format) => {
    const sampleData = getDynamicSampleData();
    downloadSampleTemplate(sampleData, 'ALFA_POS_Menu_Item_Full_Fields_Template', format);
    toastTrigger(`Downloaded Complete Sample ${format.toUpperCase()} Template (All Software Fields Included)`);
  };

  const preprocessMenuRows = (rawRows) => {
    const expanded = [];
    let currentCategory = 'Steam Momos';
    let currentGroup = 'Steam Momos';

    rawRows.forEach((row) => {
      const rowKeys = Object.keys(row || {});

      // 1. Resolve raw name
      let rawName = String(getRowFieldValue(row, ['ItemName', 'Name', 'item_name', 'Item Name', 'Title', 'title', 'ITEM NAME', 'ITEM_NAME', 'Item', 'item', 'DESCRIPTION', 'Description', 'Particulars', 'particulars', 'Menu Item', 'menu item'])).trim();

      // If no name found via standard headers, find the first non-numeric string value in row
      if (!rawName) {
        for (const k of rowKeys) {
          const val = String(row[k] || '').trim();
          if (val && isNaN(Number(val)) && !['true', 'false', 'veg', 'non-veg', 'nonveg', 'active', 'plate', 'pcs'].includes(val.toLowerCase())) {
            rawName = val;
            break;
          }
        }
      }

      if (!rawName) return;

      // Filter out non-item rows (e.g. Remark, Note, Header lines, S.No, Total)
      const lowerName = rawName.toLowerCase();
      if (['remark', 'remarks', 'note', 'notes', 'instruction', 'instructions', 'sl no', 's.no', 'sr no', 'sr.no', 'serial no', 'total', 'grand total', 'sub total', 'price', 'rate'].includes(lowerName)) {
        return;
      }

      // Check explicit Category in row if present
      const explicitCat = getRowFieldValue(row, ['Category', 'category', 'ItemGroup', 'itemgroup', 'ItemCategory', 'item_category', 'Food Category', 'food_category']);
      if (explicitCat && typeof explicitCat === 'string' && explicitCat.trim() !== '') {
        currentCategory = explicitCat.trim();
        currentGroup = explicitCat.trim();
      }

      // 2. Check for Horizontal Variant columns (Half / Full or 4 PC / 8 PC)
      let halfVal = getRowFieldValue(row, ['HalfPrice', 'Half Price', 'halfprice', 'half_price', 'Half', 'half', '4 Pc', '4Pc', '4PC', '4 pc', 'Half (4PC)', 'Half (4 Pc)', 'HALF', '4 Piece', '4 Pieces', 'Half 4PC']);
      let fullVal = getRowFieldValue(row, ['FullPrice', 'Full Price', 'fullprice', 'full_price', 'Full', 'full', '8 Pc', '8Pc', '8PC', '8 pc', 'Full (8PC)', 'Full (8 Pc)', 'FULL', '8 Piece', '8 Pieces', 'Full 8PC']);

      if (!halfVal) {
        const matchedHalfKey = rowKeys.find(k => {
          const cl = k.toLowerCase().replace(/[^a-z0-9]/g, '');
          return (cl.includes('half') || cl.includes('4pc') || cl.includes('4piece')) && !cl.includes('full') && !cl.includes('8pc');
        });
        if (matchedHalfKey && row[matchedHalfKey] !== undefined && row[matchedHalfKey] !== '') {
          halfVal = row[matchedHalfKey];
        }
      }

      if (!fullVal) {
        const matchedFullKey = rowKeys.find(k => {
          const cl = k.toLowerCase().replace(/[^a-z0-9]/g, '');
          return (cl.includes('full') || cl.includes('8pc') || cl.includes('8piece')) && !cl.includes('half') && !cl.includes('4pc');
        });
        if (matchedFullKey && row[matchedFullKey] !== undefined && row[matchedFullKey] !== '') {
          fullVal = row[matchedFullKey];
        }
      }

      // Check if price is embedded in description e.g. "Add-on pricing: 4 Pc +₹29; 8 Pc +₹39"
      const rawDesc = String(getRowFieldValue(row, ['Description', 'description', 'Serving', 'serving', 'Remarks', 'remarks']) || '');
      if (!halfVal && /4\s*pc[^\d]*(\d+)/i.test(rawDesc)) {
        const m = rawDesc.match(/4\s*pc[^\d]*(\d+)/i);
        if (m) halfVal = m[1];
      }
      if (!fullVal && /8\s*pc[^\d]*(\d+)/i.test(rawDesc)) {
        const m = rawDesc.match(/8\s*pc[^\d]*(\d+)/i);
        if (m) fullVal = m[1];
      }

      // Collect all numeric columns present in this row
      const numericColumns = [];
      rowKeys.forEach(k => {
        const val = row[k];
        const num = parseFloat(String(val).replace(/[^0-9.]/g, ''));
        if (!isNaN(num) && num > 0 && num < 10000) {
          numericColumns.push({ key: k, val: num });
        }
      });

      // If half/full was not explicitly mapped but row has two positive prices (e.g. 49 and 99)
      if (!halfVal && !fullVal && numericColumns.length === 2) {
        halfVal = Math.min(numericColumns[0].val, numericColumns[1].val);
        fullVal = Math.max(numericColumns[0].val, numericColumns[1].val);
      }

      // Detect section banner rows (e.g. "Steam Momos", "Toppings", "Momo Platter", "Pizza & Bakes", "Chinese")
      const isKnownCategoryBanner = ['steam momos', 'momos', 'toppings', 'momo platter', 'platter', 'pizza', 'pizza & bakes', 'chinese', 'cold coffee', 'beverages', 'burger', 'shakes', 'mocktails', 'fries', 'dessert', 'main course', 'starters', 'rolls'].some(cat => lowerName.includes(cat));

      if (isKnownCategoryBanner && numericColumns.length === 0 && !halfVal && !fullVal) {
        currentCategory = rawName;
        currentGroup = rawName;
        return; // Skip section banner row from item list
      }

      const smallVal = getRowFieldValue(row, ['Small', 'small', 'Small Price', 'small_price', 'Regular', 'regular']);
      const medVal = getRowFieldValue(row, ['Medium', 'medium', 'Medium Price', 'medium_price']);
      const largeVal = getRowFieldValue(row, ['Large', 'large', 'Large Price', 'large_price']);

      const existingVariant = String(getRowFieldValue(row, ['VariantName', 'Variant', 'variant', 'variant_name', 'Size', 'size', 'Portion', 'portion', 'PORTION', 'VARIANT', 'Variant Name'])).trim();

      // 2b. Check if already a multi-row variant
      if (existingVariant) {
        const variantServing = String(getRowFieldValue(row, ['ServingQty', 'Serving', 'serving', 'serving_qty', 'Serving Quantity', 'Pieces', 'pieces', 'PC', 'pc', 'Description', 'description', 'Serving Qty'])).trim();
        const variantPrice = getRowFieldValue(row, ['SaleRate', 'salerate', 'sale_rate', 'Price', 'price', 'Rate', 'rate', 'Cost', 'cost', 'Amount', 'amount', 'SALE RATE', 'RATE', 'PRICE', 'MRP', 'mrp', 'VariantPrice', 'Variant Price', 'PortionPrice', 'Portion Price', 'Variant Rate', 'VariantRate']);
        expanded.push({
          ...row,
          ItemName: rawName,
          VariantName: existingVariant,
          ServingQty: variantServing,
          SaleRate: variantPrice,
          Category: row.Category || currentCategory,
          ItemGroup: row.ItemGroup || currentGroup
        });
        return;
      }

      // If horizontal Half / Full columns are present
      const cleanHalf = String(halfVal || '').replace(/[^0-9.]/g, '');
      const cleanFull = String(fullVal || '').replace(/[^0-9.]/g, '');
      const hasHalf = cleanHalf !== '' && !isNaN(parseFloat(cleanHalf)) && parseFloat(cleanHalf) > 0;
      const hasFull = cleanFull !== '' && !isNaN(parseFloat(cleanFull)) && parseFloat(cleanFull) > 0;

      if (hasHalf || hasFull) {
        if (hasHalf) {
          expanded.push({
            ...row,
            ItemName: rawName,
            VariantName: 'HALF',
            ServingQty: '4 PC',
            SaleRate: parseFloat(cleanHalf),
            Category: row.Category || currentCategory,
            ItemGroup: row.ItemGroup || currentGroup
          });
        }
        if (hasFull) {
          expanded.push({
            ...row,
            ItemName: rawName,
            VariantName: 'FULL',
            ServingQty: '8 PC',
            SaleRate: parseFloat(cleanFull),
            Category: row.Category || currentCategory,
            ItemGroup: row.ItemGroup || currentGroup
          });
        }
        return;
      }

      // If horizontal Small / Med / Large columns are present
      if (smallVal || medVal || largeVal) {
        if (smallVal && Number(String(smallVal).replace(/[^0-9.]/g, '')) > 0) expanded.push({ ...row, ItemName: rawName, VariantName: 'Small', SaleRate: smallVal, Category: row.Category || currentCategory, ItemGroup: row.ItemGroup || currentGroup });
        if (medVal && Number(String(medVal).replace(/[^0-9.]/g, '')) > 0) expanded.push({ ...row, ItemName: rawName, VariantName: 'Medium', SaleRate: medVal, Category: row.Category || currentCategory, ItemGroup: row.ItemGroup || currentGroup });
        if (largeVal && Number(String(largeVal).replace(/[^0-9.]/g, '')) > 0) expanded.push({ ...row, ItemName: rawName, VariantName: 'Large', SaleRate: largeVal, Category: row.Category || currentCategory, ItemGroup: row.ItemGroup || currentGroup });
        return;
      }

      // Check flat rate price for non-variant item
      let flatPrice = getRowFieldValue(row, ['SaleRate', 'salerate', 'sale_rate', 'Price', 'price', 'Rate', 'rate', 'Cost', 'cost', 'Amount', 'amount', 'SALE RATE', 'RATE', 'PRICE', 'MRP', 'mrp']);
      if (!flatPrice) {
        const priceKey = rowKeys.find(k => {
          const cl = k.toLowerCase().replace(/[^a-z0-9]/g, '');
          return cl === 'price' || cl === 'rate' || cl === 'salerate' || cl === 'mrp' || cl === 'amount' || cl === 'cost';
        });
        if (priceKey && row[priceKey] !== undefined && row[priceKey] !== '') {
          flatPrice = row[priceKey];
        }
      }

      if (!flatPrice && numericColumns.length === 1) {
        flatPrice = numericColumns[0].val;
      }

      const cleanFlat = String(flatPrice || '').replace(/[^0-9.]/g, '');

      // Regular item with flat price (or empty for validation to catch)
      expanded.push({
        ...row,
        ItemName: rawName,
        VariantName: '',
        ServingQty: '',
        SaleRate: cleanFlat !== '' ? parseFloat(cleanFlat) : (flatPrice !== undefined ? flatPrice : ''),
        Category: row.Category || currentCategory,
        ItemGroup: row.ItemGroup || currentGroup
      });
    });
    return expanded;
  };

  const handleFileSelect = async (file) => {
    if (!file) return;

    const lowerName = file.name.toLowerCase();
    if (!lowerName.endsWith('.csv') && !lowerName.endsWith('.xlsx') && !lowerName.endsWith('.xls')) {
      toastTrigger('Please select a valid .xlsx, .xls, or .csv file');
      setParseError('Unsupported file format. Please upload .xlsx, .xls, or .csv');
      return;
    }

    setSelectedFile(file);
    setParseError('');

    try {
      const result = await parseExcelOrCsvFile(
        file,
        [['ItemName', 'Name', 'item_name', 'Item Name', 'Title', 'title', 'ITEM NAME', 'ITEM_NAME', 'Item', 'item', 'DESCRIPTION', 'Description', 'Particulars', 'particulars', 'Menu Item', 'menu item']], // Flexible header matching
        (row, index, seenKeys) => {
          const rawName = String(getRowFieldValue(row, ['ItemName', 'Name', 'item_name', 'Item Name', 'Title', 'title', 'ITEM NAME', 'ITEM_NAME', 'Item', 'item', 'DESCRIPTION', 'Description', 'Particulars', 'particulars', 'Menu Item', 'menu item'])).trim();
          const rawPrice = getRowFieldValue(row, ['SaleRate', 'salerate', 'sale_rate', 'Price', 'price', 'Rate', 'rate', 'Cost', 'cost', 'Amount', 'amount', 'SALE RATE', 'RATE', 'PRICE', 'MRP', 'mrp', 'VariantPrice', 'Variant Price', 'PortionPrice', 'Portion Price', 'Variant Rate', 'VariantRate']);
          const rawCategory = getRowFieldValue(row, ['ItemCategory', 'itemcategory', 'item_category', 'Category', 'category', 'FoodType', 'food_type', 'Type', 'type', 'ITEM CATEGORY', 'CATEGORY', 'Food Type', 'food type']);
          const rawVariant = String(getRowFieldValue(row, ['VariantName', 'Variant', 'variant', 'variant_name', 'Size', 'size', 'Portion', 'portion', 'PORTION', 'VARIANT', 'Variant Name'])).trim();
          const rawServing = String(getRowFieldValue(row, ['ServingQty', 'Serving', 'serving', 'serving_qty', 'Serving Quantity', 'Pieces', 'pieces', 'PC', 'pc', 'Description', 'description', 'Serving Qty'])).trim();

          if (!rawName) {
            return { isValid: false, errorReason: 'Missing Item Name' };
          }

          const cleanPriceStr = String(rawPrice || '').replace(/[^0-9.]/g, '');
          const priceNum = parseFloat(cleanPriceStr);

          // Validation for non-variant items: must have a valid positive price
          if (!rawVariant && (rawPrice === '' || rawPrice === undefined || rawPrice === null || isNaN(priceNum) || priceNum <= 0)) {
            return { isValid: false, errorReason: 'Sale Rate must be greater than ₹0' };
          }

          // Validation for variant items: must have a valid positive variant price
          if (rawVariant && (rawPrice === '' || rawPrice === undefined || rawPrice === null || isNaN(priceNum) || priceNum <= 0)) {
            return { isValid: false, errorReason: `Missing or zero price for variant "${rawVariant}"` };
          }

          const itemKey = rawName.toLowerCase();
          const variantKey = rawVariant.toLowerCase();
          const comboKey = variantKey ? `${itemKey}__${variantKey}` : itemKey;

          if (seenKeys.has(comboKey)) {
            return {
              isValid: false,
              errorReason: variantKey
                ? `Duplicate variant "${rawVariant}" for item "${rawName}"`
                : `Duplicate item name "${rawName}" in file`
            };
          }
          seenKeys.add(comboKey);

          // Map all fields from software schema
          row.__resolvedName = rawName;
          row.__resolvedVariant = rawVariant;
          row.__resolvedServing = rawServing;
          row.__resolvedPrice = isNaN(priceNum) ? 0 : priceNum;
          row.__resolvedCategory = rawCategory || dbCategories[0] || 'Veg';
          row.__resolvedGroup = getRowFieldValue(row, ['ItemGroup', 'itemgroup', 'item_group', 'Group', 'group', 'ITEM GROUP', 'Category', 'category']) || 'General';
          row.__resolvedMainGroup = getRowFieldValue(row, ['MainGroup', 'maingroup', 'main_group', 'MAIN GROUP']) || 'Food';
          row.__resolvedDispCode = getRowFieldValue(row, ['DispCode', 'dispcode', 'disp_code', 'Code', 'code', 'CODE', 'ShortCode', 'short_code']) || String(100 + index);
          row.__resolvedUnitType = getRowFieldValue(row, ['UnitType', 'unittype', 'unit_type', 'Unit', 'unit', 'UOM', 'uom', 'UNIT']) || 'Plate';

          const targetOutletId = (selectedOutlets && selectedOutlets.length > 0) ? selectedOutlets[0] : null;
          const selectedOutletObj = outlets.find(o => String(o.store_id) === String(targetOutletId));
          const fileOutlet = getRowFieldValue(row, ['Outlet', 'outlet', 'OutletName', 'outlet_name', 'Store', 'store']);
          row.__resolvedOutlet = fileOutlet || (selectedOutletObj ? (selectedOutletObj.store_name || selectedOutletObj.name) : 'Main Restaurant');
          row.__resolvedKitchen = getRowFieldValue(row, ['Kitchen', 'kitchen', 'KITCHEN']) || 'Main Kitchen';
          row.__resolvedRateEdit = getRowFieldValue(row, ['RateEdit', 'rateedit', 'rate_edit']) || 'No';
          row.__resolvedDiscApp = getRowFieldValue(row, ['DiscApp', 'discapp', 'disc_app']) || 'Yes';
          row.__resolvedStatus = getRowFieldValue(row, ['Status', 'status', 'Active', 'active']) || 'Active';
          row.__resolvedHsnCode = getRowFieldValue(row, ['HsnCode', 'hsncode', 'hsn_code', 'HSN', 'hsn']) || '2106';

          return { isValid: true, errorReason: 'Valid' };
        },
        preprocessMenuRows
      );

      setParsedRows(result.allRows);
      toastTrigger(`Parsed ${file.name}: ${result.validCount} valid, ${result.invalidCount} invalid rows.`);
    } catch (err) {
      console.error('POS Item parse error:', err);
      setParseError(err.message);
      toastTrigger(`Import Error: ${err.message}`);
      setParsedRows([]);
    }
  };

  const handleLoadSampleMenu = () => {
    try {
      const rawSample = (SAMPLE_MENU_ROWS || []).map(r => ({
        ItemName: r.itemName,
        ItemCategory: r.foodType || 'Veg',
        ItemGroup: r.category || 'Steam Momos',
        Category: r.category || 'Steam Momos',
        HalfPrice: r.halfPrice || '',
        FullPrice: r.fullPrice || '',
        SaleRate: r.price || '',
        Description: r.description || ''
      }));

      const expanded = preprocessMenuRows(rawSample);
      const seenKeys = new Set();
      const processed = expanded.map((row, index) => {
        const itemKey = (row.ItemName || '').toLowerCase();
        const variantKey = (row.VariantName || '').toLowerCase();
        const comboKey = variantKey ? `${itemKey}__${variantKey}` : itemKey;
        seenKeys.add(comboKey);

        const cleanPrice = parseFloat(String(row.SaleRate || '').replace(/[^0-9.]/g, '')) || 0;
        row.__resolvedName = row.ItemName;
        row.__resolvedVariant = row.VariantName || '';
        row.__resolvedServing = row.ServingQty || '';
        row.__resolvedPrice = cleanPrice;
        row.__resolvedCategory = row.ItemCategory || 'Veg';
        row.__resolvedGroup = row.ItemGroup || 'Steam Momos';
        row.__resolvedMainGroup = 'Food';
        row.__resolvedDispCode = `MOM-${String(100 + index)}`;
        row.__resolvedUnitType = 'Plate';
        row.__resolvedOutlet = (outlets[0]?.store_name || outlets[0]?.name) || 'Main Restaurant';
        row.__resolvedKitchen = 'Main Kitchen';
        row.__resolvedRateEdit = 'No';
        row.__resolvedDiscApp = 'Yes';
        row.__resolvedStatus = 'Active';
        row.__resolvedHsnCode = '2106';

        return {
          ...row,
          __rowIndex: index + 2,
          __isValid: cleanPrice > 0,
          __errorReason: cleanPrice > 0 ? 'Valid' : 'Zero price'
        };
      });

      setParsedRows(processed);
      setSelectedFile({ name: 'Momo_Bars_Full_Standard_Menu.xlsx' });
      setParseError('');
      toastTrigger(`⚡ Loaded ${processed.length} menu items with exact Half & Full variants and prices! Click "Upload to Database" to import.`);
    } catch (err) {
      console.error('Error loading sample menu:', err);
      toastTrigger(`Failed to load menu: ${err.message}`);
    }
  };

  const validCount = parsedRows.filter((r) => r.__isValid !== false).length;
  const invalidCount = parsedRows.length - validCount;

  const displayRows = parsedRows.filter((r) => {
    if (filterTab === 'VALID') return r.__isValid !== false;
    if (filterTab === 'INVALID') return r.__isValid === false;
    return true;
  });

  const handleDropzoneClick = (e) => {
    if (e.target.id === 'posItemFileInputPage') return;
    e.preventDefault();
    if (outlets.length > 0 && selectedOutlets.length === 0) {
      setSelectedOutlets([outlets[0].store_id]);
    }
    setUploadModalOpen(true);
  };

  const handleUploadConfirm = () => {
    if (selectedOutlets.length === 0) {
      toastTrigger('Please select at least one outlet.');
      return;
    }
    setUploadModalOpen(false);
    if (pendingFile) {
      handleFileSelect(pendingFile);
      setPendingFile(null);
    } else {
      document.getElementById('posItemFileInputPage').click();
    }
  };

  const handleUploadToDb = () => {
    const validRows = parsedRows.filter((r) => r.__isValid !== false);
    if (validRows.length === 0) {
      toastTrigger('No valid items ready for bulk import.');
      return;
    }

    setUploading(true);

    const targetOutletsList = selectedOutlets.length > 0
      ? selectedOutlets
      : (outlets.length > 0 ? [outlets[0].store_id] : ['STORE_1']);

    const payload = [];
    targetOutletsList.forEach((outletId) => {
      const matched = outlets.find((o) => String(o.store_id) === String(outletId));
      const outletName = matched?.name || outletId;

      // Group validRows by lowercase item name for this outlet so variants merge into a single item
      const itemMap = new Map();

      validRows.forEach((r, rIdx) => {
        const itemKey = (r.__resolvedName || '').trim().toLowerCase();
        if (!itemMap.has(itemKey)) {
          itemMap.set(itemKey, {
            name: r.__resolvedName,
            price: r.__resolvedPrice,
            type: r.__resolvedCategory,
            dispCode: r.__resolvedDispCode,
            itemGroup: r.__resolvedGroup,
            mainGroup: r.__resolvedMainGroup,
            unitType: r.__resolvedUnitType,
            outlet: outletName,
            store_id: outletId,
            kitchen: r.__resolvedKitchen,
            rateEdit: r.__resolvedRateEdit,
            discApp: r.__resolvedDiscApp,
            status: r.__resolvedStatus,
            hsnCode: r.__resolvedHsnCode,
            variants: []
          });
        }

        const parentItem = itemMap.get(itemKey);
        if (r.__resolvedVariant) {
          parentItem.variants.push({
            id: `v_${Date.now()}_${rIdx}_${Math.random().toString(36).substr(2, 5)}`,
            name: r.__resolvedVariant,
            serving: r.__resolvedServing || '',
            description: r.__resolvedServing || '',
            price: r.__resolvedPrice,
            code: r.__resolvedDispCode || '',
            active: true
          });
        }
      });

      // Ensure base price is valid for variant items
      itemMap.forEach((itemObj) => {
        if (itemObj.variants.length > 0 && (!itemObj.price || itemObj.price <= 0)) {
          itemObj.price = itemObj.variants[0].price;
        }
        payload.push(itemObj);
      });
    });

    posApi.uploadItemsCsv(payload)
      .then((res) => {
        toastTrigger(res?.data?.message || `Successfully imported ${payload.length} menu items into PostgreSQL across ${targetOutletsList.length} outlet(s)!`);
        setSelectedFile(null);
        setParsedRows([]);
        if (typeof onSuccess === 'function') onSuccess();
        if (isModal && typeof onClose === 'function') onClose();
        if (!isModal) {
          navigate('/pos/master/item-menu/menu-item');
        }
      })
      .catch((err) => {
        toastTrigger(err?.response?.data?.message || 'Failed to upload items to PostgreSQL');
      })
      .finally(() => setUploading(false));
  };

  const handleReset = () => {
    setSelectedFile(null);
    setParsedRows([]);
    setParseError('');
    setFilterTab('ALL');
  };

  return (
    <div style={{ padding: isModal ? '8px 4px' : '24px 32px', backgroundColor: isModal ? '#ffffff' : '#F8FAFC', minHeight: isModal ? 'auto' : '100vh', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Header */}
      {!isModal && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <PageHeader
            title="POS Item Menu Bulk Import (Full Software Field Mapping)"
            breadcrumbs={['Dashboard', 'Point Of Sale', 'Master', 'Item Menu', 'CSV Bulk Upload']}
            style={{ marginBottom: 0 }}
          />
          <button
            type="button"
            onClick={() => navigate('/pos/master/item-menu/menu-item')}
            style={{
              padding: '9px 18px',
              backgroundColor: '#ffffff',
              border: '1.5px solid #cbd5e1',
              borderRadius: '8px',
              color: '#334155',
              fontSize: '0.82rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#f1f5f9'; e.currentTarget.style.borderColor = '#94a3b8'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#ffffff'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
          >
            ← Back to Menu Item Entry
          </button>
        </div>
      )}

      {/* Main Container Card */}
      <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)', padding: '28px' }}>

        {/* Step Indicator & Header Info */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          {/* Step 1 Card */}
          <div style={{ background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)', border: '1px solid #a7f3d0', borderRadius: '12px', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ background: '#059669', color: '#fff', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem' }}>1</div>
              <h3 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, color: '#065f46' }}>Download Complete Template</h3>
            </div>
            <p style={{ margin: 0, fontSize: '0.78rem', color: '#047857' }}>
              Includes 100% of software fields (ItemName, SaleRate, Category, Group, DispCode, Outlet, Kitchen, etc.).
            </p>
            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
              <button
                type="button"
                onClick={() => handleDownloadSample('xlsx')}
                style={{ flex: 1, padding: '7px 12px', background: '#047857', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', boxShadow: '0 2px 4px rgba(0,0,0,0.08)' }}
              >
                <FaFileExcel size={13} /> Excel (.xlsx)
              </button>
              <button
                type="button"
                onClick={() => handleDownloadSample('csv')}
                style={{ flex: 1, padding: '7px 12px', background: '#0d9488', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', boxShadow: '0 2px 4px rgba(0,0,0,0.08)' }}
              >
                <FaFileCsv size={13} /> CSV (.csv)
              </button>
            </div>
          </div>

          {/* Step 2 Card */}
          <div style={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', border: '1px solid #bae6fd', borderRadius: '12px', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ background: '#0284c7', color: '#fff', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem' }}>2</div>
              <h3 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, color: '#075985' }}>Upload Spreadsheet</h3>
            </div>
            <p style={{ margin: 0, fontSize: '0.78rem', color: '#0369a1' }}>
              Select or drop your populated `.xlsx`, `.xls`, or `.csv` spreadsheet.
            </p>
            <span style={{ fontSize: '0.74rem', color: '#0284c7', fontWeight: 700 }}>
              Primary Keys: <strong>ItemName, SaleRate</strong>
            </span>
          </div>

          {/* Step 3 Card */}
          <div style={{ background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)', border: '1px solid #e9d5ff', borderRadius: '12px', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ background: '#7e22ce', color: '#fff', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem' }}>3</div>
              <h3 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, color: '#6b21a8' }}>Validate & Save</h3>
            </div>
            <p style={{ margin: 0, fontSize: '0.78rem', color: '#7e22ce' }}>
              Maps all 13 fields cleanly into PostgreSQL database.
            </p>
            <span style={{ fontSize: '0.74rem', color: '#9333ea', fontWeight: 700 }}>
              Active Database: <strong>alfa_restaurant</strong>
            </span>
          </div>
        </div>

        {/* Drag & Drop Upload Dropzone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragActive(false);
            if (e.dataTransfer.files?.[0]) {
              setPendingFile(e.dataTransfer.files[0]);
              if (outlets.length > 0 && selectedOutlets.length === 0) {
                setSelectedOutlets([outlets[0].store_id]);
              }
              setUploadModalOpen(true);
            }
          }}
          onClick={handleDropzoneClick}
          style={{
            border: `2.5px dashed ${dragActive ? '#0e7490' : '#cbd5e1'}`,
            borderRadius: '16px',
            backgroundColor: dragActive ? '#f0fdf4' : '#f8fafc',
            padding: '36px 24px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 200ms ease-in-out',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '20px'
          }}
        >
          <input
            id="posItemFileInputPage"
            type="file"
            accept=".xlsx,.xls,.csv"
            style={{ display: 'none' }}
            onChange={(e) => { if (e.target.files?.[0]) handleFileSelect(e.target.files[0]); }}
          />

          <div style={{ background: '#ecfeff', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #cffaff' }}>
            <FaCloudUploadAlt style={{ fontSize: '32px', color: '#0e7490' }} />
          </div>

          <div>
            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#1e293b' }}>
              {selectedFile ? `Selected File: ${selectedFile.name}` : 'Drag & drop Excel (.xlsx, .xls) or CSV (.csv) file here'}
            </h4>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
              or <span style={{ color: '#0e7490', fontWeight: 700, textDecoration: 'underline' }}>click to browse from your computer</span>
            </p>
          </div>

          <span style={{ fontSize: '0.74rem', color: '#94a3b8', background: '#ffffff', padding: '4px 12px', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
            Supports SheetJS XLSX Parser (.xlsx, .xls, .csv up to 10MB)
          </span>

          <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }} onClick={(e) => e.stopPropagation()}>
            {/* <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handleLoadSampleMenu(); }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 18px',
                background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(13, 148, 136, 0.25)',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; }}
            >
              ⚡ Load Momo Bars Menu (53 Items with Half & Full Variants & Prices)
            </button> */}
          </div>
        </div>

        {/* Error Notification Banner */}
        {parseError && (
          <div style={{ padding: '14px 18px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', color: '#b91c1c', fontSize: '0.82rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <FaExclamationTriangle style={{ fontSize: '18px', color: '#ef4444' }} />
            <span>❌ {parseError}</span>
          </div>
        )}

        {/* Parsed Data Preview & Table Section */}
        {parsedRows.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '12px' }}>

            {/* Stat Counters & Filters Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f1f5f9', padding: '12px 18px', borderRadius: '12px', border: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#1e293b' }}>
                  Parsed Summary ({parsedRows.length} Total Rows)
                </span>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setFilterTab('ALL')}
                    style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '0.74rem', fontWeight: 700, border: 'none', cursor: 'pointer', background: filterTab === 'ALL' ? '#334155' : '#e2e8f0', color: filterTab === 'ALL' ? '#fff' : '#475569' }}
                  >
                    All ({parsedRows.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterTab('VALID')}
                    style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '0.74rem', fontWeight: 700, border: 'none', cursor: 'pointer', background: filterTab === 'VALID' ? '#059669' : '#d1fae5', color: filterTab === 'VALID' ? '#fff' : '#065f46' }}
                  >
                    Valid ({validCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterTab('INVALID')}
                    style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '0.74rem', fontWeight: 700, border: 'none', cursor: 'pointer', background: filterTab === 'INVALID' ? '#dc2626' : '#fee2e2', color: filterTab === 'INVALID' ? '#fff' : '#991b1b' }}
                  >
                    Invalid ({invalidCount})
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleReset}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#ffffff', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, color: '#475569', cursor: 'pointer' }}
              >
                <FaRedoAlt size={11} /> Clear File
              </button>
            </div>

            {/* High Resolution Data Table */}
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#ffffff' }}>
              <div style={{ maxHeight: '380px', overflowX: 'auto', overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem', textAlign: 'left', minWidth: '1100px' }}>
                  <thead style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569', fontWeight: 800, position: 'sticky', top: 0, zIndex: 10 }}>
                    <tr>
                      <th style={{ padding: '12px 14px', textAlign: 'center', width: '50px' }}>Status</th>
                      <th style={{ padding: '12px 14px', width: '50px' }}>Row</th>
                      <th style={{ padding: '12px 14px' }}>Item Name</th>
                      <th style={{ padding: '12px 14px' }}>Variant</th>
                      <th style={{ padding: '12px 14px' }}>Serving</th>
                      <th style={{ padding: '12px 14px' }}>Code</th>
                      <th style={{ padding: '12px 14px' }}>Sale Rate (₹)</th>
                      <th style={{ padding: '12px 14px' }}>Category</th>
                      <th style={{ padding: '12px 14px' }}>Group</th>
                      <th style={{ padding: '12px 14px' }}>Unit</th>
                      <th style={{ padding: '12px 14px' }}>Outlet</th>
                      <th style={{ padding: '12px 14px' }}>Kitchen</th>
                      <th style={{ padding: '12px 14px' }}>Validation Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayRows.length > 0 ? (
                      displayRows.map((r, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', background: r.__isValid ? '#ffffff' : '#fef2f2' }}>
                          <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                            {r.__isValid ? (
                              <FaCheckCircle style={{ color: '#059669', fontSize: '15px' }} title="Valid row" />
                            ) : (
                              <FaExclamationTriangle style={{ color: '#dc2626', fontSize: '15px' }} title="Invalid row" />
                            )}
                          </td>
                          <td style={{ padding: '10px 14px', fontFamily: 'monospace', color: '#64748b', fontWeight: 600 }}>#{r.__rowIndex || idx + 2}</td>
                          <td style={{ padding: '10px 14px', fontWeight: 700, color: '#0f172a' }}>{r.__resolvedName || '—'}</td>
                          <td style={{ padding: '10px 14px', color: '#4f46e5', fontWeight: 600 }}>
                            {r.__resolvedVariant ? (
                              <span style={{ background: '#e0e7ff', color: '#4338ca', padding: '3px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700 }}>
                                {r.__resolvedVariant}
                              </span>
                            ) : (
                              <span style={{ color: '#94a3b8' }}>—</span>
                            )}
                          </td>
                          <td style={{ padding: '10px 14px', color: '#64748b', fontSize: '0.75rem' }}>{r.__resolvedServing || '—'}</td>
                          <td style={{ padding: '10px 14px', fontFamily: 'monospace', color: '#475569' }}>{r.__resolvedDispCode}</td>
                          <td style={{ padding: '10px 14px', fontWeight: 700, color: '#0e7490' }}>₹{r.__resolvedPrice}</td>
                          <td style={{ padding: '10px 14px', color: '#475569' }}>
                            <span style={{ background: '#f1f5f9', padding: '3px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 600 }}>
                              {r.__resolvedCategory}
                            </span>
                          </td>
                          <td style={{ padding: '10px 14px', color: '#475569' }}>{r.__resolvedGroup}</td>
                          <td style={{ padding: '10px 14px', color: '#64748b' }}>{r.__resolvedUnitType}</td>
                          <td style={{ padding: '10px 14px', color: '#64748b' }}>{r.__resolvedOutlet}</td>
                          <td style={{ padding: '10px 14px', color: '#64748b' }}>{r.__resolvedKitchen}</td>
                          <td style={{ padding: '10px 14px', fontWeight: 700, color: r.__isValid ? '#059669' : '#dc2626' }}>
                            {r.__errorReason}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={13} style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '0.8rem' }}>
                          No rows match the selected filter.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom Commit Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Ready to commit <strong>{validCount} valid rows</strong> (all 13 fields) to PostgreSQL database table <code>mpos_menu_items</code>.
              </span>

              <button
                type="button"
                onClick={handleUploadToDb}
                disabled={uploading || validCount === 0}
                style={{
                  padding: '10px 24px',
                  background: validCount > 0 ? 'linear-gradient(135deg, #0e7490 0%, #155e75 100%)' : '#cbd5e1',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '0.84rem',
                  fontWeight: 800,
                  cursor: validCount > 0 ? 'pointer' : 'not-allowed',
                  boxShadow: validCount > 0 ? '0 4px 6px -1px rgba(14,116,144,0.3)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 150ms'
                }}
              >
                {uploading ? 'Importing to PostgreSQL...' : `Import ${validCount} Items to Database`}
                {!uploading && <FaArrowRight size={13} />}
              </button>
            </div>

          </div>
        )}

      </div>
      {uploadModalOpen && (
        <CommonModal
          isOpen={uploadModalOpen}
          onClose={() => setUploadModalOpen(false)}
          title="Select Target Outlets for Bulk Import"
          maxWidth="460px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '12px 6px' }}>
            <p style={{ margin: 0, fontSize: '0.86rem', color: '#475569', lineHeight: '1.4' }}>
              Select the outlet(s) where you want to insert these menu items:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>
                  Target Outlets * <span style={{ color: '#0e7490', fontWeight: 800 }}>({selectedOutlets.length} selected)</span>
                </span>
                {outlets.length > 1 && (
                  <button
                    type="button"
                    onClick={handleToggleSelectAllOutlets}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#0e7490',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      padding: 0
                    }}
                  >
                    {selectedOutlets.length === outlets.length ? 'Deselect All' : 'Select All'}
                  </button>
                )}
              </div>

              <div style={{
                maxHeight: '220px',
                overflowY: 'auto',
                border: '1.5px solid #cbd5e1',
                borderRadius: '10px',
                padding: '8px',
                background: '#f8fafc',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}>
                {outlets.length > 0 ? (
                  outlets.map((o) => {
                    const isChecked = selectedOutlets.includes(o.store_id);
                    return (
                      <label
                        key={o.store_id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '9px 12px',
                          borderRadius: '8px',
                          background: isChecked ? '#e0f2fe' : '#ffffff',
                          border: isChecked ? '1.5px solid #0284c7' : '1px solid #e2e8f0',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleOutlet(o.store_id)}
                          style={{
                            width: '16px',
                            height: '16px',
                            cursor: 'pointer',
                            accentColor: '#0e7490'
                          }}
                        />
                        <span style={{
                          fontSize: '0.86rem',
                          fontWeight: isChecked ? 700 : 500,
                          color: isChecked ? '#0369a1' : '#334155'
                        }}>
                          {o.name}
                        </span>
                      </label>
                    );
                  })
                ) : (
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      background: '#e0f2fe',
                      border: '1.5px solid #0284c7'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={true}
                      readOnly
                      style={{ width: '16px', height: '16px', accentColor: '#0e7490' }}
                    />
                    <span style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0369a1' }}>
                      Main Restaurant Outlet
                    </span>
                  </label>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
              <button
                type="button"
                onClick={() => setUploadModalOpen(false)}
                style={{ padding: '8px 16px', background: '#f1f5f9', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 700, color: '#475569', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUploadConfirm}
                disabled={selectedOutlets.length === 0}
                style={{
                  padding: '8px 20px',
                  background: selectedOutlets.length > 0 ? '#0e7490' : '#94a3b8',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  color: '#ffffff',
                  cursor: selectedOutlets.length > 0 ? 'pointer' : 'not-allowed'
                }}
              >
                Proceed
              </button>
            </div>
          </div>
        </CommonModal>
      )}
    </div>
  );
};

export default ItemEnterPage;
