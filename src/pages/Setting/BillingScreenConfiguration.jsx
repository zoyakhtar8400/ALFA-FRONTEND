import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSlidersH, FaShoppingBag, FaBox, FaPercentage, FaTag, FaKeyboard, FaHandPointer } from 'react-icons/fa';
import PageHeader from '../../components/common/PageHeader';
import CommonActionButtons from '../../components/common/CommonActionButtons';
import F from '../../components/common/F';

import posApi from '../../api/posApi';

const DEFAULT_CONFIG = {
  defaultOrderType: 'Dine In',
  defaultPaymentType: 'Cash',
  defaultTableNo: '',
  displayDeliveryCharge: true,
  defaultDeliveryCharge: '0',
  displayContainerCharge: true,
  containerAutoDelivery: true,
  containerAutoPickup: true,
  containerAutoDineIn: false,
  containerChargeMode: 'Item wise',
  containerChargeLabel: 'Container Charge',
  displayServiceCharge: false,
  taxBeforeDiscount: false,
  backwardTaxAfterDiscount: false,
  discountCalculationOn: 'Total',
  discountLabel: 'Coupon Code',
  discountButtonText: 'Apply'
};

const BillingScreenConfiguration = ({ showToast = () => {} }) => {
  const navigate = useNavigate();
  const [config, setConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('alfa_billing_screen_config');
      return saved ? { ...DEFAULT_CONFIG, ...JSON.parse(saved) } : DEFAULT_CONFIG;
    } catch {
      return DEFAULT_CONFIG;
    }
  });

  useEffect(() => {
    const storeId = localStorage.getItem('activeOutletId') || '1';
    posApi.getOutlets().then(res => {
      const outlets = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
      const current = outlets.find(o => String(o.id) === String(storeId) || o.store_id === storeId) || outlets[0];
      if (current?.settings?.billingScreenConfig) {
        setConfig(prev => ({ ...prev, ...current.settings.billingScreenConfig }));
      }
    }).catch(() => {});
  }, []);

  const setField = (key, val) => {
    setConfig(prev => ({ ...prev, [key]: val }));
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    try {
      localStorage.setItem('alfa_billing_screen_config', JSON.stringify(config));
      const storeId = localStorage.getItem('activeOutletId') || '1';
      await posApi.saveOutletConfig(storeId, { settings: { billingScreenConfig: config } });
      showToast('Billing Screen Configuration saved to PostgreSQL successfully!');
    } catch (err) {
      showToast('Billing Screen Configuration saved locally.');
    }
  };

  const sectionHeader = (icon, title) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0 8px', borderBottom: '2px solid var(--primary, #0e7490)', marginBottom: '14px' }}>
      <span style={{ fontSize: '1.05rem', display: 'flex', alignItems: 'center', color: 'var(--primary, #0e7490)' }}>{icon}</span>
      <span style={{ fontWeight: 800, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--primary, #0e7490)' }}>{title}</span>
    </div>
  );

  const cardStyle = {
    background: 'var(--card-bg, #fff)',
    border: '1px solid var(--border, #cbd5e1)',
    borderRadius: '10px',
    padding: '18px 22px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
  };

  const inputStyle = {
    fontSize: '0.92rem',
    height: '38px',
    padding: '6px 12px',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    width: '100%',
    outline: 'none'
  };

  return (
    <div className="animate-in duration-200" style={{ padding: '12px 18px', minHeight: '100vh', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* ALFA Standard PageHeader */}
      <PageHeader
        title="Billing Screen Configuration"
        breadcrumbs={['Dashboard', 'System Settings', 'Orders & Billing', 'Billing Screen Configuration']}
        showBack
        onBack={() => navigate('/setting')}
        style={{ marginBottom: '4px', paddingBottom: '2px' }}
      />

      <form onSubmit={handleSave} style={{ padding: '0 4px 4px', display: 'flex', flexDirection: 'column', gap: '14px', flex: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', alignItems: 'start' }}>

          {/* LEFT COLUMN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

            {/* Section 1: Order & Payment Defaults */}
            <div style={cardStyle}>
              {sectionHeader(<FaSlidersH />, 'Order & Payment Defaults')}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <F label="Sidebar Billing Mode">
                  <div style={{ display: 'flex', gap: '8px', marginTop: '2px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setField('billingMode', 'Touch Screen');
                        localStorage.setItem('alfa_billing_mode', 'Touch Screen');
                        localStorage.setItem('billing_mode', 'Touch Screen');
                        window.dispatchEvent(new CustomEvent('billingModeChanged', { detail: { mode: 'Touch Screen' } }));
                        showToast('Billing Mode set to Touch Screen (Shows Billing Desk)');
                      }}
                      style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: (config.billingMode || localStorage.getItem('alfa_billing_mode') || 'Touch Screen') === 'Touch Screen' ? '2px solid #0e7490' : '1px solid #cbd5e1',
                        backgroundColor: (config.billingMode || localStorage.getItem('alfa_billing_mode') || 'Touch Screen') === 'Touch Screen' ? '#e0f2fe' : '#ffffff',
                        color: (config.billingMode || localStorage.getItem('alfa_billing_mode') || 'Touch Screen') === 'Touch Screen' ? '#0369a1' : '#475569',
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        cursor: 'pointer'
                      }}
                    >
                      <FaHandPointer /> Touch Screen
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setField('billingMode', 'Keyboard');
                        localStorage.setItem('alfa_billing_mode', 'Keyboard');
                        localStorage.setItem('billing_mode', 'Keyboard');
                        window.dispatchEvent(new CustomEvent('billingModeChanged', { detail: { mode: 'Keyboard' } }));
                        showToast('Billing Mode set to Keyboard (Hides Billing Desk)');
                      }}
                      style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: (config.billingMode || localStorage.getItem('alfa_billing_mode')) === 'Keyboard' ? '2px solid #0e7490' : '1px solid #cbd5e1',
                        backgroundColor: (config.billingMode || localStorage.getItem('alfa_billing_mode')) === 'Keyboard' ? '#e0f2fe' : '#ffffff',
                        color: (config.billingMode || localStorage.getItem('alfa_billing_mode')) === 'Keyboard' ? '#0369a1' : '#475569',
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        cursor: 'pointer'
                      }}
                    >
                      <FaKeyboard /> Keyboard
                    </button>
                  </div>
                </F>

                <F label="Default Order Type">
                  <select
                    className="form-input"
                    value={config.defaultOrderType}
                    onChange={e => setField('defaultOrderType', e.target.value)}
                    style={inputStyle}
                  >
                    <option value="Dine In">Dine In</option>
                    <option value="Pick Up">Pick Up</option>
                    <option value="Delivery">Delivery</option>
                  </select>
                </F>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <F label="Default Payment">
                  <select
                    className="form-input"
                    value={config.defaultPaymentType}
                    onChange={e => setField('defaultPaymentType', e.target.value)}
                    style={inputStyle}
                  >
                    <option value="Cash">Cash</option>
                    <option value="Card">Card</option>
                    <option value="UPI">UPI</option>
                    <option value="Credit">Credit</option>
                  </select>
                </F>

                <F
                  label="Default Table No."
                  placeholder="e.g. 01"
                  value={config.defaultTableNo}
                  onChange={e => setField('defaultTableNo', e.target.value)}
                  inputStyle={inputStyle}
                />
              </div>
            </div>

            {/* Section 2: Delivery Settings */}
            <div style={cardStyle}>
              {sectionHeader(<FaShoppingBag />, 'Delivery Charge Settings')}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', fontWeight: 700, color: '#334155', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={config.displayDeliveryCharge}
                    onChange={e => setField('displayDeliveryCharge', e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: 'var(--primary, #0e7490)' }}
                  />
                  <span>Display & Calculate Delivery Charge</span>
                </label>

                <F
                  label="Default Delivery Charge (₹)"
                  required
                  type="number"
                  disabled={!config.displayDeliveryCharge}
                  value={config.defaultDeliveryCharge}
                  onChange={e => setField('defaultDeliveryCharge', e.target.value)}
                  inputStyle={inputStyle}
                />
              </div>
            </div>

            {/* Section 3: Discount Rules */}
            <div style={cardStyle}>
              {sectionHeader(<FaTag />, 'Discount Calculation Rules')}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '4px' }}>
                  <label style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155' }}>Special Discount On:</label>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', fontWeight: 700, color: '#334155', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="discountCalculationOn"
                        value="Total"
                        checked={config.discountCalculationOn === 'Total'}
                        onChange={e => setField('discountCalculationOn', e.target.value)}
                        style={{ width: '16px', height: '16px', accentColor: 'var(--primary, #0e7490)' }}
                      />
                      <span>Total</span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', fontWeight: 700, color: '#334155', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="discountCalculationOn"
                        value="Core"
                        checked={config.discountCalculationOn === 'Core'}
                        onChange={e => setField('discountCalculationOn', e.target.value)}
                        style={{ width: '16px', height: '16px', accentColor: 'var(--primary, #0e7490)' }}
                      />
                      <span>Core</span>
                    </label>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <F
                    label="Discount Label"
                    placeholder="Coupon Code"
                    value={config.discountLabel}
                    onChange={e => setField('discountLabel', e.target.value)}
                    inputStyle={inputStyle}
                  />

                  <F
                    label="Button Text"
                    required
                    placeholder="Apply"
                    value={config.discountButtonText}
                    onChange={e => setField('discountButtonText', e.target.value)}
                    inputStyle={inputStyle}
                  />
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

            {/* Section 4: Container & Packaging Charge */}
            <div style={cardStyle}>
              {sectionHeader(<FaBox />, 'Container & Packaging Charge')}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', fontWeight: 700, color: '#334155', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={config.displayContainerCharge}
                    onChange={e => setField('displayContainerCharge', e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: 'var(--primary, #0e7490)' }}
                  />
                  <span>Display & Calculate Container Charge</span>
                </label>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Calculate Automatically On:</label>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', color: '#334155', fontWeight: 600, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={config.containerAutoDelivery}
                        onChange={e => setField('containerAutoDelivery', e.target.checked)}
                        disabled={!config.displayContainerCharge}
                        style={{ width: '16px', height: '16px', accentColor: 'var(--primary, #0e7490)' }}
                      />
                      <span>Delivery</span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', color: '#334155', fontWeight: 600, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={config.containerAutoPickup}
                        onChange={e => setField('containerAutoPickup', e.target.checked)}
                        disabled={!config.displayContainerCharge}
                        style={{ width: '16px', height: '16px', accentColor: 'var(--primary, #0e7490)' }}
                      />
                      <span>Pick Up</span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', color: '#334155', fontWeight: 600, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={config.containerAutoDineIn}
                        onChange={e => setField('containerAutoDineIn', e.target.checked)}
                        disabled={!config.displayContainerCharge}
                        style={{ width: '16px', height: '16px', accentColor: 'var(--primary, #0e7490)' }}
                      />
                      <span>Dine In</span>
                    </label>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <F label="Charge Mode">
                    <select
                      className="form-input"
                      value={config.containerChargeMode}
                      onChange={e => setField('containerChargeMode', e.target.value)}
                      disabled={!config.displayContainerCharge}
                      style={{ ...inputStyle, background: '#fff', opacity: config.displayContainerCharge ? 1 : 0.5 }}
                    >
                      <option value="Item wise">Item wise</option>
                      <option value="Order wise">Order wise</option>
                      <option value="Fix per item">Fix per item</option>
                    </select>
                  </F>

                  <F
                    label="Charge Label"
                    required
                    disabled={!config.displayContainerCharge}
                    value={config.containerChargeLabel}
                    onChange={e => setField('containerChargeLabel', e.target.value)}
                    inputStyle={inputStyle}
                  />
                </div>
              </div>
            </div>

            {/* Section 5: Service Charge & Tax Config */}
            <div style={cardStyle}>
              {sectionHeader(<FaPercentage />, 'Service Charge & Tax Calculation')}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', fontWeight: 700, color: '#334155', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={config.displayServiceCharge}
                    onChange={e => setField('displayServiceCharge', e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: 'var(--primary, #0e7490)' }}
                  />
                  <span>Display & Calculate Service Charge</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', fontWeight: 700, color: '#334155', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={config.taxBeforeDiscount}
                    onChange={e => setField('taxBeforeDiscount', e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: 'var(--primary, #0e7490)' }}
                  />
                  <span>Calculate Tax Before Discount Calculation</span>
                </label>

                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', fontWeight: 700, color: '#334155', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={config.backwardTaxAfterDiscount}
                      onChange={e => setField('backwardTaxAfterDiscount', e.target.checked)}
                      style={{ width: '18px', height: '18px', accentColor: 'var(--primary, #0e7490)' }}
                    />
                    <span>Calculate Backward Tax after discount</span>
                  </label>
                  <p style={{ fontSize: '0.78rem', color: '#0284c7', margin: '4px 0 0 28px', fontStyle: 'italic' }}>
                    Note: Ignore this setting if you are using forward tax configuration for your outlet.
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* ALFA Standard CommonActionButtons Footer */}
        <CommonActionButtons
          onSave={handleSave}
          onCancel={() => navigate('/setting')}
          saveText="Save Configuration"
        />
      </form>
    </div>
  );
};

export default BillingScreenConfiguration;
