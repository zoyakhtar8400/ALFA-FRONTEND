import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { FaTimes, FaUserAlt, FaPhone, FaMapMarkerAlt, FaBuilding } from 'react-icons/fa';
import { customerService } from '../../../../services/customerService';

const DEFAULT_COMPANIES = [
  {
    id: 1,
    companyName: 'Tata Consultancy Services (TCS)',
    contactPerson: 'Rahul Sharma',
    phone: '9820112233',
    email: 'corporate.tcs@tcs.com',
    address: 'Gateway Park, Akruli Road, Kandivali East',
    locality: 'Kandivali East',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400101',
    status: 'Active',
    remark: 'Corporate billing account - 15 days credit'
  },
  {
    id: 2,
    companyName: 'Infosys Limited',
    contactPerson: 'Priya Nair',
    phone: '9845012345',
    email: 'admin.mumbai@infosys.com',
    address: 'Mindspace IT Park, Link Road, Malad West',
    locality: 'Malad West',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400064',
    status: 'Active',
    remark: 'Monthly invoice settlement'
  },
  {
    id: 3,
    companyName: 'Reliance Industries Limited',
    contactPerson: 'Amit Patel',
    phone: '9930987654',
    email: 'procurement@ril.com',
    address: 'Maker Chambers IV, Nariman Point',
    locality: 'Nariman Point',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400021',
    status: 'Active',
    remark: 'VIP guest bookings & official team lunch'
  },
  {
    id: 4,
    companyName: 'HDFC Bank Corporate Office',
    contactPerson: 'Sneha Kulkarni',
    phone: '9819054321',
    email: 'admin.support@hdfcbank.com',
    address: 'HDFC Bank House, Senapati Bapat Marg, Lower Parel',
    locality: 'Lower Parel',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400013',
    status: 'Active',
    remark: 'Pre-approved corporate orders only'
  },
  {
    id: 5,
    companyName: 'Larsen & Toubro (L&T)',
    contactPerson: 'Vikram Desai',
    phone: '9769011223',
    email: 'facilities@larsentoubro.com',
    address: 'L&T House, Ballard Estate',
    locality: 'Fort',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001',
    status: 'Active',
    remark: 'Official lunch & dinner delivery'
  },
  {
    id: 6,
    companyName: 'Mahindra & Mahindra Ltd.',
    contactPerson: 'Anjali Deshmukh',
    phone: '9892098765',
    email: 'corporate.services@mahindra.com',
    address: 'Gateway Building, Apollo Bunder',
    locality: 'Colaba',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001',
    status: 'Active',
    remark: 'Executive boardroom catering orders'
  },
  {
    id: 7,
    companyName: 'State Bank of India (Bhavan)',
    contactPerson: 'Rameshwar Joshi',
    phone: '9422019876',
    email: 'admin.cc@sbi.co.in',
    address: 'State Bank Bhavan, Madame Cama Road',
    locality: 'Nariman Point',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400021',
    status: 'Active',
    remark: 'Special discount 10% on corporate dining'
  },
  {
    id: 8,
    companyName: 'Aditya Birla Group',
    contactPerson: 'Kavita Menon',
    phone: '9821145678',
    email: 'corp.hospitality@adityabirla.com',
    address: 'Aditya Birla Centre, S.K. Ahire Marg, Worli',
    locality: 'Worli',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400030',
    status: 'Active',
    remark: 'Senior management catering'
  },
  {
    id: 9,
    companyName: 'Godrej Industries Ltd.',
    contactPerson: 'Sanjay Varma',
    phone: '9833087654',
    email: 'admin@godrej.com',
    address: 'Pirojshanagar, Eastern Express Highway, Vikhroli East',
    locality: 'Vikhroli East',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400079',
    status: 'Active',
    remark: 'Corporate cafeteria & guest catering bills'
  }
];

const loadCompanyMasters = () => {
  try {
    const stored = localStorage.getItem('alfa_company_masters');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to load alfa_company_masters from localStorage:', e);
  }
  return DEFAULT_COMPANIES;
};

