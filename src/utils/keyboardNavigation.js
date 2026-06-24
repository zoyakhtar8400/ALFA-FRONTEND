// src/utils/keyboardNavigation.js
//
// ALFA HMS — Global Enter-Key Navigation
// ─────────────────────────────────────────────────────────────────
// Rules:
//   • Focus moves ONLY on Enter key press
//   • Typing, Backspace, Arrow keys, Paste — never intercepted
//   • Shift+Enter  → move to PREVIOUS field
//   • Enter        → move to NEXT field (or submit if last field)
//   • Textarea     → normal Enter adds newline; Ctrl+Enter moves next
//   • Select       → first Enter opens picker, second Enter moves next
//   • Required     → validate before advancing; stop + highlight if empty
// ─────────────────────────────────────────────────────────────────

/** Selector for all focusable form fields (excludes hidden / submit / disabled). */
const FIELD_SELECTOR = [
  'input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'button[type="submit"]',
].join(', ');

/** Returns true if the element is visible on screen. */
const isVisible = (el) =>
  !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);

/** Returns true if the field is marked required. */
const isRequired = (el) => {
  if (el.required || el.hasAttribute('required')) return true;
  const field = el.closest('.form-field');
  if (!field) return false;
  const label = field.querySelector('.form-label, label');
  return !!(label && (label.querySelector('.text-red-500') || label.textContent.includes('*')));
};

/** Returns true if the field has no meaningful value. */
const isEmpty = (el) => {
  if (el.tagName === 'SELECT') return el.value === '' || el.value === undefined;
  if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') return !el.value.trim();
  return false;
};

/** Highlight a field as invalid — auto-clears when user types into it. */
const markInvalid = (el) => {
  const prev = el.style.outline;
  el.style.outline = '2px solid var(--danger, #ef4444)';
  el.style.outlineOffset = '1px';
  const clear = () => {
    el.style.outline = prev;
    el.style.outlineOffset = '';
    el.removeEventListener('input', clear);
    el.removeEventListener('change', clear);
  };
  el.addEventListener('input', clear, { once: true });
  el.addEventListener('change', clear, { once: true });
};

/**
 * Get all focusable fields in order within the nearest form / modal / document.
 * Excludes disabled, hidden, and invisible elements.
 */
const getFields = (el) => {
  const container =
    el.closest('.modal-container') ||
    el.closest('form') ||
    el.closest('.dashboard-panel') ||
    document.body;

  return Array.from(container.querySelectorAll(FIELD_SELECTOR)).filter(isVisible);
};

/** Focus a field and select its text if applicable. */
const focusField = (el) => {
  el.focus();
  if (el.select && el.tagName !== 'SELECT') {
    try { el.select(); } catch (_) { /* ignore */ }
  }
};

/** Submit the nearest form. */
const submitForm = (el) => {
  const form = el.closest('form');
  if (!form) return;

  // HTML5 validation first
  if (form.reportValidity && !form.reportValidity()) return;

  const submitBtn = form.querySelector('button[type="submit"], button.btn-primary');
  if (submitBtn) {
    submitBtn.click();
  } else {
    try { form.requestSubmit(); } catch (_) { form.submit(); }
  }
};

