import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaWeight, FaPlus, FaEdit, FaTrash, FaSearch, FaExchangeAlt,
  FaCheckCircle, FaTimesCircle, FaBoxes, FaBalanceScale, FaTint, FaSortNumericDown
} from 'react-icons/fa';
import PageHeader from '../../../../components/common/PageHeader';
import CommonModal from '../../../../components/common/CommonModal';
import DeleteConfirmationModal from '../../../../components/common/DeleteConfirmationModal';
import { inventoryApi } from '../../../../api/inventoryApi';
import apiClient from '../../../../services/apiClient';

// Pre-seeded standard restaurant UOM defaults with conversions
const DEFAULT_UOM_PRESETS = [
  { id: 1, name: 'Plate', code: 'PLT', type: 'COUNT', decimals: 0, baseUnit: 'Plate', conversionFactor: 1, description: 'Standard dining plate serving', status: 'Active' },
  { id: 2, name: 'Portion', code: 'PRT', type: 'COUNT', decimals: 0, baseUnit: 'Portion', conversionFactor: 1, description: 'Single meal / chef portion', status: 'Active' },
  { id: 3, name: 'Piece', code: 'PC', type: 'COUNT', decimals: 0, baseUnit: 'Piece', conversionFactor: 1, description: 'Individual countable item / piece', status: 'Active' },
  { id: 4, name: 'Kilogram', code: 'KG', type: 'WEIGHT', decimals: 3, baseUnit: 'Gram', conversionFactor: 1000, description: 'Bulk raw inventory weight (1 Kg = 1000 g)', status: 'Active' },
  { id: 5, name: 'Gram', code: 'G', type: 'WEIGHT', decimals: 0, baseUnit: 'Gram', conversionFactor: 1, description: 'Recipe ingredient weight in grams', status: 'Active' },
  { id: 6, name: 'Litre', code: 'LTR', type: 'VOLUME', decimals: 3, baseUnit: 'Millilitre', conversionFactor: 1000, description: 'Liquid beverage / milk / oil (1 L = 1000 ml)', status: 'Active' },
  { id: 7, name: 'Millilitre', code: 'ML', type: 'VOLUME', decimals: 0, baseUnit: 'Millilitre', conversionFactor: 1, description: 'Liquid bar measure & recipe milliliters', status: 'Active' },
  { id: 8, name: 'Bottle', code: 'BTL', type: 'VOLUME', decimals: 0, baseUnit: 'Bottle', conversionFactor: 1, description: 'Pre-packaged beverage / sauce bottle', status: 'Active' },
  { id: 9, name: 'Glass', code: 'GLS', type: 'VOLUME', decimals: 0, baseUnit: 'Millilitre', conversionFactor: 250, description: 'Bar / beverage glass serving (~250 ml)', status: 'Active' },
  { id: 10, name: 'Cup', code: 'CUP', type: 'VOLUME', decimals: 0, baseUnit: 'Millilitre', conversionFactor: 200, description: 'Hot beverage cup / tea (~200 ml)', status: 'Active' },
  { id: 11, name: 'Can', code: 'CAN', type: 'VOLUME', decimals: 0, baseUnit: 'Can', conversionFactor: 1, description: 'Soft drink / beer can', status: 'Active' },
  { id: 12, name: 'Dozen', code: 'DOZ', type: 'COUNT', decimals: 0, baseUnit: 'Piece', conversionFactor: 12, description: '12 pieces (e.g. eggs, fruits)', status: 'Active' }
];

const emptyUnitForm = {
  name: '',
  code: '',
  type: 'COUNT',
  decimals: 0,
  baseUnit: '',
  conversionFactor: 1,
  description: '',
  status: 'Active'
};

