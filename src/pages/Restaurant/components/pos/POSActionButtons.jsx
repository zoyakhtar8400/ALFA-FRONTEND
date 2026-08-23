import React from 'react';

const POSActionButtons = ({
  onSave,
  onBilling,
  onKOT,
  onKOTAndPrint,
  onPay,
  isNC = false,
  isViewMode = false,
  isBillingDesk = false
}) => {
  const showAll = isBillingDesk;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: showAll ? 'repeat(4, 1fr)' : 'repeat(2, 1fr)',
      gap: '8px',
      padding: '12px 16px',
      background: '#ffffff',
      borderTop: '1px solid #cbd5e1'
    }}>
      <style>{`
        .pos-action-btn {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          height: 46px;
          border-radius: 10px;
          border: none;
          font-weight: 800;
          font-size: 0.76rem;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          color: #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
          text-transform: uppercase;
          letter-spacing: 0.3px;
          user-select: none;
        }
        .pos-action-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }
        .pos-action-btn:active {
          transform: translateY(0);
        }
        .pos-action-btn:disabled {
          background: #f1f5f9 !important;
          color: #94a3b8 !important;
          cursor: not-allowed !important;
          box-shadow: none !important;
          transform: none !important;
        }

        .btn-save {
          background: #475569;
        }
        .btn-save:hover {
          background: #334155;
        }

        .btn-print-bill {
          background: #d97706;
          box-shadow: 0 2px 6px rgba(217, 119, 6, 0.15);
        }
        .btn-print-bill:hover {
          background: #b45309;
          box-shadow: 0 4px 12px rgba(217, 119, 6, 0.25);
        }

        .btn-kot {
          background: #4f46e5;
          box-shadow: 0 2px 6px rgba(79, 70, 229, 0.15);
        }
        .btn-kot:hover {
          background: #4338ca;
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.25);
        }

        .btn-kot-print {
          background: #6366f1;
          box-shadow: 0 2px 6px rgba(99, 102, 241, 0.15);
        }
        .btn-kot-print:hover {
          background: #4f46e5;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
        }

        .btn-hotkey-label {
          font-size: 8.5px;
          opacity: 0.85;
          margin-top: 2px;
          font-weight: 700;
          background: rgba(255, 255, 255, 0.18);
          padding: 1px 5px;
          border-radius: 4px;
        }
      `}</style>

      {/* 1. Save Draft Button */}
      {(showAll || isViewMode) && (
        <button
          type="button"
          disabled={isNC}
          onClick={onSave}
          className="pos-action-btn btn-save"
          title="Save Draft (F5)"
          aria-keyshortcuts="F5"
        >
          <span>Save Draft</span>
          <span className="btn-hotkey-label">F5</span>
        </button>
      )}

      {/* 2. Print Bill / Customer Invoice */}
      {(showAll || isViewMode) && (
        <button
          type="button"
          disabled={isNC}
          onClick={onBilling}
          className="pos-action-btn btn-print-bill"
          title="Print Bill / Save & Print (F9, Enter, or Ctrl+Enter)"
          aria-keyshortcuts="F9 Enter"
        >
          <span>Print Bill</span>
          <span className="btn-hotkey-label">F9 / ↵</span>
        </button>
      )}

      {/* 3. KOT (Send uncut items to kitchen) */}
      {(showAll || !isViewMode) && (
        <button
          type="button"
          onClick={onKOT}
          className="pos-action-btn btn-kot"
          title="KOT (F8)"
          aria-keyshortcuts="F8"
        >
          <span>KOT</span>
          <span className="btn-hotkey-label">F8</span>
        </button>
      )}

      {/* 4. KOT & Print (Send & Print Kitchen KOT) */}
      {(showAll || !isViewMode) && (
        <button
          type="button"
          onClick={onKOTAndPrint}
          className="pos-action-btn btn-kot-print"
          title="KOT & Print (F7)"
          aria-keyshortcuts="F7"
        >
          <span>KOT & Print</span>
          <span className="btn-hotkey-label">F7</span>
        </button>
      )}
    </div>
  );
};

export default React.memo(POSActionButtons);
