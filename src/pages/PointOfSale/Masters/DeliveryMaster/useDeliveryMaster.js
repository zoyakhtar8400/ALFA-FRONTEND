import { useState, useEffect, useMemo } from 'react';

const INITIAL_DELIVERY = [
  { id: 'D1', partner: 'Zomato', name: 'Vikram Singh', phone: '9988776655', status: 'Active' },
  { id: 'D2', partner: 'Swiggy', name: 'Rohan Sen', phone: '8877665544', status: 'Active' },
  { id: 'D3', partner: 'Direct Delivery', name: 'Deepak Raj', phone: '7766554433', status: 'Active' }
];

export const useDeliveryMaster = (showToast) => {
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('hms_pos_deliveries');
    return saved ? JSON.parse(saved) : INITIAL_DELIVERY;
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Modal open states
  const [modal, setModal] = useState({ open: false, isEdit: false, fields: {} });
  const [deleteModal, setDeleteModal] = useState({ open: false, row: null });
  const [duplicateConfirm, setDuplicateConfirm] = useState({ open: false, fields: null, duplicateItem: null });

  useEffect(() => {
    localStorage.setItem('hms_pos_deliveries', JSON.stringify(data));
  }, [data]);

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchSearch =
        item.partner.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.phone.includes(searchTerm);
      const matchStatus = statusFilter === 'All' || item.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [data, searchTerm, statusFilter]);

  const validate = (fields, skipDuplicateCheck = false) => {
    if (!fields.partner || fields.partner.trim().length < 2) {
      showToast('Partner Name must be at least 2 characters.');
      return false;
    }
    if (!fields.name || fields.name.trim().length < 2) {
      showToast('Name must be at least 2 characters.');
      return false;
    }
    if (!/^\d{10}$/.test(fields.phone)) {
      showToast('Phone must be a valid 10-digit number.');
      return false;
    }
    if (!skipDuplicateCheck) {
      const duplicateItem = data.find(item => 
        item.id !== fields.id && 
        item.partner.toLowerCase().trim() === fields.partner.toLowerCase().trim() &&
        item.name.toLowerCase().trim() === fields.name.toLowerCase().trim()
      );
      if (duplicateItem) {
        setDuplicateConfirm({ open: true, fields, duplicateItem });
        return false;
      }
    }
    return true;
  };

  const handleSave = (fields, skipDuplicateCheck = false) => {
    if (!validate(fields, skipDuplicateCheck)) return false;

    if (modal.isEdit) {
      setData(prev => prev.map(item => item.id === fields.id ? fields : item));
      showToast('Delivery record updated successfully.');
    } else {
      const newId = `D${Math.floor(Math.random() * 10000)}`;
      setData(prev => [...prev, { ...fields, id: newId, status: fields.status || 'Active' }]);
      showToast('Delivery record created successfully.');
    }
    setModal({ open: false, isEdit: false, fields: {} });
    setDuplicateConfirm({ open: false, fields: null, duplicateItem: null });
    return true;
  };

  const handleDelete = () => {
    if (!deleteModal.row) return;
    setData(prev => prev.filter(item => item.id !== deleteModal.row.id));
    showToast('Delivery record deleted successfully.');
    setDeleteModal({ open: false, row: null });
  };

  return {
    data: filteredData,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    modal,
    setModal,
    deleteModal,
    setDeleteModal,
    duplicateConfirm,
    setDuplicateConfirm,
    handleSave,
    handleDelete
  };
};
