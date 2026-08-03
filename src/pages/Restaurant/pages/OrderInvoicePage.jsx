import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { orderService } from '../../../services/orderService';

const OrderInvoicePage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const urlOrderId = queryParams.get('orderId') || queryParams.get('id') || queryParams.get('billNo');
  const initialOrder = location.state?.order || null;

  const [order, setOrder] = useState(initialOrder);
  const [loading, setLoading] = useState(!initialOrder);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchOrderFromBackend() {
      const targetId = urlOrderId || initialOrder?.id || initialOrder?.billNo;
      if (!targetId) {
        if (!initialOrder) setError('No order ID provided for invoice');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const res = await orderService.getOrderById(targetId);
        const fetchedOrder = res?.order || res?.data;
        if (fetchedOrder) {
          setOrder(fetchedOrder);
        } else {
          const listRes = await orderService.getOrders();
          const orders = listRes?.orders || listRes?.data || [];
          const found = orders.find(o => String(o.id) === String(targetId) || String(o.billNo) === String(targetId) || String(o.orderNo) === String(targetId));
          if (found) {
            setOrder(found);
          } else if (initialOrder) {
            setOrder(initialOrder);
          } else {
            setError(`Order #${targetId} not found in database`);
          }
        }
      } catch (err) {
        console.warn('Error fetching invoice order from backend:', err);
        if (initialOrder) {
          setOrder(initialOrder);
        } else {
          setError('Failed to fetch invoice details from database');
        }
      } finally {
        setLoading(false);
      }
    }

    fetchOrderFromBackend();
  }, [urlOrderId]);

  const autoPrintedRef = React.useRef(false);

  useEffect(() => {
    if (!loading && order && !autoPrintedRef.current) {
      autoPrintedRef.current = true;
      const timer = setTimeout(() => {
        window.print();
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [loading, order]);

  const handlePrint = () => {
    window.print();
  };

  const handleBack = () => {
    navigate('/restaurant/order-details');
  };

  if (loading) {
    return (
      <div style={{ padding: '30px', textAlign: 'center', fontFamily: '\'Courier New\', Courier, monospace', color: '#000' }}>
        <strong>LOADING INVOICE...</strong>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div style={{ padding: '30px', textAlign: 'center', fontFamily: '\'Courier New\', Courier, monospace', color: '#000' }}>
        <h3 style={{ margin: '0 0 10px' }}>INVOICE NOT FOUND</h3>
        <p style={{ fontSize: '13px', marginBottom: '20px' }}>{error || 'Order record missing.'}</p>
        <button
          onClick={handleBack}
          style={{ padding: '8px 20px', background: '#000', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
        >
          &larr; BACK TO ORDER DETAILS
        </button>
      </div>
    );
  }

  const items = Array.isArray(order.items) ? order.items : [];
  const hasItems = items.length > 0;

  const formatAmount = (num) => {
    if (!hasItems) return '00';
    const val = Number(num || 0);
    return val === 0 ? '00' : val.toFixed(2);
  };

  const subtotal = hasItems ? Number(order.subtotal || order.amount || 0) : 0;
  const taxAmount = hasItems ? Number(order.tax_amount || (subtotal * 0.05)) : 0;
  const discountAmount = hasItems ? Number(order.discount_amount || 0) : 0;
  const grandTotal = hasItems ? Number(order.total_amount || order.amount || (subtotal + taxAmount - discountAmount)) : 0;

  return (
    <div style={{ background: '#ffffff', minHeight: '100vh', padding: '16px 20px', fontFamily: '\'Courier New\', Courier, monospace', color: '#000000', width: '100%', boxSizing: 'border-box' }}>
      {/* Top Controls Bar (hidden during print) */}
      <div className="no-print" style={{ width: '100%', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          onClick={handleBack}
          style={{
            background: '#333333', color: '#ffffff', border: '1px solid #000000',
            padding: '8px 18px', borderRadius: '4px', cursor: 'pointer',
            fontSize: '13px', fontWeight: 'bold', fontFamily: 'monospace'
          }}
        >
          &larr; BACK TO ORDER DETAILS
        </button>

        <button
          onClick={handlePrint}
          style={{
            background: '#000000', color: '#ffffff', border: '1px solid #000000',
            padding: '8px 24px', borderRadius: '4px', cursor: 'pointer',
            fontSize: '13px', fontWeight: 'bold', fontFamily: 'monospace'
          }}
        >
          PRINT INVOICE
        </button>
      </div>

      {/* Embedded Print & Full-Cover CSS (Zero Margins Left/Right on Print & Screen) */}
      <style>{`
        @page {
          size: auto;
          margin: 0mm;
        }
        @media print {
          .no-print { display: none !important; }
          html, body { background: #ffffff !important; margin: 0 !important; padding: 0 !important; width: 100% !important; color: #000000 !important; }
          .invoice-container {
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 10mm 15mm !important;
            border: none !important;
            box-shadow: none !important;
            box-sizing: border-box !important;
          }
        }
      `}</style>

      {/* Full-Width Full-Cover Invoice Container (No Left/Right Outer Spacing) */}
      <div
        className="invoice-container"
        style={{
          width: '100%', background: '#ffffff',
          border: '2px solid #000000', padding: '24px 28px',
          boxSizing: 'border-box'
        }}
      >
        {/* Restaurant Header */}
        <div style={{ textAlign: 'center', borderBottom: '2px solid #000000', paddingBottom: '12px', marginBottom: '16px' }}>
          <div style={{ fontSize: '22px', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase' }}>
            ALFA HOTEL & RESTAURANT
          </div>
          <div style={{ fontSize: '12px', marginTop: '4px', color: '#222222' }}>
            123 LUXURY ROAD, CITY CENTRE · GSTIN: 27AAAAA0000A1Z5
          </div>
          <div style={{ fontSize: '12px', color: '#222222' }}>
            PHONE: +91 98765 43210
          </div>
          <div style={{
            fontSize: '15px', fontWeight: 'bold', marginTop: '10px',
            borderTop: '2px dashed #000000', borderBottom: '2px dashed #000000',
            padding: '6px 0', letterSpacing: '1.5px'
          }}>
            TAX INVOICE / CASH BILL
          </div>
        </div>

        {/* Metadata Details */}
        <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse', marginBottom: '16px', color: '#000000' }}>
          <tbody>
            <tr>
              <td style={{ padding: '3px 0', width: '50%' }}><strong>BILL NO:</strong> {order.billNo || order.id}</td>
              <td style={{ padding: '3px 0', width: '50%', textAlign: 'right' }}><strong>DATE:</strong> {order.billDate || new Date().toLocaleDateString()}</td>
            </tr>
            <tr>
              <td style={{ padding: '3px 0' }}><strong>TABLE:</strong> {order.tableNo || order.table_name || 'T01'}</td>
              <td style={{ padding: '3px 0', textAlign: 'right' }}><strong>TYPE:</strong> {order.billType || order.order_type || 'DINE_IN'}</td>
            </tr>
            <tr>
              <td style={{ padding: '3px 0' }}><strong>CUSTOMER:</strong> {order.customerName || order.customer_name || 'Walk-in'}</td>
              <td style={{ padding: '3px 0', textAlign: 'right' }}><strong>MOBILE:</strong> {order.mobileNo || order.customer_phone || '—'}</td>
            </tr>
            <tr>
              <td style={{ padding: '3px 0' }}><strong>WAITER:</strong> {order.waiter || order.waiter_name || 'Staff'}</td>
              <td style={{ padding: '3px 0', textAlign: 'right' }}><strong>STATUS:</strong> [{order.payment_status || 'PAID'}]</td>
            </tr>
          </tbody>
        </table>

        {/* Items Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', marginBottom: '16px', color: '#000000' }}>
          <thead>
            <tr style={{ borderTop: '2px solid #000000', borderBottom: '2px solid #000000' }}>
              <th style={{ textAlign: 'left', padding: '6px 4px', fontWeight: 'bold', width: '50%' }}>ITEM DESCRIPTION</th>
              <th style={{ textAlign: 'center', padding: '6px 4px', fontWeight: 'bold', width: '15%' }}>QTY</th>
              <th style={{ textAlign: 'right', padding: '6px 4px', fontWeight: 'bold', width: '17%' }}>RATE (₹)</th>
              <th style={{ textAlign: 'right', padding: '6px 4px', fontWeight: 'bold', width: '18%' }}>AMOUNT (₹)</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: '16px', textAlign: 'center', color: '#000000', fontWeight: 'bold' }}>
                  NO MENU ITEMS SHOWING — AMOUNT: ₹00
                </td>
              </tr>
            ) : items.map((item, idx) => {
              const displayName = (item.itemName || item.name || 'ITEM') + (item.variantName ? ` (${item.variantName})` : '');
              const rate = Number(item.unitPrice || item.price || item.rate || 0);
              const total = Number(item.total || (item.qty * rate));
              return (
                <tr key={idx} style={{ borderBottom: '1px dashed #bbbbbb' }}>
                  <td style={{ padding: '6px 4px', fontWeight: 'bold' }}>
                    {displayName}
                    {item.remark && <div style={{ fontSize: '11px', fontWeight: 'normal', color: '#444444' }}>NOTE: {item.remark}</div>}
                  </td>
                  <td style={{ padding: '6px 4px', textAlign: 'center', fontWeight: 'bold' }}>{item.qty || 1}</td>
                  <td style={{ padding: '6px 4px', textAlign: 'right' }}>₹{formatAmount(rate)}</td>
                  <td style={{ padding: '6px 4px', textAlign: 'right', fontWeight: 'bold' }}>₹{formatAmount(total)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Totals Summary */}
        <div style={{ borderTop: '2px solid #000000', paddingTop: '10px', fontSize: '13px', color: '#000000' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span>SUBTOTAL:</span>
            <span>₹{formatAmount(subtotal)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span>GST / TAX (5%):</span>
            <span>₹{formatAmount(taxAmount)}</span>
          </div>
          {discountAmount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>DISCOUNT:</span>
              <span>- ₹{formatAmount(discountAmount)}</span>
            </div>
          )}
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            borderTop: '1px solid #000000', borderBottom: '2px solid #000000',
            padding: '8px 0', marginTop: '6px', fontSize: '16px', fontWeight: 'bold'
          }}>
            <span>GRAND TOTAL:</span>
            <span>₹{formatAmount(grandTotal)}</span>
          </div>
        </div>

        {/* Receipt Footer */}
        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '12px', borderTop: '1px dashed #000000', paddingTop: '12px', color: '#222222' }}>
          *** THANK YOU FOR DINING WITH ALFA ***<br />
          COMPUTER GENERATED CASH RECEIPT · HAVE A WONDERFUL DAY!
        </div>
      </div>
    </div>
  );
};

export default OrderInvoicePage;
