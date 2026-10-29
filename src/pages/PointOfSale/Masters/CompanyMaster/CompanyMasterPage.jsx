import React, { useState, useEffect } from 'react';
import CommonTable from '../../../../components/common/CommonTable';
import DeleteConfirmationModal from '../../../../components/common/DeleteConfirmationModal';
import FormLoadingWrapper from '../../../../components/common/FormLoadingWrapper';
import CompanyMasterForm from './CompanyMasterForm';

const STORAGE_KEY = 'alfa_company_masters';

const DEFAULT_COMPANIES = [
  {
    id: 1,
    companyName: 'Tata Consultancy Services Ltd',
    gstin: '27AAACT2727Q1ZW',
    phone: '9820011223',
    alternatePhone: '02267789000',
    email: 'corporate.billing@tcs.com',
    contactPerson: 'Rajesh Gopinathan',
    panNo: 'AAACT2727Q',
    address: 'TCS House, Raveline Street, Fort',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001',
    creditLimit: '250000',
    status: 'Active',
    remark: 'Corporate billing agreement with 30-day payment cycle'
  },
  {
    id: 2,
    companyName: 'Infosys BPM Limited',
    gstin: '29AAACI4398E1ZY',
    phone: '9988776655',
    alternatePhone: '08028520261',
    email: 'vendor.payments@infosys.com',
    contactPerson: 'Sudha Murty',
    panNo: 'AAACI4398E',
    address: 'Electronics City, Hosur Road',
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: '560100',
    creditLimit: '150000',
    status: 'Active',
    remark: 'Monthly invoice settlement'
  },
  {
    id: 3,
    companyName: 'Reliance Retail Ventures',
    gstin: '27AABCR0371R1ZT',
    phone: '9819988776',
    alternatePhone: '02235555000',
    email: 'accounts@relianceretail.com',
    contactPerson: 'Isha Ambani',
    panNo: 'AABCR0371R',
    address: 'Reliance Corporate Park, Thane-Belapur Road',
    city: 'Navi Mumbai',
    state: 'Maharashtra',
    pincode: '400701',
    creditLimit: '500000',
    status: 'Active',
    remark: 'Corporate cafeteria & guest catering bills'
  }
];

const CompanyMasterPage = ({ showToast }) => {
  const [data, setData] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse stored company masters:', e);
    }
    return DEFAULT_COMPANIES;
  });

  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState({ mode: 'add', row: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, row: null });

  // Sync state changes with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Failed to save company masters to localStorage:', e);
    }
  }, [data]);

  const triggerToast = (msg, type = 'success') => {
    if (typeof showToast === 'function') {
      showToast(msg);
    } else if (window.showToast) {
      window.showToast(msg, type);
    }
  };

  const columns = [
    {
      key: 'companyName',
      label: 'Company Name',
      sortable: true,
      render: (val, row) => (
        <span
          onClick={() => {
            setEditMode({ mode: 'edit', row });
            setShowForm(true);
          }}
          className="font-bold text-violet-700 hover:text-violet-900 cursor-pointer hover:underline"
        >
          {val}
        </span>
      )
    },
    { key: 'gstin', label: 'GST IN', sortable: true },
    { key: 'phone', label: 'Phone Number', sortable: true },
    { key: 'contactPerson', label: 'Contact Person', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'city', label: 'City', sortable: true },
    { key: 'status', label: 'Status', sortable: true, renderStatus: true, activeValue: 'Active' },
    { key: 'action', label: 'Action', sortable: false }
  ];

  const handleSave = (formData) => {
    if (editMode.mode === 'add') {
      const newEntry = {
        ...formData,
        id: Date.now(),
        createdAt: new Date().toISOString()
      };
      setData((prev) => [newEntry, ...prev]);
      triggerToast('Company Master record created successfully!');
    } else {
      setData((prev) =>
        prev.map((item) => (item.id === editMode.row.id ? { ...item, ...formData } : item))
      );
      triggerToast('Company Master record updated successfully!');
    }
    setShowForm(false);
  };

  const handleDelete = () => {
    if (!deleteModal.row) return;
    setData((prev) => prev.filter((item) => item.id !== deleteModal.row.id));
    triggerToast('Company Master record deleted successfully.');
    setDeleteModal({ open: false, row: null });
  };

  const handleBulkDelete = (selectedRows) => {
    if (!selectedRows || selectedRows.length === 0) return;
    const idsToDelete = new Set(selectedRows.map((r) => r.id));
    setData((prev) => prev.filter((item) => !idsToDelete.has(item.id)));
    triggerToast(`Deleted ${selectedRows.length} company master record(s).`);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditMode({ mode: 'add', row: null });
  };

  if (showForm) {
    return (
      <FormLoadingWrapper>
        <CompanyMasterForm
          mode={editMode.mode}
          initialData={editMode.row}
          onSave={handleSave}
          onCancel={handleCancel}
          existingRecords={data}
        />
      </FormLoadingWrapper>
    );
  }

  return (
    <div className="w-full flex flex-col p-6 animate-in fade-in duration-200">
      <CommonTable
        title="Company Master"
        columns={columns}
        data={data}
        actions={[
          {
            label: 'Edit',
            onClick: (row) => {
              setEditMode({ mode: 'edit', row });
              setShowForm(true);
            }
          },
          {
            label: 'Delete',
            isDanger: true,
            onClick: (row) => setDeleteModal({ open: true, row })
          }
        ]}
        onBulkDelete={handleBulkDelete}
        onAddEntry={() => {
          setEditMode({ mode: 'add', row: null });
          setShowForm(true);
        }}
        addEntryLabel="+ Add Company Master"
        searchPlaceholder="Search company name, GST IN, phone..."
        showToast={triggerToast}
        breadcrumbs={['Dashboard', 'Point Of Sale', 'Master', 'Company Master']}
        emptyMessage="No Company Master Records Found"
        statusFilterKey="status"
      />

      {deleteModal.open && (
        <DeleteConfirmationModal
          isOpen={deleteModal.open}
          onClose={() => setDeleteModal({ open: false, row: null })}
          onConfirm={handleDelete}
          itemName={deleteModal.row?.companyName || deleteModal.row?.name}
        />
      )}
    </div>
  );
};

export default CompanyMasterPage;
export { CompanyMasterPage };
