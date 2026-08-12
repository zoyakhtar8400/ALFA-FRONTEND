import React, { createContext, useState, useEffect } from 'react';
import { inventoryApi } from '../../../api/inventoryApi';
import { purchaseApi } from '../../../api/purchaseApi';

export const PurchaseContext = createContext(null);

const INITIAL_ITEM_GROUPS = [
  { id: 1, name: 'RAW MATERIAL', type: 'Raw Material', postInAc: '' },
  { id: 2, name: 'PATATO 5KG', type: 'Store Item', postInAc: 'CASH IN HAND' },
  { id: 3, name: 'LADY FINGER 1KG', type: 'Store Item', postInAc: 'CASH IN HAND' },
  { id: 4, name: 'SMOOTH LUFFA 1KG', type: 'Store Item', postInAc: 'CASH IN HAND' },
  { id: 5, name: 'POINTED GOURED 500GM', type: 'Store Item', postInAc: 'CASH IN HAND' },
  { id: 6, name: 'TOMATO 1KG', type: 'Store Item', postInAc: 'CASH IN HAND' },
  { id: 7, name: 'CHILLI 250GM', type: 'Store Item', postInAc: 'CASH IN HAND' },
  { id: 8, name: 'GINGER 100GM', type: 'Store Item', postInAc: 'CASH IN HAND' },
  { id: 9, name: 'GARLIC 100GM', type: 'Store Item', postInAc: 'CASH IN HAND' },
  { id: 10, name: 'room freshener', type: 'HouseKeeping', postInAc: '' }
];

const INITIAL_UNITS = [
  { id: 1, name: 'K.G.', qtyDecimalPlaces: '3' },
  { id: 2, name: 'Bottle', qtyDecimalPlaces: '3' },
  { id: 3, name: 'CAN', qtyDecimalPlaces: '3' },
  { id: 4, name: 'PACKET', qtyDecimalPlaces: '3' },
  { id: 5, name: 'M.L.', qtyDecimalPlaces: '3' },
  { id: 6, name: 'Litre', qtyDecimalPlaces: '3' },
  { id: 7, name: 'Pieces', qtyDecimalPlaces: '0' }
];

const INITIAL_ITEMS = [
  { id: 1, name: 'AATA', unitName: 'K.G.', active: 'Yes', itemCategory: 'PURCHASE 0%', itemGroupName: 'RAW MATERIAL', storeDepartment: 'PURCHASE', lotBatchNo: 'Yes', conversionUnit: 'K.G.', maxLevel: '', minLevel: '', reOrderLevel: '', poMandatory: 'Yes', convRatio: '1', moq: '', description: '', hsnSacCode: '' },
  { id: 2, name: 'PATATO 5KG', unitName: 'K.G.', active: 'Yes', itemCategory: 'PURCHASE 0%', itemGroupName: 'PATATO 5KG', storeDepartment: 'PURCHASE', lotBatchNo: 'Yes', conversionUnit: 'K.G.', maxLevel: '', minLevel: '', reOrderLevel: '', poMandatory: 'Yes', convRatio: '1', moq: '', description: '', hsnSacCode: '' },
  { id: 3, name: 'TOMATO 1KG', unitName: 'K.G.', active: 'Yes', itemCategory: 'PURCHASE 0%', itemGroupName: 'TOMATO 1KG', storeDepartment: 'PURCHASE', lotBatchNo: 'Yes', conversionUnit: 'K.G.', maxLevel: '', minLevel: '', reOrderLevel: '', poMandatory: 'Yes', convRatio: '1', moq: '', description: '', hsnSacCode: '' }
];

const INITIAL_OPEN_STOCK = [
  {
    id: 1,
    openingNo: '1',
    date: '25-07-2026',
    department: 'MAIN KITCHEN',
    vPrefix: 'OPN',
    lines: [
      { sNo: 1, item: 'AATA', unit: 'K.G.', quantity: 10, rate: 32, amount: 320 },
      { sNo: 2, item: 'SUGAR KG', unit: 'K.G.', quantity: 20, rate: 30, amount: 600 }
    ]
  },
  {
    id: 2,
    openingNo: '2',
    date: '25-07-2026',
    department: 'PURCHASE STORE',
    vPrefix: 'OPN',
    lines: [
      { sNo: 1, item: 'PATATO 5KG', unit: 'K.G.', quantity: 15, rate: 25, amount: 375 }
    ]
  }
];

const INITIAL_INDENTS = [
  {
    id: 1,
    indentNo: '1',
    indentDate: '25-07-2026',
    department: 'MAIN KITCHEN',
    indentorName: 'DEMO',
    indentName: 'MAIN KITCHEN - DEMO',
    assignedTo: 'Store Keeper',
    status: 'Pending',
    lines: [
      { sNo: 1, item: 'AATA', indQty: 10, rate: 32, amount: 320, unit: 'K.G.', remark: 'Kitchen replenishment' }
    ]
  }
];

