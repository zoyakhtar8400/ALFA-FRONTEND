import React, { createContext, useState, useEffect } from 'react';

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
  const [itemGroups, setItemGroups] = useState(() => {
    const saved = localStorage.getItem('alfa_purchase_item_groups_v2');
    return saved ? JSON.parse(saved) : INITIAL_ITEM_GROUPS;
  });

  const [units, setUnits] = useState(() => {
    const saved = localStorage.getItem('alfa_purchase_units_v2');
    return saved ? JSON.parse(saved) : INITIAL_UNITS;
  });

  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('alfa_purchase_items_v2');
    return saved ? JSON.parse(saved) : INITIAL_ITEMS;
  });

  const [openStockEntries, setOpenStockEntries] = useState(() => {
    const saved = localStorage.getItem('alfa_purchase_open_stock_v2');
    return saved ? JSON.parse(saved) : INITIAL_OPEN_STOCK;
  });

  const [indents, setIndents] = useState(() => {
    const saved = localStorage.getItem('alfa_purchase_indents_v2');
    return saved ? JSON.parse(saved) : INITIAL_INDENTS;
  });

  const [indentApprovals, setIndentApprovals] = useState(() => {
    const saved = localStorage.getItem('alfa_purchase_indent_approvals');
    return saved ? JSON.parse(saved) : [];
  });

  const [quotations, setQuotations] = useState(() => {
    const saved = localStorage.getItem('alfa_purchase_quotations_v2');
    return saved ? JSON.parse(saved) : INITIAL_QUOTATIONS;
  });

  const [purchaseOrders, setPurchaseOrders] = useState(() => {
    const saved = localStorage.getItem('alfa_purchase_orders_v2');
    return saved ? JSON.parse(saved) : INITIAL_PURCHASE_ORDERS;
  });

  const [grns, setGrns] = useState(() => {
    const saved = localStorage.getItem('alfa_purchase_grns_v2');
    return saved ? JSON.parse(saved) : INITIAL_GRNS;
  });

  const [purchaseBills, setPurchaseBills] = useState(() => {
    const saved = localStorage.getItem('alfa_purchase_bills_v2');
    return saved ? JSON.parse(saved) : INITIAL_PURCHASE_BILLS;
  });

  const [purchaseReturns, setPurchaseReturns] = useState(() => {
    const saved = localStorage.getItem('alfa_purchase_returns');
    return saved ? JSON.parse(saved) : [];
  });

  const [departmentIssues, setDepartmentIssues] = useState(() => {
    const saved = localStorage.getItem('alfa_purchase_dept_issues');
    return saved ? JSON.parse(saved) : [];
  });

  const [stockTransfers, setStockTransfers] = useState(() => {
    const saved = localStorage.getItem('alfa_purchase_stock_transfers');
    return saved ? JSON.parse(saved) : [];
  });

  const [consumerEntries, setConsumerEntries] = useState(() => {
    const saved = localStorage.getItem('alfa_purchase_consumer_entries');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => { localStorage.setItem('alfa_purchase_item_groups_v2', JSON.stringify(itemGroups)); }, [itemGroups]);
  useEffect(() => { localStorage.setItem('alfa_purchase_units_v2', JSON.stringify(units)); }, [units]);
  useEffect(() => { localStorage.setItem('alfa_purchase_items_v2', JSON.stringify(items)); }, [items]);
  useEffect(() => { localStorage.setItem('alfa_purchase_open_stock_v2', JSON.stringify(openStockEntries)); }, [openStockEntries]);
  useEffect(() => { localStorage.setItem('alfa_purchase_indents_v2', JSON.stringify(indents)); }, [indents]);
  useEffect(() => { localStorage.setItem('alfa_purchase_indent_approvals', JSON.stringify(indentApprovals)); }, [indentApprovals]);
  useEffect(() => { localStorage.setItem('alfa_purchase_quotations_v2', JSON.stringify(quotations)); }, [quotations]);
  useEffect(() => { localStorage.setItem('alfa_purchase_orders_v2', JSON.stringify(purchaseOrders)); }, [purchaseOrders]);
  useEffect(() => { localStorage.setItem('alfa_purchase_grns_v2', JSON.stringify(grns)); }, [grns]);
  useEffect(() => { localStorage.setItem('alfa_purchase_bills_v2', JSON.stringify(purchaseBills)); }, [purchaseBills]);
  useEffect(() => { localStorage.setItem('alfa_purchase_returns', JSON.stringify(purchaseReturns)); }, [purchaseReturns]);
  useEffect(() => { localStorage.setItem('alfa_purchase_dept_issues', JSON.stringify(departmentIssues)); }, [departmentIssues]);
  useEffect(() => { localStorage.setItem('alfa_purchase_stock_transfers', JSON.stringify(stockTransfers)); }, [stockTransfers]);
  useEffect(() => { localStorage.setItem('alfa_purchase_consumer_entries', JSON.stringify(consumerEntries)); }, [consumerEntries]);

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
