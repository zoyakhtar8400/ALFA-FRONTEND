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
      gridTemplateColumns: showAll ? 'repeat(5, 1fr)' : 'repeat(3, 1fr)',
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

        .btn-payment {
          background: #10b981;
          box-shadow: 0 2px 6px rgba(16, 185, 129, 0.15);
        }
        .btn-payment:hover {
          background: #059669;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
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

      {(showAll || isViewMode) && (
        <>
          <button
            type="button"
            disabled={isNC}
            onClick={onSave}
            className="pos-action-btn btn-save"
          >
            <span>Save Draft</span>
            <span className="btn-hotkey-label">F5</span>
          </button>

          <button
            type="button"
            disabled={isNC}
            onClick={onBilling}
            className="pos-action-btn btn-print-bill"
          >
            <span>Print Bill</span>
            <span className="btn-hotkey-label">F9</span>
          </button>
        </>
      )}

      {(showAll || !isViewMode) && (
        <>
          <button
            type="button"
            onClick={onKOT}
            className="pos-action-btn btn-kot"
          >
            <span>KOT</span>
            <span className="btn-hotkey-label">F8</span>
          </button>

          <button
            type="button"
            onClick={onKOTAndPrint}
            className="pos-action-btn btn-kot-print"
          >
            <span>KOT & Print</span>
            <span className="btn-hotkey-label">F9</span>
          </button>
        </>
      )}

      {isBillingDesk && (
        <button
          type="button"
          onClick={onPay}
          className="pos-action-btn btn-payment"
        >
          <span>Payment</span>
          <span className="btn-hotkey-label">F10</span>
        </button>
      )}
    </div>
  );
};

export default React.memo(POSActionButtons);
