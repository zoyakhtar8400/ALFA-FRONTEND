import React from 'react';
import { FaInbox } from 'react-icons/fa';

/**
 * Reusable EmptyState component when search results or lists contain no records.
 */
const EmptyState = ({ message = 'No matching records found' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white w-full rounded-b-2xl border-t border-slate-100">
      <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 mb-4">
        <FaInbox size={28} />
      </div>
      <p className="text-sm font-bold text-slate-500">{message}</p>
      <p className="text-xs text-slate-400 mt-1">Try adjusting your search terms or filters.</p>
    </div>
  );
};

export default EmptyState;
