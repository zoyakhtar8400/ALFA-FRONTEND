import { useState, useEffect, useMemo } from 'react';

const INITIAL_TABLES = [
  { id: 'T1', name: 'T1', pax: 4, department: 'Restaurant', floor: 'Dining', description: 'Corner booth', isActive: true },
  { id: 'T2', name: 'T2', pax: 2, department: 'Restaurant', floor: 'Dining', description: 'Window seat', isActive: true },
  { id: 'T3', name: 'T3', pax: 1, department: 'Bar', floor: 'Bar Stool', description: 'Counter stool', isActive: true },
  { id: 'T4', name: 'T4', pax: 10, department: 'Banquets', floor: 'Banquet', description: 'Large round table', isActive: true }
];

export const useTableMaster = (showToast) => {
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('hms_pos_tables');
    return saved ? JSON.parse(saved) : INITIAL_TABLES;
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal open states
  const [modal, setModal] = useState({ open: false, isEdit: false, fields: {} });
  const [deleteModal, setDeleteModal] = useState({ open: false, row: null });
  const [duplicateConfirm, setDuplicateConfirm] = useState({ open: false, fields: null, duplicateItem: null });

  useEffect(() => {
    localStorage.setItem('hms_pos_tables', JSON.stringify(data));
  }, [data]);

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchSearch =
        (item.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.department || '').toLowerCase().includes(searchTerm.toLowerCase());

      const isActiveValue = item.isActive ? 'Active' : 'Inactive';
      const matchStatus = statusFilter === 'All' || isActiveValue === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [data, searchTerm, statusFilter]);

  const validate = (fields, skipDuplicateCheck = false) => {
    if (!fields.department) {
      showToast('Department is required.');
      return false;
    }
    if (!fields.name || fields.name.trim().length < 1) {
      showToast('Table Name is required.');
      return false;
    }
    if (!fields.pax || Number(fields.pax) <= 0) {
      showToast('PAX capacity must be greater than 0.');
      return false;
    }
    if (!skipDuplicateCheck) {
      const duplicateItem = data.find(item =>
        item.id !== fields.id &&
        (item.name || '').toLowerCase().trim() === (fields.name || '').toLowerCase().trim() &&
        (item.department || '').toLowerCase().trim() === (fields.department || '').toLowerCase().trim()
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
      showToast('Table details updated successfully.');
    } else {
      const newId = `T${Math.floor(Math.random() * 10000)}`;
      setData(prev => [...prev, { ...fields, id: newId }]);
      showToast('Table created successfully.');
    }
    setModal({ open: false, isEdit: false, fields: {} });
    setDuplicateConfirm({ open: false, fields: null, duplicateItem: null });
    return true;
  };

  const handleDelete = () => {
    if (!deleteModal.row) return;
    setData(prev => prev.filter(item => item.id !== deleteModal.row.id));
    showToast('Table deleted successfully.');
    setDeleteModal({ open: false, row: null });
  };

  const handleBulkSave = (bulkFields) => {
    const { prefix, startNum, endNum, department, floor, pax, isActive } = bulkFields;
    
    // Validate inputs
    const start = Number(startNum);
    const end = Number(endNum);
    const capacity = Number(pax);
    
    if (!prefix || prefix.trim() === '') {
      showToast('Table Prefix is required.');
      return false;
    }
    if (isNaN(start) || isNaN(end)) {
      showToast('Start and End numbers must be valid integers.');
      return false;
    }
    if (start >= end) {
      showToast('Starting Number must be less than Ending Number.');
      return false;
    }
    const count = end - start + 1;
    if (count > 100) {
      showToast('Maximum 100 tables can be created per batch.');
      return false;
    }
    if (!department) {
      showToast('Section (Department) is required.');
      return false;
    }
    if (isNaN(capacity) || capacity <= 0) {
      showToast('Capacity must be greater than 0.');
      return false;
    }

    // Generate table names and check duplicates
    const newTables = [];
    for (let i = start; i <= end; i++) {
      const tableName = `${prefix}${i}`;
      
      // Check duplicate in existing database (case insensitive, trim whitespace)
      const existsInDb = data.some(item => 
        (item.name || '').toLowerCase().trim() === tableName.toLowerCase().trim() &&
        (item.department || '').toLowerCase().trim() === department.toLowerCase().trim()
      );
      if (existsInDb) {
        showToast(`Table "${tableName}" already exists in this department.`);
        return false;
      }
      
      newTables.push({
        id: `T${Math.floor(Math.random() * 100000)}_${i}`,
        name: tableName,
        pax: capacity,
        department: department,
        floor: floor || '',
        description: `Bulk Created: Type ${floor || 'Standard'}`,
        isActive: isActive === true
      });
    }

    // Save generated list
    setData(prev => [...prev, ...newTables]);
    showToast(`Successfully created ${newTables.length} tables in bulk!`);
    return true;
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
    handleDelete,
    handleBulkSave
  };
};
