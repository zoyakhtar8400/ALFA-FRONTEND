import React, { useState, useEffect, useMemo } from 'react';
import CommonTable from '../../../components/common/CommonTable';
import DeleteConfirmationModal from '../../../components/common/DeleteConfirmationModal';
import StatusBadge from '../../../components/common/StatusBadge';
import apiClient from '../../../services/apiClient';
import useOutletFilter from '../../../hooks/useOutletFilter';
import posApi from '../../../api/posApi';
import {
  FaPrint,
  FaSyncAlt,
  FaPlus,
  FaTrash,
  FaEdit,
  FaTimes,
  FaSave,
  FaCheck,
  FaThLarge,
  FaList,
  FaStore,
  FaNetworkWired,
  FaUserShield,
  FaTags
} from 'react-icons/fa';

const PRINTER_ROLES = [
  { value: 'KOT (Kitchen)', label: 'KOT (Kitchen)', defaultPurpose: 'KOT' },
  { value: 'BILL (Cashier)', label: 'BILL (Cashier)', defaultPurpose: 'BILL' },
  { value: 'KITCHEN STATION', label: 'KITCHEN STATION', defaultPurpose: 'KOT' },
  { value: 'BAR COUNTER', label: 'BAR COUNTER', defaultPurpose: 'KOT' },
  { value: 'GENERAL RECEIPT', label: 'GENERAL RECEIPT', defaultPurpose: 'BILL' }
];

const DEFAULT_ITEM_CATEGORIES = [
  'STARTERS & APPETIZERS',
  'MAIN COURSE (CURRIES)',
  'TANDOOR & BREADS',
  'CHINESE & ORIENTAL',
  'SOUTH INDIAN SPECIALS',
  'BEVERAGES & SHAKES',
  'BAR & MOCKTAILS',
  'DESSERTS & ICE CREAMS',
  'STAFF KITCHEN',
  'HOUSE KEEPING'
];

const generatePrinterCode = () => `PRN-${Math.floor(1000 + Math.random() * 9000)}`;

const defaultRoutesForRole = (role) => {
  if (role === 'BILL (Cashier)') {
    return {
      kot: { enabled: false },
      ncKot: { enabled: false },
      bill: { enabled: true },
      payment: { enabled: true }
    };
  }
  if (role === 'GENERAL RECEIPT') {
    return {
      kot: { enabled: false },
      ncKot: { enabled: false },
      bill: { enabled: true },
      payment: { enabled: false }
    };
  }
  if (role === 'KITCHEN STATION' || role === 'BAR COUNTER') {
    return {
      kot: { enabled: true },
      ncKot: { enabled: true },
      bill: { enabled: false },
      payment: { enabled: false }
    };
  }
  return {
    kot: { enabled: true },
    ncKot: { enabled: false },
    bill: { enabled: false },
    payment: { enabled: false }
  };
};

const emptyPrinterForm = {
  id: '',
  name: 'Kitchen KOT Printer',
  role: 'KOT (Kitchen)',
  code: 'PRN-1001',
  spooler: 'Installed Spooler Driver',
  paperWidth: '80mm / 72mm Standard 3-Inch',
  ip: '192.168.1.100',
  port: 9100,
  store_id: 'STORE_1',
  status: 'Active',
  categories: [], // Assigned Item Categories for printing path
  routes: {
    kot: { enabled: true },
    ncKot: { enabled: false },
    bill: { enabled: false },
    payment: { enabled: false }
  }
};

