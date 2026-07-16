import React, { useState, useEffect } from 'react';
import PageHeader from '../../../../components/common/PageHeader';
import CommonActionButtons from '../../../../components/common/CommonActionButtons';
import F from '../../../../components/common/F';
import { FaStore, FaCogs, FaPrint } from 'react-icons/fa';

const OutletMasterForm = ({ isOpen, onClose, onSave, initialData = {}, isEdit }) => {
  const [fields, setFields] = useState({
    name: '',
    shortName: '',
    companyTitle: '',
    outletTitle: '',
    customerInfo: 'Optional',
    autoSettlement: 'No',
    focusOn: 'Item Search',
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
        companyTitle: '',
        outletTitle: '',
        customerInfo: 'Optional',
        autoSettlement: 'No',
        focusOn: 'Item Search',
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
        shortName: initialData.shortName || initialData.code || ''
      });
    }
  }, [isOpen, isEdit, initialData]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    onSave(fields);
  };

  const sectionTitle = (icon, title) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '2px 0 4px', borderBottom: '2px solid var(--primary)', marginBottom: '8px' }}>
      <span style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', color: 'var(--primary)' }}>{icon}</span>
      <span style={{ fontWeight: 700, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--primary)' }}>{title}</span>
    </div>
  );

  const cardStyle = {
    background: 'var(--card-bg, #fff)',
    border: '1px solid var(--border)',
    borderRadius: '6px',
    padding: '10px 14px'
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
      `}} />

      <PageHeader
        title={isEdit ? 'Edit Outlet Master' : 'Add Outlet Master'}
        breadcrumbs={['Dashboard', 'Point Of Sale', 'Master', 'Outlet Master', isEdit ? 'Edit' : 'Add']}
        showBack
        onBack={onClose}
        style={{ marginBottom: '8px', paddingBottom: '2px' }}
      />

      <form onSubmit={handleSubmit} style={{ padding: '0 8px 4px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '4fr 6fr', gap: '10px', alignItems: 'start', marginBottom: '10px' }}>
          
          {/* LEFT COLUMN: General Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={cardStyle}>
              {sectionTitle(<FaStore />, 'General Details')}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 8px' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <F label="Name" required value={fields.name} onChange={e => setFields(p => ({ ...p, name: e.target.value }))} style={{ marginBottom: 0 }} inputStyle={{ height: '34px' }} />
                </div>

                <F label="Short Name" required value={fields.shortName} onChange={e => setFields(p => ({ ...p, shortName: e.target.value.toUpperCase() }))} style={{ marginBottom: 0 }} inputStyle={{ height: '34px' }} />
                
                <F label="Status" style={{ marginBottom: 0 }}>
                  <select
                    value={fields.status || 'Active'}
                    onChange={e => setFields(p => ({ ...p, status: e.target.value }))}
                    className="form-select"
                    style={{ fontSize: '0.9rem', padding: '4px 6px', height: '34px' }}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </F>
                
                <F label="Company Title" style={{ marginBottom: 0 }}>
                  <select
                    value={fields.companyTitle || ''}
                    onChange={e => setFields(p => ({ ...p, companyTitle: e.target.value }))}
                    className="form-select"
                    style={{ fontSize: '0.9rem', padding: '4px 6px', height: '34px' }}
                  >
                    <option value="">--Select Company--</option>
                    <option value="Alfa Hotels & Resorts">Alfa Hotels & Resorts</option>
                    <option value="Grand Plaza Group">Grand Plaza Group</option>
                    <option value="Downtown Hospitality">Downtown Hospitality</option>
                  </select>
                </F>

                <F label="Outlet Title" style={{ marginBottom: 0 }}>
                  <select
                    value={fields.outletTitle || ''}
                    onChange={e => setFields(p => ({ ...p, outletTitle: e.target.value }))}
                    className="form-select"
                    style={{ fontSize: '0.9rem', padding: '4px 6px', height: '34px' }}
                  >
                    <option value="">--Select Outlet Title--</option>
                    <option value="Main Dining Room">Main Dining Room</option>
                    <option value="Rooftop Grill">Rooftop Grill</option>
                    <option value="Poolside Cafe">Poolside Cafe</option>
                    <option value="Executive Lounge">Executive Lounge</option>
                  </select>
                </F>

                <F label="Phone Number" value={fields.phone} onChange={e => setFields(p => ({ ...p, phone: e.target.value }))} style={{ marginBottom: 0 }} inputStyle={{ height: '34px' }} />
                <F label="HSN / SAC" value={fields.hsnSac} onChange={e => setFields(p => ({ ...p, hsnSac: e.target.value }))} style={{ marginBottom: 0 }} inputStyle={{ height: '34px' }} />
                
                <div style={{ gridColumn: 'span 2' }}>
                  <F label="General" value={fields.general} onChange={e => setFields(p => ({ ...p, general: e.target.value }))} style={{ marginBottom: 0 }} inputStyle={{ height: '34px' }} />
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
                    onChange={e => setFields(p => ({ ...p, customerInfo: e.target.value }))}
                    className="form-select"
                    style={{ fontSize: '0.9rem', padding: '4px 6px', height: '34px' }}
                  >
                    <option value="Optional">Optional</option>
                    <option value="Required">Required</option>
                    <option value="Skip">Skip</option>
                  </select>
                </F>

                <F label="Auto Settlement" style={{ marginBottom: 0 }}>
                  <select
                    value={fields.autoSettlement || 'No'}
                    onChange={e => setFields(p => ({ ...p, autoSettlement: e.target.value }))}
                    className="form-select"
                    style={{ fontSize: '0.9rem', padding: '4px 6px', height: '34px' }}
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </F>

                <F label="Focus On" style={{ marginBottom: 0 }}>
                  <select
                    value={fields.focusOn || 'Item Search'}
                    onChange={e => setFields(p => ({ ...p, focusOn: e.target.value }))}
                    className="form-select"
                    style={{ fontSize: '0.9rem', padding: '4px 6px', height: '34px' }}
                  >
                    <option value="Item Search">Item Search</option>
                    <option value="Quantity">Quantity</option>
                    <option value="Barcode">Barcode</option>
                    <option value="Table Select">Table Select</option>
                  </select>
                </F>

                <F label="KOT" style={{ marginBottom: 0 }}>
                  <select
                    value={fields.kot || 'Print & Save'}
                    onChange={e => setFields(p => ({ ...p, kot: e.target.value }))}
                    className="form-select"
                    style={{ fontSize: '0.9rem', padding: '4px 6px', height: '34px' }}
                  >
                    <option value="Print & Save">Print & Save</option>
                    <option value="Save Only">Save Only</option>
                    <option value="Disabled">Disabled</option>
                  </select>
                </F>

                <F label="KOT Print" style={{ marginBottom: 0 }}>
                  <select
                    value={fields.kotPrint || 'Immediate'}
                    onChange={e => setFields(p => ({ ...p, kotPrint: e.target.value }))}
                    className="form-select"
                    style={{ fontSize: '0.9rem', padding: '4px 6px', height: '34px' }}
                  >
                    <option value="Immediate">Immediate</option>
                    <option value="On Demand">On Demand</option>
                    <option value="Disabled">Disabled</option>
                  </select>
                </F>

                <F label="Room Service" style={{ marginBottom: 0 }}>
                  <select
                    value={fields.roomService || 'Disabled'}
                    onChange={e => setFields(p => ({ ...p, roomService: e.target.value }))}
                    className="form-select"
                    style={{ fontSize: '0.9rem', padding: '4px 6px', height: '34px' }}
                  >
                    <option value="Disabled">Disabled</option>
                    <option value="Enabled">Enabled</option>
                  </select>
                </F>

                <F label="No of KOT" type="number" value={fields.noOfKOT} onChange={e => setFields(p => ({ ...p, noOfKOT: e.target.value }))} style={{ marginBottom: 0 }} inputStyle={{ height: '34px' }} />
                <F label="No of Bills" type="number" value={fields.noOfBills} onChange={e => setFields(p => ({ ...p, noOfBills: e.target.value }))} style={{ marginBottom: 0 }} inputStyle={{ height: '34px' }} />
              </div>
            </div>

            <div style={cardStyle}>
              {sectionTitle(<FaPrint />, 'Bill Print Settings')}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 8px' }}>
                <F label="Bill Header 1" value={fields.billHeader1} onChange={e => setFields(p => ({ ...p, billHeader1: e.target.value }))} style={{ marginBottom: 0 }} inputStyle={{ height: '34px' }} />
                <F label="Bill Slogan 1" value={fields.billSlogan1} onChange={e => setFields(p => ({ ...p, billSlogan1: e.target.value }))} style={{ marginBottom: 0 }} inputStyle={{ height: '34px' }} />
                
                <F label="Bill Header 2" value={fields.billHeader2} onChange={e => setFields(p => ({ ...p, billHeader2: e.target.value }))} style={{ marginBottom: 0 }} inputStyle={{ height: '34px' }} />
                <F label="Bill Slogan 2" value={fields.billSlogan2} onChange={e => setFields(p => ({ ...p, billSlogan2: e.target.value }))} style={{ marginBottom: 0 }} inputStyle={{ height: '34px' }} />
                
                <F label="Bill Header 3" value={fields.billHeader3} onChange={e => setFields(p => ({ ...p, billHeader3: e.target.value }))} style={{ marginBottom: 0 }} inputStyle={{ height: '34px' }} />
                <F label="Bill Slogan 3" value={fields.billSlogan3} onChange={e => setFields(p => ({ ...p, billSlogan3: e.target.value }))} style={{ marginBottom: 0 }} inputStyle={{ height: '34px' }} />
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
