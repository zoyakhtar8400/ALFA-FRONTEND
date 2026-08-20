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

  // Use backend-calculated values directly — NO frontend recalculation
  const subtotal = Number(order.subtotal || 0);
  const discountAmount = Number(order.discount || order.discount_amount || 0);
  const cgst = Number(order.taxes?.cgst || 0);
  const sgst = Number(order.taxes?.sgst || 0);
  const grandTotal = Number(order.grand_total || order.total_amount || order.amount || 0);

  const cleanBillNo = () => {
    const b = String(order.billNo || order.custom_bill_number || order.order_number || order.id || '');
    if (b.startsWith('Bill ')) return b;
    const digits = b.replace(/[^0-9]/g, '');
    if (digits && digits.length <= 4) return `Bill ${parseInt(digits, 10)}`;
    return b || 'Bill 1';
  };

  return (
    <div style={{ background: '#0f172a', minHeight: '100vh', padding: '24px 20px', fontFamily: '\'Segoe UI\', Tahoma, Geneva, Verdana, sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', boxSizing: 'border-box' }}>
      {/* Top Controls Bar (hidden during print) */}
      <div className="no-print" style={{ width: '100%', maxWidth: '480px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          onClick={handleBack}
          style={{
            background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#ffffff',
            padding: '10px 18px', borderRadius: '8px', cursor: 'pointer',
            fontSize: '13px', fontWeight: '700', transition: 'all 0.2s', outline: 'none'
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'; }}
        >
          &larr; Back
        </button>

        <button
          onClick={handlePrint}
          style={{
            background: 'linear-gradient(135deg, #0e7490 0%, #155e75 100%)', color: '#ffffff', border: 'none',
            padding: '10px 24px', borderRadius: '8px', cursor: 'pointer',
            fontSize: '13px', fontWeight: '800', boxShadow: '0 4px 12px rgba(14, 116, 144, 0.3)', transition: 'all 0.2s', outline: 'none'
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(14, 116, 144, 0.4)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 12px rgba(14, 116, 144, 0.3)'; }}
        >
          Print Invoice
        </button>
      </div>

      {/* Embedded Print & Full-Cover CSS */}
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
            padding: 2mm 4mm !important;
            border: none !important;
            box-shadow: none !important;
            box-sizing: border-box !important;
            border-radius: 0 !important;
          }
        }
      `}</style>

      {/* Modern Premium Invoice Receipt Container */}
      <div
        className="invoice-container"
        style={{
          width: '100%', maxWidth: '480px', background: '#ffffff',
          padding: '32px 28px', borderRadius: '12px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.3)',
          border: '1px solid #e2e8f0', boxSizing: 'border-box', color: '#000000'
        }}
      >
        {/* Restaurant Header */}
        <div style={{ textAlign: 'center', borderBottom: '1.5px dashed #000000', paddingBottom: '16px', marginBottom: '16px' }}>
          {order.restaurant_name && (
            <div style={{ fontSize: '23px', fontWeight: '900', letterSpacing: '1.5px', textTransform: 'uppercase', fontFamily: '\'Outfit\', \'Segoe UI\', sans-serif', color: '#000000' }}>
              {order.restaurant_name}
            </div>
          )}
          {order.outlet_name && (
            <div style={{ fontSize: '15px', fontWeight: '800', marginTop: '2px', color: '#000000', textTransform: 'uppercase', fontFamily: '\'Outfit\', \'Segoe UI\', sans-serif' }}>
              {order.outlet_name}
            </div>
          )}
          <div style={{ fontSize: '11px', marginTop: '6px', color: '#333333', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {order.address || 'Main Dining Area'}
          </div>
          <div style={{ fontSize: '11px', color: '#333333', fontWeight: '600', marginTop: '2px' }}>
            GSTIN: {order.gstin || '27AAAAA0000A1Z5'} {order.hsn ? `| HSN: ${order.hsn}` : ''} | FSSAI: {order.fssai || '10020021000123'}
          </div>
          <div style={{ fontSize: '11px', color: '#333333', fontWeight: '600', marginTop: '2px' }}>
            PHONE: {order.phone || '+91 98765 43210'}
          </div>
          <div style={{
            fontSize: '14px', fontWeight: '800', marginTop: '14px',
            borderTop: '1.5px dashed #000000', borderBottom: '1.5px dashed #000000',
            padding: '6px 0', letterSpacing: '2px', textTransform: 'uppercase', fontFamily: '\'Outfit\', \'Segoe UI\', sans-serif'
          }}>
            TAX INVOICE
          </div>
        </div>

        {/* Metadata Details */}
        <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse', marginBottom: '16px', color: '#000000', fontFamily: 'monospace', fontWeight: 'bold' }}>
          <tbody>
            <tr>
              <td style={{ padding: '4px 0', width: '50%' }}>BILL NO: {cleanBillNo()}</td>
              <td style={{ padding: '4px 0', width: '50%', textAlign: 'right' }}>DATE: {order.billDate || new Date().toLocaleDateString()}</td>
            </tr>
            <tr>
              <td style={{ padding: '4px 0' }}>TABLE: {order.tableNo || order.table_name || 'T01'}</td>
              <td style={{ padding: '4px 0', textAlign: 'right' }}>TYPE: {order.billType || order.order_type || 'DINE_IN'}</td>
            </tr>
            <tr>
              <td style={{ padding: '4px 0' }}>CUST: {order.customerName || order.customer_name || 'Walk-in'}</td>
              <td style={{ padding: '4px 0', textAlign: 'right' }}>MOB: {order.mobileNo || order.customer_phone || '—'}</td>
            </tr>
            <tr>
              <td style={{ padding: '4px 0' }}>WAITER: {order.waiter || order.waiter_name || 'Staff'}</td>
              <td style={{ padding: '4px 0', textAlign: 'right' }}>STATUS: [{order.payment_status || 'PAID'}]</td>
            </tr>
          </tbody>
        </table>

        {/* Items Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', marginBottom: '16px', color: '#000000', fontFamily: 'monospace' }}>
          <thead>
            <tr style={{ borderTop: '1.5px dashed #000000', borderBottom: '1.5px dashed #000000' }}>
              <th style={{ textAlign: 'left', padding: '6px 0', fontWeight: 'bold', width: '50%' }}>ITEM DESCRIPTION</th>
              <th style={{ textAlign: 'center', padding: '6px 0', fontWeight: 'bold', width: '15%' }}>QTY</th>
              <th style={{ textAlign: 'right', padding: '6px 0', fontWeight: 'bold', width: '17%' }}>RATE</th>
              <th style={{ textAlign: 'right', padding: '6px 0', fontWeight: 'bold', width: '18%' }}>AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: '16px', textAlign: 'center', fontWeight: 'bold' }}>
                  NO MENU ITEMS SHOWING
                </td>
              </tr>
            ) : items.map((item, idx) => {
              const displayName = (item.itemName || item.name || 'ITEM') + (item.variantName ? ` (${item.variantName})` : '');
              const rate = Number(item.unitPrice || item.price || item.rate || 0);
              const total = Number(item.total || (item.qty * rate));
              return (
                <tr key={idx} style={{ borderBottom: '1px dotted #888888' }}>
                  <td style={{ padding: '6px 0', fontWeight: 'bold', wordBreak: 'break-word' }}>
                    {displayName.toUpperCase()}
                    {item.remark && <div style={{ fontSize: '10px', fontWeight: 'normal', fontStyle: 'italic' }}>* {item.remark}</div>}
                  </td>
                  <td style={{ padding: '6px 0', textAlign: 'center', fontWeight: 'bold' }}>{item.qty || 1}</td>
                  <td style={{ padding: '6px 0', textAlign: 'right' }}>₹{formatAmount(rate)}</td>
                  <td style={{ padding: '6px 0', textAlign: 'right', fontWeight: 'bold' }}>₹{formatAmount(total)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Totals Summary */}
        <div style={{ borderTop: '1.5px dashed #000000', paddingTop: '10px', fontSize: '12px', color: '#000000', fontFamily: 'monospace' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontWeight: 'bold' }}>
            <span>SUBTOTAL:</span>
            <span>₹{formatAmount(subtotal)}</span>
          </div>
          {discountAmount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontWeight: 'bold' }}>
              <span>DISCOUNT:</span>
              <span>- ₹{formatAmount(discountAmount)}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontWeight: 'bold' }}>
            <span>CGST (2.5%):</span>
            <span>₹{formatAmount(cgst)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontWeight: 'bold' }}>
            <span>SGST (2.5%):</span>
            <span>₹{formatAmount(sgst)}</span>
          </div>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            borderTop: '1.5px dashed #000000', borderBottom: '1.5px dashed #000000',
            padding: '8px 0', marginTop: '6px', fontSize: '15px', fontWeight: '900'
          }}>
            <span>NET AMOUNT:</span>
            <span>₹{formatAmount(grandTotal)}</span>
          </div>
        </div>

        {/* Receipt Footer */}
        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '11px', borderTop: '1.5px dashed #000000', paddingTop: '12px', color: '#333333', fontWeight: 'bold' }}>
          *** THANK YOU FOR DINING WITH US ***<br />
          HAVE A WONDERFUL DAY!
        </div>
      </div>
    </div>
  );
};

export default OrderInvoicePage;
