import React, { useCallback } from 'react';
import { LuUpload } from 'react-icons/lu';
import FormCard from '../../../../../components/common/FormCard';
import PageHeader from '../../../../../components/common/PageHeader';

const ItemEnterPage = ({ showToast }) => {
  const toastTrigger = useCallback((msg) => {
    if (showToast) showToast(msg);
    else if (window.showToast) window.showToast(msg);
  }, [showToast]);

  return (
    <div className="w-full flex flex-col p-6 animate-in fade-in duration-200">
      <PageHeader
        title="Item Enter"
        breadcrumbs={['Dashboard', 'Point Of Sale', 'Master', 'Item Menu', 'Item Enter']}
        style={{ marginBottom: '8px', paddingBottom: '2px' }}
      />
      <div className="w-full max-w-2xl bg-white border border-gray-100 p-6 md:p-8 rounded-2xl shadow-sm mt-4">
        <FormCard>
          <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '24px' }}>
            Upload a CSV spreadsheet containing menu items. Columns should include: <strong>Name, Code, Group, Price, Status</strong>.
          </p>
          <div style={{ border: '2px dashed #ddd', padding: '40px 20px', textAlign: 'center', borderRadius: '8px', cursor: 'pointer', background: '#fafafa', marginBottom: '20px' }}>
            <LuUpload style={{ fontSize: '2.5rem', color: '#0f5a60', marginBottom: '12px' }} />
            <p style={{ fontWeight: '500', color: '#333' }}>Drag & drop your CSV file here or click to browse</p>
            <span style={{ fontSize: '0.8rem', color: '#999' }}>Accepts .csv files up to 10MB</span>
            <input type="file" accept=".csv" style={{ display: 'none' }} id="file-uploader-raw" />
          </div>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button className="btn-secondary" style={{ padding: '8px 16px', borderRadius: '6px' }}>Download Template</button>
            <button className="btn-primary" onClick={() => toastTrigger('CSV file selected! (Simulated upload successfully)')} style={{ padding: '8px 16px', borderRadius: '6px' }}>Upload File</button>
          </div>
        </FormCard>
      </div>
    </div>
  );
};

export default ItemEnterPage;
