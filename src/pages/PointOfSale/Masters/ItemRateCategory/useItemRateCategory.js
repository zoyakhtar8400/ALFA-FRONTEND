import { useState, useEffect, useMemo } from 'react';

const INITIAL_RATES = [
  { id: 'RC1', name: 'Standard Rate Card', activeDays: 'All Days', multiplier: '1.0', status: 'Active' },
  { id: 'RC2', name: 'Happy Hours (20% Off)', activeDays: 'Mon-Thu (4pm-8pm)', multiplier: '0.8', status: 'Active' },
  { id: 'RC3', name: 'Weekend Peak Rates', activeDays: 'Fri-Sun', multiplier: '1.1', status: 'Active' }
];

export const useItemRateCategory = (showToast) => {
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('hms_pos_rate_categories');
    return saved ? JSON.parse(saved) : INITIAL_RATES;
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Modal open states
  const [modal, setModal] = useState({ open: false, isEdit: false, fields: {} });
  const [deleteModal, setDeleteModal] = useState({ open: false, row: null });
  const [duplicateConfirm, setDuplicateConfirm] = useState({ open: false, fields: null, duplicateItem: null });

  useEffect(() => {
    localStorage.setItem('hms_pos_rate_categories', JSON.stringify(data));
  }, [data]);

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.activeDays.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === 'All' || item.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [data, searchTerm, statusFilter]);

  const validate = (fields, skipDuplicateCheck = false) => {
    if (!fields.name || fields.name.trim().length < 2) {
      showToast('Rate Category Name must be at least 2 characters.');
      return false;
    }
    if (!fields.activeDays || fields.activeDays.trim().length < 2) {
      showToast('Active Days/Hours must be at least 2 characters.');
      return false;
    }
    if (!fields.multiplier || isNaN(Number(fields.multiplier)) || Number(fields.multiplier) <= 0) {
      showToast('Multiplier must be a positive number.');
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
      showToast('Rate category updated successfully.');
    } else {
      const newId = `RC${Math.floor(Math.random() * 10000)}`;
      setData(prev => [...prev, { ...fields, id: newId, status: fields.status || 'Active' }]);
      showToast('Rate category created successfully.');
    }
    setModal({ open: false, isEdit: false, fields: {} });
    setDuplicateConfirm({ open: false, fields: null, duplicateItem: null });
    return true;
  };

  const handleDelete = () => {
    if (!deleteModal.row) return;
    setData(prev => prev.filter(item => item.id !== deleteModal.row.id));
    showToast('Rate category deleted successfully.');
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
