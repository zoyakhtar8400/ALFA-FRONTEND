import { FaEllipsisV } from 'react-icons/fa';

/**
 * CommonCard - Unified card component for standardizing the UI layout.
 * Used for dashboards, housekeeping grids, POS item lists, and reports.
 */
const CommonCard = ({
  title,
  subtitle,
  children,
  headerAction = null,
  footer = null,
  className = '',
  onClick = null,
  hoverable = false
}) => {
  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-2xl border border-slate-100 p-5 shadow-sm transition-all duration-200 ${
        hoverable ? 'hover:shadow-md hover:-translate-y-0.5 cursor-pointer' : ''
      } ${className}`}
      style={onClick ? { cursor: 'pointer' } : undefined}
    >
      {/* Card Header */}
      {(title || subtitle || headerAction) && (
        <div className="flex justify-between items-start mb-4 pb-3 border-b border-slate-50 gap-4">
          <div className="flex flex-col gap-0.5">
            {title && (
              <h4 className="text-sm font-bold text-slate-800 tracking-tight">
                {title}
              </h4>
            )}
            {subtitle && (
              <span className="text-[11px] text-slate-400 font-medium">
                {subtitle}
              </span>
            )}
          </div>
          {headerAction ? (
            <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
              {headerAction}
            </div>
          ) : onClick ? (
            <button className="text-slate-300 hover:text-slate-500 transition-colors p-1" aria-label="More options">
              <FaEllipsisV size={11} />
            </button>
          ) : null}
        </div>
      )}

      {/* Card Content */}
      <div className="card-content flex-1 text-sm text-slate-600">
        {children}
      </div>

      {/* Card Footer */}
      {footer && (
        <div className="flex justify-end gap-3 mt-4 pt-3 border-t border-slate-50" onClick={(e) => e.stopPropagation()}>
          {footer}
        </div>
      )}
    </div>
  );
};

export default CommonCard;
