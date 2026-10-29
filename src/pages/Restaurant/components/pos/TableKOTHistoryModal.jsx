import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { FaTimes, FaConciergeBell, FaClock, FaCalendarAlt, FaPrint, FaSyncAlt } from 'react-icons/fa';
import { kotService } from '../../../../services/kotService';
import { printKitchenKOT } from '../../utils/printInvoice';

const TableKOTHistoryModal = ({
  isOpen,
  onClose,
  tableId,
  tableNo,
  tableObj,
  storeId,
  toast
}) => {
  const [kots, setKots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterMode, setFilterMode] = useState('active'); // 'active' | 'all'

  const fetchKots = useCallback(async () => {
    try {
      setLoading(true);
      const activeParam = filterMode === 'active' ? '1' : 'all';
      const targetStore = storeId || localStorage.getItem('activeOutletId') || 'STORE_1';

      // 1. Fetch active KOTs strictly for this table
      const queryTblId = tableObj?.id || tableId || tableNo;
      const queryTblNo = tableObj?.no || tableNo || tableId;

      const res = await kotService.getKOTList({
        table_id: queryTblId,
        table_no: queryTblNo,
        tableId: queryTblId,
        active: activeParam,
        store_id: targetStore
      }).catch(err => {
        console.warn('KOT query failed:', err);
        return null;
      });

      const list = res?.kots || res?.data || (Array.isArray(res) ? res : []);

      // Strict target identifiers for this table:
      const rawTableNo = String(tableNo || tableObj?.table_name || tableObj?.no || '').trim().toLowerCase();
      const rawTableId = tableObj?.id ? String(tableObj.id).trim().toLowerCase() : (tableId ? String(tableId).trim().toLowerCase() : '');
      const cleanNum = rawTableNo.replace(/^(table|tbl|t)\s*/i, '').trim();

      const exactTargets = new Set([
        rawTableNo,
        cleanNum,
        rawTableId,
        `table ${rawTableNo}`,
        `table ${cleanNum}`,
        `t${cleanNum}`
      ].filter(Boolean));

      const filtered = list.filter(k => {
        const kTableId = String(k.table_id || k.tableId || '').trim().toLowerCase();
        const kTableName = String(k.table_name || k.tableName || k.tableNo || '').trim().toLowerCase();
        const kCleanNum = kTableName.replace(/^(table|tbl|t)\s*/i, '').trim();

        // Check if numeric table IDs match directly
        if (rawTableId && kTableId && rawTableId === kTableId) {
          return true;
        }

        // Check exact match in exact targets
        if (exactTargets.has(kTableName) || exactTargets.has(kCleanNum) || exactTargets.has(kTableId)) {
          return true;
        }

        return false;
      });

      setKots(filtered);
    } catch (err) {
      console.warn('Error fetching table KOT history:', err);
      setKots([]);
    } finally {
      setLoading(false);
    }
  }, [tableId, tableNo, tableObj, filterMode, storeId]);

  useEffect(() => {
    if (isOpen) {
      fetchKots();
    }
  }, [isOpen, fetchKots]);

  if (!isOpen) return null;

  const handlePrintKOT = (kot) => {
    try {
      printKitchenKOT({
        kot_number: kot.id || kot.custom_bill_number || `KOT-${kot.kotId}`,
        table_number: tableNo || kot.tableId || 'Table',
        waiter_name: kot.waiter || 'Staff',
        items: kot.items || [],
        notes: kot.cancel_reason || kot.extra_details?.remarks || '',
        order_type: 'Dine In'
      });
      if (toast) toast(`Reprinting ${kot.id || kot.kotId}...`);
    } catch (e) {
      console.warn('Error reprinting KOT:', e);
      if (toast) toast('Failed to print KOT to printer.');
    }
  };

  return createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.72)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999999,
        padding: '24px',
        boxSizing: 'border-box'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: '#ffffff',
          width: '100%',
          maxWidth: '920px',
          maxHeight: '90vh',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'fadeIn 0.15s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#f8fafc'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: '#0e7490',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 6px -1px rgba(14, 116, 144, 0.3)'
            }}>
              <FaConciergeBell size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.3px' }}>
                  KOT History
                </h3>
                <span style={{
                  background: '#0e7490',
                  color: '#ffffff',
                  padding: '3px 10px',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  boxShadow: '0 1px 2px rgba(14, 116, 144, 0.2)'
                }}>
                  {tableNo ? `Table: ${tableNo}` : 'Current Order'}
                </span>
              </div>
              <p style={{ margin: '3px 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                Kitchen Order Tickets generated and routed to kitchen stations
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Filter buttons */}
            <div style={{
              display: 'inline-flex',
              background: '#e2e8f0',
              padding: '3px',
              borderRadius: '8px'
            }}>
              <button
                type="button"
                onClick={() => setFilterMode('active')}
                style={{
                  padding: '5px 14px',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  background: filterMode === 'active' ? '#ffffff' : 'transparent',
                  color: filterMode === 'active' ? '#0e7490' : '#64748b',
                  boxShadow: filterMode === 'active' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                Active KOTs
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('all')}
                style={{
                  padding: '5px 14px',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  background: filterMode === 'all' ? '#ffffff' : 'transparent',
                  color: filterMode === 'all' ? '#0e7490' : '#64748b',
                  boxShadow: filterMode === 'all' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                All (Inc. Closed)
              </button>
            </div>

            <button
              type="button"
              onClick={fetchKots}
              title="Refresh KOTs"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#475569',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <FaSyncAlt size={13} className={loading ? 'animate-spin' : ''} />
            </button>

            <button
              type="button"
              onClick={onClose}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                border: 'none',
                background: '#f1f5f9',
                color: '#64748b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <FaTimes size={16} />
            </button>
          </div>
        </div>

        {/* Body content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', background: '#f8fafc' }}>
          {loading ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
              <div style={{ fontSize: '1.8rem', marginBottom: '12px' }}>⏳</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#334155' }}>Loading Kitchen Tickets...</div>
            </div>
          ) : kots.length === 0 ? (
            <div style={{
              padding: '60px 24px',
              textAlign: 'center',
              color: '#94a3b8',
              border: '2px dashed #cbd5e1',
              borderRadius: '12px',
              background: '#ffffff'
            }}>
              <FaConciergeBell size={42} style={{ marginBottom: '14px', opacity: 0.35 }} />
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#334155' }}>
                No Kitchen Order Tickets Found
              </div>
              <div style={{ fontSize: '0.86rem', color: '#64748b', marginTop: '6px' }}>
                There are currently no {filterMode === 'active' ? 'active' : ''} KOTs registered for Table {tableNo || tableId}.
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {kots.map((k, idx) => {
                const kotNumberDisplay = k.id || k.custom_bill_number || k.kotNo || (k.kotId ? `KOT-${k.kotId}` : `KOT #${idx + 1}`);
                const kotStatus = typeof k.status === 'string' ? k.status : (k.status === 6 ? 'Closed' : (k.status === 5 ? 'Cancelled' : 'Served'));
                const isCancelled = kotStatus === 'Cancelled';
                const isClosed = kotStatus === 'Closed' || k.is_active === 0;

                return (
                  <div
                    key={k.kotId || k.id || idx}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '18px 20px',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.03)'
                    }}
                  >
                    {/* KOT Ticket Top Bar */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingBottom: '14px',
                      borderBottom: '1px dashed #cbd5e1',
                      marginBottom: '14px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{
                          fontSize: '1.15rem',
                          fontWeight: 900,
                          color: '#0e7490',
                          letterSpacing: '-0.3px'
                        }}>
                          {kotNumberDisplay}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.82rem', color: '#64748b' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                            <FaClock size={12} /> {k.time || '--:--'}
                          </span>
                          {k.date && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                              <FaCalendarAlt size={12} /> {k.date}
                            </span>
                          )}
                          {k.waiter && (
                            <span style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px', fontWeight: 700, color: '#334155' }}>
                              Waiter: {k.waiter}
                            </span>
                          )}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '6px',
                          fontSize: '0.78rem',
                          fontWeight: 900,
                          letterSpacing: '0.4px',
                          textTransform: 'uppercase',
                          background: isCancelled ? '#fef2f2' : isClosed ? '#f1f5f9' : '#ecfdf5',
                          color: isCancelled ? '#dc2626' : isClosed ? '#64748b' : '#047857',
                          border: `1px solid ${isCancelled ? '#fecaca' : isClosed ? '#e2e8f0' : '#a7f3d0'}`
                        }}>
                          {kotStatus}
                        </span>

                        <button
                          type="button"
                          onClick={() => handlePrintKOT(k)}
                          title="Reprint KOT Ticket"
                          style={{
                            padding: '5px 12px',
                            borderRadius: '6px',
                            border: '1px solid #cbd5e1',
                            background: '#ffffff',
                            color: '#334155',
                            fontSize: '0.78rem',
                            fontWeight: 800,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            cursor: 'pointer'
                          }}
                        >
                          <FaPrint size={12} /> Print
                        </button>
                      </div>
                    </div>

                    {/* Items Table */}
                    {Array.isArray(k.items) && k.items.length > 0 ? (
                      <div style={{
                        background: '#f8fafc',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        overflow: 'hidden'
                      }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                          <thead>
                            <tr style={{ background: '#f1f5f9', color: '#475569', fontSize: '0.78rem', textAlign: 'left' }}>
                              <th style={{ padding: '8px 14px', fontWeight: 800 }}>ITEM NAME</th>
                              <th style={{ padding: '8px 14px', textAlign: 'center', fontWeight: 800, width: '80px' }}>QTY</th>
                              <th style={{ padding: '8px 14px', textAlign: 'right', fontWeight: 800, width: '110px' }}>PRICE</th>
                              <th style={{ padding: '8px 14px', textAlign: 'right', fontWeight: 800, width: '110px' }}>TOTAL</th>
                            </tr>
                          </thead>
                          <tbody>
                            {k.items.map((it, itIdx) => (
                              <tr key={it.id || itIdx} style={{ borderTop: '1px solid #e2e8f0' }}>
                                <td style={{ padding: '10px 14px', color: '#1e293b' }}>
                                  <div style={{ fontWeight: 800, fontSize: '0.92rem' }}>
                                    {it.itemName || it.name || 'Item'}
                                  </div>
                                  {it.variantName && (
                                    <div style={{ fontSize: '0.78rem', color: '#0e7490', fontWeight: 700, marginTop: '2px' }}>
                                      {it.variantName}
                                    </div>
                                  )}
                                  {it.notes && (
                                    <div style={{ fontSize: '0.74rem', color: '#64748b', fontStyle: 'italic', marginTop: '2px' }}>
                                      Note: {it.notes}
                                    </div>
                                  )}
                                </td>
                                <td style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 900, color: '#0e7490', fontSize: '0.95rem' }}>
                                  {it.qty || it.quantity || 1}
                                </td>
                                <td style={{ padding: '10px 14px', textAlign: 'right', color: '#475569', fontWeight: 700 }}>
                                  ₹{Number(it.unitPrice || it.price || 0).toFixed(2)}
                                </td>
                                <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 900, color: '#0f172a', fontSize: '0.95rem' }}>
                                  ₹{Number(it.total || ((it.qty || it.quantity || 1) * (it.unitPrice || it.price || 0))).toFixed(2)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div style={{ fontSize: '0.84rem', color: '#64748b', fontStyle: 'italic', padding: '8px 0' }}>
                        All items routed to kitchen station.
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '14px 24px',
          borderTop: '1px solid #e2e8f0',
          background: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 700 }}>
            Total KOTs: {kots.length}
          </span>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '8px 22px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#334155',
              fontWeight: 800,
              fontSize: '0.86rem',
              cursor: 'pointer'
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default React.memo(TableKOTHistoryModal);
