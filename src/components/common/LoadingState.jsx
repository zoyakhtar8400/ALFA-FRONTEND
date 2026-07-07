/**
 * Reusable LoadingState component for tables or layout screens during page transitions or backend fetch.
 */
const LoadingState = ({ message = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white w-full rounded-b-2xl border-t border-slate-100">
      <div className="spinner-container mb-4">
        <div className="spinner-circle"></div>
      </div>
      <p className="text-sm font-bold text-[#244e5f]">{message}</p>
    </div>
  );
};

export default LoadingState;