// ─── Main keydown handler ────────────────────────────────────────
const handleKeyDown = (e) => {
  // ── Only act on Enter ──────────────────────────────────────────
  if (e.key !== 'Enter') return;

  const active = document.activeElement;
  if (!active || active === document.body) return;

  // ── Buttons handle themselves ─────────────────────────────────
  if (active.tagName === 'BUTTON') return;

  // ── Textarea: normal Enter; Ctrl+Enter advances ───────────────
  if (active.tagName === 'TEXTAREA') {
    if (!e.ctrlKey) return; // let newline happen normally
    e.preventDefault();
    // Fall through to advance logic below
  } else {
    e.preventDefault();
  }

  // ── SELECT: open on first Enter, advance on second ───────────
  if (active.tagName === 'SELECT') {
    const isOpen = active.dataset.alfaOpen === 'true';
    if (!isOpen) {
      // Open the native picker
      if (typeof active.showPicker === 'function') {
        try {
          active.showPicker();
          active.dataset.alfaOpen = 'true';
          const close = () => {
            active.dataset.alfaOpen = 'false';
            active.removeEventListener('change', close);
            active.removeEventListener('blur', close);
          };
          active.addEventListener('change', close, { once: true });
          active.addEventListener('blur', close, { once: true });
        } catch (_) { /* showPicker not supported — fall through */ }
      }
      return; // Wait for user to pick a value
    }
    // Already open — close and fall through to advance
    active.dataset.alfaOpen = 'false';
  }

  // ── Validate required fields before advancing ────────────────
  if (isRequired(active) && isEmpty(active)) {
    markInvalid(active);
    active.focus();
    if (typeof window.showToast === 'function') {
      window.showToast('Please fill out this required field.');
    }
    return;
  }

  // ── Collect fields and find current position ─────────────────
  const fields = getFields(active);
  const idx = fields.indexOf(active);
  if (idx === -1) return;

  // ── Shift+Enter → previous field ─────────────────────────────
  if (e.shiftKey) {
    if (idx > 0) focusField(fields[idx - 1]);
    return;
  }

  // ── Enter on last field → submit ─────────────────────────────
  if (idx >= fields.length - 1) {
    submitForm(active);
    return;
  }

  // ── Advance to next field ────────────────────────────────────
  focusField(fields[idx + 1]);
};

// ─── Alt shortcuts (Save / Cancel / New / etc.) ──────────────────
const handleAltShortcuts = (e) => {
  if (!e.altKey) return;
  const key = e.key.toLowerCase();

  const activeModal = document.querySelector('.modal-container');
  const container = activeModal || document;

  const find = (selector) => container.querySelector(selector);
  const findBtn = (...texts) =>
    Array.from(container.querySelectorAll('button')).find(
      (b) => texts.some((t) => b.textContent.toLowerCase().includes(t))
    );

  let handled = false;
  if (key === 's') { find('button[type="submit"], button.btn-primary')?.click(); handled = true; }
  else if (key === 'c') { find('.modal-close-btn, button.btn-secondary')?.click(); handled = true; }
  else if (key === 'n') { findBtn('add', 'new', 'create')?.click(); handled = true; }
  else if (key === 'e') { findBtn('edit')?.click(); handled = true; }
  else if (key === 'd') { findBtn('delete', 'remove')?.click(); handled = true; }
  else if (key === 'p') { findBtn('print')?.click(); handled = true; }
  else if (key === 'b') { findBtn('back')?.click(); handled = true; }

  if (handled) {
    e.preventDefault();
    e.stopPropagation();
  }
};

// ─── Escape: close modal or custom dropdown ───────────────────────
const handleEscape = (e) => {
  if (e.key !== 'Escape') return;
  const modal = document.querySelector('.modal-overlay, .modal-container');
  if (modal) {
    const closeBtn = modal.querySelector('.modal-close-btn, button[aria-label="Close"]');
    if (closeBtn) { e.preventDefault(); closeBtn.click(); }
  }
};

// ─── Public API ──────────────────────────────────────────────────

/**
 * Initialize global Enter-key navigation for ALFA HMS.
 * Call once from App.jsx / main entry point.
 * Returns a cleanup function.
 *
 * @example
 *   useEffect(() => initKeyboardNavigation(), []);
 */
export const initKeyboardNavigation = () => {
  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keydown', handleAltShortcuts);
  window.addEventListener('keydown', handleEscape);

  return () => {
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keydown', handleAltShortcuts);
    window.removeEventListener('keydown', handleEscape);
  };
};

/**
 * useEnterNavigation — React hook wrapper.
 * Attach to any component that needs Enter navigation.
 *
 * @example
 *   // Inside any form component:
 *   useEnterNavigation();
 *
 * Note: If initKeyboardNavigation() is already called globally in App.jsx,
 * you do NOT need this hook per-component. Use it only for isolated components
 * (e.g., modals) that need standalone Enter navigation.
 */
export const useEnterNavigation = () => {
  const { useEffect } = require('react');
  useEffect(() => {
    const cleanup = initKeyboardNavigation();
    return cleanup;
  }, []);
};

/**
 * handleEnterNavigation — inline onKeyDown handler for a single form.
 * Use this on a <form> or container element's onKeyDown prop.
 *
 * @example
 *   <form onKeyDown={handleEnterNavigation}>...</form>
 */
export const handleEnterNavigation = handleKeyDown;
