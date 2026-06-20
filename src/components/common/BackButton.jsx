import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import { FaArrowLeft } from 'react-icons/fa';

const BackButton = ({ onClick, label = 'Back' }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(-1);
    }
  };

  return (
    <Button
      variant="outlined"
      onClick={handleBack}
      className="no-print"
      startIcon={<FaArrowLeft size={12} />}
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
    >
      {label}
    </Button>
  );
};

export default BackButton;
