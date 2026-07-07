import React, { useState } from 'react';
import { Button } from '@mui/material';
import { FaPrint } from 'react-icons/fa';
import { handlePrint } from '../../utils/printUtil';
const PrintButton = ({ onClick, label = 'Print', ...props }) => {
  const defaultClick = () => {
    handlePrint();
  };

  const handleClick = (e) => {
    if (onClick) {
      onClick(e);
    } else {
      defaultClick();
    }
  };

  return (
    <Button
      variant="outlined"
      onClick={handleClick}
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
        '&.Mui-disabled': {
          backgroundColor: 'var(--border)',
          color: 'var(--text-light)',
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
