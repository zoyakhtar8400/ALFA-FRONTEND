import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaFileInvoiceDollar, FaPrint, FaEye } from 'react-icons/fa';
import CommonTable from '../../../components/common/CommonTable';
import CommonModal from '../../../components/common/CommonModal';
import DeleteConfirmationModal from '../../../components/common/DeleteConfirmationModal';
import { orderService } from '../../../services/orderService';
import { printTaxInvoice } from '../utils/printInvoice';
import { useRestaurant } from '../../../context/RestaurantContext';

const OrderDetailsPage = ({ showToast }) => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [selectedBill, setSelectedBill] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ open: false, row: null });
  const [printOrderId, setPrintOrderId] = useState(null);
  const [printTriggerKey, setPrintTriggerKey] = useState(0);
  const [areaFilter, setAreaFilter] = useState('All');
  const { tables, activeStoreId } = useRestaurant();

  const availableAreas = React.useMemo(() => {
    const areaSet = new Set();
    tables.forEach(t => {
      if (t.area && t.area.trim()) areaSet.add(t.area.trim());
    });
    return Array.from(areaSet);
  }, [tables]);

  useEffect(() => {
    async function loadOrders() {
      try {
        const res = await orderService.getOrders({ store_id: activeStoreId });
        const rawOrders = res?.orders || res?.data || [];
        if (Array.isArray(rawOrders)) {
          const mapped = rawOrders.map((o, idx) => {
            return {
              id: o.id || o.order_id || o.billNo || (idx + 1),
              billNo: o.billNo || `Bill ${o.order_number || o.orderNo || (idx + 1)}`,
              tableNo: o.tableNo || o.table_name || `Table ${o.table_id || (idx + 1)}`,
              table_id: o.table_id || o.tableId,
              billType: (() => {
                const type = o.billType || o.order_type;
                if (type && type.toUpperCase() !== 'DINE_IN') return type;
                const tbl = String(o.tableNo || o.table_name || o.table_id || o.tableId || '');
                if (tbl.startsWith('TK-') || tbl.toUpperCase().includes('TAKEAWAY')) return 'Takeaway';
                if (tbl.startsWith('DL-') || tbl.toUpperCase().includes('DELIVERY')) return 'Delivery';
                return type || 'Dine In';
              })(),
              billDate: (() => {
                const dStr = o.createdAt || o.billDate;
                if (!dStr) return new Date().toLocaleDateString();
                const dt = new Date(dStr);
                return isNaN(dt) ? dStr : dt.toLocaleDateString();
              })(),
              orderNo: String(o.orderNo || o.order_number || (idx + 1)),
              amount: Number(o.amount || o.total_amount || 0),
              customerName: o.customerName || o.customer_name || 'Walk-in',
              mobileNo: o.mobileNo || o.mobile_no || o.customer_phone || o.phone || o.mobile || '—',
              waiter: o.waiter || o.waiter_name || 'Staff',
              payment_status: o.payment_status || 'Paid',
              items: o.items || [],
              extra_details: typeof o.extra_details === 'string' ? JSON.parse(o.extra_details || '{}') : (o.extra_details || {})
            };
          });
          setData(mapped);
        }
      } catch (err) {
        console.warn('Error loading live orders:', err);
      }
    }
    loadOrders();
  }, [activeStoreId]);

  const handleOpenInvoice = async (row) => {
    const printWindow = null;
    if (printWindow) {
      printWindow.document.write('<html><head><title>Loading...</title></head><body style="font-family:sans-serif;display:flex;justify-content:center;align-items:center;height:100vh;background:#ffffff;color:#333;"><div>Generating print layout, please wait...</div></body></html>');
      printWindow.document.close();
    }

    try {
      const res = await orderService.getOrderById(row.id);
      const fetchedOrder = res?.order || res?.data;

      const matchingTable = tables.find(t => String(t.id) === String(row.table_id) || String(t.id) === String(fetchedOrder?.table_id) || t.no === row.tableNo);
      const displayTableName = matchingTable
        ? (matchingTable.table_name || `T${parseInt(matchingTable.no || matchingTable.table_no || '1', 10)}`)
        : (row.tableNo || '1');

      if (fetchedOrder) {
        fetchedOrder.table_name = displayTableName;
        printTaxInvoice(fetchedOrder, printWindow);
      } else {
        row.table_name = displayTableName;
        printTaxInvoice(row, printWindow);
      }
    } catch (err) {
      console.warn('Error fetching detailed invoice data:', err);
      const matchingTable = tables.find(t => String(t.id) === String(row.table_id) || t.no === row.tableNo);
      row.table_name = matchingTable ? (matchingTable.table_name || `T${matchingTable.no}`) : row.tableNo;
      printTaxInvoice(row, printWindow);
    }
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
    {
      key: 'tableNo',
      label: 'Table No',
      render: (val, row) => {
        const matchingTable = tables.find(t => String(t.id) === String(row.table_id) || t.no === val);
        const displayTableName = matchingTable
          ? (matchingTable.table_name || `T${parseInt(matchingTable.no || matchingTable.table_no || '1', 10)}`)
          : val;
        return (
          <div>{displayTableName}</div>
        );
      }
    },
    {
      key: 'area',
      label: 'Area',
      render: (val, row) => {
        const matchingTable = tables.find(t => String(t.id) === String(row.table_id) || t.no === row.tableNo);
        const areaName = matchingTable?.area_name || matchingTable?.area || '—';
        return <div style={{ textTransform: 'uppercase' }}>{areaName}</div>;
      }
    },
    { key: 'billType', label: 'Bill Type', renderStatus: true, activeValue: 'DINE_IN' },
    { key: 'billDate', label: 'Bill Date' },
    { key: 'orderNo', label: 'Order No' },
    { key: 'amount', label: 'Amount', render: (val) => `₹${Number(val).toFixed(2)}` },
    { key: 'customerName', label: 'Customer Name' },
    { key: 'mobileNo', label: 'Mobile No' },
    // { key: 'payment_status', label: 'Payment Status', renderStatus: true, activeValue: 'Paid' },
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
      onClick: (row) => handleMenuClick(row),
      icon: <FaEye size={13} />
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
        data={data.filter(row => {
          if (areaFilter === 'All') return true;
          const matchingTable = tables.find(t => String(t.id) === String(row.table_id) || t.no === row.tableNo);
          return matchingTable && matchingTable.area === areaFilter;
        })}
        actions={actions}
        onAddEntry={null}
        searchPlaceholder="Search orders by table, customer, type..."
        showToast={showToast}
        breadcrumbs={['Dashboard', 'Restaurant', 'Order Details']}
        areaFilter={areaFilter}
        setAreaFilter={setAreaFilter}
        areasList={availableAreas}
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
                {selectedBill.extra_details?.customer_address && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Address:</span>
                    <span style={{ fontWeight: 700, color: '#1e293b' }}>{selectedBill.extra_details.customer_address}</span>
                  </div>
                )}
                {selectedBill.extra_details?.customer_locality && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Locality:</span>
                    <span style={{ fontWeight: 700, color: '#1e293b' }}>{selectedBill.extra_details.customer_locality}</span>
                  </div>
                )}
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
