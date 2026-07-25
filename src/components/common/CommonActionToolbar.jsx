import React from 'react';
import {
  FaPlus,
  FaEye,
  FaEdit,
  FaTrash,
  FaPrint,
  FaFileExcel,
  FaFilePdf,
  FaSync,
  FaFilter,
  FaEllipsisV
} from 'react-icons/fa';

/**
 * CommonActionToolbar - Unified enterprise action toolbar for ALFA HMS.
 * Implements Rule 7: Single standard for toolbar actions across Reports, Masters, and Operations.
 */
const CommonActionToolbar = ({
  onAdd,
  onView,
  onEdit,
  onDelete,
  onPrint,
  onExcel,
  onPDF,
  onRefresh,
  onFilter,
  onMore,
  addLabel = 'Add New',
  viewLabel = 'View',
  editLabel = 'Edit',
  deleteLabel = 'Delete',
  printLabel = 'Print',
  excelLabel = 'Export Excel',
  pdfLabel = 'Export PDF',
  refreshLabel = 'Refresh',
  filterLabel = 'Filter',
  moreLabel = 'More',
  loading = false,
  disabled = false,
  customActions = [],
  className = ''
}) => {
  return (
    <div className={`enterprise-action-toolbar ${className}`}>
      {onAdd && (
        <button
          type="button"
          onClick={onAdd}
          disabled={disabled || loading}
          className="enterprise-action-btn btn-add"
          title={addLabel}
        >
          <FaPlus size={12} />
          <span>{addLabel}</span>
        </button>
      )}

      {onView && (
        <button
          type="button"
          onClick={onView}
          disabled={disabled || loading}
          className="enterprise-action-btn btn-secondary"
          title={viewLabel}
        >
          <FaEye size={12} />
          <span>{viewLabel}</span>
        </button>
      )}

      {onEdit && (
        <button
          type="button"
          onClick={onEdit}
          disabled={disabled || loading}
          className="enterprise-action-btn btn-secondary"
          title={editLabel}
        >
          <FaEdit size={12} />
          <span>{editLabel}</span>
        </button>
      )}

      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          disabled={disabled || loading}
          className="enterprise-action-btn btn-danger"
          title={deleteLabel}
        >
          <FaTrash size={12} />
          <span>{deleteLabel}</span>
        </button>
      )}

      {onRefresh && (
        <button
          type="button"
          onClick={onRefresh}
          disabled={disabled || loading}
          className="enterprise-action-btn btn-secondary"
          title={refreshLabel}
        >
          <FaSync size={12} className={loading ? 'animate-spin' : ''} />
          <span>{refreshLabel}</span>
        </button>
      )}

      {onFilter && (
        <button
          type="button"
          onClick={onFilter}
          disabled={disabled || loading}
          className="enterprise-action-btn btn-secondary"
          title={filterLabel}
        >
          <FaFilter size={12} />
          <span>{filterLabel}</span>
        </button>
      )}

      {onPrint && (
        <button
          type="button"
          onClick={onPrint}
          disabled={disabled || loading}
          className="enterprise-action-btn btn-secondary"
          title={printLabel}
        >
          <FaPrint size={12} />
          <span>{printLabel}</span>
        </button>
      )}

      {onPDF && (
        <button
          type="button"
          onClick={onPDF}
          disabled={disabled || loading}
          className="enterprise-action-btn btn-pdf"
          title={pdfLabel}
        >
          <FaFilePdf size={12} />
          <span>{pdfLabel}</span>
        </button>
      )}

      {onExcel && (
        <button
          type="button"
          onClick={onExcel}
          disabled={disabled || loading}
          className="enterprise-action-btn btn-excel"
          title={excelLabel}
        >
          <FaFileExcel size={12} />
          <span>{excelLabel}</span>
        </button>
      )}

      {customActions.map((action, idx) => (
        <button
          key={idx}
          type="button"
          onClick={action.onClick}
          disabled={disabled || loading || action.disabled}
          className={`enterprise-action-btn ${action.variant || 'btn-secondary'}`}
          title={action.label}
        >
          {action.icon}
          <span>{action.label}</span>
        </button>
      ))}

      {onMore && (
        <button
          type="button"
          onClick={onMore}
          disabled={disabled || loading}
          className="enterprise-action-btn btn-secondary"
          title={moreLabel}
        >
          <FaEllipsisV size={12} />
          <span>{moreLabel}</span>
        </button>
      )}
    </div>
  );
};

export default CommonActionToolbar;
