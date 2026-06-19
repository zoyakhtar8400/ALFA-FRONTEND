import { useEffect } from 'react';

const PrintStyles = () => {
  useEffect(() => {
    // Create style element
    const style = document.createElement('style');
    style.media = 'print';
    style.innerHTML = `
      @media print {
        @page {
          size: A4;
          margin: 15mm;
        }
        
        body * {
          visibility: hidden;
        }
        
        .dashboard-panel,
        .dashboard-panel * {
          visibility: visible;
        }
        
        .dashboard-panel {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          padding: 0 !important;
          box-shadow: none !important;
          border: none !important;
        }
        
        /* Hide UI elements */
        .table-header-controls,
        .table-btn-group,
        .table-action-icon-btn,
        .pagination-controls,
        button,
        .table-search-wrapper,
        .entries-select-wrapper {
          display: none !important;
        }
        
        /* Print header */
        .print-header {
          display: flex !important;
          flex-direction: column;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 2px solid #333;
        }
        
        .print-logo-img {
          height: 70px;
          max-width: 220px;
          object-fit: contain;
          margin-bottom: 8px;
        }
        
        .print-title {
          font-size: 18px;
          font-weight: bold;
          color: #333;
          margin-top: 8px;
        }
        
        /* Print footer */
        .print-footer {
          display: block !important;
          margin-top: 30px;
          padding-top: 10px;
          border-top: 1px solid #ddd;
          font-size: 11px;
          color: #666;
        }
        
        /* Table styling */
        .custom-table {
          width: 100%;
          border-collapse: collapse;
        }
        
        .custom-table thead {
          background-color: #f5f5f5 !important;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        
        .custom-table th,
        .custom-table td {
          border: 1px solid #ddd !important;
          padding: 8px !important;
          text-align: left;
        }
        
        .custom-table th {
          font-weight: bold;
          font-size: 12px;
        }
        
        .custom-table td {
          font-size: 11px;
        }
        
        /* Status badges */
        .status-badge {
          padding: 3px 8px !important;
          border-radius: 4px !important;
          font-size: 10px !important;
          font-weight: bold !important;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        
        .status-badge.available {
          background-color: #d4edda !important;
          color: #155724 !important;
        }
        
        .status-badge.occupied {
          background-color: #f8d7da !important;
          color: #721c24 !important;
        }
        
        /* Hide action column */
        .custom-table th:last-child,
        .custom-table td:last-child {
          display: none !important;
        }
        
        /* Page breaks */
        .custom-table tr {
          page-break-inside: avoid;
        }
        
        .custom-table thead {
          display: table-header-group;
        }
      }
    `;
    
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  return null;
};

export default PrintStyles;
