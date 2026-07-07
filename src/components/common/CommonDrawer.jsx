import { FaTimes } from 'react-icons/fa';

/**
 * CommonDrawer component for sliding side panels (from the right).
 * Ideal for view/edit modules, reservation details, etc., to avoid blocking modals.
 */
const CommonDrawer = ({ isOpen, onClose, title, children, footer = null, maxWidth = '480px' }) => {
  if (!isOpen) return null;

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div 
        className="drawer-container"
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="drawer-header">
          <h3 className="drawer-title">{title}</h3>
          <button onClick={onClose} className="drawer-close-btn" aria-label="Close Drawer">
            <FaTimes size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="drawer-body">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="drawer-footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommonDrawer;
