import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useRestaurant } from '../../../../context/RestaurantContext';
import posApi from '../../../../api/posApi';
import {
  FaSlidersH,
  FaArrowLeft,
  FaStore,
  FaCogs,
  FaHashtag,
  FaPrint,
  FaSave,
  FaUtensils,
  FaTag,
  FaFileInvoiceDollar,
  FaSyncAlt,
  FaPlus,
  FaTrash,
  FaTimes,
  FaReceipt,
  FaCheck
} from 'react-icons/fa';

const OutletConfigPage = ({ showToast }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { allOutlets, activeOutletId, selectOutlet } = useRestaurant();

  // Selected outlet
  const [selectedOutletId, setSelectedOutletId] = useState(activeOutletId || (allOutlets?.[0]?.id || 1));
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const requestedTab = searchParams.get('tab') || 'general';
  const initialTab = requestedTab === 'printers' ? 'general' : requestedTab;
  const [activeTab, setActiveTab] = useState(initialTab); // 'general' | 'numbering'
  const [saving, setSaving] = useState(false);

  // Active outlet details
  const activeOutlet = useMemo(() => {
    return (allOutlets || []).find(o => String(o.id) === String(selectedOutletId)) || {
      id: selectedOutletId,
      name: 'bar',
      code: 'BAR'
    };
  }, [allOutlets, selectedOutletId]);

  const outletCode = (activeOutlet.code || activeOutlet.name || 'BAR').toUpperCase().slice(0, 4);

  // State: Numbering Series Configuration
  const [numbering, setNumbering] = useState({
    kot: {
      prefix: '',
      separator: '',
      minDigits: 1,
      startSeq: 1,
      currentSeq: 0,
      active: true
    },
    ncKot: {
      prefix: '',
      separator: '',
      minDigits: 1,
      startSeq: 1,
      currentSeq: 0,
      active: true
    },
    bill: {
      prefix: '',
      separator: '',
      minDigits: 1,
      startSeq: 1,
      currentSeq: 0,
      active: true
    }
  });

  // State: General Operations Configuration
  const [general, setGeneral] = useState({
    openingTime: '08:00',
    closingTime: '23:30',
    roundOffBill: 'Yes',
    roundOffMode: 'Nearest Rupee',
    taxInclusivePrices: 'No',
    defaultServiceChargePct: '5.0',
    serviceChargeActive: false,
    maxTableCapacityWarning: '12',
    enableNegativeInventoryKOT: 'No',
    allowBillSplitting: 'Yes',
    multiTerminalSyncSeconds: '5',
    defaultPaymentMethod: 'Cash',
    footerNotes: 'Thank you for dining with us! Please visit again.'
  });

  // Load saved config for selected outlet
  useEffect(() => {
    try {
      // Check PostgreSQL activeOutlet settings first
      const dbNumbering = activeOutlet?.settings?.numbering;
      const savedNum = localStorage.getItem(`alfa_outlet_numbering_${selectedOutletId}`);
      if (dbNumbering && typeof dbNumbering === 'object') {
        setNumbering(dbNumbering);
      } else if (savedNum) {
        setNumbering(JSON.parse(savedNum));
      } else {
        setNumbering({
          kot: { prefix: '', separator: '', minDigits: 1, startSeq: 1, currentSeq: 0, active: true },
          ncKot: { prefix: '', separator: '', minDigits: 1, startSeq: 1, currentSeq: 0, active: true },
          bill: { prefix: '', separator: '', minDigits: 1, startSeq: 1, currentSeq: 0, active: true }
        });
      }

      const dbGeneral = activeOutlet?.settings?.generalConfig;
      const savedGen = localStorage.getItem(`alfa_outlet_general_${selectedOutletId}`);
      if (dbGeneral && typeof dbGeneral === 'object') {
        setGeneral(prev => ({ ...prev, ...dbGeneral }));
      } else if (savedGen) {
        setGeneral(prev => ({ ...prev, ...JSON.parse(savedGen) }));
      }
    } catch (e) {
      console.error('Failed to load outlet config:', e);
    }
  }, [selectedOutletId, activeOutlet]);

  // Compute live preview string
  const computePreview = (series) => {
    const num = series.startSeq || 1;
    const padded = String(num).padStart(Number(series.minDigits) || 1, '0');
    if (!series.prefix || series.prefix.trim() === '') {
      return padded;
    }
    const sep = series.separator || '';
    return `${series.prefix.trim()}${sep}${padded}`;
  };

  const notify = (msg, type = 'success') => {
    if (showToast) showToast(msg, type);
    else if (window.showToast) window.showToast(msg, type);
  };


  // Save numbering
  const handleSaveNumbering = async () => {
    setSaving(true);
    try {
      localStorage.setItem(`alfa_outlet_numbering_${selectedOutletId}`, JSON.stringify(numbering));
      await posApi.saveOutletConfig(selectedOutletId, { numbering });
      window.dispatchEvent(new CustomEvent('outletsMasterRefreshed'));
      setSaving(false);
      notify('Document numbering series saved and persisted to PostgreSQL!');
    } catch (e) {
      setSaving(false);
      notify(e?.response?.data?.message || 'Saved locally, but failed to persist to PostgreSQL', 'warning');
    }
  };

  // Save general
  const handleSaveGeneral = async () => {
    setSaving(true);
    try {
      localStorage.setItem(`alfa_outlet_general_${selectedOutletId}`, JSON.stringify(general));
      await posApi.saveOutletConfig(selectedOutletId, { generalConfig: general });
      window.dispatchEvent(new CustomEvent('outletsMasterRefreshed'));
      setSaving(false);
      notify('General operational settings saved and persisted to PostgreSQL!');
    } catch (e) {
      setSaving(false);
      notify(e?.response?.data?.message || 'Saved locally, but failed to persist to PostgreSQL', 'warning');
    }
  };



  // Check if uninitialized
  const isInitialized = useMemo(() => {
    return Boolean(localStorage.getItem(`alfa_outlet_numbering_${selectedOutletId}`));
  }, [selectedOutletId, saving]);

  return (
    <div style={{ padding: '16px 28px 40px', background: '#f8fafc', minHeight: 'calc(100vh - 75px)', fontFamily: 'var(--font-family, system-ui)' }}>

      {/* Top Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            onClick={() => navigate('/pos/master')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              fontSize: '13px',
              fontWeight: 600,
              color: '#334155',
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
              transition: 'all 0.15s ease'
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = '#f1f5f9'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = '#ffffff'; }}
          >
            <FaArrowLeft style={{ fontSize: '11px' }} />
            <span>Back</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaSlidersH style={{ color: '#0d9488', fontSize: '18px' }} />
            <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.01em' }}>
              Outlet Configuration Master
            </h1>
          </div>
        </div>

        {/* Outlet Selector Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            padding: '4px 12px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
          }}>
            <FaStore style={{ color: '#0d9488', fontSize: '14px' }} />
            <select
              value={selectedOutletId}
              onChange={(e) => {
                const id = Number(e.target.value);
                setSelectedOutletId(id);
                selectOutlet(id);
              }}
              style={{
                border: 'none',
                outline: 'none',
                fontSize: '13px',
                fontWeight: 600,
                color: '#1e293b',
                background: 'transparent',
                cursor: 'pointer',
                paddingRight: '6px'
              }}
            >
              {(allOutlets || []).map(o => (
                <option key={o.id} value={o.id}>
                  {o.name || o.store_name} ({(o.code || o.name || 'OUT').toUpperCase().slice(0, 4)})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Outlet Banner Card */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '10px',
        padding: '16px 20px',
        marginBottom: '16px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <span style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a' }}>
            {activeOutlet.name || activeOutlet.store_name || 'bar'}
          </span>
          <span style={{
            background: '#0d9488',
            color: '#ffffff',
            fontSize: '10.5px',
            fontWeight: 800,
            letterSpacing: '0.04em',
            padding: '2.5px 8px',
            borderRadius: '4px',
            textTransform: 'uppercase'
          }}>
            Active Outlet
          </span>
          {!isInitialized ? (
            <span style={{
              background: '#fef3c7',
              color: '#d97706',
              border: '1px solid #fde68a',
              fontSize: '10.5px',
              fontWeight: 800,
              letterSpacing: '0.04em',
              padding: '2.5px 8px',
              borderRadius: '4px',
              textTransform: 'uppercase'
            }}>
              Uninitialized
            </span>
          ) : (
            <span style={{
              background: '#ecfdf5',
              color: '#059669',
              border: '1px solid #a7f3d0',
              fontSize: '10.5px',
              fontWeight: 800,
              letterSpacing: '0.04em',
              padding: '2.5px 8px',
              borderRadius: '4px',
              textTransform: 'uppercase'
            }}>
              Configured
            </span>
          )}
        </div>
        <div style={{ fontSize: '12.5px', color: '#64748b' }}>
          Code: <strong style={{ color: '#334155' }}>{outletCode}</strong> • {isInitialized ? 'Active profile initialized and generating synchronized numbering' : 'Default profile pending initialization'}
        </div>
      </div>

      {/* Tabs Navigation Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
        <button
          onClick={() => setActiveTab('general')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '9px 18px',
            borderRadius: '22px',
            border: activeTab === 'general' ? '1px solid #0d9488' : '1px solid #cbd5e1',
            background: activeTab === 'general' ? '#0d9488' : '#ffffff',
            color: activeTab === 'general' ? '#ffffff' : '#475569',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: activeTab === 'general' ? '0 2px 6px rgba(13,148,136,0.25)' : 'none',
            transition: 'all 0.15s ease'
          }}
        >
          <FaCogs style={{ fontSize: '13px' }} />
          <span>General Operations</span>
        </button>

        <button
          onClick={() => setActiveTab('numbering')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '9px 18px',
            borderRadius: '22px',
            border: activeTab === 'numbering' ? '1px solid #0d9488' : '1px solid #cbd5e1',
            background: activeTab === 'numbering' ? '#0d9488' : '#ffffff',
            color: activeTab === 'numbering' ? '#ffffff' : '#475569',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: activeTab === 'numbering' ? '0 2px 6px rgba(13,148,136,0.25)' : 'none',
            transition: 'all 0.15s ease'
          }}
        >
          <FaHashtag style={{ fontSize: '12px' }} />
          <span>Document Numbering</span>
        </button>

      </div>

      {/* TAB 2: DOCUMENT NUMBERING */}
      {activeTab === 'numbering' && (
        <div>
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '16px',
            marginBottom: '18px'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
                <span style={{ color: '#0d9488' }}>#</span>
                <span>Independent Document Number Series</span>
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '3px' }}>
                Configure independent sequence generation for Normal KOT, NC KOT, and Bill documents. Leave prefix blank for clean natural numbers (1, 2, 3...).
              </div>
            </div>

            <button
              onClick={handleSaveNumbering}
              disabled={saving}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 18px',
                background: '#0d9488',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: saving ? 'not-allowed' : 'pointer',
                boxShadow: '0 2px 6px rgba(13,148,136,0.3)',
                whiteSpace: 'nowrap'
              }}
            >
              <FaSave />
              <span>{saving ? 'Saving...' : 'Save Numbering Settings'}</span>
            </button>
          </div>

          {/* 3-Column Series Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '18px' }}>
            {/* Card 1: Normal KOT Series */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '18px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ea580c', fontSize: '13px', fontWeight: 800 }}>
                  <FaUtensils style={{ fontSize: '14px' }} />
                  <span>NORMAL KOT SERIES</span>
                </div>
                <span style={{ background: '#0d9488', color: '#ffffff', fontSize: '10px', fontWeight: 800, padding: '2px 8px', borderRadius: '4px' }}>
                  ACTIVE
                </span>
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', textAlign: 'center', marginBottom: '16px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  LIVE COMPUTED PREVIEW
                </div>
                <div style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', margin: '4px 0 2px' }}>
                  {computePreview(numbering.kot)}
                </div>
                <div style={{ fontSize: '11px', color: '#9333ea', fontWeight: 600 }}>
                  Current Sequence: #{numbering.kot.currentSeq || 0}
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Prefix (Optional)</label>
                <input
                  type="text"
                  value={numbering.kot.prefix}
                  onChange={(e) => setNumbering({ ...numbering, kot: { ...numbering.kot, prefix: e.target.value } })}
                  placeholder="E.G. KOT (LEAVE BLANK FOR 1, 2, 3)"
                  style={{ width: '100%', boxSizing: 'border-box', padding: '8px 10px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                />
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '3px' }}>Blank = Raw number sequence.</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Separator</label>
                  <select
                    value={numbering.kot.separator}
                    onChange={(e) => setNumbering({ ...numbering, kot: { ...numbering.kot, separator: e.target.value } })}
                    style={{ width: '100%', boxSizing: 'border-box', padding: '8px 10px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#ffffff' }}
                  >
                    <option value="">None (Empty)</option>
                    <option value="-">- (Hyphen)</option>
                    <option value="/">/ (Slash)</option>
                    <option value="_">_ (Underscore)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Min Digits (Padding)</label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    value={numbering.kot.minDigits}
                    onChange={(e) => setNumbering({ ...numbering, kot: { ...numbering.kot, minDigits: Math.max(1, parseInt(e.target.value) || 1) } })}
                    style={{ width: '100%', boxSizing: 'border-box', padding: '8px 10px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Start Sequence Number</label>
                <input
                  type="number"
                  min="1"
                  value={numbering.kot.startSeq}
                  onChange={(e) => setNumbering({ ...numbering, kot: { ...numbering.kot, startSeq: Math.max(1, parseInt(e.target.value) || 1) } })}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '8px 10px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                />
              </div>
            </div>

            {/* Card 2: NC KOT Series */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '18px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#9333ea', fontSize: '13px', fontWeight: 800 }}>
                  <FaTag style={{ fontSize: '14px' }} />
                  <span>NC KOT SERIES (NON-CHARGEABLE)</span>
                </div>
                <span style={{ background: '#0d9488', color: '#ffffff', fontSize: '10px', fontWeight: 800, padding: '2px 8px', borderRadius: '4px' }}>
                  ACTIVE
                </span>
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', textAlign: 'center', marginBottom: '16px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  LIVE COMPUTED PREVIEW
                </div>
                <div style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', margin: '4px 0 2px' }}>
                  {computePreview(numbering.ncKot)}
                </div>
                <div style={{ fontSize: '11px', color: '#9333ea', fontWeight: 600 }}>
                  Current Sequence: #{numbering.ncKot.currentSeq || 0}
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Prefix (Optional)</label>
                <input
                  type="text"
                  value={numbering.ncKot.prefix}
                  onChange={(e) => setNumbering({ ...numbering, ncKot: { ...numbering.ncKot, prefix: e.target.value } })}
                  placeholder="E.G. NC (LEAVE BLANK FOR 1, 2, 3)"
                  style={{ width: '100%', boxSizing: 'border-box', padding: '8px 10px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                />
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '3px' }}>Blank = Raw number sequence.</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Separator</label>
                  <select
                    value={numbering.ncKot.separator}
                    onChange={(e) => setNumbering({ ...numbering, ncKot: { ...numbering.ncKot, separator: e.target.value } })}
                    style={{ width: '100%', boxSizing: 'border-box', padding: '8px 10px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#ffffff' }}
                  >
                    <option value="">None (Empty)</option>
                    <option value="-">- (Hyphen)</option>
                    <option value="/">/ (Slash)</option>
                    <option value="_">_ (Underscore)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Min Digits (Padding)</label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    value={numbering.ncKot.minDigits}
                    onChange={(e) => setNumbering({ ...numbering, ncKot: { ...numbering.ncKot, minDigits: Math.max(1, parseInt(e.target.value) || 1) } })}
                    style={{ width: '100%', boxSizing: 'border-box', padding: '8px 10px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Start Sequence Number</label>
                <input
                  type="number"
                  min="1"
                  value={numbering.ncKot.startSeq}
                  onChange={(e) => setNumbering({ ...numbering, ncKot: { ...numbering.ncKot, startSeq: Math.max(1, parseInt(e.target.value) || 1) } })}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '8px 10px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                />
              </div>
            </div>

            {/* Card 3: Bill / Tax Invoice Series */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '18px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#059669', fontSize: '13px', fontWeight: 800 }}>
                  <FaFileInvoiceDollar style={{ fontSize: '14px' }} />
                  <span>BILL / TAX INVOICE SERIES</span>
                </div>
                <span style={{ background: '#0d9488', color: '#ffffff', fontSize: '10px', fontWeight: 800, padding: '2px 8px', borderRadius: '4px' }}>
                  ACTIVE
                </span>
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', textAlign: 'center', marginBottom: '16px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  LIVE COMPUTED PREVIEW
                </div>
                <div style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', margin: '4px 0 2px' }}>
                  {computePreview(numbering.bill)}
                </div>
                <div style={{ fontSize: '11px', color: '#9333ea', fontWeight: 600 }}>
                  Current Sequence: #{numbering.bill.currentSeq || 0}
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Prefix (Optional)</label>
                <input
                  type="text"
                  value={numbering.bill.prefix}
                  onChange={(e) => setNumbering({ ...numbering, bill: { ...numbering.bill, prefix: e.target.value } })}
                  placeholder="E.G. INV (LEAVE BLANK FOR 1, 2, 3)"
                  style={{ width: '100%', boxSizing: 'border-box', padding: '8px 10px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                />
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '3px' }}>Blank = Raw number sequence.</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Separator</label>
                  <select
                    value={numbering.bill.separator}
                    onChange={(e) => setNumbering({ ...numbering, bill: { ...numbering.bill, separator: e.target.value } })}
                    style={{ width: '100%', boxSizing: 'border-box', padding: '8px 10px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#ffffff' }}
                  >
                    <option value="">None (Empty)</option>
                    <option value="-">- (Hyphen)</option>
                    <option value="/">/ (Slash)</option>
                    <option value="_">_ (Underscore)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Min Digits (Padding)</label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    value={numbering.bill.minDigits}
                    onChange={(e) => setNumbering({ ...numbering, bill: { ...numbering.bill, minDigits: Math.max(1, parseInt(e.target.value) || 1) } })}
                    style={{ width: '100%', boxSizing: 'border-box', padding: '8px 10px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Start Sequence Number</label>
                <input
                  type="number"
                  min="1"
                  value={numbering.bill.startSeq}
                  onChange={(e) => setNumbering({ ...numbering, bill: { ...numbering.bill, startSeq: Math.max(1, parseInt(e.target.value) || 1) } })}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '8px 10px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: GENERAL OPERATIONS */}
      {activeTab === 'general' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
                <span style={{ color: '#0d9488' }}>⚙</span>
                <span>General Operational Configuration</span>
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '3px' }}>
                Store timings, service charge percentages, bill rounding policies and live order syncing intervals.
              </div>
            </div>

            <button
              onClick={handleSaveGeneral}
              disabled={saving}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 18px',
                background: '#0d9488',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: saving ? 'not-allowed' : 'pointer',
                boxShadow: '0 2px 6px rgba(13,148,136,0.3)'
              }}
            >
              <FaSave />
              <span>{saving ? 'Saving...' : 'Save General Settings'}</span>
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '18px' }}>
            {/* Timings & Service Charge */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '18px 20px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '14px', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                Operating Hours & Service Charge
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Opening Time</label>
                  <input
                    type="time"
                    value={general.openingTime}
                    onChange={(e) => setGeneral({ ...general, openingTime: e.target.value })}
                    style={{ width: '100%', padding: '8px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Closing Time</label>
                  <input
                    type="time"
                    value={general.closingTime}
                    onChange={(e) => setGeneral({ ...general, closingTime: e.target.value })}
                    style={{ width: '100%', padding: '8px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Service Charge Active</label>
                  <select
                    value={general.serviceChargeActive ? 'Yes' : 'No'}
                    onChange={(e) => setGeneral({ ...general, serviceChargeActive: e.target.value === 'Yes' })}
                    style={{ width: '100%', padding: '8px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#ffffff' }}
                  >
                    <option value="No">Disabled (0%)</option>
                    <option value="Yes">Enabled</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Service Charge (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={general.defaultServiceChargePct}
                    onChange={(e) => setGeneral({ ...general, defaultServiceChargePct: e.target.value })}
                    style={{ width: '100%', padding: '8px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                  />
                </div>
              </div>
            </div>

            {/* Bill Rounding & Synchronization */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '18px 20px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '14px', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                Rounding & Sync Intervals
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Round-Off Bill Amount</label>
                  <select
                    value={general.roundOffBill}
                    onChange={(e) => setGeneral({ ...general, roundOffBill: e.target.value })}
                    style={{ width: '100%', padding: '8px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#ffffff' }}
                  >
                    <option value="Yes">Yes (Round to ₹1.00)</option>
                    <option value="No">No (Exact Paise)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Terminal Sync Interval</label>
                  <select
                    value={general.multiTerminalSyncSeconds}
                    onChange={(e) => setGeneral({ ...general, multiTerminalSyncSeconds: e.target.value })}
                    style={{ width: '100%', padding: '8px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#ffffff' }}
                  >
                    <option value="3">3 seconds (Realtime)</option>
                    <option value="5">5 seconds (Standard)</option>
                    <option value="10">10 seconds</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Bill Footer Message</label>
                <input
                  type="text"
                  value={general.footerNotes}
                  onChange={(e) => setGeneral({ ...general, footerNotes: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OutletConfigPage;
