import React from 'react';
import { Box, Button, Select, MenuItem, Typography, IconButton } from '@mui/material';
import { FaChevronLeft, FaChevronRight, FaAngleDoubleLeft, FaAngleDoubleRight } from 'react-icons/fa';

const Pagination = ({
  totalItems,
  itemsPerPage,
  currentPage,
  onPageChange,
  onItemsPerPageChange,
  itemsPerPageOptions = [10, 25, 50, 100],
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const startRange = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endRange = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <Box
      className="no-print"
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 2,
        padding: '16px 24px',
        backgroundColor: 'var(--surface)',
        borderTop: 'none',
        fontSize: '0.85rem',
        color: 'var(--text-secondary)',
        fontWeight: 600,
      }}
    >
      {/* Page Size Selector */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="body2" sx={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>
          Show
        </Typography>
        <Select
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          size="small"
          sx={{
            borderRadius: '20px',
            backgroundColor: 'var(--background)',
            fontSize: '0.85rem',
            fontWeight: 700,
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'var(--border)',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: 'var(--primary)',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: 'var(--primary)',
            }
          }}
        >
          {itemsPerPageOptions.map((opt) => (
            <MenuItem key={opt} value={opt} sx={{ fontSize: '0.85rem' }}>
              {opt}
            </MenuItem>
          ))}
        </Select>
        <Typography variant="body2" sx={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>
          entries
        </Typography>
      </Box>

      {/* Item info */}
      <Box sx={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
        Showing {startRange} to {endRange} of {totalItems} records
      </Box>

      {/* Navigation Controls */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        {/* First Page */}
        <IconButton
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          size="small"
          sx={{ border: '1px solid var(--border)', borderRadius: '8px', p: 1 }}
        >
          <FaAngleDoubleLeft size={10} />
        </IconButton>

        {/* Prev Page */}
        <IconButton
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          size="small"
          sx={{ border: '1px solid var(--border)', borderRadius: '8px', p: 1 }}
        >
          <FaChevronLeft size={10} />
        </IconButton>

        {/* Page numbers */}
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter(p => Math.abs(p - currentPage) <= 1 || p === 1 || p === totalPages)
          .map((p, idx, arr) => {
            const showEllipsis = idx > 0 && p - arr[idx - 1] > 1;
            return (
              <React.Fragment key={p}>
                {showEllipsis && <span style={{ padding: '0 4px', opacity: 0.6 }}>...</span>}
                <Button
                  onClick={() => onPageChange(p)}
                  variant={currentPage === p ? 'contained' : 'outlined'}
                  sx={{
                    minWidth: '32px',
                    height: '32px',
                    p: 0,
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    textTransform: 'none',
                    borderColor: currentPage === p ? 'var(--primary)' : 'var(--border)',
                    backgroundColor: currentPage === p ? 'var(--primary)' : 'transparent',
                    color: currentPage === p ? '#ffffff' : 'var(--text-primary)',
                    boxShadow: currentPage === p ? '0 4px 10px rgba(65,138,139,0.2)' : 'none',
                    '&:hover': {
                      borderColor: 'var(--primary)',
                      backgroundColor: currentPage === p ? 'var(--primary-hover)' : 'var(--primary-light)',
                      color: currentPage === p ? '#ffffff' : 'var(--primary)',
                    }
                  }}
                >
                  {p}
                </Button>
              </React.Fragment>
            );
          })}

        {/* Next Page */}
        <IconButton
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || totalPages === 0}
          size="small"
          sx={{ border: '1px solid var(--border)', borderRadius: '8px', p: 1 }}
        >
          <FaChevronRight size={10} />
        </IconButton>

        {/* Last Page */}
        <IconButton
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages || totalPages === 0}
          size="small"
          sx={{ border: '1px solid var(--border)', borderRadius: '8px', p: 1 }}
        >
          <FaAngleDoubleRight size={10} />
        </IconButton>
      </Box>
    </Box>
  );
};

export default Pagination;
