import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { FaPrint, FaCheck, FaExclamationTriangle, FaTimes, FaSpinner } from 'react-icons/fa';
import { printKOTPayload } from '../../services/kotEngine';

const KOTPrintModal = ({ isOpen, onClose, kotGroups = [], payloads = [], kotNo, tableNo, onKOTSuccess }) => {
  const [printStatuses, setPrintStatuses] = useState({});
  const [allDone, setAllDone] = useState(false);
  const [autoPrinted, setAutoPrinted] = useState(false);
  const closeRef = useRef(null);
  const hasGroups = kotGroups.length > 0;

  // Reset + auto-trigger print when modal opens
  useEffect(() => {
    if (isOpen && hasGroups) {
      const initial = {};
      kotGroups.forEach(g => {
        const key = g.printer?.id || g.key;
        initial[key] = { state: 'idle', error: g.hasError ? g.errorMessage : null };
      });
      setPrintStatuses(initial);
      setAllDone(false);
      setAutoPrinted(false);
    }
  }, [isOpen, kotGroups]);

  // Auto-print all stations 400ms after modal opens
  useEffect(() => {
    if (isOpen && hasGroups && !autoPrinted) {
      setAutoPrinted(true);
      const timer = setTimeout(() => {
        runPrintAll();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [isOpen, hasGroups, autoPrinted]);

  // Focus close button when all done
  useEffect(() => {
    if (allDone && closeRef.current) closeRef.current.focus();
  }, [allDone]);

  // Keyboard: Escape closes
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  const printOne = useCallback(async (group, payload) => {
    const pid = group.printer?.id || group.key;
    setPrintStatuses(prev => ({ ...prev, [pid]: { state: 'printing', error: null } }));
    
    // Check if configuration error exists
    if (group.hasError || payload.hasError) {
      const errMsg = group.errorMessage || payload.errorMessage || 'No printer configured for this station.';
      setPrintStatuses(prev => ({
        ...prev,
        [pid]: { state: 'failed', error: errMsg },
      }));
      return { success: false, error: errMsg };
    }

    const success = printKOTPayload(payload);
    setPrintStatuses(prev => ({
      ...prev,
      [pid]: { state: success ? 'success' : 'failed', error: success ? null : 'Failed to send print job.' },
    }));
    return { success, error: success ? null : 'Failed to send print job.' };
  }, []);

  const runPrintAll = useCallback(async () => {
    const results = await Promise.all(
      kotGroups.map((group, i) => printOne(group, payloads[i] || {}))
    );
    setAllDone(true);
    const allSuccess = results.every(r => r.success);
    if (allSuccess && onKOTSuccess) onKOTSuccess();
  }, [kotGroups, payloads, printOne, onKOTSuccess]);

  if (!isOpen) return null;

  // If no groups at all show a fallback
  if (!hasGroups) {
    const fallback = (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100vh', zIndex: 999999, background: 'rgba(15,23,42,0.75)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', boxSizing: 'border-box' }}>
        <div style={{ background: '#fff', borderRadius: '16px', padding: '40px', textAlign: 'center', maxWidth: '380px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🖨️</div>
          <div style={{ fontWeight: 800, color: '#0e7490', fontSize: '1.2rem', marginBottom: '8px' }}>KOT Generated</div>
          <div style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '24px' }}>No printer stations were matched. Items sent to default printer.</div>
          <button ref={closeRef} onClick={onClose} style={{ padding: '10px 28px', borderRadius: '8px', border: 'none', background: '#0e7490', color: '#fff', fontWeight: 800, cursor: 'pointer' }}>Close</button>
        </div>
      </div>
    );
    return typeof document !== 'undefined' ? createPortal(fallback, document.body) : fallback;
  }

  const successCount = Object.values(printStatuses).filter(s => s.state === 'success').length;
  const failCount = Object.values(printStatuses).filter(s => s.state === 'failed').length;
  const printingCount = Object.values(printStatuses).filter(s => s.state === 'printing').length;

  const modalJSX = (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      width: '100vw', height: '100vh',
      zIndex: 999999,
      background: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '820px',
        maxHeight: '88vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
        overflow: 'hidden'
      }}>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 24px',
          background: 'linear-gradient(135deg, #0c4a6e 0%, #0e7490 60%, #0891b2 100%)',
          color: '#fff'
        }}>
          <div>
            <div style={{ fontSize: '1.2rem', fontWeight: 900, letterSpacing: '0.5px' }}>
              🖨️ &nbsp;{kotNo} — KOT Sent
            </div>
            <div style={{ fontSize: '0.78rem', opacity: 0.85, marginTop: '3px' }}>
              Table {tableNo} &nbsp;·&nbsp; {kotGroups.length} printer station{kotGroups.length > 1 ? 's' : ''}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {allDone && (
              <span style={{ fontSize: '0.75rem', background: failCount > 0 ? 'rgba(239,68,68,0.3)' : 'rgba(22,163,74,0.3)', padding: '4px 12px', borderRadius: '999px', fontWeight: 700 }}>
                {failCount > 0 ? `${failCount} Failed` : `✓ All ${successCount} Printed`}
              </span>
            )}
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>
              <FaTimes />
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ height: '4px', background: '#f1f5f9', position: 'relative' }}>
          <div style={{
            height: '100%', background: failCount > 0 ? '#ef4444' : '#16a34a',
            width: `${kotGroups.length > 0 ? ((successCount + failCount) / kotGroups.length) * 100 : 0}%`,
            transition: 'width 400ms ease'
          }} />
        </div>

        {/* KOT Station Cards */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '16px 20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '14px', alignContent: 'start' }}>
          {kotGroups.map((group, i) => {
            const pid = group.printer.id;
            const status = printStatuses[pid] || { state: 'idle' };
            const payload = payloads[i] || {};
            const catColor = group.color || '#0e7490';

            const cardBg = status.state === 'success' ? '#f0fdf4'
              : status.state === 'failed' ? '#fef2f2'
              : status.state === 'printing' ? '#f0f9ff'
              : '#fff';

            const borderColor = status.state === 'success' ? '#16a34a'
              : status.state === 'failed' ? '#ef4444'
              : status.state === 'printing' ? '#0ea5e9'
              : catColor;

            return (
              <div key={pid} style={{
                border: `2px solid ${borderColor}`,
                borderRadius: '14px',
                overflow: 'hidden',
                background: cardBg,
                boxShadow: `0 4px 16px ${catColor}22`,
                transition: 'all 300ms ease'
              }}>
                {/* Colored top accent bar */}
                <div style={{ height: '6px', background: catColor, opacity: status.state === 'idle' ? 0.6 : 1 }} />

                {/* Card header */}
                <div style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${catColor}22` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: catColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <FaPrint color="#fff" size={14} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#0f172a' }}>{group.printer.name}</div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '1px' }}>
                        <span style={{ background: catColor + '20', color: catColor, fontWeight: 700, padding: '1px 7px', borderRadius: '999px', fontSize: '0.65rem' }}>
                          {group.productionCategory?.name || 'General'}
                        </span>
                        &nbsp;·&nbsp;
                        {group.printer.type === 'Network' ? `${group.printer.ip}:${group.printer.port}` : group.printer.type}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: catColor, background: catColor + '15', padding: '3px 8px', borderRadius: '6px' }}>
                      {group.items.length} item{group.items.length !== 1 ? 's' : ''}
                    </span>
                    <div style={{ fontSize: '1.1rem' }}>
                      {status.state === 'printing' && <FaSpinner style={{ animation: 'spin 0.8s linear infinite', color: '#0ea5e9' }} />}
                      {status.state === 'success' && <FaCheck style={{ color: '#16a34a' }} />}
                      {status.state === 'failed' && <FaExclamationTriangle style={{ color: '#ef4444' }} />}
                      {status.state === 'idle' && <FaPrint style={{ color: '#94a3b8' }} />}
                    </div>
                    {status.state === 'failed' && (
                      <button onClick={() => printOne(group, payload)} style={{ padding: '4px 10px', borderRadius: '6px', border: 'none', background: '#ef4444', color: '#fff', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}>
                        Retry
                      </button>
                    )}
                  </div>
                </div>

                {/* Items */}
                <div style={{ padding: '10px 14px 12px' }}>
                  {group.items.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'baseline', gap: '8px', padding: '4px 0', borderBottom: idx < group.items.length - 1 ? '1px dashed #f1f5f9' : 'none' }}>
                      <span style={{ fontWeight: 900, color: catColor, minWidth: '22px', fontSize: '0.9rem', textAlign: 'right' }}>{item.qty}×</span>
                      <span style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.83rem', flex: 1 }}>{item.name || item.itemName}</span>
                      {(item.variantName || item.variant) && (
                        <span style={{ fontSize: '0.67rem', background: '#f1f5f9', color: '#64748b', padding: '1px 6px', borderRadius: '4px', fontWeight: 600, whiteSpace: 'nowrap' }}>
                          {item.variantName || item.variant}
                        </span>
                      )}
                      {item.remark && (
                        <span style={{ fontSize: '0.67rem', color: '#f59e0b', fontStyle: 'italic', whiteSpace: 'nowrap' }}>★ {item.remark}</span>
                      )}
                    </div>
                  ))}
                  {status.error && (
                    <div style={{ marginTop: '6px', fontSize: '0.72rem', color: '#ef4444', fontWeight: 600, padding: '4px 8px', background: '#fef2f2', borderRadius: '6px' }}>
                      ✗ {status.error}
                    </div>
                  )}
                </div>

                {/* Status footer */}
                <div style={{ padding: '8px 14px', background: borderColor + '10', fontSize: '0.7rem', fontWeight: 700, color: borderColor, textAlign: 'center' }}>
                  {status.state === 'idle' && '⏳ Waiting to print…'}
                  {status.state === 'printing' && '🖨️ Sending to printer…'}
                  {status.state === 'success' && '✓ Printed successfully'}
                  {status.state === 'failed' && '✗ Print failed — click Retry'}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 20px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '10px', justifyContent: 'flex-end', alignItems: 'center', background: '#fafafa' }}>
          {!allDone ? (
            <button onClick={runPrintAll} disabled={printingCount > 0} style={{
              padding: '10px 26px', borderRadius: '8px', border: 'none',
              background: printingCount > 0 ? '#94a3b8' : 'linear-gradient(135deg, #0e7490, #0891b2)',
              color: '#fff', fontWeight: 800, fontSize: '0.88rem', cursor: printingCount > 0 ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', gap: '7px',
              boxShadow: printingCount > 0 ? 'none' : '0 4px 12px rgba(14,116,144,0.3)'
            }}>
              {printingCount > 0
                ? <><FaSpinner style={{ animation: 'spin 0.8s linear infinite' }} /> Printing {printingCount} station{printingCount > 1 ? 's' : ''}…</>
                : <><FaPrint size={13} /> Print All Stations</>
              }
            </button>
          ) : (
            <button ref={closeRef} onClick={onClose} style={{
              padding: '10px 26px', borderRadius: '8px', border: 'none',
              background: failCount > 0 ? '#ef4444' : '#16a34a',
              color: '#fff', fontWeight: 800, fontSize: '0.88rem', cursor: 'pointer'
            }}>
              {failCount > 0 ? `✗ ${failCount} Failed — Close` : '✓ KOT Sent — Close'}
            </button>
          )}
          <button onClick={onClose} style={{ padding: '10px 18px', borderRadius: '8px', border: '1.5px solid #e2e8f0', background: '#fff', color: '#64748b', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer' }}>
            Close
          </button>
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalJSX, document.body) : modalJSX;
};

export default KOTPrintModal;
