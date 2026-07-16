// src/utils/keyboardNavigation.js
//
import { useEffect } from 'react';
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
    el.closest('form') ||
    el.closest('.modal-container') ||
    el.closest('.drawer-container') ||
    el.closest('.dashboard-panel');

  if (!container) return [];
  return Array.from(container.querySelectorAll(FIELD_SELECTOR)).filter(isVisible);
};

/** Focus a field and select its text if applicable. */
const focusField = (el) => {
  el.focus();
  if (el.select && el.tagName !== 'SELECT') {
    try { el.select(); } catch { /* ignore */ }
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
    try { form.requestSubmit(); } catch { form.submit(); }
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

  // ── Only intercept inside a form, modal, or drawer ───────────
  // Do NOT intercept Enter on standalone inputs outside a form context
  const container =
    active.closest('form') ||
    active.closest('.modal-container') ||
    active.closest('.drawer-container');
  if (!container) return;

  e.preventDefault();

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
        } catch { /* showPicker not supported — fall through */ }
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

  // ── Check if there are any remaining input/select/textarea fields after this one ──
  const remainingFields = fields.slice(idx + 1);
  const hasMoreInputs = remainingFields.some(f =>
    f.tagName === 'INPUT' || f.tagName === 'SELECT' || f.tagName === 'TEXTAREA'
  );

  // If no other input/select/textarea fields exist, submit the form directly
  if (!hasMoreInputs) {
    submitForm(active);
    return;
  }

  // ── Advance to next field ────────────────────────────────────
  focusField(fields[idx + 1]);
};

// ─── Global Shortcuts (Ctrl / Alt + Save, New, Print, Search, Edit, Delete, Close) ───
const handleGlobalShortcuts = (e) => {
  const isCtrl = e.ctrlKey || e.metaKey;
  const isAlt = e.altKey;
  if (!isCtrl && !isAlt) return;

  const key = e.key.toLowerCase();
  const activeModal = document.querySelector('.modal-container, .drawer-container');
  const container = activeModal || document;

  const find = (selector) => container.querySelector(selector);
  const findBtn = (...texts) =>
    Array.from(container.querySelectorAll('button')).find(
      (b) => texts.some((t) => b.textContent.toLowerCase().includes(t))
    );

  let handled = false;

  if (key === 's') {
    const saveBtn = find('button[type="submit"], button.btn-primary');
    if (saveBtn) { saveBtn.click(); handled = true; }
  } else if (key === 'c') {
    const closeBtn = find('.modal-close-btn, .drawer-close-btn, button.btn-secondary');
    if (closeBtn) { closeBtn.click(); handled = true; }
  } else if (key === 'n') {
    const newBtn = findBtn('add', 'new', 'create');
    if (newBtn) { newBtn.click(); handled = true; }
  } else if (key === 'e') {
    const editBtn = findBtn('edit');
    if (editBtn) { editBtn.click(); handled = true; }
  } else if (key === 'd') {
    const deleteBtn = findBtn('delete', 'remove');
    if (deleteBtn) { deleteBtn.click(); handled = true; }
  } else if (key === 'p') {
    const printBtn = findBtn('print') || find('.no-print button');
    if (printBtn) { printBtn.click(); handled = true; }
  } else if (key === 'f') {
    const searchInput = document.querySelector('input[type="search"], .search-input, input[placeholder*="Search"], input[placeholder*="search"]');
    if (searchInput) {
      searchInput.focus();
      if (searchInput.select) searchInput.select();
      handled = true;
    }
  }

  if (handled) {
    e.preventDefault();
    e.stopPropagation();
  }
};

// ─── Escape: close modal or custom drawer ──────────────────────────
const handleEscape = (e) => {
  if (e.key !== 'Escape') return;
  // Only handle modals/drawers with a dedicated close button class
  const modal = document.querySelector('.modal-container, .drawer-container');
  if (!modal) return;
  const closeBtn = modal.querySelector('.modal-close-btn, .drawer-close-btn, button[aria-label="Close"]');
  if (closeBtn) { e.preventDefault(); closeBtn.click(); }
};

// ─── Arrow Keys: navigate inside tables focusable rows ──────────────
const handleArrowNavigation = (e) => {
  if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;

  // Don't intercept arrow keys if we are typing inside input/textarea/select
  const active = document.activeElement;
  if (!active || active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.tagName === 'SELECT') {
    return;
  }

  const row = active.closest('tr');
  if (!row) return;
  const tbody = row.closest('tbody');
  if (!tbody) return;
  const rows = Array.from(tbody.querySelectorAll('tr')).filter(r => r.getAttribute('tabindex') === '0');
  const idx = rows.indexOf(row);
  if (idx === -1) return;

  e.preventDefault();
  if (e.key === 'ArrowDown' && idx < rows.length - 1) {
    rows[idx + 1].focus();
  } else if (e.key === 'ArrowUp' && idx > 0) {
    rows[idx - 1].focus();
  }
};

// ─── Public API ──────────────────────────────────────────────────

/**
 * Initialize global Enter-key navigation and global shortcuts for ALFA HMS.
 * Call once from App.jsx / main entry point.
 * Returns a cleanup function.
 */
export const initKeyboardNavigation = () => {
  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keydown', handleGlobalShortcuts);
  window.addEventListener('keydown', handleEscape);
  window.addEventListener('keydown', handleArrowNavigation);

  return () => {
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keydown', handleGlobalShortcuts);
    window.removeEventListener('keydown', handleEscape);
    window.removeEventListener('keydown', handleArrowNavigation);
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
