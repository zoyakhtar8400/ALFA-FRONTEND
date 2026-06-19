import React from 'react';
import { FaArrowLeft } from 'react-icons/fa';

const BackButton = ({ onClick, label = 'Back to List' }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontWeight: 'bold',
        borderRadius: '20px',
        border: '1px solid var(--border)',
        padding: '8px 18px',
        backgroundColor: 'var(--surface)',
        cursor: 'pointer',
        transition: 'var(--transition)',
        marginBottom: '20px'
      }}
    >
      <FaArrowLeft size={12} />
      <span>{label}</span>
    </button>
  );
};

export default BackButton;
