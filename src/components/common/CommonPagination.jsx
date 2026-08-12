import React from 'react';
import { FaChevronLeft, FaChevronRight, FaAngleDoubleLeft, FaAngleDoubleRight } from 'react-icons/fa';

/**
 * CommonPagination component that provides unified table navigation and items-per-page logic.
 */
const CommonPagination = ({
  totalItems = 0,
  itemsPerPage = 10,
  currentPage = 1,
  onPageChange,
  onItemsPerPageChange,
  itemsPerPageOptions = [10, 25, 50, 100],
  onlyTable = false,
}) => {
  const safeTotalItems = Number.isFinite(Number(totalItems)) ? Number(totalItems) : 0;
  const safeItemsPerPage = Number.isFinite(Number(itemsPerPage)) && Number(itemsPerPage) > 0 ? Number(itemsPerPage) : 10;
  const safeCurrentPage = Number.isFinite(Number(currentPage)) && Number(currentPage) > 0 ? Number(currentPage) : 1;

  const totalPages = Math.ceil(safeTotalItems / safeItemsPerPage);
  const startRange = safeTotalItems === 0 ? 0 : (safeCurrentPage - 1) * safeItemsPerPage + 1;
  const endRange = Math.min(safeCurrentPage * safeItemsPerPage, safeTotalItems);

  if (onlyTable && totalPages <= 1) return null;

  return (
    <div className="no-print table-footer-controls">
      {/* Items per page selector */}
      {!onlyTable && (
        <div className="entries-select-wrapper">
          <span>Show</span>
          <select
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            className="entries-select"
          >
            {itemsPerPageOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <span>entries</span>
        </div>
      )}

      {/* Info text */}
      {!onlyTable && (
        <div className="text-slate-500 font-medium">
          Showing {startRange} to {endRange} of {safeTotalItems} records
        </div>
      )}

      {/* Pagination buttons */}
      <div className="pagination-controls">
        {/* First page */}
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="pagination-btn"
          title="First Page"
        >
          <FaAngleDoubleLeft size={10} />
        </button>

        {/* Previous page */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="pagination-btn"
          title="Previous Page"
        >
          <FaChevronLeft size={10} />
        </button>

        {/* Page numbers */}
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter(p => Math.abs(p - currentPage) <= 1 || p === 1 || p === totalPages)
          .map((p, idx, arr) => {
            const showEllipsis = idx > 0 && p - arr[idx - 1] > 1;
            return (
              <React.Fragment key={p}>
                {showEllipsis && <span className="px-1 text-slate-400">...</span>}
                <button
                  onClick={() => onPageChange(p)}
                  className={`pagination-btn ${currentPage === p ? 'active' : ''}`}
                >
                  {p}
                </button>
              </React.Fragment>
            );
          })}

        {/* Next page */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || totalPages === 0}
          className="pagination-btn"
          title="Next Page"
        >
          <FaChevronRight size={10} />
        </button>

        {/* Last page */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages || totalPages === 0}
          className="pagination-btn"
          title="Last Page"
        >
          <FaAngleDoubleRight size={10} />
        </button>
      </div>
    </div>
  );
};

export default CommonPagination;
