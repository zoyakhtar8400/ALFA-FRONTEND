import React from 'react';

const Table = ({ headers, data, renderRow, className = '' }) => {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="min-w-full bg-white border border-gray-200">
        <thead>
          <tr className="bg-gray-100 border-b border-gray-200">
            {headers.map((header, index) => (
              <th key={index} className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => renderRow(item, index))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
