import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  FaFileInvoiceDollar,
  FaPrint,
  FaEye,
  FaTrashAlt,
  FaSearch,
  FaReceipt,
  FaUtensils,
  FaExclamationTriangle,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaFilter,
  FaTimes
} from 'react-icons/fa';
import CommonModal from '../../../components/common/CommonModal';
import DeleteConfirmationModal from '../../../components/common/DeleteConfirmationModal';
import OrderInspectorModal from '../components/OrderInspectorModal';
import { orderService } from '../../../services/orderService';
import { printTaxInvoice } from '../utils/printInvoice';
import { useRestaurant } from '../../../context/RestaurantContext';
import { formatTableNo, formatTableLabel } from '../../../utils/tableFormat';

const OrderDetailsPage = ({ showToast }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isCheckMaster = location.pathname.includes('/master/check') || location.pathname.includes('/masters/check');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [paymentModeFilter, setPaymentModeFilter] = useState('All');
  const [areaFilter, setAreaFilter] = useState('All');

  // Filter Modal state for Check Master / Order Details
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [modalFromDate, setModalFromDate] = useState('');
  const [modalToDate, setModalToDate] = useState('');
  const [modalPaymentMode, setModalPaymentMode] = useState('All');

  const [selectedBill, setSelectedBill] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ open: false, row: null });
  const [deleteAllModal, setDeleteAllModal] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);

  // Row selection state (Select All checks/orders)
  const [selectedRowIds, setSelectedRowIds] = useState([]);
  const [isDeletingSelected, setIsDeletingSelected] = useState(false);

  const { tables, activeStoreId } = useRestaurant();

  // Keep modal inputs in sync when opening the modal
  const openFilterModal = () => {
    setModalFromDate(fromDate);
    setModalToDate(toDate);
    setModalPaymentMode(paymentModeFilter);
    setIsFilterModalOpen(true);
  };

  const applyModalFilters = () => {
    setFromDate(modalFromDate);
    setToDate(modalToDate);
    setPaymentModeFilter(modalPaymentMode);
    setIsFilterModalOpen(false);
  };

  const resetModalFilters = () => {
    setModalFromDate('');
    setModalToDate('');
    setModalPaymentMode('All');
    setFromDate('');
    setToDate('');
    setPaymentModeFilter('All');
    setIsFilterModalOpen(false);
  };

  // Role detection: Only Admin can see and execute delete options
  const isUserAdmin = useMemo(() => {
    try {
      const userRaw = localStorage.getItem('alfa_user') || localStorage.getItem('user');
      if (!userRaw) return true; // Default admin if no explicit user stored
      const u = JSON.parse(userRaw);
      const role = String(u.role || u.type || u.user_role || '').toUpperCase();
      return role === 'ADMIN' || role === 'SUPERADMIN' || u.username === 'admin' || u.role_id === 1;
    } catch {
      return true;
    }
  }, []);

  const toast = (msg, type = 'success') => {
    if (typeof showToast === 'function') {
      showToast(msg, type);
    } else if (window.showToast) {
      window.showToast(msg, type);
    }
  };

  const availableAreas = useMemo(() => {
    const areaSet = new Set();
    tables.forEach(t => {
      const a = t.area || t.area_name;
      if (a && String(a).trim()) areaSet.add(String(a).trim());
    });
    return Array.from(areaSet);
  }, [tables]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await orderService.getOrders({ store_id: activeStoreId });
      const rawOrders = res?.orders || res?.data || [];
      if (Array.isArray(rawOrders)) {
        const mapped = rawOrders.map((o, idx) => {
          return {
            id: o.id || o.order_id || o.billNo || (idx + 1),
            billNo: o.billNo || `Bill ${o.order_number || o.orderNo || (idx + 1)}`,
            tableNo: formatTableNo(o.tableNo || o.table_name || o.table_id || (idx + 1)),
            table_id: o.table_id || o.tableId,
            billType: o.billType || o.order_type || 'Dine In',
            billDate: (() => {
              // Try my_order_date first (e.g. "2026-10-22" or "2026-10-24")
              if (o.my_order_date && String(o.my_order_date).trim() && String(o.my_order_date).includes('-')) {
                const parts = String(o.my_order_date).trim().split('T')[0].split('-');
                if (parts.length === 3) {
                  return `${parts[2]}/${parts[1]}/${parts[0]}`; // DD/MM/YYYY
                }
              }

              // Try created_time if epoch or date
              const timeCandidate = o.created_time || o.actual_created_time || o.intime || o.createdAt;
              if (timeCandidate) {
                let parsed = timeCandidate;
                if (typeof parsed === 'string' && /^\d+$/.test(parsed)) parsed = Number(parsed);
                if (typeof parsed === 'number') {
                  const dt = new Date(parsed < 1e12 ? parsed * 1000 : parsed);
                  if (!isNaN(dt.getTime())) return dt.toLocaleDateString();
                } else if (typeof parsed === 'string' && parsed.includes('-')) {
                  const dt = new Date(parsed);
                  if (!isNaN(dt.getTime())) return dt.toLocaleDateString();
                }
              }

              if (o.billDate && typeof o.billDate === 'string' && o.billDate !== '—') {
                return o.billDate;
              }

              return '—';
            })(),
            isoDate: (() => {
              if (o.my_order_date && String(o.my_order_date).trim() && String(o.my_order_date).includes('-')) {
                return String(o.my_order_date).trim().split('T')[0];
              }
              const timeCandidate = o.createdAt || o.created_time || o.actual_created_time || o.billDate;
              if (timeCandidate) {
                let parsed = timeCandidate;
                if (typeof parsed === 'string' && /^\d+$/.test(parsed)) parsed = Number(parsed);
                if (typeof parsed === 'number') {
                  const dt = new Date(parsed < 1e12 ? parsed * 1000 : parsed);
                  if (!isNaN(dt.getTime())) return dt.toISOString().slice(0, 10);
                } else if (typeof parsed === 'string' && parsed.includes('-')) {
                  const dt = new Date(parsed);
                  if (!isNaN(dt.getTime())) return dt.toISOString().slice(0, 10);
                }
              }
              return '';
            })(),
            billTime: (() => {
              const formatTo12Hr = (dateObj) => {
                if (!dateObj || isNaN(dateObj.getTime())) return null;
                let hours = dateObj.getHours();
                const minutes = String(dateObj.getMinutes()).padStart(2, '0');
                const ampm = hours >= 12 ? 'pm' : 'am';
                hours = hours % 12;
                hours = hours ? hours : 12; // 0 becomes 12
                const strHours = String(hours).padStart(2, '0');
                return `${strHours}:${minutes} ${ampm}`;
              };

              const parseTimeString = (str) => {
                if (!str || typeof str !== 'string') return null;
                const trimmed = str.trim();
                // Check if it's already HH:MM or HH:MM:SS (with optional AM/PM)
                const match12 = trimmed.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(am|pm)?$/i);
                if (match12) {
                  let h = parseInt(match12[1], 10);
                  const m = match12[2].padStart(2, '0');
                  const mer = match12[3] ? match12[3].toLowerCase() : null;
                  if (mer) {
                    if (mer === 'pm' && h < 12) h += 12;
                    if (mer === 'am' && h === 12) h = 0;
                  }
                  const ampm = h >= 12 ? 'pm' : 'am';
                  let h12 = h % 12;
                  h12 = h12 ? h12 : 12;
                  return `${String(h12).padStart(2, '0')}:${m} ${ampm}`;
                }
                const dt = new Date(trimmed);
                return formatTo12Hr(dt);
              };

              // 1. Try formatted string in bill_date, intime or actual_created_time
              const directTime = o.actual_created_time || o.intime || o.created_time || o.bill_date;
              if (directTime) {
                if (typeof directTime === 'string') {
                  if (/^\d+$/.test(directTime)) {
                    const tNum = Number(directTime);
                    const dt = new Date(tNum < 1e12 ? tNum * 1000 : tNum);
                    const formatted = formatTo12Hr(dt);
                    if (formatted) return formatted;
                  }
                  const parsed = parseTimeString(directTime);
                  if (parsed) return parsed;
                } else if (typeof directTime === 'number') {
                  const dt = new Date(directTime < 1e12 ? directTime * 1000 : directTime);
                  const formatted = formatTo12Hr(dt);
                  if (formatted) return formatted;
                }
              }

              // 2. Try createdAt
              if (o.createdAt) {
                const dt = new Date(o.createdAt);
                const formatted = formatTo12Hr(dt);
                if (formatted) return formatted;
              }

              // 3. Fallback from o.billTime if available
              if (o.billTime && typeof o.billTime === 'string') {
                const parsed = parseTimeString(o.billTime);
                if (parsed) return parsed;
              }

              return '—';
            })(),
            orderNo: String(o.orderNo || o.order_number || (idx + 1)),
            amount: Number(o.amount || o.total_amount || o.order_total || 0),
            taxAmount: Number(o.tax_amount || o.total_tax || o.order_level_total_taxes || o.tax || o.taxes?.total || (Number(o.cgst || 0) + Number(o.sgst || 0)) || 0),
            subtotal: Number(o.subtotal || o.order_subtotal || 0),
            customerName: o.customerName || o.customer_name || 'Walk-in',
            mobileNo: o.mobileNo || o.mobile_no || o.customer_phone || o.phone || o.mobile || '—',
            waiter: o.waiter || o.waiter_name || 'Staff',
            payment_status: (String(o.payment_status).toLowerCase() === 'unpaid' || String(o.order_status).toLowerCase() === 'running' || String(o.status).toLowerCase() === 'unpaid')
              ? 'Unpaid'
              : (o.payment_status || 'Paid'),
            paymentMode: (() => {
              const isUnpaid = String(o.payment_status).toLowerCase() === 'unpaid' || String(o.order_status).toLowerCase() === 'running' || String(o.status).toLowerCase() === 'unpaid';
              if (isUnpaid) return '—';
              const extra = typeof o.extra_details === 'string' ? JSON.parse(o.extra_details || '{}') : (o.extra_details || {});
              const rawMode = o.paymentMode || o.payment_mode || o.payment || o.payment_method || extra.payment_mode || extra.paymentMode || extra.paymentMethod;
              if (rawMode && String(rawMode).trim() && String(rawMode).trim() !== '—') return String(rawMode).trim();
              return 'Cash';
            })(),
            items: o.items || [],
            extra_details: typeof o.extra_details === 'string' ? JSON.parse(o.extra_details || '{}') : (o.extra_details || {})
          };
        });
        setData(mapped);
      }
    } catch (err) {
      console.warn('Error loading live orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [activeStoreId]);

  // Filtering
  const filteredData = useMemo(() => {
    return data.filter(row => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesQuery =
          String(row.billNo).toLowerCase().includes(q) ||
          String(row.tableNo).toLowerCase().includes(q) ||
          String(row.customerName).toLowerCase().includes(q) ||
          String(row.mobileNo).toLowerCase().includes(q) ||
          String(row.orderNo).toLowerCase().includes(q) ||
          String(row.waiter).toLowerCase().includes(q);
        if (!matchesQuery) return false;
      }

      // From Date Filter
      if (fromDate) {
        if (row.isoDate && row.isoDate < fromDate) return false;
      }

      // To Date Filter
      if (toDate) {
        if (row.isoDate && row.isoDate > toDate) return false;
      }

      // Order Type
      if (typeFilter !== 'All') {
        if (row.billType.toLowerCase() !== typeFilter.toLowerCase()) return false;
      }

      // Payment Status
      if (statusFilter !== 'All') {
        if (row.payment_status.toLowerCase() !== statusFilter.toLowerCase()) return false;
      }

      // Payment Mode Filter
      if (paymentModeFilter !== 'All') {
        if (String(row.paymentMode).toLowerCase() !== paymentModeFilter.toLowerCase()) return false;
      }

      // Area Filter
      if (areaFilter !== 'All') {
        const matchingTable = tables.find(t => String(t.id) === String(row.table_id) || t.no === row.tableNo);
        const area = matchingTable?.area || matchingTable?.area_name;
        if (area !== areaFilter) return false;
      }

      return true;
    });
  }, [data, searchQuery, fromDate, toDate, typeFilter, statusFilter, paymentModeFilter, areaFilter, tables]);

  // Extract numeric bill index e.g. "Bill 15" -> 15
  const extractBillNum = (billNo) => {
    if (!billNo) return null;
    const match = String(billNo).match(/bill\s*(\d+)/i) || String(billNo).match(/(\d+)/);
    return match ? parseInt(match[1], 10) : null;
  };

  // Helper to store deleted bill records in localStorage for sequence audit
  const recordDeletedBills = (billsToDelete) => {
    try {
      const existing = JSON.parse(localStorage.getItem('alfa_deleted_bills_history') || '[]');
      const updated = [...existing];
      billsToDelete.forEach(b => {
        const num = extractBillNum(b.billNo);
        if (!updated.some(u => (num !== null && u.numericBillNo === num) || String(u.billNo) === String(b.billNo))) {
          updated.push({
            id: `deleted-${b.id || b.billNo}`,
            billNo: b.billNo,
            numericBillNo: num,
            billDate: b.billDate || new Date().toLocaleDateString(),
            billTime: b.billTime || '',
            deletedAt: new Date().toISOString(),
            isDeleted: true
          });
        }
      });
      localStorage.setItem('alfa_deleted_bills_history', JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to record deleted bills:', e);
    }
  };

  // Inline update payment mode (UPI, Cash, Card, etc.) in each row
  const handlePaymentModeChange = async (row, newMode) => {
    if (!row || !row.id || row.isDeleted) return;
    try {
      setData(prev =>
        prev.map(item =>
          item.id === row.id ? { ...item, paymentMode: newMode } : item
        )
      );
      await orderService.updateOrder(row.id, {
        paymentMode: newMode,
        paymentMethod: newMode,
        payment: newMode,
        payment_mode: newMode
      });
      toast(`Payment mode updated to ${newMode} for ${row.billNo}`, 'success');
    } catch (err) {
      console.error('Error updating payment mode:', err);
      toast('Failed to update payment mode: ' + (err.message || 'Server error'), 'error');
      loadOrders();
    }
  };

  // Sequence gap & deleted bill detection for Check Master
  const displayRows = useMemo(() => {
    if (!isCheckMaster) {
      return filteredData;
    }
    if (filteredData.length === 0) return [];

    // Map active bills by numeric number
    const activeMap = new Map();
    const activeNums = [];
    filteredData.forEach(row => {
      const num = extractBillNum(row.billNo);
      if (num !== null) {
        activeMap.set(num, row);
        activeNums.push(num);
      }
    });

    let storedDeleted = [];
    try {
      storedDeleted = JSON.parse(localStorage.getItem('alfa_deleted_bills_history') || '[]');
    } catch (e) { }

    const storedMap = new Map();
    storedDeleted.forEach(d => {
      const num = d.numericBillNo !== undefined && d.numericBillNo !== null ? d.numericBillNo : extractBillNum(d.billNo);
      if (num !== null) storedMap.set(num, d);
    });

    const allNums = Array.from(new Set([...activeNums, ...Array.from(storedMap.keys())]));
    if (allNums.length === 0) return filteredData;

    const minNum = Math.min(...allNums);
    const maxNum = Math.max(...allNums);

    // Identify consecutive deleted sequences (e.g. Bill 15 to Bill 19 missing -> count = 5)
    const consecutiveDeletedMap = new Map();
    let currentBlock = [];
    for (let n = minNum; n <= maxNum; n++) {
      if (!activeMap.has(n)) {
        currentBlock.push(n);
      } else {
        if (currentBlock.length > 0) {
          const info = {
            count: currentBlock.length,
            start: currentBlock[0],
            end: currentBlock[currentBlock.length - 1]
          };
          currentBlock.forEach(num => consecutiveDeletedMap.set(num, info));
          currentBlock = [];
        }
      }
    }
    if (currentBlock.length > 0) {
      const info = {
        count: currentBlock.length,
        start: currentBlock[0],
        end: currentBlock[currentBlock.length - 1]
      };
      currentBlock.forEach(num => consecutiveDeletedMap.set(num, info));
    }

    // Determine current order direction (descending or ascending)
    const firstNum = extractBillNum(filteredData[0]?.billNo);
    const lastNum = extractBillNum(filteredData[filteredData.length - 1]?.billNo);
    const isDescending = (firstNum !== null && lastNum !== null) ? firstNum >= lastNum : true;

    const result = [];
    const fromNum = isDescending ? maxNum : minNum;
    const toNum = isDescending ? minNum : maxNum;
    const step = isDescending ? -1 : 1;

    for (let n = fromNum; isDescending ? n >= toNum : n <= toNum; n += step) {
      if (activeMap.has(n)) {
        result.push(activeMap.get(n));
      } else {
        const stored = storedMap.get(n);
        const groupInfo = consecutiveDeletedMap.get(n) || { count: 1, start: n, end: n };
        result.push({
          id: `deleted-bill-${n}`,
          billNo: `Bill ${n}`,
          numericBillNo: n,
          tableNo: '—',
          billType: '—',
          billDate: stored?.billDate || '—',
          billTime: stored?.billTime || '',
          customerName: '—',
          mobileNo: '—',
          waiter: '—',
          taxAmount: 0,
          amount: 0,
          paymentMode: '—',
          payment_status: 'Deleted',
          isDeleted: true,
          deletedGroup: groupInfo
        });
      }
    }

    // Append non-numeric bills if any
    filteredData.forEach(row => {
      if (extractBillNum(row.billNo) === null) {
        result.push(row);
      }
    });

    return result;
  }, [filteredData, isCheckMaster, data]);

  // Metric stats (reflects filtered checks / orders)
  const metrics = useMemo(() => {
    const list = filteredData;
    const totalOrders = list.length;
    const totalRev = list.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
    const totalTax = list.reduce((sum, r) => sum + (Number(r.taxAmount) || 0), 0);
    const dineInCount = list.filter(r => r.billType.toLowerCase().includes('dine')).length;
    const takeawayCount = list.filter(r => r.billType.toLowerCase().includes('takeaway')).length;
    const deliveryCount = list.filter(r => r.billType.toLowerCase().includes('delivery')).length;
    return { totalOrders, totalRev, totalTax, dineInCount, takeawayCount, deliveryCount };
  }, [filteredData]);

  // Unique payment modes for filter
  const availablePaymentModes = useMemo(() => {
    const modes = new Set();
    data.forEach(r => {
      if (r.paymentMode && r.paymentMode !== '—') modes.add(r.paymentMode);
    });
    return Array.from(modes);
  }, [data]);

  const handleOpenInvoice = async (row) => {
    try {
      const res = await orderService.getOrderById(row.id);
      const fetchedOrder = res?.order || res?.data;

      const matchingTable = tables.find(t => String(t.id) === String(row.table_id) || String(t.id) === String(fetchedOrder?.table_id) || t.no === row.tableNo);
      const displayTableName = matchingTable
        ? (matchingTable.table_name || formatTableNo(matchingTable.no || matchingTable.table_no, matchingTable.prefix))
        : formatTableNo(row.tableNo || '1');

      if (fetchedOrder) {
        fetchedOrder.table_name = displayTableName;
        printTaxInvoice(fetchedOrder);
      } else {
        row.table_name = displayTableName;
        printTaxInvoice(row);
      }
    } catch (err) {
      console.warn('Error printing invoice:', err);
      printTaxInvoice(row);
    }
  };

  const handleMenuClick = (bill) => {
    setSelectedBill(bill);
    setIsModalOpen(true);
  };

  // Delete single order (Admin only)
  const handleDelete = async () => {
    if (deleteModal.row) {
      try {
        recordDeletedBills([deleteModal.row]);
        await orderService.deleteOrder(deleteModal.row.id);
        setData(prev => prev.filter(item => item.id !== deleteModal.row.id));
        setSelectedRowIds(prev => prev.filter(id => id !== deleteModal.row.id));
        toast('Order deleted successfully.', 'success');
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('tableMasterRefreshed'));
          window.dispatchEvent(new CustomEvent('tablesMasterRefreshed'));
        }
      } catch (err) {
        toast('Error deleting order: ' + (err.message || 'Server error'), 'error');
      }
    }
    setDeleteModal({ open: false, row: null });
  };

  // Row selection helpers
  const isAllSelected = useMemo(() => {
    if (filteredData.length === 0) return false;
    return filteredData.every(r => selectedRowIds.includes(r.id));
  }, [filteredData, selectedRowIds]);

  const isIndeterminate = useMemo(() => {
    if (filteredData.length === 0) return false;
    const selectedCountInFiltered = filteredData.filter(r => selectedRowIds.includes(r.id)).length;
    return selectedCountInFiltered > 0 && selectedCountInFiltered < filteredData.length;
  }, [filteredData, selectedRowIds]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allFilteredIds = filteredData.map(r => r.id);
      setSelectedRowIds(prev => Array.from(new Set([...prev, ...allFilteredIds])));
    } else {
      const allFilteredIdSet = new Set(filteredData.map(r => r.id));
      setSelectedRowIds(prev => prev.filter(id => !allFilteredIdSet.has(id)));
    }
  };

  const handleSelectRow = (id) => {
    setSelectedRowIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleDeleteSelected = async () => {
    if (selectedRowIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedRowIds.length} selected order(s)?`)) return;

    setIsDeletingSelected(true);
    try {
      const toDelete = data.filter(item => selectedRowIds.includes(item.id));
      recordDeletedBills(toDelete);
      for (const id of selectedRowIds) {
        await orderService.deleteOrder(id).catch(err => console.warn('Failed to delete row', id, err));
      }
      setData(prev => prev.filter(item => !selectedRowIds.includes(item.id)));
      setSelectedRowIds([]);
      toast(`Successfully deleted ${selectedRowIds.length} selected orders.`, 'success');
    } catch (err) {
      toast('Error deleting selected orders: ' + (err.message || 'Server error'), 'error');
    } finally {
      setIsDeletingSelected(false);
    }
  };

  const handleDeleteAll = async () => {
    setIsDeletingAll(true);
    try {
      await orderService.deleteAllOrders();
      setData([]);
      setSelectedRowIds([]);
      toast('All order history has been deleted permanently.', 'success');
    } catch (err) {
      toast('Failed to clear orders: ' + (err.message || 'Server error'), 'error');
    } finally {
      setIsDeletingAll(false);
      setDeleteAllModal(false);
    }
  };

  return (
    <div style={{ padding: '24px', background: '#f8fafc', minHeight: '100%', fontFamily: 'var(--font-family, system-ui)' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#0e7490', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
              <FaReceipt />
            </div>
            <div>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                {isCheckMaster ? 'Check Master' : 'Order Details'}
              </h1>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                {isCheckMaster
                  ? 'Inspect checks, customer orders, settled invoices & bill audits'
                  : 'View and manage settlement invoices, customer receipts & historical bills'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '20px' }}>
        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Orders</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0f172a', marginTop: '4px' }}>{metrics.totalOrders}</div>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>Recorded in database</div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Revenue</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0e7490', marginTop: '4px' }}>₹{metrics.totalRev.toFixed(2)}</div>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>Gross bill settlements</div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)', borderTop: '3px solid #059669' }}>
          <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Tax</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#059669', marginTop: '4px' }}>₹{metrics.totalTax.toFixed(2)}</div>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>GST / Service tax collected</div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Dine-In Orders</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#2563eb', marginTop: '4px' }}>{metrics.dineInCount}</div>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>Table dining orders</div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Takeaway & Delivery</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#d97706', marginTop: '4px' }}>{metrics.takeawayCount + metrics.deliveryCount}</div>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>Pick-up and dispatch</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '14px 18px', marginBottom: '18px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: '1', minWidth: '220px' }}>
            <FaSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '0.85rem' }} />
            <input
              type="text"
              placeholder="Search by Bill No, table, guest, waiter..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '9px 12px 9px 34px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.84rem',
                outline: 'none',
                color: '#0f172a'
              }}
            />
          </div>

          {/* Filters & Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* Modal Trigger for Date Range & Payment Mode Filter — ONLY on Check Master */}
            {isCheckMaster && (
              <button
                type="button"
                onClick={openFilterModal}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: (fromDate || toDate || paymentModeFilter !== 'All') ? '#eff6ff' : '#ffffff',
                  border: (fromDate || toDate || paymentModeFilter !== 'All') ? '1.5px solid #3b82f6' : '1px solid #cbd5e1',
                  color: (fromDate || toDate || paymentModeFilter !== 'All') ? '#1d4ed8' : '#334155',
                  padding: '7px 14px',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: (fromDate || toDate || paymentModeFilter !== 'All') ? '0 1px 3px rgba(59,130,246,0.15)' : 'none'
                }}
                title="Open filter modal to select From Date, To Date and Payment Mode"
              >
                <FaCalendarAlt size={12} color={fromDate || toDate || paymentModeFilter !== 'All' ? '#2563eb' : '#64748b'} />
                <span>Filter Date & Mode</span>
                {(fromDate || toDate || paymentModeFilter !== 'All') && (
                  <span style={{
                    background: '#2563eb',
                    color: '#ffffff',
                    fontSize: '0.65rem',
                    padding: '1px 6px',
                    borderRadius: '10px',
                    fontWeight: 800
                  }}>
                    Active
                  </span>
                )}
              </button>
            )}

            {/* Type */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.76rem', fontWeight: 700, color: '#64748b' }}>Type:</span>
              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
                style={{
                  padding: '7px 10px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: '#334155',
                  outline: 'none',
                  background: '#ffffff'
                }}
              >
                <option value="All">All Types</option>
                <option value="Dine In">Dine In</option>
                <option value="Takeaway">Takeaway</option>
                <option value="Delivery">Delivery</option>
              </select>
            </div>

            {/* Status */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.76rem', fontWeight: 700, color: '#64748b' }}>Status:</span>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                style={{
                  padding: '7px 10px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: '#334155',
                  outline: 'none',
                  background: '#ffffff'
                }}
              >
                <option value="All">All Statuses</option>
                <option value="Paid">Paid</option>
                <option value="Unpaid">Unpaid</option>
                <option value="Partial">Partial</option>
              </select>
            </div>

            {/* Area */}
            {availableAreas.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.76rem', fontWeight: 700, color: '#64748b' }}>Area:</span>
                <select
                  value={areaFilter}
                  onChange={e => setAreaFilter(e.target.value)}
                  style={{
                    padding: '7px 10px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: '#334155',
                    outline: 'none',
                    background: '#ffffff'
                  }}
                >
                  <option value="All">All Areas</option>
                  {availableAreas.map(a => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Clear All Filters Button */}
            {(fromDate || toDate || paymentModeFilter !== 'All' || typeFilter !== 'All' || statusFilter !== 'All' || areaFilter !== 'All' || searchQuery) && (
              <button
                type="button"
                onClick={() => {
                  setFromDate('');
                  setToDate('');
                  setPaymentModeFilter('All');
                  setTypeFilter('All');
                  setStatusFilter('All');
                  setAreaFilter('All');
                  setSearchQuery('');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  color: '#475569',
                  padding: '6px 10px',
                  borderRadius: '8px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
                className="hover:bg-slate-200"
                title="Reset all filters"
              >
                <FaTimes size={11} />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Active Modal Filter Pills (From Date, To Date, Payment Mode) */}
        {(fromDate || toDate || paymentModeFilter !== 'All') && (
          <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px dashed #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b' }}>Active Filters:</span>
            {fromDate && (
              <span style={{ background: '#dbeafe', color: '#1e40af', padding: '3px 8px', borderRadius: '6px', fontSize: '0.74rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                From: {fromDate}
                <FaTimes style={{ cursor: 'pointer' }} onClick={() => setFromDate('')} />
              </span>
            )}
            {toDate && (
              <span style={{ background: '#dbeafe', color: '#1e40af', padding: '3px 8px', borderRadius: '6px', fontSize: '0.74rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                To: {toDate}
                <FaTimes style={{ cursor: 'pointer' }} onClick={() => setToDate('')} />
              </span>
            )}
            {paymentModeFilter !== 'All' && (
              <span style={{ background: '#dcfce7', color: '#166534', padding: '3px 8px', borderRadius: '6px', fontSize: '0.74rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                Mode: {paymentModeFilter}
                <FaTimes style={{ cursor: 'pointer' }} onClick={() => setPaymentModeFilter('All')} />
              </span>
            )}
            <button
              type="button"
              onClick={openFilterModal}
              style={{ background: 'transparent', border: 'none', color: '#2563eb', fontSize: '0.74rem', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
            >
              Edit filter
            </button>
          </div>
        )}
      </div>

      {/* Main Table */}
      <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
        {/* Bulk Selection Action Bar - ONLY on Check Master */}
        {isCheckMaster && selectedRowIds.length > 0 && (
          <div style={{
            background: '#f0fdf4',
            borderBottom: '1.5px solid #bbf7d0',
            padding: '10px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{
                background: '#16a34a',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.75rem',
                padding: '3px 9px',
                borderRadius: '12px'
              }}>
                {selectedRowIds.length} Selected
              </span>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#166534' }}>
                {selectedRowIds.length === filteredData.length
                  ? `All ${filteredData.length} records on this screen are selected`
                  : `${selectedRowIds.length} of ${filteredData.length} records selected`}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setSelectedRowIds([])}
                style={{
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  color: '#475569',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Deselect All
              </button>

              {isUserAdmin && (
                <button
                  type="button"
                  onClick={handleDeleteSelected}
                  disabled={isDeletingSelected}
                  style={{
                    background: '#dc2626',
                    border: 'none',
                    color: '#ffffff',
                    padding: '6px 14px',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    cursor: isDeletingSelected ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 1px 2px rgba(220,38,38,0.2)'
                  }}
                >
                  <FaTrashAlt size={11} />
                  <span>{isDeletingSelected ? 'Deleting...' : `Delete Selected (${selectedRowIds.length})`}</span>
                </button>
              )}
            </div>
          </div>
        )}

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {/* Select All Column — ONLY on Check Master */}
              {isCheckMaster && (
                <th style={{ padding: '14px 12px 14px 16px', width: '40px', textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={el => { if (el) el.indeterminate = isIndeterminate; }}
                    onChange={handleSelectAll}
                    style={{
                      cursor: 'pointer',
                      width: '16px',
                      height: '16px',
                      accentColor: '#0e7490'
                    }}
                    title={isAllSelected ? "Deselect All" : "Select All"}
                  />
                </th>
              )}
              <th style={{ padding: '14px 16px' }}>Bill No</th>
              <th style={{ padding: '14px 16px' }}>Table / Target</th>
              <th style={{ padding: '14px 16px' }}>Type</th>
              <th style={{ padding: '14px 16px' }}>Date & Time</th>
              <th style={{ padding: '14px 16px' }}>Guest / Phone</th>
              <th style={{ padding: '14px 16px' }}>Waiter</th>
              <th style={{ padding: '14px 16px', textAlign: 'right' }}>Tax</th>
              <th style={{ padding: '14px 16px', textAlign: 'right' }}>Amount</th>
              <th style={{ padding: '14px 16px', textAlign: 'center' }}>Payment Mode</th>
              <th style={{ padding: '14px 16px', textAlign: 'center' }}>Status</th>
              <th style={{ padding: '14px 16px', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={isCheckMaster ? 12 : 11} style={{ padding: '48px', textAlign: 'center', color: '#64748b' }}>
                  Loading order history...
                </td>
              </tr>
            ) : filteredData.length === 0 ? (
              <tr>
                <td colSpan={isCheckMaster ? 12 : 11} style={{ padding: '56px 24px', textAlign: 'center', color: '#94a3b8' }}>
                  <FaReceipt size={32} style={{ opacity: 0.25, display: 'block', margin: '0 auto 10px' }} />
                  <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#64748b' }}>No orders found</span>
                  <div style={{ fontSize: '0.78rem', marginTop: '4px' }}>
                    {data.length === 0 ? 'All past orders have been cleared or no sales recorded yet.' : 'Try adjusting your search query or filters.'}
                  </div>
                </td>
              </tr>
            ) : (
                displayRows.map((row, idx) => {
                  const isSelected = selectedRowIds.includes(row.id);
                  const isDeleted = Boolean(row.isDeleted);
                  const isPaid = String(row.payment_status).toUpperCase() === 'PAID';
                  const typeColor =
                    row.billType.toLowerCase().includes('dine') ? { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' } :
                      row.billType.toLowerCase().includes('takeaway') ? { bg: '#fff7ed', text: '#c2410c', border: '#fed7aa' } :
                        { bg: '#faf5ff', text: '#7e22ce', border: '#e9d5ff' };

                  return (
                    <tr
                      key={row.id}
                      style={{
                        borderBottom: idx < displayRows.length - 1 ? '1px solid #f1f5f9' : 'none',
                        background: isDeleted
                          ? '#fff1f2'
                          : isSelected
                            ? '#f0fdf4'
                            : '#ffffff',
                        borderLeft: isDeleted ? '4px solid #f43f5e' : 'none',
                        transition: 'background 0.12s ease'
                      }}
                      onMouseEnter={e => {
                        if (!isSelected && !isDeleted) e.currentTarget.style.background = '#f8fafc';
                      }}
                      onMouseLeave={e => {
                        if (!isSelected && !isDeleted) e.currentTarget.style.background = '#ffffff';
                      }}
                    >
                      {/* Row Selection Checkbox — ONLY on Check Master */}
                      {isCheckMaster && (
                        <td style={{ padding: '12px 12px 12px 16px', textAlign: 'center' }}>
                          {isDeleted ? (
                            <span style={{ color: '#cbd5e1', fontSize: '0.78rem' }}>—</span>
                          ) : (
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleSelectRow(row.id)}
                              style={{
                                cursor: 'pointer',
                                width: '16px',
                                height: '16px',
                                accentColor: '#0e7490'
                              }}
                            />
                          )}
                        </td>
                      )}
                      {/* Bill No */}
                      <td style={{ padding: '12px 16px' }}>
                        {isDeleted ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                            <span style={{ fontWeight: 800, color: '#e11d48', textDecoration: 'line-through', fontSize: '0.85rem' }}>
                              {row.billNo}
                            </span>
                            <span style={{
                              background: '#ffe4e6',
                              color: '#be123c',
                              border: '1px solid #fecdd3',
                              fontSize: '0.66rem',
                              fontWeight: 800,
                              padding: '1px 5px',
                              borderRadius: '4px',
                              textTransform: 'uppercase'
                            }}>
                              Deleted
                            </span>
                            {row.deletedGroup && row.deletedGroup.count > 1 && (
                              <span
                                style={{
                                  background: '#fef3c7',
                                  color: '#92400e',
                                  border: '1px solid #fde68a',
                                  fontSize: '0.66rem',
                                  fontWeight: 800,
                                  padding: '1px 5px',
                                  borderRadius: '4px'
                                }}
                                title={`${row.deletedGroup.count} bills deleted in this sequence (Bill ${row.deletedGroup.start} to Bill ${row.deletedGroup.end})`}
                              >
                                {row.deletedGroup.count} deleted in seq
                              </span>
                            )}
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleOpenInvoice(row)}
                            title="Click to preview/print invoice"
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#0e7490',
                              fontWeight: 800,
                              cursor: 'pointer',
                              padding: 0,
                              fontSize: '0.85rem',
                              textDecoration: 'underline'
                            }}
                          >
                            {row.billNo}
                          </button>
                        )}
                      </td>

                      {/* Table / Target */}
                      <td style={{ padding: '12px 16px' }}>
                        {isDeleted ? (
                          <span style={{ color: '#94a3b8' }}>—</span>
                        ) : (
                          <span
                            style={{
                              background: '#f1f5f9',
                              color: '#1e293b',
                              fontWeight: 800,
                              padding: '3px 8px',
                              borderRadius: '6px',
                              border: '1px solid #e2e8f0',
                              fontSize: '0.78rem'
                            }}
                          >
                            {row.tableNo}
                          </span>
                        )}
                      </td>

                      {/* Bill Type */}
                      <td style={{ padding: '12px 16px' }}>
                        {isDeleted ? (
                          <span style={{ color: '#94a3b8' }}>—</span>
                        ) : (
                          <span
                            style={{
                              background: typeColor.bg,
                              color: typeColor.text,
                              border: `1px solid ${typeColor.border}`,
                              fontSize: '0.72rem',
                              fontWeight: 800,
                              padding: '2px 8px',
                              borderRadius: '6px'
                            }}
                          >
                            {row.billType}
                          </span>
                        )}
                      </td>

                      {/* Date & Time */}
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ color: isDeleted ? '#64748b' : '#0f172a', fontWeight: 600 }}>{row.billDate}</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{row.billTime}</div>
                      </td>

                      {/* Customer */}
                      <td style={{ padding: '12px 16px' }}>
                        {isDeleted ? (
                          <span style={{ color: '#94a3b8' }}>—</span>
                        ) : (
                          <>
                            <div style={{ fontWeight: 700, color: '#1e293b' }}>{row.customerName}</div>
                            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{row.mobileNo}</div>
                          </>
                        )}
                      </td>

                      {/* Waiter */}
                      <td style={{ padding: '12px 16px', color: '#475569', fontWeight: 600 }}>
                        {isDeleted ? <span style={{ color: '#94a3b8' }}>—</span> : row.waiter}
                      </td>

                      {/* Tax */}
                        <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: isDeleted ? '#94a3b8' : '#059669', fontSize: '0.84rem' }}>
                          {isDeleted ? '—' : `₹${(Number(row.taxAmount) || 0).toFixed(2)}`}
                        </td>

                        {/* Total Amount */}
                          <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 900, color: isDeleted ? '#94a3b8' : '#0f172a', fontSize: '0.9rem' }}>
                            {isDeleted ? '₹0.00' : `₹${row.amount.toFixed(2)}`}
                          </td>

                            {/* Payment Mode — Changeable in Check Master */}
                            <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                              {isDeleted ? (
                                <span style={{ color: '#94a3b8' }}>—</span>
                              ) : isCheckMaster ? (
                                <select
                                  value={row.paymentMode || 'Cash'}
                                  onChange={(e) => handlePaymentModeChange(row, e.target.value)}
                                  style={{
                                    background:
                                      String(row.paymentMode).toUpperCase() === 'UPI' ? '#f0fdfa' :
                                        String(row.paymentMode).toUpperCase() === 'CARD' ? '#eff6ff' :
                                          String(row.paymentMode).toUpperCase() === 'CASH' ? '#f0fdf4' :
                                            String(row.paymentMode).toUpperCase() === 'DUE' ? '#fffbeb' : '#f8fafc',
                                    color:
                                      String(row.paymentMode).toUpperCase() === 'UPI' ? '#0d9488' :
                                        String(row.paymentMode).toUpperCase() === 'CARD' ? '#2563eb' :
                                          String(row.paymentMode).toUpperCase() === 'CASH' ? '#16a34a' :
                                            String(row.paymentMode).toUpperCase() === 'DUE' ? '#d97706' : '#334155',
                                    border: `1.5px solid ${String(row.paymentMode).toUpperCase() === 'UPI' ? '#99f6e4' :
                                        String(row.paymentMode).toUpperCase() === 'CARD' ? '#bfdbfe' :
                                          String(row.paymentMode).toUpperCase() === 'CASH' ? '#bbf7d0' :
                                            String(row.paymentMode).toUpperCase() === 'DUE' ? '#fde68a' : '#cbd5e1'
                                      }`,
                                    fontSize: '0.75rem',
                                    fontWeight: 800,
                                    padding: '3px 8px',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    outline: 'none',
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                                  }}
                                  title="Click to change payment mode (Cash, UPI, Card, Due)"
                                >
                                  <option value="Cash">Cash</option>
                                  <option value="UPI">UPI</option>
                                  <option value="Card">Card</option>
                                  <option value="Due">Due</option>
                                  <option value="Complimentary">Complimentary</option>
                                </select>
                              ) : (
                                <span
                                  style={{
                                    background: '#f1f5f9',
                                    color: '#334155',
                                    border: '1px solid #cbd5e1',
                                    fontSize: '0.72rem',
                                    fontWeight: 800,
                                    padding: '3px 8px',
                                    borderRadius: '6px',
                                    display: 'inline-block'
                                  }}
                                >
                                  {row.paymentMode || 'Cash'}
                                </span>
                              )}
                            </td>

                            {/* Payment Status */}
                            <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                  {isDeleted ? (
                                    <span
                                      style={{
                                        background: '#fee2e2',
                                        color: '#dc2626',
                                        border: '1px solid #fecaca',
                                        fontSize: '0.72rem',
                                        fontWeight: 800,
                                        padding: '3px 8px',
                                        borderRadius: '6px',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                            gap: '4px'
                                      }}
                                    >
                          <span>●</span>
                                <span>Deleted</span>
                              </span>
                              ) : (
                              <span
                                style={{
                                  background: isPaid ? '#ecfdf5' : '#fee2e2',
                                  color: isPaid ? '#047857' : '#b91c1c',
                                  border: isPaid ? '1px solid #a7f3d0' : '1px solid #fecaca',
                                  fontSize: '0.72rem',
                                  fontWeight: 800,
                                  padding: '3px 8px',
                                  borderRadius: '6px',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                            gap: '4px'
                                }}
                              >
                              <span>●</span>
                              <span>{row.payment_status}</span>
                            </span>
                      )}
                          </td>

                            {/* Actions */ }
                            < td style={{ padding: '12px 16px', textAlign: 'center' }}>
                          {isDeleted ? (
                            <span style={{ color: '#94a3b8', fontSize: '0.74rem', fontStyle: 'italic' }}>Deleted</span>
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                              {/* Print Invoice */}
                              <button
                                type="button"
                                onClick={() => handleOpenInvoice(row)}
                                title="Print Tax Invoice"
                                style={{
                                  width: '30px',
                                  height: '30px',
                                  borderRadius: '7px',
                                  border: '1px solid #e2e8f0',
                                  background: '#ffffff',
                                  color: '#0e7490',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  transition: 'all 0.12s'
                                }}
                                onMouseEnter={e => { e.currentTarget.style.background = '#0e7490'; e.currentTarget.style.color = '#fff'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.color = '#0e7490'; }}
                              >
                                <FaPrint size={12} />
                              </button>

                          {/* View Dishes */}
                          <button
                            type="button"
                            onClick={() => handleMenuClick(row)}
                            title="View Ordered Items"
                            style={{
                              width: '30px',
                              height: '30px',
                              borderRadius: '7px',
                              border: '1px solid #e2e8f0',
                              background: '#ffffff',
                              color: '#475569',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.12s'
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#475569'; e.currentTarget.style.color = '#fff'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.color = '#475569'; }}
                          >
                            <FaEye size={12} />
                          </button>

                          {/* Delete single order — ADMIN ONLY */}
                          {isUserAdmin && (
                            <button
                              type="button"
                              onClick={() => setDeleteModal({ open: true, row })}
                              title="Delete Order (Admin Only)"
                              style={{
                                width: '30px',
                                height: '30px',
                                borderRadius: '7px',
                                border: '1px solid #fee2e2',
                                background: '#fff5f5',
                                color: '#dc2626',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.12s'
                              }}
                              onMouseEnter={e => { e.currentTarget.style.background = '#dc2626'; e.currentTarget.style.color = '#fff'; }}
                              onMouseLeave={e => { e.currentTarget.style.background = '#fff5f5'; e.currentTarget.style.color = '#dc2626'; }}
                            >
                              <FaTrashAlt size={12} />
                            </button>
                          )}
                        </div>
                      )}
                      </td>
                    </tr>
                  );
                })
            )}
          </tbody>
        </table>
      </div>

      {/* Complete Editable POS Modal (opened from eye icon) */}
      <OrderInspectorModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedBill(null);
        }}
        order={selectedBill}
        tables={tables}
        storeId={activeStoreId}
        onOrderUpdated={loadOrders}
        showToast={toast}
      />

      {/* Single Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, row: null })}
        onConfirm={handleDelete}
        itemName={deleteModal.row ? `Bill No: ${deleteModal.row.billNo}` : ''}
      />

      {/* Delete ALL Orders Modal (Admin Only) */}
      {deleteAllModal && (
        <CommonModal
          isOpen={deleteAllModal}
          onClose={() => setDeleteAllModal(false)}
          title="Delete All Orders"
          maxWidth="440px"
        >
          <div style={{ textAlign: 'center', padding: '16px 8px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto', fontSize: '1.5rem' }}>
              <FaExclamationTriangle />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0' }}>
              Permanently Clear All Orders?
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 20px 0', lineHeight: 1.5 }}>
              This will permanently delete all order entries, billing records, and payment receipts from the database. This action is restricted to Administrators and cannot be undone.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setDeleteAllModal(false)}
                style={{
                  padding: '9px 18px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#475569',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAll}
                disabled={isDeletingAll}
                style={{
                  padding: '9px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#dc2626',
                  color: '#ffffff',
                  fontSize: '0.84rem',
                  fontWeight: 800,
                  cursor: isDeletingAll ? 'not-allowed' : 'pointer'
                }}
              >
                {isDeletingAll ? 'Deleting...' : 'Yes, Delete All Data'}
              </button>
            </div>
          </div>
        </CommonModal>
      )}

      {/* Date Range & Payment Mode Filter Form Modal — ONLY on Check Master */}
      {isFilterModalOpen && isCheckMaster && (
        <CommonModal
          isOpen={isFilterModalOpen}
          onClose={() => setIsFilterModalOpen(false)}
          title="Check Filter: Date & Payment Mode"
          maxWidth="480px"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              applyModalFilters();
            }}
            style={{ padding: '8px 4px 4px 4px' }}
          >
            <div style={{ marginBottom: '16px', background: '#f8fafc', padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.8rem', color: '#64748b' }}>
              Select the date range and payment mode to show matching checks and update the total tax at the top.
            </div>

            {/* From Date */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                From Date
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="date"
                  value={modalFromDate}
                  onChange={(e) => setModalFromDate(e.target.value)}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    color: '#0f172a',
                    outline: 'none',
                    background: '#ffffff',
                    transition: 'border-color 0.15s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
                />
              </div>
            </div>

            {/* To Date */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                To Date
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="date"
                  value={modalToDate}
                  onChange={(e) => setModalToDate(e.target.value)}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    color: '#0f172a',
                    outline: 'none',
                    background: '#ffffff',
                    transition: 'border-color 0.15s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
                />
              </div>
            </div>

            {/* Payment Mode */}
            <div style={{ marginBottom: '22px' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Payment Mode
              </label>
              <select
                value={modalPaymentMode}
                onChange={(e) => setModalPaymentMode(e.target.value)}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  color: '#0f172a',
                  outline: 'none',
                  background: '#ffffff',
                  cursor: 'pointer'
                }}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
              >
                <option value="All">All Modes (Show All)</option>
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
                <option value="UPI">UPI</option>
                <option value="Credit">Credit</option>
                <option value="Due">Due</option>
                {availablePaymentModes
                  .filter((m) => !['Cash', 'Card', 'UPI', 'Credit', 'Due'].includes(m))
                  .map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
              </select>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
              <button
                type="button"
                onClick={resetModalFilters}
                style={{
                  padding: '9px 16px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  background: '#f8fafc',
                  color: '#64748b',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Clear / Reset
              </button>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setIsFilterModalOpen(false)}
                  style={{
                    padding: '9px 16px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#334155',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '9px 22px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#2563eb',
                    color: '#ffffff',
                    fontSize: '0.84rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(37,99,235,0.2)'
                  }}
                >
                  Apply & Show
                </button>
              </div>
            </div>
          </form>
        </CommonModal>
      )}
    </div>
  );
};

export default OrderDetailsPage;
