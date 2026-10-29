import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { FaTimes, FaInfoCircle } from 'react-icons/fa';

const VariantSelectionModal = ({ isOpen, onClose, item, onConfirm }) => {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const modalRef = useRef(null);

  const rawVariants = Array.isArray(item?.variants) ? item.variants.filter(v => v && (v.name || v.portion_name)) : [];
  // If item doesn't have explicit variants list but modal opened, fall back to base item
  const variants = rawVariants.length > 0 ? rawVariants : (item ? [{ name: 'Standard', price: item.price || 0 }] : []);

  useEffect(() => {
    if (isOpen) {
      setSelectedIdx(0);
    }
  }, [isOpen, item]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose?.();
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIdx((prev) => (prev + 1) % Math.max(1, variants.length));
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIdx((prev) => (prev - 1 + variants.length) % Math.max(1, variants.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (variants[selectedIdx]) {
          onConfirm?.(item, variants[selectedIdx], 1);
          onClose?.();
        }
      } else if (e.key >= '1' && e.key <= '9') {
        const numIdx = parseInt(e.key, 10) - 1;
        if (numIdx < variants.length) {
          e.preventDefault();
          setSelectedIdx(numIdx);
          onConfirm?.(item, variants[numIdx], 1);
          onClose?.();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, variants, selectedIdx, item, onConfirm, onClose]);

  if (!isOpen || !item) return null;

  const handleSelectPortion = (v, idx) => {
    setSelectedIdx(idx);
    onConfirm?.(item, v, 1);
    onClose?.();
  };

  const itemCode = item.code || item.item_code || item.itemCode || `ITM-${String(item.id || '000078').padStart(6, '0')}`;
  const isVeg = item.foodType === 'Veg' || item.type === 'Veg' || item.isVeg !== false;

  const modalNode = (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(3px)',
        WebkitBackdropFilter: 'blur(3px)',
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-family, system-ui), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div
        ref={modalRef}
        style={{
          background: '#ffffff',
          borderRadius: '12px',
          width: '540px',
          maxWidth: '94vw',
          boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.35)',
          border: '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'fadeIn 0.15s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px 14px 20px',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            background: '#ffffff'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            {/* Food Type Indicator Icon (Veg / Non-Veg square with dot) */}
            <div
              style={{
                width: '18px',
                height: '18px',
                border: `2px solid ${isVeg ? '#16a34a' : '#dc2626'}`,
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: '3px',
                flexShrink: 0
              }}
            >
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: isVeg ? '#16a34a' : '#dc2626'
                }}
              />
            </div>

            <div>
              <h3
                style={{
                  margin: 0,
                  fontSize: '1rem',
                  fontWeight: 800,
                  color: '#0f172a',
                  lineHeight: 1.3
                }}
              >
                {item.name || item.title}
              </h3>
              <div
                style={{
                  margin: '3px 0 0 0',
                  fontSize: '0.78rem',
                  color: '#64748b',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>Code: {itemCode}</span>
                <span>•</span>
                <span>Select portion / size</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              background: 'none',
              border: 'none',
              color: '#64748b',
              cursor: 'pointer',
              fontSize: '1rem',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <FaTimes />
          </button>
        </div>

        {/* Portions Section */}
        <div style={{ padding: '18px 20px' }}>
          {/* Section Bar */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '14px'
            }}
          >
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                color: '#475569',
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}
            >
              AVAILABLE PORTIONS ({variants.length})
            </span>
            <span
              style={{
                fontSize: '0.72rem',
                color: '#94a3b8',
                fontWeight: 600
              }}
            >
              Press [1..{Math.min(variants.length, 9)}] or Tap
            </span>
          </div>

          {/* Portions Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: variants.length === 1 ? '1fr' : 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '14px'
            }}
          >
            {variants.map((v, idx) => {
              const isSelected = idx === selectedIdx;
              const portionName = (v.name || v.portion_name || 'PORTION').toUpperCase();
              const priceVal = Number(v.price || 0).toFixed(2);
              const subLabel = v.serving || v.code || (portionName.length > 0 ? portionName[0] : '');

              return (
                <div
                  key={v.id || idx}
                  onClick={() => handleSelectPortion(v, idx)}
                  style={{
                    background: isSelected ? '#f0fdf4' : '#ffffff',
                    border: isSelected ? '2px solid #22c55e' : '1px solid #cbd5e1',
                    borderRadius: '12px',
                    padding: '14px 16px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '82px',
                    boxShadow: isSelected ? '0 4px 12px rgba(34, 197, 94, 0.12)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {/* Top row: portion name and key badge */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start'
                    }}
                  >
                    <span
                      style={{
                        fontWeight: 800,
                        fontSize: '0.92rem',
                        color: '#0f172a',
                        letterSpacing: '0.02em'
                      }}
                    >
                      {portionName}
                    </span>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        color: '#94a3b8',
                        background: '#f1f5f9',
                        padding: '1px 6px',
                        borderRadius: '4px'
                      }}
                    >
                      {idx + 1}
                    </span>
                  </div>

                  {/* Bottom row: sub letter/portion tag & Price */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-end',
                      marginTop: '10px'
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.75rem',
                        color: '#94a3b8',
                        fontWeight: 600,
                        textTransform: 'uppercase'
                      }}
                    >
                      {subLabel}
                    </span>
                    <span
                      style={{
                        fontSize: '0.95rem',
                        fontWeight: 800,
                        color: '#15803d'
                      }}
                    >
                      ₹{priceVal}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer info & Cancel button */}
        <div
          style={{
            padding: '12px 20px 16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid #f1f5f9',
            background: '#ffffff'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.74rem',
              color: '#94a3b8'
            }}
          >
            <FaInfoCircle style={{ fontSize: '0.8rem', color: '#94a3b8', flexShrink: 0 }} />
            <span>Item portions are preserved in KOT, Billing and Reports.</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '7px 18px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              background: '#f8fafc',
              color: '#475569',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalNode, document.body) : modalNode;
};

export default VariantSelectionModal;
