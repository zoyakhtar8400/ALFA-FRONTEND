import React, { useCallback, useState, useEffect } from 'react';
import { LuUpload } from 'react-icons/lu';
import { 
  FaCloudUploadAlt, FaDownload, FaCheckCircle, FaExclamationTriangle, 
  FaFileExcel, FaFileCsv, FaUtensils, FaListAlt, FaLayerGroup, FaRedoAlt, FaArrowRight
} from 'react-icons/fa';
import PageHeader from '../../../../../components/common/PageHeader';
import posApi from '../../../../../api/posApi';
import { parseExcelOrCsvFile, downloadSampleTemplate, getRowFieldValue } from '../../../../../utils/excelImportUtils';

const ItemEnterPage = ({ showToast }) => {
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

  // Complete sample generator containing EVERY SINGLE POS Menu Item field in the software
  const getDynamicSampleData = () => {
    if (dbMenuItems && dbMenuItems.length > 0) {
      return dbMenuItems.slice(0, 5).map((m, idx) => ({
        ItemName: m.name || m.title || `Menu Item ${idx + 1}`,
        SaleRate: Number(m.price || m.sale_price || 150),
        ItemCategory: m.foodType || m.category || dbCategories[0] || 'Veg',
        ItemGroup: m.category || dbItemGroups[0] || 'General',
        MainGroup: m.mainGroup || dbMainGroups[0] || 'Food',
        DispCode: String(m.id || m.item_id || 100 + idx),
        UnitType: m.unitType || 'Plate',
        Outlet: m.outlet || 'Main Restaurant',
        Kitchen: m.kitchen || 'Main Kitchen',
        RateEdit: m.rateEdit || 'No',
        DiscApp: m.discApp || 'Yes',
        Status: m.active !== 0 ? 'Active' : 'Inactive',
        HsnCode: m.hsnCode || '2106'
      }));
    }

    const defaultCat = dbCategories[0] || 'Veg';
    const defaultGroup = dbItemGroups[0] || 'General';
    const defaultMain = dbMainGroups[0] || 'Food';

    return [
      {
        ItemName: 'Paneer Butter Masala',
        SaleRate: 340,
        ItemCategory: defaultCat,
        ItemGroup: defaultGroup,
        MainGroup: defaultMain,
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
        ItemName: 'Chicken Biryani Special',
        SaleRate: 380,
        ItemCategory: 'Non-Veg',
        ItemGroup: defaultGroup,
        MainGroup: defaultMain,
        DispCode: '102',
        UnitType: 'Plate',
        Outlet: 'Main Restaurant',
        Kitchen: 'Main Kitchen',
        RateEdit: 'No',
        DiscApp: 'Yes',
        Status: 'Active',
        HsnCode: '2106'
      },
      {
        ItemName: 'Fresh Lime Soda',
        SaleRate: 90,
        ItemCategory: 'Beverage',
        ItemGroup: 'Beverages',
        MainGroup: 'Beverages',
        DispCode: '103',
        UnitType: 'Glass',
        Outlet: 'Bar Outlet',
        Kitchen: 'Bar Kitchen',
        RateEdit: 'No',
        DiscApp: 'Yes',
        Status: 'Active',
        HsnCode: '2202'
      }
    ];
  };

  const handleDownloadSample = (format) => {
    const sampleData = getDynamicSampleData();
    downloadSampleTemplate(sampleData, 'ALFA_POS_Menu_Item_Full_Fields_Template', format);
    toastTrigger(`Downloaded Complete Sample ${format.toUpperCase()} Template (All Software Fields Included)`);
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
        [['ItemName', 'Name', 'item_name', 'Item Name', 'Title', 'title']], // Flexible header matching
        (row, index, seenKeys) => {
          const rawName = String(getRowFieldValue(row, ['ItemName', 'Name', 'item_name', 'Item Name', 'Title', 'title'])).trim();
          const rawPrice = getRowFieldValue(row, ['SaleRate', 'salerate', 'sale_rate', 'Price', 'price', 'Rate', 'rate', 'Cost', 'cost', 'Amount', 'amount']);
          const rawCategory = getRowFieldValue(row, ['ItemCategory', 'itemcategory', 'item_category', 'Category', 'category', 'FoodType', 'food_type', 'Type', 'type']);

          if (!rawName) {
            return { isValid: false, errorReason: 'Missing Item Name' };
          }

          const cleanPriceStr = String(rawPrice).replace(/[^0-9.]/g, '');
          const priceNum = parseFloat(cleanPriceStr);
          if (rawPrice !== '' && isNaN(priceNum)) {
            return { isValid: false, errorReason: 'Non-numeric Sale Rate' };
          }

          const itemKey = rawName.toLowerCase();
          if (seenKeys.has(itemKey)) {
            return { isValid: false, errorReason: 'Duplicate item name in file' };
          }
          seenKeys.add(itemKey);

          // Map all fields from software schema
          row.__resolvedName = rawName;
          row.__resolvedPrice = isNaN(priceNum) ? 0 : priceNum;
          row.__resolvedCategory = rawCategory || dbCategories[0] || 'Veg';
          row.__resolvedGroup = getRowFieldValue(row, ['ItemGroup', 'itemgroup', 'item_group', 'Group', 'group']) || 'General';
          row.__resolvedMainGroup = getRowFieldValue(row, ['MainGroup', 'maingroup', 'main_group']) || 'Food';
          row.__resolvedDispCode = getRowFieldValue(row, ['DispCode', 'dispcode', 'disp_code', 'Code', 'code']) || String(100 + index);
          row.__resolvedUnitType = getRowFieldValue(row, ['UnitType', 'unittype', 'unit_type', 'Unit', 'unit']) || 'Plate';
          row.__resolvedOutlet = getRowFieldValue(row, ['Outlet', 'outlet']) || 'Main Restaurant';
          row.__resolvedKitchen = getRowFieldValue(row, ['Kitchen', 'kitchen']) || 'Main Kitchen';
          row.__resolvedRateEdit = getRowFieldValue(row, ['RateEdit', 'rateedit', 'rate_edit']) || 'No';
          row.__resolvedDiscApp = getRowFieldValue(row, ['DiscApp', 'discapp', 'disc_app']) || 'Yes';
          row.__resolvedStatus = getRowFieldValue(row, ['Status', 'status', 'Active', 'active']) || 'Active';
          row.__resolvedHsnCode = getRowFieldValue(row, ['HsnCode', 'hsncode', 'hsn_code', 'HSN']) || '2106';

          return { isValid: true, errorReason: 'Valid' };
        }
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

  const validCount = parsedRows.filter((r) => r.__isValid !== false).length;
  const invalidCount = parsedRows.length - validCount;

  const displayRows = parsedRows.filter((r) => {
    if (filterTab === 'VALID') return r.__isValid !== false;
    if (filterTab === 'INVALID') return r.__isValid === false;
    return true;
  });

  const handleUploadToDb = () => {
    const validRows = parsedRows.filter((r) => r.__isValid !== false);
    if (validRows.length === 0) {
      toastTrigger('No valid items ready for bulk import.');
      return;
    }

    setUploading(true);

    const payload = validRows.map((r) => ({
      name: r.__resolvedName,
      price: r.__resolvedPrice,
      type: r.__resolvedCategory,
      dispCode: r.__resolvedDispCode,
      itemGroup: r.__resolvedGroup,
      mainGroup: r.__resolvedMainGroup,
      unitType: r.__resolvedUnitType,
      outlet: r.__resolvedOutlet,
      kitchen: r.__resolvedKitchen,
      rateEdit: r.__resolvedRateEdit,
      discApp: r.__resolvedDiscApp,
      status: r.__resolvedStatus,
      hsnCode: r.__resolvedHsnCode
    }));

    posApi.uploadItemsCsv(payload)
      .then((res) => {
        toastTrigger(res?.data?.message || `Successfully imported ${payload.length} menu items with all fields into PostgreSQL!`);
        setSelectedFile(null);
        setParsedRows([]);
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
    <div style={{ padding: '24px 32px', backgroundColor: '#F8FAFC', minHeight: '100vh', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Header */}
      <PageHeader
        title="POS Item Menu Bulk Import (Full Software Field Mapping)"
        breadcrumbs={['Dashboard', 'Point Of Sale', 'Master', 'Item Menu', 'Bulk Upload']}
        style={{ marginBottom: 0 }}
      />

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
            if (e.dataTransfer.files?.[0]) handleFileSelect(e.dataTransfer.files[0]);
          }}
          onClick={() => document.getElementById('posItemFileInputPage').click()}
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
                        <td colSpan={11} style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '0.8rem' }}>
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
    </div>
  );
};

export default ItemEnterPage;
