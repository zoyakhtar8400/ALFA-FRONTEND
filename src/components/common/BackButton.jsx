import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

const BackButton = ({ onClick, label = 'Back' }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onClick) {
      onClick();
    } else if (
      window.location.pathname.includes('/master') ||
      window.location.pathname.includes('/masters')
    ) {
      navigate('/pos/master');
    } else if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/pos/master');
    }
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      className="no-print"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 14px',
        fontSize: '13px',
        fontWeight: 600,
        color: '#334155',
        background: '#ffffff',
        border: '1px solid #cbd5e1',
        borderRadius: '6px',
        cursor: 'pointer',
        boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
        transition: 'all 0.15s ease'
      }}
      onMouseOver={(e) => { e.currentTarget.style.background = '#f1f5f9'; }}
      onMouseOut={(e) => { e.currentTarget.style.background = '#ffffff'; }}
    >
      <FaArrowLeft style={{ fontSize: '11px' }} />
      <span>{label}</span>
    </button>
  );
};

export default BackButton;
