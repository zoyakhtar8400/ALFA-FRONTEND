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
      `}</style>        {/* Modern Premium Invoice Receipt Container */}
      <div
        className="invoice-container"
        style={{
          width: '100%', maxWidth: '380px', background: '#ffffff',
          padding: '24px 20px', borderRadius: '8px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.3)',
          border: '1px solid #e2e8f0', boxSizing: 'border-box', color: '#000000',
          fontFamily: '\'Outfit\', \'Segoe UI\', sans-serif'
        }}
      >
        {/* 1. Restaurant Name */}
        <div style={{ textAlign: 'center', marginBottom: '14px' }}>
          <div style={{ fontSize: '20px', fontWeight: '900', letterSpacing: '0.8px', textTransform: 'uppercase', color: '#000000' }}>
            {order.restaurant_name || 'VARDAN RESTAURANT'}
          </div>
          {order.outlet_name && order.outlet_name.toUpperCase() !== (order.restaurant_name || 'VARDAN RESTAURANT').toUpperCase() && (
            <div style={{ fontSize: '13px', fontWeight: '800', marginTop: '2px', color: '#000000', textTransform: 'uppercase' }}>
              {order.outlet_name}
            </div>
          )}

          {/* 2. Address Section */}
          <div style={{ fontSize: '11px', marginTop: '4px', color: '#000000', fontWeight: '800', textTransform: 'uppercase', lineHeight: '1.35' }}>
            {order.address || 'VARDAAN TOWER 2 , SHAHEED NAGAR GATE NO.1 OPPOSITE DR. AMBEDKAR UNIVERSITY , LUCKNOW, LUCKNOW, UTTAR PRADESH'}
          </div>

          {/* 3. Phone Number */}
          <div style={{ fontSize: '11.5px', color: '#000000', fontWeight: '800', marginTop: '2px' }}>
            Ph: {order.phone || '9794950982 , 9794950983'}
          </div>

          {/* 4. GSTIN */}
          <div style={{ fontSize: '11.5px', color: '#000000', fontWeight: '800', marginTop: '2px' }}>
            GSTIN: {(order.gstin || '09LCMPS7008F1Z0').toUpperCase()}
          </div>

          {/* 5. FSSAI No */}
          {order.fssai && (
            <div style={{ fontSize: '11.5px', color: '#000000', fontWeight: '800', marginTop: '2px' }}>
              FSSAI: {order.fssai}
            </div>
          )}

          {/* 6. Bill Headers */}
          {order.billHeader1 && <div style={{ fontSize: '11px', fontWeight: '700', marginTop: '2px' }}>{order.billHeader1}</div>}
          {order.billHeader2 && <div style={{ fontSize: '11px', fontWeight: '700', marginTop: '1px' }}>{order.billHeader2}</div>}
          {order.billHeader3 && <div style={{ fontSize: '11px', fontWeight: '700', marginTop: '1px' }}>{order.billHeader3}</div>}

          {/* 7. Title Badge: TAX INVOICE / BILL */}
          <div style={{
            fontSize: '15px', fontWeight: '900', marginTop: '10px',
            padding: '4px 0', letterSpacing: '0.8px', textTransform: 'uppercase', color: '#000000'
          }}>
            TAX INVOICE / BILL
          </div>
        </div>

        {/* 8. Metadata Details */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', fontWeight: '600', lineHeight: '1.4', marginBottom: '8px', color: '#000000' }}>
          <div>
            <div>Bill No: {cleanBillNo()}</div>
            <div>Table: {String(order.tableNo || order.table_name || 'T4').toLowerCase().startsWith('table') ? (order.tableNo || order.table_name) : `Table ${order.tableNo || order.table_name || 'T4'}`}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div>Date: {order.billDate || new Date().toLocaleDateString('en-GB').replace(/\//g, '-')}</div>
            <div>Time: {order.billTime || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase()}</div>
          </div>
        </div>

        {/* Items Table with Inverted Solid Black Header */}
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', marginBottom: '8px', color: '#000000' }}>
          <thead>
            <tr style={{ background: '#000000', color: '#ffffff' }}>
              <th style={{ textAlign: 'left', padding: '4px 4px', fontWeight: '900', width: '45%', textTransform: 'uppercase' }}>ITEM</th>
              <th style={{ textAlign: 'center', padding: '4px 4px', fontWeight: '900', width: '15%', textTransform: 'uppercase' }}>QTY</th>
              <th style={{ textAlign: 'right', padding: '4px 4px', fontWeight: '900', width: '20%', textTransform: 'uppercase' }}>RATE</th>
              <th style={{ textAlign: 'right', padding: '4px 4px', fontWeight: '900', width: '20%', textTransform: 'uppercase' }}>AMT</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>
                  NO MENU ITEMS
                </td>
              </tr>
            ) : items.map((item, idx) => {
              const displayName = (item.itemName || item.name || 'ITEM') + (item.variantName ? ` (${item.variantName})` : '');
              const rate = Number(item.unitPrice || item.price || item.rate || 0);
              const total = Number(item.total || item.amount || (item.qty * rate));
              return (
                <tr key={idx}>
                  <td style={{ padding: '4px 2px', fontWeight: '800', wordBreak: 'break-word' }}>
                    {displayName}
                    {item.remark && <div style={{ fontSize: '10px', fontWeight: 'normal', fontStyle: 'italic' }}>* {item.remark}</div>}
                  </td>
                  <td style={{ padding: '4px 2px', textAlign: 'center', fontWeight: '800' }}>{item.qty || 1}</td>
                  <td style={{ padding: '4px 2px', textAlign: 'right', fontWeight: '800' }}>{formatAmount(rate)}</td>
                  <td style={{ padding: '4px 2px', textAlign: 'right', fontWeight: '900' }}>{formatAmount(total)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Totals Summary */}
        <div style={{ borderTop: '1px solid #000000', paddingTop: '6px', fontSize: '12.5px', color: '#000000', fontWeight: '800' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
            <span>Subtotal:</span>
            <span>{formatAmount(subtotal)}</span>
          </div>
          {discountAmount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
              <span>Discount:</span>
              <span>-{formatAmount(discountAmount)}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
            <span>CGST:</span>
            <span>{formatAmount(cgst || ((subtotal - discountAmount) * 0.025))}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
            <span>SGST:</span>
            <span>{formatAmount(sgst || ((subtotal - discountAmount) * 0.025))}</span>
          </div>

          {/* Grand Total with double heavy line */}
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            borderTop: '2px solid #000000', borderBottom: '3.5px double #000000',
            padding: '5px 0', marginTop: '6px', marginBottom: '8px',
            fontSize: '15px', fontWeight: '900'
          }}>
            <span>GRAND TOTAL:</span>
            <span>₹ {formatAmount(grandTotal || subtotal + (cgst || 0) + (sgst || 0))}</span>
          </div>
        </div>

        {/* Receipt Footer */}
        <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '11px', color: '#000000', fontWeight: '800' }}>
          <div style={{ textTransform: 'uppercase', marginBottom: '4px' }}>
            THANK YOU! VISIT AGAIN
          </div>
          <div style={{ fontSize: '10px', fontWeight: '700', color: '#222222' }}>
            User: {(order.cashier || order.waiter || order.user_name || 'SAMAR').toUpperCase()} &nbsp;|&nbsp; Print Date & Time: {new Date().toLocaleDateString('en-GB').replace(/\//g, '-')} {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderInvoicePage;
