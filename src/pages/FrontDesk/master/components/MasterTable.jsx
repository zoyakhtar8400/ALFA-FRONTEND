import React, { useState } from 'react';
import Table from '../../../../components/common/Table';
import ConfirmModal from '../../../../components/common/ConfirmModal';

const EMPTY_MODAL = { open: false, mode: 'add', row: null };
const EMPTY_DELETE = { open: false, row: null };

const StatusBadge = ({ value, activeValue }) => {
  const isActive = activeValue ? value === activeValue : value === 'Active' || value === 'Yes';
  return <span className={`status-badge ${isActive ? 'available' : 'occupied'}`}>{value}</span>;
};

const MasterTable = ({ title, columns, seed, formFields, FormComponent, showToast }) => {
  const [data, setData] = useState([...seed]);
  const [modal, setModal] = useState(EMPTY_MODAL);
  const [deleteModal, setDeleteModal] = useState(EMPTY_DELETE);
  const [form, setForm] = useState({});

  const cols = columns.map(col =>
    col.renderStatus
      ? { ...col, render: (val) => <StatusBadge value={val} activeValue={col.activeValue} /> }
      : col
  );

  const openAdd = () => {
    if (FormComponent) {
      setModal({ open: true, mode: 'add', row: null });
    } else {
      const empty = {};
      formFields.forEach(f => { empty[f.key] = f.options ? f.options[0] : ''; });
      setForm(empty);
      setModal({ open: true, mode: 'add', row: null });
    }
  };

  const openEdit = (row) => {
    setForm({ ...row });
    setModal({ open: true, mode: 'edit', row });
  };

  const closeModal = () => setModal(EMPTY_MODAL);

  const handleSave = (savedData) => {
    if (FormComponent) {
      if (!savedData) { closeModal(); return; }
      if (modal.mode === 'add') {
        setData(prev => [...prev, { ...savedData, id: Date.now() }]);
        showToast(`${title} added!`);
      } else {
        setData(prev => prev.map(r => r.id === modal.row.id ? { ...savedData, id: r.id } : r));
        showToast(`${title} updated!`);
      }
      closeModal();
    } else {
      const missing = formFields.filter(f => f.type === 'text').find(f => !form[f.key]?.trim());
      if (missing) { showToast(`Please fill in: ${missing.label}`); return; }
      if (modal.mode === 'add') {
        setData(prev => [...prev, { ...form, id: Date.now() }]);
        showToast(`${title} added!`);
      } else {
        setData(prev => prev.map(r => r.id === modal.row.id ? { ...form, id: r.id } : r));
        showToast(`${title} updated!`);
      }
      closeModal();
    }
  };

  const handleDelete = () => {
    setData(prev => prev.filter(r => r.id !== deleteModal.row.id));
    showToast('Entry deleted.');
    setDeleteModal(EMPTY_DELETE);
  };

  const getLabel = (row) => row.name || row.code || row.roomNo || row.regNo || '';

  return (
    <>
      <Table
        title={title}
        columns={cols}
        data={data}
        actions={[
          { label: 'Edit', onClick: openEdit },
          { label: 'Delete', isDanger: true, onClick: (row) => setDeleteModal({ open: true, row }) },
        ]}
        onAddEntry={openAdd}
        addEntryLabel="+ Add Entry"
        searchPlaceholder={`Search ${title}...`}
        showToast={showToast}
      />

      {FormComponent && modal.open && (
        <FormComponent
          isOpen={modal.open}
          mode={modal.mode}
          initialData={modal.row}
          onSave={handleSave}
          onClose={closeModal}
          showToast={showToast}
        />
      )}

      {!FormComponent && modal.open && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.45)' }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '520px', boxShadow: 'var(--shadow)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--dark)' }}>
                {modal.mode === 'add' ? `Add ${title}` : `Edit ${title}`}
              </h3>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}>&times;</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {formFields.map(field => (
                <div key={field.key} style={{ display: 'flex', flexDirection: 'column', gap: '6px', gridColumn: field.fullWidth ? 'span 2' : 'span 1' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--dark)' }}>{field.label}</label>
                  {field.type === 'select' ? (
                    <select value={form[field.key] || ''} onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                      style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '9px 12px', fontSize: '0.88rem', backgroundColor: '#fff' }}>
                      {field.options.map(opt => <option key={opt}>{opt}</option>)}
                    </select>
                  ) : (
                    <input type={field.type} value={form[field.key] || ''} onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                      placeholder={field.label}
                      style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '9px 12px', fontSize: '0.88rem' }} />
                  )}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
              <button onClick={closeModal} style={{ padding: '9px 22px', borderRadius: '30px', border: '1px solid var(--border)', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', backgroundColor: '#fff', color: 'var(--text-secondary)' }}>Cancel</button>
              <button onClick={handleSave} style={{ padding: '9px 22px', borderRadius: '30px', border: 'none', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', backgroundColor: 'var(--primary)', color: '#fff' }}>Save</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal(EMPTY_DELETE)}
        onConfirm={handleDelete}
        message={`Delete "${getLabel(deleteModal.row || {})}"? This cannot be undone.`}
      />
    </>
  );
};

export default MasterTable;
