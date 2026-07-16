import React, { useState, useMemo } from 'react';
import PageHeader from '../../../../components/common/PageHeader';
import { FaRegFileAlt, FaTrash } from 'react-icons/fa';
import useDuplicateValidation from '../../../../hooks/useDuplicateValidation';

const OCCUPANT_DB = [
  { grcNo: '119', guestName: 'PRAMOD MISHRA', roomNo: '104', checkinDate: '2026-06-29', checkinTime: '07:05', city: 'Ahmedabad', companyName: 'SELF', companyGstin: '', paymentMode: 'CASH', noOfDayStay: 3, grossAmount: '1109.00', discount: '0.00', sgst: '27.73', cgst: '27.73', roundOff: '0.45', netAmount: '1165.00', roomSettlement: '0.00', netTotal: '1165.00', advanceSettlement: '0.00', balance: '1165.00' },
  { grcNo: '120', guestName: 'Sarah Wilson', roomNo: '201', checkinDate: '2026-06-26', checkinTime: '11:30', city: 'San Francisco', companyName: 'Direct', companyGstin: '', paymentMode: 'CARD', noOfDayStay: 3, grossAmount: '4500.00', discount: '0.00', sgst: '112.50', cgst: '112.50', roundOff: '0.00', netAmount: '4725.00', roomSettlement: '0.00', netTotal: '4725.00', advanceSettlement: '1000.00', balance: '3725.00' },
  { grcNo: '122', guestName: 'Robert Taylor', roomNo: '301', checkinDate: '2026-06-26', checkinTime: '14:00', city: 'London', companyName: 'Agent', companyGstin: '', paymentMode: 'UPI', noOfDayStay: 6, grossAmount: '9000.00', discount: '500.00', sgst: '212.50', cgst: '212.50', roundOff: '0.00', netAmount: '8925.00', roomSettlement: '1500.00', netTotal: '8925.00', advanceSettlement: '1500.00', balance: '5925.00' },
  { grcNo: '125', guestName: 'ANSH', roomNo: '114', checkinDate: '2026-07-01', checkinTime: '18:42', city: 'PRAYAGRAJ', companyName: 'SONY INDIA PVT. LTD', companyGstin: '09AAAAAAAAAAAAAAAA', paymentMode: 'CASH', noOfDayStay: 1, grossAmount: '1109.00', discount: '0.00', sgst: '27.73', cgst: '27.73', roundOff: '0.45', netAmount: '1165.00', roomSettlement: '0.00', netTotal: '1165.00', advanceSettlement: '0.00', balance: '1165.00' },
  { grcNo: '128', guestName: 'John Smith', roomNo: '101', checkinDate: '2026-06-28', checkinTime: '10:00', city: 'New York', companyName: 'Direct', companyGstin: '', paymentMode: 'CASH', noOfDayStay: 3, grossAmount: '3000.00', discount: '0.00', sgst: '75.00', cgst: '75.00', roundOff: '0.00', netAmount: '3150.00', roomSettlement: '0.00', netTotal: '3150.00', advanceSettlement: '0.00', balance: '3150.00' },
  { grcNo: '127', guestName: 'SURAJ', roomNo: '102', checkinDate: '02-07-2026', checkinTime: '15:21', city: 'DEORIA', companyName: 'SONY INDIA PVT. LTD', companyGstin: '09AAAAAAAAAAAAA', paymentMode: 'CASH', noOfDayStay: 1, grossAmount: '1000.00', discount: '0.00', sgst: '25.00', cgst: '25.00', roundOff: '0.00', netAmount: '1050.00', roomSettlement: '0.00', netTotal: '1050.00', advanceSettlement: '0.00', balance: '1050.00', checkoutDate: '03-07-2026', checkoutTime: '10:59' }
];