const CustomerDrawer = ({ isOpen, onClose, currentCustomer, onSaveCustomer }) => {
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [locality, setLocality] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [companies, setCompanies] = useState([]);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef(null);

  // Hydrate form on open and load companies
  useEffect(() => {
    if (isOpen) {
      setPhone(currentCustomer?.phone || '');
      setName(currentCustomer?.name || '');
      setAddress(currentCustomer?.address || '');
      setLocality(currentCustomer?.locality || '');
      setSelectedCompany(currentCustomer?.company || '');
      setCompanies(loadCompanyMasters());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Handle phone changes — debounced live lookup from backend
  const handlePhoneChange = (e) => {
    const val = e.target.value;
    setPhone(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (val.length === 10) {
      debounceRef.current = setTimeout(async () => {
        try {
          setSearching(true);
          const res = await customerService.getCustomers(val);
          const customers = res?.customers || res?.data || [];
          const match = Array.isArray(customers) && customers.find(
            c => String(c.phone) === val || String(c.mobile) === val
          );
          if (match) {
            setName(match.name || '');
            setAddress(match.address || '');
            setLocality(match.locality || match.area || '');
            if (match.company) setSelectedCompany(match.company);
          }
        } catch (err) {
          // silently ignore lookup errors
        } finally {
          setSearching(false);
        }
      }, 300);
    }
  };

  const handleCompanyChange = (e) => {
    const compName = e.target.value;
    setSelectedCompany(compName);
    if (!compName) return;

    const found = companies.find(c => (c.companyName || c.name) === compName);
    if (found) {
      if (found.companyName || found.name) {
        setName(found.contactPerson ? `${found.contactPerson} (${found.companyName || found.name})` : (found.companyName || found.name));
      }
      if (found.phone || found.mobile || found.phoneNo) {
        setPhone(found.phone || found.mobile || found.phoneNo || '');
      }
      if (found.address) {
        setAddress(found.address);
      }
      if (found.city || found.locality || found.state) {
        const locParts = [found.city || found.locality, found.state].filter(Boolean);
        setLocality(locParts.join(', '));
      }
    }
  };

  const handleConfirm = async (e) => {
    e.preventDefault();
    if (!phone) return;
    const custData = {
      phone,
      name: name || 'Walk-in',
      address,
      locality,
      company: selectedCompany
    };
    try {
      await customerService.createCustomer(custData);
    } catch (err) {
      // persist failure is non-blocking
    }
    onSaveCustomer(custData);
    onClose();
  };

  if (!isOpen) return null;

  const modalNode = (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(3px)',
      WebkitBackdropFilter: 'blur(3px)',
      zIndex: 999999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'var(--font-family, system-ui)'
    }}>
      <div style={{
        background: '#fff',
        width: '420px',
        maxWidth: '92vw',
        borderRadius: '12px',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        border: '1px solid #e2e8f0',
        animation: 'fadeIn 0.15s ease-out'
      }}>
        {/* Modal Header */}
        <div style={{
          background: '#0e7490',
          color: '#fff',
          padding: '14px 18px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, letterSpacing: '0.2px' }}>
            Customer Information
          </h3>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              padding: '4px'
            }}
          >
            <FaTimes />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleConfirm} style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Company Master Selector */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '0.68rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FaBuilding style={{ color: '#0e7490' }} /> Company Master (Optional)
            </label>
            <select
              value={selectedCompany}
              onChange={handleCompanyChange}
              style={{
                width: '100%',
                padding: '8px 10px',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: selectedCompany ? '#0f172a' : '#64748b',
                background: '#f8fafc',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="">— Select Company (Optional) —</option>
              {companies.map((c) => {
                const cName = c.companyName || c.name;
                return (
                  <option key={c.id || cName} value={cName}>
                    {cName} {c.contactPerson ? `(${c.contactPerson})` : ''}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Phone Field */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '0.68rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>Phone Number *</label>
            <div style={{ position: 'relative' }}>
              <FaPhone style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '0.8rem' }} />
              <input
                type="text"
                autoFocus
                required
                maxLength="10"
                value={phone}
                onChange={handlePhoneChange}
                placeholder="Enter 10-digit mobile..."
                style={{ width: '100%', padding: '8px 10px 8px 30px', border: '1px solid #cbd5e1', borderRadius: '6px', fontWeight: 700, fontSize: '0.85rem', background: searching ? '#f0f9ff' : '#fff', outline: 'none' }}
              />
            </div>
          </div>

          {/* Name Field */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '0.68rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>Customer Name</label>
            <div style={{ position: 'relative' }}>
              <FaUserAlt style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '0.8rem' }} />
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Guest full name..."
                style={{ width: '100%', padding: '8px 10px 8px 30px', border: '1px solid #cbd5e1', borderRadius: '6px', fontWeight: 600, fontSize: '0.85rem', outline: 'none' }}
              />
            </div>
          </div>

          {/* Address Field */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '0.68rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>Address</label>
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="Delivery address details..."
              style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem', outline: 'none' }}
            />
          </div>

          {/* Locality Field */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '0.68rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>Locality</label>
            <div style={{ position: 'relative' }}>
              <FaMapMarkerAlt style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '0.8rem' }} />
              <input
                type="text"
                value={locality}
                onChange={e => setLocality(e.target.value)}
                placeholder="Locality area..."
                style={{ width: '100%', padding: '8px 10px 8px 30px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem', outline: 'none' }}
              />
            </div>
          </div>

          {/* Submit Action */}
          <div style={{ display: 'flex', gap: '10px', paddingTop: '12px', borderTop: '1px solid #e2e8f0', marginTop: '4px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{ flex: 1, padding: '9px 0', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#475569', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{ flex: 1.5, padding: '9px 0', borderRadius: '6px', border: 'none', background: '#0e7490', color: '#ffffff', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer' }}
            >
              Save Customer
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalNode, document.body) : modalNode;
};

export default React.memo(CustomerDrawer);
