import { useState, useEffect, useMemo } from 'react';

const INITIAL_NC = [
  { id: 'NC1', name: 'Management Complimentary', status: 'Active' },
  { id: 'NC2', name: 'Staff Welfare Meal', status: 'Active' },
  { id: 'NC3', name: 'VIP Guest Relations', status: 'Active' }
];

export const useNCTypeMaster = (showToast) => {
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('hms_pos_nc_types');
    return saved ? JSON.parse(saved) : INITIAL_NC;
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Modal open states
  const [modal, setModal] = useState({ open: false, isEdit: false, fields: {} });
  const [deleteModal, setDeleteModal] = useState({ open: false, row: null });
  const [duplicateConfirm, setDuplicateConfirm] = useState({ open: false, fields: null, duplicateItem: null });

  useEffect(() => {
    localStorage.setItem('hms_pos_nc_types', JSON.stringify(data));
  }, [data]);

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === 'All' || item.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [data, searchTerm, statusFilter]);

  const validate = (fields, skipDuplicateCheck = false) => {
    if (!fields.name || fields.name.trim().length < 2) {
      showToast('NC Type must be at least 2 characters.');
      return false;
    }
    if (!skipDuplicateCheck) {
      const duplicateItem = data.find(item => 
        item.id !== fields.id && 
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
      showToast('NC Type updated successfully.');
    } else {
      const newId = `NC${Math.floor(Math.random() * 10000)}`;
      setData(prev => [...prev, { ...fields, id: newId, status: fields.status || 'Active' }]);
      showToast('NC Type created successfully.');
    }
    setModal({ open: false, isEdit: false, fields: {} });
    setDuplicateConfirm({ open: false, fields: null, duplicateItem: null });
    return true;
  };

  const handleDelete = () => {
    if (!deleteModal.row) return;
    setData(prev => prev.filter(item => item.id !== deleteModal.row.id));
    showToast('NC Type deleted successfully.');
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
