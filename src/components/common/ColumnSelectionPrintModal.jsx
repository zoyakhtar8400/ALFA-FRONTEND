import React, { useState, useEffect } from 'react';
import { FaPrint, FaTimes, FaCheckSquare, FaSquare, FaExclamationCircle } from 'react-icons/fa';

/**
 * ColumnSelectionPrintModal
 * Universal modal allowing users to select which columns appear in the printed document.
 * 
 * Props:
 * - isOpen (bool): whether modal is visible
 * - onClose (func): callback when user cancels
 * - columns (array): array of column definitions ({ key, label } or strings)
 * - onPrint (func): callback with array of selected column keys
 * - title (string): optional dialog title
 */
const ColumnSelectionPrintModal = ({
  isOpen,
  onClose,
  columns = [],
  onPrint,
  title = 'Select Columns to Print'
}) => {
  // Normalize columns to { key, label }
  const normalizedColumns = React.useMemo(() => {
    return columns
      .map(col => {
        if (typeof col === 'string') {
          return { key: col, label: col };
        }
        return {
          key: col.key || col.accessor || col.id || col.label,
          label: col.label || col.header || col.name || col.title || col.key
        };
      })
      .filter(col => col.key && col.label && col.key !== 'action' && col.label.toLowerCase() !== 'action' && col.label.toLowerCase() !== 'actions');
  }, [columns]);

  const [selectedKeys, setSelectedKeys] = useState([]);
  const [error, setError] = useState('');

  // When modal opens or columns change, default to all columns selected
  useEffect(() => {
    if (isOpen) {
      setSelectedKeys(normalizedColumns.map(c => c.key));
      setError('');
    }
  }, [isOpen, normalizedColumns]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleToggleColumn = (key) => {
    setError('');
    setSelectedKeys(prev => {
      if (prev.includes(key)) {
        return prev.filter(k => k !== key);
      } else {
        return [...prev, key];
      }
    });
  };

  const handleSelectAll = () => {
    setError('');
    setSelectedKeys(normalizedColumns.map(c => c.key));
  };

  const handleDeselectAll = () => {
    setSelectedKeys([]);
  };

  const handleConfirmPrint = () => {
    if (selectedKeys.length === 0) {
      setError('Please select at least one column to print.');
      return;
    }
    setError('');
    onPrint(selectedKeys);
  };

  return (
    <div
      className="no-print"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(3px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.15s ease-out'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="col-select-title"
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '540px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '85vh',
          overflow: 'hidden',
          border: '1px solid #e2e8f0'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(to right, #f8fafc, #ffffff)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: '#eff6ff',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <FaPrint size={16} />
            </div>
            <div>
              <h3 id="col-select-title" style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>
                {title}
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                Choose which data columns to include in the printed page
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              border: 'none',
              background: 'transparent',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f1f5f9';
              e.currentTarget.style.color = '#334155';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#94a3b8';
            }}
          >
            <FaTimes size={16} />
          </button>
        </div>

        {/* Toolbar: Select All / Deselect All / Count */}
        <div
          style={{
            padding: '12px 24px',
            backgroundColor: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px'
          }}
        >
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>
            Selected: <strong style={{ color: '#0f172a' }}>{selectedKeys.length}</strong> of {normalizedColumns.length} columns
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={handleSelectAll}
              style={{
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#334155',
                fontSize: '0.75rem',
                fontWeight: 600,
                padding: '5px 12px',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
            >
              <FaCheckSquare size={12} style={{ color: '#2563eb' }} />
              Select All
            </button>
            <button
              type="button"
              onClick={handleDeselectAll}
              style={{
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#334155',
                fontSize: '0.75rem',
                fontWeight: 600,
                padding: '5px 12px',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
            >
              <FaSquare size={12} style={{ color: '#94a3b8' }} />
              Deselect All
            </button>
          </div>
        </div>

        {/* Column Checkboxes List */}
        <div
          style={{
            padding: '16px 24px',
            overflowY: 'auto',
            flex: 1,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '10px',
            alignContent: 'start'
          }}
        >
          {normalizedColumns.map((col) => {
            const isChecked = selectedKeys.includes(col.key);
            return (
              <label
                key={col.key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  backgroundColor: isChecked ? '#eff6ff' : '#f8fafc',
                  border: isChecked ? '1px solid #bfdbfe' : '1px solid #e2e8f0',
                  cursor: 'pointer',
                  userSelect: 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleToggleColumn(col.key)}
                  style={{
                    width: '16px',
                    height: '16px',
                    accentColor: '#2563eb',
                    cursor: 'pointer'
                  }}
                />
                <span
                  style={{
                    fontSize: '0.85rem',
                    fontWeight: isChecked ? 600 : 500,
                    color: isChecked ? '#1e40af' : '#475569',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                  title={col.label}
                >
                  {col.label}
                </span>
              </label>
            );
          })}
        </div>

        {/* Validation Error Alert */}
        {error && (
          <div
            style={{
              margin: '0 24px 12px',
              padding: '10px 14px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              color: '#dc2626',
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: 600
            }}
          >
            <FaExclamationCircle size={14} />
            <span>{error}</span>
          </div>
        )}

        {/* Modal Footer */}
        <div
          style={{
            padding: '14px 24px',
            borderTop: '1px solid #e2e8f0',
            backgroundColor: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '12px'
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '9px 18px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#475569',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmPrint}
            style={{
              padding: '9px 20px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 1px 3px rgba(37, 99, 235, 0.3)',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
          >
            <FaPrint size={13} />
            Print Selected Columns
          </button>
        </div>
      </div>
    </div>
  );
};

export default ColumnSelectionPrintModal;
