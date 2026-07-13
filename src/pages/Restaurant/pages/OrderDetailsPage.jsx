import React, { useState } from 'react';
import { FaPrint, FaFileInvoiceDollar } from 'react-icons/fa';
import CommonTable from '../../../components/common/CommonTable';
import CommonModal from '../../../components/common/CommonModal';
import DeleteConfirmationModal from '../../../components/common/DeleteConfirmationModal';

const MOCK_BILLS = [
  {
    id: 1,
    billNo: '1',
    tableNo: 'T1',
    billType: 'DINE_IN',
    billDate: '05-05-2026',
    orderNo: '1',
    amount: 140.0,
    customerName: 'Walk-in',
    mobileNo: '—',
    items: [
      { itemId: 106, itemName: 'Cold Drink', name: 'Cold Drink', variantId: '500ml', variantName: '500 ML', variant: '500 ML', qty: 2, unitPrice: 70, rate: 70, price: 70, total: 140.0 }
    ]
  },
  {
    id: 2,
    billNo: '2',
    tableNo: 'T2',
    billType: 'DINE_IN',
    billDate: '08-06-2026',
    orderNo: '1',
    amount: 360.0,
    customerName: 'Walk-in',
    mobileNo: '—',
    items: [
      { itemId: 102, itemName: 'Paneer Tikka', name: 'Paneer Tikka', variantId: 'half', variantName: 'Half', variant: 'Half', qty: 1, unitPrice: 180, rate: 180, price: 180, total: 180 },
      { itemId: 108, itemName: 'Tandoori Roti', name: 'Tandoori Roti', variantId: '', variantName: '', variant: '', qty: 6, unitPrice: 30, rate: 30, price: 30, total: 180 }
    ]
  },
  {
    id: 3,
    billNo: '3',
    tableNo: 'T3',
    billType: 'DINE_IN',
    billDate: '11-06-2026',
    orderNo: '2',
    amount: 560.0,
    customerName: 'Rahul Sharma',
    mobileNo: '9876543210',
    items: [
      { itemId: 101, itemName: 'Chicken Tandoori', name: 'Chicken Tandoori', variantId: 'full', variantName: 'Full', variant: 'Full', qty: 1, unitPrice: 520, rate: 520, price: 520, total: 520 },
      { itemId: 106, itemName: 'Cold Drink', name: 'Cold Drink', variantId: '250ml', variantName: '250 ML', variant: '250 ML', qty: 1, unitPrice: 40, rate: 40, price: 40, total: 40 }
    ]
  },
  {
    id: 4,
    billNo: '4',
    tableNo: 'T4',
    billType: 'DINE_IN',
    billDate: '27-06-2026',
    orderNo: '3,4',
    amount: 400.0,
    customerName: 'Walk-in',
    mobileNo: '—',
    items: [
      { itemId: 118, itemName: 'Butter Naan', name: 'Butter Naan', variantId: '', variantName: '', variant: '', qty: 3, unitPrice: 80, rate: 80, price: 80, total: 240 },
      { itemId: 107, itemName: 'Dal Makhani', name: 'Dal Makhani', variantId: 'half', variantName: 'Half', variant: 'Half', qty: 1, unitPrice: 160, rate: 160, price: 160, total: 160 }
    ]
  },
  {
    id: 5,
    billNo: '5',
    tableNo: '103',
    billType: 'DINE_IN',
    billDate: '07-07-2026',
    orderNo: '10',
    amount: 1200.0,
    customerName: 'Jane Doe',
    mobileNo: '9888877777',
    items: [
      { itemId: 101, itemName: 'Butter Chicken', name: 'Butter Chicken', variantId: 'full', variantName: 'Full', variant: 'Full', qty: 2, unitPrice: 450, rate: 450, price: 450, total: 900 },
      { itemId: 104, itemName: 'Garlic Naan', name: 'Garlic Naan', variantId: '', variantName: '', variant: '', qty: 3, unitPrice: 100, rate: 100, price: 100, total: 300 }
    ]
  },
  {
    id: 6,
    billNo: '6',
    tableNo: 'T9',
    billType: 'DINE_IN',
    billDate: '08-07-2026',
    orderNo: '11',
    amount: 140.0,
    customerName: 'Walk-in',
    mobileNo: '—',
    items: [
      { itemId: 122, itemName: 'French Fries', name: 'French Fries', variantId: '', variantName: '', variant: '', qty: 1, unitPrice: 140, rate: 140, price: 140, total: 140 }
    ]
  }
];

