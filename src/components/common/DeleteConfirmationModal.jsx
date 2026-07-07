import ConfirmationDialog from './ConfirmationDialog';

/**
 * DeleteConfirmationModal component - now refactored to wrap ConfirmationDialog 
 * to align with DRY standards and reuse code safely.
 */
const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, itemName = 'this item', message }) => {
  return (
    <ConfirmationDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Confirm Delete"
      message={message || `Are you sure you want to delete "${itemName}"? This action cannot be undone.`}
      confirmText="Delete"
      cancelText="Cancel"
      type="danger"
      isLoadingText="Deleting..."
    />
  );
};

export default DeleteConfirmationModal;
