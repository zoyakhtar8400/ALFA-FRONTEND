import React from 'react';

const Button = ({ children, onClick, type = 'button', className = '', ...props }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
