import { useState, useEffect, useMemo } from 'react';

const INITIAL_OUTLET = [
  {
    id: 'O1',
    name: 'Main Dining Room',
    shortName: 'MDR',
    companyTitle: 'Alfa Hotels & Resorts',
    outletTitle: 'Main Dining Room',
    customerInfo: 'Optional',
    autoSettlement: 'No',
    focusOn: 'Item Search',
    kot: 'Print & Save',
    kotPrint: 'Immediate',
    roomService: 'Disabled',
    noOfKOT: '1',
    noOfBills: '1',
    hsnSac: '9963',
    general: 'Premium Dining',
    phone: '011-2345678',
    billHeader1: 'Welcome to Alfa Main Dining',
    billHeader2: 'GSTIN: 07AAAAA1111A1Z1',
    billHeader3: 'Tel: 011-2345678',
    billSlogan1: 'Thank you for dining with us!',
    billSlogan2: 'Please visit again.',
    billSlogan3: 'Rate us on Google!',
    status: 'Active'
  },
  {
    id: 'O2',
    name: 'Rooftop Grill',
    shortName: 'RTG',
    companyTitle: 'Grand Plaza Group',
    outletTitle: 'Rooftop Grill',
    customerInfo: 'Required',
    autoSettlement: 'No',
    focusOn: 'Table Select',
    kot: 'Print & Save',
    kotPrint: 'Immediate',
    roomService: 'Disabled',
    noOfKOT: '2',
    noOfBills: '1',
    hsnSac: '9963',
    general: 'Open Air Grill',
    phone: '011-8765432',
    billHeader1: 'Alfa Rooftop Grill',
    billHeader2: 'GSTIN: 07AAAAA2222B1Z2',
    billHeader3: 'Tel: 011-8765432',
    billSlogan1: 'We hope you loved the sky view!',
    billSlogan2: 'Tag us on Instagram @alfarooftop',
    billSlogan3: 'Have a wonderful day!',
    status: 'Active'
  }
];

export const useOutletMaster = (showToast) => {
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('hms_pos_outlets');
    return saved ? JSON.parse(saved) : INITIAL_OUTLET;
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Modal/Form open states
  const [modal, setModal] = useState({ open: false, isEdit: false, fields: {} });
  const [deleteModal, setDeleteModal] = useState({ open: false, row: null });
  const [duplicateConfirm, setDuplicateConfirm] = useState({ open: false, fields: null, duplicateItem: null });

  useEffect(() => {
    localStorage.setItem('hms_pos_outlets', JSON.stringify(data));
  }, [data]);

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchSearch =
        (item.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.shortName || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === 'All' || item.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [data, searchTerm, statusFilter]);

  const validate = (fields, skipDuplicateCheck = false) => {
    if (!fields.name || fields.name.trim().length < 2) {
      showToast('Outlet Name must be at least 2 characters.');
      return false;
    }
    if (!fields.shortName || fields.shortName.trim().length < 2) {
      showToast('Short Name must be at least 2 characters.');
      return false;
    }
    if (!skipDuplicateCheck) {
      const duplicateItem = data.find(item => 
        item.id !== fields.id && 
        ((item.name || '').toLowerCase().trim() === (fields.name || '').toLowerCase().trim() ||
         (item.shortName || '').toLowerCase().trim() === (fields.shortName || '').toLowerCase().trim())
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
      showToast('Outlet updated successfully.');
    } else {
      const newId = `O${Math.floor(Math.random() * 10000)}`;
      setData(prev => [...prev, { ...fields, id: newId, status: fields.status || 'Active' }]);
      showToast('Outlet created successfully.');
    }
    setModal({ open: false, isEdit: false, fields: {} });
    setDuplicateConfirm({ open: false, fields: null, duplicateItem: null });
    return true;
  };

  const handleDelete = () => {
    if (!deleteModal.row) return;
    setData(prev => prev.filter(item => item.id !== deleteModal.row.id));
    showToast('Outlet deleted successfully.');
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