const UOMMasterPage = ({ showToast }) => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  
  const [modal, setModal] = useState({ open: false, isEdit: false, row: null });
  const [form, setForm] = useState(emptyUnitForm);
  const [deleteModal, setDeleteModal] = useState({ open: false, row: null });
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);

  const toast = useCallback((msg, type = 'success') => {
    if (showToast) showToast(msg, type);
    else if (window.showToast) window.showToast(msg, type);
  }, [showToast]);

  // Load UOM units from PostgreSQL units table
  const fetchUnits = useCallback(async () => {
    setLoading(true);
    try {
      const res = await inventoryApi.getUnits();
      const dbList = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
      
      let localExtras = {};
      try {
        localExtras = JSON.parse(localStorage.getItem('alfa_uom_conversions_meta') || '{}');
      } catch (e) { }

      if (dbList.length > 0) {
        const mapped = dbList.map((u, idx) => {
          const id = u.unit_id || u.id || idx + 1;
          const uName = u.unit_name || u.name || 'Unit';
          const extra = localExtras[id] || DEFAULT_UOM_PRESETS.find(p => p.name.toLowerCase() === uName.toLowerCase()) || {};

          return {
            id,
            name: uName,
            code: extra.code || uName.slice(0, 3).toUpperCase(),
            type: extra.type || (/kg|gram|g\b|weight/i.test(uName) ? 'WEIGHT' : /ltr|litre|ml|volume|bottle|cup/i.test(uName) ? 'VOLUME' : 'COUNT'),
            decimals: u.qty_decimal_places !== undefined ? Number(u.qty_decimal_places) : (extra.decimals || 0),
            baseUnit: extra.baseUnit || uName,
            conversionFactor: Number(extra.conversionFactor || 1),
            description: extra.description || `Measurement unit for ${uName}`,
            status: u.is_active === 0 ? 'Inactive' : 'Active'
          };
        });
        setData(mapped);
      } else {
        // First-time initialization: Seed default UOM presets into PostgreSQL
        for (const preset of DEFAULT_UOM_PRESETS.slice(0, 7)) {
          await inventoryApi.saveUnit({
            unit_name: preset.name,
            qty_decimal_places: preset.decimals
          }).catch(() => { });
        }
        setData(DEFAULT_UOM_PRESETS);
      }
    } catch (err) {
      console.warn('Error loading units from DB:', err.message);
      setData(DEFAULT_UOM_PRESETS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUnits();
  }, [fetchUnits]);

  // Filtered dataset
  const filteredData = useMemo(() => {
    return data.filter(item => {
      const q = searchTerm.toLowerCase().trim();
      const matchSearch = !q ||
        item.name.toLowerCase().includes(q) ||
        (item.code && item.code.toLowerCase().includes(q)) ||
        (item.description && item.description.toLowerCase().includes(q));

      const matchType = selectedType === 'ALL' || item.type === selectedType;
      return matchSearch && matchType;
    });
  }, [data, searchTerm, selectedType]);

  const isAllSelected = filteredData.length > 0 && selectedIds.length === filteredData.length;
  const isIndeterminate = selectedIds.length > 0 && selectedIds.length < filteredData.length;

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredData.map(u => u.id));
    }
  };

  const handleToggleRow = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleBulkDelete = async () => {
    try {
      let count = 0;
      for (const id of selectedIds) {
        await apiClient.delete(`/units/${id}`).catch(() => {});
        count++;
      }
      toast(`Deleted ${count} unit(s) successfully.`);
      setSelectedIds([]);
      setBulkDeleteModalOpen(false);
      fetchUnits();
    } catch (err) {
      toast('Failed to delete selected units.', 'error');
    }
  };

  const handleOpenAdd = () => {
    setForm({ ...emptyUnitForm, baseUnit: 'Piece' });
    setModal({ open: true, isEdit: false, row: null });
  };

  const handleOpenEdit = (item) => {
    setForm({
      name: item.name,
      code: item.code,
      type: item.type,
      decimals: item.decimals,
      baseUnit: item.baseUnit,
      conversionFactor: item.conversionFactor,
      description: item.description,
      status: item.status
    });
    setModal({ open: true, isEdit: true, row: item });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast('Unit Name is required.', 'error');
      return;
    }

    try {
      const isEdit = modal.isEdit && modal.row;
      const payload = {
        unit_id: isEdit ? modal.row.id : undefined,
        unit_name: form.name.trim(),
        qty_decimal_places: Number(form.decimals || 0)
      };

      const res = await inventoryApi.saveUnit(payload);
      const savedId = isEdit ? modal.row.id : (res?.data?.unit_id || res?.data?.id || Date.now());

      // Save extra conversion metadata to local storage
      try {
        const localExtras = JSON.parse(localStorage.getItem('alfa_uom_conversions_meta') || '{}');
        localExtras[savedId] = {
          code: form.code.trim().toUpperCase() || form.name.slice(0, 3).toUpperCase(),
          type: form.type,
          decimals: Number(form.decimals || 0),
          baseUnit: form.baseUnit || form.name,
          conversionFactor: Number(form.conversionFactor || 1),
          description: form.description
        };
        localStorage.setItem('alfa_uom_conversions_meta', JSON.stringify(localExtras));
      } catch (e) { }

      toast(isEdit ? `Unit '${form.name}' updated successfully in PostgreSQL!` : `Unit '${form.name}' created in PostgreSQL!`);
      setModal({ open: false, isEdit: false, row: null });
      fetchUnits();
    } catch (err) {
      toast(err?.response?.data?.message || err?.message || 'Failed to save Unit in PostgreSQL', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.row) return;
    try {
      await apiClient.delete(`/units/${deleteModal.row.id}`).catch(() => { });
      toast(`Unit '${deleteModal.row.name}' deleted.`);
      setDeleteModal({ open: false, row: null });
      fetchUnits();
    } catch (err) {
      toast('Failed to delete unit.', 'error');
    }
  };

  return (
    <div style={{ padding: '24px 32px', backgroundColor: '#F8FAFC', minHeight: '100vh', display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: 'var(--font-family, system-ui)' }}>
      {/* Top Header */}
      <PageHeader
        title="Unit of Measure (UOM) Master"
        breadcrumbs={['Dashboard', 'Point Of Sale', 'Master', 'Unit of Measure (UOM)']}
        onBack={() => navigate('/pos/master')}
        actions={
          <button
            onClick={handleOpenAdd}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              backgroundColor: '#0d9488', color: '#fff',
              border: 'none', padding: '10px 18px', borderRadius: '10px',
              fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(13, 148, 136, 0.25)', transition: 'all 0.15s ease'
            }}
          >
            <FaPlus size={12} /> Add Unit of Measure
          </button>
        }
      />

      {/* Stats Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div style={{ background: '#fff', padding: '18px 20px', borderRadius: '14px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#f0fdfa', color: '#0d9488', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
            <FaWeight />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b' }}>TOTAL UNITS</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a' }}>{data.length}</div>
          </div>
        </div>

        <div style={{ background: '#fff', padding: '18px 20px', borderRadius: '14px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
            <FaBoxes />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b' }}>PORTIONS & PLATES</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a' }}>
              {data.filter(u => u.type === 'COUNT').length}
            </div>
          </div>
        </div>

        <div style={{ background: '#fff', padding: '18px 20px', borderRadius: '14px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
            <FaBalanceScale />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b' }}>WEIGHT (KG / G)</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a' }}>
              {data.filter(u => u.type === 'WEIGHT').length}
            </div>
          </div>
        </div>

        <div style={{ background: '#fff', padding: '18px 20px', borderRadius: '14px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#ede9fe', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
            <FaTint />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b' }}>LIQUID / VOLUME</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a' }}>
              {data.filter(u => u.type === 'VOLUME').length}
            </div>
          </div>
        </div>
      </div>

      {/* Main Container Card */}
      <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', padding: '24px' }}>
        {/* Filter and Search Bar */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          {/* Type Selector Tabs */}
          <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '10px', gap: '4px' }}>
            {[
              { id: 'ALL', label: 'All Units' },
              { id: 'COUNT', label: 'Serving / Portion / Plate' },
              { id: 'WEIGHT', label: 'Weight (Kg / Gram)' },
              { id: 'VOLUME', label: 'Liquid (Ltr / Bottle)' }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedType(tab.id)}
                style={{
                  padding: '7px 14px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '0.8rem',
                  fontWeight: selectedType === tab.id ? 800 : 600,
                  cursor: 'pointer',
                  background: selectedType === tab.id ? '#ffffff' : 'transparent',
                  color: selectedType === tab.id ? '#0d9488' : '#64748b',
                  boxShadow: selectedType === tab.id ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div style={{ position: 'relative', width: '280px' }}>
            <FaSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '13px' }} />
            <input
              type="text"
              placeholder="Search units, codes, portions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px 9px 34px',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                fontSize: '0.83rem',
                outline: 'none',
                background: '#f8fafc'
              }}
            />
          </div>
        </div>

        {/* Selection & Bulk Action Bar */}
        {selectedIds.length > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '10px',
            padding: '8px 16px',
            marginBottom: '14px',
            boxShadow: '0 1px 3px rgba(239, 68, 68, 0.08)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{
                background: '#dc2626',
                color: '#ffffff',
                fontSize: '11px',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: '999px'
              }}>
                {selectedIds.length}
              </span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#991b1b' }}>
                {isAllSelected
                  ? `All ${selectedIds.length} units selected`
                  : `${selectedIds.length} unit(s) selected`}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setSelectedIds([])}
                style={{
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  padding: '5px 12px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#475569',
                  cursor: 'pointer'
                }}
              >
                Clear Selection
              </button>
              <button
                type="button"
                onClick={() => setBulkDeleteModalOpen(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#dc2626',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px 14px',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#ffffff',
                  cursor: 'pointer',
                  boxShadow: '0 1px 2px rgba(220, 38, 38, 0.2)'
                }}
              >
                <FaTrash size={11} />
                <span>Delete Selected ({selectedIds.length})</span>
              </button>
            </div>
          </div>
        )}

        {/* Units Table */}
        <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 800, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <th style={{ width: '44px', textAlign: 'center', padding: '14px 10px' }}>
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={input => { if (input) input.indeterminate = isIndeterminate; }}
                    onChange={handleToggleSelectAll}
                    style={{ cursor: 'pointer', accentColor: '#0d9488', width: '16px', height: '16px' }}
                    title="Select all units"
                    aria-label="Select all units"
                  />
                </th>
                <th style={{ padding: '14px 18px' }}>Unit Name</th>
                <th style={{ padding: '14px 18px' }}>Code / Symbol</th>
                <th style={{ padding: '14px 18px' }}>Unit Category</th>
                <th style={{ padding: '14px 18px' }}>Decimal Places</th>
                <th style={{ padding: '14px 18px' }}>Conversion Specification</th>
                <th style={{ padding: '14px 18px' }}>Status</th>
                <th style={{ padding: '14px 18px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                    Loading measurement units from PostgreSQL...
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                    No matching units found.
                  </td>
                </tr>
              ) : (
                filteredData.map((u) => {
                  const isWeight = u.type === 'WEIGHT';
                  const isVolume = u.type === 'VOLUME';
                  const isSelected = selectedIds.includes(u.id);
                  return (
                    <tr
                      key={u.id}
                      style={{ borderBottom: '1px solid #f1f5f9', background: isSelected ? '#fef2f2' : 'transparent', transition: 'background 0.12s ease' }}
                      onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = '#f8fafc'; }}
                      onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                    >
                      <td style={{ textAlign: 'center', padding: '14px 10px' }}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleRow(u.id)}
                          style={{ cursor: 'pointer', accentColor: '#0d9488', width: '15px', height: '15px' }}
                          aria-label={`Select ${u.name}`}
                        />
                      </td>
                      <td style={{ padding: '14px 18px', fontWeight: 800, color: '#0f172a' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{
                            width: '8px', height: '8px', borderRadius: '50%',
                            background: isWeight ? '#f59e0b' : isVolume ? '#8b5cf6' : '#0d9488'
                          }} />
                          {u.name}
                        </div>
                      </td>
                      <td style={{ padding: '14px 18px', color: '#334155', fontWeight: 700 }}>
                        <span style={{ background: '#f1f5f9', padding: '3px 8px', borderRadius: '6px', fontSize: '0.78rem', color: '#0f172a', border: '1px solid #e2e8f0' }}>
                          {u.code || u.name.slice(0, 3).toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <span style={{
                          padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800,
                          background: isWeight ? '#fef3c7' : isVolume ? '#ede9fe' : '#e0f2fe',
                          color: isWeight ? '#b45309' : isVolume ? '#6d28d9' : '#0369a1'
                        }}>
                          {u.type === 'WEIGHT' ? 'Weight' : u.type === 'VOLUME' ? 'Volume / Liquid' : 'Serving / Count'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px', color: '#475569', fontWeight: 600 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <FaSortNumericDown size={12} color="#94a3b8" />
                          <span>{u.decimals} decimal(s)</span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 18px', color: '#475569', fontSize: '0.82rem' }}>
                        {u.conversionFactor > 1 ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0f172a', fontWeight: 700 }}>
                            <FaExchangeAlt size={11} color="#0d9488" />
                            <span>1 {u.name} = {u.conversionFactor} {u.baseUnit}</span>
                          </div>
                        ) : (
                          <span style={{ color: '#94a3b8' }}>Base Standard (1 {u.name})</span>
                        )}
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <span style={{
                          padding: '3px 8px', borderRadius: '6px', fontSize: '0.74rem', fontWeight: 800,
                          background: u.status === 'Active' ? '#dcfce7' : '#fee2e2',
                          color: u.status === 'Active' ? '#15803d' : '#b91c1c'
                        }}>
                          {u.status}
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '8px' }}>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(u)}
                            style={{
                              padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1',
                              background: '#fff', color: '#0f172a', cursor: 'pointer', fontSize: '0.75rem',
                              fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px'
                            }}
                          >
                            <FaEdit size={11} color="#0d9488" /> Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteModal({ open: true, row: u })}
                            style={{
                              padding: '6px 10px', borderRadius: '6px', border: '1px solid #fecaca',
                              background: '#fff', color: '#dc2626', cursor: 'pointer', fontSize: '0.75rem',
                              fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px'
                            }}
                          >
                            <FaTrash size={11} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Unit Modal */}
      <CommonModal
        isOpen={modal.open}
        onClose={() => setModal({ open: false, isEdit: false, row: null })}
        title={modal.isEdit ? `Edit Unit of Measure (${modal.row?.name})` : 'Add New Unit of Measure (UOM)'}
      >
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>
                Unit Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Plate, Portion, Kg, Piece, Bottle"
                value={form.name}
                onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
                required
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>
                Short Symbol / Code
              </label>
              <input
                type="text"
                placeholder="e.g. PLT, PRT, KG, PC, LTR"
                value={form.code}
                onChange={(e) => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>
                Unit Category
              </label>
              <select
                value={form.type}
                onChange={(e) => {
                  const newType = e.target.value;
                  setForm(p => ({
                    ...p,
                    type: newType,
                    decimals: newType === 'WEIGHT' || newType === 'VOLUME' ? 3 : 0,
                    baseUnit: newType === 'WEIGHT' ? 'Gram' : newType === 'VOLUME' ? 'Millilitre' : 'Piece'
                  }));
                }}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', background: '#fff' }}
              >
                <option value="COUNT">Serving / Portion / Count (Plate, Portion, Piece, Dozen)</option>
                <option value="WEIGHT">Weight (Kilogram, Gram, Ounce)</option>
                <option value="VOLUME">Liquid / Volume (Litre, Millilitre, Bottle, Glass)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>
                Qty Decimal Places
              </label>
              <input
                type="number"
                min="0"
                max="4"
                value={form.decimals}
                onChange={(e) => setForm(p => ({ ...p, decimals: parseInt(e.target.value) || 0 }))}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
              />
              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>0 for Countable, 2 or 3 for Weights/Volumes</span>
            </div>
          </div>

          {/* Conversion Section */}
          <div style={{ background: '#f8fafc', padding: '14px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0d9488', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Unit Conversion Specification (Optional)
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                  Multiplier Ratio (1 of this unit equals)
                </label>
                <input
                  type="number"
                  step="any"
                  min="0.0001"
                  value={form.conversionFactor}
                  onChange={(e) => setForm(p => ({ ...p, conversionFactor: parseFloat(e.target.value) || 1 }))}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                  Base Unit
                </label>
                <input
                  type="text"
                  placeholder="e.g. Gram, Millilitre, Piece"
                  value={form.baseUnit}
                  onChange={(e) => setForm(p => ({ ...p, baseUnit: e.target.value }))}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                />
              </div>
            </div>
            {form.conversionFactor > 1 && form.baseUnit && (
              <div style={{ fontSize: '0.76rem', color: '#047857', fontWeight: 700, marginTop: '2px' }}>
                ✓ Conversion rule: 1 {form.name || 'Unit'} = {form.conversionFactor} {form.baseUnit}
              </div>
            )}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>
              Description
            </label>
            <input
              type="text"
              placeholder="e.g. Standard food portion, bulk kitchen weight, etc."
              value={form.description}
              onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
              style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
            />
          </div>

          {/* Modal Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button
              type="button"
              onClick={() => setModal({ open: false, isEdit: false, row: null })}
              style={{ padding: '8px 18px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', color: '#475569', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{ padding: '8px 22px', borderRadius: '8px', border: 'none', background: '#0d9488', color: '#fff', fontWeight: 800, cursor: 'pointer', fontSize: '0.85rem', boxShadow: '0 2px 6px rgba(13, 148, 136, 0.25)' }}
            >
              {modal.isEdit ? 'Update Unit in PostgreSQL' : 'Save Unit to PostgreSQL'}
            </button>
          </div>
        </form>
      </CommonModal>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, row: null })}
        onConfirm={handleDelete}
        title="Delete Unit of Measure"
        message={`Are you sure you want to delete unit '${deleteModal.row?.name}'?`}
      />

      {/* Bulk Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={bulkDeleteModalOpen}
        onClose={() => setBulkDeleteModalOpen(false)}
        onConfirm={handleBulkDelete}
        title="Delete Selected Units"
        message={`Are you sure you want to delete ${selectedIds.length} selected unit(s)? This action cannot be undone.`}
      />
    </div>
  );
};

export default UOMMasterPage;
