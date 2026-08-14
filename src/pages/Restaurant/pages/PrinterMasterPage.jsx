import React, { useState, useEffect } from 'react';
import CommonTable from '../../../components/common/CommonTable';
import DeleteConfirmationModal from '../../../components/common/DeleteConfirmationModal';
import CommonModal from '../../../components/common/CommonModal';
import CommonActionButtons from '../../../components/common/CommonActionButtons';
import F from '../../../components/common/F';
import StatusBadge from '../../../components/common/StatusBadge';
import apiClient from '../../../services/apiClient';

const PRINTER_TYPES = ['Network', 'USB', 'Windows'];
const emptyPrinter = { id: '', name: '', type: 'Network', ip: '', port: 9100, status: 'Active', isDefault: false };

const PrinterMasterPage = () => {
  const [printers, setPrinters] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modal, setModal] = useState({ open: false, mode: 'add', row: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, row: null });
  const [form, setForm] = useState(emptyPrinter);

  const fetchPrinters = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/printers');
      const apiList = res?.data || res || [];
      if (Array.isArray(apiList)) {
        const mapped = apiList.map((p, idx) => ({
          id: p.id || p.printer_id || idx + 1,
          name: p.printer_name || p.title || p.device_name || `Printer ${p.id || idx + 1}`,
          type: p.printer_type === 2 ? 'USB' : (p.printer_type === 3 ? 'Windows' : 'Network'),
          ipPort: (p.printer_type === 2 ? 'USB Local' : `${p.printer_ip || '192.168.1.100'} : ${p.printer_port_number || 9100}`),
          ip: p.printer_ip || '192.168.1.100',
          port: p.printer_port_number || 9100,
          status: (p.is_active === 1 || p.activate === 1 || p.status === 'Active') ? 'Active' : 'Inactive',
          isDefault: p.no_of_prints === 1 || idx === 0,
          isSinglePrinter: p.no_of_prints === 1 || idx === 0
        }));
        setPrinters(mapped);
      }
    } catch (err) {
      console.warn('Printer API load error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrinters();
  }, []);

  const handleToggleSinglePrinter = async (targetId) => {
    const updated = printers.map((p) => {
      const isTarget = String(p.id) === String(targetId);
      const currentlyOn = Boolean(p.isDefault || p.isSinglePrinter);
      const nextState = isTarget ? !currentlyOn : false;
      return {
        ...p,
        isDefault: nextState,
        isSinglePrinter: nextState
      };
    });

    setPrinters(updated);
    localStorage.setItem('alfa_pos_printers', JSON.stringify(updated));

    const activeSingle = updated.find((p) => p.isDefault || p.isSinglePrinter);
    if (activeSingle) {
      localStorage.setItem('alfa_active_single_printer', JSON.stringify(activeSingle));
    } else {
      localStorage.removeItem('alfa_active_single_printer');
    }

    try {
      const isNumericId = typeof targetId === 'number' || !isNaN(Number(targetId));
      if (isNumericId) {
        const targetP = updated.find((p) => String(p.id) === String(targetId));
        await apiClient.post('/printers', {
          printer_id: Number(targetId),
          no_of_prints: targetP?.isDefault ? 1 : 0
        });
      }
    } catch (err) {
      console.warn('Toggle single printer API error:', err.message);
    }
  };

  const columns = [
    { key: 'name', label: 'Printer Name', sortable: true },
    { key: 'type', label: 'Type', sortable: true },
    { key: 'ipPort', label: 'IP / Port', sortable: true },
    {
      key: 'isSinglePrinter',
      label: 'Single Printer',
      sortable: true,
      render: (val, row) => {
        const isSingle = Boolean(row.isDefault || row.isSinglePrinter);
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => handleToggleSinglePrinter(row.id)}
              style={{
                width: '44px',
                height: '24px',
                borderRadius: '12px',
                backgroundColor: isSingle ? '#059669' : '#cbd5e1',
                position: 'relative',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                padding: '2px'
              }}
              title={isSingle ? 'Single Printer Enabled' : 'Click to set as Single Printer'}
            >
              <span
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  backgroundColor: '#ffffff',
                  transform: isSingle ? 'translateX(20px)' : 'translateX(0px)',
                  transition: 'transform 0.2s ease',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                }}
              />
            </button>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: isSingle ? '#059669' : '#64748b' }}>
              {isSingle ? 'Single Printer ON' : 'OFF'}
            </span>
          </div>
        );
      }
    },
    { key: 'status', label: 'Status', sortable: true, render: (val, row) => <StatusBadge value={val || row?.status || 'Active'} /> },
    { key: 'action', label: 'Action' }
  ];

  const handleOpenAdd = () => {
    setForm(emptyPrinter);
    setModal({ open: true, mode: 'add', row: null });
  };

  const handleOpenEdit = (row) => {
    setForm({
      ...row,
      ip: row.ip || (row.ipPort ? row.ipPort.split(' : ')[0] : '192.168.1.100'),
      port: row.port || (row.ipPort ? Number(row.ipPort.split(' : ')[1]) : 9100)
    });
    setModal({ open: true, mode: 'edit', row });
  };

  const handleSave = async () => {
    if (!form.name.trim()) { alert('Printer Name is required.'); return; }

    const isNumericId = modal.row && (typeof modal.row.id === 'number' || !isNaN(Number(modal.row.id)));
    const payload = {
      printer_id: isNumericId ? Number(modal.row.id) : undefined,
      printer_name: form.name,
      name: form.name,
      printer_ip: form.ip,
      ip_address: form.ip,
      printer_type: form.type === 'USB' ? 2 : (form.type === 'Windows' ? 3 : 1),
      is_active: form.status === 'Active' ? 1 : 0
    };

    try {
      await apiClient.post('/printers', payload);
      await fetchPrinters();
    } catch (err) {
      console.warn('Save printer API error:', err.message);
    }
    setModal({ open: false, mode: 'add', row: null });
  };

  const handleDelete = async () => {
    if (!deleteModal.row) return;
    const id = deleteModal.row.id;
    try {
      if (typeof id === 'number' || !isNaN(Number(id))) {
        await apiClient.delete(`/printers/${id}`);
        await fetchPrinters();
      }
    } catch (err) {
      console.warn('Delete printer API error:', err.message);
    }
    setDeleteModal({ open: false, row: null });
  };

  return (
    <div className="w-full flex flex-col p-6 animate-in fade-in duration-200">
      <CommonTable
        title="Printer Master"
        columns={columns}
        data={printers}
        actions={[
          { label: 'Edit', onClick: handleOpenEdit },
          { label: 'Delete', isDanger: true, onClick: (row) => setDeleteModal({ open: true, row }) }
        ]}
        onAddEntry={handleOpenAdd}
        addEntryLabel="+ Add Printer"
        searchPlaceholder="Search Printers..."
        breadcrumbs={['Dashboard', 'POS', 'Master', 'Printer Master']}
        emptyMessage="No Printers configured."
      />

      <CommonModal
        isOpen={modal.open}
        onClose={() => setModal({ open: false, mode: 'add', row: null })}
        title={modal.mode === 'edit' ? 'Edit Printer' : 'Add Printer'}
        maxWidth="520px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '8px 4px' }}>
          <F label="Printer Name *" value={form.name || ''} onChange={(val) => {
            const strVal = typeof val === 'object' && val?.target ? val.target.value : val;
            setForm((p) => ({ ...p, name: strVal }));
          }} placeholder="e.g. Kitchen Thermal Printer" />
          
          <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '0.85rem', fontWeight: 700, color: '#374151' }}>
            Printer Type *
            <select
              value={form.type}
              onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
              style={{ padding: '9px 12px', borderRadius: '7px', border: '1.5px solid #e2e8f0', fontSize: '0.85rem' }}
            >
              {PRINTER_TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>

          {form.type === 'Network' && (
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ flex: 2 }}>
                <F label="IP Address *" value={form.ip || ''} onChange={(val) => {
                  const strVal = typeof val === 'object' && val?.target ? val.target.value : val;
                  setForm((p) => ({ ...p, ip: strVal }));
                }} placeholder="192.168.1.100" />
              </div>
              <div style={{ flex: 1 }}>
                <F label="Port" type="number" value={form.port || ''} onChange={(val) => {
                  const strVal = typeof val === 'object' && val?.target ? val.target.value : val;
                  setForm((p) => ({ ...p, port: Number(strVal || 9100) }));
                }} placeholder="9100" />
              </div>
            </div>
          )}

          <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '0.85rem', fontWeight: 700, color: '#374151' }}>
            Status
            <select
              value={form.status}
              onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
              style={{ padding: '9px 12px', borderRadius: '7px', border: '1.5px solid #e2e8f0', fontSize: '0.85rem' }}
            >
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </label>

          <CommonActionButtons
            onSave={handleSave}
            onCancel={() => setModal({ open: false, mode: 'add', row: null })}
            saveText={modal.mode === 'edit' ? 'Update Printer' : 'Save Printer'}
          />
        </div>
      </CommonModal>

      <DeleteConfirmationModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, row: null })}
        onConfirm={handleDelete}
        itemName={deleteModal.row?.name || 'this printer'}
      />
    </div>
  );
};

export default PrinterMasterPage;
