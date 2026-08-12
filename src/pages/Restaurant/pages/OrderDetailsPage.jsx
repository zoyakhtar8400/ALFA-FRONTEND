import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaFileInvoiceDollar, FaPrint } from 'react-icons/fa';
import CommonTable from '../../../components/common/CommonTable';
import CommonModal from '../../../components/common/CommonModal';
import DeleteConfirmationModal from '../../../components/common/DeleteConfirmationModal';
import { orderService } from '../../../services/orderService';

const OrderDetailsPage = ({ showToast }) => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [selectedBill, setSelectedBill] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ open: false, row: null });

  useEffect(() => {
    async function loadOrders() {
      try {
        const res = await orderService.getOrders();
        const rawOrders = res?.orders || res?.data || [];
        if (Array.isArray(rawOrders)) {
          const mapped = rawOrders.map((o, idx) => {
            return {
              id: o.id || o.order_id || o.billNo || (idx + 1),
              billNo: o.billNo || `Bill ${o.order_number || o.orderNo || (idx + 1)}`,
              tableNo: o.tableNo || o.table_name || `Table ${o.table_id || (idx + 1)}`,
              billType: o.billType || o.order_type || 'DINE_IN',
              billDate: new Date(o.createdAt || o.billDate || Date.now()).toLocaleDateString(),
              orderNo: String(o.orderNo || o.order_number || (idx + 1)),
              amount: Number(o.amount || o.total_amount || 0),
              customerName: o.customerName || o.customer_name || 'Walk-in',
              mobileNo: o.mobileNo || o.mobile_no || o.customer_phone || o.phone || o.mobile || '—',
              waiter: o.waiter || o.waiter_name || 'Staff',
              payment_status: o.payment_status || 'Paid',
              items: o.items || []
            };
          });
          setData(mapped);
        }
      } catch (err) {
        console.warn('Error loading live orders:', err);
      }
    }
    loadOrders();
  }, []);

  const handleOpenInvoice = (row) => {
    navigate(`/restaurant/invoice?orderId=${row.id || row.billNo}&autoprint=true`, {
      state: { order: row }
    });
  };

  const handleMenuClick = (bill) => {
    setSelectedBill(bill);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (deleteModal.row) {
      try {
        await orderService.deleteOrder(deleteModal.row.id);
        setData(prev => prev.filter(item => item.id !== deleteModal.row.id));
        if (showToast) showToast('Order entry deleted from database successfully.', 'success');
      } catch (err) {
        console.error('Error deleting order from database:', err);
      }
    }
    setDeleteModal({ open: false, row: null });
  };

  const columns = [
    { 
      key: 'billNo', 
      label: 'Bill No', 
      render: (val, row) => (
        <button 
          onClick={(e) => { e.stopPropagation(); handleOpenInvoice(row); }}
          style={{ background: 'none', border: 'none', color: '#0e7490', fontWeight: 800, cursor: 'pointer', textDecoration: 'underline', padding: 0, outline: 'none' }}
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
    { key: 'payment_status', label: 'Payment Status', renderStatus: true, activeValue: 'Paid' },
    { key: 'action', label: 'Action', sortable: false }
  ];

  const actions = [
    {
      label: 'Invoice',
      onClick: (row) => handleOpenInvoice(row),
      icon: <FaFileInvoiceDollar size={13} />
    },
    {
      label: 'Items List',
      onClick: (row) => handleMenuClick(row)
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

      {/* Ordered Items Quick View Modal */}
      {selectedBill && (
        <CommonModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedBill(null);
          }}
          title={`Order Dishes List — Bill No: ${selectedBill.billNo} (${selectedBill.tableNo})`}
          maxWidth="480px"
        >
          <div style={{ padding: '12px 4px' }}>
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '10px' }}>Bill Summary</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.82rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Customer:</span>
                  <span style={{ fontWeight: 700, color: '#1e293b' }}>{selectedBill.customerName}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Mobile:</span>
                  <span style={{ fontWeight: 700, color: '#1e293b' }}>{selectedBill.mobileNo}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Bill Type:</span>
                  <span style={{ fontWeight: 800, color: '#0e7490' }}>{selectedBill.billType}</span>
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
                  {(selectedBill.items || []).length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ padding: '16px', textAlign: 'center', color: '#94a3b8' }}>
                        No items recorded in database for this order
                      </td>
                    </tr>
                  ) : selectedBill.items.map((item, idx) => {
                    const displayName = (item.itemName || item.name || 'Item') + (item.variantName ? ` (${item.variantName})` : '');
                    const rate = Number(item.unitPrice || item.price || item.rate || 0);
                    const total = Number(item.total || (item.qty * rate));
                    return (
                      <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '10px 12px', fontWeight: 700, color: '#0f172a' }}>{displayName}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 800, color: '#0e7490' }}>{item.qty || 1}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', color: '#475569' }}>₹{rate.toFixed(2)}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 800, color: '#0f172a' }}>₹{total.toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div style={{ borderTop: '1px dashed #cbd5e1', marginTop: '20px', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#475569' }}>Grand Total:</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0e7490' }}>₹{selectedBill.amount.toFixed(2)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  handleOpenInvoice(selectedBill);
                }}
                style={{ 
                  padding: '8px 16px', 
                  borderRadius: '8px', 
                  border: 'none', 
                  background: 'linear-gradient(135deg, #0e7490 0%, #155e75 100%)', 
                  color: '#fff', 
                  fontSize: '0.8rem', 
                  fontWeight: 800, 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <FaPrint size={11} /> Open Invoice Page
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
