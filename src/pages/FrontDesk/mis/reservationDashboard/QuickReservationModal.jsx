import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import useDuplicateValidation from '../../../../hooks/useDuplicateValidation';

const QuickReservationModal = ({ isOpen, roomNo, dateStr, onClose, onSave, existingRecords = [] }) => {
  const [form, setForm] = useState({ guestName: '', phone: '', nights: 1, remark: '' });

  const { isDuplicate, DuplicateModal, checkBeforeSave } = useDuplicateValidation({
    existingRecords,
    currentFormData: form,
    uniqueFields: ['guestName'],
    currentId: null,
    mode: 'add'
  });

  useEffect(() => { 
    if (isOpen) {
      setForm({ guestName: '', phone: '', nights: 1, remark: '' }); 
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = e => {
    e.preventDefault();
    if (!form.guestName.trim()) return;
    if (!checkBeforeSave()) return;
    onSave({ ...form, nights: Math.max(1, Number(form.nights)), roomNo, dateStr });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container" style={{ maxWidth: '420px' }}>
        <div className="modal-header">
          <span className="modal-title">Quick Reservation</span>
          <button className="modal-close-btn" onClick={onClose}><FaTimes size={16} /></button>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '-8px' }}>
          Room <strong>{roomNo}</strong> &mdash; {dateStr}
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="form-field">
            <label className="form-label">Guest Name <span style={{ color: 'var(--danger)' }}>*</span></label>
            <input className="form-input" value={form.guestName} onChange={set('guestName')} placeholder="Enter guest name" required />
          </div>
          <div className="form-field">
            <label className="form-label">Phone</label>
            <input className="form-input" value={form.phone} onChange={set('phone')} placeholder="Enter phone number" />
          </div>
          <div className="form-field">
            <label className="form-label">Nights</label>
            <input className="form-input" type="number" min={1} value={form.nights} onChange={set('nights')} />
          </div>
          <div className="form-field">
            <label className="form-label">Remark</label>
            <textarea 
              className="form-input" 
              rows={3} 
              value={form.remark} 
              onChange={set('remark')} 
              placeholder="Enter reservation remarks..."
              style={{ minHeight: '80px', resize: 'vertical' }}
            />
          </div>
          <div className="form-footer" style={{ marginTop: '4px' }}>
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button 
              type="submit" 
              className="btn-primary" 
              disabled={isDuplicate}
              style={{
                cursor: isDuplicate ? 'not-allowed' : 'pointer',
                opacity: isDuplicate ? 0.6 : 1
              }}
            >
              Save Reservation
            </button>
          </div>
          <DuplicateModal />
        </form>
      </div>
    </div>
  );
};

export default QuickReservationModal;