const OrderDetailsPage = ({ showToast }) => {
  const [data, setData] = useState(MOCK_BILLS);
  const [selectedBill, setSelectedBill] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ open: false, row: null });

  const handleMenuClick = (bill) => {
    setSelectedBill(bill);
    setIsModalOpen(true);
  };

  const handleDelete = () => {
    setData(prev => prev.filter(item => item.id !== deleteModal.row.id));
    if (showToast) showToast('Order entry deleted successfully.');
    setDeleteModal({ open: false, row: null });
  };

  const handlePrintInvoice = (bill) => {
    const targetBill = bill || selectedBill;
    if (!targetBill) return;
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - Bill No: ${targetBill.billNo}</title>
          <style>
            body { font-family: 'Courier New', Courier, monospace; padding: 20px; color: #000; }
            .header { text-align: center; margin-bottom: 20px; }
            .header h2 { margin: 0; }
            .meta { margin-bottom: 20px; font-size: 0.9rem; }
            .meta table { width: 100%; }
            .items { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 0.9rem; }
            .items th, .items td { padding: 8px 0; text-align: left; }
            .items th { border-bottom: 1px solid #000; }
            .items td { border-bottom: 1px dashed #ddd; }
            .total { text-align: right; font-size: 1.1rem; font-weight: bold; border-top: 1px solid #000; padding-top: 10px; }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>ALFA HOTEL & RESTAURANT</h2>
            <p>123 Luxury Road, City Centre<br>Phone: +91 98765 43210</p>
            <h3>RESTAURANT INVOICE</h3>
          </div>
          <hr/>
          <div class="meta">
            <table>
              <tr>
                <td><strong>Bill No:</strong> ${targetBill.billNo}</td>
                <td style="text-align: right;"><strong>Date:</strong> ${targetBill.billDate}</td>
              </tr>
              <tr>
                <td><strong>Table No:</strong> ${targetBill.tableNo}</td>
                <td style="text-align: right;"><strong>Type:</strong> ${targetBill.billType}</td>
              </tr>
              <tr>
                <td><strong>Customer:</strong> ${targetBill.customerName}</td>
                <td style="text-align: right;"><strong>Mobile:</strong> ${targetBill.mobileNo}</td>
              </tr>
            </table>
          </div>
          <hr/>
          <table class="items">
            <thead>
              <tr>
                <th>Item Name</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Price</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${targetBill.items.map(item => {
                const displayName = (item.itemName || item.name) + (item.variantName ? ` (${item.variantName})` : '');
                const rate = item.unitPrice || item.rate || 0;
                const total = item.total || (item.qty * rate);
                return `
                  <tr>
                    <td>${displayName}</td>
                    <td style="text-align: center;">${item.qty}</td>
                    <td style="text-align: right;">₹${rate.toFixed(2)}</td>
                    <td style="text-align: right;">₹${total.toFixed(2)}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
          <div class="total">
            Grand Total: ₹${targetBill.amount.toFixed(2)}
          </div>
          <hr/>
          <p style="text-align: center; font-size: 0.8rem; margin-top: 30px;">Thank you for dining with us!<br/>Have a wonderful day!</p>
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() { window.close(); };
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const columns = [
    { 
      key: 'billNo', 
      label: 'Bill No', 
      render: (val, row) => (
        <button 
          onClick={(e) => { e.stopPropagation(); handleMenuClick(row); }}
          style={{ background: 'none', border: 'none', color: '#4f46e5', fontWeight: 800, cursor: 'pointer', textDecoration: 'underline', padding: 0, outline: 'none' }}
        >
          {val}
        </button>
      )
    },
    { key: 'tableNo', label: 'Table No/Token No' },
    { key: 'billType', label: 'Bill Type', renderStatus: true, activeValue: 'DINE_IN' },
    { key: 'billDate', label: 'Bill Date' },
    { key: 'orderNo', label: 'Order No' },
    { key: 'amount', label: 'Amount', render: (val) => `₹${Number(val).toFixed(2)}` },
    { key: 'customerName', label: 'Customer Name' },
    { key: 'mobileNo', label: 'Mobile No' },
    { key: 'action', label: 'Action', sortable: false }
  ];

  const actions = [
    {
      label: 'Invoice',
      onClick: (row) => handlePrintInvoice(row),
      icon: <FaFileInvoiceDollar size={13} />
    },
    {
      label: 'Edit',
      onClick: (row) => {
        if (showToast) showToast(`Editing order for Bill No: ${row.billNo} (Dummy action)`, 'success');
      }
    },
    {
      label: 'Delete',
      isDanger: true,
      onClick: (row) => setDeleteModal({ open: true, row })
    }
  ];

  return (
    <div style={{ fontFamily: 'var(--font-family, system-ui)', background: '#fff', minHeight: '100%' }}>
      <CommonTable
        title="Order Details"
        columns={columns}
        data={data}
        actions={actions}
        onAddEntry={null}
        searchPlaceholder="Search orders by table, customer, type..."
        showToast={showToast}
        breadcrumbs={['Dashboard', 'Restaurant', 'Order Details']}
      />

      {/* Ordered Items List Modal */}
      {selectedBill && (
        <CommonModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedBill(null);
          }}
          title={`Order Dishes List — Bill No: ${selectedBill.billNo} (Table ${selectedBill.tableNo})`}
          maxWidth="460px"
        >
          <div style={{ padding: '12px 4px' }}>
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '10px' }}>Bill Metadata</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.82rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Customer Name:</span>
                  <span style={{ fontWeight: 700, color: '#1e293b' }}>{selectedBill.customerName}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Mobile Number:</span>
                  <span style={{ fontWeight: 700, color: '#1e293b' }}>{selectedBill.mobileNo}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Settlement Date:</span>
                  <span style={{ fontWeight: 700, color: '#1e293b' }}>{selectedBill.billDate}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Bill Type:</span>
                  <span style={{ fontWeight: 800, color: '#0369a1' }}>{selectedBill.billType}</span>
                </div>
              </div>
            </div>

            <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: '10px', paddingLeft: '4px' }}>Items List</div>
            <div style={{ border: '1px solid #cbd5e1', borderRadius: '12px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #cbd5e1', color: '#475569', fontWeight: 800 }}>
                    <th style={{ padding: '10px 12px' }}>Item Name</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center' }}>Qty</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>Price</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedBill.items.map((item, idx) => {
                    const displayName = (item.itemName || item.name) + (item.variantName ? ` (${item.variantName})` : '');
                    const rate = item.unitPrice || item.rate || 0;
                    const total = item.total || (item.qty * rate);
                    return (
                      <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '10px 12px', fontWeight: 700, color: '#0f172a' }}>{displayName}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 800, color: '#4f46e5' }}>{item.qty}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', color: '#475569' }}>₹{rate.toFixed(2)}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 800, color: '#0f172a' }}>₹{total.toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div style={{ borderTop: '1px dashed #cbd5e1', marginTop: '20px', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#475569' }}>Grand Total Amount:</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#4f46e5' }}>₹{selectedBill.amount.toFixed(2)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button
                onClick={handlePrintInvoice}
                style={{ 
                  padding: '8px 16px', 
                  borderRadius: '8px', 
                  border: 'none', 
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
                  color: '#fff', 
                  fontSize: '0.8rem', 
                  fontWeight: 800, 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 4px rgba(16, 185, 129, 0.15)'
                }}
              >
                <FaPrint size={11} /> Print Invoice
              </button>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedBill(null);
                }}
                style={{ padding: '8px 20px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', color: '#475569', fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer' }}
              >
                Close
              </button>
            </div>
          </div>
        </CommonModal>
      )}

      <DeleteConfirmationModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, row: null })}
        onConfirm={handleDelete}
        itemName={deleteModal.row ? `Bill No: ${deleteModal.row.billNo}` : ''}
      />
    </div>
  );
};

export default OrderDetailsPage;
