import React from 'react';
import CommonActionToolbar from '../CommonActionToolbar';

const ActionButtons = ({ onPrint, onPDF, onExcel, onRefresh, onFilter }) => {
  return (
    <div style={{
      gridColumn: '1 / -1',
      marginTop: '12px',
      borderTop: '1px solid #f1f5f9',
      paddingTop: '16px'
    }}>
      <CommonActionToolbar
        onPrint={onPrint}
        onPDF={onPDF}
        onExcel={onExcel}
        onRefresh={onRefresh}
        onFilter={onFilter}
      />
    </div>
  );
};

export default ActionButtons;

