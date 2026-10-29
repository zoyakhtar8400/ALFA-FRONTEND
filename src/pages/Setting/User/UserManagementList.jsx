import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import CommonTable from '../../../components/common/CommonTable';
import DeleteConfirmationModal from '../../../components/common/DeleteConfirmationModal';
import CommonModal from '../../../components/common/CommonModal';
import CommonActionButtons from '../../../components/common/CommonActionButtons';
import F from '../../../components/common/F';
import StatusBadge from '../../../components/common/StatusBadge';
import apiClient from '../../../services/apiClient';
import posApi from '../../../api/posApi';

const emptyUser = { id: '', username: '', email: '', password: '', name: '', phone: '', role: 'STAFF', status: 'Active', assigned_outlets: ['STORE_1'] };
const ROLES = ['ADMIN', 'STAFF'];

const UserManagementList = ({ showToast = () => {} }) => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [availableOutlets, setAvailableOutlets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, mode: 'add', row: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, row: null });
  const [form, setForm] = useState(emptyUser);

  const fetchUsersAndOutlets = async () => {
    setLoading(true);
    try {
      const [userRes, storeRes] = await Promise.allSettled([
        apiClient.get('/users'),
        posApi.getOutlets()
      ]);

      if (userRes.status === 'fulfilled') {
        const res = userRes.value;
        const apiList = res?.data || res?.users || res || [];
        if (Array.isArray(apiList)) {
          setUsers(apiList);
        }
      }

      if (storeRes.status === 'fulfilled') {
        const sRes = storeRes.value;
        const stores = Array.isArray(sRes?.data) ? sRes.data : (Array.isArray(sRes) ? sRes : []);
        setAvailableOutlets(stores.map(s => ({
          store_id: s.store_id || `STORE_${s.id}`,
          name: s.store_name || s.name || `Outlet ${s.id}`
        })));
      }
    } catch (err) {
      console.warn('Error fetching users/outlets from PostgreSQL:', err.message);
      showToast?.(`Error loading data: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersAndOutlets();
  }, []);

  const columns = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'username', label: 'Username', sortable: true },
    { key: 'email', label: 'Email Address', sortable: true },
    { key: 'name', label: 'Full Name', sortable: true },
    { key: 'phone', label: 'Phone', sortable: true },
    {
      key: 'role',
      label: 'Role',
      sortable: true,
      render: (val, row) => {
        const rawRole = String(val || row.type || 'STAFF').toUpperCase();
        const roleName = rawRole === 'ADMIN' ? 'ADMIN' : 'STAFF';
        return (
          <span style={{
            padding: '4px 10px',
            borderRadius: '12px',
            fontSize: '0.75rem',
            fontWeight: 700,
            backgroundColor: roleName === 'ADMIN' ? '#fef3c7' : '#e0f2fe',
            color: roleName === 'ADMIN' ? '#92400e' : '#075985'
          }}>
            {roleName}
          </span>
        );
      }
    },
    {
      key: 'assigned_outlets',
      label: 'Outlet Access',
      render: (val, row) => {
        const roleName = String(row.role || row.type || '').toUpperCase();
        if (roleName === 'ADMIN') {
          return <span style={{ color: '#059669', fontWeight: 700, fontSize: '0.75rem' }}>All Outlets (Universal)</span>;
        }
        const outlets = Array.isArray(val) ? val : (Array.isArray(row.assigned_outlets) ? row.assigned_outlets : [row.store_id || 'STORE_1']);
        return (
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {outlets.map(oId => (
              <span key={oId} style={{ background: '#f1f5f9', color: '#334155', padding: '2px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 600 }}>
                {oId}
              </span>
            ))}
          </div>
        );
      }
    },
    { key: 'status', label: 'Status', sortable: true, render: (val, row) => <StatusBadge value={val || row?.status || 'Active'} /> },
    { key: 'action', label: 'Action' }
  ];

  const handleOpenAdd = () => {
    setForm(emptyUser);
    setModal({ open: true, mode: 'add', row: null });
  };

  const handleOpenEdit = (row) => {
    const rawRole = String(row.role || row.type || 'STAFF').toUpperCase();
    const roleName = rawRole === 'ADMIN' ? 'ADMIN' : 'STAFF';
    setForm({
      id: row.id,
      username: row.username || '',
      email: row.email || '',
      password: '',
      name: row.name || '',
      phone: row.phone || '',
      role: roleName,
      status: row.status || 'Active',
      assigned_outlets: Array.isArray(row.assigned_outlets) ? row.assigned_outlets : [row.store_id || 'STORE_1']
    });
    setModal({ open: true, mode: 'edit', row });
  };

  const handleSave = async () => {
    if (!form.username.trim()) {
      showToast?.('Username is required.', 'warning');
      return;
    }
    if (modal.mode === 'add' && !form.password.trim()) {
      showToast?.('Password is required for new user.', 'warning');
      return;
    }

    const payload = {
      username: form.username.trim(),
      email: form.email.trim(),
      name: form.name.trim(),
      phone: form.phone.trim(),
      role: form.role,
      type: form.role,
      status: form.status,
      assigned_outlets: form.role === 'ADMIN' ? availableOutlets.map(o => o.store_id) : (form.assigned_outlets || ['STORE_1'])
    };
    if (form.password.trim()) {
      payload.password = form.password.trim();
    }

    try {
      if (modal.mode === 'edit' && modal.row) {
        await apiClient.put(`/users/${modal.row.id}`, payload);
        showToast?.(`User '${form.username}' updated successfully.`, 'success');
      } else {
        await apiClient.post('/users', payload);
        showToast?.(`User '${form.username}' created successfully.`, 'success');
      }
      setModal({ open: false, mode: 'add', row: null });
      fetchUsersAndOutlets();
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to save user';
      showToast?.(`Error: ${errMsg}`, 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.row) return;
    const id = deleteModal.row.id;
    try {
      await apiClient.delete(`/users/${id}`);
      showToast?.(`User deactivated successfully.`, 'success');
      fetchUsersAndOutlets();
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to delete user';
      showToast?.(`Error: ${errMsg}`, 'error');
    } finally {
      setDeleteModal({ open: false, row: null });
    }
  };

  const handleBulkDelete = async (selectedRows) => {
    let count = 0;
    for (const row of selectedRows) {
      if (row.id) {
        try {
          await apiClient.delete(`/users/${row.id}`);
          count++;
        } catch (e) { }
      }
    }
    showToast?.(`Deactivated ${count} user(s) in PostgreSQL`, 'success');
    fetchUsersAndOutlets();
  };

  const activeOutletsList = availableOutlets.length > 0 ? availableOutlets : [
    { store_id: 'STORE_1', name: 'Main Restaurant' },
    { store_id: 'STORE_2', name: 'Airport Restaurant' },
    { store_id: 'STORE_3', name: 'City Restaurant' }
  ];

  return (
    <div className="w-full flex flex-col p-6 animate-in fade-in duration-200" style={{ gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
        <button
          type="button"
          onClick={() => navigate('/setting')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            fontSize: '0.8rem',
            fontWeight: 700,
            color: '#334155',
            backgroundColor: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '10px',
            cursor: 'pointer',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
          }}
        >
          <FaArrowLeft style={{ fontSize: '13px', color: '#0e7490' }} /> Back to Operations Dashboard
        </button>
      </div>

      <CommonTable
        title="Admin User & Staff Management"
        columns={columns}
        data={users}
        actions={[
          { label: 'Edit', onClick: handleOpenEdit },
          { label: 'Deactivate', isDanger: true, onClick: (row) => setDeleteModal({ open: true, row }) }
        ]}
        onBulkDelete={handleBulkDelete}
        onAddEntry={handleOpenAdd}
        addEntryLabel="+ Add New User"
        searchPlaceholder="Search Users..."
        breadcrumbs={['Dashboard', 'Settings', 'User Management']}
        emptyMessage="No System Users found in PostgreSQL."
      />

      <CommonModal
        isOpen={modal.open}
        onClose={() => setModal({ open: false, mode: 'add', row: null })}
        title={modal.mode === 'edit' ? 'Edit User Profile' : 'Add New System User'}
        maxWidth="520px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '8px 4px' }}>
          <F
            label="Username *"
            value={form.username}
            onChange={(val) => {
              const strVal = typeof val === 'object' && val?.target ? val.target.value : val;
              setForm((p) => ({ ...p, username: strVal }));
            }}
            placeholder="e.g. jdoe, manager1, cashier01"
            disabled={modal.mode === 'edit'}
          />

          <F
            label="Email Address"
            type="email"
            value={form.email}
            onChange={(val) => {
              const strVal = typeof val === 'object' && val?.target ? val.target.value : val;
              setForm((p) => ({ ...p, email: strVal }));
            }}
            placeholder="e.g. admin@alfahms.com"
          />

          <F
            label={modal.mode === 'edit' ? "New Password (leave blank to keep unchanged)" : "Password *"}
            type="password"
            value={form.password}
            onChange={(val) => {
              const strVal = typeof val === 'object' && val?.target ? val.target.value : val;
              setForm((p) => ({ ...p, password: strVal }));
            }}
            placeholder="••••••••"
          />

          <F
            label="Full Name"
            value={form.name}
            onChange={(val) => {
              const strVal = typeof val === 'object' && val?.target ? val.target.value : val;
              setForm((p) => ({ ...p, name: strVal }));
            }}
            placeholder="e.g. John Doe"
          />

          <F
            label="Phone Number"
            value={form.phone}
            onChange={(val) => {
              const strVal = typeof val === 'object' && val?.target ? val.target.value : val;
              setForm((p) => ({ ...p, phone: strVal }));
            }}
            placeholder="+91 9876543210"
          />

          <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '0.85rem', fontWeight: 700, color: '#374151' }}>
            System Role *
            <select
              value={form.role}
              onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
              style={{ padding: '9px 12px', borderRadius: '7px', border: '1.5px solid #e2e8f0', fontSize: '0.85rem' }}
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </label>

          {/* Role-Based Outlet Assignment */}
          {form.role === 'STAFF' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#374151' }}>
                Assigned Outlet Access *
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                {activeOutletsList.map((out) => (
                  <label key={out.store_id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', cursor: 'pointer', fontWeight: 600, color: '#1e293b' }}>
                    <input
                      type="checkbox"
                      checked={(form.assigned_outlets || []).includes(out.store_id)}
                      onChange={(e) => {
                        const current = form.assigned_outlets || [];
                        const updated = e.target.checked
                          ? [...current, out.store_id]
                          : current.filter(id => id !== out.store_id);
                        setForm(p => ({ ...p, assigned_outlets: updated }));
                      }}
                      style={{ accentColor: '#0e7490', width: '16px', height: '16px' }}
                    />
                    <span>{out.name || out.store_name} ({out.store_id})</span>
                  </label>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ padding: '10px 12px', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px', color: '#065f46', fontSize: '0.78rem', fontWeight: 700 }}>
              ✓ ADMIN role automatically receives universal access to ALL system outlets.
            </div>
          )}

          <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '0.85rem', fontWeight: 700, color: '#374151' }}>
            Account Status *
            <select
              value={form.status}
              onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
              style={{ padding: '9px 12px', borderRadius: '7px', border: '1.5px solid #e2e8f0', fontSize: '0.85rem' }}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </label>

          <CommonActionButtons
            onSave={handleSave}
            onCancel={() => setModal({ open: false, mode: 'add', row: null })}
            saveText={modal.mode === 'edit' ? 'Update User' : 'Save User'}
          />
        </div>
      </CommonModal>

      <DeleteConfirmationModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, row: null })}
        onConfirm={handleDelete}
        itemName={deleteModal.row?.username || 'this user account'}
      />
    </div>
  );
};

export default UserManagementList;
