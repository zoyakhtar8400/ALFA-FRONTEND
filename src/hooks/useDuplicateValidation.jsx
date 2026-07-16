import React, { useState, useEffect, useRef } from 'react';
import CommonModal from '../components/common/CommonModal';
import { FaExclamationTriangle } from 'react-icons/fa';

export const useDuplicateValidation = ({
  existingRecords = [],
  currentFormData = {},
  uniqueFields = [],
  currentId = null,
  mode = 'add',
  onEditExisting = null
}) => {
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [duplicateItem, setDuplicateItem] = useState(null);
  const warnedRef = useRef(null);

  useEffect(() => {
    if (!existingRecords || existingRecords.length === 0 || !uniqueFields || uniqueFields.length === 0) {
      setIsDuplicate(false);
      setShowModal(false);
      setDuplicateItem(null);
      warnedRef.current = null;
      return;
    }

    // Check if all unique fields have some value (non-empty)
    const hasValues = uniqueFields.every(field => {
      const val = currentFormData[field];
      return val !== undefined && val !== null && String(val).trim() !== '';
    });

    if (!hasValues) {
      setIsDuplicate(false);
      setShowModal(false);
      setDuplicateItem(null);
      warnedRef.current = null;
      return;
    }

    // Check if duplicate exists
    const duplicateExists = existingRecords.find(record => {
      // Ignore the current record when editing
      if (mode === 'edit' && record.id === currentId) {
        return false;
      }

      // Check if all unique fields match (combination)
      return uniqueFields.every(field => {
        let recordField = field;
        if (field === 'idProofNo' && record.idNo !== undefined) recordField = 'idNo';
        if (field === 'idNo' && record.idProofNo !== undefined) recordField = 'idProofNo';
        if (field === 'name' && record.guestName !== undefined) recordField = 'guestName';
        if (field === 'guestName' && record.name !== undefined) recordField = 'name';
        if (field === 'guestName' && record.newGuestName !== undefined) recordField = 'newGuestName';
        if (field === 'newGuestName' && record.guestName !== undefined) recordField = 'guestName';
        if (field === 'voucherNo' && record.folioNo !== undefined) recordField = 'folioNo';
        if (field === 'folioNo' && record.voucherNo !== undefined) recordField = 'voucherNo';
        if (field === 'grcNo' && record.folioNo !== undefined) recordField = 'folioNo';
        if (field === 'folioNo' && record.grcNo !== undefined) recordField = 'grcNo';
        if (field === 'receiptNo' && record.folioNo !== undefined) recordField = 'folioNo';
        if (field === 'folioNo' && record.receiptNo !== undefined) recordField = 'receiptNo';

        const recordVal = String(record[recordField] || '').trim().toLowerCase();
        const currentVal = String(currentFormData[field] || '').trim().toLowerCase();
        return recordVal === currentVal;
      });
    });

    setIsDuplicate(!!duplicateExists);
    setDuplicateItem(duplicateExists || null);

    if (duplicateExists) {
      // Signature of the duplicate value
      const duplicateSig = uniqueFields.map(field => String(currentFormData[field] || '').trim().toLowerCase()).join('|');
      // Only show the modal once when the duplicate state is first entered
      if (warnedRef.current !== duplicateSig) {
        setShowModal(true);
        warnedRef.current = duplicateSig;
      }
    } else {
      setShowModal(false);
      warnedRef.current = null;
    }
  }, [currentFormData, existingRecords, uniqueFields, currentId, mode]);

  const checkBeforeSave = () => {
    if (isDuplicate) {
      setShowModal(true);
      return false; // blocks submission
    }
    return true; // allows submission
  };

  const DuplicateModal = () => {
    const itemName = duplicateItem ? (duplicateItem.name || duplicateItem.guestName || duplicateItem.shortName || duplicateItem.code || duplicateItem.roomNo || Object.values(duplicateItem)[1] || '') : '';
    
    return (
      <CommonModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Duplicate Entry Alert"
        maxWidth="480px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '16px', padding: '10px 0' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'rgba(245, 158, 11, 0.1)',
            color: '#D97706',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px'
          }}>
            <FaExclamationTriangle />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--dark)' }}>
              Record Already Exists
            </h4>
            <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              You saved the entry {itemName ? <strong>"{itemName}"</strong> : 'this record'} previously. Duplicate records are not allowed.
            </p>
          </div>

          <div style={{
            display: 'flex',
            gap: '12px',
            width: '100%',
            marginTop: '12px',
            borderTop: '1px solid #f1f5f9',
            paddingTop: '16px'
          }}>
            {onEditExisting ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    onEditExisting(duplicateItem);
                  }}
                  className="btn-primary"
                  style={{
                    flex: 1,
                    height: '38px',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    background: '#D97706',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#ffffff',
                    cursor: 'pointer'
                  }}
                >
                  Edit the Same Entry
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    flex: 1,
                    height: '38px',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    color: '#475569',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="btn-primary"
                style={{
                  width: '100%',
                  height: '38px',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </CommonModal>
    );
  };

  return {
    isDuplicate,
    showModal,
    setShowModal,
    checkBeforeSave,
    DuplicateModal
  };
};

export default useDuplicateValidation;
