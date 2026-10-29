import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimesCircle,
  FaInfoCircle,
  FaSpinner,
  FaTimes
} from 'react-icons/fa';

// Global toast listeners and state management
let toastListeners = [];
let toastCounter = 0;
let lastToastTime = 0;
let lastToastMsg = '';

const broadcastToast = (toastObj) => {
  toastListeners.forEach(fn => fn(toastObj));
};

/**
 * Standard enterprise toast dispatch function.
 * Available globally via window.showToast or as imported `toast` / `showToast`.
 * Supports:
 *   toast(message) -> defaults to success/info depending on message
 *   toast.success(message)
 *   toast.error(message)
 *   toast.warning(message)
 *   toast.info(message)
 *   toast.loading(message) -> returns dismiss function
 */
export const showToast = (message, type = null, duration = null) => {
  if (!message || typeof message !== 'string') {
    if (message && typeof message.message === 'string') {
      message = message.message;
    } else {
      return () => {};
    }
  }

  // Clean and normalize message
  let cleanMsg = message.trim();
  // Strip leading unicode status icons if present (e.g. "✅ ", "❌ ", "⚠️ ", "ℹ️ ", "🚫 ", "⛔ ")
  cleanMsg = cleanMsg.replace(/^([✅❌⚠️ℹ️🚫⛔]+\s*)+/, '').trim();
  if (!cleanMsg) cleanMsg = message;

  // Infer type if not explicitly supplied
  let finalType = type;
  if (!finalType) {
    const lower = message.toLowerCase();
    if (lower.startsWith('✅') || lower.includes('success') || lower.includes('settled') || lower.includes('saved') || lower.includes('created') || lower.includes('confirmed') || lower.includes('printed') || lower.includes('updated')) {
      finalType = 'success';
    } else if (lower.startsWith('❌') || lower.startsWith('⛔') || lower.includes('failed') || lower.includes('error') || lower.includes('cannot') || lower.includes('invalid')) {
      finalType = 'error';
    } else if (lower.startsWith('⚠️') || lower.startsWith('🚫') || lower.includes('warning') || lower.includes('required') || lower.includes('please') || lower.includes('permission')) {
      finalType = 'warning';
    } else {
      finalType = 'info';
    }
  }

  // Prevent duplicate spam within 750ms
  const now = Date.now();
  if (cleanMsg === lastToastMsg && (now - lastToastTime) < 750) {
    return () => {};
  }
  lastToastTime = now;
  lastToastMsg = cleanMsg;

  // Set standard display duration based on severity
  let autoDismissTime = duration;
  if (autoDismissTime === null) {
    if (finalType === 'error') {
      autoDismissTime = 4500; // Errors need adequate reading time
    } else if (finalType === 'warning') {
      autoDismissTime = 3800;
    } else if (finalType === 'loading') {
      autoDismissTime = 0; // Manual dismiss or dismiss when finished
    } else {
      autoDismissTime = 3000; // Standard 3 seconds for routine success / info
    }
  }

  const id = `alfa_toast_${++toastCounter}_${Date.now()}`;
  const toastItem = {
    id,
    message: cleanMsg,
    type: finalType,
    duration: autoDismissTime,
    timestamp: now
  };

  broadcastToast({ action: 'add', toast: toastItem });

  return () => {
    broadcastToast({ action: 'remove', id });
  };
};

export const toast = (msg, type = null) => showToast(msg, type);
toast.success = (msg, duration) => showToast(msg, 'success', duration);
toast.error = (msg, duration) => showToast(msg, 'error', duration);
toast.warning = (msg, duration) => showToast(msg, 'warning', duration);
toast.info = (msg, duration) => showToast(msg, 'info', duration);
toast.loading = (msg) => showToast(msg, 'loading', 0);
toast.dismiss = (id) => broadcastToast({ action: 'remove', id });

// Attach globally for window.showToast & window.toast
if (typeof window !== 'undefined') {
  window.showToast = showToast;
  window.toast = toast;
}

const TOAST_CONFIG = {
  success: {
    bg: '#ecfdf5',
    border: '#10b981',
    text: '#065f46',
    title: 'Success',
    iconColor: '#059669',
    icon: <FaCheckCircle size={18} />
  },
  error: {
    bg: '#fef2f2',
    border: '#ef4444',
    text: '#991b1b',
    title: 'Error',
    iconColor: '#dc2626',
    icon: <FaTimesCircle size={18} />
  },
  warning: {
    bg: '#fffbeb',
    border: '#f59e0b',
    text: '#92400e',
    title: 'Attention',
    iconColor: '#d97706',
    icon: <FaExclamationTriangle size={18} />
  },
  info: {
    bg: '#f0f9ff',
    border: '#0284c7',
    text: '#075985',
    title: 'Notice',
    iconColor: '#0284c7',
    icon: <FaInfoCircle size={18} />
  },
  loading: {
    bg: '#f8fafc',
    border: '#0e7490',
    text: '#0f172a',
    title: 'Processing',
    iconColor: '#0e7490',
    icon: <FaSpinner className="animate-spin" size={18} />
  }
};

/**
 * Standard Toast Container Component
 * Mounted once at app root. Supports stackable notifications,
 * mobile & desktop responsiveness, and keyboard/touch dismissal.
 */
export const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handleAction = ({ action, toast: newToast, id }) => {
      if (action === 'add' && newToast) {
        setToasts(prev => {
          // Keep maximum 4 concurrent toasts to avoid clutter
          const filtered = prev.filter(t => t.message !== newToast.message);
          const next = [...filtered, newToast];
          if (next.length > 4) next.shift();
          return next;
        });

        if (newToast.duration > 0) {
          setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== newToast.id));
          }, newToast.duration);
        }
      } else if (action === 'remove' && id) {
        setToasts(prev => prev.filter(t => t.id !== id));
      }
    };

    toastListeners.push(handleAction);
    return () => {
      toastListeners = toastListeners.filter(fn => fn !== handleAction);
    };
  }, []);

  const handleDismiss = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  if (toasts.length === 0) return null;

  const content = (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 1000000,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        pointerEvents: 'none',
        maxWidth: '440px',
        width: 'calc(100vw - 32px)',
        fontFamily: 'var(--font-family, system-ui), -apple-system, sans-serif'
      }}
      aria-live="polite"
    >
      {toasts.map(t => {
        const config = TOAST_CONFIG[t.type] || TOAST_CONFIG.info;
        return (
          <div
            key={t.id}
            role="alert"
            style={{
              pointerEvents: 'auto',
              background: config.bg,
              border: `1px solid ${config.border}`,
              borderLeft: `5px solid ${config.border}`,
              borderRadius: '10px',
              padding: '12px 16px',
              boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.2), 0 8px 10px -6px rgba(15, 23, 42, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              color: config.text,
              animation: 'slideInRight 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
              <div style={{ color: config.iconColor, flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                {config.icon}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <span
                  style={{
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    lineHeight: 1.4,
                    wordBreak: 'break-word',
                    color: config.text
                  }}
                >
                  {t.message}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleDismiss(t.id)}
              aria-label="Dismiss notification"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: config.iconColor,
                opacity: 0.65,
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '4px',
                flexShrink: 0
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.65')}
            >
              <FaTimes size={13} />
            </button>
          </div>
        );
      })}
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(content, document.body) : content;
};

export default ToastContainer;
