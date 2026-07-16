import { useState, useEffect, useMemo } from 'react';

const INITIAL_TAX = [
  {
    id: 'TX1',
    name: 'Standard Food Category',
    applicableDate: '2026-07-01',
    department: 'Restaurant',
    taxes: [
      { taxName: 'CGST', percentage: '2.5%', postAccount: 'CGST Output A/c' },
      { taxName: 'SGST', percentage: '2.5%', postAccount: 'SGST Output A/c' }
    ],
    status: 'Active'
  },
  {
    id: 'TX2',
    name: 'Liquor Category',
    applicableDate: '2026-07-01',
    department: 'Bar',
    taxes: [
      { taxName: 'VAT', percentage: '20%', postAccount: 'State VAT A/c' }
    ],
    status: 'Active'
  }
];

export const useItemTaxCategory = (showToast) => {
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('hms_pos_tax_categories');
    return saved ? JSON.parse(saved) : INITIAL_TAX;
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Modal open states
  const [modal, setModal] = useState({ open: false, isEdit: false, fields: {} });
  const [deleteModal, setDeleteModal] = useState({ open: false, row: null });
  const [duplicateConfirm, setDuplicateConfirm] = useState({ open: false, fields: null, duplicateItem: null });

  useEffect(() => {
    localStorage.setItem('hms_pos_tax_categories', JSON.stringify(data));
  }, [data]);

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchSearch =
        (item.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.department || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === 'All' || item.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [data, searchTerm, statusFilter]);

  const validate = (fields, skipDuplicateCheck = false) => {
    if (!fields.name || fields.name.trim().length < 2) {
      showToast('Item Category Name must be at least 2 characters.');
      return false;
    }
    if (!fields.applicableDate) {
      showToast('Applicable Date is required.');
      return false;
    }
    if (!fields.department) {
      showToast('Please select a Department.');
      return false;
    }
    if (!fields.taxes || fields.taxes.length === 0) {
      showToast('At least one Tax definition is required.');
      return false;
    }
    
    // Check fields in individual tax rows
    for (let i = 0; i < fields.taxes.length; i++) {
      const t = fields.taxes[i];
      if (!t.taxName || t.taxName.trim() === '') {
        showToast(`Tax Name is required at row ${i + 1}.`);
        return false;
      }
      if (t.percentage === undefined || t.percentage === null || t.percentage === '') {
        showToast(`Tax Percentage is required at row ${i + 1}.`);
        return false;
      }
      if (!t.postAccount || t.postAccount.trim() === '') {
        showToast(`Tax Post A/c is required at row ${i + 1}.`);
        return false;
      }
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

    // Normalize tax percentages (add % suffix if missing)
    const normalizedTaxes = fields.taxes.map(t => ({
      ...t,
      percentage: String(t.percentage).endsWith('%') ? String(t.percentage) : `${t.percentage}%`
    }));

    const normalizedFields = {
      ...fields,
      taxes: normalizedTaxes
    };

    if (modal.isEdit) {
      setData(prev => prev.map(item => item.id === fields.id ? normalizedFields : item));
      showToast('Item Category updated successfully.');
    } else {
      const newId = `TX${Math.floor(Math.random() * 10000)}`;
      setData(prev => [...prev, { ...normalizedFields, id: newId, status: fields.status || 'Active' }]);
      showToast('Item Category created successfully.');
    }
    setModal({ open: false, isEdit: false, fields: {} });
    setDuplicateConfirm({ open: false, fields: null, duplicateItem: null });
    return true;
  };

  const handleDelete = () => {
    if (!deleteModal.row) return;
    setData(prev => prev.filter(item => item.id !== deleteModal.row.id));
    showToast('Item Category deleted successfully.');
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