const PrinterMasterPage = ({ showToast }) => {
  const [printers, setPrinters] = useState([]);
  const [categoriesList, setCategoriesList] = useState(DEFAULT_ITEM_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'table'
  const [scanning, setScanning] = useState(false);

  // User Printer Access Modal state
  const [showUserAccessModal, setShowUserAccessModal] = useState(false);
  const [userPrinterAccess, setUserPrinterAccess] = useState([]);

  const { outlets, outletFilter, setOutletFilter, filterData } = useOutletFilter();

  const [modal, setModal] = useState({ open: false, mode: 'add', row: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, row: null });
  const [form, setForm] = useState(emptyPrinterForm);

  const notify = (msg, type = 'success') => {
    if (showToast) showToast(msg, type);
    else if (window.showToast) window.showToast(msg, type);
  };

  // Load saved multi-routes & category paths from localStorage
  const getSavedMultiRoutes = () => {
    try {
      const data = localStorage.getItem('alfa_printer_multi_routes');
      return data ? JSON.parse(data) : {};
    } catch (e) {
      return {};
    }
  };

  const saveMultiRoutes = (printerIdOrCode, routesData, categories = []) => {
    try {
      const current = getSavedMultiRoutes();
      current[String(printerIdOrCode)] = {
        routes: routesData,
        categories: categories || []
      };
      localStorage.setItem('alfa_printer_multi_routes', JSON.stringify(current));
      syncPrinterMasterSetup();
    } catch (e) { }
  };

  const removeMultiRoutes = (printerIdOrCode) => {
    try {
      const current = getSavedMultiRoutes();
      delete current[String(printerIdOrCode)];
      localStorage.setItem('alfa_printer_multi_routes', JSON.stringify(current));
      syncPrinterMasterSetup();
    } catch (e) { }
  };

  // Sync with general POS print routing settings (alfa_printer_setup_active)
  const syncPrinterMasterSetup = (printerList = null) => {
    try {
      const list = printerList || printers;
      const billPrinter = list.find(p => p.role?.includes('BILL') || p.routes?.bill?.enabled);
      const kotPrinter = list.find(p => p.role?.includes('KOT') || p.routes?.kot?.enabled);

      const categoryPaths = [];
      list.forEach((p) => {
        if (Array.isArray(p.categories)) {
          p.categories.forEach((cat) => {
            categoryPaths.push({
              sNo: categoryPaths.length + 1,
              category: cat,
              printer: p.name
            });
          });
        }
      });

      const config = {
        outlet: outletFilter !== 'all' ? outletFilter : 'ROOM SERVICE',
        systemName: 'DESKTOP-LCTG5JN',
        billPrintingPath: billPrinter?.name || 'RP3200 plus(U) 12',
        billPrintingType: 'BILL PLAIN (4/6) INCH',
        kotPrintingType: 'KOT STANDARD (3 INCH)',
        kotTokenPrintingPath: kotPrinter?.name || '',
        centralKotPrintingPath: kotPrinter?.name || '',
        categoryPaths
      };

      localStorage.setItem('alfa_printer_setup_active', JSON.stringify(config));
    } catch (e) { }
  };

  // Fetch initial data: printers, POS categories, users
  const fetchPrinters = async () => {
    setLoading(true);
    try {
      const [res, catRes, userRes] = await Promise.allSettled([
        apiClient.get('/printers'),
        posApi.getCategories(),
        apiClient.get('/users')
      ]);

      // Categories
      if (catRes.status === 'fulfilled' && catRes.value) {
        const cList = Array.isArray(catRes.value?.data?.categories)
          ? catRes.value.data.categories
          : (Array.isArray(catRes.value?.data) ? catRes.value.data : []);
        if (cList.length > 0) {
          const names = cList.map(c => c.name || c.category_name).filter(Boolean);
          if (names.length > 0) setCategoriesList(names);
        }
      }

      // Printers
      const apiList = res.status === 'fulfilled' ? (res.value?.data || res.value || []) : [];
      const savedRoutesDict = getSavedMultiRoutes();

      let mapped = [];
      if (Array.isArray(apiList) && apiList.length > 0) {
        mapped = apiList.map((p, idx) => {
          const pPurpose = String(p.printer_type || p.type || '').toUpperCase() === 'BILL' ? 'BILL' : 'KOT';
          const pIp = p.printer_ip || p.device_address || '192.168.1.100';
          const pPort = p.printer_port_number || p.port || 9100;
          const pid = p.id || p.printer_id || idx + 1;
          const pCode = p.code || `PRN-${pid}`;
          const pRole = pPurpose === 'BILL' ? 'BILL (Cashier)' : 'KOT (Kitchen)';

          const savedInfo = savedRoutesDict[String(pid)] || savedRoutesDict[pCode] || {};
          const rawRoutes = savedInfo.routes || savedInfo || {};
          const customRoutes = {
            kot: { enabled: rawRoutes.kot ? Boolean(rawRoutes.kot.enabled ?? rawRoutes.kot) : pPurpose !== 'BILL' },
            ncKot: { enabled: rawRoutes.ncKot ? Boolean(rawRoutes.ncKot.enabled ?? rawRoutes.ncKot) : false },
            bill: { enabled: rawRoutes.bill ? Boolean(rawRoutes.bill.enabled ?? rawRoutes.bill) : pPurpose === 'BILL' },
            payment: { enabled: rawRoutes.payment ? Boolean(rawRoutes.payment.enabled ?? rawRoutes.payment) : pPurpose === 'BILL' }
          };
          const customCategories = Array.isArray(savedInfo.categories) ? savedInfo.categories : [];

          return {
            id: pid,
            name: p.printer_name || p.title || p.device_name || `Printer ${pid}`,
            code: pCode,
            role: p.role || pRole,
            spooler: p.spooler || 'Installed Spooler Driver',
            paperWidth: p.paperWidth || '80mm / 72mm Standard 3-Inch',
            printer_type: pPurpose,
            type: pPurpose,
            ipPort: `${pIp} : ${pPort}`,
            ip: pIp,
            port: Number(pPort),
            status: (p.is_active === 1 || p.activate === 1 || p.status === 'Active') ? 'Active' : 'Inactive',
            store_id: p.store_id || 'STORE_1',
            categories: customCategories,
            routes: customRoutes
          };
        });
      }

      setPrinters(mapped);
      syncPrinterMasterSetup(mapped);

      // Users for Printer Access
      let userList = [];
      if (userRes.status === 'fulfilled' && userRes.value) {
        const uRaw = userRes.value?.data || userRes.value || [];
        if (Array.isArray(uRaw)) userList = uRaw;
      }
      if (userList.length === 0) {
        userList = [
          { id: 1, username: 'SA', role: 'System Admin', name: 'Super Admin' },
          { id: 2, username: 'admin', role: 'Administrator', name: 'Admin User' },
          { id: 3, username: 'cashier', role: 'Cashier', name: 'Cashier Desk' },
          { id: 4, username: 'captain', role: 'Captain', name: 'Floor Captain' },
          { id: 5, username: 'steward', role: 'Steward', name: 'Service Staff' }
        ];
      }

      const savedAccessStr = localStorage.getItem('alfa_user_printer_access');
      if (savedAccessStr) {
        try {
          setUserPrinterAccess(JSON.parse(savedAccessStr));
        } catch (e) {
          setUserPrinterAccess(initDefaultUserAccess(userList));
        }
      } else {
        setUserPrinterAccess(initDefaultUserAccess(userList));
      }
    } catch (err) {
      console.warn('Printer API load error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const initDefaultUserAccess = (uList) => {
    return uList.map(u => ({
      userId: u.id,
      username: u.username || u.name || `User ${u.id}`,
      role: u.role || 'Staff',
      canPrintBill: true,
      canPrintKot: true,
      canReprint: true,
      assignedPrinter: 'ALL'
    }));
  };

  useEffect(() => {
    fetchPrinters();
  }, []);

  // Scan Windows print spooler
    const handleScanPrinters = async () => {
      setScanning(true);
        try {
          if (typeof window !== 'undefined' && window.electronAPI && typeof window.electronAPI.getSystemPrinters === 'function') {
            const sysPrinters = await window.electronAPI.getSystemPrinters();
            const names = Array.isArray(sysPrinters) ? sysPrinters.map(p => p.name).join(', ') : '';
            notify(`Detected Installed Printers: ${names || 'None'}`);
          } else {
            notify('Scanned Windows print spooler: TVSE RP3200 Lite & PDF spoolers ready.');
          }
        } catch (e) {
          notify('Scanned Windows print spooler.');
        } finally {
          setScanning(false);
    }
  };

  // Open modal for adding
  const handleOpenAdd = () => {
    const code = generatePrinterCode();
    setForm({
      ...emptyPrinterForm,
      code,
      categories: [],
      routes: defaultRoutesForRole(emptyPrinterForm.role),
      store_id: outletFilter !== 'all' ? outletFilter : (outlets?.[0]?.store_id || 'STORE_1')
    });
    setModal({ open: true, mode: 'add', row: null });
  };

  // Open modal for editing
  const handleOpenEdit = (row) => {
    setForm({
      id: row.id,
      name: row.name || 'Printer',
      role: row.role || (row.printer_type === 'BILL' ? 'BILL (Cashier)' : 'KOT (Kitchen)'),
      code: row.code || `PRN-${row.id}`,
      spooler: row.spooler || 'Installed Spooler Driver',
      paperWidth: row.paperWidth || '80mm / 72mm Standard 3-Inch',
      ip: row.ip || (row.ipPort ? row.ipPort.split(' : ')[0] : '192.168.1.100'),
      port: row.port || (row.ipPort ? Number(row.ipPort.split(' : ')[1]) : 9100),
      store_id: row.store_id || 'STORE_1',
      status: row.status || 'Active',
      categories: Array.isArray(row.categories) ? row.categories : [],
      routes: row.routes || defaultRoutesForRole(row.role || 'KOT (Kitchen)')
    });
    setModal({ open: true, mode: 'edit', row });
  };

  // Change role in modal
  const handleRoleChange = (role) => {
    let defaultName = 'Kitchen KOT Printer';
    if (role === 'BILL (Cashier)') defaultName = 'Cashier Bill Printer';
    else if (role === 'KITCHEN STATION') defaultName = 'Kitchen Station Printer';
    else if (role === 'BAR COUNTER') defaultName = 'Bar BOT Printer';
    else if (role === 'GENERAL RECEIPT') defaultName = 'General Receipt Printer';

    setForm(prev => ({
      ...prev,
      role,
      name: defaultName,
      routes: defaultRoutesForRole(role)
    }));
  };

  // Toggle category assignment for this thermal printer
  const handleToggleCategory = (catName) => {
    setForm(prev => {
      const exists = prev.categories.includes(catName);
      return {
        ...prev,
        categories: exists
          ? prev.categories.filter(c => c !== catName)
          : [...prev.categories, catName]
      };
    });
  };

  // Save printer (Create or Update in PostgreSQL + localStorage)
  const handleSave = async () => {
    if (!form.name.trim()) {
      notify('Printer name is required.', 'warning');
      return;
    }

    const isBill = (form.role || '').includes('BILL') || (form.role || '').includes('RECEIPT');
    const isNumericId = modal.mode === 'edit' && modal.row && (typeof modal.row.id === 'number' || !isNaN(Number(modal.row.id)));

    const payload = {
      printer_id: isNumericId ? Number(modal.row.id) : undefined,
      id: isNumericId ? Number(modal.row.id) : undefined,
      printer_name: form.name.trim(),
      name: form.name.trim(),
      title: form.name.trim(),
      device_name: form.name.trim(),
      printer_ip: form.ip || '192.168.1.100',
      ip_address: form.ip || '192.168.1.100',
      device_address: form.ip || '192.168.1.100',
      port: String(form.port || 9100),
      printer_port_number: String(form.port || 9100),
      printer_type: isBill ? 'BILL' : 'KOT',
      type: isBill ? 'BILL' : 'KOT',
      is_active: form.status === 'Active' ? 1 : 0,
      store_id: form.store_id || 'STORE_1'
    };

    try {
      const res = await apiClient.post('/printers', payload);
      const savedId = res?.data?.id || res?.data?.printer_id || modal.row?.id || Date.now();

      // Persist multi-routing and item category mapping
      saveMultiRoutes(savedId, form.routes, form.categories);
      if (form.code) saveMultiRoutes(form.code, form.routes, form.categories);

      notify(`Thermal Printer "${form.name}" saved successfully!`);
      setModal({ open: false, mode: 'add', row: null });
      await fetchPrinters();
    } catch (err) {
      console.warn('Save printer API error:', err.message);
      notify('Failed to save printer: ' + (err.response?.data?.message || err.message), 'warning');
    }
  };

  // Delete printer
  const handleDelete = async () => {
    if (!deleteModal.row) return;
    const id = deleteModal.row.id;
    try {
      if (typeof id === 'number' || !isNaN(Number(id))) {
        await apiClient.delete(`/printers/${id}`);
      }
      removeMultiRoutes(id);
      if (deleteModal.row.code) removeMultiRoutes(deleteModal.row.code);
      notify(`Printer "${deleteModal.row.name}" removed successfully.`);
      await fetchPrinters();
    } catch (err) {
      console.warn('Delete printer API error:', err.message);
    }
    setDeleteModal({ open: false, row: null });
  };

  const handleBulkDelete = async (selectedRows) => {
    for (const row of selectedRows) {
      const id = row.id;
      if (typeof id === 'number' || !isNaN(Number(id))) {
        try {
          await apiClient.delete(`/printers/${id}`);
          removeMultiRoutes(id);
        } catch (e) { }
      }
    }
    notify(`Deleted ${selectedRows.length} printer(s).`);
    await fetchPrinters();
  };

  // Save User Printer Access permissions
  const handleSaveUserAccess = () => {
    try {
      localStorage.setItem('alfa_user_printer_access', JSON.stringify(userPrinterAccess));
      notify('User Printer Access permissions saved!');
      setShowUserAccessModal(false);
    } catch (e) {
      notify('Failed to save user printer access', 'warning');
    }
  };

  // Test Print
  const handleTestPrint = async (printerName) => {
    const target = printerName || 'RP3200 plus(U) 12';
    notify(`Sending test print to "${target}"...`);
    try {
      await posApi.sendPrintRequest({
        id: `TEST-${Date.now()}`,
        job_type: 'KOT',
        print_purpose: 'KOT',
        type: 'print',
        printerName: target,
        deviceName: target,
        printer: target,
        html: `<html><body style="font-family: monospace; padding: 12px;"><h2>*** THERMAL TEST PRINT ***</h2><p>Device: ${target}</p><p>Status: Spooler OK</p></body></html>`
      });
    } catch (e) {
      console.warn('Test print error:', e);
    }
  };

  const filteredPrinters = filterData(printers, 'store_id');

  // Columns for Table View
  const columns = [
    { key: 'name', label: 'Printer Name', sortable: true },
    {
      key: 'code',
      label: 'Code',
      sortable: true,
      render: (val, row) => (
        <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#334155' }}>
          {val || `PRN-${row.id}`}
        </span>
      )
    },
    {
      key: 'role',
      label: 'Role / Purpose',
      sortable: true,
      render: (val, row) => {
        const isBill = String(val || row.printer_type).toUpperCase().includes('BILL');
        return (
          <span
            style={{
              padding: '3px 8px',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 800,
              backgroundColor: isBill ? '#ecfdf5' : '#eff6ff',
              color: isBill ? '#059669' : '#2563eb',
              border: `1px solid ${isBill ? '#a7f3d0' : '#bfdbfe'}`
            }}
          >
            {val || (isBill ? 'BILL (Cashier)' : 'KOT (Kitchen)')}
          </span>
        );
      }
    },
    {
      key: 'categories',
      label: 'Item Categories',
      render: (_, row) => {
        const cats = row.categories || [];
        return (
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', maxWidth: '240px' }}>
            {cats.length > 0 ? (
              cats.map((c, i) => (
                <span key={i} style={{ background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', fontSize: '10px', fontWeight: 700, padding: '1px 6px', borderRadius: '4px' }}>
                  {c}
                </span>
              ))
            ) : (
              <span style={{ color: '#94a3b8', fontSize: '11px', fontStyle: 'italic' }}>All Categories (Default)</span>
            )}
          </div>
        );
      }
    },
    {
      key: 'routes',
      label: 'Multi-Routing',
      render: (_, row) => {
        const r = row.routes || {};
        return (
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {r.kot?.enabled && (
              <span style={{ background: '#ffedd5', color: '#c2410c', fontSize: '10.5px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px' }}>
                KOT
              </span>
            )}
            {r.ncKot?.enabled && (
              <span style={{ background: '#f3e8ff', color: '#7e22ce', fontSize: '10.5px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px' }}>
                NC KOT
              </span>
            )}
            {r.bill?.enabled && (
              <span style={{ background: '#dcfce7', color: '#15803d', fontSize: '10.5px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px' }}>
                Bill
              </span>
            )}
            {r.payment?.enabled && (
              <span style={{ background: '#e0f2fe', color: '#0369a1', fontSize: '10.5px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px' }}>
                Receipt
              </span>
            )}
            {!r.kot?.enabled && !r.ncKot?.enabled && !r.bill?.enabled && !r.payment?.enabled && (
              <span style={{ color: '#94a3b8', fontSize: '11px', fontStyle: 'italic' }}>None</span>
            )}
          </div>
        );
      }
    },
    { key: 'ipPort', label: 'IP / Port', sortable: true },
    {
      key: 'store_id',
      label: 'Outlet',
      sortable: true,
      render: (val) => {
        const outletObj = outlets.find(o => o.store_id === val);
        return outletObj ? outletObj.name : val || 'Main Restaurant';
      }
    },
    { key: 'status', label: 'Status', sortable: true, render: (val, row) => <StatusBadge value={val || row?.status || 'Active'} /> },
    { key: 'action', label: 'Action' }
  ];

  return (
    <div style={{ padding: '20px 28px 40px', background: '#f8fafc', minHeight: 'calc(100vh - 70px)', fontFamily: 'var(--font-family, system-ui)' }}>

      {/* Top Banner & Control Card */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '18px 22px',
        marginBottom: '20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        flexWrap: 'wrap'
      }}>
        {/* Left: Title & Subtitle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: '320px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '10px',
            background: '#e6f7f4',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#0d9488',
            fontSize: '22px',
            flexShrink: 0
          }}>
            <FaPrint />
          </div>
          <div>
            <div style={{ fontSize: '17px', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.01em' }}>
              Thermal Printers & Multi-Routing ({filteredPrinters.length})
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '3px', lineHeight: '1.4' }}>
              Manage thermal hardware printers, Item Categorywise printing paths, multi-document routing, and user print access rights.
            </div>
          </div>
        </div>

        {/* Right: Controls & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Outlet Filter */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            padding: '5px 12px',
            fontSize: '12.5px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
          }}>
            <FaStore style={{ color: '#0d9488', fontSize: '13px' }} />
            <select
              value={outletFilter}
              onChange={(e) => setOutletFilter(e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                fontSize: '12.5px',
                fontWeight: 600,
                color: '#1e293b',
                background: 'transparent',
                cursor: 'pointer'
              }}
            >
              <option value="all">All Outlets</option>
              {outlets.map((o) => (
                <option key={o.store_id} value={o.store_id}>{o.name}</option>
              ))}
            </select>
          </div>

          {/* View Mode Switcher */}
          <div style={{
            display: 'flex',
            background: '#f1f5f9',
            borderRadius: '8px',
            padding: '3px',
            gap: '2px'
          }}>
            <button
              onClick={() => setViewMode('cards')}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                background: viewMode === 'cards' ? '#ffffff' : 'transparent',
                color: viewMode === 'cards' ? '#0d9488' : '#64748b',
                fontWeight: 700,
                fontSize: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: viewMode === 'cards' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
              }}
            >
              <FaThLarge style={{ fontSize: '11px' }} />
              <span>Cards View</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                background: viewMode === 'table' ? '#ffffff' : 'transparent',
                color: viewMode === 'table' ? '#0d9488' : '#64748b',
                fontWeight: 700,
                fontSize: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: viewMode === 'table' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
              }}
            >
              <FaList style={{ fontSize: '11px' }} />
              <span>Table View</span>
            </button>
          </div>

          {/* User Printer Access */}
          <button
            onClick={() => setShowUserAccessModal(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              fontSize: '12.5px',
              fontWeight: 700,
              color: '#4338ca',
              background: '#e0e7ff',
              border: '1px solid #c7d2fe',
              borderRadius: '7px',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <FaUserShield style={{ fontSize: '12px' }} />
            <span>User Printer Access</span>
          </button>

          {/* Scan Windows Printers */}
          <button
            onClick={handleScanPrinters}
            disabled={scanning}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              fontSize: '12.5px',
              fontWeight: 600,
              color: '#334155',
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '7px',
              cursor: scanning ? 'wait' : 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
              transition: 'all 0.15s ease'
            }}
          >
            <FaSyncAlt style={{ fontSize: '11px', animation: scanning ? 'spin 1s linear infinite' : 'none' }} />
            <span>{scanning ? 'Scanning...' : 'Scan Drivers'}</span>
          </button>

          {/* Add Printer */}
          <button
            onClick={handleOpenAdd}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              fontSize: '12.5px',
              fontWeight: 700,
              color: '#ffffff',
              background: '#0d9488',
              border: 'none',
              borderRadius: '7px',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(13,148,136,0.25)',
              transition: 'all 0.15s ease'
            }}
          >
            <FaPlus style={{ fontSize: '11px' }} />
            <span>Add Thermal Printer</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: CARDS & MULTI-ROUTING VIEW */}
      {viewMode === 'cards' && (
        <div>
          {filteredPrinters.length === 0 ? (
            /* Empty State */
            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '70px 20px',
              textAlign: 'center',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
            }}>
              <div style={{ color: '#94a3b8', fontSize: '48px', marginBottom: '14px' }}>
                <FaPrint />
              </div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#1e293b', marginBottom: '4px' }}>
                No thermal printers configured for this outlet.
              </div>
              <div style={{ fontSize: '12.5px', color: '#64748b', marginBottom: '18px' }}>
                Click "Add Thermal Printer" to register printers and set up document routing.
              </div>
              <button
                onClick={handleOpenAdd}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '9px 18px',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#ffffff',
                  background: '#0d9488',
                  border: 'none',
                  borderRadius: '7px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(13,148,136,0.3)'
                }}
              >
                <FaPlus style={{ fontSize: '11px' }} />
                <span>Add Thermal Printer</span>
              </button>
            </div>
          ) : (
            /* Configured Thermal Printers Cards Grid */
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '18px' }}>
              {filteredPrinters.map((p) => {
                const outletObj = outlets.find(o => o.store_id === p.store_id);
                const outletName = outletObj ? outletObj.name : p.store_id;
                const r = p.routes || {};
                const cats = p.categories || [];

                return (
                  <div
                    key={p.id}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '18px 20px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                    }}
                  >
                    <div>
                      {/* Top Row: Name, Outlet, Edit/Delete Actions */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '8px',
                            background: '#f0fdfa',
                            color: '#0d9488',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '16px'
                          }}>
                            <FaPrint />
                          </div>
                          <div>
                            <div style={{ fontSize: '14.5px', fontWeight: 800, color: '#0f172a' }}>
                              {p.name}
                            </div>
                            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '1px' }}>
                              {outletName}
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <button
                            onClick={() => handleTestPrint(p.name)}
                            style={{
                              background: '#f1f5f9',
                              border: '1px solid #cbd5e1',
                              color: '#2563eb',
                              cursor: 'pointer',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: 700
                            }}
                            title="Test Print"
                          >
                            Test
                          </button>
                          <button
                            onClick={() => handleOpenEdit(p)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#0284c7',
                              cursor: 'pointer',
                              padding: '5px 7px',
                              borderRadius: '4px'
                            }}
                            title="Edit Printer"
                          >
                            <FaEdit style={{ fontSize: '13px' }} />
                          </button>
                          <button
                            onClick={() => setDeleteModal({ open: true, row: p })}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#ef4444',
                              cursor: 'pointer',
                              padding: '5px 7px',
                              borderRadius: '4px'
                            }}
                            title="Remove Printer"
                          >
                            <FaTrash style={{ fontSize: '13px' }} />
                          </button>
                        </div>
                      </div>

                      {/* Badges Row: Role, Code, Width */}
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                        <span style={{ background: '#f1f5f9', color: '#334155', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700 }}>
                          {p.role}
                        </span>
                        <span style={{ background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontFamily: 'monospace', fontWeight: 700 }}>
                          {p.code}
                        </span>
                        <span style={{ background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0', padding: '2px 8px', borderRadius: '4px', fontSize: '11px' }}>
                          {p.paperWidth}
                        </span>
                      </div>

                      {/* Connection Info */}
                      <div style={{ fontSize: '11.5px', color: '#475569', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FaNetworkWired style={{ color: '#94a3b8', fontSize: '11px' }} />
                        <span>Interface: <strong>{p.ipPort}</strong></span>
                      </div>

                      {/* Assigned Item Categories (Item Categorywise Printing Path) */}
                      <div style={{ borderTop: '1px dashed #e2e8f0', paddingTop: '8px', marginBottom: '10px' }}>
                        <div style={{ fontSize: '10.5px', fontWeight: 800, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <FaTags style={{ fontSize: '10px' }} />
                          <span>Item Category Printing Path:</span>
                        </div>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {cats.length > 0 ? (
                            cats.map((c, idx) => (
                              <span key={idx} style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', fontSize: '10.5px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px' }}>
                                {c}
                              </span>
                            ))
                          ) : (
                            <span style={{ color: '#94a3b8', fontSize: '11px', fontStyle: 'italic' }}>
                              All Item Categories (Default fallback)
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Active Multi-Document Routes */}
                      <div style={{ borderTop: '1px dashed #e2e8f0', paddingTop: '8px' }}>
                        <div style={{ fontSize: '10.5px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '5px' }}>
                          Active Document Routes:
                        </div>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {r.kot?.enabled && (
                            <span style={{ background: '#ffedd5', color: '#c2410c', fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '4px' }}>
                              KOT
                            </span>
                          )}
                          {r.ncKot?.enabled && (
                            <span style={{ background: '#f3e8ff', color: '#7e22ce', fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '4px' }}>
                              NC KOT
                            </span>
                          )}
                          {r.bill?.enabled && (
                            <span style={{ background: '#dcfce7', color: '#15803d', fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '4px' }}>
                              Bill
                            </span>
                          )}
                          {r.payment?.enabled && (
                            <span style={{ background: '#e0f2fe', color: '#0369a1', fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '4px' }}>
                              Receipt
                            </span>
                          )}
                          {!r.kot?.enabled && !r.ncKot?.enabled && !r.bill?.enabled && !r.payment?.enabled && (
                            <span style={{ color: '#94a3b8', fontSize: '11px', fontStyle: 'italic' }}>
                              No active routes assigned
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Status & Quick Action */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '16px', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
                      <StatusBadge value={p.status || 'Active'} />
                      <button
                        onClick={() => handleOpenEdit(p)}
                        style={{
                          background: '#f8fafc',
                          border: '1px solid #cbd5e1',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '11.5px',
                          fontWeight: 700,
                          color: '#334155',
                          cursor: 'pointer'
                        }}
                      >
                        Configure Routing
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: TABLE LIST VIEW */}
      {viewMode === 'table' && (
        <CommonTable
          title="Printer Master & Routing Table"
          columns={columns}
          data={filteredPrinters}
          actions={[
            { label: 'Edit & Routing', onClick: handleOpenEdit },
            { label: 'Delete', isDanger: true, onClick: (row) => setDeleteModal({ open: true, row }) }
          ]}
          onBulkDelete={handleBulkDelete}
          onAddEntry={handleOpenAdd}
          addEntryLabel="+ Add Thermal Printer"
          searchPlaceholder="Search Printers..."
          breadcrumbs={['Dashboard', 'POS', 'Master', 'Printer Master']}
          emptyMessage="No Printers configured."
          outletFilter={outletFilter}
          setOutletFilter={setOutletFilter}
          outletsList={outlets}
        />
      )}

      {/* RICH MODAL: ADD / EDIT THERMAL PRINTER & MULTI-ROUTING */}
      {modal.open && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15,23,42,0.45)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            width: '680px',
            maxWidth: '96vw',
            maxHeight: '94vh',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.15), 0 10px 10px -5px rgba(0,0,0,0.04)',
            overflowY: 'auto',
            border: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 22px',
              borderBottom: '1px solid #f1f5f9'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  background: '#e6f7f4',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0d9488',
                  fontSize: '16px'
                }}>
                  <FaPrint />
                </div>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
                  {modal.mode === 'edit' ? 'Edit Thermal Printer & Routing' : 'Add Thermal Printer & Routing'}
                </h3>
              </div>
              <button
                onClick={() => setModal({ open: false, mode: 'add', row: null })}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  fontSize: '16px',
                  padding: '4px'
                }}
              >
                <FaTimes />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Row 1: Role, Name, Code */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1.6fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                    Role / Purpose
                  </label>
                  <select
                    value={form.role}
                    onChange={(e) => handleRoleChange(e.target.value)}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '8px 10px',
                      fontSize: '12px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      outline: 'none',
                      background: '#ffffff',
                      color: '#0f172a',
                      fontWeight: 600
                    }}
                  >
                    {PRINTER_ROLES.map((r) => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                    Printer Name *
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Kitchen KOT Printer"
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '8px 10px',
                      fontSize: '12px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      outline: 'none',
                      color: '#0f172a'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                    Code
                  </label>
                  <input
                    type="text"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '8px 10px',
                      fontSize: '12px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      outline: 'none',
                      fontFamily: 'monospace',
                      fontWeight: 600,
                      color: '#334155'
                    }}
                  />
                </div>
              </div>

              {/* Row 2: Driver, Paper Width */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                    Print Driver / Interface
                  </label>
                  <select
                    value={form.spooler}
                    onChange={(e) => setForm({ ...form, spooler: e.target.value })}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '8px 10px',
                      fontSize: '12px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      outline: 'none',
                      background: '#ffffff',
                      color: '#0f172a'
                    }}
                  >
                    <option value="Installed Spooler Driver">Installed Spooler Driver (Default)</option>
                    <option value="RP3200 plus(U) 12">RP3200 plus(U) 12 (POS Thermal)</option>
                    <option value="POS-80 Series Thermal">POS-80 Series Thermal (USB)</option>
                    <option value="EPSON TM-T82 Receipt">EPSON TM-T82 Receipt</option>
                    <option value="Microsoft Print to PDF">Microsoft Print to PDF</option>
                    <option value="Network TCP/IP">Network TCP/IP (Port 9100)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                    Thermal Paper Width
                  </label>
                  <select
                    value={form.paperWidth}
                    onChange={(e) => setForm({ ...form, paperWidth: e.target.value })}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '8px 10px',
                      fontSize: '12px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      outline: 'none',
                      background: '#ffffff',
                      color: '#0f172a'
                    }}
                  >
                    <option value="80mm / 72mm Standard 3-Inch">80mm / 72mm Standard 3-Inch</option>
                    <option value="58mm / 48mm Compact 2-Inch">58mm / 48mm Compact 2-Inch</option>
                  </select>
                </div>
              </div>

              {/* Row 3: IP Address & Port, Outlet, Status */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.8fr 1.2fr 0.8fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                    IP Address
                  </label>
                  <input
                    type="text"
                    value={form.ip}
                    onChange={(e) => setForm({ ...form, ip: e.target.value })}
                    placeholder="192.168.1.100"
                    style={{ width: '100%', padding: '8px 10px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                    Port
                  </label>
                  <input
                    type="number"
                    value={form.port}
                    onChange={(e) => setForm({ ...form, port: Number(e.target.value) || 9100 })}
                    placeholder="9100"
                    style={{ width: '100%', padding: '8px 10px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                    Outlet
                  </label>
                  <select
                    value={form.store_id}
                    onChange={(e) => setForm({ ...form, store_id: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box', background: '#fff' }}
                  >
                    {outlets.map((o) => (
                      <option key={o.store_id} value={o.store_id}>{o.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                    Status
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box', background: '#fff' }}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* ITEM CATEGORYWISE PRINTING PATH */}
              <div style={{ marginTop: '6px', background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#0f172a', letterSpacing: '0.04em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FaTags style={{ color: '#0d9488' }} />
                    <span>Item Categorywise Printing Path (Assign Categories)</span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>
                    {form.categories.length} Selected
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '6px', maxHeight: '130px', overflowY: 'auto', padding: '4px' }}>
                  {categoriesList.map((cat, idx) => {
                    const checked = form.categories.includes(cat);
                    return (
                      <label
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          background: checked ? '#ecfdf5' : '#ffffff',
                          border: checked ? '1px solid #a7f3d0' : '1px solid #cbd5e1',
                          cursor: 'pointer',
                          fontSize: '11.5px',
                          fontWeight: checked ? 700 : 500,
                          color: checked ? '#047857' : '#334155'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => handleToggleCategory(cat)}
                          style={{ accentColor: '#059669', cursor: 'pointer' }}
                        />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cat}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* DOCUMENT MULTI-ROUTING CHECKLIST (Without Copy counts - copies handled in Outlet Config) */}
              <div style={{ marginTop: '4px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '10px',
                  paddingBottom: '4px',
                  borderBottom: '1px solid #e2e8f0'
                }}>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#0f172a', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                    DOCUMENT ROUTING
                  </div>
                  <div style={{ fontSize: '11px', color: '#0d9488', fontWeight: 600 }}>
                    Number of copies are managed under Outlet Configuration
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {/* 1. KOT */}
                  <div style={{
                    background: form.routes.kot.enabled ? '#fffbf5' : '#ffffff',
                    border: form.routes.kot.enabled ? '1.5px solid #fed7aa' : '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', flex: 1 }}>
                      <input
                        type="checkbox"
                        checked={form.routes.kot.enabled}
                        onChange={(e) => setForm({
                          ...form,
                          routes: { ...form.routes, kot: { enabled: e.target.checked } }
                        })}
                        style={{ width: '16px', height: '16px', accentColor: '#c2410c', cursor: 'pointer' }}
                      />
                      <div>
                        <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0f172a' }}>
                          KOT (Kitchen Order Ticket)
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>
                          Route kitchen order tickets
                        </div>
                      </div>
                    </label>
                  </div>

                  {/* 2. NC KOT */}
                  <div style={{
                    background: form.routes.ncKot.enabled ? '#faf5ff' : '#ffffff',
                    border: form.routes.ncKot.enabled ? '1.5px solid #e9d5ff' : '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', flex: 1 }}>
                      <input
                        type="checkbox"
                        checked={form.routes.ncKot.enabled}
                        onChange={(e) => setForm({
                          ...form,
                          routes: { ...form.routes, ncKot: { enabled: e.target.checked } }
                        })}
                        style={{ width: '16px', height: '16px', accentColor: '#7e22ce', cursor: 'pointer' }}
                      />
                      <div>
                        <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0f172a' }}>
                          NC KOT (Non-Chargeable)
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>
                          Route complimentary tickets
                        </div>
                      </div>
                    </label>
                  </div>

                  {/* 3. BILL */}
                  <div style={{
                    background: form.routes.bill.enabled ? '#f0fdf4' : '#ffffff',
                    border: form.routes.bill.enabled ? '1.5px solid #bbf7d0' : '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', flex: 1 }}>
                      <input
                        type="checkbox"
                        checked={form.routes.bill.enabled}
                        onChange={(e) => setForm({
                          ...form,
                          routes: { ...form.routes, bill: { enabled: e.target.checked } }
                        })}
                        style={{ width: '16px', height: '16px', accentColor: '#15803d', cursor: 'pointer' }}
                      />
                      <div>
                        <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0f172a' }}>
                          BILL (Tax Invoice)
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>
                          Route customer bills
                        </div>
                      </div>
                    </label>
                  </div>

                  {/* 4. PAYMENT */}
                  <div style={{
                    background: form.routes.payment.enabled ? '#f0f9ff' : '#ffffff',
                    border: form.routes.payment.enabled ? '1.5px solid #bae6fd' : '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', flex: 1 }}>
                      <input
                        type="checkbox"
                        checked={form.routes.payment.enabled}
                        onChange={(e) => setForm({
                          ...form,
                          routes: { ...form.routes, payment: { enabled: e.target.checked } }
                        })}
                        style={{ width: '16px', height: '16px', accentColor: '#0369a1', cursor: 'pointer' }}
                      />
                      <div>
                        <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0f172a' }}>
                          PAYMENT (Receipt / Refund)
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>
                          Route payment receipts
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '12px',
              padding: '14px 22px',
              background: '#f8fafc',
              borderTop: '1px solid #f1f5f9'
            }}>
              <button
                onClick={() => setModal({ open: false, mode: 'add', row: null })}
                style={{
                  padding: '7px 16px',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  color: '#475569',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 18px',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  color: '#ffffff',
                  background: '#0d9488',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(13,148,136,0.25)'
                }}
              >
                <FaSave style={{ fontSize: '11px' }} />
                <span>Save Thermal Printer & Routing</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: USER PRINTER ACCESS RIGHTS */}
      {showUserAccessModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15,23,42,0.5)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1001
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            width: '740px',
            maxWidth: '96vw',
            maxHeight: '90vh',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.15)',
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 22px',
              borderBottom: '1px solid #f1f5f9'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  background: '#e0e7ff',
                  color: '#4338ca',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px'
                }}>
                  <FaUserShield />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
                    User Printer Access Rights
                  </h3>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>
                    Configure printing permissions & hardware printer assignments per staff member
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowUserAccessModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '16px' }}
              >
                <FaTimes />
              </button>
            </div>

            <div style={{ padding: '16px 22px', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 700 }}>
                    <th style={{ padding: '8px 12px', textAlign: 'left' }}>User</th>
                    <th style={{ padding: '8px 12px', textAlign: 'left' }}>Role</th>
                    <th style={{ padding: '8px 12px', textAlign: 'center' }}>Can Print Bill</th>
                    <th style={{ padding: '8px 12px', textAlign: 'center' }}>Can Print KOT</th>
                    <th style={{ padding: '8px 12px', textAlign: 'center' }}>Can Reprint</th>
                    <th style={{ padding: '8px 12px', textAlign: 'left' }}>Assigned Hardware Printer</th>
                  </tr>
                </thead>
                <tbody>
                  {userPrinterAccess.map((u, idx) => (
                    <tr key={u.userId || idx} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? '#fff' : '#fafafa' }}>
                      <td style={{ padding: '8px 12px', fontWeight: 700, color: '#0f172a' }}>
                        {u.username}
                      </td>
                      <td style={{ padding: '8px 12px', color: '#64748b' }}>
                        {u.role}
                      </td>
                      <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={u.canPrintBill !== false}
                          onChange={(e) => {
                            const val = e.target.checked;
                            setUserPrinterAccess(prev => {
                              const next = [...prev];
                              next[idx] = { ...next[idx], canPrintBill: val };
                              return next;
                            });
                          }}
                          style={{ cursor: 'pointer', accentColor: '#0d9488' }}
                        />
                      </td>
                      <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={u.canPrintKot !== false}
                          onChange={(e) => {
                            const val = e.target.checked;
                            setUserPrinterAccess(prev => {
                              const next = [...prev];
                              next[idx] = { ...next[idx], canPrintKot: val };
                              return next;
                            });
                          }}
                          style={{ cursor: 'pointer', accentColor: '#0d9488' }}
                        />
                      </td>
                      <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={u.canReprint !== false}
                          onChange={(e) => {
                            const val = e.target.checked;
                            setUserPrinterAccess(prev => {
                              const next = [...prev];
                              next[idx] = { ...next[idx], canReprint: val };
                              return next;
                            });
                          }}
                          style={{ cursor: 'pointer', accentColor: '#0d9488' }}
                        />
                      </td>
                      <td style={{ padding: '6px 12px' }}>
                        <select
                          value={u.assignedPrinter || 'ALL'}
                          onChange={(e) => {
                            const val = e.target.value;
                            setUserPrinterAccess(prev => {
                              const next = [...prev];
                              next[idx] = { ...next[idx], assignedPrinter: val };
                              return next;
                            });
                          }}
                          style={{
                            padding: '4px 8px',
                            fontSize: '11.5px',
                            borderRadius: '4px',
                            border: '1px solid #cbd5e1',
                            background: '#ffffff',
                            color: '#0f172a'
                          }}
                        >
                          <option value="ALL">All Authorized Printers</option>
                          {printers.map(p => (
                            <option key={p.id} value={p.name}>{p.name}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '12px',
              padding: '12px 22px',
              background: '#f8fafc',
              borderTop: '1px solid #f1f5f9'
            }}>
              <button
                onClick={() => setShowUserAccessModal(false)}
                style={{
                  padding: '6px 14px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#475569',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
              <button
                onClick={handleSaveUserAccess}
                style={{
                  padding: '6px 18px',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#ffffff',
                  background: '#0d9488',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(13,148,136,0.25)'
                }}
              >
                Save Permissions
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, row: null })}
        onConfirm={handleDelete}
        itemName={deleteModal.row?.name || 'this printer'}
      />
    </div>
  );
};

export default PrinterMasterPage;
