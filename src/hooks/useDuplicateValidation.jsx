import React, { useState, useEffect, useRef } from 'react';
import CommonModal from '../components/common/CommonModal';

export const useDuplicateValidation = ({
  existingRecords = [],
  currentFormData = {},
  uniqueFields = [],
  currentId = null,
  mode = 'add'
}) => {
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const warnedRef = useRef(null);

  useEffect(() => {
    if (!existingRecords || existingRecords.length === 0 || !uniqueFields || uniqueFields.length === 0) {
      setIsDuplicate(false);
      setShowModal(false);
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
      warnedRef.current = null;
      return;
    }

    // Check if duplicate exists
    const duplicateExists = existingRecords.some(record => {
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

    setIsDuplicate(duplicateExists);

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
    return (
      <CommonModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Duplicate Record"
        maxWidth="460px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '4px 0', color: 'var(--text-primary)' }}>
          <h4 style={{ fontWeight: 700, fontSize: '1.05rem', color: '#244e5f', margin: 0 }}>Duplicate Record</h4>
          <p style={{ fontSize: '0.88rem', margin: 0, lineHeight: '1.4' }}>
            This record already exists in the system.
          </p>
          <p style={{ fontSize: '0.88rem', margin: 0, lineHeight: '1.4' }}>
            The data you entered has already been saved previously. Duplicate records are not allowed.
          </p>
          <p style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--primary)', margin: 0, lineHeight: '1.4' }}>
            Please modify the information if you want to create a new record.
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="btn-primary"
              style={{ padding: '8px 24px', borderRadius: '8px', fontSize: '0.88rem', fontWeight: 700 }}
            >
              OK
            </button>
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