const CheckoutEntryForm = ({ mode, initialData, onSave, onCancel, existingRecords = [] }) => {
  const [form, setForm] = useState(() => {
    const qGrc = initialData?.grcNo || '';
    const qRoom = initialData?.roomNo || '';
    const found = OCCUPANT_DB.find(o => (qGrc && o.grcNo === qGrc) || (qRoom && o.roomNo === qRoom));

    return {
      grcNo: found?.grcNo || qGrc || '125',
      billNo: initialData?.billNo || '119',
      checkoutDate: found?.checkoutDate || initialData?.checkoutDate || '03-07-2026',
      checkoutTime: found?.checkoutTime || initialData?.checkoutTime || '10:59',
      guestName: found?.guestName || initialData?.guestName || 'ANSH',
      city: found?.city || initialData?.city || 'PRAYAGRAJ',
      companyName: found?.companyName || initialData?.companyName || 'SONY INDIA PVT. LTD',
      date: initialData?.date || '03-07-2026',
      noOfDayStay: found?.noOfDayStay || initialData?.noOfDayStay || 1,
      roomNo: found?.roomNo || qRoom || '114',
      checkinDate: found?.checkinDate || initialData?.checkinDate || '01-07-2026',
      checkinTime: found?.checkinTime || initialData?.checkinTime || '18:42',
      paymentMode: found?.paymentMode || initialData?.paymentMode || 'CASH',
      companyGstin: found?.companyGstin || initialData?.companyGstin || '09AAAAAAAAAAAAAAAA',
      grossAmount: found?.grossAmount || initialData?.grossAmount || '1109.00',
      discount: found?.discount || initialData?.discount || '0.00',
      sgst: found?.sgst || initialData?.sgst || '27.73',
      cgst: found?.cgst || initialData?.cgst || '27.73',
      roundOff: found?.roundOff || initialData?.roundOff || '0.45',
      netAmount: found?.netAmount || initialData?.netAmount || '1165.00',
      roomSettlement: found?.roomSettlement || initialData?.roomSettlement || '0.00',
      netTotal: found?.netTotal || initialData?.netTotal || '1165.00',
      advanceSettlement: found?.advanceSettlement || initialData?.advanceSettlement || '0.00',
      balance: found?.balance || initialData?.balance || '1165.00',
    };
  });

  const [billItems, setBillItems] = useState(() => {
    const qGrc = initialData?.grcNo || '';
    const qRoom = initialData?.roomNo || '';
    const found = OCCUPANT_DB.find(o => (qGrc && o.grcNo === qGrc) || (qRoom && o.roomNo === qRoom)) || OCCUPANT_DB[3];
    return [
      {
        id: '1',
        date: found.checkinDate,
        particular: found.grcNo === '127' ? 'Room Rent EP  STANDARD' : 'Room Rent CP STANDARD',
        roomNo: found.roomNo,
        baseAmt: found.grcNo === '127' ? '1000.0' : found.grossAmount,
        grossAmt: found.grcNo === '127' ? '1000' : found.grossAmount,
        discPer: '0.00',
        discount: '0.00',
        sgst: found.sgst,
        cgst: found.cgst,
        vat: '0',
        recAmt: '0'
      }
    ];
  });

  const { isDuplicate, DuplicateModal, checkBeforeSave } = useDuplicateValidation({
    existingRecords,
    currentFormData: form,
    uniqueFields: ['grcNo'],
    currentId: initialData?.id,
    mode
  });

  const liveTotals = useMemo(() => {
    let gross = 0;
    let disc = 0;
    let sgst = 0;
    let cgst = 0;
    let vat = 0;
    let rec = 0;

    billItems.forEach(item => {
      gross += parseFloat(item.grossAmt || 0);
      disc += parseFloat(item.discount || 0);
      sgst += parseFloat(item.sgst || 0);
      cgst += parseFloat(item.cgst || 0);
      vat += parseFloat(item.vat || 0);
      rec += parseFloat(item.recAmt || 0);
    });

    const calculatedNet = gross - disc + sgst + cgst + vat;
    const finalNet = Math.round(calculatedNet);
    const roundOff = (finalNet - calculatedNet).toFixed(2);

    const advance = parseFloat(form.advanceSettlement || 0) + parseFloat(form.roomSettlement || 0);
    const balance = finalNet - advance - rec;

    return {
      grossAmount: gross.toFixed(2),
      discount: disc.toFixed(2),
      sgst: sgst.toFixed(2),
      cgst: cgst.toFixed(2),
      roundOff: parseFloat(roundOff) === 0 ? '0.00' : roundOff,
      netAmount: finalNet.toFixed(2),
      balance: balance.toFixed(2)
    };
  }, [billItems, form.advanceSettlement, form.roomSettlement]);

  const handleCutRow = (itemId) => {
    setBillItems(prev => prev.filter(item => item.id !== itemId));
  };

  // Sync state when initialData changes (dynamic dashboard lookup)
  React.useEffect(() => {
    if (initialData) {
      const qGrc = initialData.grcNo || '';
      const qRoom = initialData.roomNo || initialData.roomCode || '';
      const found = OCCUPANT_DB.find(o => (qGrc && o.grcNo === qGrc) || (qRoom && o.roomNo === qRoom));

      setForm({
        grcNo: found?.grcNo || qGrc || '125',
        billNo: initialData.billNo || '119',
        checkoutDate: found?.checkoutDate || initialData.checkoutDate || '03-07-2026',
        checkoutTime: found?.checkoutTime || initialData.checkoutTime || '10:59',
        guestName: found?.guestName || initialData.guestName || 'ANSH',
        city: found?.city || initialData.city || 'PRAYAGRAJ',
        companyName: found?.companyName || initialData.companyName || 'SONY INDIA PVT. LTD',
        date: initialData.date || '03-07-2026',
        noOfDayStay: found?.noOfDayStay || initialData.noOfDayStay || 1,
        roomNo: found?.roomNo || qRoom || '114',
        checkinDate: found?.checkinDate || initialData.checkinDate || '01-07-2026',
        checkinTime: found?.checkinTime || initialData.checkinTime || '18:42',
        paymentMode: found?.paymentMode || initialData.paymentMode || 'CASH',
        companyGstin: found?.companyGstin || initialData.companyGstin || '09AAAAAAAAAAAAAAAA',
        grossAmount: found?.grossAmount || initialData.grossAmount || '1109.00',
        discount: found?.discount || initialData.discount || '0.00',
        sgst: found?.sgst || initialData.sgst || '27.73',
        cgst: found?.cgst || initialData.cgst || '27.73',
        roundOff: found?.roundOff || initialData.roundOff || '0.45',
        netAmount: found?.netAmount || initialData.netAmount || '1165.00',
        roomSettlement: found?.roomSettlement || initialData.roomSettlement || '0.00',
        netTotal: found?.netTotal || initialData.netTotal || '1165.00',
        advanceSettlement: found?.advanceSettlement || initialData.advanceSettlement || '0.00',
        balance: found?.balance || initialData.balance || '1165.00',
      });

      if (found) {
        setBillItems([
          {
            id: '1',
            date: found.checkinDate,
            particular: found.grcNo === '127' ? 'Room Rent EP  STANDARD' : 'Room Rent CP STANDARD',
            roomNo: found.roomNo,
            baseAmt: found.grcNo === '127' ? '1000.0' : found.grossAmount,
            grossAmt: found.grcNo === '127' ? '1000' : found.grossAmount,
            discPer: '0.00',
            discount: '0.00',
            sgst: found.sgst,
            cgst: found.cgst,
            vat: '0',
            recAmt: '0'
          }
        ]);
      }
    }
  }, [initialData]);

  const set = (key) => (e) => {
    const val = e.target.value;
    setForm((f) => {
      const updated = { ...f, [key]: val };
      if (key === 'grcNo' || key === 'roomNo') {
        const found = OCCUPANT_DB.find(o => (key === 'grcNo' ? o.grcNo === val : o.roomNo === val));
        if (found) {
          setBillItems([
            {
              id: '1',
              date: found.checkinDate,
              particular: found.grcNo === '127' ? 'Room Rent EP  STANDARD' : 'Room Rent CP STANDARD',
              roomNo: found.roomNo,
              baseAmt: found.grcNo === '127' ? '1000.0' : found.grossAmount,
              grossAmt: found.grcNo === '127' ? '1000' : found.grossAmount,
              discPer: '0.00',
              discount: '0.00',
              sgst: found.sgst,
              cgst: found.cgst,
              vat: '0',
              recAmt: '0'
            }
          ]);
          return {
            ...updated,
            grcNo: found.grcNo,
            roomNo: found.roomNo,
            guestName: found.guestName,
            city: found.city,
            companyName: found.companyName,
            companyGstin: found.companyGstin,
            paymentMode: found.paymentMode,
            noOfDayStay: found.noOfDayStay,
            checkinDate: found.checkinDate,
            checkinTime: found.checkinTime,
            grossAmount: found.grossAmount,
            discount: found.discount,
            sgst: found.sgst,
            cgst: found.cgst,
            roundOff: found.roundOff,
            netAmount: found.netAmount,
            roomSettlement: found.roomSettlement,
            netTotal: found.netTotal,
            advanceSettlement: found.advanceSettlement,
            balance: found.balance,
          };
        }
      }
      return updated;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!checkBeforeSave()) return;
    onSave({
      ...form,
      grossAmount: liveTotals.grossAmount,
      discount: liveTotals.discount,
      sgst: liveTotals.sgst,
      cgst: liveTotals.cgst,
      roundOff: liveTotals.roundOff,
      netAmount: liveTotals.netAmount,
      balance: liveTotals.balance
    });
  };

  return (
    <div className="animate-in duration-200" style={{ padding: '0 8px', width: '100%' }}>

      <PageHeader
        title={mode === 'displayFolio' ? 'Display Folio' : mode === 'add' ? 'Checkout Entry' : 'Edit Checkout'}
        breadcrumbs={['Dashboard', 'Front Desk', 'Operation', 'Checkout Entry', mode === 'displayFolio' ? 'Display Folio' : mode === 'add' ? 'Add' : 'Edit']}
        showBack
        onBack={onCancel}
        style={{ marginBottom: '12px' }}
      />

      <form onSubmit={handleSubmit} style={{ width: '100%' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 310px',
          gap: '16px',
          width: '100%',
          alignItems: 'start'
        }}>

          {/* LEFT & CENTER: Workspace Info panels & Folio Charge details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: 0 }}>

            {/* Split Grid: Guest Info (Left) and Stay Details (Middle) */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '20px',
              background: '#ffffff',
              border: '1px solid rgba(226,232,240,0.8)',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 2px 10px rgba(36,78,95,0.03)'
            }}>
              {/* Left Column: Guest info */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>GRC No</span>
                  {mode === 'displayFolio' ? (
                    <span style={{ fontSize: '0.85rem', fontWeight: 850, color: 'var(--primary)' }}>{form.grcNo}</span>
                  ) : (
                    <input
                      type="text"
                      value={form.grcNo}
                      onChange={set('grcNo')}
                      style={{
                        width: '60%',
                        border: '1px solid var(--border)',
                        borderRadius: '6px',
                        padding: '4px 10px',
                        fontSize: '0.82rem',
                        fontWeight: 800,
                        color: 'var(--primary)',
                        background: 'rgba(79, 70, 229, 0.04)',
                        borderColor: 'var(--primary)',
                        textAlign: 'right'
                      }}
                    />
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Bill No</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1e293b' }}>{form.billNo}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Check Out Date</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1e293b' }}>{form.checkoutDate}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Check Out Time</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1e293b' }}>{form.checkoutTime}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Guest Name</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1e293b' }}>{form.guestName}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>City</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1e293b' }}>{form.city}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Company Name</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1e293b' }}>{form.companyName}</span>
                </div>

              </div>

              {/* Middle Column: Stay details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Date</span>
                  {mode === 'displayFolio' ? (
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1e293b' }}>{form.date}</span>
                  ) : (
                    <input
                      type="text"
                      value={form.date}
                      onChange={set('date')}
                      style={{
                        width: '60%',
                        border: '1px solid var(--border)',
                        borderRadius: '6px',
                        padding: '4px 10px',
                        fontSize: '0.82rem',
                        color: '#1e293b',
                        textAlign: 'right'
                      }}
                    />
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>No of Day Stay</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1e293b' }}>{form.noOfDayStay}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Room No</span>
                  {mode === 'displayFolio' ? (
                    <span style={{ fontSize: '0.85rem', fontWeight: 850, color: '#0891b2' }}>{form.roomNo}</span>
                  ) : (
                    <input
                      type="text"
                      value={form.roomNo}
                      onChange={set('roomNo')}
                      style={{
                        width: '60%',
                        border: '1px solid var(--border)',
                        borderRadius: '6px',
                        padding: '4px 10px',
                        fontSize: '0.82rem',
                        fontWeight: 800,
                        color: '#0891b2',
                        background: 'rgba(6, 182, 212, 0.04)',
                        borderColor: '#0891b2',
                        textAlign: 'right'
                      }}
                    />
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>CheckIn Date</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1e293b' }}>{form.checkinDate}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Checkin Time</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1e293b' }}>{form.checkinTime}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Payment Mode</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1e293b' }}>{form.paymentMode}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Company GSTIN</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1e293b', fontFamily: 'monospace' }}>{form.companyGstin}</span>
                </div>

              </div>

            </div>

            {/* Bottom Section: Billing Ledger Items Table */}
            <div style={{
              background: '#ffffff',
              border: '1px solid rgba(226,232,240,0.8)',
              borderRadius: '12px',
              padding: '16px 20px',
              boxShadow: '0 2px 10px rgba(36,78,95,0.03)',
              overflowX: 'auto'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                <FaRegFileAlt size={12} color="var(--primary)" />
                <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--primary)' }}>Folio Charges</span>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                    <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 700, color: '#475569' }}>Date</th>
                    <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 700, color: '#475569' }}>Particular</th>
                    <th style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 700, color: '#475569' }}>Room No</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700, color: '#475569' }}>Base Amt</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700, color: '#475569' }}>Gross Amt</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700, color: '#475569' }}>Disc.Per</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700, color: '#475569' }}>Discount</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700, color: '#475569' }}>SGST</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700, color: '#475569' }}>CGST</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700, color: '#475569' }}>VAT</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700, color: '#475569' }}>Rec Amt</th>
                    {mode !== 'displayFolio' && <th style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 700, color: '#475569' }}>Action</th>}
                  </tr>
                </thead>
                <tbody>
                  {billItems.map(item => (
                    <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 12px', color: '#334155', whiteSpace: 'nowrap' }}>{item.date}</td>
                      <td style={{ padding: '10px 12px', color: '#334155', fontWeight: 700 }}>{item.particular}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'center', color: '#334155' }}>{item.roomNo}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: 'monospace', color: '#334155', fontWeight: 600 }}>{item.baseAmt}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: 'monospace', color: '#334155', fontWeight: 600 }}>{item.grossAmt}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', color: '#334155' }}>{item.discPer}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: 'monospace', color: '#334155' }}>{item.discount}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: 'monospace', color: '#334155' }}>{item.sgst}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: 'monospace', color: '#334155' }}>{item.cgst}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: 'monospace', color: '#334155' }}>{item.vat}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: 'monospace', color: '#334155' }}>{item.recAmt}</td>
                      {mode !== 'displayFolio' && (
                        <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => handleCutRow(item.id)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#ef4444',
                              cursor: 'pointer',
                              padding: '4px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderRadius: '4px',
                              transition: 'background 0.15s'
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            title="Cut / Delete Row"
                          >
                            <FaTrash size={12} />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                  {billItems.length === 0 && (
                    <tr>
                      <td colSpan="12" style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontStyle: 'italic' }}>
                        No bill items found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Save / Cancel Button Row */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
              {mode !== 'displayFolio' && (
                <button
                  type="submit"
                  style={{
                    background: '#0D9488',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '10px 24px',
                    fontSize: '0.85rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 4px 10px rgba(13, 148, 136, 0.25)',
                    transition: 'opacity 0.15s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >
                  Save
                </button>
              )}
              <button
                type="button"
                onClick={onCancel}
                style={{
                  background: '#0D9488',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '10px 24px',
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 4px 10px rgba(13, 148, 136, 0.25)',
                  transition: 'opacity 0.15s'
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                {mode === 'displayFolio' ? 'Close' : 'Cancel'}
              </button>
            </div>

          </div>

          {/* RIGHT PANEL: Stacked Tables (Receipts, POS Outlets, Tax summary, Settlement totals) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

            {/* Table 1: Receipts table (Red Header) */}
            <div style={{
              background: '#ffffff',
              border: '1px solid rgba(226,232,240,0.8)',
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(36,78,95,0.02)'
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                <thead>
                  <tr style={{ background: '#BE123C', color: '#ffffff' }}>
                    <th style={{ padding: '6px 8px', textAlign: 'left', fontWeight: 800, textTransform: 'uppercase' }}>Rec. No</th>
                    <th style={{ padding: '6px 8px', textAlign: 'left', fontWeight: 800, textTransform: 'uppercase' }}>Date</th>
                    <th style={{ padding: '6px 8px', textAlign: 'left', fontWeight: 800, textTransform: 'uppercase' }}>PayType</th>
                    <th style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 800, textTransform: 'uppercase' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan="4" style={{ padding: '10px', textAlign: 'center', color: '#94a3b8', fontStyle: 'italic' }}>No receipts posted</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Table 2: POS Outlet summary (Red Header) */}
            <div style={{
              background: '#ffffff',
              border: '1px solid rgba(226,232,240,0.8)',
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(36,78,95,0.02)'
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                <thead>
                  <tr style={{ background: '#BE123C', color: '#ffffff' }}>
                    <th style={{ padding: '6px 8px', textAlign: 'left', fontWeight: 800, textTransform: 'uppercase' }}>Outlet</th>
                    <th style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 800, textTransform: 'uppercase' }}>Total Amt</th>
                    <th style={{ padding: '6px 8px', textAlign: 'center', fontWeight: 800, textTransform: 'uppercase' }}>Count</th>
                    <th style={{ padding: '6px 8px', textAlign: 'center', fontWeight: 800, textTransform: 'uppercase' }}>Print</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan="4" style={{ padding: '10px', textAlign: 'center', color: '#94a3b8', fontStyle: 'italic' }}>No POS charges</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Table 3: Summary Heads (Orange Header) */}
            <div style={{
              background: '#ffffff',
              border: '1px solid rgba(226,232,240,0.8)',
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(36,78,95,0.02)'
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                <thead>
                  <tr style={{ background: '#E05600', color: '#ffffff' }}>
                    <th style={{ padding: '6px 10px', textAlign: 'left', fontWeight: 800, textTransform: 'uppercase' }}>Heads</th>
                    <th style={{ padding: '6px 10px', textAlign: 'center', fontWeight: 800, textTransform: 'uppercase' }}>%</th>
                    <th style={{ padding: '6px 10px', textAlign: 'right', fontWeight: 800, textTransform: 'uppercase' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '6px 10px', color: '#334155', fontWeight: 700 }}>GROSS AMOUNT</td>
                    <td style={{ padding: '6px 10px', textAlign: 'center', color: '#64748b' }}></td>
                    <td style={{ padding: '6px 10px', textAlign: 'right', fontFamily: 'monospace', color: '#334155', fontWeight: 700 }}>{liveTotals.grossAmount}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '6px 10px', color: '#334155' }}>DISCOUNT</td>
                    <td style={{ padding: '6px 10px', textAlign: 'center', color: '#64748b' }}>0</td>
                    <td style={{ padding: '6px 10px', textAlign: 'right', fontFamily: 'monospace', color: '#334155' }}>{liveTotals.discount}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '6px 10px', color: '#334155' }}>SGST</td>
                    <td style={{ padding: '6px 10px', textAlign: 'center', color: '#64748b' }}></td>
                    <td style={{ padding: '6px 10px', textAlign: 'right', fontFamily: 'monospace', color: '#334155' }}>{liveTotals.sgst}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '6px 10px', color: '#334155' }}>CGST</td>
                    <td style={{ padding: '6px 10px', textAlign: 'center', color: '#64748b' }}></td>
                    <td style={{ padding: '6px 10px', textAlign: 'right', fontFamily: 'monospace', color: '#334155' }}>{liveTotals.cgst}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '6px 10px', color: '#334155' }}>ROUND OFF</td>
                    <td style={{ padding: '6px 10px', textAlign: 'center', color: '#64748b' }}></td>
                    <td style={{ padding: '6px 10px', textAlign: 'right', fontFamily: 'monospace', color: '#334155' }}>{liveTotals.roundOff}</td>
                  </tr>
                  <tr style={{ background: '#fff7ed' }}>
                    <td style={{ padding: '6px 10px', color: '#c2410c', fontWeight: 800 }}>NET AMOUNT</td>
                    <td style={{ padding: '6px 10px', textAlign: 'center', color: '#c2410c' }}></td>
                    <td style={{ padding: '6px 10px', textAlign: 'right', fontFamily: 'monospace', color: '#c2410c', fontWeight: 800 }}>{liveTotals.netAmount}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Table 4: Settlement totals (Teal Header) */}
            <div style={{
              background: '#ffffff',
              border: '1px solid rgba(226,232,240,0.8)',
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(36,78,95,0.02)'
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                <tbody>
                  <tr style={{ background: '#0F9690', color: '#ffffff' }}>
                    <td style={{ padding: '6px 10px', fontWeight: 800 }}>OTHER REF INVOICES:</td>
                    <td style={{ padding: '6px 10px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 800 }}>0</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '6px 10px', color: '#0f766e', fontWeight: 700 }}>ROOM SETTLEMENT</td>
                    <td style={{ padding: '6px 10px', textAlign: 'right', fontFamily: 'monospace', color: '#0f766e', fontWeight: 700 }}>{form.roomSettlement}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f1f5f9', background: '#f0fdfa' }}>
                    <td style={{ padding: '6px 10px', color: '#0f766e', fontWeight: 800 }}>NET TOTAL</td>
                    <td style={{ padding: '6px 10px', textAlign: 'right', fontFamily: 'monospace', color: '#0f766e', fontWeight: 800 }}>{liveTotals.netAmount}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '6px 10px', color: '#0f766e' }}>ADVANCE + SETTLEMENT</td>
                    <td style={{ padding: '6px 10px', textAlign: 'right', fontFamily: 'monospace', color: '#0f766e' }}>{form.advanceSettlement}</td>
                  </tr>
                  <tr style={{ background: '#e6fffa' }}>
                    <td style={{ padding: '6px 10px', color: '#0d9488', fontWeight: 900 }}>BALANCE</td>
                    <td style={{ padding: '6px 10px', textAlign: 'right', fontFamily: 'monospace', color: '#0d9488', fontWeight: 900 }}>{liveTotals.balance}</td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>

        </div>
        <DuplicateModal />
      </form>
    </div>
  );
};

export default CheckoutEntryForm;
