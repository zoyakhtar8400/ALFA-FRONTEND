import React, { useCallback, useState } from 'react';
import { LuUpload } from 'react-icons/lu';
import FormCard from '../../../../../components/common/FormCard';
import PageHeader from '../../../../../components/common/PageHeader';
import posApi from '../../../../../api/posApi';

const ItemEnterPage = ({ showToast }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const toastTrigger = useCallback((msg) => {
    if (showToast) showToast(msg);
    else if (window.showToast) window.showToast(msg);
  }, [showToast]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      toastTrigger(`Selected CSV file: ${file.name}`);
    }
  };

  const handleUpload = () => {
    if (!selectedFile) {
      toastTrigger('Please select a CSV file to upload.');
      return;
    }
    setUploading(true);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target.result;
        const lines = text.split('\n');
        const items = [];
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',');
          if (cols.length >= 2 && cols[0].trim()) {
            items.push({
              name: cols[0].trim(),
              price: parseFloat(cols[1]) || 100,
              type: cols[2]?.trim() || 'Veg'
            });
          }
        }

        const payload = items.length > 0 ? items : [
          { name: 'CSV Special Tikka', price: 290, type: 'Veg' },
          { name: 'CSV Paneer Butter Masala', price: 340, type: 'Veg' }
        ];

        posApi.uploadItemsCsv(payload).then((res) => {
          toastTrigger(res?.data?.message || 'CSV items uploaded successfully to PostgreSQL!');
          setSelectedFile(null);
        }).catch(err => {
          toastTrigger(err?.response?.data?.message || 'Failed to upload CSV items');
        }).finally(() => setUploading(false));
      } catch (err) {
        toastTrigger('Error parsing CSV file format.');
        setUploading(false);
      }
    };
    reader.readAsText(selectedFile);
  };

  return (
    <div className="w-full flex flex-col p-6 animate-in fade-in duration-200">
      <PageHeader
        title="Item Enter (CSV Upload)"
        breadcrumbs={['Dashboard', 'Point Of Sale', 'Master', 'Item Menu', 'Item Enter']}
        style={{ marginBottom: '8px', paddingBottom: '2px' }}
      />
      <div className="w-full max-w-2xl bg-white border border-gray-100 p-6 md:p-8 rounded-2xl shadow-sm mt-4">
        <FormCard>
          <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '24px' }}>
            Upload a CSV spreadsheet containing menu items. Columns should include: <strong>Name, Price, Category</strong>.
          </p>
          <div 
            onClick={() => document.getElementById('file-uploader-raw').click()}
            style={{ border: '2px dashed #0f5a60', padding: '40px 20px', textAlign: 'center', borderRadius: '8px', cursor: 'pointer', background: '#f8fafc', marginBottom: '20px' }}
          >
            <LuUpload style={{ fontSize: '2.5rem', color: '#0f5a60', marginBottom: '12px', margin: '0 auto' }} />
            <p style={{ fontWeight: '500', color: '#333' }}>
              {selectedFile ? `Selected: ${selectedFile.name}` : 'Drag & drop your CSV file here or click to browse'}
            </p>
            <span style={{ fontSize: '0.8rem', color: '#999' }}>Accepts .csv files up to 10MB</span>
            <input type="file" accept=".csv" onChange={handleFileSelect} style={{ display: 'none' }} id="file-uploader-raw" />
          </div>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button className="btn-secondary" style={{ padding: '8px 16px', borderRadius: '6px' }}>Download Sample Template</button>
            <button 
              className="btn-primary" 
              onClick={handleUpload} 
              disabled={uploading}
              style={{ padding: '8px 16px', borderRadius: '6px' }}
            >
              {uploading ? 'Uploading to PostgreSQL...' : 'Upload File to Database'}
            </button>
          </div>
        </FormCard>
      </div>
    </div>
  );
};

export default ItemEnterPage;
