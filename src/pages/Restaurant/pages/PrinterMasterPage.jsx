import React, { useState, useEffect } from 'react';
import CommonTable from '../../../components/common/CommonTable';
import DeleteConfirmationModal from '../../../components/common/DeleteConfirmationModal';
import CommonModal from '../../../components/common/CommonModal';
import CommonActionButtons from '../../../components/common/CommonActionButtons';
import F from '../../../components/common/F';
import StatusBadge from '../../../components/common/StatusBadge';
import apiClient from '../../../services/apiClient';
import useOutletFilter from '../../../hooks/useOutletFilter';

const PRINTER_PURPOSES = [
  { value: 'KOT', label: 'KOT / Kitchen Ticket' },
  { value: 'BILL', label: 'BILL / Tax Invoice' }
];

const emptyPrinter = {
  id: '',
  name: '',
  type: 'KOT',
  ip: '192.168.1.100',
  port: 9100,
  status: 'Active',
  store_id: 'STORE_1'
};

const PrinterMasterPage = () => {
  const [printers, setPrinters] = useState([]);
  const [loading, setLoading] = useState(true);

  const { outlets, outletFilter, setOutletFilter, filterData } = useOutletFilter();

  const [modal, setModal] = useState({ open: false, mode: 'add', row: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, row: null });
  const [form, setForm] = useState(emptyPrinter);

  const fetchPrinters = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/printers');
      const apiList = res?.data || res || [];
      if (Array.isArray(apiList)) {
        const mapped = apiList.map((p, idx) => {
          const pPurpose = String(p.printer_type || p.type || '').toUpperCase() === 'BILL' ? 'BILL' : 'KOT';
          const pIp = p.printer_ip || p.device_address || '192.168.1.100';
          const pPort = p.printer_port_number || p.port || 9100;
          return {
            id: p.id || p.printer_id || idx + 1,
            name: p.printer_name || p.title || p.device_name || `Printer ${p.id || idx + 1}`,
            printer_type: pPurpose,
            type: pPurpose,
            ipPort: `${pIp} : ${pPort}`,
            ip: pIp,
            port: Number(pPort),
            status: (p.is_active === 1 || p.activate === 1 || p.status === 'Active') ? 'Active' : 'Inactive',
            store_id: p.store_id || 'STORE_1'
          };
        });
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

  const columns = [
    { key: 'name', label: 'Printer Name', sortable: true },
    {
      key: 'printer_type',
      label: 'Purpose',
      sortable: true,
      render: (val) => {
        const isBill = String(val).toUpperCase() === 'BILL';
        return (
          <span
            style={{
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '0.78rem',
              fontWeight: 700,
              letterSpacing: '0.5px',
              backgroundColor: isBill ? '#ecfdf5' : '#eff6ff',
              color: isBill ? '#059669' : '#2563eb',
              border: `1px solid ${isBill ? '#a7f3d0' : '#bfdbfe'}`
            }}
          >
            {isBill ? 'BILL / INVOICE' : 'KOT / KITCHEN'}
          </span>
        );
      }
    },
    { key: 'ipPort', label: 'IP / Port', sortable: true },
    {
      key: 'store_id',
      label: 'Outlet',
      sortable: true,
      render: (val) => {
        const outletObj = outlets.find(o => o.store_id === val);
        return outletObj ? outletObj.name : val || 'Main Restaurant';
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
      type: row.printer_type || row.type || 'KOT',
      ip: row.ip || (row.ipPort ? row.ipPort.split(' : ')[0] : '192.168.1.100'),
      port: row.port || (row.ipPort ? Number(row.ipPort.split(' : ')[1]) : 9100),
      store_id: row.store_id || 'STORE_1'
    });
    setModal({ open: true, mode: 'edit', row });
  };

  const handleSave = async () => {
    if (!form.name.trim()) { alert('Printer Name is required.'); return; }

    const isNumericId = modal.row && (typeof modal.row.id === 'number' || !isNaN(Number(modal.row.id)));
    const payload = {
      printer_id: isNumericId ? Number(modal.row.id) : undefined,
      printer_name: form.name.trim(),
      name: form.name.trim(),
      title: form.name.trim(),
      printer_ip: form.ip || '192.168.1.100',
      ip_address: form.ip || '192.168.1.100',
      device_address: form.ip || '192.168.1.100',
      port: String(form.port || 9100),
      printer_port_number: String(form.port || 9100),
      printer_type: form.type === 'BILL' ? 'BILL' : 'KOT',
      type: form.type === 'BILL' ? 'BILL' : 'KOT',
      is_active: form.status === 'Active' ? 1 : 0,
      store_id: form.store_id || 'STORE_1'
    };

    try {
      await apiClient.post('/printers', payload);
      await fetchPrinters();
    } catch (err) {
      console.warn('Save printer API error:', err.message);
      alert('Failed to save printer: ' + (err.response?.data?.message || err.message));
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

  const filteredPrinters = filterData(printers, 'store_id');

  return (
    <div className="w-full flex flex-col p-6 animate-in fade-in duration-200" style={{ gap: '16px' }}>
      <CommonTable
        title="Printer Master"
        columns={columns}
        data={filteredPrinters}
        actions={[
          { label: 'Edit', onClick: handleOpenEdit },
          { label: 'Delete', isDanger: true, onClick: (row) => setDeleteModal({ open: true, row }) }
        ]}
        onAddEntry={handleOpenAdd}
        addEntryLabel="+ Add Printer"
        searchPlaceholder="Search Printers..."
        breadcrumbs={['Dashboard', 'POS', 'Master', 'Printer Master']}
        emptyMessage="No Printers configured."
        outletFilter={outletFilter}
        setOutletFilter={setOutletFilter}
        outletsList={outlets}
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
          }} placeholder="e.g. Tandoor Printer / Billing Desk Printer" />
          
          <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '0.85rem', fontWeight: 700, color: '#374151' }}>
            Printer Purpose *
            <select
              value={form.type}
              onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
              style={{ padding: '9px 12px', borderRadius: '7px', border: '1.5px solid #e2e8f0', fontSize: '0.85rem' }}
            >
              {PRINTER_PURPOSES.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </label>

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

          <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '0.85rem', fontWeight: 700, color: '#374151' }}>
            Outlet *
            <select
              value={form.store_id || 'STORE_1'}
              onChange={(e) => setForm((p) => ({ ...p, store_id: e.target.value }))}
              style={{ padding: '9px 12px', borderRadius: '7px', border: '1.5px solid #e2e8f0', fontSize: '0.85rem' }}
            >
              {outlets.map((o) => (
                <option key={o.store_id} value={o.store_id}>{o.name}</option>
              ))}
            </select>
          </label>

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
