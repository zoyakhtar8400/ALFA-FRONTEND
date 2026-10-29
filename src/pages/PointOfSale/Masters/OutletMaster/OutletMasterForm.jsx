import React, { useState, useEffect } from 'react';
import PageHeader from '../../../../components/common/PageHeader';
import CommonActionButtons from '../../../../components/common/CommonActionButtons';
import F from '../../../../components/common/F';
import { FaStore, FaCogs, FaPrint } from 'react-icons/fa';

const parseVal = (e) => (e && typeof e === 'object' && e.target !== undefined ? e.target.value : (e ?? ''));

const OutletMasterForm = ({ isOpen, onClose, onSave, initialData = {}, isEdit }) => {
  const [fields, setFields] = useState({
    name: '',
    shortName: '',
    gstin: '',
    companyTitle: 'Yes',
    outletTitle: 'Yes',
    customerInfo: 'Optional',
    autoSettlement: 'No',
    focusOn: 'BOTH',
    kot: 'Print & Save',
    kotPrint: 'Immediate',
    roomService: 'Disabled',
    noOfKOT: '1',
    noOfBills: '1',
    hsnSac: '',
    general: '',
    phone: '',
    billHeader1: '',
    billHeader2: '',
    billHeader3: '',
    billSlogan1: '',
    billSlogan2: '',
    billSlogan3: '',
    status: 'Active'
  });

  useEffect(() => {
    if (isOpen) {
      setFields({
        name: '',
        shortName: '',
        gstin: '',
        companyTitle: 'Yes',
        outletTitle: 'Yes',
        customerInfo: 'Optional',
        autoSettlement: 'No',
        focusOn: 'BOTH',
        kot: 'Print & Save',
        kotPrint: 'Immediate',
        roomService: 'Disabled',
        noOfKOT: '1',
        noOfBills: '1',
        hsnSac: '',
        general: '',
        phone: '',
        billHeader1: '',
        billHeader2: '',
        billHeader3: '',
        billSlogan1: '',
        billSlogan2: '',
        billSlogan3: '',
        status: 'Active',
        ...initialData,
        shortName: initialData.shortName || initialData.code || '',
        gstin: initialData.gstin || ''
      });
    }
  }, [isOpen, isEdit, initialData]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    onSave(fields);
  };

  const sectionTitle = (icon, title) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '2px 0 4px', borderBottom: '2px solid var(--primary)', marginBottom: '8px' }}>
      <span style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', color: 'var(--primary)' }}>{icon}</span>
      <span style={{ fontWeight: 700, fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--primary)' }}>{title}</span>
    </div>
  );

  const cardStyle = {
    background: 'var(--card-bg, #fff)',
    border: '1px solid var(--border)',
    borderRadius: '6px',
    padding: '8px 12px'
  };

  return (
    <div className="animate-in duration-200" style={{ padding: '0 8px', fontFamily: 'var(--font-family, system-ui)' }}>
      {/* Hide ALL scrollbars globally for a premium desktop app feel */}
      <style dangerouslySetInnerHTML={{
        __html: `
        ::-webkit-scrollbar {
          display: none !important;
          width: 0px !important;
          height: 0px !important;
        }
        * {
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
        }
        .outlet-form-container .form-label {
          font-size: 0.72rem !important;
          font-weight: 700 !important;
          margin-bottom: 2px !important;
          color: #475569 !important;
        }
        .outlet-form-container .form-input,
        .outlet-form-container .form-select {
          font-size: 0.78rem !important;
          height: 30px !important;
          padding: 3px 8px !important;
          border-radius: 5px !important;
        }
      `}} />

      <PageHeader
        title={isEdit ? 'Edit Outlet Master' : 'Add Outlet Master'}
        breadcrumbs={['Dashboard', 'Point Of Sale', 'Master', 'Outlet Master', isEdit ? 'Edit' : 'Add']}
        showBack
        onBack={onClose}
        style={{ marginBottom: '6px', paddingBottom: '2px' }}
      />

      <form onSubmit={handleSubmit} className="outlet-form-container" style={{ padding: '0 8px 4px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '4fr 6fr', gap: '10px', alignItems: 'start', marginBottom: '10px' }}>
          
          {/* LEFT COLUMN: General Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={cardStyle}>
              {sectionTitle(<FaStore />, 'General Details')}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 8px' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <F label="Name" required value={fields.name} onChange={val => setFields(p => ({ ...p, name: parseVal(val) }))} style={{ marginBottom: 0 }} inputStyle={{ height: '30px', fontSize: '0.8rem' }} />
                </div>

                <F label="Short Name" required value={fields.shortName} onChange={val => setFields(p => ({ ...p, shortName: parseVal(val).toUpperCase() }))} style={{ marginBottom: 0 }} inputStyle={{ height: '30px', fontSize: '0.8rem' }} />
                
                <F label="Status" style={{ marginBottom: 0 }}>
                  <select
                    value={fields.status || 'Active'}
                    onChange={e => setFields(p => ({ ...p, status: parseVal(e) }))}
                    className="form-select"
                    style={{ fontSize: '0.8rem', padding: '3px 6px', height: '30px' }}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </F>
                
                <F label="Company Title" style={{ marginBottom: 0 }}>
                  <select
                    value={fields.companyTitle || 'Yes'}
                    onChange={e => setFields(p => ({ ...p, companyTitle: parseVal(e) }))}
                    className="form-select"
                    style={{ fontSize: '0.8rem', padding: '3px 6px', height: '30px' }}
                  >
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </F>

                <F label="Outlet Title" style={{ marginBottom: 0 }}>
                  <select
                    value={fields.outletTitle || 'Yes'}
                    onChange={e => setFields(p => ({ ...p, outletTitle: parseVal(e) }))}
                    className="form-select"
                    style={{ fontSize: '0.8rem', padding: '3px 6px', height: '30px' }}
                  >
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </F>

                <F label="Phone Number *" value={fields.phone} onChange={val => setFields(p => ({ ...p, phone: parseVal(val) }))} style={{ marginBottom: 0 }} inputStyle={{ height: '30px', fontSize: '0.8rem' }} />
                <F label="HSN / SAC *" value={fields.hsnSac} onChange={val => setFields(p => ({ ...p, hsnSac: parseVal(val) }))} style={{ marginBottom: 0 }} inputStyle={{ height: '30px', fontSize: '0.8rem' }} />
                
                <div style={{ gridColumn: 'span 2' }}>
                  <F label="GST No / GSTIN *" value={fields.gstin} onChange={val => setFields(p => ({ ...p, gstin: parseVal(val) }))} style={{ marginBottom: 0 }} inputStyle={{ height: '30px', fontSize: '0.8rem' }} />
                </div>
                
                <div style={{ gridColumn: 'span 2' }}>
                  <F label="General" value={fields.general} onChange={val => setFields(p => ({ ...p, general: parseVal(val) }))} style={{ marginBottom: 0 }} inputStyle={{ height: '30px', fontSize: '0.8rem' }} />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Operations & Billing Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={cardStyle}>
              {sectionTitle(<FaCogs />, 'Operations & Settlement')}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px 8px' }}>
                <F label="Customer Info" style={{ marginBottom: 0 }}>
                  <select
                    value={fields.customerInfo || 'Optional'}
                    onChange={e => setFields(p => ({ ...p, customerInfo: parseVal(e) }))}
                    className="form-select"
                    style={{ fontSize: '0.8rem', padding: '3px 6px', height: '30px' }}
                  >
                    <option value="Optional">Optional</option>
                    <option value="Required">Required</option>
                    <option value="Skip">Skip</option>
                  </select>
                </F>

                <F label="Auto Settlement" style={{ marginBottom: 0 }}>
                  <select
                    value={fields.autoSettlement || 'No'}
                    onChange={e => setFields(p => ({ ...p, autoSettlement: parseVal(e) }))}
                    className="form-select"
                    style={{ fontSize: '0.8rem', padding: '3px 6px', height: '30px' }}
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </F>

                <F label="Focus On" style={{ marginBottom: 0 }}>
                  <select
                    value={fields.focusOn || 'BOTH'}
                    onChange={e => setFields(p => ({ ...p, focusOn: parseVal(e) }))}
                    className="form-select"
                    style={{ fontSize: '0.8rem', padding: '3px 6px', height: '30px' }}
                  >
                    <option value="CODE">Code — Define the Item Menu Code</option>
                    <option value="NAME">Name — Define the Item Menu Name</option>
                    <option value="BOTH">Both — Search by either code or name</option>
                  </select>
                </F>

                <F label="KOT" style={{ marginBottom: 0 }}>
                  <select
                    value={fields.kot || 'Print & Save'}
                    onChange={e => setFields(p => ({ ...p, kot: parseVal(e) }))}
                    className="form-select"
                    style={{ fontSize: '0.8rem', padding: '3px 6px', height: '30px' }}
                  >
                    <option value="Print & Save">Print & Save</option>
                    <option value="Save Only">Save Only</option>
                    <option value="Disabled">Disabled</option>
                  </select>
                </F>

                <F label="KOT Print" style={{ marginBottom: 0 }}>
                  <select
                    value={fields.kotPrint || 'Immediate'}
                    onChange={e => setFields(p => ({ ...p, kotPrint: parseVal(e) }))}
                    className="form-select"
                    style={{ fontSize: '0.8rem', padding: '3px 6px', height: '30px' }}
                  >
                    <option value="Immediate">Immediate</option>
                    <option value="On Demand">On Demand</option>
                    <option value="Disabled">Disabled</option>
                  </select>
                </F>

                <F label="Room Service" style={{ marginBottom: 0 }}>
                  <select
                    value={fields.roomService || 'Disabled'}
                    onChange={e => setFields(p => ({ ...p, roomService: parseVal(e) }))}
                    className="form-select"
                    style={{ fontSize: '0.8rem', padding: '3px 6px', height: '30px' }}
                  >
                    <option value="Disabled">Disabled</option>
                    <option value="Enabled">Enabled</option>
                  </select>
                </F>

                <F label="No of KOT" type="number" value={fields.noOfKOT} onChange={val => setFields(p => ({ ...p, noOfKOT: parseVal(val) }))} style={{ marginBottom: 0 }} inputStyle={{ height: '30px', fontSize: '0.8rem' }} />
                <F label="No of Bills" type="number" value={fields.noOfBills} onChange={val => setFields(p => ({ ...p, noOfBills: parseVal(val) }))} style={{ marginBottom: 0 }} inputStyle={{ height: '30px', fontSize: '0.8rem' }} />
              </div>
            </div>

            <div style={cardStyle}>
              {sectionTitle(<FaPrint />, 'Bill Print Settings')}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 8px' }}>
                <F label="Bill Header 1" value={fields.billHeader1} onChange={val => setFields(p => ({ ...p, billHeader1: parseVal(val) }))} style={{ marginBottom: 0 }} inputStyle={{ height: '30px', fontSize: '0.8rem' }} />
                <F label="Bill Slogan 1" value={fields.billSlogan1} onChange={val => setFields(p => ({ ...p, billSlogan1: parseVal(val) }))} style={{ marginBottom: 0 }} inputStyle={{ height: '30px', fontSize: '0.8rem' }} />
                
                <F label="Bill Header 2" value={fields.billHeader2} onChange={val => setFields(p => ({ ...p, billHeader2: parseVal(val) }))} style={{ marginBottom: 0 }} inputStyle={{ height: '30px', fontSize: '0.8rem' }} />
                <F label="Bill Slogan 2" value={fields.billSlogan2} onChange={val => setFields(p => ({ ...p, billSlogan2: parseVal(val) }))} style={{ marginBottom: 0 }} inputStyle={{ height: '30px', fontSize: '0.8rem' }} />
                
                <F label="Bill Header 3" value={fields.billHeader3} onChange={val => setFields(p => ({ ...p, billHeader3: parseVal(val) }))} style={{ marginBottom: 0 }} inputStyle={{ height: '30px', fontSize: '0.8rem' }} />
                <F label="Bill Slogan 3" value={fields.billSlogan3} onChange={val => setFields(p => ({ ...p, billSlogan3: parseVal(val) }))} style={{ marginBottom: 0 }} inputStyle={{ height: '30px', fontSize: '0.8rem' }} />
              </div>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div style={{ marginTop: '12px' }}>
          <CommonActionButtons
            onSave={handleSubmit}
            onCancel={onClose}
            saveText={isEdit ? 'Update' : 'Save'}
          />
        </div>
      </form>
    </div>
  );
};

export default OutletMasterForm;
