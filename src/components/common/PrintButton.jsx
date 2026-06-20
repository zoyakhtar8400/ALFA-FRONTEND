import React from 'react';
import { Button } from '@mui/material';
import { FaPrint } from 'react-icons/fa';
import { handlePrint } from '../../utils/printUtil';

const PrintButton = ({ onClick, label = 'Print', ...props }) => {
  const defaultClick = () => {
    // Search for print-footer text element to update or just run handlePrint
    handlePrint();
  };

  return (
    <Button
      variant="outlined"
      onClick={onClick || defaultClick}
      className="no-print"
      startIcon={<FaPrint size={12} />}
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
        transition: 'var(--transition)'
      }}
      {...props}
    >
      {label}
    </Button>
  );
};

export default PrintButton;
