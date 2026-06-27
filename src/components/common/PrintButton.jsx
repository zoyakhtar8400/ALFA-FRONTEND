import React, { useState } from 'react';
import { Button } from '@mui/material';
import { FaPrint } from 'react-icons/fa';
import { handlePrint } from '../../utils/printUtil';

const PrintButton = ({ onClick, label = 'Print', ...props }) => {
  const [printLoading, setPrintLoading] = useState(false);

  const defaultClick = () => {
    handlePrint();
  };

  const handleClick = (e) => {
    setPrintLoading(true);
    if (window.showToast) {
      window.showToast("Loading...");
    }
    setTimeout(() => {
      if (onClick) {
        onClick(e);
      } else {
        defaultClick();
      }
      setPrintLoading(false);
      if (window.showToast) {
        window.showToast("Print Completed");
      }
    }, 400);
  };

  return (
    <Button
      variant="outlined"
      onClick={handleClick}
      disabled={printLoading}
      className="no-print"
      startIcon={printLoading ? undefined : <FaPrint size={12} />}
      sx={{
        borderRadius: '20px',
        borderColor: 'var(--border)',
        color: 'var(--text-secondary)',
        textTransform: 'none',
        fontWeight: 'bold',
        fontSize: '0.85rem',
        padding: '6px 18px',
        fontFamily: 'var(--font-family)',
        backgroundColor: 'var(--surface)',
        '&:hover': {
          borderColor: 'var(--primary)',
          backgroundColor: 'var(--primary-light)',
          color: 'var(--primary)',
        },
        '&.Mui-disabled': {
          backgroundColor: 'var(--border)',
          color: 'var(--text-light)',
        },
        transition: 'var(--transition)'
      }}
      {...props}
    >
      {printLoading ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-slate-400 border-t-transparent"></div>
          <span>Printing...</span>
        </div>
      ) : label}
    </Button>
  );
};

export default PrintButton;