const INITIAL_QUOTATIONS = [
  {
    id: 1,
    entryNo: '1',
    quotationNo: '1',
    entryDate: '25-07-2026',
    date: '25-07-2026',
    vendor: 'A P SUPPLY',
    supplier: 'A P SUPPLY',
    vendorQuotNo: '1',
    vendorQuotDate: '25-07-2026',
    vPrefix: 'QUOT',
    lines: [
      { sNo: 1, item: 'AATA', qty: 10, unit: 'K.G.', rate: 30, amount: 300, remark: 'Vendor quote 1' }
    ]
  }
];

const INITIAL_PURCHASE_ORDERS = [
  {
    id: 1,
    entryNo: '1',
    orderNo: '1',
    entryDate: '02-07-2026',
    date: '02-07-2026',
    customer: 'A P SUPPLY',
    supplier: 'A P SUPPLY',
    discountPct: '0',
    discountAmt: '0.00',
    sgstAmt: '0.00',
    cgstAmt: '0.00',
    roundOff: '0.00',
    grossAmount: 320,
    netAmount: 320,
    lines: [
      { sNo: 1, item: 'AATA', sku: 'SKU-101', orderQty: 10, orderUnit: 'K.G.', rate: 32, amount: 320, deliveryDate: '25-07-2026', remark: '', department: 'PURCHASE STORE' }
    ]
  },
  {
    id: 2,
    entryNo: '2',
    orderNo: '2',
    entryDate: '02-07-2026',
    date: '02-07-2026',
    customer: 'Metro Cash & Carry India',
    supplier: 'Metro Cash & Carry India',
    discountPct: '0',
    discountAmt: '0.00',
    sgstAmt: '0.00',
    cgstAmt: '0.00',
    roundOff: '0.00',
    grossAmount: 500,
    netAmount: 500,
    lines: [
      { sNo: 1, item: 'PATATO 5KG', sku: 'SKU-102', orderQty: 20, orderUnit: 'K.G.', rate: 25, amount: 500, deliveryDate: '25-07-2026', remark: '', department: 'PURCHASE STORE' }
    ]
  }
];

const INITIAL_GRNS = [
  {
    id: 1,
    grnNo: '1',
    entryNo: '1',
    date: '25-07-2026',
    entryDate: '25-07-2026',
    partyChNo: 'CH-101',
    partyChDt: '25-07-2026',
    supplier: 'A P SUPPLY',
    partyName: 'A P SUPPLY',
    itemName: 'AATA',
    agnstForm: 'WITH IN STATE PURCHASE',
    grossAmount: 320,
    netAmount: 320,
    lines: [
      { sNo: 1, item: 'AATA', ordNo: 'PO-1', ordQty: 10, docQty: 10, unit: 'K.G.', rate: 32, amount: 320, department: 'PURCHASE STORE' }
    ]
  }
];

const INITIAL_PURCHASE_BILLS = [
  {
    id: 1,
    billNo: '1',
    entryNo: '1',
    date: '25-07-2026',
    entryDate: '25-07-2026',
    billPrtyNo: 'INV-1001',
    ptyBillNo: 'INV-1001',
    billPrtyDate: '25-07-2026',
    ptyBillDt: '25-07-2026',
    supplier: 'A P SUPPLY',
    customer: 'A P SUPPLY',
    gstin: '09AAAAA0000A1Z5',
    agnstForm: 'WITH IN STATE PURCHASE',
    grossAmount: 320,
    netAmount: 320,
    lines: [
      { sNo: 1, grnNo: 'GRN-1', item: 'AATA', unit: 'K.G.', docQty: 10, rate: 32, amount: 320, department: 'PURCHASE STORE' }
    ]
  }
];

