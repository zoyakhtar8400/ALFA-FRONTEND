import React from 'react';

/**
 * Reusable LoadingState component for tables or layout screens during page transitions or backend fetch.
 */
const LoadingState = ({ message = 'Loading records...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white w-full rounded-b-2xl border-t border-slate-100">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-100 border-t-[#418a8b] mb-4"></div>
      <p className="text-sm font-bold text-slate-500">{message}</p>
    </div>
  );
};

export default LoadingState;