export const PurchaseProvider = ({ children }) => {
  // All state starts empty — hydrated from PostgreSQL on mount.
  // INITIAL_* constants above are kept only as emergency offline fallback (not used in normal flow).
  const [itemGroups, setItemGroups] = useState([]);
  const [units, setUnits] = useState([]);
  const [items, setItems] = useState([]);
  const [openStockEntries, setOpenStockEntries] = useState([]);
  const [indents, setIndents] = useState([]);
  const [indentApprovals, setIndentApprovals] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [grns, setGrns] = useState([]);
  const [purchaseBills, setPurchaseBills] = useState([]);
  const [purchaseReturns, setPurchaseReturns] = useState([]);
  const [departmentIssues, setDepartmentIssues] = useState([]);
  const [stockTransfers, setStockTransfers] = useState([]);
  const [consumerEntries, setConsumerEntries] = useState([]);

  // ── Hydrate from PostgreSQL on mount ──────────────────────────────────────
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        // Item Groups
        inventoryApi.getItemGroups().then(res => {
          if (mounted) {
            const data = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
            setItemGroups(data.map(g => ({ id: g.item_group_id, name: g.group_name, type: g.group_type || '', postInAc: g.post_in_account || '' })));
          }
        }).catch(() => { if (mounted) setItemGroups([]); });

        // Units
        inventoryApi.getUnits().then(res => {
          if (mounted) {
            const data = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
            setUnits(data.map(u => ({ id: u.unit_id, name: u.unit_name, qtyDecimalPlaces: String(u.decimal_places ?? 3) })));
          }
        }).catch(() => { if (mounted) setUnits([]); });

        // Inventory Items
        inventoryApi.getInventoryItems().then(res => {
          if (mounted) {
            const data = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
            setItems(data.map(i => ({
              id: i.inventory_item_id, name: i.item_name,
              unitName: i.unit || 'K.G.', active: i.is_active ? 'Yes' : 'No',
              itemCategory: i.category || '', itemGroupName: i.group_name || '',
              storeDepartment: i.store_department || 'PURCHASE',
              reOrderLevel: String(i.minimum_stock || ''), currentStock: Number(i.current_stock || 0),
              purchaseRate: Number(i.purchase_price || 0),
            })));
          }
        }).catch(() => { if (mounted) setItems([]); });

        // Purchase Orders
        purchaseApi.getPurchaseOrders().then(res => {
          if (mounted) {
            const data = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
            setPurchaseOrders(data.map((po, idx) => ({
              id: po.po_id || idx + 1, entryNo: String(po.po_number || po.po_id || idx + 1),
              date: po.po_date ? new Date(po.po_date).toISOString().split('T')[0] : '',
              entryDate: po.po_date ? new Date(po.po_date).toISOString().split('T')[0] : '',
              supplier: po.Supplier?.supplier_name || po.supplier_name || '',
              customer: po.Supplier?.supplier_name || po.supplier_name || '',
              netAmount: Number(po.net_amount || po.total_amount || 0),
              lines: po.purchaseOrderItems || [],
            })));
          }
        }).catch(() => { if (mounted) setPurchaseOrders([]); });

        // Purchase Bills
        purchaseApi.getPurchaseBills().then(res => {
          if (mounted) {
            const data = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
            setPurchaseBills(data.map((b, idx) => ({
              id: b.bill_id || idx + 1, entryNo: String(b.bill_number || b.bill_id || idx + 1),
              date: b.bill_date ? new Date(b.bill_date).toISOString().split('T')[0] : '',
              entryDate: b.bill_date ? new Date(b.bill_date).toISOString().split('T')[0] : '',
              supplier: b.Supplier?.supplier_name || '', customer: b.Supplier?.supplier_name || '',
              ptyBillNo: b.vendor_invoice_no || '', ptyBillDt: b.vendor_invoice_date || '',
              netAmount: Number(b.net_amount || 0),
            })));
          }
        }).catch(() => { if (mounted) setPurchaseBills([]); });

        // Indents
        purchaseApi.getIndents().then(res => {
          if (mounted) {
            const data = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
            setIndents(data.map((ind, idx) => ({
              id: ind.indent_id || idx + 1, indentNo: String(ind.indent_number || ind.indent_id || idx + 1),
              indentDate: ind.indent_date ? new Date(ind.indent_date).toISOString().split('T')[0] : '',
              department: ind.department || '', status: ind.status || 'Pending',
              lines: ind.indentItems || [],
            })));
          }
        }).catch(() => { if (mounted) setIndents([]); });

        // GRNs
        purchaseApi.getGRNs().then(res => {
          if (mounted) {
            const data = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
            setGrns(data.map((g, idx) => ({
              id: g.grn_id || idx + 1, entryNo: String(g.grn_number || g.grn_id || idx + 1),
              entryDate: g.grn_date ? new Date(g.grn_date).toISOString().split('T')[0] : '',
              partyName: g.Supplier?.supplier_name || '', netAmount: Number(g.net_amount || 0),
              lines: g.grnItems || [],
            })));
          }
        }).catch(() => { if (mounted) setGrns([]); });

      } catch (e) {
        console.warn('PurchaseContext hydration error:', e);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  return (
    <PurchaseContext.Provider value={{
      itemGroups, setItemGroups,
      units, setUnits,
      items, setItems,
      openStockEntries, setOpenStockEntries,
      indents, setIndents,
      indentApprovals, setIndentApprovals,
      quotations, setQuotations,
      purchaseOrders, setPurchaseOrders,
      grns, setGrns,
      purchaseBills, setPurchaseBills,
      purchaseReturns, setPurchaseReturns,
      departmentIssues, setDepartmentIssues,
      stockTransfers, setStockTransfers,
      consumerEntries, setConsumerEntries
    }}>
      {children}
    </PurchaseContext.Provider>
  );
};

